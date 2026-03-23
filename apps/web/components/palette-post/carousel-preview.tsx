'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TutorialCard } from './tutorial-card';
import type { PalettePostData } from '../../lib/palette-post-types';

interface CarouselPreviewProps {
  data: PalettePostData;
  size?: number;
}

export function CarouselPreview({ data, size = 400 }: CarouselPreviewProps) {
  const [current, setCurrent] = useState(0);

  const cards = buildCards(data);
  const total = cards.length;

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(total - 1, c + 1));

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-border bg-muted text-sm text-muted-foreground"
        style={{ width: size, height: size }}
      >
        Add content to preview
      </div>
    );
  }

  const card = cards[current];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center gap-2">
        {/* Prev arrow */}
        <button
          onClick={prev}
          disabled={current === 0}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-black/80 text-white shadow-lg transition-opacity disabled:opacity-30 hover:bg-black"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl shadow-xl">
          <TutorialCard
            type={card.type}
            title={card.title}
            stepNumber={card.stepNumber}
            description={card.description}
            imageFile={card.imageFile}
            imageUrl={card.imageUrl}
            attribution={data.attribution || 'paintpile.com'}
            paints={card.paints}
            currentCardIndex={current}
            totalCards={total}
            cardBg={data.background_color || '#ffffff'}
            size={size}
          />
        </div>

        {/* Next arrow */}
        <button
          onClick={next}
          disabled={current === total - 1}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-black/80 text-white shadow-lg transition-opacity disabled:opacity-30 hover:bg-black"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {total > 1 && (
        <p className="text-xs text-muted-foreground">
          {current + 1} / {total}
        </p>
      )}
    </div>
  );
}

export interface CardData {
  type: 'cover' | 'step';
  title?: string;
  stepNumber?: number;
  description?: string;
  imageFile?: File;
  imageUrl?: string;
  paints: import('../../lib/palette-post-types').PalettePostPaint[];
}

export function buildCards(data: PalettePostData): CardData[] {
  if (data.mode === 'single') {
    return [
      {
        type: 'cover',
        title: data.title,
        imageFile: data.coverImageFile,
        imageUrl: data.coverImageUrl,
        paints: data.paints,
      },
    ];
  }

  // Tutorial mode
  const cards: CardData[] = [];

  // Cover card
  cards.push({
    type: 'cover',
    title: data.title,
    imageFile: data.coverImageFile,
    imageUrl: data.coverImageUrl,
    paints: [],
  });

  // Step cards
  data.steps.forEach((step, i) => {
    cards.push({
      type: 'step',
      stepNumber: i + 1,
      description: step.description,
      imageFile: step.imageFile,
      imageUrl: step.imageUrl,
      paints: step.paints,
    });
  });

  return cards;
}
