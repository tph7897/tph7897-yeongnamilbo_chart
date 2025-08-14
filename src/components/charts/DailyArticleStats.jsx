"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import transformNewsDataToWeeklyData from "@/app/_utils/transformWeeklyDataToChartData";




const DailyArticleStats = ({ newsData }) => {
  // 어제 날짜 계산
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const year = yesterday.getFullYear().toString().slice(-2);
    const month = (yesterday.getMonth() + 1).toString().padStart(2, '0');
    const date = yesterday.getDate().toString().padStart(2, '0');
    
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = days[yesterday.getDay()];
    
    return `${year}-${month}-${date} (${dayName})`;
  };

  return (
    <Card className="m-0 sm:m-2">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="flex ">
          <div>
            <CardTitle className="text-base sm:text-lg">자체 기사 통계</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>오늘 자체기사 현황</CardTitle>
              <CardDescription>오늘 출고된 기사의 갯수 입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div>자체기사 : 준비 중...</div>
              <div>출고기사 : 준비 중...</div>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>오늘 출고기사 현황</CardTitle>
              <CardDescription>자체기사/출고기사 비율 입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div>준비 중...</div>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>어제 출고기사</CardTitle>
              <CardDescription>{getYesterdayDate()} 기준 자체기사 비율</CardDescription>
            </CardHeader>
            <CardContent>
              <div>준비 중...</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyArticleStats;
