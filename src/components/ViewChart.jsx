"use client";
import React, { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import weeklyDepartmentVisits from "@/app/_utils/weeklyDepartmentVisits";
import transformWeeklyDataToChartData from "@/app/_utils/transformWeeklyDataToChartData";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const chartData = [
  { date: "2024-04-01", total: 222, digital: 150 },
  { date: "2024-04-02", total: 97, digital: 180 },
  { date: "2024-04-03", total: 167, digital: 120 },
  { date: "2024-04-04", total: 242, digital: 260 },
  { date: "2024-04-05", total: 373, digital: 290 },
];
const departments = ["전체 부서", "경북부(지역)", "디지털뉴스부", "경제_산업팀", "경북본사", "사회1팀", "콘텐츠_문화팀", "사회2팀", "경제_경제팀", "사진팀", "정치_서울본부", "기획취재부", "편집국", "콘텐츠_체육팀", "정치_대구", "사회3팀", "경제", "편집팀", "디지털국", "디지털컨텐츠팀", "정치", "논설실"];

// const chartConfig = departments.reduce((acc, dept, index) => {
//   acc[dept] = {
//     label: dept,
//     color: `hsl(var(--chart-${index + 1}))`,
//   };
//   return acc;
// }, {});

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  total: {
    label: "전체부서",
    color: "hsl(var(--chart-1))",
  },
  digital: {
    label: "디지털뉴스부",
    color: "hsl(var(--chart-2))",
  },
};

// const getSafeId = (dept) => dept.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "");

const ViewChart = ({ newsData }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const data = weeklyDepartmentVisits(newsData);
    const filteredData = transformWeeklyDataToChartData(data);
    setChartData(filteredData);
  }, [newsData]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2025-03-01");

    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - 90);
    return date >= startDate;
  });
  return (
    <Card className="m-2">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>부서별 조회수 현황</CardTitle>
          <CardDescription></CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
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
                return date.toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickCount={3} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area dataKey="디지털뉴스부" type="natural" fill="url(#filldigital)" fillOpacity={0.4} stroke="var(--color-digital)" stackId="a" />
            <Area dataKey="전체부서" type="natural" fill="url(#filltotal)" fillOpacity={0.4} stroke="var(--color-total)" stackId="a" />
            {/* <ChartLegend content={<ChartLegendContent nameKey="label" />} /> */}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ViewChart;
