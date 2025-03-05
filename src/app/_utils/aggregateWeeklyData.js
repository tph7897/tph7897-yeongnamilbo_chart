export function getCurrentWeekRange() {
  const now = new Date();
  // dayOfWeek: 0(일) ~ 6(토)
  const dayOfWeek = now.getDay();

  // 이번 주 일요일 0시 설정
  //   = 오늘 날짜에서 dayOfWeek 일 전으로 돌린 뒤, 시분초 0으로 초기화
  const startOfWeek = new Date(now);
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  // 이번 주 토요일 23:59:59 설정
  //   = startOfWeek + 6일, 시분초 23:59:59
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
}

export function aggregateWeeklyData(data, startOfWeek, endOfWeek) {
  // 1) 주간 범위(일요일~토요일)에 해당하는 기사만 필터링
  const weeklyArticles = data.filter((article) => {
    const newsDate = new Date(article.newsdate);
    return newsDate >= startOfWeek && newsDate <= endOfWeek;
  });

  // 2) 부서별 데이터 저장할 맵
  const departmentMap = new Map();

  // 3) 기사 순회하며 endOfWeek(= 토요일 23:59:59) 이전 방문자수 중 '가장 최신' 방문자 수 사용
  weeklyArticles.forEach((article) => {
    const department = article.code_name; // 부서명

    let latestVisitValue = 0;
    let latestVisitTime = null;

    // visits에서 endOfWeek 이하이면서 가장 최근(= 가장 큰 datetime)
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

    // 부서별 최초 세팅
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

  // 4) 결과 합산
  const result = [];
  departmentMap.forEach((deptData) => {
    const { department, totalViews, articleCount } = deptData;
    const avg = articleCount > 0 ? totalViews / articleCount : 0;
    const averageViews = parseFloat(avg.toFixed(2));

    result.push({
      department,
      totalViews,
      articleCount,
      averageViews,
    });
  });

  // 5) 전체부서 합산 추가 (result 맨 앞에)
  const sumTotalViews = result.reduce((acc, d) => acc + d.totalViews, 0);
  const sumArticleCount = result.reduce((acc, d) => acc + d.articleCount, 0);
  const sumAverageViews = sumArticleCount > 0 ? parseFloat((sumTotalViews / sumArticleCount).toFixed(2)) : 0;

  // 맨 앞에 삽입
  result.unshift({
    department: "전체부서",
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
    visits: [{ datetime: "2025-03-01T10:00:00.000Z", visits: 100 }],
  },
];

// 이번 주 일요일~토요일 범위를 "자동"으로 계산 (로컬 기준)
const { startOfWeek, endOfWeek } = getCurrentWeekRange();

// 함수 실행
const weeklySummary = aggregateWeeklyData(data, startOfWeek, endOfWeek);

// console.log("startOfWeek:", startOfWeek);
// console.log("endOfWeek:  ", endOfWeek);
// console.log("weeklySummary:", weeklySummary);

/**
 * 예시 출력:
 * startOfWeek: Sun Feb 23 2025 00:00:00 GMT+0000 (UTC)
 * endOfWeek:   Sat Mar 01 2025 23:59:59 GMT+0000 (UTC)
 * weeklySummary: [
 *   {
 *     department: "논설실",
 *     totalViews: 94,   // (21 + 73) + (16 + 52) = 162, 기사 2개?
 *     articleCount: 2,
 *     averageViews: 81
 *   }
 * ]
 * (단, 실제 visits/시간대에 따라 달라질 수 있음)
 */
