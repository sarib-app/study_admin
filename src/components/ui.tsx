import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface p-6 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  accent = 'accent',
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  accent?: 'accent' | 'gold' | 'bio' | 'danger';
}) {
  const accentClass = {
    accent: 'bg-accent-soft text-accent',
    gold: 'bg-[rgba(255,201,77,0.16)] text-gold',
    bio: 'bg-[rgba(52,211,153,0.16)] text-bio',
    danger: 'bg-[rgba(255,107,107,0.16)] text-danger',
  }[accent];

  return (
    <Card className="flex items-center gap-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentClass}`}>
        <Icon size={20} strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold leading-tight text-ink">{value}</p>
        <p className="truncate text-xs font-semibold text-faint">{label}</p>
      </div>
    </Card>
  );
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'danger' }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:
      'bg-gradient-to-br from-accent to-accent2 text-white shadow-[0_6px_14px_rgba(91,127,255,0.35)] hover:brightness-110',
    outline: 'border border-line bg-white/[0.02] text-ink hover:bg-white/[0.05]',
    danger: 'border border-[rgba(255,107,107,0.35)] bg-[rgba(255,107,107,0.08)] text-danger hover:bg-[rgba(255,107,107,0.14)]',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-line bg-bg/60 px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-faint focus:border-accent ${props.className ?? ''}`}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-line bg-bg/60 px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-faint focus:border-accent ${props.className ?? ''}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-line bg-bg/60 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent ${props.className ?? ''}`}
    />
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'danger' }) {
  const tones = {
    neutral: 'bg-white/[0.06] text-soft',
    accent: 'bg-accent-soft text-accent',
    danger: 'bg-[rgba(255,107,107,0.14)] text-danger',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p className="mt-3 text-sm font-medium text-danger">{children}</p>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="py-8 text-center text-sm text-faint">{children}</p>;
}
