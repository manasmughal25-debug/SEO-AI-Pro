import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { db } from '../db/index.ts';
import { crawlJobs, crawledPages, technicalIssues } from '../db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { validateAndNormalizeUrl } from '../crawler.ts';

export interface CrawlJobResult {
  job: typeof crawlJobs.$inferSelect;
  pages: (typeof crawledPages.$inferSelect)[];
  issues: (typeof technicalIssues.$inferSelect)[];
}

// SSRF Protection: Deny private, loopback, and local address ranges
function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    return true;
  }

  // IPv4 private ranges (RFC 1918 & link-local)
  const ipParts = host.split('.').map(p => parseInt(p, 10));
  if (ipParts.length === 4 && ipParts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
    // 10.0.0.0/8
    if (ipParts[0] === 10) return true;
    // 172.16.0.0/12 (172.16.0.0 – 172.31.255.255)
    if (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) return true;
    // 192.168.0.0/16
    if (ipParts[0] === 192 && ipParts[1] === 168) return true;
    // 127.0.0.0/8
    if (ipParts[0] === 127) return true;
    // 169.254.0.0/16 (link-local, cloud metadata)
    if (ipParts[0] === 169 && ipParts[1] === 254) return true;
    // 0.0.0.0/8
    if (ipParts[0] === 0) return true;
  }

  return false;
}

// Clean and normalize internal URL for crawler queue
function normalizeCrawlerUrl(rawUrl: string, baseUrl: URL): string | null {
  try {
    const parsed = new URL(rawUrl, baseUrl.origin);
    // Ignore non-http(s) protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;

    // Only allow URLs on the same hostname or its direct subdomains
    if (parsed.hostname !== baseUrl.hostname) {
      return null;
    }

    // Strip fragment/hash and unnecessary tracking parameters
    parsed.hash = '';
    const ignoreParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    for (const p of ignoreParams) {
      parsed.searchParams.delete(p);
    }

    // Filter out common non-HTML static file assets
    const pathname = parsed.pathname.toLowerCase();
    const staticExtensions = [
      '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
      '.css', '.js', '.mjs', '.map', '.woff', '.woff2', '.ttf', '.eot',
      '.pdf', '.zip', '.tar', '.gz', '.mp3', '.mp4', '.avi', '.mov', '.webm',
      '.json', '.xml', '.csv', '.doc', '.docx', '.xls', '.xlsx'
    ];
    if (staticExtensions.some(ext => pathname.endsWith(ext))) {
      return null;
    }

    // Normalize trailing slash consistency
    let href = parsed.toString();
    if (href.endsWith('/') && parsed.pathname !== '/') {
      href = href.slice(0, -1);
    }
    return href;
  } catch {
    return null;
  }
}

