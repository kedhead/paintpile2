'use client';

import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useCreatePileItem } from '../../hooks/use-pile';

interface PileItemFormData {
  name: string;
  quantity: number;
  status: string;
  description: string;
}

interface PileItemFormProps {
  onClose: () => void;
}

export function PileItemForm({ onClose }: PileItemFormProps) {
  const createItem = useCreatePileItem();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PileItemFormData>({
    defaultValues: {
      name: '',
      quantity: 1,
      status: 'not-started',
      description: '',
    },
  });

  const onSubmit = async (data: PileItemFormData) => {
    await createItem.mutateAsync({
      name: data.name.trim(),
      quantity: data.quantity,
      status: data.status,
      description: data.description.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Add to Pile of Shame</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Name</label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g. Combat Patrol: Space Marines"
              maxLength={200}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Quantity</label>
            <input
              type="number"
              {...register('quantity', { valueAsNumber: true, min: 1 })}
              min={1}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Status</label>
            <select
              {...register('status')}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
            <textarea
              {...register('description')}
              placeholder="Optional notes..."
              maxLength={1000}
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createItem.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
            >
              {createItem.isPending ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
