import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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
  createdAt: string;
  lastLoginAt: string;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: number;
  rememberMe: boolean;
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

interface DatabaseSchema {
  users: User[];
  sessions: Session[];
  audits: AuditRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'crawllens.json');

// Ensure data folder and file exists
function initDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const defaultUsers: User[] = [
    {
      id: 'user_demo_123',
      fullName: 'Demo Auditor',
      email: 'demo@crawllens.io',
      passwordHash: hashPassword('DemoPass123!', '2a7958c96e5a3bc068d5b27c7c09d0cd'),
      salt: '2a7958c96e5a3bc068d5b27c7c09d0cd',
      authProvider: 'email',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'user_manasmughal',
      fullName: 'Manas Mughal',
      email: 'manasmughal25@gmail.com',
      authProvider: 'google',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Manas%20Mughal'
    }
  ];

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      users: defaultUsers,
      sessions: [],
      audits: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed: DatabaseSchema = JSON.parse(raw);
    
    // Ensure manasmughal25@gmail.com exists if missing
    if (!parsed.users.some(u => u.email.toLowerCase() === 'manasmughal25@gmail.com')) {
      parsed.users.push(defaultUsers[1]);
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf8');
    }
    return parsed;
  } catch (err) {
    console.error('Error reading DB, resetting to defaults', err);
    const fallback: DatabaseSchema = { users: defaultUsers, sessions: [], audits: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
}

let dbCache: DatabaseSchema = initDb();

export function getDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      dbCache = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to sync DB from disk:', err);
  }
  return dbCache;
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save DB:', err);
  }
}

// Password cryptography
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// User Operations
export function findUserByEmail(email: string): User | undefined {
  if (!email || typeof email !== 'string') return undefined;
  const clean = email.toLowerCase().trim();
  const db = getDb();
  return db.users.find(u => u.email.toLowerCase().trim() === clean);
}

export function findUserById(id: string): User | undefined {
  if (!id) return undefined;
  const db = getDb();
  return db.users.find(u => u.id === id);
}

export function findUserByResetToken(token: string): User | undefined {
  if (!token) return undefined;
  const db = getDb();
  return db.users.find(u => u.resetPasswordToken === token);
}

export function createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLoginAt'>): User {
  const db = getDb();
  const cleanEmail = userData.email.toLowerCase().trim();
  
  // If user already exists, update and return existing user rather than duplicating!
  const existing = db.users.find(u => u.email.toLowerCase().trim() === cleanEmail);
  if (existing) {
    return existing;
  }

  const newUser: User = {
    ...userData,
    id: 'user_' + crypto.randomUUID().slice(0, 8),
    email: cleanEmail,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };
  dbCache.users.push(newUser);
  saveDb();
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const db = getDb();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return undefined;
  dbCache.users[index] = { ...dbCache.users[index], ...updates };
  saveDb();
  return dbCache.users[index];
}

// Session Operations
export function createSession(userId: string, rememberMe: boolean = false): Session {
  const duration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const session: Session = {
    token: generateToken(),
    userId,
    expiresAt: Date.now() + duration,
    rememberMe
  };
  // remove expired sessions
  dbCache.sessions = dbCache.sessions.filter(s => s.expiresAt > Date.now());
  dbCache.sessions.push(session);
  saveDb();
  return session;
}

export function getSession(token: string): Session | undefined {
  const session = dbCache.sessions.find(s => s.token === token);
  if (!session) return undefined;
  if (session.expiresAt < Date.now()) {
    deleteSession(token);
    return undefined;
  }
  return session;
}

export function deleteSession(token: string): void {
  dbCache.sessions = dbCache.sessions.filter(s => s.token !== token);
  saveDb();
}

// Audit Operations
export function getUserAudits(userId: string): AuditRecord[] {
  return dbCache.audits
    .filter(a => a.userId === userId || userId === 'all')
    .sort((a, b) => new Date(b.crawledAt).getTime() - new Date(a.crawledAt).getTime());
}

export function getAuditById(id: string): AuditRecord | undefined {
  return dbCache.audits.find(a => a.id === id);
}

export function saveAudit(audit: AuditRecord): void {
  const idx = dbCache.audits.findIndex(a => a.id === audit.id);
  if (idx >= 0) {
    dbCache.audits[idx] = audit;
  } else {
    dbCache.audits.unshift(audit);
  }
  saveDb();
}

export function deleteAudit(id: string, userId: string): boolean {
  const prevLen = dbCache.audits.length;
  dbCache.audits = dbCache.audits.filter(a => a.id !== id || (a.userId !== userId && userId !== 'admin'));
  const changed = dbCache.audits.length !== prevLen;
  if (changed) saveDb();
  return changed;
}
