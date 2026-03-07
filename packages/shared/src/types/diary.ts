export interface DiaryLink {
  url: string;
  description?: string;
  type: 'youtube' | 'article' | 'image' | 'other';
}

export interface DiaryEntry {
  entryId: string;
  userId: string;
  title: string;
  content: string;
  links: DiaryLink[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DiaryEntryFormData {
  title: string;
  content: string;
  links: DiaryLink[];
  tags: string[];
}