export class MultiCrawlerService {
  /**
   * Starts and runs a multi-page crawler job.
   */
  static async startCrawlJob(
    targetUrl: string,
    userId: string,
    projectId?: string,
    maxPages: number = 25
  ): Promise<CrawlJobResult> {
    const validated = validateAndNormalizeUrl(targetUrl);
    if (!validated.valid || !validated.normalizedUrl) {
      throw new Error(validated.errorMessage || 'Invalid URL provided for website crawler.');
    }

    const startUrl = validated.normalizedUrl;
    const baseUri = new URL(startUrl);

    if (isPrivateHost(baseUri.hostname)) {
      throw new Error('Access denied: Cannot crawl private, loopback, or internal IP addresses.');
    }

    const jobId = `crawl_${crypto.randomUUID()}`;
    const domain = baseUri.hostname;
    const clampedMaxPages = Math.min(Math.max(maxPages, 5), 50);

    // Initial Job Record
    await db.insert(crawlJobs).values({
      id: jobId,
      userId: userId || 'guest_user',
      projectId: projectId || null,
      url: startUrl,
      domain,
      status: 'running',
      maxPages: clampedMaxPages,
      discoveredCount: 1,
      crawledCount: 0,
      errorCount: 0,
      redirectCount: 0,
      technicalScore: 100,
      startedAt: new Date().toISOString(),
    });

    try {
      // 1. Fetch robots.txt & sitemap.xml
      let hasRobotsTxt = false;
      let hasSitemap = false;
      const sitemapUrls: string[] = [];
      const disallowedPrefixes: string[] = [];

      try {
        const robotsRes = await fetch(`${baseUri.origin}/robots.txt`, {
          headers: { 'User-Agent': 'SEO-AI-PRO-Bot/2.0 (+https://seo-ai-pro.internal)' },
          signal: AbortSignal.timeout(4000)
        });
        if (robotsRes.ok) {
          hasRobotsTxt = true;
          const robotsTxt = await robotsRes.text();
          const lines = robotsTxt.split(/\r?\n/);
          let currentUserAgentMatch = false;

          for (const line of lines) {
            const clean = line.trim();
            if (clean.toLowerCase().startsWith('user-agent:')) {
              const ua = clean.substring(11).trim().toLowerCase();
              currentUserAgentMatch = ua === '*' || ua.includes('seo') || ua.includes('bot');
            } else if (currentUserAgentMatch && clean.toLowerCase().startsWith('disallow:')) {
              const rule = clean.substring(9).trim();
              if (rule && rule !== '/') disallowedPrefixes.push(rule);
            } else if (clean.toLowerCase().startsWith('sitemap:')) {
              const sitemapLoc = clean.substring(8).trim();
              if (sitemapLoc) sitemapUrls.push(sitemapLoc);
            }
          }
        }
      } catch {
        // robots.txt probe failed silently
      }

      // Check sitemap.xml
      if (sitemapUrls.length === 0) {
        sitemapUrls.push(`${baseUri.origin}/sitemap.xml`);
      }

      for (const smUrl of sitemapUrls.slice(0, 2)) {
        try {
          const smRes = await fetch(smUrl, {
            headers: { 'User-Agent': 'SEO-AI-PRO-Bot/2.0' },
            signal: AbortSignal.timeout(4000)
          });
          if (smRes.ok) {
            hasSitemap = true;
            const smXml = await smRes.text();
            const locMatches = smXml.match(/<loc>(https?:\/\/[^<]+)<\/loc>/gi);
            if (locMatches) {
              for (const loc of locMatches.slice(0, 30)) {
                const cleaned = loc.replace(/<\/?loc>/gi, '').trim();
                const norm = normalizeCrawlerUrl(cleaned, baseUri);
                if (norm && !sitemapUrls.includes(norm)) {
                  sitemapUrls.push(norm);
                }
              }
            }
          }
        } catch {
          // Sitemap read failed silently
        }
      }

      // 2. Crawler State Initialization
      const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }];
      const visited = new Set<string>();
      const discovered = new Set<string>([startUrl]);
      const inlinks = new Map<string, Set<string>>(); // target -> Set of source URLs

      // Seed queue with sitemap URLs (up to 15)
      for (const smUrl of sitemapUrls) {
        if (!discovered.has(smUrl) && discovered.size < clampedMaxPages * 2) {
          discovered.add(smUrl);
          if (queue.length < clampedMaxPages) {
            queue.push({ url: smUrl, depth: 1 });
          }
        }
      }

      interface PageData {
        url: string;
        httpStatus: number;
        responseTimeMs: number;
        title: string;
        metaDescription: string;
        h1: string;
        canonicalUrl: string;
        isIndexable: boolean;
        depth: number;
        inlinksCount: number;
        outlinksCount: number;
        imagesCount: number;
        missingAltCount: number;
        issues: {
          category: string;
          severity: 'critical' | 'high' | 'medium' | 'low';
          title: string;
          description: string;
          impact: string;
          recommendation: string;
          codeSnippet?: string;
        }[];
      }

      const crawledPagesList: PageData[] = [];
      let redirectCount = 0;
      let errorCount = 0;

