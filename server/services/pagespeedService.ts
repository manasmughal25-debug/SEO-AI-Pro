import crypto from 'crypto';
import { db } from '../db/index.ts';
import { pagespeedReports } from '../db/schema.ts';
import { eq, desc, and } from 'drizzle-orm';
import { validateAndNormalizeUrl } from '../crawler.ts';

export interface PageSpeedAuditOpportunity {
  id: string;
  title: string;
  description: string;
  displayValue?: string;
  score?: number | null;
  savingsMs?: number;
  savingsBytes?: number;
}

export interface PageSpeedMetric {
  title: string;
  value: string;
  score: number; // 0 - 100
  rating: 'good' | 'needs-improvement' | 'poor';
}

export interface PageSpeedResult {
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
  cached?: boolean;
  createdAt: string;
}

export class PageSpeedService {
  /**
   * Run Google PageSpeed Insights API on a URL for 'mobile' or 'desktop'.
   */
  static async runAnalysis(
    targetUrl: string,
    strategy: 'mobile' | 'desktop' = 'mobile',
    userId: string = 'guest_user',
    projectId?: string
  ): Promise<{ success: boolean; data?: PageSpeedResult; error?: string; instructions?: string; configured: boolean }> {
    const validated = validateAndNormalizeUrl(targetUrl);
    if (!validated.valid || !validated.normalizedUrl) {
      return {
        success: false,
        configured: true,
        error: validated.errorMessage || 'Invalid URL provided.'
      };
    }

    const cleanUrl = validated.normalizedUrl;
    const apiKey = process.env.PAGESPEED_API_KEY || '';

    // Build PageSpeed URL
    const params = new URLSearchParams();
    params.set('url', cleanUrl);
    params.set('strategy', strategy);
    params.append('category', 'performance');
    params.append('category', 'accessibility');
    params.append('category', 'best-practices');
    params.append('category', 'seo');

    if (apiKey) {
      params.set('key', apiKey);
    }

    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`;

    try {
      console.log(`[PageSpeed] Requesting official Google PageSpeed Insights (${strategy}) for: ${cleanUrl}`);
      const res = await fetch(apiUrl, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(35000) // PageSpeed can take 10-25 seconds for cold runs
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.error?.message || `PageSpeed API error (HTTP ${res.status})`;

        // Check if error is related to quota or missing API key
        if (res.status === 429 || res.status === 403 || !apiKey) {
          return {
            success: false,
            configured: false,
            error: errMsg,
            instructions: 'Google PageSpeed Insights free unauthenticated quota reached or API key required. To enable unlimited audits, obtain a free PageSpeed Insights API key from Google Cloud Console and set PAGESPEED_API_KEY in your environment.'
          };
        }

        return {
          success: false,
          configured: true,
          error: errMsg
        };
      }

      const json = await res.json();
      const lr = json.lighthouseResult;
      if (!lr) {
        return {
          success: false,
          configured: true,
          error: 'No lighthouseResult payload returned by Google PageSpeed API.'
        };
      }

      // 1. Scores (0 - 100)
      const performanceScore = Math.round((lr.categories?.performance?.score ?? 0) * 100);
      const accessibilityScore = Math.round((lr.categories?.accessibility?.score ?? 0) * 100);
      const bestPracticesScore = Math.round((lr.categories?.['best-practices']?.score ?? 0) * 100);
      const seoScore = Math.round((lr.categories?.seo?.score ?? 0) * 100);

      // 2. Core Web Vitals
      const audits = lr.audits || {};

      const lcpAudit = audits['largest-contentful-paint'] || {};
      const clsAudit = audits['cumulative-layout-shift'] || {};
      const fcpAudit = audits['first-contentful-paint'] || {};
      const siAudit = audits['speed-index'] || {};
      const tbtAudit = audits['total-blocking-time'] || audits['interaction-to-next-paint'] || {};

      // Parse ratings according to Google thresholds
      const lcpMs = lcpAudit.numericValue || 0;
      const lcpRating: PageSpeedMetric['rating'] = lcpMs <= 2500 ? 'good' : lcpMs <= 4000 ? 'needs-improvement' : 'poor';

      const clsVal = clsAudit.numericValue || 0;
      const clsRating: PageSpeedMetric['rating'] = clsVal <= 0.1 ? 'good' : clsVal <= 0.25 ? 'needs-improvement' : 'poor';

      const fcpMs = fcpAudit.numericValue || 0;
      const fcpRating: PageSpeedMetric['rating'] = fcpMs <= 1800 ? 'good' : fcpMs <= 3000 ? 'needs-improvement' : 'poor';

      const tbtMs = tbtAudit.numericValue || 0;
      const tbtRating: PageSpeedMetric['rating'] = tbtMs <= 200 ? 'good' : tbtMs <= 600 ? 'needs-improvement' : 'poor';

      const siMs = siAudit.numericValue || 0;
      const siRating: PageSpeedMetric['rating'] = siMs <= 3400 ? 'good' : siMs <= 5800 ? 'needs-improvement' : 'poor';

      const metrics = {
        lcp: {
          title: 'Largest Contentful Paint (LCP)',
          value: lcpAudit.displayValue || `${(lcpMs / 1000).toFixed(1)} s`,
          score: Math.round((lcpAudit.score ?? 0) * 100),
          rating: lcpRating
        },
        inp: {
          title: 'Total Blocking Time (TBT / INP)',
          value: tbtAudit.displayValue || `${Math.round(tbtMs)} ms`,
          score: Math.round((tbtAudit.score ?? 0) * 100),
          rating: tbtRating
        },
        cls: {
          title: 'Cumulative Layout Shift (CLS)',
          value: clsAudit.displayValue || clsVal.toFixed(3),
          score: Math.round((clsAudit.score ?? 0) * 100),
          rating: clsRating
        },
        fcp: {
          title: 'First Contentful Paint (FCP)',
          value: fcpAudit.displayValue || `${(fcpMs / 1000).toFixed(1)} s`,
          score: Math.round((fcpAudit.score ?? 0) * 100),
          rating: fcpRating
        },
        speedIndex: {
          title: 'Speed Index (SI)',
          value: siAudit.displayValue || `${(siMs ? siMs / 1000 : 0).toFixed(1)} s`,
          score: Math.round((siAudit.score ?? 0) * 100),
          rating: siRating
        }
      };


      // 3. Opportunities (Lighthouse audits with potential savings)
      const opportunities: PageSpeedAuditOpportunity[] = [];
      const opportunityKeys = [
        'render-blocking-resources',
        'unused-css-rules',
        'unused-javascript',
        'modern-image-formats',
        'uses-optimized-images',
        'server-response-time',
        'offscreen-images',
        'unminified-css',
        'unminified-javascript',
        'uses-responsive-images',
        'uses-text-compression'
      ];

      for (const key of opportunityKeys) {
        const audit = audits[key];
        if (audit && (audit.score !== null && audit.score < 0.9)) {
          opportunities.push({
            id: key,
            title: audit.title,
            description: audit.description ? audit.description.split('[Learn more]')[0].trim() : '',
            displayValue: audit.displayValue,
            score: audit.score ? Math.round(audit.score * 100) : 0,
            savingsMs: audit.details?.overallSavingsMs,
            savingsBytes: audit.details?.overallSavingsBytes
          });
        }
      }

      // Sort opportunities by highest impact/savings
      opportunities.sort((a, b) => (b.savingsMs || 0) - (a.savingsMs || 0));

      // 4. Diagnostics
      const diagnostics: { title: string; displayValue?: string; description?: string }[] = [];
      const diagnosticKeys = [
        'total-byte-weight',
        'dom-size',
        'critical-request-chains',
        'mainthread-work-breakdown',
        'bootup-time',
        'font-display'
      ];

      for (const key of diagnosticKeys) {
        const audit = audits[key];
        if (audit && audit.score !== 1) {
          diagnostics.push({
            title: audit.title,
            displayValue: audit.displayValue,
            description: audit.description ? audit.description.split('[Learn more]')[0].trim() : ''
          });
        }
      }

      const reportId = `ps_${crypto.randomUUID()}`;
      const now = new Date().toISOString();

      // 5. Save to database
      try {
        await db.insert(pagespeedReports).values({
          id: reportId,
          userId: userId || 'guest_user',
          projectId: projectId || null,
          url: cleanUrl,
          strategy,
          performanceScore,
          accessibilityScore,
          bestPracticesScore,
          seoScore,
          lcp: metrics.lcp.value,
          inp: metrics.inp.value,
          cls: metrics.cls.value,
          fcp: metrics.fcp.value,
          speedIndex: metrics.speedIndex.value,
          opportunitiesJson: JSON.stringify(opportunities),
          diagnosticsJson: JSON.stringify(diagnostics),
          createdAt: now
        });
      } catch (dbErr) {
        console.warn('[PageSpeed] Failed to save report to DB:', dbErr);
      }

      return {
        success: true,
        configured: true,
        data: {
          id: reportId,
          url: cleanUrl,
          strategy,
          scores: {
            performance: performanceScore,
            accessibility: accessibilityScore,
            bestPractices: bestPracticesScore,
            seo: seoScore
          },
          metrics,
          opportunities,
          diagnostics,
          createdAt: now
        }
      };

    } catch (err: any) {
      console.error('[PageSpeed] Network or execution error:', err);
      const isTimeout = err.name === 'TimeoutError' || err.message?.includes('timeout');
      return {
        success: false,
        configured: true,
        error: isTimeout
          ? 'PageSpeed request timed out. Target website took too long to load or Google servers are busy.'
          : err.message || 'Failed to communicate with Google PageSpeed Insights.'
      };
    }
  }

  /**
   * Retrieves previous PageSpeed reports for a URL or user.
   */
  static async getHistory(userId: string, url?: string, projectId?: string) {
    if (url) {
      const records = await db.query.pagespeedReports.findMany({
        where: (r, { eq, and }) => and(eq(r.url, url), eq(r.userId, userId)),
        orderBy: (r, { desc }) => [desc(r.createdAt)],
        limit: 10
      });
      return records;
    }

    if (projectId) {
      const records = await db.query.pagespeedReports.findMany({
        where: (r, { eq, and }) => and(eq(r.projectId, projectId), eq(r.userId, userId)),
        orderBy: (r, { desc }) => [desc(r.createdAt)],
        limit: 15
      });
      return records;
    }

    return await db.query.pagespeedReports.findMany({
      where: (r, { eq }) => eq(r.userId, userId),
      orderBy: (r, { desc }) => [desc(r.createdAt)],
      limit: 15
    });
  }
}
