'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, LayoutGrid, Columns, Loader2 } from 'lucide-react';
import { useAuth } from '../../../components/auth-provider';
import { LoginPrompt } from '../../../components/auth/login-prompt';
import { useMyProjects, usePublicProjects } from '../../../hooks/use-projects';
import { ProjectList } from '../../../components/projects/project-list';
import { ProjectKanban } from '../../../components/projects/project-kanban';
import { CreateProjectDialog } from '../../../components/projects/create-project-dialog';
import { useMyArmies } from '../../../hooks/use-armies';
import { ArmyList } from '../../../components/armies/army-list';
import { ArmyForm } from '../../../components/armies/army-form';

type ProjectTab = 'my' | 'armies' | 'discover';

function ProjectsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as ProjectTab) || (user ? 'my' : 'discover');
  const [tab, setTab] = useState<ProjectTab>(
    ['my', 'armies', 'discover'].includes(initialTab) ? initialTab : (user ? 'my' : 'discover')
  );
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateArmy, setShowCreateArmy] = useState(false);
  const myProjects = useMyProjects();
  const publicProjects = usePublicProjects();
  const myArmies = useMyArmies();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        <div className="flex items-center gap-2">
          {tab === 'my' && (
            <div className="flex rounded-lg border border-border">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-l-lg p-2 ${viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`rounded-r-lg p-2 ${viewMode === 'kanban' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="Kanban view"
              >
                <Columns className="h-4 w-4" />
              </button>
            </div>
          )}
          {tab === 'armies' ? (
            user ? (
              <button
                onClick={() => setShowCreateArmy(true)}
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
            )
          ) : (
            user ? (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
              >
                <Plus className="h-4 w-4" />
                New Project
              </button>
            ) : (
              <LoginPrompt action="create a project">
                {(open) => (
                  <button
                    onClick={open}
                    className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
                  >
                    <Plus className="h-4 w-4" />
                    New Project
                  </button>
                )}
              </LoginPrompt>
            )
          )}
        </div>
      </div>

      {/* Tabs */}
      {user && (
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => setTab('my')}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === 'my' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            My Projects
          </button>
          <button
            onClick={() => setTab('armies')}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === 'armies' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            My Armies
          </button>
          <button
            onClick={() => setTab('discover')}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === 'discover' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Discover
          </button>
        </div>
      )}

      {tab === 'armies' ? (
        user ? (
          <ArmyList
            query={myArmies}
            emptyMessage="No armies yet. Create your first army collection!"
            onCreateClick={() => setShowCreateArmy(true)}
          />
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">Sign in to manage your army collections.</p>
          </div>
        )
      ) : tab === 'my' ? (
        viewMode === 'kanban' ? (
          <ProjectKanban />
        ) : (
          <ProjectList
            query={myProjects}
            emptyMessage="No projects yet. Create your first painting project!"
          />
        )
      ) : (
        <ProjectList
          query={publicProjects}
          emptyMessage="No public projects to discover yet."
        />
      )}

      {showCreate && <CreateProjectDialog onClose={() => setShowCreate(false)} />}
      {showCreateArmy && <ArmyForm onClose={() => setShowCreateArmy(false)} />}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    }>
      <ProjectsContent />
    </Suspense>
  );
}
