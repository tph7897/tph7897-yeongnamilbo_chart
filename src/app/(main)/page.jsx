"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import StatsSection from "@/components/sections/StatsSection";
import ViewsSection from "@/components/sections/ViewsSection";

// 탭 구성 상수
const TABS = {
  STATS: "stats",
  VIEWS: "views"
};

const TAB_CONFIG = [
  {
    id: TABS.STATS,
    label: "자체기사 통계",
    component: StatsSection
  },
  {
    id: TABS.VIEWS,
    label: "조회수",
    component: ViewsSection
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState(TABS.STATS);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const renderTabButtons = () => (
    <div className="m-0 sm:m-2 rounded-lg border bg-card shadow-sm grid grid-cols-2 gap-2 p-2">
      {TAB_CONFIG.map(({ id, label }) => (
        <Button
          key={id}
          variant={activeTab === id ? "secondary" : "ghost"}
          onClick={() => handleTabChange(id)}
        >
          <span className="md:hidden">{label}</span>
          <span className="hidden md:inline-block">{label}</span>
        </Button>
      ))}
    </div>
  );

  const renderActiveSection = () => {
    const activeTabConfig = TAB_CONFIG.find(tab => tab.id === activeTab);
    if (!activeTabConfig) return null;
    
    const Component = activeTabConfig.component;
    return <Component />;
  };

  return (
    <main>
      {renderTabButtons()}
      {renderActiveSection()}
    </main>
  );
}
