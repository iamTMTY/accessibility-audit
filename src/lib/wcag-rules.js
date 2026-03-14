/**
 * WCAG 2.1 Rule Definitions
 * Comprehensive accessibility rules organized by WCAG principle
 */

export const WCAG_LEVELS = {
  A: 'A',
  AA: 'AA',
  AAA: 'AAA'
};

export const SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const IMPACT = {
  CRITICAL: 'critical',
  SERIOUS: 'serious',
  MODERATE: 'moderate',
  MINOR: 'minor'
};

/**
 * All WCAG rules with metadata and check functions
 */
export const WCAG_RULES = [
  // ==========================================
  // PERCEIVABLE
  // ==========================================
  {
    id: '1.1.1',
    name: 'Non-text Content',
    level: WCAG_LEVELS.A,
    severity: SEVERITY.ERROR,
    impact: IMPACT.CRITICAL,
    category: 'images',
    description: 'All non-text content has text alternatives',
    check: (element, context) => {
      const doc = context?.document || element.ownerDocument;
      
      if (element.tagName === 'IMG') {
        const alt = element.getAttribute('alt');
        const role = element.getAttribute('role');
        
        // Decorative images with role="presentation" or empty alt are ok
        if (role === 'presentation' || role === 'none') return null;
        
        if (alt === null) {
          return {
            passed: false,
            message: 'Image is missing alt attribute',
            element: element.outerHTML.substring(0, 100),
            selector: getSelector(element),
            fix: {
              type: 'attribute',
              attribute: 'alt',
              suggestion: 'Add descriptive alt text or alt="" for decorative images'
            }
          };
        }
      }
      
      // SVG without accessible name
      if (element.tagName === 'SVG') {
        const title = element.querySelector('title');
        const ariaLabel = element.getAttribute('aria-label');
        const ariaLabelledby = element.getAttribute('aria-labelledby');
        
        if (!title && !ariaLabel && !ariaLabelledby) {
          return {
            passed: false,
            message: 'SVG is missing accessible name',
            element: element.outerHTML.substring(0, 100),
            selector: getSelector(element),
            fix: {
              type: 'attribute',
              suggestion: 'Add aria-label, aria-labelledby, or <title> element'
            }
          };
        }
      }
      
      return null;
    }
  },
  
  {
    id: '1.3.1',
    name: 'Info and Relationships',
    level: WCAG_LEVELS.A,
    severity: SEVERITY.ERROR,
    impact: IMPACT.SERIOUS,
    category: 'structure',
    description: 'Information and relationships are programmatically determinable',
    check: (element, context) => {
      const doc = context?.document || element.ownerDocument;
      // Check for visual-only labels (text before input without association)
      if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
        const type = element.getAttribute('type');
        if (type === 'hidden' || type === 'submit' || type === 'button' || type === 'image') {
          return null;
        }
        
        const id = element.getAttribute('id');
        const ariaLabel = element.getAttribute('aria-label');
        const ariaLabelledby = element.getAttribute('aria-labelledby');
        const title = element.getAttribute('title');
        
        // Check for associated label
        let hasLabel = ariaLabel || ariaLabelledby || title;
        
        if (id) {
          const label = doc.querySelector(`label[for="${id}"]`);
          if (label) hasLabel = true;
        }
        
        // Check for wrapping label
        if (element.closest('label')) {
          hasLabel = true;
        }
        
        if (!hasLabel) {
          return {
            passed: false,
            message: `Form ${element.tagName.toLowerCase()} is missing a label`,
            element: element.outerHTML.substring(0, 100),
            selector: getSelector(element),
            fix: {
              type: 'label',
              suggestion: 'Add a <label> element with for attribute, or use aria-label'
            }
          };
        }
      }
      
      return null;
    }
  },
  
  {
    id: '1.3.1.2',
    name: 'Table Headers',
    level: WCAG_LEVELS.A,
    severity: SEVERITY.ERROR,
    impact: IMPACT.SERIOUS,
    category: 'structure',
    description: 'Data tables have header cells',
    check: (element, context) => {
      if (element.tagName === 'TABLE') {
        const hasHeaders = element.querySelector('th');
        const rows = element.querySelectorAll('tr');
        
        if (rows.length > 2 && !hasHeaders) {
          return {
            passed: false,
            message: 'Data table is missing row or column headers (<th>)',
            element: element.outerHTML.substring(0, 100),
            selector: getSelector(element),
            fix: {
              type: 'structure',
              suggestion: 'Add <th> elements for headers'
            }
          };
        }
      }
      return null;
    }
  },
  
  {
    id: '1.3.1.3',
    name: 'Fieldset and Legend',
    level: WCAG_LEVELS.A,
    severity: SEVERITY.WARNING,
    impact: IMPACT.MODERATE,
    category: 'forms',
    description: 'Related form controls are grouped with fieldset and legend',
    check: (element, context) => {
      if (element.tagName === 'FIELDSET') {
        const legend = element.querySelector('legend');
        if (!legend || !legend.textContent?.trim()) {
          return {
            passed: false,
            message: 'Fieldset is missing a legend',
            element: element.outerHTML.substring(0, 100),
            selector: getSelector(element),
            fix: {
              type: 'element',
              suggestion: 'Add a <legend> element to the fieldset'
            }
          };
        }
      }
      return null;
    }
  },
  
  {
    id: '1.3.2',
    name: 'Meaningful Sequence',
    level: WCAG_LEVELS.A,
    severity: SEVERITY.WARNING,
    impact: IMPACT.MODERATE,
    category: 'structure',
    description: 'Content order is meaningful when linearized',
    check: (element, context) => {
      const win = context?.window || element.ownerDocument?.defaultView;
      if (!win) return null;
      
      // Check for incorrect use of CSS to visually reorder content
      const style = win.getComputedStyle?.(element);
      if (style) {
        const order = style.getPropertyValue('order');
        if (order && order !== '0') {
          return {
            passed: false,
            message: 'CSS order property may affect reading sequence',
            element: element.outerHTML.substring(0, 100),
            selector: getSelector(element),
            confidence: 0.6,
            fix: {
              type: 'structure',
              suggestion: 'Ensure DOM order matches visual order, or use aria-flowto'
            }
          };
        }
      }
      return null;
    }
  },
  
  {
    id: '1.4.3',
    name: 'Contrast (Minimum)',
    level: WCAG_LEVELS.AA,
    severity: SEVERITY.ERROR,
    impact: IMPACT.SERIOUS,
    category: 'color',
    description: 'Text has contrast ratio of at least 4.5:1',
    check: (element, context) => {
      const win = context?.window || element.ownerDocument?.defaultView;
      
      // Only check elements that contain text
      if (!element.textContent?.trim()) return null;
      
      // Skip if element has no direct text (nodeType 3 is TEXT_NODE)
      const hasDirectText = Array.from(element.childNodes).some(
        node => node.nodeType === 3 && node.textContent.trim()
      );
      
      if (!hasDirectText) return null;
      
      const style = win?.getComputedStyle?.(element);
      if (!style) return null;
      
      const color = style.getPropertyValue('color');
      const bgColor = getBackgroundColor(element, win);
      
      if (color && bgColor) {
        const ratio = getContrastRatio(color, bgColor);
        const fontSizeStr = style.getPropertyValue('font-size');
        const fontSize = fontSizeStr ? parseFloat(fontSizeStr) : 16;
        const fontWeight = style.getPropertyValue('font-weight');
        const isBold = fontWeight === 'bold' || parseInt(fontWeight) >= 700;
        const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && isBold);
        
        const requiredRatio = isLargeText ? 3 : 4.5;
        
        if (ratio < requiredRatio) {
          return {
            passed: false,
            message: `Insufficient color contrast: ${ratio.toFixed(2)}:1 (requires ${requiredRatio}:1)`,
            element: element.outerHTML.substring(0, 100),
            selector: getSelector(element),
            details: { ratio, requiredRatio, color, bgColor },
            confidence: win?._jsdom ? 0.6 : 1.0, // Lower confidence in JSDOM where CSS might not be fully loaded
            fix: {
              type: 'style',
              suggestion: `Increase contrast ratio to at least ${requiredRatio}:1`
            }
          };
        }
      }
      
      return null;
    }
  },
  
  // ==========================================
  // OPERABLE
  // ==========================================
  {
    id: '2.1.1',
    name: 'Keyboard',
    level: WCAG_LEVELS.A,
    severity: SEVERITY.ERROR,
    impact: IMPACT.CRITICAL,
    category: 'keyboard',
    description: 'All functionality is available from keyboard',
    check: (element, context) => {
      // Check for click handlers without keyboard equivalents
      const hasOnClick = element.hasAttribute('onclick') || element.onclick;
      const isNativelyFocusable = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName);
      const tabIndex = element.getAttribute('tabindex');
      const role = element.getAttribute('role');
      
      if (hasOnClick && !isNativelyFocusable && tabIndex === null) {
        return {
          passed: false,
          message: 'Clickable element is not keyboard accessible',
          element: element.outerHTML.substring(0, 100),
          selector: getSelector(element),
          fix: {
            type: 'attribute',
            suggestion: 'Add tabindex="0" and keyboard event handlers, or use a <button>'
          }
        };
      }
      
      // Check for non-interactive elements with interactive roles
      const interactiveRoles = ['button', 'link', 'tab', 'menuitem', 'checkbox', 'radio'];
      if (interactiveRoles.includes(role) && !isNativelyFocusable && tabIndex === null) {
        return {
          passed: false,
          message: `Element with role="${role}" is not keyboard focusable`,
          element: element.outerHTML.substring(0, 100),
          selector: getSelector(element),
          fix: {
            type: 'attribute',
            attribute: 'tabindex',
            value: '0',
            suggestion: 'Add tabindex="0" to make element focusable'
          }
        };
      }
      
      return null;
    }
  },
  
  {
    id: '2.1.2',
    name: 'No Keyboard Trap',
    level: WCAG_LEVELS.A,
    severity: SEVERITY.ERROR,
    impact: IMPACT.CRITICAL,
    category: 'keyboard',
    description: 'Keyboard focus can be moved away from elements',
    check: (element, context) => {
      // Check for elements that might trap focus
      const tabIndexStr = element.getAttribute('tabindex');
      if (tabIndexStr === null) return null;
      
      const tabIndex = parseInt(tabIndexStr);
      
      // Positive tabindex can cause focus issues
      if (tabIndex > 0) {
        return {
          passed: false,
          message: 'Positive tabindex may cause keyboard navigation issues',
          element: element.outerHTML.substring(0, 100),
          selector: getSelector(element),
          confidence: 0.7,
          fix: {
            type: 'attribute',
            attribute: 'tabindex',
            value: '0',
            suggestion: 'Use tabindex="0" instead of positive values'
          }
        };
      }
      
      return null;
    }
  },
  
  {
    id: '2.4.1',
    name: 'Bypass Blocks',
    level: WCAG_LEVELS.A,
    severity: SEVERITY.WARNING,
    impact: IMPACT.MODERATE,
    category: 'navigation',
    description: 'Mechanism exists to bypass repeated content',
    check: (element, context) => {
      // Only check once per document at the body level
      if (element.tagName !== 'BODY') return null;
      
      const skipLinks = element.querySelectorAll('a[href^="#"]');
      const hasSkipLink = Array.from(skipLinks).some(link => {
        const text = link.textContent?.toLowerCase() || '';
        return text.includes('skip') || text.includes('main') || text.includes('content');
      });
      
      const hasMainLandmark = element.querySelector('main, [role="main"]');
      
      if (!hasSkipLink && !hasMainLandmark) {
        return {
          passed: false,
          message: 'Page lacks skip navigation or main landmark',
          element: 'body',
          selector: 'body',
          fix: {
            type: 'structure',
            suggestion: 'Add a "Skip to main content" link or use <main> element'
          }
        };
      }
      
      return null;
    }
  },
  
  {
    id: '2.4.2',
    name: 'Page Titled',
    level: WCAG_LEVELS.A,
    severity: SEVERITY.ERROR,
    impact: IMPACT.SERIOUS,
    category: 'navigation',
    description: 'Pages have titles that describe topic or purpose',
    check: (element) => {
      // Only check the document title at the head level
      if (element.tagName !== 'HEAD') return null;
      
      const title = element.querySelector('title');
      if (!title || !title.textContent?.trim()) {
        return {
          passed: false,
          message: 'Page is missing a descriptive title',
          element: '<head>',
          selector: 'head',
          fix: {
            type: 'element',
            suggestion: 'Add a <title> element with descriptive text'
          }
        };
      }
      
      return null;
    }
  },
  
  {
    id: '2.4.4',
    name: 'Link Purpose (In Context)',
    level: WCAG_LEVELS.A,
    severity: SEVERITY.WARNING,
    impact: IMPACT.MODERATE,
    category: 'links',
    description: 'Link purpose can be determined from link text',
    check: (element, context) => {
      if (element.tagName !== 'A') return null;
      
      const accessibleName = getAccessibleName(element, context?.window);
      const text = (element.textContent || '').trim().toLowerCase();
      
      const vaguePhrases = ['click here', 'read more', 'learn more', 'here', 'more', 'link'];
      
      if (!accessibleName || vaguePhrases.includes(accessibleName.toLowerCase())) {
        if (vaguePhrases.includes(text) || !text) {
          return {
            passed: false,
            message: accessibleName 
              ? `Link text "${accessibleName}" is not descriptive`
              : 'Link has no accessible name (discernible name)',
            element: element.outerHTML.substring(0, 100),
            selector: getSelector(element),
            fix: {
              type: 'content',
              suggestion: 'Add descriptive link text or an aria-label'
            }
          };
        }
      }
      
      return null;
    }
  },
  
  {
    id: '2.4.6',
    name: 'Headings and Labels',
    level: WCAG_LEVELS.AA,
    severity: SEVERITY.WARNING,
    impact: IMPACT.MODERATE,
    category: 'structure',
    description: 'Headings and labels describe topic or purpose',
    check: (element) => {
      if (!['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) return null;
      
      const text = (element.textContent || '').trim();
      
      if (!text) {
        return {
          passed: false,
          message: 'Heading is empty',
          element: element.outerHTML.substring(0, 100),
          selector: getSelector(element),
          fix: {
            type: 'content',
            suggestion: 'Add descriptive heading text'
          }
        };
      }
      
      return null;
    }
  },
  
  {
    id: '2.4.6.2',
    name: 'Heading Hierarchy',
    level: WCAG_LEVELS.AA,
    severity: SEVERITY.WARNING,
    impact: IMPACT.MODERATE,
    category: 'structure',
    description: 'Heading levels are not skipped',
    check: (element, context) => {
      const tag = element.tagName;
      if (!['H2', 'H3', 'H4', 'H5', 'H6'].includes(tag)) return null;
      
      const level = parseInt(tag.substring(1));
      
      // Use pre-calculated headings from context for better performance
      const allHeadings = context?.headings || [];
      const index = allHeadings.indexOf(element);
      
      if (index > 0) {
        const prevHeading = allHeadings[index - 1];
        const prevLevel = parseInt(prevHeading.tagName.substring(1));
        
        if (level > prevLevel + 1) {
          return {
            passed: false,
            message: `Heading level skipped: ${prevHeading.tagName} to ${tag}`,
            element: element.outerHTML.substring(0, 100),
            selector: getSelector(element),
            confidence: 0.9,
            fix: {
              type: 'structure',
              suggestion: `Change ${tag} to ${prevHeading.tagName[0]}${prevLevel + 1} to maintain order`
            }
          };
        }
      }
      
      return null;
    }
  },
  
  {
    id: '2.4.7',
    name: 'Focus Visible',
    level: WCAG_LEVELS.AA,
    severity: SEVERITY.ERROR,
    impact: IMPACT.SERIOUS,
    category: 'keyboard',
    description: 'Keyboard focus indicator is visible',
    check: (element, context) => {
      const win = context?.window || element.ownerDocument?.defaultView;
      if (!win) return null;

      // Check focusable elements for outline:none without replacement
      const focusableSelector = 'a, button, input, select, textarea, [tabindex]';
      if (!element.matches(focusableSelector)) return null;
      
      const style = win.getComputedStyle?.(element);
      if (!style) return null;
      
      const outline = style.getPropertyValue('outline');
      const outlineWidth = style.getPropertyValue('outline-width');
      
      // This is a heuristic - we can't truly know without testing :focus state
      if (outline === 'none' || outlineWidth === '0px') {
        return {
          passed: false,
          message: 'Element may not have visible focus indicator',
          element: element.outerHTML.substring(0, 100),
          selector: getSelector(element),
          confidence: 0.4,
          fix: {
            type: 'style',
            suggestion: 'Ensure :focus state has visible outline or other indicator'
          }
        };
      }
      
      return null;
    }
  },

  // ==========================================
  // UNDERSTANDABLE
  // ==========================================
  {
    id: '3.1.1',
    name: 'Language of Page',
    level: WCAG_LEVELS.A,
    severity: SEVERITY.ERROR,
    impact: IMPACT.SERIOUS,
    category: 'language',
    description: 'Default language of each page can be determined',
    check: (element) => {
      if (element.tagName !== 'HTML') return null;
      
      const lang = element.getAttribute('lang');
      if (!lang) {
        return {
          passed: false,
          message: 'HTML element is missing lang attribute',
          element: '<html>',
          selector: 'html',
          fix: {
            type: 'attribute',
            attribute: 'lang',
            suggestion: 'Add lang attribute (e.g., lang="en")'
          }
        };
      }
      
      return null;
    }
  },
  
  {
    id: '3.3.1',
    name: 'Error Identification',
    level: WCAG_LEVELS.A,
    severity: SEVERITY.WARNING,
    impact: IMPACT.MODERATE,
    category: 'forms',
    description: 'Input errors are identified and described',
    check: (element) => {
      if (element.tagName !== 'INPUT') return null;
      
      const required = element.hasAttribute('required') || element.getAttribute('aria-required') === 'true';
      
      if (required) {
        const ariaDescribedby = element.getAttribute('aria-describedby');
        const ariaErrormessage = element.getAttribute('aria-errormessage');
        
        if (!ariaDescribedby && !ariaErrormessage) {
          return {
            passed: false,
            message: 'Required field lacks error message association',
            element: element.outerHTML.substring(0, 100),
            selector: getSelector(element),
            confidence: 0.7,
            fix: {
              type: 'attribute',
              suggestion: 'Add aria-describedby or aria-errormessage for error states'
            }
          };
        }
      }
      
      return null;
    }
  },

  // ==========================================
  // ROBUST
  // ==========================================
  {
    id: '4.1.1',
    name: 'Parsing',
    level: WCAG_LEVELS.A,
    severity: SEVERITY.ERROR,
    impact: IMPACT.MODERATE,
    category: 'markup',
    description: 'Elements have complete start and end tags, no duplicate IDs',
    check: (element, context) => {
      // Check for duplicate IDs (only at body level for performance)
      if (element.tagName === 'BODY') {
        const allIds = element.querySelectorAll('[id]');
        const idMap = new Map();
        
        for (const el of allIds) {
          const id = el.getAttribute('id');
          if (idMap.has(id)) {
            return {
              passed: false,
              message: `Duplicate ID found: "${id}"`,
              element: `id="${id}"`,
              selector: `#${id}`,
              fix: {
                type: 'attribute',
                suggestion: 'Ensure all ID values are unique'
              }
            };
          }
          idMap.set(id, true);
        }
      }
      
      return null;
    }
  },
  
  {
    id: '4.1.2',
    name: 'Name, Role, Value',
    level: WCAG_LEVELS.A,
    severity: SEVERITY.ERROR,
    impact: IMPACT.CRITICAL,
    category: 'aria',
    description: 'UI components have accessible names and roles',
    check: (element) => {
      // Check buttons
      if (element.tagName === 'BUTTON') {
        const text = (element.textContent || '').trim();
        const ariaLabel = element.getAttribute('aria-label');
        const ariaLabelledby = element.getAttribute('aria-labelledby');
        const title = element.getAttribute('title');
        const hasImg = element.querySelector('img[alt]');
        const hasSvg = element.querySelector('svg[aria-label], svg title');
        
        if (!text && !ariaLabel && !ariaLabelledby && !title && !hasImg && !hasSvg) {
          return {
            passed: false,
            message: 'Button has no accessible name',
            element: element.outerHTML.substring(0, 100),
            selector: getSelector(element),
            fix: {
              type: 'content',
              suggestion: 'Add button text, aria-label, or icon with alt text'
            }
          };
        }
      }
      
      return null;
    }
  }
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Generate a CSS selector for an element
 */
function getSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }
  
  const path = [];
  let current = element;
  
  // nodeType 1 is ELEMENT_NODE
  while (current && current.nodeType === 1) {
    let selector = current.tagName.toLowerCase();
    
    if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\s+/).slice(0, 2);
      if (classes.length && classes[0]) {
        selector += '.' + classes.join('.');
      }
    }
    
    path.unshift(selector);
    current = current.parentElement;
    
    if (path.length > 3) break;
  }
  
  return path.join(' > ');
}

