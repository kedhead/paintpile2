'use client';

interface FeedTabsProps {
  activeTab: 'following' | 'discover';
  onTabChange: (tab: 'following' | 'discover') => void;
}

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="flex border-b border-border">
      {(['following', 'discover'] as const).map((tab) => (
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
