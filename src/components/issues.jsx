'use client';

import { useState } from 'react';
import { Badge, ConfidenceIndicator, Button, Card, Skeleton } from './ui';
import { 
  Image as ImageIcon, 
  Layout, 
  Keyboard, 
  Compass, 
  Link as LinkIcon, 
  Palette, 
  FileText, 
  Globe, 
  Accessibility, 
  Code,
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  X,
  BookOpen,
  Clipboard,
  ExternalLink,
  Sparkles
} from 'lucide-react';

// Category icons
const CATEGORY_ICONS = {
  images: <ImageIcon size={18} />,
  structure: <Layout size={18} />,
  keyboard: <Keyboard size={18} />,
  navigation: <Compass size={18} />,
  links: <LinkIcon size={18} />,
  color: <Palette size={18} />,
  forms: <FileText size={18} />,
  language: <Globe size={18} />,
  aria: <Accessibility size={18} />,
  markup: <Code size={18} />,
  default: <Clipboard size={18} />
};

// Severity icons
const SEVERITY_ICONS = {
  error: <AlertCircle size={14} />,
  warning: <AlertTriangle size={14} />,
  info: <Info size={14} />
};

export function IssueCard({ issue, isSelected, onClick }) {
  const severityVariant = (issue?.severity === 'error') ? 'error' : (issue?.severity === 'warning') ? 'warning' : 'info';
  const wcagVariant = `wcag-${(issue?.level || 'AA').toLowerCase()}`;
  const CategoryIcon = CATEGORY_ICONS[issue?.category] || CATEGORY_ICONS.default;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`
        glass p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden
        ${isSelected 
          ? 'border-[var(--color-accent)] bg-[var(--color-bg-secondary)] shadow-md' 
          : 'border-[var(--color-glass-border)] hover:bg-[var(--color-bg-tertiary)]'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'}`}>
          {CategoryIcon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge variant={severityVariant} size="xs">
              {SEVERITY_ICONS[issue.severity]}
              <span className="ml-1">{issue.severity}</span>
            </Badge>
            <Badge variant={wcagVariant} size="xs">
              WCAG {issue.ruleId} ({issue.level})
            </Badge>
          </div>
          
          <h4 className={`font-semibold text-[var(--color-text-primary)] mb-1.5 text-sm leading-relaxed ${isSelected ? '' : 'line-clamp-2'}`}>
            {issue.message}
          </h4>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] flex-1 min-w-0">
              <span className={`font-mono break-all ${isSelected ? '' : 'truncate max-w-[120px]'}`}>{issue.selector}</span>
              <ConfidenceIndicator value={issue.confidence} showLabel={false} />
            </div>
            <ChevronRight 
              size={16} 
              className={`flex-shrink-0 transition-transform duration-300 text-[var(--color-text-tertiary)] ${isSelected ? 'rotate-90 text-[var(--color-accent)]' : ''}`}
            />
          </div>

          {/* Inline Expansion Container */}
          <div className="grid-expand-wrapper" data-expanded={isSelected}>
            <div className="grid-expand-content">
              <div className="mt-6 pt-6 border-t border-[var(--color-glass-border)] space-y-4">
                {/* Detailed Rule Info */}
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">
                    {issue.ruleName}
                  </h3>
                  <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
                    WCAG {issue.ruleId}: {issue.description}
                  </p>
                </div>

                {/* Affected Element */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-2">Affected Element</h4>
                  <div className="p-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-glass-border)] rounded-lg overflow-x-auto max-w-full">
                    <code className="text-xs font-mono text-[var(--color-text-primary)] break-all whitespace-pre-wrap">
                      {issue.element}
                    </code>
                  </div>
                </div>

                {/* Fix */}
                {issue.fix && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-2">Recommendation</h4>
                    <div className="p-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-success)]/20 rounded-lg">
                      <p className="text-xs text-[var(--color-text-primary)]">{issue.fix.suggestion}</p>
                    </div>
                  </div>
                )}

                {/* Contrast Analysis */}
                {issue.details && issue.details.color && issue.details.bgColor && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-2">Contrast Analysis</h4>
                    <div className="flex gap-4 p-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-glass-border)] rounded-lg flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border border-[var(--color-glass-border)]" style={{ backgroundColor: issue.details.color }}></div>
                        <span className="text-xs text-[var(--color-text-primary)]">Text: <code className="bg-[var(--color-bg-secondary)] px-1 rounded">{issue.details.color}</code></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border border-[var(--color-glass-border)]" style={{ backgroundColor: issue.details.bgColor }}></div>
                        <span className="text-xs text-[var(--color-text-primary)]">BG: <code className="bg-[var(--color-bg-secondary)] rounded-md px-1">{issue.details.bgColor}</code></span>
                      </div>
                      <div className="ml-auto text-right">
                        <span className="text-[10px] text-[var(--color-text-tertiary)] block uppercase italic">Ratio</span>
                        <span className="text-sm font-bold text-[var(--color-text-primary)]">{issue.details.ratio?.toFixed?.(2) || issue.details.ratio}:1</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Screenshot */}
                {issue.screenshot && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-2">Visual Context</h4>
                    <div className="overflow-hidden rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-bg-tertiary)] flex items-center justify-center p-2 max-w-full">
                      <img 
                        src={`data:image/jpeg;base64,${issue.screenshot}`} 
                        alt="Issue screenshot"
                        className="max-w-full max-h-[180px] object-contain rounded ring-1 ring-red-500/30"
                      />
                    </div>
                  </div>
                )}

                {/* Reference */}
                {issue.helpUrl && (
                  <div className="pt-2">
                    <a
                      href={issue.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <BookOpen size={14} /> Learn more about WCAG {issue.ruleId}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



export function IssueList({ issues, selectedIssue, onSelectIssue, filter }) {
  const filteredIssues = issues.filter(issue => {
    if (filter.severity && issue.severity !== filter.severity) return false;
    if (filter.level && issue.level !== filter.level) return false;
    if (filter.category && issue.category !== filter.category) return false;
    return true;
  });

  if (filteredIssues.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <Sparkles size={48} className="text-[var(--color-text-tertiary)] opacity-30" />
        </div>
        <p className="text-[var(--color-text-secondary)]">
          {issues.length === 0 
            ? 'No issues found! Your content looks accessible.'
            : 'No issues match your current filters.'}
        </p>
      </div>
    );
  }

  const leftColumn = filteredIssues.filter((_, idx) => idx % 2 === 0);
  const rightColumn = filteredIssues.filter((_, idx) => idx % 2 !== 0);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
      {/* Left Column (or single column on mobile) */}
      <div className="flex-1 space-y-4">
        {leftColumn.map((issue, idx) => (
          <div 
            key={issue.id} 
            className="animate-slide-up opacity-0" 
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <IssueCard
              issue={issue}
              isSelected={selectedIssue?.id === issue.id}
              onClick={() => selectedIssue?.id === issue.id ? onSelectIssue(null) : onSelectIssue(issue)}
            />
          </div>
        ))}
      </div>

      {/* Right Column (desktop only) */}
      <div className="hidden lg:flex flex-1 flex-col space-y-4">
        {rightColumn.map((issue, idx) => (
          <div 
            key={issue.id} 
            className="animate-slide-up opacity-0" 
            style={{ animationDelay: `${(idx * 0.05) + 0.1}s` }}
          >
            <IssueCard
              issue={issue}
              isSelected={selectedIssue?.id === issue.id}
              onClick={() => selectedIssue?.id === issue.id ? onSelectIssue(null) : onSelectIssue(issue)}
            />
          </div>
        ))}
      </div>

      {/* Mobile Right Column items (rendered into the single column) */}
      <div className="lg:hidden space-y-4">
        {rightColumn.map((issue, idx) => (
          <div 
            key={issue.id} 
            className="animate-slide-up opacity-0" 
            style={{ animationDelay: `${((leftColumn.length + idx) * 0.05)}s` }}
          >
            <IssueCard
              issue={issue}
              isSelected={selectedIssue?.id === issue.id}
              onClick={() => selectedIssue?.id === issue.id ? onSelectIssue(null) : onSelectIssue(issue)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
