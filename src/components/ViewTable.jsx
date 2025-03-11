import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption, TableFooter } from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { aggregateWeeklyData, getCurrentWeekRange } from "@/app/_utils/aggregateWeeklyData";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const columns = [
  { label: "부서", key: "department" },
  { label: "총조회수", key: "totalViews" },
  { label: "기사수", key: "articleCount" },
  { label: "평균", key: "averageViews" },
];

const ViewTable = ({ newsData }) => {
  const [departments, setDepartments] = useState([]);

  // 정렬 상태: sortColumn은 정렬 기준, sortDirection은 'asc' 또는 'desc'
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    if (newsData && newsData.length > 0) {
      const { startOfWeek, endOfWeek } = getCurrentWeekRange();
      const aggregatedData = aggregateWeeklyData(newsData, startOfWeek, endOfWeek);
      setDepartments(aggregatedData);
    }
  }, [newsData]);

  // 헤더 버튼 클릭 시 정렬 기준과 방향을 업데이트하는 함수
  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  // "전체부서" 행은 항상 최상단에 두고, 나머지 데이터만 정렬합니다.
  const sortedDepartments = React.useMemo(() => {
    // 여기서 department가 "전체부서" (공백 없이)인 경우만 specialRows로 분리합니다.
    const specialRows = departments.filter((item) => item.department === "전체부서");
    const restRows = departments.filter((item) => item.department !== "전체부서");

    let sortedRest = restRows;
    if (sortColumn) {
      sortedRest = [...restRows].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        } else {
          return sortDirection === "asc" ? String(aValue).localeCompare(String(bValue)) : String(bValue).localeCompare(String(aValue));
        }
      });
    }
    return [...specialRows, ...sortedRest];
  }, [departments, sortColumn, sortDirection]);

  return (
    <Card className="m-2 w-1/2">
      <CardHeader>
        <CardTitle>부서별 조회수 현황 Table</CardTitle>
        <CardDescription></CardDescription>
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
            {sortedDepartments.map((item) => (
              <TableRow key={item.department}>
                <TableCell className="font-medium">{item.department}</TableCell>
                <TableCell>{item.totalViews}</TableCell>
                <TableCell>{item.articleCount}</TableCell>
                <TableCell className="text-right">{item.averageViews}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter></TableFooter>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between"></CardFooter>
    </Card>
  );
};

export default ViewTable;
