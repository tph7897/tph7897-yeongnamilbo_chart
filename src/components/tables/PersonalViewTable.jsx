import React, { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { aggregateReportersByWeek } from "@/lib/newsDataUtils";
import { formatDate, truncateText, getSelfRatioClass } from "@/lib/tableUtils";
import { useTableSort, useWeekSelection, useDepartmentFilter } from "@/hooks/useTable";

const COLUMNS = [
  { label: "기자", key: "reporter" },
  { label: "부서", key: "department", hideOnMobile: true },
  { label: "조회수", key: "totalViews" },
  { label: "기사수", key: "articleCount" },
  { label: "평균", key: "averageViews" },
  { label: "자체비율", key: "selfRatio" },
];

const PersonalViewTable = ({ newsData }) => {
  // 뉴스 데이터를 주별, 기자별로 집계
  const weeklyReporterData = useMemo(() => aggregateReportersByWeek(newsData), [newsData]);

  // 주 선택 훅
  const { currentWeek, setSelectedWeek } = useWeekSelection(weeklyReporterData);

  // 선택된 주의 기자 데이터
  const currentWeekReporters = useMemo(() => {
    const weekData = weeklyReporterData.find(week => week.datetime === currentWeek);
    return weekData?.reporters || [];
  }, [weeklyReporterData, currentWeek]);

  // 부서 필터링 훅
  const { selectedDepartment, setSelectedDepartment, departmentOptions, filteredData } = 
    useDepartmentFilter(currentWeekReporters);

  // 정렬 훅
  const { sortColumn, sortDirection, handleSort, sortData } = useTableSort("totalViews", "desc");

  // 최종 정렬된 데이터
  const sortedReporters = sortData(filteredData);

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
          <CardTitle className="sm:mr-auto text-lg">기자별 조회수 현황</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select 
              value={currentWeek} 
              onValueChange={setSelectedWeek}
            >
              <SelectTrigger className="w-full sm:w-[130px]">
                <SelectValue placeholder="주 선택">
                  {currentWeek ? formatDateForSelect(currentWeek) : "주 선택"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>주</SelectLabel>
                  {weeklyReporterData
                    .slice()
                    .reverse()
                    .map(week => (
                      <SelectItem key={week.datetime} value={week.datetime}>
                        {formatDateForSelect(week.datetime)}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedDepartment} 
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger className="w-full sm:w-[130px]">
                <SelectValue placeholder="부서 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>부서</SelectLabel>
                  {departmentOptions.map(dept => (
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
                  {COLUMNS.map(col => (
                    <TableHead 
                      key={col.key}
                      className={`p-0 ${col.hideOnMobile ? "hidden md:table-cell" : ""}`}
                    >
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort(col.key)}
                        className="w-full justify-center"
                      >
                        {col.label}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedReporters.map((reporter, index) => (
                  <TableRow key={`${reporter.reporter}-${index}`}>
                    <TableCell className="font-medium">
                      {truncateText(reporter.reporter)}
                    </TableCell>
                    <TableCell>
                      {reporter.department || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {reporter.totalViews.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {reporter.articleCount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {reporter.averageViews.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded text-xs ${getSelfRatioClass(reporter.selfRatio)}`}>
                        {reporter.selfRatio}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedReporters.length === 0 && (
                  <TableRow>
                    <TableCell 
                      colSpan={COLUMNS.length} 
                      className="text-center py-8 text-gray-500"
                    >
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* 모바일 카드 뷰 */}
          <div className="block md:hidden space-y-4 p-4">
            {sortedReporters.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                데이터가 없습니다.
              </div>
            ) : (
              sortedReporters.map((reporter, index) => (
                <Card key={`${reporter.reporter}-${index}`} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-base">
                          {truncateText(reporter.reporter)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {reporter.department || "부서 미정"}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getSelfRatioClass(reporter.selfRatio)}`}>
                        자체 {reporter.selfRatio}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-xs text-gray-500">총 조회수</div>
                        <div className="font-bold text-blue-600 text-sm">
                          {reporter.totalViews.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-500">기사수</div>
                        <div className="font-bold text-gray-700 text-sm">
                          {reporter.articleCount.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-xs text-gray-500">평균</div>
                        <div className="font-bold text-green-600 text-sm">
                          {reporter.averageViews.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalViewTable;
