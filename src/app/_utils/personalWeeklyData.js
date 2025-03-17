export function personalWeeklyData(data) {
  // 1. 원시 데이터를 주별(일요일 기준)로 그룹화합니다.
  const weekGroups = new Map();

  data.forEach((article) => {
    const newsDate = new Date(article.newsdate);
    const dayOfWeek = newsDate.getDay(); // 0(일) ~ 6(토)
    const weekStart = new Date(newsDate);
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);
    const weekKey = weekStart.toISOString().slice(0, 10); // "YYYY-MM-DD"

    if (!weekGroups.has(weekKey)) {
      weekGroups.set(weekKey, []);
    }
    weekGroups.get(weekKey).push(article);
  });

  // 2. 각 주별로 기자+부서별 집계를 수행합니다.
  const result = [];
  weekGroups.forEach((articles, weekKey) => {
    // 주간 종료일(토요일 23:59:59) 계산
    const weekStartDate = new Date(weekKey);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    weekEndDate.setHours(23, 59, 59, 999);

    // 기자+부서별 집계를 위한 맵 (compound key: "부서||기자")
    const groupMap = new Map();
    articles.forEach((article) => {
      const reporter = article.gijaname;
      const department = article.code_name;
      const key = `${department}||${reporter}`;

      let latestVisitValue = 0;
      let latestVisitTime = null;
      if (Array.isArray(article.visits)) {
        article.visits.forEach((v) => {
          const visitDate = new Date(v.datetime);
          if (visitDate <= weekEndDate) {
            if (!latestVisitTime || visitDate > latestVisitTime) {
              latestVisitTime = visitDate;
              latestVisitValue = v.visits;
            }
          }
        });
      }

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          department,
          reporter,
          totalViews: 0,
          articleCount: 0,
        });
      }
      const groupData = groupMap.get(key);
      groupData.totalViews += latestVisitValue;
      groupData.articleCount += 1;
    });

    // 3. 그룹별 집계 결과를 배열로 변환 (평균 조회수 포함)
    const reportersArray = [];
    groupMap.forEach((groupData) => {
      const { department, reporter, totalViews, articleCount } = groupData;
      const avg = articleCount > 0 ? totalViews / articleCount : 0;
      const averageViews = parseFloat(avg.toFixed(2));
      reportersArray.push({ department, reporter, totalViews, articleCount, averageViews });
    });

    // 4. 전체 합산 행 추가 (전체 기자/전체 부서)
    const sumTotalViews = reportersArray.reduce((acc, d) => acc + d.totalViews, 0);
    const sumArticleCount = reportersArray.reduce((acc, d) => acc + d.articleCount, 0);
    const sumAverageViews = sumArticleCount > 0 ? parseFloat((sumTotalViews / sumArticleCount).toFixed(2)) : 0;
    reportersArray.unshift({
      department: "전체부서",
      reporter: "전체기자",
      totalViews: sumTotalViews,
      articleCount: sumArticleCount,
      averageViews: sumAverageViews,
    });

    // 5. 주별 결과 객체 생성
    result.push({
      datetime: weekKey,
      reporters: reportersArray,
    });
  });

  // 6. 주 시작일 기준 오름차순 정렬
  result.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  return result;
}
