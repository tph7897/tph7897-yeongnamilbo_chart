import React, { useMemo, useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowUpDown, CalendarIcon } from "lucide-react";
import { getNameDepartment } from "@/app/data/userMapping";
import { getDepartmentNameById } from "@/app/data/departmentMapping";
import { truncateText, getSelfRatioClass } from "@/lib/tableUtils";
import { useTableSort, useDepartmentFilter } from "@/hooks/useTable";
import { cn } from "@/lib/utils";

const COLUMNS = [
  { label: "기자", key: "reporter" },
  { label: "부서", key: "department", hideOnMobile: true },
  { label: "조회수", key: "totalViews" },
  { label: "기사수", key: "articleCount" },
  { label: "평균", key: "averageViews" },
  { label: "자체비율", key: "selfRatio" },
];

const PersonalViewTable = ({ newsData }) => {
  // 선택된 날짜 범위 상태
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // 현재 월 첫날
    to: new Date() // 오늘
  });
  // 캘린더 팝오버 열림 상태
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // 선택된 날짜 범위의 기자별 데이터를 직접 생성
  const reportersForSelectedDateRange = useMemo(() => {
    if (!newsData?.length || !dateRange?.from || !dateRange?.to) return [];

    // 날짜 범위를 한 번만 계산
    const fromTime = dateRange.from.getTime();
    const toTime = dateRange.to.getTime();
    
    // 기자별로 집계하는 Map
    const reporterMap = new Map();
    
    // 한 번의 루프로 필터링과 집계를 동시에 수행
    for (const article of newsData) {
      const articleTime = new Date(article.newsdate).getTime();
      
      // 날짜 범위 체크
      if (articleTime < fromTime || articleTime > toTime) continue;
      
      const reporter = article.byline_gijaname || "미상";
      const views = Number(article.ref) || 0;
      const level = Number(article.level) || 5;
      const isLevel1 = level === 1;
      
      let reporterData = reporterMap.get(reporter);
      if (!reporterData) {
        // 부서 정보 결정 로직 개선
        let department = "미분류";
        
        // 1. 기자 이름으로 부서 매핑 확인
        const nameDepartment = getNameDepartment(article.byline_gijaname);
        if (nameDepartment && nameDepartment !== "알 수 없음") {
          department = nameDepartment;
        } 
        // 2. 기자 이름으로 찾을 수 없으면 기사의 부서 코드명 사용
        else if (article.code_name?.trim()) {
          department = article.code_name;
        }
        // 3. 그것도 없으면 buseid로 부서명 조회
        else if (article.buseid) {
          const buseid = Number(article.buseid);
          const departmentName = getDepartmentNameById(buseid);
          if (departmentName !== "알 수 없음") {
            department = departmentName;
          }
        }
        
        reporterData = {
          reporter,
          department,
          totalViews: 0,
          articleCount: 0,
          level1Count: 0,
          selfRatio: 0,
          averageViews: 0
        };
        reporterMap.set(reporter, reporterData);
      }
      
      reporterData.totalViews += views;
      reporterData.articleCount += 1;
      if (isLevel1) reporterData.level1Count += 1;
    }

    // 최종 계산을 한 번에 수행
    return Array.from(reporterMap.values()).map(reporter => ({
      ...reporter,
      selfRatio: reporter.articleCount > 0 
        ? Math.round((reporter.level1Count / reporter.articleCount) * 100) 
        : 0,
      averageViews: reporter.articleCount > 0 
        ? Math.round(reporter.totalViews / reporter.articleCount) 
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

    // 부서 필터링 훅
  const { departmentOptions, selectedDepartment, setSelectedDepartment, filteredData } = 
    useDepartmentFilter(reportersForSelectedDateRange);

  // 정렬 훅
  const { handleSort, sortData } = useTableSort("totalViews", "desc");

  // 날짜나 필터가 변경될 때 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, selectedDepartment]);

  // 최종 정렬된 데이터 - 페이지네이션 적용하여 성능 향상
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // 한 페이지당 50개 항목
  
  const sortedReporters = useMemo(() => {
    const sorted = sortData(filteredData);
    return sorted.slice(0, 500); // 최대 500개까지만 처리
  }, [filteredData, sortData]);
  
  // 현재 페이지의 데이터만 표시
  const paginatedReporters = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedReporters.slice(startIndex, endIndex);
  }, [sortedReporters, currentPage]);
  
  // 총 페이지 수 계산
  const totalPages = Math.ceil(sortedReporters.length / itemsPerPage);

  const formatDateForSelect = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="w-full flex items-center justify-center">
      <Card className="m-2 w-full max-w-7xl">
        <CardHeader className="w-full flex flex-col sm:flex-row items-start sm:items-center border-b py-5 gap-4">
          <div className="sm:mr-auto">
            <CardTitle className="text-lg">기자별 조회수 현황</CardTitle>
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

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-[130px]">
                <SelectValue placeholder="부서 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>부서</SelectLabel>
                  {departmentOptions.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:px-6">
          {/* 데스크톱 테이블 뷰 */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  {COLUMNS.map((col) => (
                    <TableHead key={col.key} className={`p-0 ${col.hideOnMobile ? "hidden md:table-cell" : ""}`}>
                      <Button variant="ghost" onClick={() => handleSort(col.key)} className="w-full justify-center">
                        {col.label}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReporters.map((reporter, index) => (
                  <TableRow key={`${reporter.reporter}-${index}`}>
                    <TableCell className="font-medium text-center">{truncateText(reporter.reporter)}</TableCell>
                    <TableCell className="text-center">{reporter.department || "-"}</TableCell>
                    <TableCell className="text-center">{reporter.totalViews.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{reporter.articleCount.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{reporter.averageViews.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs ${getSelfRatioClass(reporter.selfRatio)}`}>{reporter.selfRatio}%</span>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedReporters.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={COLUMNS.length} className="text-center py-8 text-gray-500">
                      데이터가 없습니다.
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
          <div className="block md:hidden space-y-4 p-4">
            {paginatedReporters.length === 0 ? (
              <div className="text-center text-gray-500 py-8">데이터가 없습니다.</div>
            ) : (
              paginatedReporters.map((reporter, index) => (
                <Card key={`${reporter.reporter}-${index}`} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-base">{truncateText(reporter.reporter)}</h3>
                        <p className="text-sm text-gray-500">{reporter.department || "부서 미정"}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getSelfRatioClass(reporter.selfRatio)}`}>자체 {reporter.selfRatio}%</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-xs text-gray-500">총 조회수</div>
                        <div className="font-bold text-blue-600 text-sm">{reporter.totalViews.toLocaleString()}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-500">기사수</div>
                        <div className="font-bold text-gray-700 text-sm">{reporter.articleCount.toLocaleString()}</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-xs text-gray-500">평균</div>
                        <div className="font-bold text-green-600 text-sm">{reporter.averageViews.toLocaleString()}</div>
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

export default PersonalViewTable;
