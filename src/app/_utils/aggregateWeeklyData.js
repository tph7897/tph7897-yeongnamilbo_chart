export function aggregateWeeklyData(data) {
  // 1. 원시 데이터를 주별(일요일 기준)로 그룹화
  const weekGroups = new Map();

  data.forEach((article) => {
    const newsDate = new Date(article.newsdate);
    // 해당 기사의 주의 시작일(일요일 0시) 계산
    const weekStart = new Date(newsDate);
    const dayOfWeek = weekStart.getDay(); // 0(일) ~ 6(토)
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);
    const weekKey = weekStart.toISOString().slice(0, 10); // "YYYY-MM-DD"

    if (!weekGroups.has(weekKey)) {
      weekGroups.set(weekKey, []);
    }
    weekGroups.get(weekKey).push(article);
  });

  // 2. 각 주별로 부서 집계 수행
  const result = [];
  weekGroups.forEach((articles, weekKey) => {
    // 주간 범위: 주 시작(일요일)부터 토요일 23:59:59까지
    const weekStartDate = new Date(weekKey);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    weekEndDate.setHours(23, 59, 59, 999);

    // 부서별 집계를 위한 맵 (key: 부서명)
    const departmentMap = new Map();

    articles.forEach((article) => {
      const department = article.code_name; // 부서명

      let latestVisitValue = 0;
      let latestVisitTime = null;
      // visits 배열에서 해당 주(토요일) 이전 또는 같은 날 기록 중 최신 방문수 선택
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

      if (!departmentMap.has(department)) {
        departmentMap.set(department, {
          department,
          totalViews: 0,
          articleCount: 0,
        });
      }
      const deptData = departmentMap.get(department);
      deptData.totalViews += latestVisitValue;
      deptData.articleCount += 1;
    });

    // 3. 부서별 집계 결과 배열 생성
    const deptArray = [];
    departmentMap.forEach((deptData) => {
      const { department, totalViews, articleCount } = deptData;
      const averageViews = articleCount > 0 ? parseFloat((totalViews / articleCount).toFixed(2)) : 0;
      deptArray.push({
        department,
        totalViews,
        articleCount,
        averageViews,
      });
    });

    // 4. 전체부서 합산 데이터 추가 (맨 앞에 삽입)
    const sumTotalViews = deptArray.reduce((acc, d) => acc + d.totalViews, 0);
    const sumArticleCount = deptArray.reduce((acc, d) => acc + d.articleCount, 0);
    const sumAverageViews = sumArticleCount > 0 ? parseFloat((sumTotalViews / sumArticleCount).toFixed(2)) : 0;

    deptArray.unshift({
      department: "전체부서",
      totalViews: sumTotalViews,
      articleCount: sumArticleCount,
      averageViews: sumAverageViews,
    });

    // 5. 해당 주 결과 객체 생성 및 추가
    result.push({
      datetime: weekKey,
      department: deptArray,
    });
  });

  // 6. 결과를 주 시작일 기준 오름차순 정렬 (원하는 경우 내림차순도 가능)
  result.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  return result;
}
