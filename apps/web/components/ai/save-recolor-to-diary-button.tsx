'use client';

import { useState } from 'react';
import { BookPlus, Loader2, Check } from 'lucide-react';
import { useCreateDiaryEntry } from '../../hooks/use-diary';

interface SaveRecolorToDiaryButtonProps {
  projectName: string;
  recolorImageUrl: string;
}

export function SaveRecolorToDiaryButton({ projectName, recolorImageUrl }: SaveRecolorToDiaryButtonProps) {
  const createDiary = useCreateDiaryEntry();
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await createDiary.mutateAsync({
      title: `Recolor: ${projectName}`,
      content: `AI recolor experiment for "${projectName}".`,
      links: [{ label: 'Recolored Image', url: recolorImageUrl }],
      tags: ['recolor', 'ai'],
    });
    setSaved(true);
  };

  return (
    <button
      onClick={handleSave}
      disabled={saved || createDiary.isPending}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
        saved
          ? 'bg-green-500/20 text-green-400'
          : 'border border-border bg-card text-foreground hover:bg-muted'
      }`}
    >
      {createDiary.isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : saved ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <BookPlus className="h-3.5 w-3.5" />
      )}
      {saved ? 'Saved to Diary!' : 'Save to Diary'}
    </button>
  );
}
