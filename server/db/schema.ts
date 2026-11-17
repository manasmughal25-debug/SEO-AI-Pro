import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

// --- USERS & AUTH ---
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  salt: text('salt'),
  authProvider: text('auth_provider', { enum: ['email', 'google', 'both'] }).default('email'),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
  verificationCode: text('verification_code'),
  verificationCodeExpiresAt: integer('verification_code_expires_at'),
  resetPasswordToken: text('reset_password_token'),
  resetPasswordExpiresAt: integer('reset_password_expires_at'),
  avatar: text('avatar'),
  role: text('role', { enum: ['user', 'admin'] }).default('user'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  lastLoginAt: text('last_login_at'),
});

// --- PROJECTS ---
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  industry: text('industry'),
  targetAudience: text('target_audience'),
  goals: text('goals'), // Store as comma-separated or JSON string
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const projectDomains = sqliteTable('project_domains', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  domain: text('domain').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// --- AUDITS & ANALYTICS ---
export const audits = sqliteTable('audits', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  status: text('status', { enum: ['completed', 'failed', 'in_progress'] }).default('in_progress'),
  responseTimeMs: integer('response_time_ms'),
  httpStatus: integer('http_status'),
  scoreOverall: integer('score_overall'),
  scoreSeo: integer('score_seo'),
  scoreAeo: integer('score_aeo'),
  scoreAio: integer('score_aio'),
  scoreGeo: integer('score_geo'),
  scoreEeat: integer('score_eeat'),
  scoreIntelligence: integer('score_intelligence'),
  summaryJson: text('summary_json'), // Store technical summary
  intelligenceJson: text('intelligence_json'), // Store AI-powered insights
  errorMessage: text('error_message'),
  crawledAt: text('crawled_at').default(sql`CURRENT_TIMESTAMP`),
});

export const auditIssues = sqliteTable('audit_issues', {
  id: text('id').primaryKey(),
  auditId: text('audit_id').references(() => audits.id, { onDelete: 'cascade' }),
  category: text('category', { enum: ['SEO', 'AEO', 'AIO', 'GEO', 'EEAT', 'INTELLIGENCE'] }),
  severity: text('severity', { enum: ['critical', 'warning', 'good'] }),
  title: text('title').notNull(),
  description: text('description'),
  impact: text('impact'),
  recommendation: text('recommendation'),
  codeSnippet: text('code_snippet'),
});

