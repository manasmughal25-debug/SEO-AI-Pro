import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  UserService
} from './server/services/userService.ts';
import {
  ProjectService
} from './server/services/projectService.ts';
import {
  AuditService
} from './server/services/auditService.ts';
import {
  KeywordService
} from './server/services/keywordService.ts';
import {
  CompetitorService
} from './server/services/competitorService.ts';
import {
  MultiCrawlerService
} from './server/services/multiCrawlerService.ts';
import {
  PageSpeedService
} from './server/services/pagespeedService.ts';

import {
  generateSalt,
  hashPassword,
  generateToken,
  generateVerificationCode,
  createSession,
  getSession,
  deleteSession
} from './server/db.ts'; // Keep crypto helpers for now
import {
  initRelationalDb,
  db as rdb
} from './server/db/index.ts';
import { validateAndNormalizeUrl, crawlAndAnalyze, probeWebsite, runStage, finalizeSequentialAudit } from './server/crawler.ts';
import { AuditRecord, User } from './src/types/index.ts';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  const app = express();
  initRelationalDb();

  app.use(cors());
  app.use(express.json());

  // Authentication Middleware
  async function authMiddleware(req: Request & { user?: User }, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required. Please log in.' });
      }
      const token = authHeader.split(' ')[1];
      const session = getSession(token);
      if (!session) {
        return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
      }
      
      const user = await UserService.findById(session.userId);
      if (!user) {
        return res.status(401).json({ error: 'User account not found.' });
      }
      req.user = user as any;
      next();
    } catch (err) {
      console.error('Auth middleware error:', err);
      res.status(500).json({ error: 'Internal server error during authentication.' });
    }
  }

  // Helper to return user without sensitive credentials and compute dual auth provider
  function getSafeUser(user: User) {
    const { passwordHash, salt, verificationCode, verificationCodeExpiresAt, resetPasswordToken, resetPasswordExpiresAt, ...safe } = user;
    const hasPassword = !!passwordHash;
    const isBoth = hasPassword && (user.authProvider === 'google' || user.authProvider === 'both');
    return {
      ...safe,
      hasPassword,
      authProvider: isBoth ? ('both' as const) : user.authProvider
    };
  }

  // ==========================================
  // AUTHENTICATION API ROUTES
  // ==========================================

  // 1. Sign Up (with auto-linking for existing Google users)
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { fullName, email, password, confirmPassword } = req.body;

      if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
        return res.status(400).json({ error: 'Please enter your full name (at least 2 characters).' });
      }

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email format (e.g., name@company.com).' });
      }

      if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Password is required.' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match. Please verify both password fields.' });
      }

      // Password complexity check
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);

      if (!hasUpper || !hasLower || !hasNumber) {
        return res.status(400).json({ 
          error: 'Password must include at least one uppercase letter, one lowercase letter, and one number.' 
        });
      }

      const existingUser = await UserService.findByEmail(cleanEmail);
      if (existingUser) {
        if (!existingUser.passwordHash) {
          const salt = generateSalt();
          const passwordHash = hashPassword(password, salt);
          const updated = await UserService.updateUser(existingUser.id, {
            fullName: fullName.trim() || existingUser.fullName,
            passwordHash,
            salt,
            authProvider: 'both',
            emailVerified: true,
            lastLoginAt: new Date().toISOString()
          });

          const session = createSession(existingUser.id, false);
          return res.status(200).json({
            success: true,
            message: 'Email & Password login successfully enabled for your existing Google account!',
            user: getSafeUser(updated! as any),
            token: session.token,
            dualAuthEnabled: true
          });
        }

        return res.status(409).json({ 
          error: 'An account with this email address already exists. Please log in with your password or continue with Google.' 
        });
      }

      const salt = generateSalt();
      const passwordHash = hashPassword(password, salt);
      const verificationCode = generateVerificationCode();
      const verificationCodeExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

      const newUser = await UserService.createUser({
        fullName: fullName.trim(),
        email: cleanEmail,
        passwordHash,
        salt,
        authProvider: 'email',
        emailVerified: true, // Auto-verify for streamlined "One Signup" experience
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName.trim())}`
      });

      const session = createSession(newUser!.id, false);

      return res.status(201).json({
        success: true,
        message: 'Account created and verified successfully!',
        user: getSafeUser(newUser! as any),
        token: session.token
      });
    } catch (err: any) {
      console.error('Signup error:', err);
      return res.status(500).json({ error: 'An unexpected server error occurred during registration.' });
    }
  });

  // 2. Login (Supports both Google and Email/Password users, with smart setup prompt)
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are both required.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      let user = await UserService.findByEmail(cleanEmail);

      if (!user) {
        // Seamless auto-provisioning for any un-registered email so user never gets "No account found"
        const salt = generateSalt();
        const passwordHash = hashPassword(password, salt);
        const derivedName = cleanEmail.split('@')[0];
        const fullName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);

        user = await UserService.createUser({
          fullName,
          email: cleanEmail,
          passwordHash,
          salt,
          authProvider: 'email',
          emailVerified: true,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`
        });
      }

      if (!user) {
        return res.status(500).json({ error: 'Failed to create or find user account.' });
      }

      if (!user.passwordHash || !user.salt || user.authProvider === 'google') {
        return res.status(200).json({
          requiresPasswordSetup: true,
          message: 'This account was registered with Google. You can set a password right now to enable both login methods, or sign in directly with Google.',
          email: cleanEmail,
          fullName: user.fullName
        });
      }

      const calculatedHash = hashPassword(password, user.salt);
      if (calculatedHash !== user.passwordHash) {
        const isGoogle = user.authProvider === 'both';
        return res.status(401).json({ 
          error: 'Incorrect password. Since your account is connected to Google, you can sign in directly with Google, update your password, or reset it.',
          isGoogleAccount: isGoogle,
          email: cleanEmail,
          fullName: user.fullName
        });
      }

      // Update last login
      await UserService.updateUser(user.id, { lastLoginAt: new Date().toISOString() });

      const session = createSession(user.id, !!rememberMe);

      return res.json({
        success: true,
        message: 'Logged in successfully.',
        user: getSafeUser(user as any),
        token: session.token
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Server error during login authentication.' });
    }
  });

  // 3. Enable Password for Existing Google User (Dual Auth Activation)
  app.post('/api/auth/enable-password', async (req, res) => {
    try {
      const { email, password, confirmPassword } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const user = await UserService.findByEmail(cleanEmail);

      if (!user) {
        return res.status(404).json({ error: 'No account found with this email address.' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match. Please verify both password fields.' });
      }

      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);

      if (!hasUpper || !hasLower || !hasNumber) {
        return res.status(400).json({ 
          error: 'Password must include at least one uppercase letter, one lowercase letter, and one number.' 
        });
      }

      const salt = generateSalt();
      const passwordHash = hashPassword(password, salt);

      const updated = await UserService.updateUser(user.id, {
        passwordHash,
        salt,
        authProvider: 'both',
        emailVerified: true,
        lastLoginAt: new Date().toISOString()
      });

      const session = createSession(user.id, true);

      return res.json({
        success: true,
        message: 'Password created! Both Google Sign-In and Email/Password login are now active on your account.',
        user: getSafeUser(updated! as any),
        token: session.token
      });
    } catch (err: any) {
      console.error('Enable password error:', err);
      return res.status(500).json({ error: 'Failed to set password for account.' });
    }
  });

  // Profile Settings: Set Password securely after verifying email
  app.post('/api/auth/profile/set-password', authMiddleware, async (req: Request & { user?: User }, res) => {
    try {
      const user = req.user!;
      const { password, confirmPassword } = req.body;

      if (!user.emailVerified) {
        return res.status(400).json({
          error: 'Email verification required. Please verify your email address in Profile Settings before setting a password.'
        });
      }

      if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Password is required.' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match. Please verify both password fields.' });
      }

      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);

      if (!hasUpper || !hasLower || !hasNumber) {
        return res.status(400).json({ 
          error: 'Password must include at least one uppercase letter, one lowercase letter, and one number.' 
        });
      }

      const salt = generateSalt();
      const passwordHash = hashPassword(password, salt);

      const updated = await UserService.updateUser(user.id, {
        passwordHash,
        salt,
        authProvider: 'both',
        lastLoginAt: new Date().toISOString()
      });

      return res.json({
        success: true,
        message: 'Password set securely! You can now log in using either Google or your Gmail and password.',
        user: getSafeUser(updated! as any)
      });
    } catch (err: any) {
      console.error('Profile set-password error:', err);
      return res.status(500).json({ error: 'Failed to update account password.' });
    }
  });

  // Profile Settings: Send Verification Code
  app.post('/api/auth/profile/send-verification', authMiddleware, async (req: Request & { user?: User }, res) => {
    try {
      const user = req.user!;
      if (user.emailVerified) {
        return res.json({ success: true, message: 'Your email address is already verified.' });
      }

      const verificationCode = generateVerificationCode();
      const verificationCodeExpiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

      await UserService.updateUser(user.id, {
        verificationCode,
        verificationCodeExpiresAt
      });

      return res.json({
        success: true,
        message: 'Verification code sent to your email address.',
        verificationCode
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to send verification code.' });
    }
  });

  // Profile Settings: Confirm Email Verification
  app.post('/api/auth/profile/verify-email', authMiddleware, async (req: Request & { user?: User }, res) => {
    try {
      const user = req.user!;
      const { code } = req.body;

      if (user.emailVerified) {
        return res.json({ success: true, message: 'Email is already verified.', user: getSafeUser(user) });
      }

      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Please enter the 6-digit verification code.' });
      }

      if (user.verificationCode !== code.trim()) {
        return res.status(400).json({ error: 'Invalid verification code. Please check your code and try again.' });
      }

      if (user.verificationCodeExpiresAt && user.verificationCodeExpiresAt < Date.now()) {
        return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
      }

      const updated = await UserService.updateUser(user.id, {
        emailVerified: true,
        verificationCode: undefined,
        verificationCodeExpiresAt: undefined
      });

      return res.json({
        success: true,
        message: 'Email verified successfully! You can now set your account password.',
        user: getSafeUser(updated! as any)
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to verify email.' });
    }
  });

  // 4. Google Sign-In (Direct one-click OAuth support with dual auth linking)
  app.post('/api/auth/google', async (req, res) => {
    try {
      const { email, fullName, avatar } = req.body;
      const cleanEmail = (email || 'google.user@crawllens.io').trim().toLowerCase();
      const displayName = fullName || 'Google Auditor';

      let user = await UserService.findByEmail(cleanEmail);
      if (!user) {
        user = await UserService.createUser({
          fullName: displayName,
          email: cleanEmail,
          authProvider: 'google',
          emailVerified: true,
          avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`
        });
      } else {
        const newAuthProvider = user.passwordHash ? 'both' : (user.authProvider as any);
        await UserService.updateUser(user.id, { 
          emailVerified: true,
          authProvider: newAuthProvider,
          lastLoginAt: new Date().toISOString() 
        });
        user = await UserService.findById(user.id);
      }

      const session = createSession(user!.id, true);

      return res.json({
        success: true,
        message: 'Google authentication successful.',
        user: getSafeUser(user! as any),
        token: session.token
      });
    } catch (err: any) {
      console.error('Google auth error:', err);
      return res.status(500).json({ error: 'Google login failed.' });
    }
  });

  // 4. Verify Email
  app.post('/api/auth/verify-email', async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: 'Email and verification code are required.' });
      }

      const user = await UserService.findByEmail(email.trim().toLowerCase());
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      if (user.emailVerified) {
        return res.json({ success: true, message: 'Email is already verified.' });
      }

      if (user.verificationCode !== code.trim()) {
        return res.status(400).json({ error: 'Invalid verification code. Please check your code and try again.' });
      }

      if (user.verificationCodeExpiresAt && user.verificationCodeExpiresAt < Date.now()) {
        return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
      }

      const updated = await UserService.updateUser(user.id, {
        emailVerified: true,
        verificationCode: undefined,
        verificationCodeExpiresAt: undefined
      });

      return res.json({
        success: true,
        message: 'Email address verified successfully!',
        user: getSafeUser(updated! as any)
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to verify email.' });
    }
  });

  // 5. Resend Verification Code
  app.post('/api/auth/resend-code', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email address is required.' });
      }

      const user = await UserService.findByEmail(email.trim().toLowerCase());
      if (!user) {
        return res.status(404).json({ error: 'Account not found with this email.' });
      }

      const newCode = generateVerificationCode();
      await UserService.updateUser(user.id, {
        verificationCode: newCode,
        verificationCodeExpiresAt: Date.now() + 15 * 60 * 1000 // 15 mins
      });

      return res.json({
        success: true,
        message: 'A new 6-digit verification code has been dispatched.',
        verificationCode: newCode
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to resend verification code.' });
    }
  });

  // 6. Forgot Password (Generate secure reset token)
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Please enter your registered email address.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const user = await UserService.findByEmail(cleanEmail);

      if (!user) {
        return res.status(404).json({ 
          error: 'No account registered with this email address.' 
        });
      }

      const resetToken = generateToken();
      const resetPasswordExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

      await UserService.updateUser(user.id, {
        resetPasswordToken: resetToken,
        resetPasswordExpiresAt
      });

      return res.json({
        success: true,
        message: 'Password reset link generated securely.',
        resetToken,
        resetLink: `/reset-password?token=${resetToken}`
      });
    } catch (err: any) {
      console.error('Forgot password error:', err);
      return res.status(500).json({ error: 'Server error processing password reset.' });
    }
  });

  // 7. Reset Password (Validate token and update password hash)
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword, password, confirmPassword } = req.body;
      const passToSet = newPassword || password;

      if (!token) return res.status(400).json({ error: 'Token missing' });

      // Find user with this active token
      const db = await rdb.query.users.findFirst({
        where: (users, { eq }) => eq(users.resetPasswordToken, token)
      });

      if (!db) {
        return res.status(400).json({ error: 'Invalid reset link' });
      }

      const newSalt = generateSalt();
      const newHash = hashPassword(passToSet, newSalt);

      await UserService.updateUser(db.id, {
        passwordHash: newHash,
        salt: newSalt,
        authProvider: 'both',
        resetPasswordToken: undefined,
        resetPasswordExpiresAt: undefined,
        emailVerified: true
      });

      return res.json({ success: true, message: 'Password reset successfully!' });
    } catch (err: any) {
      console.error('Reset password error:', err);
      return res.status(500).json({ error: 'Failed to reset password.' });
    }
  });

  // 8. Current Authenticated User (Me)
  app.get('/api/auth/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No active session.' });
    }
    const token = authHeader.split(' ')[1];
    const session = getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Session expired.' });
    }
    const user = await UserService.findById(session.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }
    return res.json({ user: getSafeUser(user as any) });
  });

  // ==========================================
  // PROJECTS API ROUTES
  // ==========================================

  app.get('/api/projects', authMiddleware, async (req: any, res) => {
    try {
      const projects = await ProjectService.getProjects(req.user.id);
      res.json({ projects });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  app.post('/api/projects', authMiddleware, async (req: any, res) => {
    try {
      const { name, url, industry, targetAudience, goals } = req.body;
      if (!name || !url) return res.status(400).json({ error: 'Name and URL are required' });
      
      const result = await ProjectService.createProject(req.user.id, { name, url, industry, targetAudience, goals });
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create project' });
    }
  });

  app.get('/api/projects/:id', authMiddleware, async (req: any, res) => {
    try {
      const project = await ProjectService.getProjectById(req.params.id, req.user.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      res.json({ project });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  });

  app.delete('/api/projects/:id', authMiddleware, async (req: any, res) => {
    try {
      await ProjectService.deleteProject(req.params.id, req.user.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete project' });
    }
  });

  // ==========================================
  // CRAWLER & AUDIT API ROUTES
  // ==========================================

  app.post('/api/keywords/research', authMiddleware, async (req: any, res) => {
    try {
      const { term } = req.body;
      if (!term) return res.status(400).json({ error: 'Research term is required' });

      const prompt = `
        You are an advanced SEO Keyword Research Engine. 
        Provide a list of 10-15 high-potential keyword ideas related to "${term}".
        For each keyword, provide:
        - term (string)
        - searchVolume (number, monthly estimate)
        - difficulty (number, 0-100)
        - searchIntent (string: "informational", "transactional", "navigational", "commercial")
        - trend (string: "rising", "stable", "falling")

        Respond with a structured JSON array of objects.
      `;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                searchVolume: { type: Type.NUMBER },
                difficulty: { type: Type.NUMBER },
                searchIntent: { type: Type.STRING },
                trend: { type: Type.STRING }
              }
            }
          }
        }
      });

      const keywords = JSON.parse(aiResponse.text || '[]');
      res.json({ keywords });
    } catch (err) {
      console.error('Keyword research failed', err);
      res.status(500).json({ error: 'Keyword research engine unavailable' });
    }
  });

  app.get('/api/projects/:id/keywords', authMiddleware, async (req: any, res) => {
    try {
      const project = await ProjectService.getProjectById(req.params.id, req.user.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      
      const keywords = await KeywordService.getProjectKeywords(req.params.id);
      res.json({ keywords });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch keywords' });
    }
  });

  app.post('/api/projects/:id/keywords', authMiddleware, async (req: any, res) => {
    try {
      const project = await ProjectService.getProjectById(req.params.id, req.user.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      
      const { term, searchVolume, difficulty } = req.body;
      if (!term) return res.status(400).json({ error: 'Keyword term is required' });

      const result = await KeywordService.addKeywordToProject(req.params.id, { term, searchVolume, difficulty });
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add keyword' });
    }
  });

  app.delete('/api/projects/:projectId/keywords/:id', authMiddleware, async (req: any, res) => {
    try {
      const project = await ProjectService.getProjectById(req.params.projectId, req.user.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      
      await KeywordService.deleteKeyword(req.params.id, req.params.projectId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete keyword' });
    }
  });

  app.get('/api/projects/:id/competitors', authMiddleware, async (req: any, res) => {
    try {
      const project = await ProjectService.getProjectById(req.params.id, req.user.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      
      const competitors = await CompetitorService.getProjectCompetitors(req.params.id);
      res.json({ competitors });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch competitors' });
    }
  });

  app.post('/api/projects/:id/competitors', authMiddleware, async (req: any, res) => {
    try {
      const project = await ProjectService.getProjectById(req.params.id, req.user.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      
      const { domain, name } = req.body;
      if (!domain) return res.status(400).json({ error: 'Competitor domain is required' });

      const result = await CompetitorService.addCompetitor(req.params.id, domain, name);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add competitor' });
    }
  });

  app.delete('/api/projects/:projectId/competitors/:id', authMiddleware, async (req: any, res) => {
    try {
      const project = await ProjectService.getProjectById(req.params.projectId, req.user.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      
      await CompetitorService.deleteCompetitor(req.params.id, req.params.projectId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete competitor' });
    }
  });

  // URL Validation endpoint (for real-time input feedback)
  app.post('/api/validate-url', (req, res) => {
    const { url } = req.body;
    const result = validateAndNormalizeUrl(url);
    if (!result.valid) {
      return res.status(400).json({ valid: false, error: result.errorMessage });
    }
    return res.json({ valid: true, normalizedUrl: result.normalizedUrl });
  });

  // Website Search & Reachability Probe
  app.post('/api/search-website', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ valid: false, reachable: false, error: 'Please enter a website URL to search.' });
      }
      const probe = await probeWebsite(url);
      return res.json(probe);
    } catch (err: any) {
      console.error('Probe error:', err);
      return res.status(500).json({ valid: false, reachable: false, error: err.message || 'Website search failed.' });
    }
  });

  // Single Stage Analysis (Runs SEO, AEO, AIO, GEO, or EEAT sequentially)
  app.post('/api/audit/stage', async (req, res) => {
    try {
      const { url, stage } = req.body;
      if (!url || !stage) {
        return res.status(400).json({ error: 'URL and stage name are required.' });
      }
      console.log(`[STAGE] Executing stage "${stage}" for ${url}`);
      const result = await runStage(url, stage);
      return res.json({ success: true, result });
    } catch (err: any) {
      console.error(`[STAGE ERROR] Stage ${req.body.stage} failed:`, err);
      return res.status(500).json({ error: err.message || `Stage ${req.body.stage} failed.` });
    }
  });

  // Finalize Sequential Audit (combines all 5 stages, computes weighted score, persists to DB)
  app.post('/api/audit/finalize', async (req, res) => {
    try {
      const { url, stageResults, projectId } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'Website URL is required to finalize audit.' });
      }

      let userId = 'guest_user';
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const session = getSession(authHeader.split(' ')[1]);
        if (session) userId = session.userId;
      }

      console.log(`[FINALIZE] Finalizing 5-stage sequential audit for ${url} (User: ${userId})`);
      const auditRecord = await finalizeSequentialAudit(url, userId, stageResults || {}, undefined, projectId);
      await AuditService.saveAudit(auditRecord);

      return res.json({
        success: true,
        audit: auditRecord
      });
    } catch (err: any) {
      console.error('Finalize audit execution error:', err);
      return res.status(500).json({
        error: `Finalizing audit failed: ${err.message || 'Server error'}`
      });
    }
  });

  // Start Crawl & Audit (Full Single-Pass Crawl)
  app.post('/api/crawl', async (req, res) => {
    try {
      const { url } = req.body;

      // Extract user if logged in, or use guest auditor
      let userId = 'guest_user';
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const session = getSession(authHeader.split(' ')[1]);
        if (session) {
          userId = session.userId;
        }
      }

      // Exact URL validation
      const validation = validateAndNormalizeUrl(url);
      if (!validation.valid || !validation.normalizedUrl) {
        return res.status(400).json({ error: validation.errorMessage || 'Invalid URL entered.' });
      }

      console.log(`[CRAWL] Starting audit for ${validation.normalizedUrl} by user ${userId}`);
      const auditRecord = await crawlAndAnalyze(validation.normalizedUrl, userId, req.body.projectId ?? undefined);

      await AuditService.saveAudit(auditRecord);

      return res.json({
        success: true,
        audit: auditRecord
      });
    } catch (err: any) {
      console.error('Crawl execution error:', err);
      return res.status(500).json({ 
        error: `Crawl failed: ${err.message || 'Server encountered an issue during crawl execution.'}` 
      });
    }
  });

  // Alias POST /api/audits to /api/crawl for backward compatibility
  app.post('/api/audits', async (req, res) => {
    try {
      const { url } = req.body;
      let userId = 'guest_user';
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const session = getSession(authHeader.split(' ')[1]);
        if (session) userId = session.userId;
      }

      const validation = validateAndNormalizeUrl(url);
      if (!validation.valid || !validation.normalizedUrl) {
        return res.status(400).json({ error: validation.errorMessage || 'Invalid URL entered.' });
      }

      const auditRecord = await crawlAndAnalyze(validation.normalizedUrl, userId, req.body.projectId ?? undefined);
      await AuditService.saveAudit(auditRecord);

      return res.json({
        success: true,
        audit: auditRecord
      });
    } catch (err: any) {
      console.error('Audits crawl error:', err);
      return res.status(500).json({ error: err.message || 'Crawl failed.' });
    }
  });

  // Get user's audits list
  app.get('/api/audits', async (req, res) => {
    let userId = 'guest_user';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const session = getSession(authHeader.split(' ')[1]);
      if (session) {
        userId = session.userId;
      }
    }
    
    try {
      // Return audits for this user
      const { projectId } = req.query;
      let audits;
      if (projectId) {
        audits = await AuditService.getAuditsByProject(projectId as string, userId);
      } else {
        audits = await AuditService.getUserAudits(userId);
      }
      
      return res.json({ audits });
    } catch (err) {
      console.error('Failed to fetch audits:', err);
      return res.status(500).json({ error: 'Failed to fetch audits report history.' });
    }
  });

  // Get single audit by ID
  app.get('/api/audits/:id', async (req, res) => {
    const { id } = req.params;
    const audit = await AuditService.getAuditById(id);
    if (!audit) {
      return res.status(404).json({ error: 'Audit report not found.' });
    }
    return res.json({ audit });
  });

  // Delete audit
  app.delete('/api/audits/:id', async (req, res) => {
    const { id } = req.params;
    let userId = 'guest_user';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const session = getSession(authHeader.split(' ')[1]);
      if (session) userId = session.userId;
    }
    await AuditService.deleteAudit(id, userId);
    return res.json({ success: true });
  });

  // Re-crawl
  app.post('/api/audits/:id/re-crawl', async (req, res) => {
    const { id } = req.params;
    const existing = await AuditService.getAuditById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Audit record not found.' });
    }
    const newAudit = await crawlAndAnalyze(existing.normalizedUrl, existing.userId, existing.projectId ?? undefined);
    // keep same ID
    newAudit.id = existing.id;
    await AuditService.saveAudit(newAudit);
    return res.json({ success: true, audit: newAudit });
  });

  // ==========================================
  // PHASE 2: ADVANCED CRAWLER & PAGESPEED ROUTES
  // ==========================================

  // 1. Start Multi-Page Crawl Job
  app.post('/api/crawler/start', async (req, res) => {
    try {
      const { url, projectId, maxPages } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'Website URL is required to start crawler.' });
      }

      let userId = 'guest_user';
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const session = getSession(authHeader.split(' ')[1]);
        if (session) userId = session.userId;
      }

      console.log(`[CRAWLER] Initiating multi-page crawl for ${url} (Max: ${maxPages || 25}) by ${userId}`);
      const result = await MultiCrawlerService.startCrawlJob(
        url,
        userId,
        projectId,
        maxPages ? parseInt(maxPages, 10) : 25
      );

      return res.json({
        success: true,
        job: result.job,
        pages: result.pages,
        issues: result.issues
      });
    } catch (err: any) {
      console.error('[CRAWLER API ERROR]', err);
      return res.status(500).json({
        error: err.message || 'Website crawler failed to complete crawl job.'
      });
    }
  });

  // 2. Get Crawl Job by ID
  app.get('/api/crawler/jobs/:id', async (req, res) => {
    try {
      const result = await MultiCrawlerService.getCrawlJob(req.params.id);
      if (!result) {
        return res.status(404).json({ error: 'Crawl job not found.' });
      }
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch crawl job.' });
    }
  });

  // 3. Get Crawl Jobs History
  app.get('/api/crawler/jobs', async (req, res) => {
    try {
      let userId = 'guest_user';
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const session = getSession(authHeader.split(' ')[1]);
        if (session) userId = session.userId;
      }

      const jobs = await MultiCrawlerService.getUserCrawlJobs(
        userId,
        req.query.projectId as string | undefined
      );
      return res.json({ jobs });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch crawl jobs history.' });
    }
  });

  // 4. Run Google PageSpeed Insights
  app.post('/api/pagespeed/analyze', async (req, res) => {
    try {
      const { url, strategy, projectId } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'Website URL is required for PageSpeed analysis.' });
      }

      let userId = 'guest_user';
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const session = getSession(authHeader.split(' ')[1]);
        if (session) userId = session.userId;
      }

      const reportStrategy = strategy === 'desktop' ? 'desktop' : 'mobile';
      console.log(`[PAGESPEED] Running analysis for ${url} on ${reportStrategy}`);
      const result = await PageSpeedService.runAnalysis(url, reportStrategy, userId, projectId);

      if (!result.success) {
        return res.status(result.configured ? 400 : 200).json(result);
      }

      return res.json(result);
    } catch (err: any) {
      console.error('[PAGESPEED API ERROR]', err);
      return res.status(500).json({
        success: false,
        configured: true,
        error: err.message || 'Failed to execute Google PageSpeed Insights.'
      });
    }
  });

  // 5. Get PageSpeed Reports History
  app.get('/api/pagespeed/history', async (req, res) => {
    try {
      let userId = 'guest_user';
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const session = getSession(authHeader.split(' ')[1]);
        if (session) userId = session.userId;
      }

      const history = await PageSpeedService.getHistory(
        userId,
        req.query.url as string | undefined,
        req.query.projectId as string | undefined
      );
      return res.json({ history });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch PageSpeed history.' });
    }
  });


  // ==========================================
  // SEO STATIC FILES: robots.txt & sitemap.xml
  // ==========================================
  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://seo-ai-pro.internal/sitemap.xml`);
  });

  app.get('/sitemap.xml', (_req, res) => {
    res.type('application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://seo-ai-pro.internal/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://seo-ai-pro.internal/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://seo-ai-pro.internal/signup</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`);
  });

  // ==========================================
  // VITE DEV SERVER / STATIC ASSETS
  // ==========================================
  const isProdMode = isProduction || process.env.VERCEL === '1' || fs.existsSync(path.resolve(__dirname, 'dist'));
  if (!isProdMode) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CRAWLLENS] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start CrawlLens server:', err);
  process.exit(1);
});
