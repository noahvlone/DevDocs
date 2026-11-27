import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';
import type { Article, Project } from '../src/types/doc';

interface LocalDatabase {
  projects: Project[];
  articles: Article[];
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not configured. Add the Neon connection string to .env.');
}

const localContent = await readFile(new URL('../server/data/db.json', import.meta.url), 'utf8');
const localData = JSON.parse(localContent) as LocalDatabase;
if (!Array.isArray(localData.projects) || !Array.isArray(localData.articles) || localData.projects.length === 0) {
  throw new Error('server/data/db.json is missing valid project and article data.');
}

const sql = neon(connectionString);
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
if (count > 0) {
  throw new Error('The Neon database is not empty. Migration stopped to avoid overwriting existing data.');
}

await sql.transaction((transaction) => [
  ...localData.projects.map((project, index) => transaction`
    INSERT INTO projects (id, slug, data, sort_order)
    VALUES (${project.id}, ${project.slug}, ${JSON.stringify(project)}::jsonb, ${index})
  `),
  ...localData.articles.map((article, index) => transaction`
    INSERT INTO articles (id, project_id, slug, data, sort_order)
    VALUES (${article.id}, ${article.projectId}, ${article.slug}, ${JSON.stringify(article)}::jsonb, ${index})
  `),
]);

console.log(`Migrated ${localData.projects.length} projects and ${localData.articles.length} articles to Neon.`);
