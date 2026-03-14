'use client';

import { useState, useCallback } from 'react';
import { ScoreCircle, StatCard, Card, Tabs, Button, EmptyState, ThemeToggle } from '@/components/ui';
import { IssueList, IssueDetail } from '@/components/issues';
import { HtmlInput } from '@/components/demo';

import { 
  BarChart3, 
  Search, 
  History, 
  Layout, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Maximize2,
  Accessibility
} from 'lucide-react';

export default function Home() {
  const [html, setHtml] = useState('');
  const [results, setResults] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filter, setFilter] = useState({ severity: null, level: null, category: null });
  const [wcagLevel, setWcagLevel] = useState('AA');

  const runScan = useCallback(async (htmlOverride, urlOverride = null) => {
    const htmlToScan = typeof htmlOverride === 'string' ? htmlOverride : html;
    if (!htmlToScan.trim()) return;
    
    setIsScanning(true);
    setSelectedIssue(null);
    
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: htmlToScan, level: wcagLevel, baseUrl: urlOverride })
      });
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  }, [html, wcagLevel]);

  const categories = results?.issues 
    ? [...new Set(results.issues.map(i => i.category))]
    : [];

  const errorsCount = results?.stats?.errors || 0;
  const warningsCount = results?.stats?.warnings || 0;
  const totalIssuesCount = results?.issues?.length || 0;

  const filteredIssues = results?.issues?.filter(issue => {
    if (filter.severity && issue.severity !== filter.severity) return false;
    if (filter.category && issue.category !== filter.category) return false;
    return true;
  }) || [];
  const filteredIssuesCount = filteredIssues.length;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-glass-border)] bg-[var(--color-bg-primary)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center gap-3">
              <ShieldCheck size={28} className="text-[var(--color-accent)]" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">Accessibility Audit</h1>
                <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">A11y Auditor</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* WCAG Level Selector */}
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-sm font-medium text-[var(--color-text-secondary)] hidden sm:inline">WCAG Level:</span>
                <span className="text-sm font-medium text-[var(--color-text-secondary)] sm:hidden">WCAG:</span>
                <Tabs
                  tabs={[
                    { id: 'A', label: 'A' },
                    { id: 'AA', label: 'AA' },
                    { id: 'AAA', label: 'AAA' }
                  ]}
                  activeTab={wcagLevel}
                  onChange={setWcagLevel}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative">
        {/* Input Section */}
        <section className="mb-20 animate-slide-up relative z-10">
          <HtmlInput
            html={html}
            onHtmlChange={setHtml}
            onScan={runScan}
            isScanning={isScanning}
          />
        </section>

        {/* Results Section */}
        {results && (
          <div className="space-y-10 animate-fade-in">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <Card className="col-span-2 md:col-span-1 flex items-center justify-center p-8 bg-[var(--color-bg-secondary)] border-[var(--color-glass-border)]">
                <div className="text-center">
                  <ScoreCircle score={results.score} />
                </div>
              </Card>
              
              <StatCard
                title="Total Issues"
                value={totalIssuesCount}
                icon={<BarChart3 size={24} />}
                variant="default"
              />
              <StatCard
                title="Errors"
                value={errorsCount}
                icon={<AlertCircle size={24} />}
                variant="error"
              />
              <StatCard
                title="Warnings"
                value={warningsCount}
                icon={<AlertTriangle size={24} />}
                variant="warning"
              />
              <StatCard
                title="Tested Level"
                value={wcagLevel}
                icon={<Layout size={24} />}
                variant="info"
              />
            </div>

            {/* Summary */}
            <div className="p-6 bg-[var(--color-bg-tertiary)] rounded-2xl border border-[var(--color-glass-border)]">
              <p className="text-lg leading-relaxed text-[var(--color-text-secondary)]">
                {results.summary}
              </p>
            </div>

            {/* Filter Tabs */}
            {results.issues.length > 0 && (
              <div className="flex items-center flex-wrap gap-3 py-2">
                <Button
                  variant={filter.severity === null ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilter({ ...filter, severity: null })}
                >
                  All ({totalIssuesCount})
                </Button>
                <Button
                  variant={filter.severity === 'error' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilter({ ...filter, severity: 'error' })}
                >
                  <AlertCircle size={16} /> Errors ({errorsCount})
                </Button>
                <Button
                  variant={filter.severity === 'warning' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilter({ ...filter, severity: 'warning' })}
                >
                  <AlertTriangle size={16} /> Warnings ({warningsCount})
                </Button>
                
                <div className="w-px h-6 bg-[var(--color-glass-border)] mx-2" />
                
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={filter.category === cat ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setFilter({ 
                      ...filter, 
                      category: filter.category === cat ? null : cat 
                    })}
                    className="capitalize"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            )}

            {/* Issues Grid (Accordion Style) */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                  Audit Findings
                </h2>
                <span className="text-xs font-mono text-[var(--color-text-tertiary)] uppercase">{filteredIssuesCount} issues shown</span>
              </div>
              
              <IssueList
                issues={results.issues}
                selectedIssue={selectedIssue}
                onSelectIssue={setSelectedIssue}
                filter={filter}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!results && !isScanning && (
          <div className="mt-8 py-12 border-2 border-dashed border-[var(--color-glass-border)] rounded-3xl bg-[var(--color-bg-tertiary)]/30">
            <EmptyState
              icon={<Search size={48} strokeWidth={1.5} />}
              title="Ready to Audit"
              description="Enter a website URL or paste HTML code to get started. We will analyze accessibility and suggest standards-compliant improvements."
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-glass-border)] mt-24 bg-[var(--color-bg-tertiary)]/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={20} className="text-[var(--color-accent)]" />
                <span className="font-bold text-lg">Accessibility Audit</span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-md">
                Helping developers build more inclusive web experiences through accessibility auditing and real-time standards compliance checks.
              </p>
            </div>
            <div className="flex flex-col md:items-end gap-6">
              <div className="flex items-center gap-8">
                <a 
                  href="https://www.w3.org/WAI/WCAG21/quickref/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors underline-offset-4 hover:underline"
                >
                  WCAG Quick Ref
                </a>
                <a 
                  href="https://www.w3.org/WAI/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors underline-offset-4 hover:underline"
                >
                  W3C WAI
                </a>
              </div>
              <p className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-2">
                Built with <Accessibility size={14} /> accessibility in mind • WCAG 2.1 Compliant
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

