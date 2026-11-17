import { db } from '../db/index.ts';
import { competitors } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export class CompetitorService {
  static async addCompetitor(projectId: string, domain: string, name?: string) {
    const competitorId = 'comp_' + crypto.randomUUID().slice(0, 8);
    
    await db.insert(competitors).values({
      id: competitorId,
      projectId,
      domain: domain.toLowerCase().trim(),
      name: name || domain,
    });

    return { competitorId };
  }

  static async getProjectCompetitors(projectId: string) {
    return await db.query.competitors.findMany({
      where: eq(competitors.projectId, projectId),
    });
  }

  static async deleteCompetitor(competitorId: string, projectId: string) {
    return await db.delete(competitors).where(
      and(eq(competitors.id, competitorId), eq(competitors.projectId, projectId))
    );
  }
}
