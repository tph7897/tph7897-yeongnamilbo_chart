export function getCurrentWeekRange() {
  const now = new Date();
  // dayOfWeek: 0(일) ~ 6(토)
  const dayOfWeek = now.getDay();

  // 이번 주 일요일 0시 설정
  const startOfWeek = new Date(now);
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  // 이번 주 토요일 23:59:59 설정
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
}

export function personalWeeklyData(data, startOfWeek, endOfWeek) {
  // 1) 주간 범위(일요일~토요일)에 해당하는 기사만 필터링
  const weeklyArticles = data.filter((article) => {
    const newsDate = new Date(article.newsdate);
    return newsDate >= startOfWeek && newsDate <= endOfWeek;
  });

  // 2) 기자+부서별 데이터 저장할 맵 (compound key: "부서||기자")
  const groupMap = new Map();

  // 3) 기사 순회하며 endOfWeek(= 토요일 23:59:59) 이전 방문자수 중 '가장 최신' 방문자 수 사용
  weeklyArticles.forEach((article) => {
    const reporter = article.gijaname;
    const department = article.code_name;
    // compound key 생성
    const key = `${department}||${reporter}`;

    let latestVisitValue = 0;
    let latestVisitTime = null;

    if (Array.isArray(article.visits)) {
      article.visits.forEach((v) => {
        const visitDate = new Date(v.datetime);
        if (visitDate <= endOfWeek) {
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

  // 4) 결과 배열 생성 (계산된 평균 포함)
  const result = [];
  groupMap.forEach((groupData) => {
    const { department, reporter, totalViews, articleCount } = groupData;
    const avg = articleCount > 0 ? totalViews / articleCount : 0;
    const averageViews = parseFloat(avg.toFixed(2));

    result.push({
      department,
      reporter,
      totalViews,
      articleCount,
      averageViews,
    });
  });

  // 5) 전체 합산 행 추가 (전체 기자/전체 부서)
  const sumTotalViews = result.reduce((acc, d) => acc + d.totalViews, 0);
  const sumArticleCount = result.reduce((acc, d) => acc + d.articleCount, 0);
  const sumAverageViews = sumArticleCount > 0 ? parseFloat((sumTotalViews / sumArticleCount).toFixed(2)) : 0;

  result.unshift({
    department: "전체부서",
    reporter: "전체기자",
    totalViews: sumTotalViews,
    articleCount: sumArticleCount,
    averageViews: sumAverageViews,
  });

  return result;
}

// ----------------------------------------------
// 사용 예시:

// 임의의 예시 데이터
const data = [
  {
    _id: "67c10ceb54a5b9376f296c75",
    newskey: "20250227010003450",
    newsdate: "2025-02-23T09:00:00.000Z", // 일요일(예시)
    buseid: 1,
    code_name: "논설실",
    gijaname: "손병현",
    visits: [
      { datetime: "2025-02-25T10:10:03.168Z", visits: 21 },
      { datetime: "2025-03-01T09:32:29.630Z", visits: 73 },
    ],
  },
  {
    _id: "67c10ceb54a5b9376f296c74",
    newskey: "20250227010003447",
    newsdate: "2025-02-28T12:00:00.000Z", // 금요일(예시)
    buseid: 1,
    code_name: "논설실",
    gijaname: "김종윤",
    visits: [
      { datetime: "2025-02-28T10:10:03.168Z", visits: 16 },
      { datetime: "2025-03-01T09:32:29.630Z", visits: 52 },
    ],
  },
  {
    _id: "xyz",
    newskey: "20250227010003499",
    newsdate: "2025-03-01T01:00:00.000Z", // 토요일 다음날 새벽 -> 범위 밖(예시)
    buseid: 2,
    code_name: "디지털국",
    gijaname: "이남영",
    visits: [{ datetime: "2025-03-01T10:00:00.000Z", visits: 100 }],
  },
];
