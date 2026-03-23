'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../../../components/auth-provider';
import { LoginPrompt } from '../../../components/auth/login-prompt';
import { useMyArmies } from '../../../hooks/use-armies';
import { ArmyList } from '../../../components/armies/army-list';
import { ArmyForm } from '../../../components/armies/army-form';

export default function ArmiesPage() {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const myArmies = useMyArmies();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Armies</h1>
        {user ? (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
          >
            <Plus className="h-4 w-4" />
            New Army
          </button>
        ) : (
          <LoginPrompt action="create an army">
            {(open) => (
              <button
                onClick={open}
                className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
              >
                <Plus className="h-4 w-4" />
                New Army
              </button>
            )}
          </LoginPrompt>
        )}
      </div>

      {user ? (
        <ArmyList
          query={myArmies}
          emptyMessage="No armies yet. Create your first army collection!"
          onCreateClick={() => setShowCreate(true)}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Sign in to manage your army collections.</p>
        </div>
      )}

      {showCreate && <ArmyForm onClose={() => setShowCreate(false)} />}
    </div>
  );
}
