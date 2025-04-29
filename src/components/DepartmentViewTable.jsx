import React, { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption, TableFooter } from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";


// 컬럼 배열 수정
const columns = [
  { label: "부서", key: "department" },
  { label: "조회수", key: "totalViews" },
  { label: "기사수", key: "articleCount" },
  { label: "평균", key: "averageViews" },
];

const DepartmentViewTable = ({ newsData }) => {
  // 초기 정렬 상태 변경: "averageViews" 내림차순으로 
  const [sortColumn, setSortColumn] = useState("averageViews");
  const [sortDirection, setSortDirection] = useState("desc");
  // 선택한 주(토요일 자정 키) 상태 관리
  const [selectedWeek, setSelectedWeek] = useState("");

  // newsData를 주(토요일 자정 기준)별로 그룹화
  const weeklyGroups = useMemo(() => {
    const groups = {};
    newsData.forEach((item) => {
      const d = new Date(item.newsdate);
      const diff = 6 - d.getDay();
      d.setDate(d.getDate() + diff);
      d.setHours(0, 0, 0, 0);
      const groupKey = d.toISOString(); // ISO 형식 사용
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    });
    // 그룹을 날짜 순으로 정렬하여 배열로 변환
    return Object.entries(groups).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  }, [newsData]);

  // 최초 렌더시 최신 주를 기본 선택으로 설정
  useEffect(() => {
    if (weeklyGroups.length > 0) {
      const latestWeek = weeklyGroups[weeklyGroups.length - 1][0];
      setSelectedWeek(latestWeek);
    }
  }, [weeklyGroups]);

  // 선택한 주의 뉴스 데이터로 부서별 집계 수행
  const aggregatedDepartments = useMemo(() => {
    if (!selectedWeek) return [];
    const groupData = weeklyGroups.find(([key]) => key === selectedWeek)?.[1] || [];
    const map = {};
    groupData.forEach((item) => {
      // 기존 buseId 매핑 대신 code_name 사용 (code_name 값이 없으면 건너뜁니다.)
      if (!item.code_name) return;
      const dept = item.code_name;
      if (!map[dept]) {
        map[dept] = { department: dept, totalViews: 0, articleCount: 0 };
      }
      map[dept].totalViews += item.ref;
      map[dept].articleCount += 1;
    });
    return Object.values(map).map((d) => ({
      ...d,
      averageViews: d.articleCount > 0 ? Number((d.totalViews / d.articleCount).toFixed(2)) : 0,
    }));
  }, [weeklyGroups, selectedWeek]);

  // 집계 데이터를 정렬
  const sortedDepartments = useMemo(() => {
    let sorted = [...aggregatedDepartments];
    if (sortColumn) {
      sorted.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
        return sortDirection === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }
    return sorted;
  }, [aggregatedDepartments, sortColumn, sortDirection]);

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  return (
    <div className="w-full flex items-center justify-center">
      <Card className="mx-2">
        <CardHeader className="w-full flex items-center border-b py-5 sm:flex-row">
          <CardTitle className="sm:mr-auto">부서별 조회수 현황</CardTitle>
          <Select onValueChange={(value) => setSelectedWeek(value)} defaultValue={selectedWeek}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={selectedWeek ? new Date(selectedWeek).toLocaleDateString() : "주 선택"} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>주별</SelectLabel>
                {weeklyGroups
                  .slice()
                  .reverse()
                  .map(([groupKey]) => (
                    <SelectItem key={groupKey} value={groupKey}>
                      {new Date(groupKey).toLocaleDateString()}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption></TableCaption>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
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
                  <TableCell>{item.department}</TableCell>
                  <TableCell>{item.totalViews}</TableCell>
                  <TableCell>{item.articleCount}</TableCell>
                  <TableCell>{item.averageViews}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter></TableFooter>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </div>
  );
};

export default DepartmentViewTable;
