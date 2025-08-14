"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import StatsSection from "@/components/sections/StatsSection";
import ViewsSection from "@/components/sections/ViewsSection";

export default function Home() {
  const [activeMainComponent, setActiveMainComponent] = useState("stats"); // 상단 버튼용 상태

  const handleMainButtonClick = (component) => {
    setActiveMainComponent(component);
  };

  return (
    <main>
      <div className="m-0 sm:m-2 rounded-lg border bg-card shadow-sm grid grid-cols-2 gap-2 p-2">
        <Button variant={activeMainComponent === "stats" ? "secondary" : "ghost"} onClick={() => handleMainButtonClick("stats")}>
          <span className="md:hidden">자체기사 통계</span>
          <span className="hidden md:inline-block">자체기사 통계</span>
        </Button>
        <Button variant={activeMainComponent === "views" ? "secondary" : "ghost"} onClick={() => handleMainButtonClick("views")}>
          <span className="md:hidden">조회수</span>
          <span className="hidden md:inline-block">조회수</span>
        </Button>
      </div>

      {activeMainComponent === "stats" && (
        <StatsSection />
      )}

      {activeMainComponent === "views" && (
        <ViewsSection />
      )}
    </main>
  );
}
