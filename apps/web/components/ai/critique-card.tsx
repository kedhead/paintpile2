'use client';

import { CheckCircle, AlertTriangle } from 'lucide-react';

interface CritiqueData {
  score: number;
  grade: string;
  analysis: string;
  colors: string;
  technical_strengths: string[];
  improvements: string[];
  createdAt: string;
}

interface CritiqueCardProps {
  critique: CritiqueData;
}

const GRADE_COLORS: Record<string, string> = {
  S: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  A: 'bg-green-100 text-green-800 border-green-300',
  B: 'bg-blue-100 text-blue-800 border-blue-300',
  C: 'bg-gray-100 text-gray-800 border-gray-300',
  D: 'bg-orange-100 text-orange-800 border-orange-300',
  F: 'bg-red-100 text-red-800 border-red-300',
};

export function CritiqueCard({ critique }: CritiqueCardProps) {
  const gradeStyle = GRADE_COLORS[critique.grade] || GRADE_COLORS.C;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
      {/* Score + Grade Header */}
      <div className="flex items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={critique.score >= 75 ? '#22c55e' : critique.score >= 50 ? '#3b82f6' : '#f59e0b'}
              strokeWidth="3"
              strokeDasharray={`${critique.score}, 100`}
            />
          </svg>
          <span className="absolute text-sm font-bold text-gray-900">{critique.score}</span>
        </div>
        <div>
          <span className={`inline-block rounded-md border px-2 py-0.5 text-lg font-bold ${gradeStyle}`}>
            {critique.grade}
          </span>
          <p className="mt-1 text-xs text-gray-500">AI Critique</p>
        </div>
      </div>

      {/* Analysis */}
      <p className="text-sm text-gray-700">{critique.analysis}</p>

      {/* Colors */}
      {critique.colors && (
        <p className="text-xs text-gray-500">
          <span className="font-medium text-gray-700">Color palette:</span> {critique.colors}
        </p>
      )}

      {/* Strengths */}
      {critique.technical_strengths?.length > 0 && (
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-700">Strengths</h4>
          <ul className="space-y-1">
            {critique.technical_strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm text-gray-600">
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {critique.improvements?.length > 0 && (
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700">Improvements</h4>
          <ul className="space-y-1">
            {critique.improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm text-gray-600">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
