export type TimelineEventType =
  | 'project_created'
  | 'project_updated'
  | 'photo_added'
  | 'paint_added'
  | 'recipe_created'
  | 'recipe_updated'
  | 'technique_added'
  | 'status_changed'
  | 'annotation_added';

export interface TimelineEvent {
  eventId: string;
  projectId: string;
  userId: string;
  type: TimelineEventType;
  timestamp: string;
  metadata: TimelineEventMetadata;
}

export interface TimelineEventMetadata {
  photoId?: string;
  photoUrl?: string;
  photoCaption?: string;
  paintId?: string;
  paintName?: string;
  paintBrand?: string;
  recipeId?: string;
  recipeName?: string;
  recipeDescription?: string;
  techniqueId?: string;
  techniqueName?: string;
  techniqueCategory?: string;
  oldStatus?: string;
  newStatus?: string;
  description?: string;
}

export const TIMELINE_EVENT_LABELS: Record<TimelineEventType, string> = {
  project_created: 'Project Created',
  project_updated: 'Project Updated',
  photo_added: 'Photo Added',
  paint_added: 'Paint Added',
  recipe_created: 'Recipe Created',
  recipe_updated: 'Recipe Updated',
  technique_added: 'Technique Added',
  status_changed: 'Status Changed',
  annotation_added: 'Annotation Added',
};
