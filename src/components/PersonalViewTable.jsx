import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWeekRange, personalWeeklyData } from "@/app/_utils/personalWeeklyData";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "./ui/button";
import { ArrowUpDown } from "lucide-react";

const departments = ["전체 부서", "경북부(지역)", "디지털뉴스부", "경제_산업팀", "경북본사", "사회1팀", "콘텐츠_문화팀", "사회2팀", "경제_경제팀", "사진팀", "정치_서울본부", "기획취재부", "편집국", "콘텐츠_체육팀", "정치_대구", "사회3팀", "경제", "편집팀", "디지털국", "디지털컨텐츠팀", "정치", "논설실"];

const columns = [
  { label: "기자", key: "reporter" },
  { label: "부서", key: "department" },
  { label: "총조회수", key: "totalViews" },
  { label: "기사수", key: "articleCount" },
  { label: "평균", key: "averageViews" },
];

const PersonalViewTable = ({ newsData }) => {
  const [gijas, setGijas] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("전체 부서");

  // 정렬 관련 상태: sortColumn은 정렬 기준 컬럼, sortDirection은 'asc' 또는 'desc'
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    const { startOfWeek, endOfWeek } = getCurrentWeekRange();
    const result = personalWeeklyData(newsData, startOfWeek, endOfWeek);
    setGijas(result);
    console.log("data", result);
  }, [newsData]);

  // 선택된 부서에 따라 데이터를 필터링합니다.
  // 선택 부서가 "전체 부서"인 경우에는 모든 데이터를, 그 외에는 해당 부서 + "전체부서" 항목을 포함시킵니다.
  const filteredGijas = selectedDepartment === "전체 부서" ? gijas : gijas.filter((item) => item.department === selectedDepartment || item.department === "전체부서");

  // "전체부서" 항목은 항상 맨 위에 두고, 나머지 항목은 정렬합니다.
  const sortedGijas = React.useMemo(() => {
    const specialRows = filteredGijas.filter((item) => item.department === "전체부서");
    const restRows = filteredGijas.filter((item) => item.department !== "전체부서");

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
  }, [filteredGijas, sortColumn, sortDirection]);

  // 헤더 클릭 시 정렬 기준과 방향을 업데이트합니다.
  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  return (
    <Card className="m-2 w-3/5">
      <CardHeader className="flex items-center gap-20 space-y-0 border-b py-5 sm:flex-row">
        <CardTitle>기자별 조회수 현황 Table</CardTitle>
        <Select className="ml-auto" onValueChange={(value) => setSelectedDepartment(value)} defaultValue="전체 부서">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="부서 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>부서</SelectLabel>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Table>
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
            {sortedGijas.map((item) => (
              <TableRow key={item.department + item.reporter}>
                <TableCell>{item.reporter}</TableCell>
                <TableCell className="font-medium">{item.department}</TableCell>
                <TableCell className="text-right">{item.totalViews}</TableCell>
                <TableCell>{item.articleCount}</TableCell>
                <TableCell className="text-right">{item.averageViews}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between"></CardFooter>
    </Card>
  );
};

export default PersonalViewTable;
