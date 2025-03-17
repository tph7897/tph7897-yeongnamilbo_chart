import React, { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption, TableFooter } from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { aggregateWeeklyData } from "@/app/_utils/aggregateWeeklyData"; // 주별 집계 함수
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

const columns = [
  { label: "부서", key: "department" },
  { label: "조회수", key: "totalViews" },
  { label: "기사수", key: "articleCount" },
  { label: "평균", key: "averageViews" },
];

const DepartmentViewTable = ({ newsData }) => {
  // 주별 집계 데이터를 저장 (형식: [{ datetime, department: [...] }, ...])
  const [weeklyData, setWeeklyData] = useState([]);
  // 선택한 주의 datetime (예: "2025-03-01")
  const [selectedDatetime, setSelectedDatetime] = useState("");
  // 정렬 상태
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    if (newsData && newsData.length > 0) {
      const aggregatedData = aggregateWeeklyData(newsData);
      setWeeklyData(aggregatedData);
    }
  }, [newsData]);

  // weeklyData가 변경되면 최신 주의 날짜(배열의 마지막 요소의 datetime)를 기본 선택값으로 설정
  useEffect(() => {
    if (weeklyData.length > 0) {
      const latestWeek = weeklyData[weeklyData.length - 1].datetime;
      setSelectedDatetime(latestWeek);
    }
  }, [weeklyData]);

  // 선택한 주의 부서 집계 데이터
  const selectedGroup = useMemo(() => {
    return weeklyData.find((group) => group.datetime === selectedDatetime);
  }, [weeklyData, selectedDatetime]);

  // 선택한 주가 없으면 빈 배열 반환
  const departments = selectedGroup ? selectedGroup.department : [];

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  // "전체부서" 행은 항상 상단에 두고, 나머지 데이터만 정렬
  const sortedDepartments = useMemo(() => {
    const specialRows = departments.filter((item) => item.department === "전체부서");
    const restRows = departments.filter((item) => item.department !== "전체부서");

    let sortedRest = restRows;
    if (sortColumn) {
      sortedRest = [...restRows].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
        return sortDirection === "asc" ? String(aValue).localeCompare(String(bValue)) : String(bValue).localeCompare(String(aValue));
      });
    }
    return [...specialRows, ...sortedRest];
  }, [departments, sortColumn, sortDirection]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Card className="mx-2 my-auto">
        <CardHeader className="w-full flex items-center border-b py-5 sm:flex-row">
          <CardTitle className="mr-auto">부서별 조회수 현황</CardTitle>
          {/* <CardDescription></CardDescription> */}
          <Select onValueChange={(value) => setSelectedDatetime(value)} defaultValue={selectedDatetime}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={selectedDatetime} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Weeks</SelectLabel>
                {/* 옵션 순서는 최신 날짜가 상단에 오도록 역순으로 렌더링 */}
                {weeklyData
                  .slice()
                  .reverse()
                  .map((group) => (
                    <SelectItem key={group.datetime} value={group.datetime}>
                      {group.datetime}
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
                  <TableHead key={col.key} className="p-0">
                    <Button variant="ghost" onClick={() => handleSort(col.key)}>
                      {col.label} <ArrowUpDown />
                    </Button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDepartments.map((item, index) => (
                <TableRow key={`${item.department}-${index}`}>
                  <TableCell className="font-medium">{String(item.department)}</TableCell>
                  <TableCell>{String(item.totalViews)}</TableCell>
                  <TableCell>{String(item.articleCount)}</TableCell>
                  <TableCell>{String(item.averageViews)}</TableCell>
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
