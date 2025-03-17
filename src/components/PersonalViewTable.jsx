import React, { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "./ui/button";
import { ArrowUpDown } from "lucide-react";
import { personalWeeklyData } from "@/app/_utils/personalWeeklyData";

const columns = [
  { label: "기자", key: "reporter" },
  { label: "부서", key: "department" },
  { label: "조회수", key: "totalViews" },
  { label: "기사수", key: "articleCount" },
  { label: "평균", key: "averageViews" },
];

const PersonalViewTable = ({ newsData }) => {
  // 주별 집계 데이터: [{ datetime, reporters: [ { ... } ] }, ...]
  const [weeklyData, setWeeklyData] = useState([]);
  // 선택된 주 (datetime)와 부서 선택 상태
  const [selectedWeek, setSelectedWeek] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("전체 부서");
  // 정렬 상태
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    if (newsData && newsData.length > 0) {
      const aggregated = personalWeeklyData(newsData);
      setWeeklyData(aggregated);
    }
  }, [newsData]);

  // 기본 선택: 최신 주 (배열의 마지막 항목의 datetime)
  useEffect(() => {
    if (weeklyData.length > 0) {
      setSelectedWeek(weeklyData[weeklyData.length - 1].datetime);
    }
  }, [weeklyData]);

  // 선택된 주의 집계 데이터를 reporters로 추출 (없으면 빈 배열)
  const reportersData = useMemo(() => {
    const weekObj = weeklyData.find((week) => week.datetime === selectedWeek);
    return weekObj ? weekObj.reporters : [];
  }, [weeklyData, selectedWeek]);

  // 부서 선택 필터링: "전체 부서"이면 전체, 아니면 해당 부서와 "전체부서" 행을 포함
  const filteredData = useMemo(() => {
    if (selectedDepartment === "전체 부서") {
      return reportersData;
    }
    return reportersData.filter((item) => item.department === selectedDepartment || item.department === "전체부서");
  }, [reportersData, selectedDepartment]);

  // 정렬: "전체부서" 행은 항상 최상단, 나머지 데이터는 정렬
  const sortedData = useMemo(() => {
    const specialRows = filteredData.filter((item) => item.department === "전체부서");
    const restRows = filteredData.filter((item) => item.department !== "전체부서");

    let sortedRest = restRows;
    if (sortColumn) {
      sortedRest = [...restRows].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }
        return sortDirection === "asc" ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
      });
    }
    return [...specialRows, ...sortedRest];
  }, [filteredData, sortColumn, sortDirection]);

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  // 부서 옵션: 선택된 주의 데이터를 기반으로 고유 부서 목록 생성 (전체 부서 포함)
  const departmentOptions = useMemo(() => {
    const deptSet = new Set();
    reportersData.forEach((item) => {
      deptSet.add(item.department);
    });
    return ["전체 부서", ...Array.from(deptSet)];
  }, [reportersData]);

  return (
    <div className="w-full flex items-center justify-center">
      <Card className="m-2">
        <CardHeader className="w-full flex flex-col sm:flex-row items-center border-b py-5 gap-2">
          <CardTitle className="mr-auto">기자별 조회수 현황</CardTitle>
          <div className="flex gap-2">
            {/* 첫 번째 Select: 주(토요일 기준) 선택 */}
            <Select onValueChange={(value) => setSelectedWeek(value)} defaultValue={selectedWeek}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={selectedWeek} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>주</SelectLabel>
                  {weeklyData
                    .slice()
                    .reverse()
                    .map((week) => (
                      <SelectItem key={week.datetime} value={week.datetime}>
                        {week.datetime}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {/* 두 번째 Select: 부서 선택 */}
            <Select onValueChange={(value) => setSelectedDepartment(value)} defaultValue="전체 부서">
              <SelectTrigger className="w-[130px]">
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
              {sortedData.map((item, index) => (
                <TableRow key={`${item.department}-${item.reporter}-${index}`}>
                  <TableCell>{item.reporter}</TableCell>
                  <TableCell className="font-medium">{item.department}</TableCell>
                  <TableCell>{item.totalViews}</TableCell>
                  <TableCell>{item.articleCount}</TableCell>
                  <TableCell>{item.averageViews}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </div>
  );
};

export default PersonalViewTable;
