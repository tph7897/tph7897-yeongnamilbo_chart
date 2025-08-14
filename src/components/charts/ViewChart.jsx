"use client";
import React, { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const CHART_CONFIG = {
  total: {
    label: "전체부서",
    color: "hsl(var(--chart-1))",
  },
  digital: {
    label: "디지털뉴스부",
    color: "hsl(var(--chart-2))",
  },
};

const FILTER_MONTHS = 3;

// 숫자를 한글 단위로 변환하는 함수
const formatKoreanNumber = (value) => {
  if (value >= 1e8) return `${Math.round(value / 1e7) / 10}억`;
  if (value >= 1e4) return `${Math.round(value / 1e3) / 10}만`;
  return value.toLocaleString();
};

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day}`;
};

const ViewChart = ({ newsData }) => {
  // 뉴스 데이터를 주별 조회수 데이터로 변환하는 함수
  const transformToWeeklyData = (articles) => {
    const weeklyMap = new Map();

    articles.forEach((article) => {
      // 운세 카테고리 제외
      if (article.newsclass_names?.includes("운세")) return;

      // 뉴스 날짜를 Date 객체로 변환
      const articleDate = new Date(article.newsdate);
      
      // 해당 날짜가 속한 주의 일요일을 구함
      const weekSunday = new Date(articleDate);
      weekSunday.setDate(articleDate.getDate() - articleDate.getDay());
      
      // 그 주의 토요일 날짜 계산 (일요일 + 6일)
      const weekSaturday = new Date(weekSunday);
      weekSaturday.setDate(weekSunday.getDate() + 6);
      weekSaturday.setHours(0, 0, 0, 0);
      
      const weekKey = weekSaturday.toISOString();
      const timestamp = weekSaturday.getTime();

      // 해당 주가 map에 없으면 초기화
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, { 
          date: weekKey, 
          total: 0, 
          digital: 0, 
          timestamp 
        });
      }

      const weekData = weeklyMap.get(weekKey);
      const refCount = Number(article.ref) || 0;
      
      weekData.total += refCount;
      
      // 디지털뉴스부인 경우 디지털 조회수에 추가
      if (article.code_name === "디지털뉴스부") {
        weekData.digital += refCount;
      }
    });

    // Map을 배열로 변환하고 시간순 정렬
    return Array.from(weeklyMap.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(({ timestamp, ...rest }) => rest); // timestamp 제거
  };

  // newsData를 주별 데이터로 변환하고 최근 3개월로 필터링
  const filteredWeeklyData = useMemo(() => {
    if (!newsData?.length) return [];

    // 데이터 변환
    const weeklyData = transformToWeeklyData(newsData);
    
    // 3개월 전 날짜 계산
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - FILTER_MONTHS);
    
    // 필터링된 데이터 반환
    return weeklyData.filter((item) => new Date(item.date) >= cutoffDate);
  }, [newsData]);


  return (
    <Card className="m-0 sm:m-2 w-full max-w-7xl mx-auto">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-2 space-y-0 border-b py-5">
        <div className="flex-1">
          <div>
            <CardTitle className="text-base sm:text-lg">디지털팀 조회수 현황 (주별)</CardTitle>
            <CardDescription className="text-xs sm:text-sm">매주 일요일 ~ 토요일 기준</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer className="aspect-auto h-[200px] sm:h-[250px] w-full" config={CHART_CONFIG}>
          <AreaChart className="-ml-2 sm:-ml-4" data={filteredWeeklyData}>
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
              tickMargin={4}
              angle={45}
              textAnchor="middle"
              tick={{ fontSize: 8, fontFamily: "inherit" }}
              tickFormatter={formatDate}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tickCount={3}
              tick={{ fontSize: 8, fontFamily: "inherit" }}
              tickFormatter={formatKoreanNumber}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={formatDate}
                  indicator="dot"
                />
              }
            />
            <Area 
              dataKey="digital" 
              type="linear" 
              fill="url(#filldigital)" 
              fillOpacity={0.4} 
              stroke="var(--color-digital)" 
              stackId="a" 
            />
            <Area 
              dataKey="total" 
              type="linear" 
              fill="url(#filltotal)" 
              fillOpacity={0.4} 
              stroke="var(--color-total)" 
              stackId="a" 
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ViewChart;
