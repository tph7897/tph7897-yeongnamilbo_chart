import React, { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
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
];

const ArticleViewTable = ({ newsData }) => {
  // 주간 데이터 그룹(토요일 기준)으로 변환: 각 그룹은 { datetime, articles } 형식입니다.
  const groups = useMemo(() => transformWeeklyArticles(newsData), [newsData]);
  // 기본 선택: 그룹이 존재하면 최신 날짜(마지막 그룹의 datetime)를 기본값으로 설정
  const [selectedDatetime, setSelectedDatetime] = useState("");

  // groups가 변경되었을 때, 최신 날짜로 기본값 설정
  useEffect(() => {
    if (groups.length > 0) {
      setSelectedDatetime(groups[groups.length - 1].datetime);
    }
  }, [groups]);

  // 선택된 그룹의 기사 배열
  const selectedGroup = groups.find((group) => group.datetime === selectedDatetime);
  const articlesForSelectedWeek = selectedGroup ? selectedGroup.articles : [];

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

  // 선택한 주의 기사 배열을 정렬 (정렬 기준이 없으면 원본 배열 사용)
  const sortedArticles = useMemo(() => {
    if (!sortColumn) return articlesForSelectedWeek;
    const sorted = [...articlesForSelectedWeek].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === "asc" ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
    return sorted;
  }, [articlesForSelectedWeek, sortColumn, sortDirection]);

  return (
    <div className="w-full flex items-center justify-center">
      <Card className="m-2">
        <CardHeader className="w-full flex items-center border-b py-5 sm:flex-row">
          <CardTitle className="mr-auto">기사별 조회수 현황</CardTitle>
          <Select onValueChange={(value) => setSelectedDatetime(value)} defaultValue={selectedDatetime}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={selectedDatetime} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Weeks</SelectLabel>
                {/* 옵션 순서를 반대로 표시 */}
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>순번</TableHead>
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
              {sortedArticles.map((item, index) => (
                <TableRow key={item.newskey}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <a href={`https://www.yeongnam.com/web/view.php?key=${item.newskey}`} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
                  </TableCell>
                  <TableCell>{item.totalViews}</TableCell>
                  <TableCell>{item.newsdate}</TableCell>
                  <TableCell>
                    {Array.isArray(item.category) ? item.category.join(", ") : item.category}
                  </TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell>
                    {item.reporter && item.reporter.length > 6
                      ? item.reporter.slice(0, 7) + "..."
                      : item.reporter}
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