/**
 * Get effective background color (handles transparency)
 */
function getBackgroundColor(element, winContext) {
  let current = element;
  const win = winContext || element.ownerDocument?.defaultView;
  
  while (current) {
    const style = win?.getComputedStyle?.(current);
    if (!style) return null;
    
    const bg = style.getPropertyValue('background-color');
    
    // Check if it's not transparent
    if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
      return bg;
    }
    
    current = current.parentElement;
  }
  
  return 'rgb(255, 255, 255)'; // Default to white
}

/**
 * Get the accessible name of an element by following the accessible name computation
 */
function getAccessibleName(element, winContext) {
  if (!element) return '';
  
  // 1. aria-labelledby
  const doc = winContext?.document || element.ownerDocument;
  const labelledby = element.getAttribute('aria-labelledby');
  if (labelledby && doc) {
    const labels = labelledby.split(/\s+/).map(id => doc.getElementById(id)).filter(Boolean);
    if (labels.length > 0) {
      return labels.map(l => l.textContent).join(' ').trim();
    }
  }
  
  // 2. aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel.trim();
  
  // 3. For images, the alt text
  if (element.tagName === 'IMG' && element.hasAttribute('alt')) {
    return element.getAttribute('alt').trim();
  }
  
  // 4. For SVGs, check for <title>
  if (element.tagName === 'SVG') {
    const title = element.querySelector('title');
    if (title) return title.textContent.trim();
  }
  
  // 5. Special case for links/buttons with recursive check on children
  // (simplified version of the spec)
  let text = '';
  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === 3) { // TEXT_NODE
      text += child.textContent;
    } else if (child.nodeType === 1) { // ELEMENT_NODE
      const childName = getAccessibleName(child, winContext);
      if (childName) text += ' ' + childName;
    }
  }
  
  if (text.trim()) return text.trim();
  
  // 6. title attribute
  const titleAttr = element.getAttribute('title');
  if (titleAttr) return titleAttr.trim();
  
  return '';
}

