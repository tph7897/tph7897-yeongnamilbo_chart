import React, { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { aggregateDepartmentsByWeek, calculateDepartmentStats } from "@/lib/newsDataUtils";
import { getSelfRatioClass } from "@/lib/tableUtils";
import { formatDate } from "@/lib/dateUtils";
import { useTableSort, useWeekSelection } from "@/hooks/useTable";

const COLUMNS = [
  { label: "부서", key: "department" },
  { label: "조회수", key: "totalViews" },
  { label: "기사수", key: "articleCount" },
  { label: "평균", key: "averageViews" },
  { label: "자체비율", key: "selfRatio" },
];

const DepartmentViewTable = ({ newsData }) => {
  // 뉴스 데이터를 주별로 그룹화
  const weeklyGroups = useMemo(() => aggregateDepartmentsByWeek(newsData), [newsData]);

  // 주 선택 훅
  const { currentWeek, setSelectedWeek } = useWeekSelection(weeklyGroups);

  // 선택된 주의 부서별 통계
  const departmentStats = useMemo(() => {
    if (!currentWeek) return [];
    const weekData = weeklyGroups.find(([key]) => key === currentWeek)?.[1] || [];
    return calculateDepartmentStats(weekData);
  }, [weeklyGroups, currentWeek]);

  // 정렬 훅
  const { sortColumn, sortDirection, handleSort, sortData } = useTableSort("averageViews", "desc");

  // 정렬된 부서 통계
  const sortedDepartments = sortData(departmentStats);

  return (
    <div className="w-full flex items-center justify-center">
      <Card className="mx-2 w-full max-w-7xl">
        <CardHeader className="w-full flex flex-col sm:flex-row items-start sm:items-center border-b py-5 gap-4">
          <CardTitle className="sm:mr-auto text-lg">부서별 조회수 현황</CardTitle>
          <Select 
            onValueChange={(value) => setSelectedWeek(value)} 
            value={currentWeek}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="주 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>주별 선택</SelectLabel>
                {weeklyGroups
                  .slice()
                  .reverse()
                  .map(([groupKey]) => (
                    <SelectItem key={groupKey} value={groupKey}>
                      {formatDate(groupKey)}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardHeader>
        
        <CardContent className="px-2 sm:px-6">
          {/* 데스크톱 테이블 뷰 */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  {COLUMNS.map((col) => (
                    <TableCell key={col.key} className="p-0">
                      <Button variant="ghost" onClick={() => handleSort(col.key)}>
                        {col.label} <ArrowUpDown />
                      </Button>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDepartments.map((item, index) => (
                  <TableRow key={`${item.department}-${index}`}>
                    <TableCell className="font-medium">{item.department}</TableCell>
                    <TableCell className="text-right">
                      {item.totalViews.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">{item.articleCount}</TableCell>
                    <TableCell className="text-right">{item.averageViews}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs ${getSelfRatioClass(item.selfRatio)}`}>
                        {item.selfRatio}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedDepartments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={COLUMNS.length} className="text-center text-gray-500 py-8">
                      선택한 주에 해당하는 부서 데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* 모바일 카드 뷰 */}
          <div className="block md:hidden space-y-4">
            {sortedDepartments.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                선택한 주에 해당하는 부서 데이터가 없습니다.
              </div>
            ) : (
              sortedDepartments.map((item, index) => (
                <Card key={`${item.department}-${index}`} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-base">{item.department}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${getSelfRatioClass(item.selfRatio)}`}>
                        자체 {item.selfRatio}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-xs text-gray-500">총 조회수</div>
                        <div className="font-bold text-blue-600 text-sm">
                          {item.totalViews.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-500">기사수</div>
                        <div className="font-bold text-gray-700 text-sm">
                          {item.articleCount}
                        </div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-xs text-gray-500">평균</div>
                        <div className="font-bold text-green-600 text-sm">
                          {item.averageViews}
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

export default DepartmentViewTable;
