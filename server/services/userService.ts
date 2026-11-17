import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export class UserService {
  static async findByEmail(email: string) {
    return await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });
  }

  static async findById(id: string) {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  static async createUser(data: {
    fullName: string;
    email: string;
    passwordHash?: string;
    salt?: string;
    authProvider: 'email' | 'google' | 'both';
    avatar?: string;
    emailVerified?: boolean;
  }) {
    const userId = 'user_' + crypto.randomUUID().slice(0, 8);
    await db.insert(users).values({
      id: userId,
      fullName: data.fullName,
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      salt: data.salt,
      authProvider: data.authProvider,
      avatar: data.avatar,
      emailVerified: data.emailVerified ?? false,
    });
    return await this.findById(userId);
  }

  static async updateUser(id: string, updates: Partial<typeof users.$inferSelect>) {
    await db.update(users).set(updates).where(eq(users.id, id));
    return await this.findById(id);
  }
}
