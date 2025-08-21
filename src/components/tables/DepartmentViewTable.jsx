import React, { useMemo, useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getDepartmentNameById } from "@/app/data/departmentMapping";
import { getSelfRatioClass } from "@/lib/tableUtils";
import { useTableSort } from "@/hooks/useTable";
import { cn } from "@/lib/utils";

const COLUMNS = [
  { label: "부서", key: "department" },
  { label: "조회수", key: "totalViews" },
  { label: "기사수", key: "articleCount" },
  { label: "평균", key: "averageViews" },
  { label: "자체비율", key: "selfRatio" },
];

const DepartmentViewTable = ({ newsData }) => {
  // 선택된 날짜 범위 상태
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // 현재 월 첫날
    to: new Date() // 오늘
  });
  // 캘린더 팝오버 열림 상태
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // 선택된 날짜 범위의 부서별 데이터를 직접 생성 - 성능 최적화
  const departmentsForSelectedDateRange = useMemo(() => {
    if (!newsData?.length || !dateRange?.from || !dateRange?.to) return [];

    // 날짜 범위를 한 번만 계산
    const fromTime = dateRange.from.getTime();
    const toTime = dateRange.to.getTime();
    
    // 부서별로 집계하는 Map
    const departmentMap = new Map();
    
    // 한 번의 루프로 필터링과 집계를 동시에 수행
    for (const article of newsData) {
      const articleTime = new Date(article.newsdate).getTime();
      
      // 날짜 범위 체크
      if (articleTime < fromTime || articleTime > toTime) continue;
      
      const department = article.code_name || "미분류";
      // buseid로 부서명을 더 정확하게 찾기
      let finalDepartment = department;
      if (department === "미분류" && article.buseid) {
        const buseid = Number(article.buseid);
        const departmentName = getDepartmentNameById(buseid);
        if (departmentName !== "알 수 없음") {
          finalDepartment = departmentName;
        }
      }
      
      const views = Number(article.ref) || 0;
      const level = Number(article.level) || 5;
      const isLevel1 = level === 1;
      
      let deptData = departmentMap.get(finalDepartment);
      if (!deptData) {
        deptData = {
          department: finalDepartment,
          totalViews: 0,
          articleCount: 0,
          level1Count: 0,
          selfRatio: 0,
          averageViews: 0
        };
        departmentMap.set(finalDepartment, deptData);
      }
      
      deptData.totalViews += views;
      deptData.articleCount += 1;
      if (isLevel1) deptData.level1Count += 1;
    }

    // 최종 계산을 한 번에 수행
    return Array.from(departmentMap.values()).map(dept => ({
      ...dept,
      selfRatio: dept.articleCount > 0 
        ? Math.round((dept.level1Count / dept.articleCount) * 100) 
        : 0,
      averageViews: dept.articleCount > 0 
        ? Math.round(dept.totalViews / dept.articleCount) 
        : 0
    }));
  }, [newsData, dateRange.from, dateRange.to]);

  // 전체 통계 계산
  const overallStats = useMemo(() => {
    if (!newsData?.length || !dateRange?.from || !dateRange?.to) {
      return { totalArticles: 0, selfArticles: 0, selfRatio: 0 };
    }

    const fromTime = dateRange.from.getTime();
    const toTime = dateRange.to.getTime();
    
    let totalArticles = 0;
    let selfArticles = 0;
    
    for (const article of newsData) {
      const articleTime = new Date(article.newsdate).getTime();
      
      if (articleTime >= fromTime && articleTime <= toTime) {
        totalArticles++;
        const level = Number(article.level) || 5;
        if (level === 1) {
          selfArticles++;
        }
      }
    }
    
    const selfRatio = totalArticles > 0 ? Math.round((selfArticles / totalArticles) * 100) : 0;
    
    return { totalArticles, selfArticles, selfRatio };
  }, [newsData, dateRange.from, dateRange.to]);

  // 정렬 훅
  const { handleSort, sortData } = useTableSort("averageViews", "desc");

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // 한 페이지당 50개 항목

  // 정렬된 부서 통계
  const sortedDepartments = useMemo(() => {
    return sortData(departmentsForSelectedDateRange);
  }, [departmentsForSelectedDateRange, sortData]);
  
  // 현재 페이지의 데이터만 표시
  const paginatedDepartments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedDepartments.slice(startIndex, endIndex);
  }, [sortedDepartments, currentPage]);
  
  // 총 페이지 수 계산
  const totalPages = Math.ceil(sortedDepartments.length / itemsPerPage);

  // 날짜가 변경될 때 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange]);

  return (
    <div className="w-full flex items-center justify-center">
      <Card className="mx-2 w-full max-w-7xl">
        <CardHeader className="w-full flex flex-col sm:flex-row items-start sm:items-center border-b py-5 gap-4">
          <div className="sm:mr-auto">
            <CardTitle className="text-lg">부서별 조회수 현황</CardTitle>
            <div className="text-sm mt-1">
              총 <span className="font-medium">{overallStats.totalArticles.toLocaleString()}건</span> | 
              자체 <span className="font-medium">{overallStats.selfArticles.toLocaleString()}건</span> | 
              자체비율 <span className={`px-2 py-1 rounded text-xs font-medium ${getSelfRatioClass(overallStats.selfRatio)}`}>
                {overallStats.selfRatio}%
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full sm:w-[250px] justify-start text-left font-normal", !dateRange?.from && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {dateRange.from.toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}{" "}
                        -{" "}
                        {dateRange.to.toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </>
                    ) : (
                      dateRange.from.toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    )
                  ) : (
                    <span>날짜 범위 선택</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>

        <CardContent className="px-2 sm:px-6">
          {/* 데스크톱 테이블 뷰 */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  {COLUMNS.map((col) => (
                    <TableCell key={col.key} className="p-0 text-center">
                      <Button variant="ghost" onClick={() => handleSort(col.key)}>
                        {col.label} <ArrowUpDown />
                      </Button>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDepartments.map((item, index) => (
                  <TableRow key={`${item.department}-${index}`}>
                    <TableCell className="font-center text-center">{item.department}</TableCell>
                    <TableCell className="text-center">{item.totalViews.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{item.articleCount}</TableCell>
                    <TableCell className="text-center">{item.averageViews}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs ${getSelfRatioClass(item.selfRatio)}`}>{item.selfRatio}%</span>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedDepartments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={COLUMNS.length} className="text-center text-gray-500 py-8">
                      선택한 날짜에 해당하는 부서 데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 py-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </Button>
                <span className="text-sm">
                  {currentPage} / {totalPages} 페이지
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  다음
                </Button>
              </div>
            )}
          </div>

          {/* 모바일 카드 뷰 */}
          <div className="block md:hidden space-y-4">
            {paginatedDepartments.length === 0 ? (
              <div className="text-center text-gray-500 py-8">선택한 날짜에 해당하는 부서 데이터가 없습니다.</div>
            ) : (
              paginatedDepartments.map((item, index) => (
                <Card key={`${item.department}-${index}`} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-base">{item.department}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${getSelfRatioClass(item.selfRatio)}`}>자체 {item.selfRatio}%</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-xs text-gray-500">총 조회수</div>
                        <div className="font-bold text-blue-600 text-sm">{item.totalViews.toLocaleString()}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-500">기사수</div>
                        <div className="font-bold text-gray-700 text-sm">{item.articleCount}</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-xs text-gray-500">평균</div>
                        <div className="font-bold text-green-600 text-sm">{item.averageViews}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
            
            {/* 모바일 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 py-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </Button>
                <span className="text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  다음
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentViewTable;
