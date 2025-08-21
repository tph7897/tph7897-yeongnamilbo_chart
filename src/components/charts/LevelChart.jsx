"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getWeekKey, getMonthKey, formatMonth } from "@/lib/dateUtils";

const chartConfig = {
  level1: {
    label: "자체",
    color: "hsl(var(--chart-1))",
  },
  levelOthers: {
    label: "비자체",
    color: "hsl(var(--chart-2))",
  },
};

// level별 주간 데이터로 변환하는 함수
function transformNewsDataToLevelWeeklyData(newsData) {
  const weeklyGroups = new Map();
  
  newsData.forEach((article) => {
    const weekKey = getWeekKey(article.newsdate);
    const weekKeyShort = weekKey.split('T')[0]; // 날짜 부분만 추출
    
    if (!weeklyGroups.has(weekKeyShort)) {
      weeklyGroups.set(weekKeyShort, {
        date: weekKeyShort,
        level1: 0,
        levelOthers: 0,
      });
    }
    
    const weekData = weeklyGroups.get(weekKeyShort);
    
    if (article.level === "1") {
      weekData.level1 += 1;
    } else {
      // 1등급이 아닌 모든 등급(2, 5등급 등)은 비자체로 분류
      weekData.levelOthers += 1;
    }
  });
  
  return Array.from(weeklyGroups.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
}

// level별 월별 데이터로 변환하는 함수
function transformNewsDataToLevelMonthlyData(newsData) {
  const monthlyGroups = new Map();
  
  newsData.forEach((article) => {
    const monthKey = getMonthKey(article.newsdate);
    const monthKeyShort = monthKey.split('T')[0]; // 날짜 부분만 추출
    
    if (!monthlyGroups.has(monthKeyShort)) {
      monthlyGroups.set(monthKeyShort, {
        date: monthKeyShort,
        level1: 0,
        levelOthers: 0,
      });
    }
    
    const monthData = monthlyGroups.get(monthKeyShort);
    
    if (article.level === "1") {
      monthData.level1 += 1;
    } else {
      // 1등급이 아닌 모든 등급(2, 5등급 등)은 비자체로 분류
      monthData.levelOthers += 1;
    }
  });
  
  return Array.from(monthlyGroups.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
}

// 숫자를 한글 단위로 변환하는 함수 추가
function formatKoreanNumber(value) {
  return value.toLocaleString();
}

const LevelChart = ({ newsData }) => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [periodType, setPeriodType] = useState("weekly");
  const [selectedMonth, setSelectedMonth] = useState("all"); // 주별 차트에서 선택된 월

  useEffect(() => {
    if (newsData && newsData.length > 0) {
      const weeklyAggregated = transformNewsDataToLevelWeeklyData(newsData);
      const monthlyAggregated = transformNewsDataToLevelMonthlyData(newsData);
      setWeeklyData(weeklyAggregated);
      setMonthlyData(monthlyAggregated);
    }
  }, [newsData]);

  // 현재 선택된 기간 타입에 따른 데이터
  const currentData = periodType === "weekly" ? weeklyData : monthlyData;

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

  // currentData와 periodType, selectedMonth가 변경될 때마다 필터링된 데이터를 재계산합니다.
  const filteredData = useMemo(() => {
    // 월별 데이터의 경우 필터링하지 않고 모든 데이터를 보여줌 (최근 1년간)
    if (periodType === "monthly") {
      return currentData;
    }
    
    // 주별 데이터 필터링
    if (selectedMonth === "all") {
      // 전체 주별 데이터 (3개월 필터링 적용)
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - 3);
      return currentData.filter((item) => new Date(item.date) >= cutoffDate);
    } else {
      // 선택된 월의 주별 데이터만 필터링
      const [year, month] = selectedMonth.split('-');
      return currentData.filter((item) => {
        const date = new Date(item.date);
        const itemYear = date.getFullYear();
        const itemMonth = date.getMonth() + 1;
        return itemYear === parseInt(year) && itemMonth === parseInt(month);
      });
    }
  }, [currentData, periodType, selectedMonth]);


  return (
    <Card className="m-0 sm:m-2 w-full max-w-7xl mx-auto">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-2 space-y-0 border-b py-5">
        <div className="flex-1">
          <div>
            <CardTitle className="text-base sm:text-lg">
              자체기사 현황 ({periodType === "weekly" ? "주별" : "월별"})
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
        <ChartContainer className="aspect-auto h-[200px] sm:h-[250px] w-full" config={chartConfig}>
          <AreaChart className="-ml-2 sm:-ml-4" data={filteredData}>
            <defs>
              <linearGradient id="filllevel1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-level1)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-level1)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="filllevelOthers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-levelOthers)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-levelOthers)" stopOpacity={0.1} />
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
              tick={{ fontSize: 8, fontFamily: "inherit" }} // 더 작은 폰트
              tickFormatter={(value) => {
                if (periodType === "weekly") {
                  const date = new Date(value);
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  return `${month}.${day}`;
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
                      const date = new Date(value);
                      const month = String(date.getMonth() + 1).padStart(2, "0");
                      const day = String(date.getDate()).padStart(2, "0");
                      return `${month}.${day}`;
                    } else {
                      const date = new Date(value);
                      return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
                    }
                  }}
                  formatter={(value, name, props) => {
                    const total = props.payload.level1 + props.payload.levelOthers;
                    const percentage = total > 0 ? ((props.payload.level1 / total) * 100).toFixed(1) : 0;
                    return [name === "level1" ? `자체` : "비자체", ` ${value} 건`, name === "level1" ? `(전체 대비 ${percentage}%)` : ""];
                  }}
                  indicator="dot"
                />
              }
            />
            <Area dataKey="level1" type="linear" fill="url(#filllevel1)" fillOpacity={0.4} stroke="var(--color-level1)" stackId="a" />
            <Area dataKey="levelOthers" type="linear" fill="url(#filllevelOthers)" fillOpacity={0.4} stroke="var(--color-levelOthers)" stackId="a" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default LevelChart;
