import YAML from 'yaml';
import type { Project, Section, Article, HttpMethod, ParameterItem, ApiEndpoint } from '../src/types/doc';

export interface ParseResult {
  project: Project;
  articles: Article[];
}

export function parseSpecContent(
  rawContent: string,
  filename: string = '',
  overrideBaseUrl?: string
): ParseResult {
  let parsed: any = null;

  // Attempt JSON parse first
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    // Attempt YAML parse
    try {
      parsed = YAML.parse(rawContent);
    } catch (err: any) {
      throw new Error(`Failed to parse file format. Must be valid JSON or YAML: ${err.message}`);
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Parsed specification content is empty or not a valid object.');
  }

  // Check if it is a Postman Collection
  if (parsed.info && (parsed.info._postman_id || parsed.info.schema?.includes('postman.com'))) {
    return parsePostmanCollection(parsed, overrideBaseUrl);
  }

  // Check if it is OpenAPI / Swagger
  if (parsed.openapi || parsed.swagger) {
    return parseOpenApiSpec(parsed, overrideBaseUrl);
  }

  // Fallback: Generic schema parser
  return parseGenericSpec(parsed, filename, overrideBaseUrl);
}

function parseOpenApiSpec(spec: any, overrideBaseUrl?: string): ParseResult {
  const title = spec.info?.title || 'Imported API Project';
  const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  const description = spec.info?.description || 'Imported from OpenAPI specification';
  const version = spec.info?.version || 'v1.0.0';

  let detectedBaseUrl = 'http://localhost:5000';
  if (overrideBaseUrl && overrideBaseUrl.trim()) {
    detectedBaseUrl = overrideBaseUrl.trim();
  } else if (spec.servers && spec.servers.length > 0 && spec.servers[0].url) {
    detectedBaseUrl = spec.servers[0].url;
  } else if (spec.host) {
    const scheme = spec.schemes ? spec.schemes[0] : 'http';
    detectedBaseUrl = `${scheme}://${spec.host}${spec.basePath || ''}`;
  }

  const projectId = `proj_${Date.now()}`;
  const sectionsMap = new Map<string, Section>();
  const articles: Article[] = [];

  const defaultSection: Section = {
    id: `sec_${projectId}_default`,
    title: 'General Endpoints',
    slug: 'general',
    order: 1,
    articles: [],
  };
  sectionsMap.set('General Endpoints', defaultSection);

  const paths = spec.paths || {};
  let articleOrder = 1;

  for (const [pathStr, pathItem] of Object.entries(paths) as [string, any][]) {
    const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    for (const m of methods) {
      const op = pathItem[m.toLowerCase()];
      if (!op) continue;

      const summary = op.summary || op.operationId || `${m} ${pathStr}`;
      const opDescription = op.description || summary;
      const tag = (op.tags && op.tags.length > 0) ? op.tags[0] : 'General Endpoints';

      if (!sectionsMap.has(tag)) {
        sectionsMap.set(tag, {
          id: `sec_${projectId}_${sectionsMap.size + 1}`,
          title: tag,
          slug: tag.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
          order: sectionsMap.size + 1,
          articles: [],
        });
      }
      const section = sectionsMap.get(tag)!;

      // Extract parameters
      const allParams = [...(pathItem.parameters || []), ...(op.parameters || [])];
      const headers: ParameterItem[] = [];
      const queryParams: ParameterItem[] = [];
      const pathParams: ParameterItem[] = [];

      for (const p of allParams) {
        const item: ParameterItem = {
          name: p.name,
          type: p.schema?.type || p.type || 'string',
          required: !!p.required,
          description: p.description || '',
          example: p.example || (p.schema?.example ? String(p.schema.example) : undefined),
        };

        if (p.in === 'header') headers.push(item);
        else if (p.in === 'query') queryParams.push(item);
        else if (p.in === 'path') pathParams.push(item);
      }

      // Request Body
      let requestBodySchema = '';
      if (op.requestBody) {
        const content = op.requestBody.content;
        const jsonContent = content?.['application/json'];
        if (jsonContent?.example) {
          requestBodySchema = JSON.stringify(jsonContent.example, null, 2);
        } else if (jsonContent?.schema) {
          requestBodySchema = JSON.stringify(generateSampleFromSchema(jsonContent.schema), null, 2);
        }
      }

      // Response Sample
      let mockBody: any = { status: 'success', message: `Live response from ${m} ${pathStr}` };
      const resp200 = op.responses?.['200'] || op.responses?.['201'] || op.responses?.default;
      if (resp200?.content?.['application/json']?.example) {
        mockBody = resp200.content['application/json'].example;
      }

      const articleId = `art_${Date.now()}_${articleOrder}`;
      const articleSlug = (op.operationId || `${m.toLowerCase()}-${pathStr.replace(/[^\w-]/g, '_')}`)
        .toLowerCase()
        .replace(/_+/g, '-');

      const endpoint: ApiEndpoint = {
        method: m,
        path: pathStr,
        baseUrl: detectedBaseUrl,
        summary,
        headers,
        queryParams,
        pathParams,
        requestBodySchema: requestBodySchema || undefined,
        mockResponse: {
          status: op.responses?.['201'] ? 201 : 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' },
          body: mockBody,
        },
      };

      const article: Article = {
        id: articleId,
        projectId,
        sectionId: section.id,
        title: summary,
        slug: articleSlug,
        description: opDescription,
        type: 'api',
        order: articleOrder++,
        content: `# ${summary}\n\n${opDescription}\n\n### Endpoint Route\n\`${m} ${pathStr}\`\n\n> [!NOTE]\n> Imported automatically from OpenAPI / Swagger specification.\n`,
        endpoint,
        updatedAt: new Date().toISOString(),
      };

      articles.push(article);
      section.articles.push({
        id: articleId,
        title: summary,
        slug: articleSlug,
        type: 'api',
        method: m,
        path: pathStr,
        order: articleOrder,
      });
    }
  }

  // Filter out empty sections
  const sections = Array.from(sectionsMap.values()).filter((s) => s.articles.length > 0);

  const project: Project = {
    id: projectId,
    name: title,
    slug,
    description,
    version,
    branch: 'main',
    commitSha: Math.random().toString(16).substring(2, 9),
    icon: 'Globe',
    badge: 'Public',
    tags: ['Imported', 'Live API', 'OpenAPI'],
    updatedAt: new Date().toISOString(),
    stars: 1,
    forks: 0,
    sections,
  };

  return { project, articles };
}