/**
 * Parse various color formats (RGB, HEX, HSL, OKLCH)
 */
function parseColor(colorStr) {
  if (!colorStr || colorStr === 'transparent') return null;
  
  // RGB/RGBA
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    };
  }
  
  // HEX (#FFF, #FFFFFF)
  if (colorStr.startsWith('#')) {
    let hex = colorStr.substring(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  }
  
  // OKLCH (Simplified fallback - assumes light/dark based on L)
  // oklch(0.872 0.01 258.338)
  const oklchMatch = colorStr.match(/oklch\(([\d.]+)/);
  if (oklchMatch) {
    const l = parseFloat(oklchMatch[1]);
    // High L means light color, low L means dark
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }
  
  return null;
}

/**
 * Calculate relative luminance
 */
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(fg, bg) {
  const fgColor = parseColor(fg);
  const bgColor = parseColor(bg);
  
  if (!fgColor || !bgColor) return 21; // Assume pass if we can't parse
  
  const fgLum = getLuminance(fgColor.r, fgColor.g, fgColor.b);
  const bgLum = getLuminance(bgColor.r, bgColor.g, bgColor.b);
  
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get rule by ID
 */
export function getRuleById(id) {
  return WCAG_RULES.find(rule => rule.id === id);
}

/**
 * Get rules by level
 */
export function getRulesByLevel(level) {
  const levels = {
    'A': ['A'],
    'AA': ['A', 'AA'],
    'AAA': ['A', 'AA', 'AAA']
  };
  return WCAG_RULES.filter(rule => levels[level]?.includes(rule.level));
}

/**
 * Get rules by category
 */
export function getRulesByCategory(category) {
  return WCAG_RULES.filter(rule => rule.category === category);
}
