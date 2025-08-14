"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
}



const BuseChart = ({ newsdata }) => {
  

  return (
    <Card className="m-0 sm:m-2">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="flex ">
          <div>
            <CardTitle className="text-base sm:text-lg">자체기사 현황 (부서별)</CardTitle>
            <CardDescription className="text-xs sm:text-sm">ㄹㅎㅁㄴㄹㅁ</CardDescription>
          </div>
          <div className="">
            {/* <Button variant={activeComponent === "3month" ? "secondary" : "ghost"} onClick={() => handleButtonClick("3month")}>
              최근 3개월
            </Button> */}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default BuseChart;
