'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Check, X, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../../../components/auth-provider';

interface UserResult {
  id: string;
  email: string;
  name: string;
  username: string;
  role: string;
  ai_enabled: boolean;
  subscription: string;
  created: string;
  updated: string;
}

export default function ManageUsersPage() {
  const { pb } = useAuth();
  const [email, setEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<UserResult | null>(null);
  const [userList, setUserList] = useState<UserResult[]>([]);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  async function searchUser() {
    setSearching(true);
    setError('');
    setFoundUser(null);
    setUserList([]);
    try {
      const res = await fetch('/api/admin/search-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pbToken: pb.authStore.token, email }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.users) {
          setUserList(data.users);
        } else {
          setFoundUser(data.user);
        }
      } else {
        setError(data.error || 'User not found');
      }
    } catch {
      setError('Failed to search');
    }
    setSearching(false);
  }

  async function toggleAccess(field: 'aiEnabled' | 'proTier') {
    if (!foundUser) return;
    setUpdating(true);
    try {
      const body: Record<string, unknown> = { pbToken: pb.authStore.token, userId: foundUser.id };
      if (field === 'aiEnabled') body.aiEnabled = !foundUser.ai_enabled;
      if (field === 'proTier') body.proTier = foundUser.subscription !== 'pro';

      const res = await fetch('/api/admin/update-user-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setFoundUser(data.user);
      } else {
        setError(data.error || 'Failed to update');
      }
    } catch {
      setError('Failed to update');
    }
    setUpdating(false);
  }

  function selectUser(user: UserResult) {
    setFoundUser(user);
    setUserList([]);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Manage Users</h1>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search by email, name, username, or * for all..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchUser()}
          className="flex-1 px-3 py-2 bg-muted border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={searchUser}
          disabled={searching || !email}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* User list from wildcard search */}
      {userList.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{userList.length} users found</p>
          <div className="border border-border rounded-lg divide-y divide-border">
            {userList.map((u) => (
              <button
                key={u.id}
                onClick={() => selectUser(u)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {u.name || u.username || 'No name'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2 text-xs shrink-0 ml-3">
                  <span className="text-muted-foreground">
                    {new Date(u.created).toLocaleDateString()}
                  </span>
                  {u.role === 'admin' && (
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-primary font-medium">
                      admin
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {foundUser && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">User Details</h2>
            {userList.length === 0 && (
              <button
                onClick={() => { setFoundUser(null); setEmail('*'); searchUser(); }}
                className="text-xs text-primary hover:underline"
              >
                Back to list
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>
              <span className="ml-2 text-foreground font-medium">{foundUser.name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Username:</span>
              <span className="ml-2 text-foreground font-medium">{foundUser.username || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <span className="ml-2 text-foreground font-medium">{foundUser.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground">ID:</span>
              <span className="ml-2 text-foreground font-mono text-xs">{foundUser.id}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Role:</span>
              <span className="ml-2 text-foreground font-medium">{foundUser.role || 'user'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Joined:</span>
              <span className="ml-2 text-foreground">{new Date(foundUser.created).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">AI Features</p>
                <p className="text-xs text-muted-foreground">Enable/disable AI-powered tools</p>
              </div>
              <button
                onClick={() => toggleAccess('aiEnabled')}
                disabled={updating}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  foundUser.ai_enabled
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-muted text-muted-foreground border border-border'
                }`}
              >
                {foundUser.ai_enabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {foundUser.ai_enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">Pro Subscription</p>
                <p className="text-xs text-muted-foreground">Toggle Pro tier access</p>
              </div>
              <button
                onClick={() => toggleAccess('proTier')}
                disabled={updating}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  foundUser.subscription === 'pro'
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-muted text-muted-foreground border border-border'
                }`}
              >
                {foundUser.subscription === 'pro' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {foundUser.subscription === 'pro' ? 'Pro' : 'Free'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
