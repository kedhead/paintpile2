'use client';

export type FeedTab = 'following' | 'discover' | 'gallery' | 'people';

interface FeedTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
}

const TABS: { id: FeedTab; label: string }[] = [
  { id: 'following', label: 'Following' },
  { id: 'discover', label: 'Discover' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'people', label: 'People' },
];

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="flex border-b border-border">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === id
              ? 'border-b-2 border-primary-600 text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
