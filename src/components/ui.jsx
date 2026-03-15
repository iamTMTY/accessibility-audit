'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ScoreCircle({ score, size = 120 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const getScoreColor = () => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 70) return '#f59e0b'; // yellow
    if (score >= 50) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth="8"
          className="stroke-[var(--color-bg-tertiary)]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-[var(--color-text-primary)]"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-label={`Accessibility score: ${score} out of 100`}>
        <span className="text-3xl font-bold text-[var(--color-text-primary)]" aria-hidden="true">
          {score}
        </span>
        <span className="text-xs text-[var(--color-text-tertiary)]" aria-hidden="true">score</span>
      </div>
    </div>
  );
}

export function StatCard({ title, value, icon, variant = 'default' }) {
  const variantStyles = {
    default: 'border-[var(--color-glass-border)] bg-[var(--color-bg-secondary)] shadow-sm hover:shadow-md transition-shadow',
    error: 'border-[var(--color-error)]/20 bg-[var(--color-error-bg)]',
    warning: 'border-[var(--color-warning)]/20 bg-[var(--color-warning-bg)]',
    success: 'border-[var(--color-success)]/20 bg-[var(--color-success-bg)]',
    info: 'border-[var(--color-info)]/20 bg-[var(--color-info-bg)]'
  };

  const iconColors = {
    default: 'text-[var(--color-text-primary)]',
    error: 'text-[var(--color-error)]',
    warning: 'text-[var(--color-warning)]',
    success: 'text-[var(--color-success)]',
    info: 'text-[var(--color-text-primary)]'
  };

  return (
    <div className={`glass rounded-xl p-4 border ${variantStyles[variant]} flex justify-center items-center`}>
      <div className="flex flex-col justify-center items-center gap-3">
        <div className={`p-3 rounded-2xl ${iconColors[variant]} bg-white dark:bg-[var(--color-bg-tertiary)] shadow-sm ring-1 ring-black/5 dark:ring-white/10`}>
          {typeof icon === 'object' ? icon : <span className="text-2xl">{icon}</span>}
        </div>
        <div className="flex flex-col justify-center items-center">
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</div>
          <div className="text-sm text-[var(--color-text-tertiary)]">{title}</div>
        </div>
      </div>
    </div>
  );
}

export function Badge({ children, variant = 'default', size = 'sm' }) {
  const variantStyles = {
    default: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
    error: 'bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[var(--color-error)]/20',
    warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning)]/20',
    success: 'bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success)]/20',
    info: 'bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--color-info)]/20',
    'wcag-a': 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-glass-border)]',
    'wcag-aa': 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-glass-border)]',
    'wcag-aaa': 'bg-[var(--color-accent)] text-white'
  };

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full uppercase tracking-wide ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
}

export function ConfidenceIndicator({ value, showLabel = true }) {
  const dots = 5;
  const activeDots = Math.round(value * dots);
  
  const getColor = () => {
    if (value >= 0.8) return 'bg-[var(--color-success)]';
    if (value >= 0.5) return 'bg-[var(--color-warning)]';
    return 'bg-[var(--color-error)]';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: dots }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i < activeDots ? getColor() : 'bg-[var(--color-bg-tertiary)]'
            }`}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-xs text-[var(--color-text-tertiary)]">
          {Math.round(value * 100)}%
        </span>
      )}
    </div>
  );
}

export function Button({ children, variant = 'primary', size = 'md', disabled, loading, onClick, className = '', ...props }) {
  const variantStyles = {
    primary: 'bg-[var(--color-accent)] text-white border border-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] shadow-md shadow-blue-500/20 active:scale-95 hover:scale-[1.02]',
    secondary: 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] border border-[var(--color-glass-border)] hover:bg-[var(--color-bg-secondary)] hover:shadow-sm active:scale-95 hover:scale-[1.02]',
    ghost: 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] active:scale-90'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base'
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg cursor-pointer
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]
        flex-shrink-0 min-h-[44px]
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}

export function Card({ children, className = '', interactive = false, ...props }) {
  return (
    <div
      className={`
        glass rounded-2xl p-6 border border-[var(--color-glass-border)] shadow-[0_8px_30px_rgb(0,0,0,0.04)]
        ${interactive ? 'cursor-pointer hover:bg-[var(--color-bg-secondary)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]' : ''}
        transition-all duration-300 ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-1 bg-[var(--color-bg-tertiary)] p-1.5 rounded-xl border border-[var(--color-glass-border)]/50 shadow-inner overflow-hidden max-w-max">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer active:scale-95
            ${
              activeTab === tab.id
                ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm'
                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)]/50'
            }
          `}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
              activeTab === tab.id ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' : 'bg-[var(--color-bg-tertiary)]'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse bg-[var(--color-bg-tertiary)] rounded-md ${className}`}
      {...props}
    />
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      {icon && (
        <div className="w-20 h-20 mb-6 text-[var(--color-text-tertiary)] opacity-50">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--color-text-secondary)] max-w-sm mb-6">
        {description}
      </p>
      {action}
    </div>
  );
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-all cursor-pointer active:rotate-45 active:scale-90"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