function parsePostmanCollection(col: any, overrideBaseUrl?: string): ParseResult {
  const title = col.info?.name || 'Imported Postman Collection';
  const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  const description = col.info?.description || 'Imported from Postman Collection v2';
  const projectId = `proj_${Date.now()}`;

  let detectedBaseUrl = overrideBaseUrl || 'http://localhost:5000';
  const sections: Section[] = [];
  const articles: Article[] = [];
  let articleOrder = 1;

  const processItems = (items: any[], folderName: string = 'General Endpoints') => {
    let section = sections.find((s) => s.title === folderName);
    if (!section) {
      section = {
        id: `sec_${projectId}_${sections.length + 1}`,
        title: folderName,
        slug: folderName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
        order: sections.length + 1,
        articles: [],
      };
      sections.push(section);
    }

    for (const item of items) {
      if (item.item && Array.isArray(item.item)) {
        // Nested folder
        processItems(item.item, item.name || 'Subfolder');
      } else if (item.request) {
        const req = item.request;
        const method = (req.method || 'GET').toUpperCase() as HttpMethod;
        let pathStr = '/';

        if (typeof req.url === 'string') {
          try {
            const u = new URL(req.url);
            pathStr = u.pathname;
            if (!overrideBaseUrl) detectedBaseUrl = u.origin;
          } catch {
            pathStr = req.url;
          }
        } else if (req.url && Array.isArray(req.url.path)) {
          pathStr = '/' + req.url.path.join('/');
          if (req.url.host && !overrideBaseUrl) {
            detectedBaseUrl = `http://${Array.isArray(req.url.host) ? req.url.host.join('.') : req.url.host}`;
          }
        }

        const headers: ParameterItem[] = (req.header || []).map((h: any) => ({
          name: h.key,
          type: 'string',
          required: false,
          description: h.description || '',
          example: h.value || '',
        }));

        const queryParams: ParameterItem[] = (req.url?.query || []).map((q: any) => ({
          name: q.key,
          type: 'string',
          required: false,
          description: q.description || '',
          example: q.value || '',
        }));

        let requestBodySchema = '';
        if (req.body?.raw) {
          requestBodySchema = req.body.raw;
        }

        const articleId = `art_${Date.now()}_${articleOrder}`;
        const articleSlug = (item.name || `${method.toLowerCase()}-${pathStr}`)
          .toLowerCase()
          .replace(/[^\w-]/g, '-')
          .replace(/-+/g, '-');

        const endpoint: ApiEndpoint = {
          method,
          path: pathStr,
          baseUrl: detectedBaseUrl,
          summary: item.name || `${method} ${pathStr}`,
          headers,
          queryParams,
          pathParams: [],
          requestBodySchema: requestBodySchema || undefined,
          mockResponse: {
            status: 200,
            statusText: 'OK',
            headers: { 'Content-Type': 'application/json' },
            body: { status: 'success', data: 'Postman live sample' },
          },
        };

        const article: Article = {
          id: articleId,
          projectId,
          sectionId: section.id,
          title: item.name || `${method} ${pathStr}`,
          slug: articleSlug,
          description: req.description || `Live endpoint for ${method} ${pathStr}`,
          type: 'api',
          order: articleOrder++,
          content: `# ${item.name || pathStr}\n\n${req.description || ''}\n\n\`${method} ${pathStr}\`\n\n> [!NOTE]\n> Imported from Postman Collection.\n`,
          endpoint,
          updatedAt: new Date().toISOString(),
        };

        articles.push(article);
        section.articles.push({
          id: articleId,
          title: article.title,
          slug: article.slug,
          type: 'api',
          method,
          path: pathStr,
          order: articleOrder,
        });
      }
    }
  };

  processItems(col.item || []);

  const project: Project = {
    id: projectId,
    name: title,
    slug,
    description,
    version: 'v1.0.0',
    branch: 'main',
    commitSha: Math.random().toString(16).substring(2, 9),
    icon: 'Layers',
    badge: 'Public',
    tags: ['Postman', 'Live API'],
    updatedAt: new Date().toISOString(),
    stars: 1,
    forks: 0,
    sections: sections.filter((s) => s.articles.length > 0),
  };

  return { project, articles };
}

