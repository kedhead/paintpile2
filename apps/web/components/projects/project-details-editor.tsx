'use client';

import { useEffect, useRef, useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../auth-provider';
import { useToast } from '../ui/toast';
import { queryKeys } from '../../lib/query-keys';
import { asStringArray, asSwatches, KINDS, SOURCES, STYLES, TECHNIQUES, type Option, type Swatch } from '../../lib/project-details';

function Select({ label, value, options, onChange }: { label: string; value: string; options: Option[]; onChange: (v: string) => void }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

/**
 * Owner-side editor for the details shown on the public project page:
 * what it is, how it was painted, and the color scheme (detected from the cover).
 */
export function ProjectDetailsEditor({ project }: { project: RecordModel }) {
  const { pb } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [kind, setKind] = useState<string>(project.kind || '');
  const [source, setSource] = useState<string>(project.source || '');
  const [style, setStyle] = useState<string>(project.style || '');
  const [techniques, setTechniques] = useState<string[]>(asStringArray(project.techniques));
  const [scheme, setScheme] = useState<Swatch[]>(asSwatches(project.color_scheme));
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const autoDetected = useRef(false);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(project.id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.my() });
  };

  const detect = async (silent = false) => {
    setDetecting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/color-scheme`, {
        method: 'POST',
        headers: { Authorization: pb.authStore.token },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Color detection failed');
      setScheme(asSwatches(body.colorScheme));
      refresh();
    } catch (err) {
      if (!silent) toast(err instanceof Error ? err.message : 'Color detection failed', 'error');
    } finally {
      setDetecting(false);
    }
  };

  // First visit after adding a cover: fill the color scheme in automatically.
  // (`color_scheme` is only present once the field exists in PocketBase.)
  useEffect(() => {
    if (autoDetected.current) return;
    if (project.cover_photo && 'color_scheme' in project && asSwatches(project.color_scheme).length === 0) {
      autoDetected.current = true;
      detect(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id, project.cover_photo]);

  const toggleTechnique = (id: string) =>
    setTechniques((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  const save = async () => {
    setSaving(true);
    try {
      await pb.collection('projects').update(project.id, { kind, source, style, techniques });
      refresh();
      toast('Details saved');
    } catch {
      toast('Could not save details', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Showcase details</h3>
        <p className="text-xs text-muted-foreground">Shown on your public project page and used for search.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Select label="What is it?" value={kind} options={KINDS} onChange={setKind} />
        <Select label="Source" value={source} options={SOURCES} onChange={setSource} />
        <Select label="Style" value={style} options={STYLES} onChange={setStyle} />
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Techniques</span>
        <div className="flex flex-wrap gap-1.5">
          {TECHNIQUES.map((t) => {
            const on = techniques.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTechnique(t.id)}
                aria-pressed={on}
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  on ? 'border-primary bg-primary/15 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Color scheme</span>
          {project.cover_photo && (
            <button
              type="button"
              onClick={() => detect()}
              disabled={detecting}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-60"
            >
              {detecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {scheme.length ? 'Re-detect from cover' : 'Detect from cover'}
            </button>
          )}
        </div>
        {scheme.length ? (
          <div className="flex flex-wrap gap-1.5">
            {scheme.map((s) => (
              <span key={s.name} className="flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs text-foreground">
                <span className="h-3 w-3 rounded-full" style={{ background: s.hex }} aria-hidden />
                {s.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {project.cover_photo ? 'Detected automatically from your cover photo.' : 'Add a cover photo to detect colors.'}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary/85 disabled:opacity-60"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save details
        </button>
      </div>
    </section>
  );
}
