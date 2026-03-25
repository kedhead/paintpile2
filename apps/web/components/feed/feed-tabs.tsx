'use client';

type FeedTab = 'following' | 'discover' | 'gallery';

interface FeedTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
}

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="flex border-b border-border">
      {(['following', 'discover', 'gallery'] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`flex-1 px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
            activeTab === tab
              ? 'border-b-2 border-primary-600 text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
