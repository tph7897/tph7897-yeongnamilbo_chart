import React, { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "./ui/button";
import { ArrowUpDown } from "lucide-react";
import personBuse from "../app/data/personBuse";

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
  const [sortColumn, setSortColumn] = useState("totalViews");
  const [sortDirection, setSortDirection] = useState("desc");

  // newsData를 주별, 기자별로 집계 (byline_gijaname가 기자, code_name이 없으면 personBuse 값을 적용)
  const aggregatedData = useMemo(() => {
    if (!newsData || newsData.length === 0) return [];
    const groups = {};
    newsData.forEach((item) => {
      const d = new Date(item.newsdate);
      const diff = 6 - d.getDay();
      d.setDate(d.getDate() + diff);
      d.setHours(0, 0, 0, 0);
      const weekKey = d.toISOString();
      if (!groups[weekKey]) groups[weekKey] = {};
      const reporter = item.byline_gijaname ? item.byline_gijaname.trim() : "";
      // personBuse에 있으면 사용, 없으면 code_name 값 사용 (유효한 문자열이면)
      const department = personBuse[reporter] || ((typeof item.code_name === "string" && item.code_name.trim() !== "") ? item.code_name.trim() : "-");
      if (reporter) {
        if (!groups[weekKey][reporter]) {
          groups[weekKey][reporter] = {
            reporter,
            department,
            totalViews: 0,
            articleCount: 0,
          };
        }
        groups[weekKey][reporter].totalViews += Number(item.ref) || 0;
        groups[weekKey][reporter].articleCount += 1;
      }
    });
    return Object.entries(groups)
      .map(([weekKey, reportersObj]) => ({
        datetime: weekKey,
        reporters: Object.values(reportersObj).map((r) => ({
          ...r,
          averageViews: r.articleCount > 0 ? Number((r.totalViews / r.articleCount).toFixed(2)) : 0,
        })),
      }))
      .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  }, [newsData]);

  // 집계 데이터를 상태에 저장
  useEffect(() => {
    if (newsData && newsData.length > 0) {
      setWeeklyData(aggregatedData);
    }
  }, [newsData, aggregatedData]);

  // 기본 선택: 최신 주
  useEffect(() => {
    if (weeklyData.length > 0) {
      setSelectedWeek(weeklyData[weeklyData.length - 1].datetime);
    }
  }, [weeklyData]);

  // 선택된 주의 집계 데이터를 reporters로 추출
  const reportersData = useMemo(() => {
    const weekObj = weeklyData.find((week) => week.datetime === selectedWeek);
    return weekObj ? weekObj.reporters : [];
  }, [weeklyData, selectedWeek]);

  // 부서 선택 필터링
  const filteredData = useMemo(() => {
    if (selectedDepartment === "전체 부서") {
      return reportersData;
    }
    return reportersData.filter(
      (item) => (item.department && item.department.trim() ? item.department : "-") === selectedDepartment || item.department === "전체부서"
    );
  }, [reportersData, selectedDepartment]);

  // 정렬 처리
  const sortedData = useMemo(() => {
    const specialRows = filteredData.filter((item) => item.department === "전체 부서");
    const restRows = filteredData.filter((item) => item.department !== "전체 부서");
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

  // 부서 옵션 생성
  const departmentOptions = useMemo(() => {
    const deptSet = new Set();
    reportersData.forEach((item) => {
      const dept = item.department && item.department.trim() ? item.department : "-";
      deptSet.add(dept);
    });
    return ["전체 부서", ...Array.from(deptSet)];
  }, [reportersData]);

  return (
    <div className="w-full flex items-center justify-center">
      <Card className="m-2">
        <CardHeader className="w-full flex flex-col sm:flex-row items-center border-b py-5 gap-2">
          <CardTitle className="sm:mr-auto">기자별 조회수 현황</CardTitle>
          <div className="flex gap-2">
           
            <Select onValueChange={(value) => setSelectedWeek(value)} defaultValue={selectedWeek}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={selectedWeek ? new Date(selectedWeek).toLocaleDateString() : "주 선택"}>
                  
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>주</SelectLabel>
                  {weeklyData
                    .slice()
                    .reverse()
                    .map((week) => (
                      <SelectItem key={week.datetime} value={week.datetime}>
                        {new Date(week.datetime).toLocaleDateString()}
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
                  {departmentOptions
                    .filter((dept) => dept !== "전체부서")
                    .map((dept) => (
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
                  // 변경: 부서 컬럼은 모바일에서 숨김
                  <TableHead key={col.key} className={`p-0 ${col.key === "department" ? "hidden md:table-cell" : ""}`}>
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
                  <TableCell>
                    {item.reporter && item.reporter.length > 6
                      ? item.reporter.slice(0, 7) + "..."
                      : item.reporter}
                  </TableCell>
                  {/* 변경: 부서 셀은 모바일에서 숨김 */}
                  <TableCell className="font-medium hidden md:table-cell">
                    {item.department && item.department.trim() ? item.department : "-"}
                  </TableCell>
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
