'use client';

import { Globe } from 'lucide-react';
import { CommunityGallery } from '../../../components/community/community-gallery';

export default function CommunityPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Community Hub</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Browse public projects from the community
      </p>
      <CommunityGallery />
    </div>
  );
}
