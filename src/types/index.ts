export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash?: string;
  salt?: string;
  authProvider: 'email' | 'google' | 'both';
  hasPassword?: boolean;
  emailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiresAt?: number;
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: number;
  avatar?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AuditIssue {
  id: string;
  category: 'SEO' | 'AEO' | 'AIO' | 'GEO' | 'EEAT' | 'INTELLIGENCE';
  severity: 'critical' | 'warning' | 'good';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  codeSnippet?: string;
}

export interface CrawledLink {
  url: string;
  type: 'internal' | 'external';
  status: number;
  anchor: string;
}

export interface SEOIntelligence {
  searchDemandForecasting?: {
    trend: 'up' | 'down' | 'stable';
    predictedVolume: string;
    insight: string;
  };
  topicalAuthority?: {
    score: number;
    currentNiche: string;
    gapOpportunities: string[];
  };
  contentDecayPrediction?: {
    status: 'healthy' | 'decaying' | 'stale';
    estimatedLifeRemainingMonths: number;
    refreshRecommendation: string;
  };
  entityIntelligence?: {
    detectedEntities: string[];
    missingSalientEntities: string[];
    knowledgeGraphReadiness: number;
  };
  competitorStrategy?: {
    likelyNextMove: string;
    marketVisibilityShare: string;
    strategicAdvantage: string;
  };
  jsSeoIntelligence?: {
    renderingStatus: 'static' | 'dynamic' | 'hybrid';
    indexabilityRisk: 'low' | 'medium' | 'high';
    frameworkDetected?: string;
    renderingIssues: string[];
  };
  informationGain?: {
    score: number;
    uniquenessInsight: string;
    augmentationSuggestions: string[];
  };
}

export interface AuditRecord {
  id: string;
  userId: string;
  projectId?: string | null;
  url: string;
  normalizedUrl: string;
  domain: string;
  crawledAt: string;
  status: 'completed' | 'failed' | 'in_progress';
  responseTimeMs: number;
  httpStatus: number;
  scores: {
    overall: number;
    seo: number;
    aeo: number;
    aio: number;
    geo: number;
    eeat: number;
    intelligence: number;
  };
  summary: {
    title: string;
    metaDescription: string;
    canonicalUrl: string;
    h1Count: number;
    headings: { level: string; text: string }[];
    wordCount: number;
    readingTimeMinutes: number;
    imagesCount: number;
    missingAltImagesCount: number;
    internalLinksCount: number;
    externalLinksCount: number;
    schemaTypes: string[];
    hasSitemap: boolean;
    hasRobotsTxt: boolean;
    aiBotDirectives: { bot: string; allowed: boolean }[];
    eeatSignals: { signal: string; detected: boolean; detail: string }[];
  };
  intelligence?: SEOIntelligence;
  issues: AuditIssue[];
  urls: CrawledLink[];
  errorMessage?: string;
}

export interface CrawlJob {
  id: string;
  userId?: string | null;
  projectId?: string | null;
  url: string;
  domain: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  maxPages: number;
  discoveredCount: number;
  crawledCount: number;
  errorCount: number;
  redirectCount: number;
  technicalScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  errorMessage?: string | null;
  startedAt: string;
  completedAt?: string | null;
}

export interface CrawledPage {
  id: string;
  crawlJobId: string;
  url: string;
  httpStatus: number;
  responseTimeMs: number;
  title?: string | null;
  metaDescription?: string | null;
  h1?: string | null;
  canonicalUrl?: string | null;
  isIndexable: boolean;
  depth: number;
  inlinksCount: number;
  outlinksCount: number;
  imagesCount: number;
  missingAltCount: number;
  issuesCount: number;
  crawledAt: string;
}

export interface TechnicalIssue {
  id: string;
  crawlJobId: string;
  pageUrl: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  codeSnippet?: string | null;
  createdAt?: string;
}

export interface PageSpeedMetric {
  title: string;
  value: string;
  score: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export interface PageSpeedAuditOpportunity {
  id: string;
  title: string;
  description: string;
  displayValue?: string;
  score?: number | null;
  savingsMs?: number;
  savingsBytes?: number;
}

export interface PageSpeedReport {
  id: string;
  url: string;
  strategy: 'mobile' | 'desktop';
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  metrics: {
    lcp: PageSpeedMetric;
    inp: PageSpeedMetric;
    cls: PageSpeedMetric;
    fcp: PageSpeedMetric;
    speedIndex: PageSpeedMetric;
  };
  opportunities: PageSpeedAuditOpportunity[];
  diagnostics: { title: string; displayValue?: string; description?: string }[];
  createdAt: string;
}

