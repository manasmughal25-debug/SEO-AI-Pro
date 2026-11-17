import { db } from '../db/index.ts';
import { audits, auditIssues, users } from '../db/schema.ts';
import { eq, and, desc } from 'drizzle-orm';
import { AuditRecord } from '../../src/types/index.ts';

export class AuditService {
  static async saveAudit(record: AuditRecord) {
    // 0. Ensure userId exists to prevent foreign key constraint violations
    let resolvedUserId: string | null = null;
    if (record.userId) {
      const u = await db.query.users.findFirst({
        where: eq(users.id, record.userId)
      });
      if (u) {
        resolvedUserId = record.userId;
      }
    }

    // 1. Insert/Update main audit record
    await db.insert(audits).values({
      id: record.id,
      userId: resolvedUserId,
      projectId: record.projectId || null,
      url: record.url,
      status: record.status,
      responseTimeMs: record.responseTimeMs,
      httpStatus: record.httpStatus,
      scoreOverall: record.scores.overall,
      scoreSeo: record.scores.seo,
      scoreAeo: record.scores.aeo,
      scoreAio: record.scores.aio,
      scoreGeo: record.scores.geo,
      scoreEeat: record.scores.eeat,
      scoreIntelligence: record.scores.intelligence,
      summaryJson: JSON.stringify(record.summary),
      intelligenceJson: JSON.stringify(record.intelligence),
      errorMessage: record.errorMessage,
      crawledAt: record.crawledAt,
    }).onConflictDoUpdate({
      target: audits.id,
      set: {
        status: record.status,
        scoreOverall: record.scores.overall,
        summaryJson: JSON.stringify(record.summary),
        intelligenceJson: JSON.stringify(record.intelligence),
      }
    });

    // 2. Clear old issues if updating
    await db.delete(auditIssues).where(eq(auditIssues.auditId, record.id));

    // 3. Insert new issues with guaranteed globally unique primary keys
    if (record.issues.length > 0) {
      const issueValues = record.issues.map((issue, idx) => ({
        id: `${record.id}_${issue.id || 'issue'}_${idx}`,
        auditId: record.id,
        category: issue.category,
        severity: issue.severity,
        title: issue.title,
        description: issue.description,
        impact: issue.impact,
        recommendation: issue.recommendation,
        codeSnippet: issue.codeSnippet,
      }));
      await db.insert(auditIssues).values(issueValues).onConflictDoNothing();
    }
  }

  static async getAuditsByProject(projectId: string, userId: string) {
    const results = await db.query.audits.findMany({
      where: and(eq(audits.projectId, projectId), eq(audits.userId, userId)),
      orderBy: [desc(audits.crawledAt)],
      with: {
        issues: true,
      }
    });

    return results.map(this.mapDbToRecord);
  }

  static async getUserAudits(userId: string) {
    const results = await db.query.audits.findMany({
      where: eq(audits.userId, userId),
      orderBy: [desc(audits.crawledAt)],
      with: {
        issues: true,
      }
    });
    return results.map(this.mapDbToRecord);
  }

  static async getAuditById(auditId: string, userId?: string) {
    const result = await db.query.audits.findFirst({
      where: userId ? and(eq(audits.id, auditId), eq(audits.userId, userId)) : eq(audits.id, auditId),
      with: {
        issues: true,
      }
    });

    if (!result) return null;
    return this.mapDbToRecord(result);
  }

  static async deleteAudit(auditId: string, userId: string) {
    return await db.delete(audits).where(and(eq(audits.id, auditId), eq(audits.userId, userId)));
  }

  private static mapDbToRecord(dbAudit: any): AuditRecord {
    return {
      id: dbAudit.id,
      userId: dbAudit.userId,
      projectId: dbAudit.projectId,
      url: dbAudit.url,
      normalizedUrl: dbAudit.url,
      domain: new URL(dbAudit.url).hostname,
      crawledAt: dbAudit.crawledAt,
      status: dbAudit.status as 'completed' | 'failed' | 'in_progress',
      responseTimeMs: dbAudit.responseTimeMs,
      httpStatus: dbAudit.httpStatus,
      scores: {
        overall: dbAudit.scoreOverall,
        seo: dbAudit.scoreSeo,
        aeo: dbAudit.scoreAeo,
        aio: dbAudit.scoreAio,
        geo: dbAudit.scoreGeo,
        eeat: dbAudit.scoreEeat,
        intelligence: dbAudit.scoreIntelligence,
      },
      summary: JSON.parse(dbAudit.summaryJson || '{}'),
      intelligence: JSON.parse(dbAudit.intelligenceJson || '{}'),
      issues: (dbAudit.issues || []).map((i: any) => ({
        ...i,
        id: i.id.startsWith(dbAudit.id + '_')
          ? i.id.slice((dbAudit.id + '_').length).replace(/_\d+$/, '')
          : i.id
      })),
      urls: [], // Note: urls are not yet stored in DB in this version for simplicity, can be added to summaryJson
      errorMessage: dbAudit.errorMessage,
    };
  }
}
