"use client";
import React, { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getWeekKey, getMonthKey } from "@/lib/dateUtils";

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

// 뉴스 데이터를 주별 조회수 데이터로 변환하는 함수
const transformToWeeklyData = (articles) => {
  const weeklyMap = new Map();

  articles.forEach((article) => {
    // 운세 카테고리 제외
    if (article.newsclass_names?.includes("운세")) return;

    const weekKey = getWeekKey(article.newsdate);
    const weekKeyShort = weekKey.split('T')[0]; // 날짜 부분만 추출

    // 해당 주가 map에 없으면 초기화
    if (!weeklyMap.has(weekKeyShort)) {
      weeklyMap.set(weekKeyShort, { 
        date: weekKeyShort, 
        total: 0, 
        digital: 0
      });
    }

    const weekData = weeklyMap.get(weekKeyShort);
    const refCount = Number(article.ref) || 0;
    
    weekData.total += refCount;
    
    // 디지털뉴스부인 경우 디지털 조회수에 추가
    if (article.code_name === "디지털뉴스부") {
      weekData.digital += refCount;
    }
  });

  // Map을 배열로 변환하고 시간순 정렬
  return Array.from(weeklyMap.values())
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

// 뉴스 데이터를 월별 조회수 데이터로 변환하는 함수
const transformToMonthlyData = (articles) => {
  const monthlyMap = new Map();

  articles.forEach((article) => {
    // 운세 카테고리 제외
    if (article.newsclass_names?.includes("운세")) return;

    const monthKey = getMonthKey(article.newsdate);
    const monthKeyShort = monthKey.split('T')[0]; // 날짜 부분만 추출

    // 해당 월이 map에 없으면 초기화
    if (!monthlyMap.has(monthKeyShort)) {
      monthlyMap.set(monthKeyShort, { 
        date: monthKeyShort, 
        total: 0, 
        digital: 0
      });
    }

    const monthData = monthlyMap.get(monthKeyShort);
    const refCount = Number(article.ref) || 0;
    
    monthData.total += refCount;
    
    // 디지털뉴스부인 경우 디지털 조회수에 추가
    if (article.code_name === "디지털뉴스부") {
      monthData.digital += refCount;
    }
  });

  // Map을 배열로 변환하고 시간순 정렬
  return Array.from(monthlyMap.values())
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

const ViewChart = ({ newsData }) => {
  const [periodType, setPeriodType] = useState("weekly");
  const [selectedMonth, setSelectedMonth] = useState("all"); // 주별 차트에서 선택된 월

  // 주별 및 월별 데이터 변환
  const weeklyData = useMemo(() => {
    if (!newsData?.length) return [];
    return transformToWeeklyData(newsData);
  }, [newsData]);

  const monthlyData = useMemo(() => {
    if (!newsData?.length) return [];
    return transformToMonthlyData(newsData);
  }, [newsData]);

  // 주별 데이터에서 사용 가능한 월 목록 생성
  const availableMonths = useMemo(() => {
    if (periodType !== "weekly" || !weeklyData.length) return [];
    
    const months = new Set();
    weeklyData.forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    
    return Array.from(months).sort().reverse().map(monthKey => {
      const [year, month] = monthKey.split('-');
      return {
        value: monthKey,
        label: `${year}년 ${parseInt(month)}월`
      };
    });
  }, [weeklyData, periodType]);

  // newsData를 주별/월별 데이터로 변환하고 필터링
  const filteredData = useMemo(() => {
    if (!newsData?.length) return [];

    // 데이터 변환
    const transformedData = periodType === "weekly" ? weeklyData : monthlyData;
    
    // 월별 데이터의 경우 필터링하지 않고 모든 데이터를 보여줌 (최근 1년간)
    if (periodType === "monthly") {
      return transformedData;
    }
    
    // 주별 데이터 필터링
    if (selectedMonth === "all") {
      // 전체 주별 데이터 (3개월 필터링 적용)
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - FILTER_MONTHS);
      return transformedData.filter((item) => new Date(item.date) >= cutoffDate);
    } else {
      // 선택된 월의 주별 데이터만 필터링
      const [year, month] = selectedMonth.split('-');
      return transformedData.filter((item) => {
        const date = new Date(item.date);
        const itemYear = date.getFullYear();
        const itemMonth = date.getMonth() + 1;
        return itemYear === parseInt(year) && itemMonth === parseInt(month);
      });
    }
  }, [newsData, periodType, selectedMonth, weeklyData, monthlyData]);


  return (
    <Card className="m-0 sm:m-2 w-full max-w-7xl mx-auto">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-2 space-y-0 border-b py-5">
        <div className="flex-1">
          <div>
            <CardTitle className="text-base sm:text-lg">
              디지털팀 조회수 현황 ({periodType === "weekly" ? "주별" : "월별"})
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {periodType === "weekly" ? "매주 일요일 ~ 토요일 기준" : "월별 기준"}
            </CardDescription>
          </div>
        </div>
        <div className="flex gap-2">
          <Select 
            onValueChange={(value) => setPeriodType(value)} 
            value={periodType}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="기간" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>기간 타입</SelectLabel>
                <SelectItem value="weekly">주별</SelectItem>
                <SelectItem value="monthly">월별</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          {/* 주별 차트일 때만 월 선택 셀렉트 표시 */}
          {periodType === "weekly" && availableMonths.length > 0 && (
            <Select 
              onValueChange={(value) => setSelectedMonth(value)} 
              value={selectedMonth}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="월 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>월 선택</SelectLabel>
                  <SelectItem value="all">전체 (최근 3개월)</SelectItem>
                  {availableMonths.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer className="aspect-auto h-[200px] sm:h-[250px] w-full" config={CHART_CONFIG}>
          <AreaChart className="-ml-2 sm:-ml-4" data={filteredData}>
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
              tickFormatter={(value) => {
                if (periodType === "weekly") {
                  return formatDate(value);
                } else {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}월`;
                }
              }}
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
                  labelFormatter={(value) => {
                    if (periodType === "weekly") {
                      return formatDate(value);
                    } else {
                      const date = new Date(value);
                      return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
                    }
                  }}
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
