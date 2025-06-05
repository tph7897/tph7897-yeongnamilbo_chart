"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import transformNewsDataToWeeklyData from "@/app/_utils/transformWeeklyDataToChartData";
import { Button } from "./ui/button";

const chartConfig = {
  total: {
    label: "전체부서",
    color: "hsl(var(--chart-1))",
  },
  digital: {
    label: "디지털뉴스부",
    color: "hsl(var(--chart-2))",
  },
};

const ViewChart = ({ newsData }) => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [activeComponent, setActiveComponent] = useState("3month"); // "year" 또는 "3month"

  useEffect(() => {
    if (newsData && newsData.length > 0) {
      const aggregated = transformNewsDataToWeeklyData(newsData);
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

  const handleButtonClick = (component) => {
    setActiveComponent(component);
  };

  return (
    <Card className="m-2">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="flex ">
          <div>
            <CardTitle>부서별 조회수 현황 (주별)</CardTitle>
            <CardDescription>매주 일요일 ~ 토요일 기준</CardDescription>
          </div>
          <div className="">
            <Button variant={activeComponent === "3month" ? "secondary" : "ghost"} onClick={() => handleButtonClick("3month")}>
              최근 3개월
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer className="aspect-auto h-[250px] w-full" config={chartConfig}>
          <AreaChart data={filteredWeeklyData}>
            <defs>
              <linearGradient id="filltotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="filldigital" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-digital)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-digital)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                return `${month}.${day}`;
              }}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickCount={3} />
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
                  indicator="dot"
                />
              }
            />
            <Area dataKey="digital" type="natural" fill="url(#filldigital)" fillOpacity={0.4} stroke="var(--color-digital)" stackId="a" />
            <Area dataKey="total" type="natural" fill="url(#filltotal)" fillOpacity={0.4} stroke="var(--color-total)" stackId="a" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ViewChart;