// --- KEYWORDS & RANKINGS ---
export const keywords = sqliteTable('keywords', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  term: text('term').notNull(),
  searchVolume: integer('search_volume'),
  difficulty: integer('difficulty'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const keywordRankings = sqliteTable('keyword_rankings', {
  id: text('id').primaryKey(),
  keywordId: text('keyword_id').references(() => keywords.id, { onDelete: 'cascade' }),
  position: integer('position'),
  url: text('url'),
  recordedAt: text('recorded_at').default(sql`CURRENT_TIMESTAMP`),
});

// --- COMPETITORS ---
export const competitors = sqliteTable('competitors', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  domain: text('domain').notNull(),
  name: text('name'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// --- ADVANCED WEBSITE CRAWLER & MULTI-PAGE AUDITS ---
export const crawlJobs = sqliteTable('crawl_jobs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  domain: text('domain').notNull(),
  status: text('status', { enum: ['pending', 'running', 'completed', 'failed'] }).default('pending'),
  maxPages: integer('max_pages').default(25),
  discoveredCount: integer('discovered_count').default(0),
  crawledCount: integer('crawled_count').default(0),
  errorCount: integer('error_count').default(0),
  redirectCount: integer('redirect_count').default(0),
  technicalScore: integer('technical_score').default(100),
  criticalCount: integer('critical_count').default(0),
  highCount: integer('high_count').default(0),
  mediumCount: integer('medium_count').default(0),
  lowCount: integer('low_count').default(0),
  hasRobotsTxt: integer('has_robots_txt', { mode: 'boolean' }).default(false),
  hasSitemap: integer('has_sitemap', { mode: 'boolean' }).default(false),
  errorMessage: text('error_message'),
  startedAt: text('started_at').default(sql`CURRENT_TIMESTAMP`),
  completedAt: text('completed_at'),
});

export const crawledPages = sqliteTable('crawled_pages', {
  id: text('id').primaryKey(),
  crawlJobId: text('crawl_job_id').references(() => crawlJobs.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  httpStatus: integer('http_status'),
  responseTimeMs: integer('response_time_ms'),
  title: text('title'),
  metaDescription: text('meta_description'),
  h1: text('h1'),
  canonicalUrl: text('canonical_url'),
  isIndexable: integer('is_indexable', { mode: 'boolean' }).default(true),
  depth: integer('depth').default(0),
  inlinksCount: integer('inlinks_count').default(0),
  outlinksCount: integer('outlinks_count').default(0),
  imagesCount: integer('images_count').default(0),
  missingAltCount: integer('missing_alt_count').default(0),
  issuesCount: integer('issues_count').default(0),
  crawledAt: text('crawled_at').default(sql`CURRENT_TIMESTAMP`),
});

export const technicalIssues = sqliteTable('technical_issues', {
  id: text('id').primaryKey(),
  crawlJobId: text('crawl_job_id').references(() => crawlJobs.id, { onDelete: 'cascade' }),
  pageUrl: text('page_url').notNull(),
  category: text('category').notNull(),
  severity: text('severity', { enum: ['critical', 'high', 'medium', 'low'] }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  impact: text('impact').notNull(),
  recommendation: text('recommendation').notNull(),
  codeSnippet: text('code_snippet'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const pagespeedReports = sqliteTable('pagespeed_reports', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  strategy: text('strategy', { enum: ['mobile', 'desktop'] }).notNull(),
  performanceScore: integer('performance_score'),
  accessibilityScore: integer('accessibility_score'),
  bestPracticesScore: integer('best_practices_score'),
  seoScore: integer('seo_score'),
  lcp: text('lcp'),
  inp: text('inp'),
  cls: text('cls'),
  fcp: text('fcp'),
  speedIndex: text('speed_index'),
  opportunitiesJson: text('opportunities_json'),
  diagnosticsJson: text('diagnostics_json'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// --- RELATIONS ---
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  audits: many(audits),
  crawlJobs: many(crawlJobs),
  pagespeedReports: many(pagespeedReports),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  domains: many(projectDomains),
  audits: many(audits),
  keywords: many(keywords),
  competitors: many(competitors),
  crawlJobs: many(crawlJobs),
  pagespeedReports: many(pagespeedReports),
}));

export const auditsRelations = relations(audits, ({ one, many }) => ({
  project: one(projects, { fields: [audits.projectId], references: [projects.id] }),
  user: one(users, { fields: [audits.userId], references: [users.id] }),
  issues: many(auditIssues),
}));

export const auditIssuesRelations = relations(auditIssues, ({ one }) => ({
  audit: one(audits, { fields: [auditIssues.auditId], references: [audits.id] }),
}));

export const keywordsRelations = relations(keywords, ({ one, many }) => ({
  project: one(projects, { fields: [keywords.projectId], references: [projects.id] }),
  rankings: many(keywordRankings),
}));

export const keywordRankingsRelations = relations(keywordRankings, ({ one }) => ({
  keyword: one(keywords, { fields: [keywordRankings.keywordId], references: [keywords.id] }),
}));

export const crawlJobsRelations = relations(crawlJobs, ({ one, many }) => ({
  user: one(users, { fields: [crawlJobs.userId], references: [users.id] }),
  project: one(projects, { fields: [crawlJobs.projectId], references: [projects.id] }),
  pages: many(crawledPages),
  issues: many(technicalIssues),
}));

export const crawledPagesRelations = relations(crawledPages, ({ one }) => ({
  job: one(crawlJobs, { fields: [crawledPages.crawlJobId], references: [crawlJobs.id] }),
}));

export const technicalIssuesRelations = relations(technicalIssues, ({ one }) => ({
  job: one(crawlJobs, { fields: [technicalIssues.crawlJobId], references: [crawlJobs.id] }),
}));

export const pagespeedReportsRelations = relations(pagespeedReports, ({ one }) => ({
  user: one(users, { fields: [pagespeedReports.userId], references: [users.id] }),
  project: one(projects, { fields: [pagespeedReports.projectId], references: [projects.id] }),
}));
