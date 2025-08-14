import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import LevelChart from "../charts/LevelChart";
import ViewChart from "../charts/ViewChart";
import DepartmentViewTable from "../tables/DepartmentViewTable";
import PersonalViewTable from "../tables/PersonalViewTable";
import ArticleViewTable from "../tables/ArticleViewTable";

const ViewsSection = () => {
  const [activeViewComponent, setActiveViewComponent] = useState("department");
  const [allArticles, setAllArticles] = useState([]);
  const [isLoadingViews, setIsLoadingViews] = useState(true);

  // 컴포넌트가 마운트될 때 데이터 fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/fetchAllArticles");
        const data = await response.json();
        setAllArticles(data);
        console.log("ViewsSection data:", data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingViews(false);
      }
    };

    fetchData();
  }, []);

  const handleViewButtonClick = (component) => {
    setActiveViewComponent(component);
  };

  if (isLoadingViews || allArticles.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-lg">데이터를 불러오는 중...</div>
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
