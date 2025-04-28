"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ViewChart from "../../components/ViewChart";
import PersonalViewTable from "../../components/PersonalViewTable";
import { Button } from "@/components/ui/button";
import ArticleViewTable from "@/components/ArticleViewTable";
import DepartmentViewTable from "@/components/DepartmentViewTable";
import { useEffect, useState } from "react";

export default function Home() {
  const [allArticles, setAllArticles] = useState([]);
  const [activeComponent, setActiveComponent] = useState("department"); // 초기값 설정

  useEffect(() => {
    fetch("/api/fetchAllArticles")
      .then((response) => response.json())
      .then((data) => {
        setAllArticles(data);
        console.log("data", data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  if (allArticles.length === 0) {
    return <div>Loading...</div>;
  }

  const handleButtonClick = (component) => {
    setActiveComponent(component);
  };

  return (
    <main>
      <Card className="m-8">
        <CardHeader>
          <CardTitle>영남일보 조회수 현황</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <ViewChart newsData={allArticles} />
          <div className="m-2 rounded-lg border bg-card shadow-sm grid grid-cols-3 gap-2 p-2">
            <Button variant={activeComponent === "department" ? "secondary" : "ghost"} onClick={() => handleButtonClick("department")}>
              부서별 조회수
            </Button>
            <Button variant={activeComponent === "reporter" ? "secondary" : "ghost"} onClick={() => handleButtonClick("reporter")}>
              기자별 조회수
            </Button>
            <Button variant={activeComponent === "article" ? "secondary" : "ghost"} onClick={() => handleButtonClick("article")}>
              기사별 조회수
            </Button>
          </div>
          <div className="flex justify-between">
            {activeComponent === "department" && <DepartmentViewTable newsData={allArticles} />}
            {activeComponent === "reporter" && <PersonalViewTable newsData={allArticles} />}
            {activeComponent === "article" && <ArticleViewTable newsData={allArticles} />}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </main>
  );
}
