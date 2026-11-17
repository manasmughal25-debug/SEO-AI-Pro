import { db } from '../db/index.ts';
import { keywords, keywordRankings } from '../db/schema.ts';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';

export class KeywordService {
  static async addKeywordToProject(projectId: string, data: { term: string; searchVolume?: number; difficulty?: number }) {
    const keywordId = 'kw_' + crypto.randomUUID().slice(0, 8);
    
    await db.insert(keywords).values({
      id: keywordId,
      projectId,
      term: data.term,
      searchVolume: data.searchVolume,
      difficulty: data.difficulty,
    });

    return { keywordId };
  }

  static async getProjectKeywords(projectId: string) {
    return await db.query.keywords.findMany({
      where: eq(keywords.projectId, projectId),
      with: {
        rankings: {
          orderBy: [desc(keywordRankings.recordedAt)],
          limit: 1,
        }
      }
    });
  }

  static async deleteKeyword(keywordId: string, projectId: string) {
    // Note: projectId check for security
    const kw = await db.query.keywords.findFirst({
      where: and(eq(keywords.id, keywordId), eq(keywords.projectId, projectId))
    });
    
    if (!kw) throw new Error('Keyword not found or access denied');
    
    return await db.delete(keywords).where(eq(keywords.id, keywordId));
  }

  static async recordRanking(keywordId: string, position: number, url?: string) {
    const rankingId = 'rank_' + crypto.randomUUID().slice(0, 8);
    await db.insert(keywordRankings).values({
      id: rankingId,
      keywordId,
      position,
      url,
    });
  }
}
