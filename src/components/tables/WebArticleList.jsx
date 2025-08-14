import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption, TableFooter } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// 웹출고 기사 목록용 컬럼 배열
const columns = [
  { label: "출고일시", key: "newsdate" },
  { label: "제목", key: "newstitle" },
  { label: "작성자", key: "writers" },
  { label: "등급", key: "level" },
  { label: "등록일시", key: "reg_dt" },
  { label: "등록자ID", key: "reg_id" },
  { label: "분류", key: "art_org_class" },
];

// 분류코드를 분류명으로 변환하는 함수
const getCategoryName = (categoryCode) => {
  if (!categoryCode) return "-";
  
  // 세미콜론 제거 및 공백 제거
  const cleanCode = categoryCode.replace(/;/g, '').trim();
  
  const categoryMap = {
    'N02_01': '정치일반',
    'N02_02': '대통령·중앙행정',
    'N02_04': '대구·경북의회',
    'N02_06': '국방·북한',
    'N03': '경제',
    'N03_01': '경제일반',
    'N03_02': '증시·금융·보험',
    'N03_05': '부동산',
    'N03_08': '취업·창업',
    'N03_09': 'IT·자동차',
    'N04': '사회',
    'N04_01': '사회일반',
    'N04_02': '사건사고',
    'N04_10': '대구·경북 행정',
    'N04_11': '교육·과학',
    'N05': '건강',
    'N05_01': '건강·의료',
    'N06': '국제',
    'N06_01': '국제일반',
    'N06_02': '미국·일본·중국',
    'N06_05': '유럽',
    'N07': '교육/과학',
    'N07_02': '과학',
    'N08': '문화',
    'N08_01': '문화일반',
    'N08_02': '공연·전시',
    'N08_05': '문학·도서',
    'N09': '스포츠',
    'N09_01': '스포츠일반',
    'N09_02': '야구',
    'N09_03': '축구',
    'N09_04': '농구·배구·핸드볼',
    'N09_05': '골프',
    'N10': '오피니언',
    'N10_01': '사설',
    'N10_02': '기자칼럼',
    'N10_03': '전문가칼럼',
    'N10_04': '기고',
    'N10_05': '기타',
    'N10_06': '만평',
    'N12': '동정',
    'N12_01': '동정일반',
    'N12_02': '결혼',
    'N12_03': '부고',
    'N12_06': '인사',
    'N12_07': '운세',
    'N14': '기획/특집',
    'N14_01': '기획/특집',
    'N15': '위클리포유',
    'N15_01': '위클리포유일반',
    'N15_03': '여행/레저',
    'N15_04': '위클리영화',
    'N15_06': '패션·뷰티',
    'N15_07': '푸드',
    'N15_09': '칼럼',
    'N17': '시민기자',
    'N17_01': '시민기자',
    'N18': '연예',
    'N18_01': '연예일반',
    'N18_02': '방송·영화',
    'N21': '영상',
    'N21_01': '영상일반',
    'N02': '정치',
    'N23': '대구지역',
    'N23_01': '동구',
    'N23_02': '서구',
    'N23_03': '남구',
    'N23_04': '북구',
    'N23_05': '중구',
    'N23_06': '수성구',
    'N23_07': '달서구',
    'N23_08': '달성군',
    'N23_09': '대구종합',
    'N23_10': '군위군',
    'N23_99': '없음',
    'N24': '경북지역',
    'N24_01': '경산',
    'N24_02': '경주',
    'N24_03': '구미',
    'N24_04': '김천',
    'N24_05': '문경',
    'N24_06': '상주',
    'N24_07': '안동',
    'N24_08': '영주',
    'N24_09': '영천',
    'N24_10': '포항',
    'N24_11': '고령',
    'N24_12': '군위',
    'N24_13': '봉화',
    'N24_14': '성주',
    'N24_15': '영덕',
    'N24_16': '영양',
    'N24_17': '예천',
    'N24_18': '울릉',
    'N24_19': '울진',
    'N24_20': '의성',
    'N24_21': '청도',
    'N24_22': '청송',
    'N24_23': '칠곡',
    'N24_24': '경북종합'
  };
  
  return categoryMap[cleanCode] || cleanCode || "-";
};

const WebArticleList = ({ webArticleData }) => {
  // 초기 정렬 상태: 출고일 내림차순
  const [sortColumn, setSortColumn] = useState("newsdate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedDatetime, setSelectedDatetime] = useState("today");

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
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>웹출고 기사 목록</CardTitle>
              <CardDescription>붉은색 기사는 엠바고 기사입니다.</CardDescription>
            </div>
            <Select onValueChange={(value) => setSelectedDatetime(value)} defaultValue={selectedDatetime}>
              <SelectTrigger className="w-[160px]">
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
                <TableRow key={item.newskey || item._id || index}>
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
                    {item.writers ? (item.writers.length > 10 ? `${item.writers.substring(0, 10)}...` : item.writers) : "-"}
                  </TableCell>
                  <TableCell className="text-center">{item.level || "-"}</TableCell>
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
                  <TableCell>{item.reg_id || "-"}</TableCell>
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
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </div>
  );
};

export default WebArticleList;
