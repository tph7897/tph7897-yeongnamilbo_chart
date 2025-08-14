import React, { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { getNameDepartment } from "@/app/data/userMapping";
import { getDepartmentNameById } from "@/app/data/departmentMapping";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getWeekKey, formatKoreanDate } from "@/lib/dateUtils";
import { truncateText, formatLevel, getLevelClass } from "@/lib/tableUtils";
import { useTableSort, useWeekSelection } from "@/hooks/useTable";

const COLUMNS = [
  { label: "기사제목", key: "title" },
  { label: "조회수", key: "totalViews" },
  { label: "작성일", key: "newsdate" },
  { label: "분류", key: "category", hideOnMobile: true },
  { label: "부서", key: "department", hideOnMobile: true },
  { label: "기자", key: "reporter" },
  { label: "유형", key: "level" },
];

const ArticleViewTable = ({ newsData }) => {
  // 뉴스 데이터를 주별 그룹으로 변환
  const transformToWeeklyGroups = (articles) => {
    if (!articles?.length) return [];

    const groups = new Map();

    articles.forEach((article) => {
      // code_name이 빈 문자열이면, buseid 값을 기반으로 부서명 채우기
      if (!article.code_name?.trim()) {
        const buseid = Number(article.buseid);
        const departmentName = getDepartmentNameById(buseid);
        if (departmentName !== "알 수 없음") {
          article.code_name = departmentName;
        }
      }

      // 주 키 생성
      const groupKey = getWeekKey(article.newsdate).split('T')[0];

      // 개별 기사 데이터 변환
      const transformedArticle = {
        category: Array.isArray(article.newsclass_names)
          ? article.newsclass_names
          : article.newsclass_names
          ? [article.newsclass_names]
          : [],
        department: getNameDepartment(article.byline_gijaname) || article.code_name,
        keyword: article.keyword || "",
        newsdate: formatKoreanDate(article.newsdate),
        newskey: article.newskey,
        reporter: article.byline_gijaname,
        title: article.newstitle,
        totalViews: Number(article.ref) || 0,
        level: article.level || "5",
      };

      // 그룹에 추가
      if (groups.has(groupKey)) {
        groups.get(groupKey).articles.push(transformedArticle);
      } else {
        groups.set(groupKey, { datetime: groupKey, articles: [transformedArticle] });
      }
    });

    // 그룹을 배열로 변환 및 날짜 순 정렬
    return Array.from(groups.values()).sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  };

  // 주간 데이터 그룹 생성
  const groups = useMemo(() => transformToWeeklyGroups(newsData), [newsData]);

  // 주 선택 훅
  const { currentWeek: currentSelectedDatetime, setSelectedWeek: setSelectedDatetime } = useWeekSelection(groups);

  // 선택된 그룹의 기사 배열
  const selectedGroup = groups.find((group) => group.datetime === currentSelectedDatetime);
  const articlesForSelectedWeek = selectedGroup?.articles || [];

  // 부서별 필터링을 위한 상태
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // 부서 목록 추출
  const departments = useMemo(() => {
    const deptSet = new Set();
    articlesForSelectedWeek.forEach((item) => {
      if (item.department) deptSet.add(item.department);
    });
    return Array.from(deptSet).sort();
  }, [articlesForSelectedWeek]);

  // 정렬 훅
  const { sortColumn, sortDirection, handleSort } = useTableSort("totalViews", "desc");

  // 부서 필터링 및 정렬된 기사 목록
  const sortedArticles = useMemo(() => {
    // 부서 필터링
    const filtered = selectedDepartment === "all" 
      ? articlesForSelectedWeek 
      : articlesForSelectedWeek.filter((article) => article.department === selectedDepartment);

    // 정렬
    if (!sortColumn) return filtered;
    
    return [...filtered].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      
      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [articlesForSelectedWeek, selectedDepartment, sortColumn, sortDirection]);
  return (
    <div className="w-full flex items-center justify-center">
      <Card className="m-2">
        <CardHeader className="w-full flex items-center border-b py-5 sm:flex-row">
          <CardTitle className="sm:mr-auto">기사별 조회수 현황</CardTitle>
          <div className="flex gap-2">
            <Select 
              onValueChange={(value) => setSelectedDatetime(value)} 
              value={currentSelectedDatetime}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="주 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>주별 선택</SelectLabel>
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
            
            <Select 
              onValueChange={(value) => setSelectedDepartment(value)} 
              value={selectedDepartment}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="부서 선택" />
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
                <TableHead className="hidden md:table-cell">순번</TableHead>
                {COLUMNS.map((col) => (
                  <TableHead 
                    key={col.key} 
                    className={`p-0 ${col.hideOnMobile ? "hidden md:table-cell" : ""}`}
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
                  <TableCell className="hidden md:table-cell">{index + 1}</TableCell>
                  <TableCell>
                    <a 
                      href={`https://www.yeongnam.com/web/view.php?key=${item.newskey}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {item.title}
                    </a>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {item.totalViews.toLocaleString()}
                  </TableCell>
                  <TableCell>{item.newsdate}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {Array.isArray(item.category) ? item.category.join(", ") : item.category}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{item.department}</TableCell>
                  <TableCell>
                    {truncateText(item.reporter)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${getLevelClass(item.level)}`}>
                      {formatLevel(item.level)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {sortedArticles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length + 1} className="text-center text-gray-500 py-8">
                    선택한 조건에 해당하는 기사가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticleViewTable;