      // 3. Multi-page BFS crawling loop
      while (queue.length > 0 && crawledPagesList.length < clampedMaxPages) {
        const current = queue.shift()!;
        if (visited.has(current.url)) continue;
        visited.add(current.url);

        // Check if disallowed by robots.txt
        const parsedCurrent = new URL(current.url);
        const isDisallowed = disallowedPrefixes.some(prefix => parsedCurrent.pathname.startsWith(prefix));
        if (isDisallowed) {
          crawledPagesList.push({
            url: current.url,
            httpStatus: 403,
            responseTimeMs: 0,
            title: '',
            metaDescription: '',
            h1: '',
            canonicalUrl: '',
            isIndexable: false,
            depth: current.depth,
            inlinksCount: inlinks.get(current.url)?.size || 0,
            outlinksCount: 0,
            imagesCount: 0,
            missingAltCount: 0,
            issues: [{
              category: 'Indexability & Crawlability',
              severity: 'high',
              title: 'Page Blocked by robots.txt',
              description: `This page matches a Disallow directive in your robots.txt file (${parsedCurrent.pathname}).`,
              impact: 'Search engine crawlers will refuse to scan this page or render its content.',
              recommendation: 'If this page is intended for organic indexing, remove the disallow pattern from robots.txt.',
              codeSnippet: `User-agent: *\nDisallow: ${parsedCurrent.pathname}`
            }]
          });
          continue;
        }

        const startTime = Date.now();
        let responseStatus = 0;
        let responseTimeMs = 0;
        let finalUrl = current.url;

        try {
          const response = await fetch(current.url, {
            headers: {
              'User-Agent': 'SEO-AI-PRO-Bot/2.0 (+https://seo-ai-pro.internal; Website Architecture Auditor)',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5'
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(6500)
          });

          responseStatus = response.status;
          responseTimeMs = Date.now() - startTime;
          finalUrl = response.url;

          if (finalUrl !== current.url) {
            redirectCount++;
          }

          if (!response.ok) {
            errorCount++;
            const is404 = responseStatus === 404;
            const is500 = responseStatus >= 500;
            crawledPagesList.push({
              url: current.url,
              httpStatus: responseStatus,
              responseTimeMs,
              title: '',
              metaDescription: '',
              h1: '',
              canonicalUrl: '',
              isIndexable: false,
              depth: current.depth,
              inlinksCount: inlinks.get(current.url)?.size || 0,
              outlinksCount: 0,
              imagesCount: 0,
              missingAltCount: 0,
              issues: [{
                category: 'Links & Navigation',
                severity: is404 ? 'critical' : is500 ? 'critical' : 'high',
                title: is404 ? 'Broken Internal Link (404 Not Found)' : `Server Error (HTTP ${responseStatus})`,
                description: `Page returned HTTP error status ${responseStatus} when fetched by crawler.`,
                impact: 'Causes crawl budget waste, degrades user experience, and damages domain equity flow.',
                recommendation: is404 
                  ? 'Update or remove links pointing to this broken page, or create a 301 redirect to relevant active content.' 
                  : 'Check web server and backend logs to resolve application exceptions.'
              }]
            });
            continue;
          }

          const html = await response.text();
          const $ = cheerio.load(html);

          // Extract Head Information
          const title = $('title').first().text().trim();
          const metaDescription = $('meta[name="description"]').attr('content')?.trim() || '';
          const canonical = $('link[rel="canonical"]').attr('href')?.trim() || '';
          const metaRobots = ($('meta[name="robots"]').attr('content') || '').toLowerCase();
          const isNoindex = metaRobots.includes('noindex');

          // Extract Headings
          const h1s = $('h1').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 0);
          const firstH1 = h1s[0] || '';

          // Extract Images
          const images = $('img');
          const imagesCount = images.length;
          let missingAltCount = 0;
          images.each((_, img) => {
            const alt = $(img).attr('alt');
            if (alt === undefined || alt.trim() === '') {
              missingAltCount++;
            }
          });

          // Extract Links
          let internalLinksCount = 0;
          let externalLinksCount = 0;

          $('a[href]').each((_, el) => {
            const rawHref = $(el).attr('href');
            if (!rawHref) return;

            const normalized = normalizeCrawlerUrl(rawHref, baseUri);
            if (normalized) {
              internalLinksCount++;
              discovered.add(normalized);

              // Track inlink
              if (!inlinks.has(normalized)) inlinks.set(normalized, new Set());
              inlinks.get(normalized)!.add(current.url);

              // Enqueue if unvisited and within limits
              if (!visited.has(normalized) && queue.every(q => q.url !== normalized) && current.depth < 4) {
                queue.push({ url: normalized, depth: current.depth + 1 });
              }
            } else if (/^https?:\/\//i.test(rawHref)) {
              externalLinksCount++;
            }
          });

          // Page-level issue detection
          const pageIssues: PageData['issues'] = [];

          // 1. Title Checks
          if (!title) {
            pageIssues.push({
              category: 'Meta Tags & Titles',
              severity: 'critical',
              title: 'Missing Page Title Tag',
              description: 'The <title> tag is completely missing from this page header.',
              impact: 'Search engines require titles for indexing and search snippet rendering.',
              recommendation: 'Add a descriptive title tag between 50-60 characters incorporating primary topical keywords.',
              codeSnippet: '<title>Primary Keyword - Brand Name</title>'
            });
          } else if (title.length < 30) {
            pageIssues.push({
              category: 'Meta Tags & Titles',
              severity: 'medium',
              title: 'Page Title Too Short',
              description: `Title tag has only ${title.length} characters (Recommended: 45-60 characters).`,
              impact: 'Short titles under-utilize SERP real estate and reduce organic click-through rates.',
              recommendation: 'Expand title with secondary semantic keywords or your brand suffix.'
            });
          } else if (title.length > 65) {
            pageIssues.push({
              category: 'Meta Tags & Titles',
              severity: 'low',
              title: 'Page Title Truncation Risk',
              description: `Title has ${title.length} characters and may be truncated on search result viewports.`,
              impact: 'Long titles may have ending terms replaced by an ellipsis (...) on Google SERPs.',
              recommendation: 'Shorten title to under 60 characters or front-load important keywords.'
            });
          }

          // 2. Meta Description Checks
          if (!metaDescription) {
            pageIssues.push({
              category: 'Meta Tags & Titles',
              severity: 'high',
              title: 'Missing Meta Description',
              description: 'No meta description tag was found in the page <head>.',
              impact: 'Search engines will generate arbitrary text snippets, hurting organic CTR.',
              recommendation: 'Write an engaging meta description between 120-160 characters summarizing the page value.',
              codeSnippet: '<meta name="description" content="Engaging summary of page contents...">'
            });
          } else if (metaDescription.length < 70) {
            pageIssues.push({
              category: 'Meta Tags & Titles',
              severity: 'low',
              title: 'Short Meta Description',
              description: `Meta description is only ${metaDescription.length} characters (Optimal: 120-155 characters).`,
              impact: 'Short descriptions may fail to attract clicks against comprehensive competitor snippets.',
              recommendation: 'Expand description to clearly communicate page benefits and a call-to-action.'
            });
          }

          // 3. Headings Checks
          if (h1s.length === 0) {
            pageIssues.push({
              category: 'Heading Architecture',
              severity: 'high',
              title: 'Missing Primary <h1> Heading',
              description: 'The page lacks an <h1> tag to identify the core topic.',
              impact: 'H1 tags provide crucial topical signals for crawlers and assistive screen readers.',
              recommendation: 'Add exactly one <h1> tag near the top of the body content.',
              codeSnippet: '<h1>Primary Subject of Page</h1>'
            });
          } else if (h1s.length > 1) {
            pageIssues.push({
              category: 'Heading Architecture',
              severity: 'medium',
              title: `Multiple <h1> Headings Detected (${h1s.length})`,
              description: `Found ${h1s.length} separate <h1> tags on a single page.`,
              impact: 'Dilutes topical focus and can confuse accessibility parsers.',
              recommendation: 'Use one <h1> per page and structure sub-topics using <h2> and <h3>.'
            });
          }

          // 4. Canonical Checks
          if (!canonical) {
            pageIssues.push({
              category: 'Canonicalization & Duplication',
              severity: 'medium',
              title: 'Missing Canonical Tag',
              description: 'No <link rel="canonical"> tag was specified on this page.',
              impact: 'Leaves the page vulnerable to duplicate content dilution if accessed via parameter variants.',
              recommendation: 'Add a self-referencing canonical tag pointing to the authoritative URL.',
              codeSnippet: `<link rel="canonical" href="${current.url}" />`
            });
          }

          // 5. Image Alt Attributes
          if (missingAltCount > 0) {
            pageIssues.push({
              category: 'Media & Performance',
              severity: missingAltCount > 3 ? 'high' : 'medium',
              title: `${missingAltCount} Image(s) Missing Alt Attributes`,
              description: `${missingAltCount} out of ${imagesCount} images on this page lack an alt attribute.`,
              impact: 'Harmful for accessibility (WCAG) and prevents images from indexing in Google Image Search.',
              recommendation: 'Provide meaningful descriptive alt text for all content images, or alt="" for decorative images.',
              codeSnippet: '<img src="example.jpg" alt="Detailed description of image subject" />'
            });
          }

          // 6. Slow Response Time
          if (responseTimeMs > 2000) {
            pageIssues.push({
              category: 'Media & Performance',
              severity: 'medium',
              title: 'Slow Server Response Time (>2000ms)',
              description: `HTML document took ${responseTimeMs}ms to respond.`,
              impact: 'Slow TTFB (Time to First Byte) reduces crawl capacity and hurts Core Web Vitals rankings.',
              recommendation: 'Implement server-side caching, edge CDN, or optimize database queries.'
            });
          }

          // 7. Noindex Tag
          if (isNoindex) {
            pageIssues.push({
              category: 'Indexability & Crawlability',
              severity: 'high',
              title: 'Page Marked as "noindex"',
              description: 'This page has a <meta name="robots" content="noindex"> tag preventing organic indexing.',
              impact: 'Google and other search engines will omit this page from search results.',
              recommendation: 'If this page should rank on search engines, remove "noindex" from the robots tag.'
            });
          }

          crawledPagesList.push({
            url: current.url,
            httpStatus: responseStatus,
            responseTimeMs,
            title,
            metaDescription,
            h1: firstH1,
            canonicalUrl: canonical,
            isIndexable: !isNoindex,
            depth: current.depth,
            inlinksCount: inlinks.get(current.url)?.size || 0,
            outlinksCount: internalLinksCount + externalLinksCount,
            imagesCount,
            missingAltCount,
            issues: pageIssues
          });
        } catch (fetchErr: any) {
          errorCount++;
          crawledPagesList.push({
            url: current.url,
            httpStatus: 0,
            responseTimeMs: Date.now() - startTime,
            title: '',
            metaDescription: '',
            h1: '',
            canonicalUrl: '',
            isIndexable: false,
            depth: current.depth,
            inlinksCount: inlinks.get(current.url)?.size || 0,
            outlinksCount: 0,
            imagesCount: 0,
            missingAltCount: 0,
            issues: [{
              category: 'Indexability & Crawlability',
              severity: 'high',
              title: 'Page Fetch Failed / Timeout',
              description: `Could not retrieve page: ${fetchErr.message || 'Network timeout or unreachable host.'}`,
              impact: 'Page is completely unreachable by web crawlers.',
              recommendation: 'Verify DNS, SSL certificates, firewall rules, and hosting availability.'
            }]
          });
        }
      }

