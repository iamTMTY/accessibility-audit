/**
 * Accessibility Audit Engine (Server-Side)
 * Runs WCAG checks using axe-core and jsdom
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

/**
 * Clean axe-core failureSummary into a concise, human-readable message.
 * Strips prefixes like "Fix any of the following:\n" and trims whitespace.
 */
function cleanFailureSummary(raw) {
  if (!raw) return null;
  // Remove the "Fix any/all of the following:" prefix lines
  let cleaned = raw.replace(/^Fix (?:any|all) of the following:\s*/i, '').trim();
  // If multiple lines remain, take only the first substantive line
  const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);
  return lines[0] || cleaned;
}

/**
 * Generate a specific, actionable fix suggestion based on the violation and node data.
 */
function generateFixSuggestion(violation, node, contrastDetails) {
  const ruleId = violation.id;

  if (ruleId === 'color-contrast' && contrastDetails) {
    const textType = contrastDetails.isLargeText ? 'large text' : 'normal text';
    return `Increase contrast between text (${contrastDetails.color}) and background (${contrastDetails.bgColor}). Current ratio is ${contrastDetails.ratio?.toFixed(2)}:1 but ${textType} requires at least ${contrastDetails.requiredRatio}:1. Darken the text or lighten the background.`;
  }

  if (ruleId === 'image-alt') {
    return 'Add a descriptive alt attribute to this image, or set alt="" if it is purely decorative.';
  }
  if (ruleId === 'label') {
    return 'Associate a visible <label> with this form control using the "for" attribute, or add an aria-label/aria-labelledby attribute.';
  }
  if (ruleId === 'button-name') {
    return 'Add text content, an aria-label, or an aria-labelledby attribute so the button has an accessible name.';
  }
  if (ruleId === 'link-name') {
    return 'Ensure this link has visible text, an aria-label, or an aria-labelledby attribute that describes its destination.';
  }
  if (ruleId === 'html-has-lang') {
    return 'Add a lang attribute to the <html> element (e.g., <html lang="en">).';
  }
  if (ruleId === 'document-title') {
    return 'Add a descriptive <title> element inside <head>.';
  }
  if (ruleId === 'duplicate-id' || ruleId === 'duplicate-id-active' || ruleId === 'duplicate-id-aria') {
    return 'Ensure every id attribute value on the page is unique.';
  }
  if (ruleId === 'heading-order') {
    return 'Restructure headings so they increase by one level at a time (e.g., h1 then h2, not h1 then h3).';
  }
  if (ruleId === 'list' || ruleId === 'listitem') {
    return 'Ensure list items (<li>) are direct children of <ul>, <ol>, or <menu> elements.';
  }
  if (ruleId === 'tabindex') {
    return 'Avoid tabindex values greater than 0. Use tabindex="0" or tabindex="-1" instead.';
  }

  // Fallback: use axe-core's help text
  return violation.help;
}

/**
 * Generate a refined human-readable message for contrast issues with full context.
 */
function generateContrastMessage(contrastDetails) {
  if (!contrastDetails) return null;
  const { color, bgColor, ratio, requiredRatio, isLargeText, fontSize, fontWeight } = contrastDetails;
  const textType = isLargeText ? 'large' : 'normal';
  let msg = `Insufficient contrast: ${color} on ${bgColor} has ratio ${ratio?.toFixed(2)}:1 (requires ${requiredRatio}:1 for ${textType} text)`;
  if (fontSize) {
    msg += `. Font: ${fontSize}`;
    if (fontWeight) msg += `, weight ${fontWeight}`;
  }
  return msg;
}

// Map axe-core tags to our app's visual categories
function mapAxeTagsToCategory(tags) {
  if (tags.includes('cat.images') || tags.includes('cat.text-alternatives')) return 'images';
  if (tags.includes('cat.structure')) return 'structure';
  if (tags.includes('cat.keyboard') || tags.includes('cat.keyboard-focus')) return 'keyboard';
  if (tags.includes('cat.name-role-value') || tags.includes('cat.aria')) return 'aria';
  if (tags.includes('cat.forms')) return 'forms';
  if (tags.includes('cat.color')) return 'color';
  if (tags.includes('cat.language')) return 'language';
  if (tags.includes('cat.parsing') || tags.includes('cat.parsing-and-markup')) return 'markup';
  if (tags.includes('cat.semantics')) return 'structure';
  if (tags.includes('cat.time-and-media')) return 'markup';
  return 'default';
}

