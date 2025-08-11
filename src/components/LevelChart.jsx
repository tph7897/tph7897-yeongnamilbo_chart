"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import transformNewsDataToWeeklyData from "@/app/_utils/transformWeeklyDataToChartData";

const chartConfig = {
  level1: {
    label: "자체",
    color: "hsl(var(--chart-1))",
  },
  level5: {
    label: "일반",
    color: "hsl(var(--chart-2))",
  },
};

// level별 주간 데이터로 변환하는 함수
function transformNewsDataToLevelWeeklyData(newsData) {
  const weeklyGroups = new Map();
  
  newsData.forEach((article) => {
    const articleDate = new Date(article.newsdate);
    const day = articleDate.getDay();
    const diff = 6 - day; // 토요일까지의 차이
    const saturday = new Date(articleDate);
    saturday.setDate(articleDate.getDate() + diff);
    saturday.setHours(0, 0, 0, 0);
    const weekKey = saturday.toISOString().split('T')[0];
    
    if (!weeklyGroups.has(weekKey)) {
      weeklyGroups.set(weekKey, {
        date: weekKey,
        level1: 0,
        level5: 0,
      });
    }
    
    const weekData = weeklyGroups.get(weekKey);
    
    if (article.level === "1") {
      weekData.level1 += 1;
    } else if (article.level === "5") {
      weekData.level5 += 1;
    }
  });
  
  return Array.from(weeklyGroups.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
}

// 숫자를 한글 단위로 변환하는 함수 추가
function formatKoreanNumber(value) {
  return value.toLocaleString();
}

const LevelChart = ({ newsData }) => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [activeComponent, setActiveComponent] = useState("3month"); // "year" 또는 "3month"

  useEffect(() => {
    if (newsData && newsData.length > 0) {
      const aggregated = transformNewsDataToLevelWeeklyData(newsData);
      setWeeklyData(aggregated);
    }
  }, [newsData]);

  // weeklyData와 activeComponent가 변경될 때마다 필터링된 데이터를 재계산합니다.
  const filteredWeeklyData = useMemo(() => {
    // 현재 날짜에서 1년 또는 3달 전의 날짜를 계산합니다.
    const cutoff = new Date();
    if (activeComponent === "year") {
      cutoff.setFullYear(cutoff.getFullYear() - 1);
    } else if (activeComponent === "3month") {
      cutoff.setMonth(cutoff.getMonth() - 3);
    }
   
    // 가공된 데이터의 date는 ISO 형식의 문자열(토요일 날짜)입니다.
    return weeklyData.filter((item) => new Date(item.date) >= cutoff);
  }, [weeklyData, activeComponent]);


  return (
    <Card className="m-0 sm:m-2">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="flex ">
          <div>
            <CardTitle className="text-base sm:text-lg">유형별 조회수 현황 (주별)</CardTitle>
            <CardDescription className="text-xs sm:text-sm">매주 일요일 ~ 토요일 기준</CardDescription>
          </div>
          <div className="">
            {/* <Button variant={activeComponent === "3month" ? "secondary" : "ghost"} onClick={() => handleButtonClick("3month")}>
              최근 3개월
            </Button> */}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer className="aspect-auto h-[250px] w-full" config={chartConfig}>
          <AreaChart className="-ml-4" data={filteredWeeklyData}>
            <defs>
              <linearGradient id="filllevel1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-level1)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-level1)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="filllevel5" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-level5)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-level5)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              angle={45}
              textAnchor="middle"
              tick={{ fontSize: 10, fontFamily: "inherit" }} // 모바일에서 더 작은 폰트
              tickFormatter={(value) => {
                const date = new Date(value);
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                return `${month}.${day}`;
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={3}
              tick={{ fontSize: 10, fontFamily: "inherit" }} // 모바일에서 더 작은 폰트
              tickFormatter={formatKoreanNumber}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    return `${month}.${day}`;
                  }}
                  formatter={(value, name, props) => {
                    const total = props.payload.level1 + props.payload.level5;
                    const percentage = total > 0 ? ((props.payload.level1 / total) * 100).toFixed(1) : 0;
                    return [name === "level1" ? `자체` : "일반", ` ${value} 건`, name === "level1" ? `(전체 대비 ${percentage}%)` : ""];
                  }}
                  indicator="dot"
                />
              }
            />
            <Area dataKey="level1" type="linear" fill="url(#filllevel1)" fillOpacity={0.4} stroke="var(--color-level1)" stackId="a" />
            <Area dataKey="level5" type="linear" fill="url(#filllevel5)" fillOpacity={0.4} stroke="var(--color-level5)" stackId="a" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default LevelChart;
