"use client";
import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { getLevelClass } from "@/lib/tableUtils";




const DailyArticleStats = ({ newsData, onRefresh }) => {
  // 새로고침 핸들러
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      // onRefresh prop이 없으면 페이지 새로고침
      window.location.reload();
    }
  };
  // 통계 계산을 위한 데이터 처리
  const stats = useMemo(() => {
    if (!newsData || newsData.length === 0) {
      return {
        todayArticles: 0,
        todayLevelStats: {},
        yesterdayArticles: 0,
        yesterdayLevelStats: {},
        todaySelfArticleRatio: 0,
        yesterdaySelfArticleRatio: 0,
        todaySelfArticles: 0,
        yesterdaySelfArticles: 0,
        todayGeneralArticles: 0
      };
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // 오늘 기사 필터링
    const todayArticles = newsData.filter(article => 
      article.newsdate && article.newsdate.startsWith(todayStr)
    );

    // 어제 기사 필터링
    const yesterdayArticles = newsData.filter(article => 
      article.newsdate && article.newsdate.startsWith(yesterdayStr)
    );

    // 레벨별 통계 계산
    const calculateLevelStats = (articles) => {
      const levelStats = {};
      articles.forEach(article => {
        const level = article.level || '5';
        levelStats[level] = (levelStats[level] || 0) + 1;
      });
      return levelStats;
    };

    // 오늘 자체기사와 일반기사 개수 계산
    const todaySelfArticles = todayArticles.filter(article => article.level === '1').length;
    const todayGeneralArticles = todayArticles.filter(article => article.level === '2').length;
    
    // 어제 자체기사 개수 계산
    const yesterdaySelfArticles = yesterdayArticles.filter(article => article.level === '1').length;
    
    // 오늘 자체기사 비율 계산 (전체 기사 대비)
    const todaySelfArticleRatio = todayArticles.length > 0 ? 
      Math.round((todaySelfArticles / todayArticles.length) * 100) : 0;
    
    // 어제 자체기사 비율 계산 (전체 기사 대비)
    const yesterdaySelfArticleRatio = yesterdayArticles.length > 0 ? 
      Math.round((yesterdaySelfArticles / yesterdayArticles.length) * 100) : 0;

    return {
      todayArticles: todayArticles.length,
      todayLevelStats: calculateLevelStats(todayArticles),
      yesterdayArticles: yesterdayArticles.length,
      yesterdayLevelStats: calculateLevelStats(yesterdayArticles),
      todaySelfArticleRatio: todaySelfArticleRatio,
      yesterdaySelfArticleRatio: yesterdaySelfArticleRatio,
      todaySelfArticles: todaySelfArticles,
      yesterdaySelfArticles: yesterdaySelfArticles,
      todayGeneralArticles: todayGeneralArticles
    };
  }, [newsData]);

  // 어제 날짜 계산
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const year = yesterday.getFullYear().toString().slice(-2);
    const month = (yesterday.getMonth() + 1).toString().padStart(2, '0');
    const date = yesterday.getDate().toString().padStart(2, '0');
    
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = days[yesterday.getDay()];
    
    return `${year}-${month}-${date} (${dayName})`;
  };

  // 레벨별 통계를 문자열로 변환
  const formatLevelStats = (levelStats) => {
    const levels = Object.keys(levelStats).sort();
    if (levels.length === 0) return <span>기사 없음</span>;

    const levelNames = {
      '1': '자체',
      '2': '일반', 
      '5': '미분류'
    };

    return (
      <div className="flex flex-wrap gap-1">
        {levels.map((level, index) => (
          <span 
            key={level}
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelClass(level)}`}
          >
            {levelNames[level] || `레벨${level}`}: {levelStats[level]}개
          </span>
        ))}
      </div>
    );
  };

  // 마지막 업데이트 시간 계산
  const getLastUpdateTime = () => {
    if (!newsData || newsData.length === 0 || !newsData[0].last_update) return null;
    
    const updateTime = new Date(newsData[0].last_update);
    
    return updateTime.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC' // UTC 시간을 그대로 사용하되 한국 포맷으로 표시
    });
  };

  return (
    <Card className="m-0 sm:m-2">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="flex-1">
          <CardTitle className="text-base sm:text-lg">자체 기사 통계</CardTitle>
          <CardDescription className="text-xs sm:text-sm"> {getLastUpdateTime() && `최종 업데이트: ${getLastUpdateTime()} `}</CardDescription>
          <CardDescription className="text-xs sm:text-sm">
            <span className="text-blue-600 font-medium">등급1 : 자체</span>, {' '}
            <span className="text-gray-600 font-medium">등급2 : 일반</span>, {' '}
            <span className="text-red-600 font-medium">등급5 : 미분류</span>
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh} className="ml-2">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">📰 오늘 기사</CardTitle>
              <CardDescription>
                <span className="text-black">
                  {new Date().toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>{" "}
                출고 현황
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-blue-600">{stats.todayArticles}개</div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">등급별 분포</div>
                <div className="text-sm text-gray-700">{formatLevelStats(stats.todayLevelStats)}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">📊 오늘의 자체기사 비율</CardTitle>
              <CardDescription>오늘 전체 출고 기사 중 자체기사 비율</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={`text-3xl font-bold ${stats.todaySelfArticleRatio >= 35 ? "text-green-600" : "text-red-600"}`}>{stats.todaySelfArticleRatio}%</div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">오늘 기사 비율 구성</div>
                <div className="flex flex-wrap gap-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelClass('1')}`}>
                    자체: {stats.todaySelfArticles}개
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    전체: {stats.todayArticles}개
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">📅 어제 기사</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                <span className="text-black">{getYesterdayDate()}</span> 출고 기사수와 자체기사 비율
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-8">
                <div className="text-3xl font-bold text-purple-600">총 {stats.yesterdayArticles}개</div>
                <div className={`text-3xl font-bold ${stats.yesterdaySelfArticleRatio >= 35 ? "text-green-600" : "text-red-600"}`}>{stats.yesterdaySelfArticleRatio}%</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">등급별 분포</div>
                <div className="text-sm text-gray-700">{formatLevelStats(stats.yesterdayLevelStats)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyArticleStats;