function mapAxeTagsToLevel(tags) {
  if (tags.includes('wcag2a') || tags.includes('wcag21a') || tags.includes('wcag22a')) return 'A';
  if (tags.includes('wcag2aa') || tags.includes('wcag21aa') || tags.includes('wcag22aa')) return 'AA';
  if (tags.includes('wcag2aaa') || tags.includes('wcag21aaa') || tags.includes('wcag22aaa')) return 'AAA';
  return 'AA'; // Default
}

/**
 * Run accessibility audit on HTML content using Playwright
 * @param {string} html - HTML content to audit
 * @param {Object} options - Audit options
 * @returns {Object} Audit results
 */
export async function runAudit(html, options = {}) {
  const {
    level = 'AA',
    categories = null,
    baseUrl = null
  } = options;

  let browser;
  let results;
  const issues = [];
  const stats = {
    total: 0,
    errors: 0,
    warnings: 0,
    infos: 0,
    byCategory: {},
    byLevel: { A: 0, AA: 0, AAA: 0 }
  };

  function getContrastDetails(node) {
    // axe-core may place contrast data in any, all, or none check arrays
    const contrastCheck =
      node.any?.find(c => c.id === 'color-contrast') ||
      node.all?.find(c => c.id === 'color-contrast') ||
      node.none?.find(c => c.id === 'color-contrast');
    if (contrastCheck && contrastCheck.data) {
      const d = contrastCheck.data;
      const fontSize = d.fontSize ? parseFloat(d.fontSize) : null;
      const fontWeight = d.fontWeight ? parseFloat(d.fontWeight) : null;
      // WCAG defines "large text" as >= 18pt (24px) or >= 14pt (18.66px) bold (>=700)
      const isLargeText = fontSize !== null && (
        fontSize >= 24 || (fontSize >= 18.66 && fontWeight !== null && fontWeight >= 700)
      );
      return {
        color: d.fgColor,
        bgColor: d.bgColor,
        ratio: d.contrastRatio,
        requiredRatio: d.expectedContrastRatio,
        fontSize: d.fontSize || null,
        fontWeight: d.fontWeight ? String(d.fontWeight) : null,
        isLargeText
      };
    }
    return null;
  }
  
  try {
    // Launch browser (Primary: Local, Fallback: Remote for Vercel)
    try {
      console.log('Attempting to launch local browser...');
      browser = await chromium.launch({ headless: true });
    } catch (localError) {
      console.warn('Local browser launch failed, checking for remote fallback...');
      
      const wsEndpoint = process.env.BROWSER_WS_ENDPOINT || 
                        (process.env.BROWSERLESS_API_KEY ? `wss://production-sfo.browserless.io?token=${process.env.BROWSERLESS_API_KEY}` : null);
      
      if (wsEndpoint) {
        console.log('Connecting to remote browser...');
        browser = await chromium.connectOverCDP(wsEndpoint);
      } else {
        // If local failed and no remote config is present, rethrow the original error
        throw new Error(`Browser launch failed: ${localError.message}. Please install Playwright browsers or provide a BROWSERLESS_API_KEY.`);
      }
    }
    
    const page = await browser.newPage();

    
    // If we have a live URL, use `page.goto` so stylesheets, fonts, and assets load natively!
    // Otherwise fallback to raw HTML injections (which may lack external styles)
    if (baseUrl) {
      await page.goto(baseUrl, { waitUntil: 'load' });
    } else if (html) {
      await page.setContent(html, { waitUntil: 'load' });
    }
    
    // Inject axe manually because next.js bundler chokes on axe-playwright natively
    // Read from the public folder to avoid module resolution errors in Next.js
    const axePath = path.join(process.cwd(), 'public', 'scripts', 'axe.min.js');
    const axeSource = fs.readFileSync(axePath, 'utf8');
    await page.evaluate(axeSource);

    // Calculate which rules configuration to run
    const tagsToRun = level === 'A' ? ['wcag2a', 'wcag21a', 'wcag22a', 'best-practice'] : 
              level === 'AA' ? ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'] :
              ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'best-practice'];

    // Run axe-core inside the browser context
    results = await page.evaluate(async (tagsToRun) => {
      return await window.axe.run(document.documentElement, {
        runOnly: { type: 'tag', values: tagsToRun }
      });
    }, tagsToRun);

    // Process violations (Errors) AND take screenshots while the browser is still alive
    for (const violation of results.violations) {
      const category = mapAxeTagsToCategory(violation.tags);
      
      // Filter by categories if specified
      if (categories && !categories.includes(category)) continue;
      
      const ruleLevel = mapAxeTagsToLevel(violation.tags);
      
      for (const node of violation.nodes) {
        const summary = node.failureSummary || '';
        if (summary.includes('Axe encountered an error') || summary.includes('The iframe still has to be tested')) continue;

        stats.total++;
        stats.errors++;
        stats.byLevel[ruleLevel]++;
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
        
        let base64Screenshot = null;
        try {
          if (node.target && node.target.length > 0) {
            const selector = node.target.join(' > ');
            const el = page.locator(selector).first();
            
            if (await el.count() > 0) {
              const isVisible = await el.isVisible().catch(() => false);
              const box = await el.boundingBox().catch(() => null);
              
              if (isVisible && box && box.width > 0 && box.height > 0) {
                 // Highlight the exact failing element visually
                 await el.evaluate((node) => {
                   node.style.outline = '4px solid red';
                   node.style.outlineOffset = '2px';
                 }).catch(() => null);

                 try {
                     // Take a native screenshot of strictly the element itself.
                     // Native screenshotting intelligently handles moving it into viewport
                     // and bounds clipping without needing math or wide parent contexts.
                     const buffer = await el.screenshot({ 
                       type: 'jpeg', 
                       quality: 50, 
                       timeout: 3000 
                     });
                     base64Screenshot = buffer.toString('base64');
                 } catch (e) {
                     console.warn('Native screenshot failed:', e.message);
                 }

                 // Remove highlight after screenshot to not mutate overlapping test elements
                 await el.evaluate((node) => {
                   node.style.outline = '';
                   node.style.outlineOffset = '';
                 }).catch(() => null);
              }
            }
          }
        } catch (err) {
          console.warn(`[Audit Warning] Could not capture screenshot canvas for: ${node.target.join(' > ')} | Reason:`, err.message);
        }

        const contrastDetails = getContrastDetails(node);
        const contrastMsg = generateContrastMessage(contrastDetails);
        const cleanedMessage = cleanFailureSummary(node.failureSummary) || violation.help;

        issues.push({
          id: `issue-${issues.length + 1}`,
          ruleId: violation.id,
          ruleName: violation.help,
          level: ruleLevel,
          severity: 'error',
          impact: node.impact || violation.impact || 'moderate',
          category,
          description: violation.description,
          message: (violation.id === 'color-contrast' && contrastMsg) ? contrastMsg : cleanedMessage,
          element: node.html?.substring(0, 100),
          selector: node.target.join(' > '),
          confidence: 1.0,
          fix: { suggestion: generateFixSuggestion(violation, node, contrastDetails) },
          details: contrastDetails,
          helpUrl: violation.helpUrl,
          screenshot: base64Screenshot
        });
      }
    }

  } catch (error) {
    console.error("Playwright Audit Error:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // We no longer process incomplete results as warnings per user request.
  // Incomplete results typically happen during headless tests when visual layouts
  // are partially obstructed or unable to be fully verified.


  const score = calculateScore(issues);

  return {
    score,
    issues,
    stats,
    timestamp: new Date().toISOString(),
    level,
    summary: generateSummary(issues, stats)
  };
}

/**
 * Calculate accessibility score (industry standard logarithmic curve)
 */
function calculateScore(issues) {
  // Use a weight-based deduction similar to Lighthouse
  
  const weights = {
    critical: 10,
    serious: 5,
    moderate: 2,
    minor: 1
  };
  
  let totalWeight = 0;
  
  for (const issue of issues) {
    if (issue.severity === 'error') {
       totalWeight += (weights[issue.impact] || 3);
    }
  }

  // If there are no errors, perfect 100
  if (totalWeight === 0) return 100;

  // Lighthouse-style curve: Score drops logarithmically.
  // We use a much higher divisor so 1-2 errors only barely scratch a perfect score.
  // Formula: 100 * Math.exp(-weight / divisor)
  // A divisor of 100 means 1 serious error (weight 5) = 100 * exp(-0.05) ≈ 95%
  // 1 critical error (weight 10) = 100 * exp(-0.1) ≈ 90%
  // 5 critical errors (weight 50) = 100 * exp(-0.5) ≈ 60%
  
  const rawScore = 100 * Math.exp(-totalWeight / 100);
  
  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

/**
 * Generate human-readable summary
 */
function generateSummary(issues, stats) {
  if (issues.length === 0) {
    return 'No accessibility issues detected! Great job following accessibility guidelines.';
  }
  
  const parts = [];
  
  if (stats.errors > 0) {
    parts.push(`${stats.errors} critical error${stats.errors > 1 ? 's' : ''}`);
  }
  if (stats.warnings > 0) {
    parts.push(`${stats.warnings} warning${stats.warnings > 1 ? 's' : ''}`);
  }
  
  return `Found ${parts.join(', ')} that may affect users with disabilities.`;
}
