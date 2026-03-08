'use client';

interface PaintSuggestion {
  area: string;
  hex: string;
  paints: { brand: string; name: string; type: string }[];
  technique: string;
}

interface PaintSuggestionsPanelProps {
  suggestions: PaintSuggestion[];
  overallScheme?: string;
  paletteType?: string;
}

export function PaintSuggestionsPanel({ suggestions, overallScheme, paletteType }: PaintSuggestionsPanelProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Paint Suggestions</h3>

      {overallScheme && (
        <p className="text-xs text-gray-500">
          <span className="font-medium text-gray-700">Scheme:</span> {overallScheme}
          {paletteType && ` (${paletteType})`}
        </p>
      )}

      <div className="space-y-3">
        {suggestions.map((s, i) => (
          <div key={i} className="rounded-md border border-gray-100 p-3">
            <div className="flex items-center gap-2">
              <div
                className="h-5 w-5 rounded border border-gray-200"
                style={{ backgroundColor: s.hex }}
              />
              <span className="text-sm font-medium text-gray-900">{s.area}</span>
            </div>
            <div className="mt-2 space-y-1">
              {s.paints.map((p, j) => (
                <p key={j} className="text-xs text-gray-600">
                  <span className="font-medium">{p.brand}</span> {p.name}
                  <span className="ml-1 text-gray-400">({p.type})</span>
                </p>
              ))}
            </div>
            {s.technique && (
              <p className="mt-1.5 text-xs italic text-gray-500">{s.technique}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
