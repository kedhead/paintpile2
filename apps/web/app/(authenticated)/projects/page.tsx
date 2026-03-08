'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useMyProjects, usePublicProjects } from '../../../hooks/use-projects';
import { ProjectList } from '../../../components/projects/project-list';
import { CreateProjectDialog } from '../../../components/projects/create-project-dialog';

export default function ProjectsPage() {
  const [tab, setTab] = useState<'my' | 'discover'>('my');
  const [showCreate, setShowCreate] = useState(false);
  const myProjects = useMyProjects();
  const publicProjects = usePublicProjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Tabs */}
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
          onClick={() => setTab('discover')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === 'discover' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Discover
        </button>
      </div>

      {tab === 'my' ? (
        <ProjectList
          query={myProjects}
          emptyMessage="No projects yet. Create your first painting project!"
        />
      ) : (
        <ProjectList
          query={publicProjects}
          emptyMessage="No public projects to discover yet."
        />
      )}

      {showCreate && <CreateProjectDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}
