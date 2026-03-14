'use client';

import { useState } from 'react';
import { Button, Card, Tabs, Badge } from './ui';
import { 
  Globe, 
  FileCode, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb, 
  History, 
  ArrowRight,
  Brain,
  Sparkles,
  Loader2,
  Trash2,
  Info
} from 'lucide-react';

export function HtmlInput({ html, onHtmlChange, onScan, isScanning }) {
  const [mode, setMode] = useState('url'); // 'url' | 'paste'
  const [url, setUrl] = useState('');
  const [fetchError, setFetchError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [scanStatus, setScanStatus] = useState(null); // 'fetching' | 'scanned' | null

  // Combined fetch and scan flow
  const handleFetchAndScan = async () => {
    if (!url.trim()) return;
    
    setFetchError(null);
    setScanStatus('fetching');
    setIsFetching(true);
    
    try {
      // Step 1: Fetching
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setFetchError(data.error || 'Failed to fetch URL');
        setScanStatus(null);
        return;
      }
      
      onHtmlChange(data.html);
      
      // Step 2: Scanning (trigger audit)
      setScanStatus('analyzing');
      await onScan(data.html, url.trim());
      
      setScanStatus('done');
    } catch (error) {
      setFetchError(error.message || 'Failed to fetch URL');
      setScanStatus(null);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[var(--color-accent)]/10 rounded-xl">
            <History size={22} className="text-[var(--color-accent)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Audit Source</h2>
            <p className="text-sm text-[var(--color-text-tertiary)]">URL or HTML Code</p>
          </div>
        </div>
        <Tabs
          tabs={[
            { id: 'url', label: 'Website URL' },
            { id: 'paste', label: 'HTML Snippet' }
          ]}
          activeTab={mode}
          onChange={(id) => {
            setMode(id);
            setFetchError(null);
            if (id === 'paste') {
              onHtmlChange('');
            }
          }}
        />
      </div>

      {mode === 'url' ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="url-input" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Website URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setFetchError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && url.trim()) {
                    handleFetchAndScan();
                  }
                }}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-glass-border)] rounded-lg 
                         text-[var(--color-text-primary)] text-base min-h-[44px]
                         placeholder:text-[var(--color-text-tertiary)]
                         focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20
                         transition-all"
              />
              <Button 
                variant="primary" 
                onClick={handleFetchAndScan}
                disabled={!url.trim() || isFetching || isScanning}
                loading={isFetching || isScanning}
                className="px-8"
              >
                {!isFetching && !isScanning && <Search size={18} />}
                Scan
              </Button>
            </div>
            
            {fetchError && (
              <div className="mt-2 p-3 bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 rounded-lg">
                <p className="text-sm text-[var(--color-error)] flex items-center gap-2">
                  <AlertTriangle size={16} /> {fetchError}
                </p>
              </div>
            )}
          </div>

            {scanStatus === 'fetching' && (
              <div className="mt-2 p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-glass-border)] rounded-lg animate-fade-in">
                <p className="text-sm text-[var(--color-text-primary)] flex items-center gap-2 font-medium">
                  <Globe size={16} className="animate-spin text-[var(--color-accent)]" /> Fetching page content...
                </p>
              </div>
            )}

            {scanStatus === 'analyzing' && (
              <div className="mt-2 p-3 bg-[var(--color-info-bg)] border border-[var(--color-info)]/20 rounded-lg animate-fade-in">
                <p className="text-sm text-[var(--color-info)] flex items-center gap-2 font-medium">
                  <Search size={16} className="animate-pulse" /> Analyzing accessibility...
                </p>
              </div>
            )}

            {scanStatus === 'done' && (
              <div className="mt-2 p-3 bg-[var(--color-success-bg)] border border-[var(--color-success)]/20 rounded-lg animate-fade-in">
                <p className="text-sm text-[var(--color-success)] flex items-center gap-2 font-medium">
                  <CheckCircle2 size={16} /> Analysis complete. Scroll down to view result
                </p>
              </div>
            )}



          <div className="p-5 bg-[var(--color-bg-secondary)] border border-[var(--color-glass-border)] rounded-xl mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={20} className="text-[var(--color-warning)]" />
              <h3 className="font-bold text-[var(--color-text-primary)]">Accessibility Tips</h3>
            </div>
            <ul className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-1.5 flex-shrink-0" />
                Enter a website URL to automatically fetch and audit its accessibility.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-1.5 flex-shrink-0" />
                The audit covers WCAG 2.1 standards including ARIA, structure, and readability.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-1.5 flex-shrink-0" />
                Switch to "HTML Snippet" to test specific components or private code.
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <label htmlFor="html-input" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              HTML Content
            </label>
            <textarea
              id="html-input"
              value={html}
              onChange={(e) => onHtmlChange(e.target.value)}
              placeholder="Paste your HTML code here..."
              className="w-full h-64 p-4 bg-[var(--color-bg-tertiary)] border border-[var(--color-glass-border)] rounded-lg 
                       text-[var(--color-text-primary)] font-mono text-sm resize-none
                       placeholder:text-[var(--color-text-tertiary)]
                       focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20
                       transition-all"
            />
            {html && (
              <button
                onClick={() => onHtmlChange('')}
                className="absolute top-8 right-2 p-1.5 rounded-md bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-primary)] transition-all cursor-pointer active:scale-90 hover:scale-110"
                aria-label="Clear input"
              >
                <Trash2 size={14} className="text-[var(--color-text-tertiary)]" />
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-sm text-[var(--color-text-tertiary)] flex items-center gap-2">
              <FileCode size={14} />
              {html ? `${html.length.toLocaleString()} characters` : 'No content'}
            </span>
            <Button 
              variant="primary" 
              onClick={onScan}
              disabled={!html.trim() || isScanning}
              loading={isScanning}
              className="w-full sm:w-auto"
            >
              {!isScanning && <Search size={18} />}
              Scan for Issues
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function BeforeAfterPreview({ issue, suggestion }) {
  if (!issue || !suggestion) return null;

  return (
    <Card className="p-0 overflow-hidden bg-[var(--color-bg-primary)] border-[var(--color-glass-border)] shadow-md">
      <div className="p-4 border-b border-[var(--color-glass-border)] bg-[var(--color-bg-tertiary)]/50">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)] flex items-center gap-2">
          <Sparkles size={16} /> Before / After Comparison
        </h3>
      </div>
      
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Before */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-[var(--color-error)]" />
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">Before (Inaccessible)</span>
            </div>
            <div className="p-4 bg-[var(--color-bg-tertiary)] border border-[var(--color-error)]/20 rounded-lg">
              <pre className="text-sm font-mono text-[var(--color-text-primary)] overflow-x-auto whitespace-pre-wrap">
                {issue.element}
              </pre>
            </div>
          </div>

          {/* After */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-[var(--color-success)]" />
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">After (Accessible)</span>
            </div>
            <div className="p-4 bg-[var(--color-bg-tertiary)] border border-[var(--color-success)]/20 rounded-lg">
              <pre className="text-sm font-mono text-[var(--color-text-primary)] overflow-x-auto whitespace-pre-wrap">
                {suggestion.fixedCode || issue.fix?.suggestion}
              </pre>
            </div>
          </div>
        </div>

        {suggestion.explanation && (
          <div className="mt-8 p-4 bg-[var(--color-bg-tertiary)] rounded-xl border border-[var(--color-glass-border)]/50 flex gap-4">
            <Info size={20} className="text-[var(--color-text-primary)] flex-shrink-0" />
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              <strong className="text-[var(--color-text-primary)]">Why this works:</strong> {suggestion.explanation}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

