import {
  Target, Boxes, Paintbrush, Sparkles, Users, Trophy, Newspaper,
  type LucideIcon,
} from 'lucide-react';

export const STATS = [
  { value: '4,700+', label: 'Paints in database' },
  { value: 'Free',   label: 'To start, always' },
  { value: 'AI',     label: 'Critique & suggestions' },
  { value: 'Active', label: 'Community' },
];

export interface FeatureItem {
  icon: LucideIcon;
  label: string;
  desc: string;
  /** static Tailwind classes for the tinted icon square */
  iconClasses: string;
}

export const FEATURES: FeatureItem[] = [
  {
    icon: Target,
    label: 'Project Tracking',
    iconClasses: 'bg-primary/10 border-primary/20 text-primary-tint',
    desc: 'Kanban board for every miniature. Move pieces from backlog to done and watch your army grow.',
  },
  {
    icon: Boxes,
    label: 'The Pile',
    iconClasses: 'bg-gold/10 border-gold/20 text-gold',
    desc: 'Tame your unpainted backlog. Log, prioritize, and celebrate every box that leaves "the pile".',
  },
  {
    icon: Paintbrush,
    label: 'Paint Inventory',
    iconClasses: 'bg-success/10 border-success/20 text-success',
    desc: '4,700+ paints from Citadel, Vallejo, Army Painter and more. Know what you have before you buy.',
  },
  {
    icon: Sparkles,
    label: 'AI Tools',
    iconClasses: 'bg-primary/10 border-primary/20 text-primary-tint',
    desc: 'Upload a photo and get detailed critique, paint recommendations, and recipe generation in seconds.',
  },
  {
    icon: Users,
    label: 'Social Feed',
    iconClasses: 'bg-social/10 border-social/20 text-social',
    desc: 'Share your WIPs and finished pieces. Follow painters you admire and get inspired daily.',
  },
  {
    icon: Trophy,
    label: 'Challenges & Badges',
    iconClasses: 'bg-gold/10 border-gold/20 text-gold',
    desc: 'Join painting challenges, earn community badges, and push your skills with monthly themes.',
  },
];

export const AI_BULLETS = [
  'Photo critique with specific technique feedback',
  'Paint match suggestions from 4,700+ paints',
  'Recipe generation for any colour scheme',
];

export const COMMUNITY_ITEMS: FeatureItem[] = [
  {
    icon: Users,
    label: 'Community Groups',
    iconClasses: 'bg-success/10 border-success/20 text-success',
    desc: "Join groups around your faction, brand, or style. Warhammer 40k, Age of Sigmar, Contrast painters — there's a home for everyone.",
  },
  {
    icon: Newspaper,
    label: 'Social Feed',
    iconClasses: 'bg-social/10 border-social/20 text-social',
    desc: 'A focused feed of miniature painting. No noise. Just WIPs, finished pieces, and inspiration from painters you follow.',
  },
  {
    icon: Trophy,
    label: 'Monthly Challenges',
    iconClasses: 'bg-gold/10 border-gold/20 text-gold',
    desc: 'Community-run painting challenges every month. Compete, collaborate, and earn exclusive badges for your profile.',
  },
];

export const PRINCIPLES = [
  { quote: 'No algorithm. No noise. Just minis.', sub: 'The feed shows painters you follow, in order.' },
  { quote: 'Your pile of shame is a feature.', sub: 'Every unpainted box is a project waiting to start.' },
  { quote: 'Built by painters, for painters.', sub: 'Every feature comes from the community.' },
];

export const FREE_FEATURES = [
  'Unlimited projects & The Pile',
  'Full paint inventory (4,700+ paints)',
  'Social feed, groups & challenges',
  '150 AI credits / month',
  'Community recipes & tutorials',
];

export const PRO_FEATURES = [
  'Everything in Free',
  '1,500 AI credits / month (10× more)',
  'No feed advertisements',
  'Priority AI image upscaling',
  'Exclusive Pro badge on profile',
];
