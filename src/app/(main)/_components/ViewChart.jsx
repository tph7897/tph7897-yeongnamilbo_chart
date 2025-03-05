"use client";
import React, { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
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

const ViewChart = ({ newsData }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const data = weeklyDepartmentVisits(newsData);
    const filteredData = transformWeeklyDataToChartData(data);
    console.log("filteredData", filteredData);
    setChartData(filteredData);
  }, [newsData]);

  const [timeRange, setTimeRange] = React.useState("90d");
  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2025-03-01");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });
  return (
    <Card className="m-2">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>부서별 조회수 현황 Chart</CardTitle>
          <CardDescription></CardDescription>
        </div>
        {/* <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto" aria-label="Select a value">
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select> */}
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
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
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
            <Area dataKey="digital" type="natural" fill="url(#filldigital)" stroke="var(--color-digital)" stackId="a" />
            <Area dataKey="total" type="natural" fill="url(#filltotal)" stroke="var(--color-total)" stackId="a" />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ViewChart;