      // 4. Cross-page duplicate detection
      const titleMap = new Map<string, string[]>();
      const descMap = new Map<string, string[]>();

      for (const page of crawledPagesList) {
        if (page.title) {
          const normTitle = page.title.toLowerCase().trim();
          if (!titleMap.has(normTitle)) titleMap.set(normTitle, []);
          titleMap.get(normTitle)!.push(page.url);
        }
        if (page.metaDescription) {
          const normDesc = page.metaDescription.toLowerCase().trim();
          if (!descMap.has(normDesc)) descMap.set(normDesc, []);
          descMap.get(normDesc)!.push(page.url);
        }
      }

      // Flag duplicate titles
      for (const [titleText, urls] of titleMap.entries()) {
        if (urls.length > 1) {
          for (const u of urls) {
            const page = crawledPagesList.find(p => p.url === u);
            if (page) {
              page.issues.push({
                category: 'Canonicalization & Duplication',
                severity: 'high',
                title: `Duplicate Page Title (Shared by ${urls.length} pages)`,
                description: `This title ("${titleText.slice(0, 40)}...") is identical across ${urls.length} separate pages.`,
                impact: 'Creates keyword cannibalization and prevents search engines from distinguishing unique content.',
                recommendation: 'Assign unique, specific page titles that distinguish each individual URL.'
              });
            }
          }
        }
      }

