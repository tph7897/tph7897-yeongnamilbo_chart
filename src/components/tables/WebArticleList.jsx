import React, { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption, TableFooter } from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

// 웹출고 기사 목록용 컬럼 배열
const columns = [
  { label: "제목", key: "title" },
  { label: "기자", key: "reporter" },
  { label: "부서", key: "department" },
  { label: "출고일시", key: "publishDate" },
];

const WebArticleList = ({ webArticleData }) => {
  // 초기 정렬 상태: 출고일 내림차순
  const [sortColumn, setSortColumn] = useState("publishDate");
  const [sortDirection, setSortDirection] = useState("desc");
  // 선택한 기간 상태 관리
  const [selectedPeriod, setSelectedPeriod] = useState("");

  // 기간별 그룹화 (필요시 구현)
  const periodGroups = useMemo(() => {
    // 기간별 필터링이 필요한 경우 여기에 구현
    return [];
  }, [webArticleData]);

  // 기본 기간 설정
  useEffect(() => {
    if (periodGroups.length > 0) {
      const defaultPeriod = periodGroups[0][0];
      setSelectedPeriod(defaultPeriod);
    }
  }, [periodGroups]);

  // 웹출고 기사 목록 데이터 (그대로 사용 또는 가공)
  const webArticles = useMemo(() => {
    if (!webArticleData) return [];
    
    // 기간 필터링이 필요한 경우
    if (selectedPeriod) {
      // 선택된 기간에 맞는 데이터만 필터링
      return webArticleData.filter(item => {
        // 여기에 기간 필터링 로직 추가
        return true; // 임시로 모든 데이터 반환
      });
    }
    
    // 전체 데이터 반환
    return webArticleData;
  }, [webArticleData, selectedPeriod]);

  // 웹출고 기사 데이터를 정렬
  const sortedWebArticles = useMemo(() => {
    let sorted = [...webArticles];
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
  }, [webArticles, sortColumn, sortDirection]);

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
          <CardTitle className="sm:mr-auto">웹출고 기사 목록</CardTitle>
          <Select onValueChange={(value) => setSelectedPeriod(value)} defaultValue={selectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="기간 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>기간별</SelectLabel>
                {periodGroups.map(([groupKey]) => (
                  <SelectItem key={groupKey} value={groupKey}>
                    {groupKey}
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
              {sortedWebArticles.map((item, index) => (
                <TableRow key={item.id || index}>
                  <TableCell className="max-w-xs truncate">{item.title || '-'}</TableCell>
                  <TableCell>{item.reporter || '-'}</TableCell>
                  <TableCell>{item.department || '-'}</TableCell>
                  <TableCell>{item.publishDate || '-'}</TableCell>
                  <TableCell className="text-right">{item.views || 0}</TableCell>
                </TableRow>
              ))}
              {sortedWebArticles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-gray-500 py-8">
                    웹출고 기사가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter></TableFooter>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </div>
  );
};

export default WebArticleList;
