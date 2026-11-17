import { db } from '../db/index.ts';
import { projects, projectDomains, users } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export class ProjectService {
  static async createProject(userId: string, data: { name: string; url: string; industry?: string; targetAudience?: string; goals?: string }) {
    const projectId = 'proj_' + crypto.randomUUID().slice(0, 8);
    const domainId = 'dom_' + crypto.randomUUID().slice(0, 8);
    const domain = new URL(data.url).hostname;

    await db.insert(projects).values({
      id: projectId,
      userId,
      name: data.name,
      industry: data.industry,
      targetAudience: data.targetAudience,
      goals: data.goals,
    });

    await db.insert(projectDomains).values({
      id: domainId,
      projectId,
      url: data.url,
      domain,
    });

    return { projectId, domainId };
  }

  static async getProjects(userId: string) {
    return await db.query.projects.findMany({
      where: eq(projects.userId, userId),
      with: {
        domains: true,
      },
    });
  }

  static async getProjectById(projectId: string, userId: string) {
    return await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
      with: {
        domains: true,
        keywords: true,
        competitors: true,
      },
    });
  }

  static async deleteProject(projectId: string, userId: string) {
    return await db.delete(projects).where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
  }
}
