"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import LineChart from "@/app/(main)/_components/LineChart";
import { useEffect, useState } from "react";
import ViewTable from "./_components/ViewTable";
import ViewChart from "./_components/ViewChart";
import PersonalViewTable from "./_components/PersonalViewTable";

export default function Home() {
  const [allArticles, setAllArticles] = useState([]);

  useEffect(() => {
    fetch("/api/fetchAllArticles")
      .then((response) => response.json())
      .then((data) => {
        // console.log("Fetched data:", data); // Debugging API response
        const thresholdDate = new Date("2025-02-23T00:00:00.000Z");

        const filteredData = data.filter((item) => {
          // newsdate가 thresholdDate 이전이면 false 반환
          return new Date(item.newsdate) >= thresholdDate;
        });

        // console.log(filteredData);
        setAllArticles(filteredData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // console.log("Current state:", allArticles); // Logs after state updates

  if (allArticles.length === 0) {
    return <div>Loading...</div>;
  }
  return (
    <main>
      <Card className="m-8">
        <CardHeader>
          <CardTitle>영남일보 조회수 현황</CardTitle>
          <CardDescription>일주일 단위 조회수 체크 매주 토요일 24:00 기준</CardDescription>
        </CardHeader>
        <CardContent>
          {/* <LineChart newsData={allArticles} /> */}
          <ViewChart newsData={allArticles} />
          <div className="flex justify-between">
            <ViewTable newsData={allArticles} />
            <PersonalViewTable newsData={allArticles} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </main>
  );
}
