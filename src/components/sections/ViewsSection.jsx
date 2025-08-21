import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import LevelChart from "../charts/LevelChart";
import ViewChart from "../charts/ViewChart";
import DepartmentViewTable from "../tables/DepartmentViewTable";
import PersonalViewTable from "../tables/PersonalViewTable";
import ArticleViewTable from "../tables/ArticleViewTable";
import { useSmartDataLoader } from "@/hooks/useDataCache";

const ViewsSection = () => {
  const [activeViewComponent, setActiveViewComponent] = useState("department");
  
  // 기본 파라미터 설정
  const defaultParams = {
    from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(),
    to: new Date().toISOString(),
    limit: '50000'
  };
  
  // 스마트 데이터 로더 사용
  const { data: allArticles, isLoading: isLoadingViews, error, loadData } = useSmartDataLoader(defaultParams);

  // 컴포넌트가 마운트될 때 데이터 로드
  useEffect(() => {
    loadData(defaultParams);
  }, []);

  const handleViewButtonClick = (component) => {
    setActiveViewComponent(component);
  };

  if (isLoadingViews) {
    return (
      <div className="flex flex-col justify-center items-center py-16 space-y-4">
        <div className="text-lg">데이터를 불러오는 중...</div>
        <div className="w-64 bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
        </div>
        <div className="text-sm text-gray-500">최근 1년 데이터를 로드하고 있습니다</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center py-16 space-y-4">
        <div className="text-lg text-red-600">데이터 로딩 중 오류가 발생했습니다</div>
        <div className="text-sm text-gray-500">{error}</div>
        <Button onClick={() => loadData(defaultParams)}>다시 시도</Button>
      </div>
    );
  }

  if (!allArticles || allArticles.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-lg">표시할 데이터가 없습니다</div>
      </div>
    );
  }

  return (
    <>
      <div>
        <LevelChart newsData={allArticles} />
      </div>
      <div>
        <ViewChart newsData={allArticles} />
      </div>
      <div className="m-0 sm:m-2 rounded-lg border bg-card shadow-sm grid grid-cols-3 gap-2 p-2">
        <Button variant={activeViewComponent === "department" ? "secondary" : "ghost"} onClick={() => handleViewButtonClick("department")}>
          <span className="md:hidden">부서별</span>
          <span className="hidden md:inline-block">부서별 조회수</span>
        </Button>
        <Button variant={activeViewComponent === "reporter" ? "secondary" : "ghost"} onClick={() => handleViewButtonClick("reporter")}>
          <span className="md:hidden">기자별</span>
          <span className="hidden md:inline-block">기자별 조회수</span>
        </Button>
        <Button variant={activeViewComponent === "article" ? "secondary" : "ghost"} onClick={() => handleViewButtonClick("article")}>
          <span className="md:hidden">기사별</span>
          <span className="hidden md:inline-block">기사별 조회수</span>
        </Button>
      </div>
      <div className="flex justify-between">
        {activeViewComponent === "department" && <DepartmentViewTable newsData={allArticles} />}
        {activeViewComponent === "reporter" && <PersonalViewTable newsData={allArticles} />}
        {activeViewComponent === "article" && <ArticleViewTable newsData={allArticles} />}
      </div>
    </>
  );
};

export default ViewsSection;
