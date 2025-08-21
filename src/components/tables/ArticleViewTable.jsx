import React, { useMemo, useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowUpDown, CalendarIcon } from "lucide-react";
import { getNameDepartment } from "@/app/data/userMapping";
import { getDepartmentNameById } from "@/app/data/departmentMapping";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatKoreanDate } from "@/lib/dateUtils";
import { truncateText, formatLevel, getLevelClass, getSelfRatioClass } from "@/lib/tableUtils";
import { useTableSort } from "@/hooks/useTable";
import { cn } from "@/lib/utils";

const COLUMNS = [
  { label: "기사제목", key: "title" },
  { label: "조회수", key: "totalViews" },
  { label: "작성일", key: "newsdate" },
  { label: "부서", key: "department", hideOnMobile: true },
  { label: "기자", key: "reporter" },
  { label: "유형", key: "level" },
];

const ArticleViewTable = ({ newsData }) => {
  // 선택된 날짜 범위 상태
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // 현재 월 첫날
    to: new Date() // 오늘
  });
  // 캘린더 팝오버 열림 상태
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // 뉴스 데이터를 날짜 범위별로 필터링 - 성능 최적화
  const articlesForSelectedDateRange = useMemo(() => {
    if (!newsData?.length || !dateRange?.from || !dateRange?.to) return [];

    // 날짜 범위를 한 번만 계산
    const fromTime = dateRange.from.getTime();
    const toTime = dateRange.to.getTime();
    
    const result = [];
    
    // 한 번의 루프로 필터링과 변환을 동시에 수행
    for (const article of newsData) {
      const articleTime = new Date(article.newsdate).getTime();
      
      // 날짜 범위 체크
      if (articleTime < fromTime || articleTime > toTime) continue;
      
      // code_name이 빈 문자열이면, buseid 값을 기반으로 부서명 채우기
      if (!article.code_name?.trim()) {
        const buseid = Number(article.buseid);
        const departmentName = getDepartmentNameById(buseid);
        if (departmentName !== "알 수 없음") {
          article.code_name = departmentName;
        }
      }

      // 개별 기사 데이터 변환 - 분류 정보 제거로 효율성 향상
      result.push({
        department: getNameDepartment(article.byline_gijaname) || article.code_name,
        newsdate: formatKoreanDate(article.newsdate),
        newskey: article.newskey,
        reporter: article.byline_gijaname,
        title: article.newstitle,
        totalViews: Number(article.ref) || 0,
        level: article.level || "5",
      });
    }
    
    return result;
  }, [newsData, dateRange.from?.getTime(), dateRange.to?.getTime()]);

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
  }, [newsData, dateRange.from?.getTime(), dateRange.to?.getTime()]);

  // 부서별 필터링을 위한 상태
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // 부서 목록 추출
  const departments = useMemo(() => {
    const deptSet = new Set();
    articlesForSelectedDateRange.forEach((item) => {
      if (item.department) deptSet.add(item.department);
    });
    return Array.from(deptSet).sort();
  }, [articlesForSelectedDateRange]);

  // 정렬 훅
  const { sortColumn, sortDirection, handleSort } = useTableSort("totalViews", "desc");

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // 한 페이지당 50개 항목

  // 부서 필터링 및 정렬된 기사 목록
  const sortedArticles = useMemo(() => {
    // 부서 필터링
    const filtered = selectedDepartment === "all" 
      ? articlesForSelectedDateRange 
      : articlesForSelectedDateRange.filter((article) => article.department === selectedDepartment);

    // 정렬
    if (!sortColumn) return filtered;
    
    return [...filtered].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      
      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [articlesForSelectedDateRange, selectedDepartment, sortColumn, sortDirection]);
  
  // 현재 페이지의 데이터만 표시
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedArticles.slice(startIndex, endIndex);
  }, [sortedArticles, currentPage]);
  
  // 총 페이지 수 계산
  const totalPages = Math.ceil(sortedArticles.length / itemsPerPage);

  // 날짜나 필터가 변경될 때 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, selectedDepartment]);
  return (
    <div className="w-full flex items-center justify-center">
      <Card className="m-2">
        <CardHeader className="w-full flex items-center border-b py-5 sm:flex-row">
          <div className="sm:mr-auto">
            <CardTitle>기사별 조회수 현황</CardTitle>
            <div className="text-sm mt-1">
              총 <span className="font-medium">{overallStats.totalArticles.toLocaleString()}건</span> | 
              자체 <span className="font-medium">{overallStats.selfArticles.toLocaleString()}건</span> | 
              자체비율 <span className={`px-2 py-1 rounded text-xs font-medium ${getSelfRatioClass(overallStats.selfRatio)}`}>
                {overallStats.selfRatio}%
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[250px] justify-start text-left font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {dateRange.from.toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit', 
                          day: '2-digit'
                        })} - {dateRange.to.toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit', 
                          day: '2-digit'
                        })}
                      </>
                    ) : (
                      dateRange.from.toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit', 
                        day: '2-digit'
                      })
                    )
                  ) : (
                    <span>날짜 범위 선택</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                />
              </PopoverContent>
            </Popover>
            
            <Select 
              onValueChange={(value) => setSelectedDepartment(value)} 
              value={selectedDepartment}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="부서 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>부서</SelectLabel>
                  <SelectItem value="all">전체 부서</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden md:table-cell">순번</TableHead>
                {COLUMNS.map((col) => (
                  <TableHead 
                    key={col.key} 
                    className={`p-0 ${col.hideOnMobile ? "hidden md:table-cell" : ""}`}
                  >
                    <Button variant="ghost" onClick={() => handleSort(col.key)}>
                      {col.label} <ArrowUpDown />
                    </Button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedArticles.map((item, index) => (
                <TableRow key={item.newskey}>
                  <TableCell className="hidden md:table-cell">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <a 
                      href={`https://www.yeongnam.com/web/view.php?key=${item.newskey}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {item.title}
                    </a>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {item.totalViews.toLocaleString()}
                  </TableCell>
                  <TableCell>{item.newsdate}</TableCell>
                  <TableCell className="hidden md:table-cell">{item.department}</TableCell>
                  <TableCell>
                    {truncateText(item.reporter)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${getLevelClass(item.level)}`}>
                      {formatLevel(item.level)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedArticles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length + 1} className="text-center text-gray-500 py-8">
                    선택한 조건에 해당하는 기사가 없습니다.
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
                {currentPage} / {totalPages} 페이지 (총 {sortedArticles.length}건)
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticleViewTable;
