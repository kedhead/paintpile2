'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { StepBuildSlides } from './step-build-slides';
import { StepCardCustomization } from './step-card-customization';
import { StepExportShare } from './step-export-share';
import type { PalettePostData } from '../../lib/palette-post-types';

const STEPS = ['Build Slides', 'Customize', 'Export'];

const DEFAULT_DATA: PalettePostData = {
  title: '',
  paints: [],
  media: [],
  theme: 'light',
  background_color: '#ffffff',
  layout: 'grid',
  caption: '',
  is_public: false,
  mode: 'tutorial',
  steps: [],
  attribution: 'paintpile.com',
};

export function PalettePostWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<PalettePostData>(DEFAULT_DATA);

  const updateData = useCallback((updates: Partial<PalettePostData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const canNext =
    step === 0
      ? data.title.trim().length > 0 &&
        (data.mode === 'single' || data.steps.length > 0)
      : true;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i === step
                  ? 'bg-primary text-white'
                  : i < step
                  ? 'cursor-pointer bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </button>
            <span
              className={`hidden text-sm sm:inline ${
                i === step ? 'font-medium text-foreground' : 'text-muted-foreground'
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="mx-2 h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {step === 0 && <StepBuildSlides data={data} onChange={updateData} />}
        {step === 1 && <StepCardCustomization data={data} onChange={updateData} />}
        {step === 2 && <StepExportShare data={data} onChange={updateData} />}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:invisible"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {step < STEPS.length - 1 && (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
