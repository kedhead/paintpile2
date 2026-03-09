'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Crosshair, Loader2 } from 'lucide-react';
import { findTopMatches, type PaintMatch } from '../../lib/color-math';
import { usePaintDatabase } from '../../hooks/use-paints';
import { useMyInventory } from '../../hooks/use-paints';

export function ColorMatcher() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [sampledColor, setSampledColor] = useState<string | null>(null);
  const [matches, setMatches] = useState<PaintMatch[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { data: paintsResult } = usePaintDatabase();
  const { data: inventory } = useMyInventory();

  const paints = (paintsResult?.pages.flatMap((p) => p.items) || []) as unknown as { id: string; name: string; brand: string; hex_color: string }[];
  const ownedIds = new Set((inventory || []).map((i) => i.paint as string));

  const handleImageLoad = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);

      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;

      setSampledColor(hex);
      if (paints.length > 0) {
        setMatches(findTopMatches(hex, paints, 5));
      }
    },
    [paints]
  );

  const handleFileDrop = useCallback((e: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = 'dataTransfer' in e ? e.dataTransfer.files : (e.target as HTMLInputElement).files;
    if (!files?.[0]) return;
    const url = URL.createObjectURL(files[0]);
    setImageUrl(url);
    setSampledColor(null);
    setMatches([]);
  }, []);

  return (
    <div className="space-y-4">
      {!imageUrl ? (
        <div
          onDrop={handleFileDrop}
          onDragOver={(e) => e.preventDefault()}
          className="rounded-lg border-2 border-dashed border-border p-12 text-center"
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Drop an image or{' '}
            <label className="cursor-pointer text-primary hover:underline">
              browse
              <input type="file" accept="image/*" className="hidden" onChange={handleFileDrop} />
            </label>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Source"
              className="hidden"
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
            />
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="max-h-[400px] w-full cursor-crosshair rounded-lg object-contain"
            />
            <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
              <Crosshair className="h-3 w-3" />
              Click to sample a color
            </div>
          </div>

          {sampledColor && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <div className="h-10 w-10 rounded-lg border border-border" style={{ backgroundColor: sampledColor }} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{sampledColor.toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">Sampled color</p>
                </div>
              </div>

              {matches.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">Closest Paints</h3>
                  {matches.map((match, i) => (
                    <div key={match.paintId} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
                      <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                      <div className="h-6 w-6 rounded-full border border-border" style={{ backgroundColor: match.hex }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{match.name}</p>
                        <p className="text-xs text-muted-foreground">{match.brand}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ΔE {match.deltaE.toFixed(1)}
                      </span>
                      {ownedIds.has(match.paintId) && (
                        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                          Owned
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => {
              if (imageUrl) URL.revokeObjectURL(imageUrl);
              setImageUrl(null);
              setSampledColor(null);
              setMatches([]);
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear image
          </button>
        </div>
      )}
    </div>
  );
}
