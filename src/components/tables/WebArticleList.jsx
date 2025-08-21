import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption, TableFooter } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getIdName } from "@/app/data/userMapping";
import { getCategoryName } from "@/app/data/categoryMapping";
import { truncateText, formatLevel, getLevelClass } from "@/lib/tableUtils";
import { useTableSort } from "@/hooks/useTable";

// 웹출고 기사 목록용 컬럼 배열
const columns = [
  { label: "순번", key: "index" },
  { label: "출고일시", key: "newsdate" },
  { label: "제목", key: "newstitle" },
  { label: "작성자", key: "writers" },
  { label: "등급", key: "level" },
  { label: "등록일시", key: "reg_dt" },
  { label: "등록자ID", key: "reg_id" },
  { label: "분류", key: "art_org_class" },
];

const WebArticleList = ({ webArticleData }) => {
  const [selectedDatetime, setSelectedDatetime] = useState("today");

  // 정렬 훅 사용
  const { sortColumn, sortDirection, handleSort, sortData } = useTableSort("newsdate", "desc");

  // 날짜별 그룹 생성
  const dateGroups = useMemo(() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    return [
      {
        value: "today",
        label: `오늘 (${today.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })})`,
        dateStr: todayStr
      },
      {
        value: "yesterday", 
        label: `어제 (${yesterday.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })})`,
        dateStr: yesterdayStr
      }
    ];
  }, []);

  // 웹출고 기사 목록 데이터 (날짜 필터링 적용)
  const webArticles = useMemo(() => {
    if (!webArticleData) return [];
    
    const selectedGroup = dateGroups.find(group => group.value === selectedDatetime);
    if (!selectedGroup) return webArticleData;
    
    return webArticleData.filter(article => 
      article.newsdate && article.newsdate.startsWith(selectedGroup.dateStr)
    );
  }, [webArticleData, selectedDatetime, dateGroups]);

  // 웹출고 기사 데이터를 정렬
  const sortedWebArticles = useMemo(() => {
    return sortData(webArticles);
  }, [webArticles, sortData]);

  return (
    <div className="w-full flex items-center justify-center">
      <Card className="mx-2 w-full max-w-7xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">웹출고 기사 목록</CardTitle>
              <CardDescription className="text-sm">붉은색 기사는 엠바고 기사입니다.</CardDescription>
            </div>
            <Select onValueChange={(value) => setSelectedDatetime(value)} defaultValue={selectedDatetime}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="날짜 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>날짜 선택</SelectLabel>
                  {dateGroups.map((group) => (
                    <SelectItem key={group.value} value={group.value}>
                      {group.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {/* 데스크톱 테이블 뷰 */}
          <div className="hidden md:block">
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
                  <TableRow key={item.newskey || item._id || index}>
                    <TableCell className="text-center font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell className="min-w-20">
                      {item.newsdate ? (
                        <div className="text-sm">
                          <div>
                            {new Date(item.newsdate).toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                              timeZone: "UTC",
                            })}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className={`max-w-xs truncate ${item.embargo_type === "1" ? "text-red-500 font-medium" : ""}`} title={item.newstitle}>
                      {item.newstitle || "-"}
                    </TableCell>
                    <TableCell className="min-w-24 max-w-32" title={item.writers}>
                      {item.writers ? truncateText(item.writers, 10) : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs ${getLevelClass(item.level)}`}>
                        {formatLevel(item.level)}
                      </span>
                    </TableCell>
                    <TableCell className="min-w-20">
                      {item.reg_dt ? (
                        <div className="text-sm">
                          {(() => {
                            const selectedGroup = dateGroups.find((group) => group.value === selectedDatetime);
                            const regDateStr = item.reg_dt.split("T")[0];
                            const isSelectedDate = selectedGroup && regDateStr === selectedGroup.dateStr;

                            return (
                              <>
                                {!isSelectedDate && (
                                  <div className="text-gray-500">
                                    {new Date(item.reg_dt).toLocaleDateString("ko-KR", {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                      timeZone: "UTC",
                                    })}
                                  </div>
                                )}
                                <div>
                                  {new Date(item.reg_dt).toLocaleTimeString("ko-KR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                    timeZone: "UTC",
                                  })}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{getIdName(item.reg_id) || "-"}</TableCell>
                    <TableCell className="min-w-20" title={item.art_org_class}>
                      {getCategoryName(item.art_org_class)}
                    </TableCell>
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
          </div>

          {/* 모바일 카드 뷰 */}
          <div className="block md:hidden space-y-4">
            {sortedWebArticles.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                웹출고 기사가 없습니다.
              </div>
            ) : (
              sortedWebArticles.map((item, index) => (
                <Card key={item.newskey || item._id || index} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                          {index + 1}
                        </span>
                        <h3 className={`text-sm font-medium flex-1 ${item.embargo_type === "1" ? "text-red-500" : ""}`}>
                          {item.newstitle || "-"}
                        </h3>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs flex-shrink-0 ${getLevelClass(item.level)}`}>
                        {formatLevel(item.level)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">출고:</span>{" "}
                        {item.newsdate ? new Date(item.newsdate).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: "UTC",
                        }) : "-"}
                      </div>
                      <div>
                        <span className="font-medium">작성자:</span>{" "}
                        {item.writers ? truncateText(item.writers, 8) : "-"}
                      </div>
                      <div>
                        <span className="font-medium">등록:</span>{" "}
                        {item.reg_dt ? new Date(item.reg_dt).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: "UTC",
                        }) : "-"}
                      </div>
                      <div>
                        <span className="font-medium">등록자:</span>{" "}
                        {getIdName(item.reg_id) || "-"}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">분류:</span>{" "}
                        {getCategoryName(item.art_org_class)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </div>
  );
};

export default WebArticleList;