      // Flag duplicate meta descriptions
      for (const [descText, urls] of descMap.entries()) {
        if (urls.length > 1) {
          for (const u of urls) {
            const page = crawledPagesList.find(p => p.url === u);
            if (page) {
              page.issues.push({
                category: 'Canonicalization & Duplication',
                severity: 'medium',
                title: `Duplicate Meta Description (Shared by ${urls.length} pages)`,
                description: `This meta description is shared across ${urls.length} crawled pages.`,
                impact: 'Search engines penalize repetitive snippets or substitute generic page text.',
                recommendation: 'Craft unique meta descriptions tailored to each page\'s specific topic.'
              });
            }
          }
        }
      }

      // 5. Aggregate Technical Score & Severity Counts
      let criticalCount = 0;
      let highCount = 0;
      let mediumCount = 0;
      let lowCount = 0;

      const flatIssues: {
        id: string;
        crawlJobId: string;
        pageUrl: string;
        category: string;
        severity: 'critical' | 'high' | 'medium' | 'low';
        title: string;
        description: string;
        impact: string;
        recommendation: string;
        codeSnippet?: string;
      }[] = [];

      for (const page of crawledPagesList) {
        for (const issue of page.issues) {
          if (issue.severity === 'critical') criticalCount++;
          else if (issue.severity === 'high') highCount++;
          else if (issue.severity === 'medium') mediumCount++;
          else if (issue.severity === 'low') lowCount++;

          flatIssues.push({
            id: `tech_${crypto.randomUUID()}`,
            crawlJobId: jobId,
            pageUrl: page.url,
            category: issue.category,
            severity: issue.severity,
            title: issue.title,
            description: issue.description,
            impact: issue.impact,
            recommendation: issue.recommendation,
            codeSnippet: issue.codeSnippet
          });
        }
      }

