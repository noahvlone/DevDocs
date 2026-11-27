export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ParameterItem {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
}

export interface MockResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
}

export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  baseUrl: string;
  summary: string;
  headers: ParameterItem[];
  queryParams: ParameterItem[];
  pathParams: ParameterItem[];
  requestBodySchema?: string;
  mockResponse: MockResponse;
}

export interface ArticleMeta {
  id: string;
  title: string;
  slug: string;
  type: 'guide' | 'api';
  method?: HttpMethod;
  path?: string;
  order: number;
}

export interface Section {
  id: string;
  title: string;
  slug: string;
  order: number;
  articles: ArticleMeta[];
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  branch: string;
  commitSha: string;
  icon: string;
  badge: 'Public' | 'Internal' | 'Beta' | 'Deprecated';
  tags: string[];
  updatedAt: string;
  stars: number;
  forks: number;
  sections: Section[];
}

export interface Article {
  id: string;
  projectId: string;
  sectionId: string;
  title: string;
  slug: string;
  description: string;
  type: 'guide' | 'api';
  order: number;
  content: string;
  endpoint?: ApiEndpoint;
  updatedAt: string;
}

export interface SearchResultItem {
  projectId: string;
  projectName: string;
  projectSlug: string;
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  type: 'guide' | 'api';
  method?: HttpMethod;
  path?: string;
  sectionTitle: string;
  snippet: string;
}
