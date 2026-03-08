'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Users, Palette, Database, Download, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../../../components/auth-provider';

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

export default function AdminDashboard() {
  const { pb, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const record = await pb.collection('users').getOne(user!.id);
        setIsAdmin(record.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
      setLoading(false);
    }
    if (user) check();
  }, [user, pb]);

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return <div className="text-center py-16"><Shield className="w-12 h-12 text-destructive mx-auto mb-4" /><h1 className="text-2xl font-bold text-foreground">Access Denied</h1><p className="text-muted-foreground mt-2">You do not have admin privileges.</p></div>;

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
      </div>
    </div>
  );
}
