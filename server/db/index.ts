import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.ts';
import path from 'path';
import fs from 'fs';

let dbPath = path.resolve(process.cwd(), 'data', 'seo_ai_pro.db');
try {
  const DATA_DIR = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  // Test write permission
  fs.accessSync(DATA_DIR, fs.constants.W_OK);
} catch {
  // Fallback to /tmp for Vercel serverless environment
  dbPath = '/tmp/seo_ai_pro.db';
}

const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });


// Helper to initialize the database (run migrations or create tables)
// Since we are in a dev environment without a proper CLI-based migration flow 
// for every user action, we can use drizzle-kit push or manual table creation.
// For simplicity in this turn, we'll assume the tables need to be created if they don't exist.
// Drizzle doesn't have a built-in 'sync' like Sequelize, but we can use drizzle-kit.

export function initRelationalDb() {
  console.log('[DB] Initializing relational SQLite database...');
  try {
    // 1. Create Phase 2 tables if they do not exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS crawl_jobs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        project_id TEXT,
        url TEXT NOT NULL,
        domain TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        max_pages INTEGER DEFAULT 25,
        discovered_count INTEGER DEFAULT 0,
        crawled_count INTEGER DEFAULT 0,
        error_count INTEGER DEFAULT 0,
        redirect_count INTEGER DEFAULT 0,
        technical_score INTEGER DEFAULT 100,
        critical_count INTEGER DEFAULT 0,
        high_count INTEGER DEFAULT 0,
        medium_count INTEGER DEFAULT 0,
        low_count INTEGER DEFAULT 0,
        has_robots_txt INTEGER DEFAULT 0,
        has_sitemap INTEGER DEFAULT 0,
        error_message TEXT,
        started_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS crawled_pages (
        id TEXT PRIMARY KEY,
        crawl_job_id TEXT NOT NULL,
        url TEXT NOT NULL,
        http_status INTEGER,
        response_time_ms INTEGER,
        title TEXT,
        meta_description TEXT,
        h1 TEXT,
        canonical_url TEXT,
        is_indexable INTEGER DEFAULT 1,
        depth INTEGER DEFAULT 0,
        inlinks_count INTEGER DEFAULT 0,
        outlinks_count INTEGER DEFAULT 0,
        images_count INTEGER DEFAULT 0,
        missing_alt_count INTEGER DEFAULT 0,
        issues_count INTEGER DEFAULT 0,
        crawled_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (crawl_job_id) REFERENCES crawl_jobs(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS technical_issues (
        id TEXT PRIMARY KEY,
        crawl_job_id TEXT NOT NULL,
        page_url TEXT NOT NULL,
        category TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        impact TEXT NOT NULL,
        recommendation TEXT NOT NULL,
        code_snippet TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (crawl_job_id) REFERENCES crawl_jobs(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS pagespeed_reports (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        project_id TEXT,
        url TEXT NOT NULL,
        strategy TEXT NOT NULL,
        performance_score INTEGER,
        accessibility_score INTEGER,
        best_practices_score INTEGER,
        seo_score INTEGER,
        lcp TEXT,
        inp TEXT,
        cls TEXT,
        fcp TEXT,
        speed_index TEXT,
        opportunities_json TEXT,
        diagnostics_json TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
    `);

    // Ensure guest_user exists to satisfy foreign key constraints for unauthenticated audits
    sqlite.prepare(`
      INSERT OR IGNORE INTO users (id, full_name, email, auth_provider, email_verified)
      VALUES ('guest_user', 'Guest Auditor', 'guest@seo-ai-pro.internal', 'email', 1)
    `).run();
  } catch (err) {
    console.warn('[DB] Note on DB initialization:', err);
  }
}
