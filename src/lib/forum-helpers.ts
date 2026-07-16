import {
  Wifi, ShieldCheck, Lock, Lightbulb, Scale, MessageSquare, Radio,
  Database, Zap, Globe, Heart, Server, MessageCircle, type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Wifi, ShieldCheck, Lock, Lightbulb, Scale, MessageSquare, Radio,
  Database, Zap, Globe, Heart, Server,
};

export function getForumIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? MessageCircle;
}

const COLOR_STYLES: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  sky:     { bg: 'bg-sky-50',     text: 'text-sky-600',     border: 'border-sky-200',     gradient: 'from-sky-400 to-blue-500' },
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200',    gradient: 'from-blue-400 to-indigo-500' },
  cyan:    { bg: 'bg-cyan-50',    text: 'text-cyan-600',    border: 'border-cyan-200',    gradient: 'from-cyan-400 to-teal-500' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200',   gradient: 'from-amber-400 to-orange-500' },
  red:     { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',     gradient: 'from-red-400 to-rose-500' },
  green:   { bg: 'bg-green-50',   text: 'text-green-600',   border: 'border-green-200',   gradient: 'from-green-400 to-emerald-500' },
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-200',  gradient: 'from-orange-400 to-red-500' },
  teal:    { bg: 'bg-teal-50',    text: 'text-teal-600',    border: 'border-teal-200',    gradient: 'from-teal-400 to-cyan-500' },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-200',  gradient: 'from-purple-400 to-fuchsia-500' },
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'border-indigo-200',  gradient: 'from-indigo-400 to-blue-500' },
  pink:    { bg: 'bg-pink-50',    text: 'text-pink-600',    border: 'border-pink-200',    gradient: 'from-pink-400 to-rose-500' },
  slate:   { bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-200',   gradient: 'from-slate-400 to-slate-600' },
};

export function getForumColor(color: string) {
  return COLOR_STYLES[color] ?? COLOR_STYLES.sky;
}

export function timeAgo(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diff = Math.max(0, now - then);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return new Date(isoDate).toLocaleDateString('es-GT', { month: 'short', day: 'numeric', year: 'numeric' });
  if (days > 0) return `hace ${days}d`;
  if (hours > 0) return `hace ${hours}h`;
  if (minutes > 0) return `hace ${minutes}m`;
  return 'ahora mismo';
}
