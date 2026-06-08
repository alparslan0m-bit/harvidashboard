import React from "react";

export interface FeedbackTab {
  id: string;
  name: string;
  count?: number;
}

interface FeedbackTabsProps {
  activeTab: string;
  tabs: FeedbackTab[];
  onTabChange: (tab: string) => void;
}

export const FeedbackTabs: React.FC<FeedbackTabsProps> = ({ activeTab, tabs, onTabChange }) => (
  <div className="flex border-b border-border bg-card rounded-t-xl select-none overflow-x-auto">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`px-4 py-3 text-sm font-semibold tracking-wide border-b-2 transition-all relative flex items-center gap-2 whitespace-nowrap ${
          activeTab === tab.id
            ? "border-primary text-foreground font-bold"
            : "border-transparent text-muted-foreground hover:text-foreground"
        }`}
      >
        <span>{tab.name}</span>
        {tab.count !== undefined && tab.count > 0 && (
          <span className="h-5 min-w-5 px-1.5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);
