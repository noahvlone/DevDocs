import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Project, Article, SearchResultItem } from '../src/types/doc';
import { initialProjects, initialArticles } from './seed-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  projects: Project[];
  articles: Article[];
}

export class Database {
  private data: DatabaseSchema = {
    projects: [],
    articles: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      this.data = {
        projects: initialProjects,
        articles: initialArticles,
      };
      this.saveToFile();
    } else {
      try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(content);
        if (!this.data.projects || !this.data.articles) {
          throw new Error('Invalid db structure');
        }
      } catch (err) {
        console.warn('Failed reading db.json, reseeding default dataset:', err);
        this.data = {
          projects: initialProjects,
          articles: initialArticles,
        };
        this.saveToFile();
      }
    }
  }

  private saveToFile() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to db.json:', err);
    }
  }

  public getProjects(): Project[] {
    return this.data.projects;
  }

  public getProjectBySlug(slug: string): Project | undefined {
    return this.data.projects.find((p) => p.slug.toLowerCase() === slug.toLowerCase());
  }

  public getProjectById(id: string): Project | undefined {
    return this.data.projects.find((p) => p.id === id);
  }

  public saveProject(project: Project): Project {
    const existingIndex = this.data.projects.findIndex((p) => p.id === project.id);
    if (existingIndex >= 0) {
      this.data.projects[existingIndex] = {
        ...this.data.projects[existingIndex],
        ...project,
        updatedAt: new Date().toISOString(),
      };
    } else {
      this.data.projects.unshift({
        ...project,
        id: project.id || `proj_${Date.now()}`,
        updatedAt: new Date().toISOString(),
        stars: project.stars || 0,
        forks: project.forks || 0,
        branch: project.branch || 'main',
        commitSha: project.commitSha || Math.random().toString(16).substring(2, 9),
      });
    }
    this.saveToFile();
    return project;
  }

  public deleteProject(id: string): boolean {
    const prevLen = this.data.projects.length;
    this.data.projects = this.data.projects.filter((p) => p.id !== id);
    this.data.articles = this.data.articles.filter((a) => a.projectId !== id);
    this.saveToFile();
    return this.data.projects.length < prevLen;
  }

  public getArticle(projectId: string, articleSlug: string): Article | undefined {
    return this.data.articles.find(
      (a) => a.projectId === projectId && a.slug.toLowerCase() === articleSlug.toLowerCase()
    );
  }

  public getArticleById(id: string): Article | undefined {
    return this.data.articles.find((a) => a.id === id);
  }

  public getArticlesByProject(projectId: string): Article[] {
    return this.data.articles.filter((a) => a.projectId === projectId);
  }

  public saveArticle(article: Article): Article {
    const existingIndex = this.data.articles.findIndex((a) => a.id === article.id);
    const updatedArticle = {
      ...article,
      id: article.id || `art_${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.data.articles[existingIndex] = updatedArticle;
    } else {
      this.data.articles.push(updatedArticle);
    }

    // Synchronize section tree in project
    const project = this.getProjectById(article.projectId);
    if (project) {
      let section = project.sections.find((s) => s.id === article.sectionId);
      if (!section && project.sections.length > 0) {
        section = project.sections[0];
        updatedArticle.sectionId = section.id;
      }
      if (section) {
        const metaIndex = section.articles.findIndex((m) => m.id === updatedArticle.id);
        const meta = {
          id: updatedArticle.id,
          title: updatedArticle.title,
          slug: updatedArticle.slug,
          type: updatedArticle.type,
          method: updatedArticle.endpoint?.method,
          path: updatedArticle.endpoint?.path,
          order: updatedArticle.order,
        };
        if (metaIndex >= 0) {
          section.articles[metaIndex] = meta;
        } else {
          section.articles.push(meta);
        }
      }
      this.saveProject(project);
    }

    this.saveToFile();
    return updatedArticle;
  }

  public deleteArticle(id: string): boolean {
    const target = this.getArticleById(id);
    if (!target) return false;

    this.data.articles = this.data.articles.filter((a) => a.id !== id);

    const project = this.getProjectById(target.projectId);
    if (project) {
      for (const section of project.sections) {
        section.articles = section.articles.filter((a) => a.id !== id);
      }
      this.saveProject(project);
    }

    this.saveToFile();
    return true;
  }

  public search(query: string): SearchResultItem[] {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase().trim();
    const results: SearchResultItem[] = [];

    for (const article of this.data.articles) {
      const project = this.getProjectById(article.projectId);
      if (!project) continue;

      const section = project.sections.find((s) => s.id === article.sectionId);
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
        const idx = article.content.toLowerCase().indexOf(q);
        const start = Math.max(0, idx - 40);
        const end = Math.min(article.content.length, idx + 80);
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

  public resetToDefaults(): void {
    this.data = {
      projects: initialProjects,
      articles: initialArticles,
    };
    this.saveToFile();
  }
}

export const db = new Database();
