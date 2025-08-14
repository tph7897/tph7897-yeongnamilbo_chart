"use client";
import React, { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getNameDepartment } from "@/app/data/userMapping";

const chartConfig = {
  totalArticles: {
    label: "전체 기사",
    color: "#60a5fa",
  },
  selfArticles: {
    label: "자체 기사",
    color: "#2563eb",
  },
}

const BuseChart = ({ newsData }) => {
  // 부서별 기사 통계 계산
  const departmentStats = useMemo(() => {
    if (!newsData?.length) return [];

    const statsMap = new Map();

    newsData.forEach((item) => {
      // 작성자명에서 부서명 조회
      const writerName = item.writers?.trim();
      if (!writerName) return;

      // 작성자명으로 부서명 조회
      let department = getNameDepartment(writerName);
      
      // 부서명을 찾을 수 없으면 "기타" 처리
      if (!department || department === "알 수 없음") {
        department = "기타";
      }

      if (!statsMap.has(department)) {
        statsMap.set(department, {
          department: department,
          totalArticles: 0,
          selfArticles: 0,
        });
      }

      const stats = statsMap.get(department);
      stats.totalArticles += 1;
      
      if (item.level === "1") {
        stats.selfArticles += 1;
      }
    });

    // 자체기사 수가 많은 순으로 정렬하고 상위 10개만 표시
    return Array.from(statsMap.values())
      .sort((a, b) => b.selfArticles - a.selfArticles)
      .slice(0, 10)
      .map(stats => ({
        ...stats,
        selfRatio: stats.totalArticles > 0 
          ? Math.round((stats.selfArticles / stats.totalArticles) * 100)
          : 0
      }));
  }, [newsData]);
  return (
    <Card className="m-0 sm:m-2 w-full max-w-7xl mx-auto">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-2 space-y-0 border-b py-5">
        <div className="flex-1">
          <div>
            <CardTitle className="text-base sm:text-lg">자체기사 현황 (부서별)</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              부서별 전체 기사와 자체 기사 현황 (상위 10개 부서)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {departmentStats.length > 0 ? (
          <ChartContainer config={chartConfig} className="aspect-auto h-[300px] sm:h-[400px] w-full">
            <BarChart
              accessibilityLayer 
              data={departmentStats}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis 
                dataKey="department" 
                tickLine={false} 
                tickMargin={10} 
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 10 }}
              />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border rounded shadow-lg">
                        <p className="font-semibold">{label}</p>
                        <p className="text-blue-600">
                          전체 기사: {data.totalArticles}건
                        </p>
                        <p className="text-indigo-600">
                          자체 기사: {data.selfArticles}건
                        </p>
                        <p className="text-gray-600">
                          자체 비율: {data.selfRatio}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="totalArticles" 
                fill="var(--color-totalArticles)" 
                radius={[0, 0, 4, 4]}
                name="전체 기사"
              />
              <Bar 
                dataKey="selfArticles" 
                fill="var(--color-selfArticles)" 
                radius={[4, 4, 0, 0]}
                name="자체 기사"
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] sm:h-[400px] text-gray-500">
            데이터가 없습니다.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BuseChart;