function parseGenericSpec(obj: any, filename: string, overrideBaseUrl?: string): ParseResult {
  const title = obj.name || filename.replace(/\.[^/.]+$/, '') || 'Custom API Project';
  const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  const projectId = `proj_${Date.now()}`;
  const baseUrl = overrideBaseUrl || obj.baseUrl || 'http://localhost:5000';

  const defaultSection: Section = {
    id: `sec_${projectId}_1`,
    title: 'Custom Endpoints',
    slug: 'endpoints',
    order: 1,
    articles: [],
  };

  const articles: Article[] = [];
  const endpoints = Array.isArray(obj.endpoints) ? obj.endpoints : (Array.isArray(obj) ? obj : []);

  endpoints.forEach((ep: any, idx: number) => {
    const method = (ep.method || 'GET').toUpperCase() as HttpMethod;
    const path = ep.path || `/v1/item-${idx + 1}`;
    const articleId = `art_${Date.now()}_${idx + 1}`;
    const articleSlug = `endpoint-${idx + 1}`;

    const endpoint: ApiEndpoint = {
      method,
      path,
      baseUrl,
      summary: ep.summary || `${method} ${path}`,
      headers: ep.headers || [],
      queryParams: ep.queryParams || [],
      pathParams: ep.pathParams || [],
      requestBodySchema: ep.requestBody ? JSON.stringify(ep.requestBody, null, 2) : undefined,
      mockResponse: {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
        body: ep.response || { status: 'success' },
      },
    };

    const article: Article = {
      id: articleId,
      projectId,
      sectionId: defaultSection.id,
      title: endpoint.summary,
      slug: articleSlug,
      description: ep.description || `Test endpoint for ${path}`,
      type: 'api',
      order: idx + 1,
      content: `# ${endpoint.summary}\n\n\`${method} ${path}\`\n`,
      endpoint,
      updatedAt: new Date().toISOString(),
    };

    articles.push(article);
    defaultSection.articles.push({
      id: articleId,
      title: article.title,
      slug: articleSlug,
      type: 'api',
      method,
      path,
      order: idx + 1,
    });
  });

  const project: Project = {
    id: projectId,
    name: title,
    slug,
    description: obj.description || 'Imported custom endpoint collection',
    version: 'v1.0.0',
    branch: 'main',
    commitSha: Math.random().toString(16).substring(2, 9),
    icon: 'Code2',
    badge: 'Public',
    tags: ['Custom', 'Live API'],
    updatedAt: new Date().toISOString(),
    stars: 1,
    forks: 0,
    sections: [defaultSection],
  };

  return { project, articles };
}

function generateSampleFromSchema(schema: any): any {
  if (!schema) return {};
  if (schema.example) return schema.example;
  if (schema.type === 'object' && schema.properties) {
    const res: any = {};
    for (const [k, v] of Object.entries(schema.properties) as [string, any][]) {
      res[k] = generateSampleFromSchema(v);
    }
    return res;
  }
  if (schema.type === 'array') {
    return [generateSampleFromSchema(schema.items || {})];
  }
  if (schema.type === 'string') return schema.default || 'example_string';
  if (schema.type === 'number' || schema.type === 'integer') return schema.default || 100;
  if (schema.type === 'boolean') return schema.default ?? true;
  return 'example';
}
