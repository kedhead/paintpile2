'use client';

import Link from 'next/link';
import { Users, Palette, Database, Download, Trash2, Shield, Award, Trophy, Newspaper, Globe, Workflow, ExternalLink, Megaphone } from 'lucide-react';

const adminTools = [
  {
    title: 'Manage Users',
    description: 'Search users by email, toggle AI features and Pro subscriptions',
    icon: Users,
    href: '/admin/manage-users',
  },
  {
    title: 'Seed Paints',
    description: 'Seed the paint database with comprehensive paint data',
    icon: Palette,
    href: '/admin/seed-paints',
  },
  {
    title: 'Import from GitHub',
    description: 'Import paint data from the miniature-paints GitHub repository',
    icon: Database,
    href: '/admin/import-github-paints',
  },
  {
    title: 'Scrape Paints',
    description: 'Scrape paint data from manufacturer websites',
    icon: Globe,
    href: '/admin/scrape-paints',
  },
  {
    title: 'Manage Badges',
    description: 'Create, edit, and manage achievement badges',
    icon: Award,
    href: '/admin/badges',
  },
  {
    title: 'Manage Challenges',
    description: 'Create and manage hobby challenges',
    icon: Trophy,
    href: '/admin/challenges',
  },
  {
    title: 'Manage Ads',
    description: 'Create and manage feed ads and sponsored content',
    icon: Megaphone,
    href: '/admin/ads',
  },
  {
    title: 'Manage News',
    description: 'Create, edit, and publish news posts',
    icon: Newspaper,
    href: '/admin/news',
  },
  {
    title: 'Clear Paint Database',
    description: 'Remove all non-custom paints from the database',
    icon: Trash2,
    href: '/admin/clear-paints',
  },
  {
    title: 'System Backup',
    description: 'Export all collections as a JSON backup file',
    icon: Download,
    href: '/admin/backup',
  },
  {
    title: 'Grant Admin',
    description: 'Grant or revoke admin privileges using setup secret',
    icon: Shield,
    href: '/admin/grant-admin',
  },
];

const externalTools = [
  {
    title: 'n8n Workflows',
    description: 'Manage automated social media promotion and other workflows',
    icon: Workflow,
    href: 'http://65.75.201.180:5678',
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">Manage your Paintpile instance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.href} href={tool.href}>
              <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer h-full">
                <Icon className="w-8 h-8 text-primary mb-3" />
                <h2 className="text-lg font-semibold text-foreground">{tool.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
              </div>
            </Link>
          );
        })}
        {externalTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <a key={tool.href} href={tool.href} target="_blank" rel="noopener noreferrer">
              <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer h-full">
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-8 h-8 text-primary" />
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">{tool.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
