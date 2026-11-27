import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import type { Project, Article, SearchResultItem } from '../src/types/doc';
import { initialProjects, initialArticles } from './seed-data.js';

type NeonClient = NeonQueryFunction<false, false>;

export class Database {
  private client: NeonClient | undefined;
  private initialization: Promise<void> | undefined;

  private getClient(): NeonClient {
    if (this.client) return this.client;

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured.');
    }

    this.client = neon<false, false>(connectionString);
    return this.client;
  }

  async initialize(): Promise<void> {
    if (!this.initialization) {
      this.initialization = this.initializeDatabase().catch((error: unknown) => {
        this.initialization = undefined;
        throw error;
      });
    }
    return this.initialization;
  }

  private async initializeDatabase(): Promise<void> {
    const sql = this.getClient();
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL,
        data JSONB NOT NULL,
        sort_order BIGINT NOT NULL
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        slug TEXT NOT NULL,
        data JSONB NOT NULL,
        sort_order BIGINT NOT NULL
      )
    `;
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS sort_order BIGINT NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS sort_order BIGINT NOT NULL DEFAULT 0`;
    await sql`CREATE INDEX IF NOT EXISTS articles_project_id_idx ON articles (project_id)`;

    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM projects`;
    if (count === 0) {
      await this.insertInitialData(sql);
    }
  }

  private async insertInitialData(sql: NeonClient): Promise<void> {
    await sql.transaction((transaction) => [
      ...initialProjects.map((project, index) => transaction`
        INSERT INTO projects (id, slug, data, sort_order)
        VALUES (${project.id}, ${project.slug}, ${JSON.stringify(project)}::jsonb, ${index})
        ON CONFLICT (id) DO NOTHING
      `),
      ...initialArticles.map((article, index) => transaction`
        INSERT INTO articles (id, project_id, slug, data, sort_order)
        VALUES (${article.id}, ${article.projectId}, ${article.slug}, ${JSON.stringify(article)}::jsonb, ${index})
        ON CONFLICT (id) DO NOTHING
      `),
    ]);
  }

  async getProjects(): Promise<Project[]> {
    await this.initialize();
    const rows = await this.getClient()`SELECT data FROM projects ORDER BY sort_order ASC`;
    return rows.map((row) => row.data as Project);
  }

  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    await this.initialize();
    const rows = await this.getClient()`
      SELECT data FROM projects WHERE LOWER(slug) = LOWER(${slug}) ORDER BY sort_order ASC LIMIT 1
    `;
    return rows[0]?.data as Project | undefined;
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    await this.initialize();
    const rows = await this.getClient()`SELECT data FROM projects WHERE id = ${id} LIMIT 1`;
    return rows[0]?.data as Project | undefined;
  }

  async saveProject(project: Project): Promise<Project> {
    await this.initialize();
    const existing = project.id ? await this.getProjectById(project.id) : undefined;
    const saved: Project = existing
      ? { ...existing, ...project, updatedAt: new Date().toISOString() }
      : {
          ...project,
          id: project.id || `proj_${Date.now()}`,
          updatedAt: new Date().toISOString(),
          stars: project.stars || 0,
          forks: project.forks || 0,
          branch: project.branch || 'main',
          commitSha: project.commitSha || Math.random().toString(16).substring(2, 9),
        };

    const sql = this.getClient();
    await sql`
      INSERT INTO projects (id, slug, data, sort_order)
      VALUES (
        ${saved.id},
        ${saved.slug},
        ${JSON.stringify(saved)}::jsonb,
        (SELECT COALESCE(MIN(sort_order), 0) - 1 FROM projects)
      )
      ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, data = EXCLUDED.data
    `;
    return saved;
  }

  async deleteProject(id: string): Promise<boolean> {
    await this.initialize();
    const sql = this.getClient();
    const [, deletedProjects] = await sql.transaction((transaction) => [
      transaction`DELETE FROM articles WHERE project_id = ${id}`,
      transaction`DELETE FROM projects WHERE id = ${id} RETURNING id`,
    ]);
    return deletedProjects.length > 0;
  }

  async getArticle(projectId: string, articleSlug: string): Promise<Article | undefined> {
    await this.initialize();
    const rows = await this.getClient()`
      SELECT data FROM articles
      WHERE project_id = ${projectId} AND LOWER(slug) = LOWER(${articleSlug})
      LIMIT 1
    `;
    return rows[0]?.data as Article | undefined;
  }

  async getArticleById(id: string): Promise<Article | undefined> {
    await this.initialize();
    const rows = await this.getClient()`SELECT data FROM articles WHERE id = ${id} LIMIT 1`;
    return rows[0]?.data as Article | undefined;
  }

  async getArticlesByProject(projectId: string): Promise<Article[]> {
    await this.initialize();
    const rows = await this.getClient()`
      SELECT data FROM articles WHERE project_id = ${projectId} ORDER BY sort_order ASC
    `;
    return rows.map((row) => row.data as Article);
  }

  async saveArticle(article: Article): Promise<Article> {
    const [saved] = await this.saveArticles([article]);
    return saved;
  }

  async saveArticles(articles: Article[]): Promise<Article[]> {
    await this.initialize();
    if (articles.length === 0) return [];

    const updatedArticles = articles.map((article) => ({
      ...article,
      id: article.id || `art_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      updatedAt: new Date().toISOString(),
    }));
    const projectIds = [...new Set(updatedArticles.map((article) => article.projectId))];
    const projects = await Promise.all(projectIds.map((id) => this.getProjectById(id)));
    const updatedProjects = new Map<string, Project>();

    projects.forEach((project) => {
      if (project) {
        updatedProjects.set(project.id, {
          ...project,
          sections: project.sections.map((section) => ({
            ...section,
            articles: section.articles.map((item) => ({ ...item })),
          })),
          updatedAt: new Date().toISOString(),
        });
      }
    });

    updatedArticles.forEach((article) => {
      const project = updatedProjects.get(article.projectId);
      if (!project) return;

      let section = project.sections.find((item) => item.id === article.sectionId);
      if (!section && project.sections.length > 0) {
        section = project.sections[0];
        article.sectionId = section.id;
      }
      if (!section) return;

      const meta = {
        id: article.id,
        title: article.title,
        slug: article.slug,
        type: article.type,
        method: article.endpoint?.method,
        path: article.endpoint?.path,
        order: article.order,
      };
      const metaIndex = section.articles.findIndex((item) => item.id === article.id);
      if (metaIndex >= 0) {
        section.articles[metaIndex] = meta;
      } else {
        section.articles.push(meta);
      }
    });

    const sql = this.getClient();
    await sql.transaction((transaction) => [
      ...[...updatedProjects.values()].map((project) => transaction`
        UPDATE projects
        SET slug = ${project.slug}, data = ${JSON.stringify(project)}::jsonb
        WHERE id = ${project.id}
      `),
      ...updatedArticles.map((article) => transaction`
        INSERT INTO articles (id, project_id, slug, data, sort_order)
        VALUES (
          ${article.id},
          ${article.projectId},
          ${article.slug},
          ${JSON.stringify(article)}::jsonb,
          (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM articles)
        )
        ON CONFLICT (id) DO UPDATE
        SET project_id = EXCLUDED.project_id, slug = EXCLUDED.slug, data = EXCLUDED.data
      `),
    ]);
    return updatedArticles;
  }

  async deleteArticle(id: string): Promise<boolean> {
    await this.initialize();
    const target = await this.getArticleById(id);
    if (!target) return false;

    const project = await this.getProjectById(target.projectId);
    const sql = this.getClient();
    if (!project) {
      const deleted = await sql`DELETE FROM articles WHERE id = ${id} RETURNING id`;
      return deleted.length > 0;
    }

    const updatedProject: Project = {
      ...project,
      sections: project.sections.map((section) => ({
        ...section,
        articles: section.articles.filter((item) => item.id !== id),
      })),
      updatedAt: new Date().toISOString(),
    };

    const [deleted] = await sql.transaction((transaction) => [
      transaction`DELETE FROM articles WHERE id = ${id} RETURNING id`,
      transaction`
        UPDATE projects SET data = ${JSON.stringify(updatedProject)}::jsonb
        WHERE id = ${updatedProject.id}
      `,
    ]);
    return deleted.length > 0;
  }

  async search(query: string): Promise<SearchResultItem[]> {
    await this.initialize();
    if (!query || query.trim().length === 0) return [];

    const q = query.toLowerCase().trim();
    const sql = this.getClient();
    const [articleRows, projectRows] = await sql.transaction((transaction) => [
      transaction`SELECT data FROM articles ORDER BY sort_order ASC`,
      transaction`SELECT id, data FROM projects`,
    ]);
    const projectsById = new Map<string, Project>(
      projectRows.map((row) => [row.id as string, row.data as Project]),
    );
    const results: SearchResultItem[] = [];

    for (const row of articleRows) {
      const article = row.data as Article;
      const project = projectsById.get(article.projectId);
      if (!project) continue;

      const section = project.sections.find((item) => item.id === article.sectionId);
      const sectionTitle = section ? section.title : 'General';
      let matched = false;
      let snippet = article.description || '';

      if (article.title.toLowerCase().includes(q)) {
        matched = true;
      } else if (article.endpoint?.path.toLowerCase().includes(q)) {
        matched = true;
        snippet = `API: ${article.endpoint.method} ${article.endpoint.path}`;
      } else if (article.content.toLowerCase().includes(q)) {
        matched = true;
        const index = article.content.toLowerCase().indexOf(q);
        const start = Math.max(0, index - 40);
        const end = Math.min(article.content.length, index + 80);
        snippet = '...' + article.content.substring(start, end).replace(/\n/g, ' ') + '...';
      }

      if (matched) {
        results.push({
          projectId: project.id,
          projectName: project.name,
          projectSlug: project.slug,
          articleId: article.id,
          articleTitle: article.title,
          articleSlug: article.slug,
          type: article.type,
          method: article.endpoint?.method,
          path: article.endpoint?.path,
          sectionTitle,
          snippet,
        });
      }
    }

    return results.slice(0, 15);
  }

  async resetToDefaults(): Promise<void> {
    await this.initialize();
    const sql = this.getClient();
    await sql.transaction((transaction) => [
      transaction`DELETE FROM articles`,
      transaction`DELETE FROM projects`,
      ...initialProjects.map((project, index) => transaction`
        INSERT INTO projects (id, slug, data, sort_order)
        VALUES (${project.id}, ${project.slug}, ${JSON.stringify(project)}::jsonb, ${index})
      `),
      ...initialArticles.map((article, index) => transaction`
        INSERT INTO articles (id, project_id, slug, data, sort_order)
        VALUES (${article.id}, ${article.projectId}, ${article.slug}, ${JSON.stringify(article)}::jsonb, ${index})
      `),
    ]);
  }
}

export const db = new Database();
