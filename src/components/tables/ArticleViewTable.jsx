import React, { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { transformWeeklyArticles } from "@/app/_utils/articleWeeklyData";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

const columns = [
  { label: "기사제목", key: "title" },
  { label: "조회수", key: "totalViews" },
  { label: "작성일", key: "newsdate" },
  { label: "분류", key: "category" },
  { label: "부서", key: "department" },
  { label: "기자", key: "reporter" },
  { label: "유형", key: "level" },
];

const ArticleViewTable = ({ newsData }) => {
  // 주간 데이터 그룹(토요일 기준)으로 변환: 각 그룹은 { datetime, articles } 형식입니다.
  const groups = useMemo(() => transformWeeklyArticles(newsData), [newsData]);
  // 기본 선택: 그룹이 존재하면 최신 날짜(마지막 그룹의 datetime)를 기본값으로 설정
  const [selectedDatetime, setSelectedDatetime] = useState("");
  // 기존: const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  
  // groups가 변경되었을 때, 최신 날짜로 기본값 설정
  useEffect(() => {
    if (groups.length > 0) {
      setSelectedDatetime(groups[groups.length - 1].datetime);
    }
  }, [groups]);

  // 선택된 그룹의 기사 배열
  const selectedGroup = groups.find((group) => group.datetime === selectedDatetime);
  const articlesForSelectedWeek = selectedGroup ? selectedGroup.articles : [];
  
  // 부서 목록 추출 (중복 제거)
  const departments = useMemo(() => {
    const deptSet = new Set();
    articlesForSelectedWeek.forEach((item) => {
      if (item.department) deptSet.add(item.department);
    });
    return Array.from(deptSet);
  }, [articlesForSelectedWeek]);
  
  // 선택한 부서에 따른 기사 필터링
  const filteredArticles = useMemo(() => {
    if (selectedDepartment === "all") return articlesForSelectedWeek;
    return articlesForSelectedWeek.filter((article) => article.department === selectedDepartment);
  }, [articlesForSelectedWeek, selectedDepartment]);
  
  // 정렬 상태 관리: sortColumn과 sortDirection
  const [sortColumn, setSortColumn] = useState("totalViews");
  const [sortDirection, setSortDirection] = useState("desc");
  
  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };
  
  // 선택한 주와 부서에 따른 기사 배열을 정렬
  const sortedArticles = useMemo(() => {
    if (!sortColumn) return filteredArticles;
    const sorted = [...filteredArticles].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return sorted;
  }, [filteredArticles, sortColumn, sortDirection]);
  console.log('sortedArticles', sortedArticles)
  return (
    <div className="w-full flex items-center justify-center">
      <Card className="m-2">
        <CardHeader className="w-full flex items-center border-b py-5 sm:flex-row">
          <CardTitle className="sm:mr-auto">기사별 조회수 현황</CardTitle>
         <div className="flex gap-2">
          <Select onValueChange={(value) => setSelectedDatetime(value)} defaultValue={selectedDatetime}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder={selectedDatetime} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Weeks</SelectLabel>
                {groups
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
          {/* 새 부서 선택 셀렉트 */}
          <Select onValueChange={(value) => setSelectedDepartment(value)} defaultValue={selectedDepartment} className="ml-4">
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder={selectedDepartment || "부서 선택"} />
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
                {/* 변경: 순번 열 숨김 */}
                <TableHead className="hidden md:table-cell">순번</TableHead>
                {columns.map((col) => (
                  <TableHead 
                    key={col.key} 
                    className={`p-0 ${(col.key === "category" || col.key === "department") ? "hidden md:table-cell" : ""}`}
                  >
                    <Button variant="ghost" onClick={() => handleSort(col.key)}>
                      {col.label} <ArrowUpDown />
                    </Button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedArticles.map((item, index) => (
                <TableRow key={item.newskey}>
                  {/* 변경: 순번 셀 숨김 */}
                  <TableCell className="hidden md:table-cell">{index + 1}</TableCell>
                  <TableCell>
                    <a href={`https://www.yeongnam.com/web/view.php?key=${item.newskey}`} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
                  </TableCell>
                  <TableCell>{item.totalViews}</TableCell>
                  <TableCell>{item.newsdate}</TableCell>
                  {/* 변경: 분류 셀 숨김 */}
                  <TableCell className="hidden md:table-cell">
                    {Array.isArray(item.category) ? item.category.join(", ") : item.category}
                  </TableCell>
                  {/* 변경: 부서 셀 숨김 */}
                  <TableCell className="hidden md:table-cell">{item.department}</TableCell>
                  <TableCell>
                    {item.reporter && item.reporter.length > 6
                      ? item.reporter.slice(0, 7) + "..."
                      : item.reporter}
                  </TableCell>
                  <TableCell>
                    {item.level === "1" ? "자체" : item.level === "5" ? "일반" : item.level}
                  </TableCell>
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

export default ArticleViewTable;
