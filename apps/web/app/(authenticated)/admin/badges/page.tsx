'use client';

import { useState } from 'react';
import { Award, Loader2, Upload } from 'lucide-react';
import { useAuth } from '../../../../components/auth-provider';
import { useAllBadges } from '../../../../hooks/use-badges';
import { BADGE_DEFINITIONS } from '../../../../lib/badge-definitions';
import { BadgeCard } from '../../../../components/badges/badge-card';

export default function AdminBadgesPage() {
  const { pb } = useAuth();
  const { data: allBadges = [], isLoading, refetch } = useAllBadges();
  const [seeding, setSeeding] = useState(false);

  const handleSeedBadges = async () => {
    setSeeding(true);
    try {
      const existingNames = new Set(allBadges.map((b) => b.name));
      let created = 0;
      for (const def of BADGE_DEFINITIONS) {
        if (existingNames.has(def.name)) continue;
        await pb.collection('badges').create({
          name: def.name,
          description: def.description,
          category: def.category,
          tier: def.tier,
          icon: def.icon,
          color: def.color,
          points: def.points,
          hidden: def.hidden,
          trigger_type: def.trigger_type,
          trigger_field: def.trigger_field,
          trigger_value: def.trigger_value,
        });
        created++;
      }
      alert(`Seeded ${created} new badges`);
      refetch();
    } catch (error) {
      console.error('Seed error:', error);
      alert('Failed to seed badges');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Manage Badges</h1>
        </div>
        <button
          onClick={handleSeedBadges}
          disabled={seeding}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
        >
          {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Seed Badges ({BADGE_DEFINITIONS.length} definitions)
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        {allBadges.length} badges in database
      </p>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {allBadges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} earned />
          ))}
        </div>
      )}
    </div>
  );
}