      // Score computation: base 100 with capped penalties
      let penalty = 0;
      penalty += Math.min(criticalCount * 12, 40);
      penalty += Math.min(highCount * 6, 30);
      penalty += Math.min(mediumCount * 3, 20);
      penalty += Math.min(lowCount * 1, 10);
      const technicalScore = Math.max(15, 100 - penalty);

      // 6. Save Crawled Pages to Database
      for (const page of crawledPagesList) {
        await db.insert(crawledPages).values({
          id: `page_${crypto.randomUUID()}`,
          crawlJobId: jobId,
          url: page.url,
          httpStatus: page.httpStatus,
          responseTimeMs: page.responseTimeMs,
          title: page.title || null,
          metaDescription: page.metaDescription || null,
          h1: page.h1 || null,
          canonicalUrl: page.canonicalUrl || null,
          isIndexable: page.isIndexable,
          depth: page.depth,
          inlinksCount: page.inlinksCount,
          outlinksCount: page.outlinksCount,
          imagesCount: page.imagesCount,
          missingAltCount: page.missingAltCount,
          issuesCount: page.issues.length,
          crawledAt: new Date().toISOString()
        });
      }

      // 7. Save Technical Issues to Database
      for (const issue of flatIssues) {
        await db.insert(technicalIssues).values({
          id: issue.id,
          crawlJobId: issue.crawlJobId,
          pageUrl: issue.pageUrl,
          category: issue.category,
          severity: issue.severity,
          title: issue.title,
          description: issue.description,
          impact: issue.impact,
          recommendation: issue.recommendation,
          codeSnippet: issue.codeSnippet || null,
          createdAt: new Date().toISOString()
        });
      }

      // 8. Update Crawl Job record
      await db.update(crawlJobs)
        .set({
          status: 'completed',
          discoveredCount: discovered.size,
          crawledCount: crawledPagesList.length,
          errorCount,
          redirectCount,
          technicalScore,
          criticalCount,
          highCount,
          mediumCount,
          lowCount,
          hasRobotsTxt,
          hasSitemap,
          completedAt: new Date().toISOString()
        })
        .where(eq(crawlJobs.id, jobId));

      // Return fully populated job result
      return await MultiCrawlerService.getCrawlJob(jobId) as CrawlJobResult;

    } catch (err: any) {
      console.error('[MultiCrawlerService] Fatal crawl error:', err);
      await db.update(crawlJobs)
        .set({
          status: 'failed',
          errorMessage: err.message || 'Crawler encountered an unexpected error.',
          completedAt: new Date().toISOString()
        })
        .where(eq(crawlJobs.id, jobId));

      throw err;
    }
  }

  /**
   * Retrieves a completed or in-progress crawl job by ID with pages and issues.
   */
  static async getCrawlJob(jobId: string): Promise<CrawlJobResult | null> {
    const job = await db.query.crawlJobs.findFirst({
      where: (jobs, { eq }) => eq(jobs.id, jobId)
    });

    if (!job) return null;

    const pages = await db.query.crawledPages.findMany({
      where: (p, { eq }) => eq(p.crawlJobId, jobId)
    });

    const issues = await db.query.technicalIssues.findMany({
      where: (i, { eq }) => eq(i.crawlJobId, jobId)
    });

    return { job, pages, issues };
  }

  /**
   * Retrieves all crawl jobs for a user or project.
   */
  static async getUserCrawlJobs(userId: string, projectId?: string) {
    if (projectId) {
      return await db.query.crawlJobs.findMany({
        where: (jobs, { eq, and }) => and(eq(jobs.projectId, projectId), eq(jobs.userId, userId)),
        orderBy: (jobs, { desc }) => [desc(jobs.startedAt)],
        limit: 20
      });
    }

    return await db.query.crawlJobs.findMany({
      where: (jobs, { eq }) => eq(jobs.userId, userId),
      orderBy: (jobs, { desc }) => [desc(jobs.startedAt)],
      limit: 20
    });
  }
}
