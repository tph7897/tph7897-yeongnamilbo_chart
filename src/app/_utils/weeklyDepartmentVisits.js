function weeklyDepartmentVisits(data) {
  if (!Array.isArray(data)) {
    console.error("Input data is not an array", data);
    return [];
  }

  // 주간 데이터를 저장할 객체
  // { '토요일날짜(YYYY-MM-DD)': { departmentName: { total: 총조회수, count: 기사수 } } }
  const weeklyData = {};

  data.forEach((record) => {
    // newsdate 기준 Date 객체 생성 (UTC)
    const newsDate = new Date(record.newsdate);
    const dayOfWeek = newsDate.getUTCDay(); // 0(일) ~ 6(토)
    // 해당 주 토요일 날짜 계산 (UTC)
    const diffToSaturday = 6 - dayOfWeek;
    const saturdayDate = new Date(newsDate);
    saturdayDate.setUTCDate(newsDate.getUTCDate() + diffToSaturday);
    const saturdayStr = saturdayDate.toISOString().split("T")[0];

    // 주의 시작 날짜 (일요일)
    const weekStart = new Date(newsDate);
    weekStart.setUTCDate(newsDate.getUTCDate() - dayOfWeek);

    // visits 배열에서 해당 토요일 날짜에 해당하는 entry 찾기 (옵셔널 체이닝 사용)
    let visitEntry = record.visits?.find((v) => v.datetime.startsWith(saturdayStr));

    // 만약 해당 토요일 entry가 없으면, 그 주(일요일 ~ 토요일) 내의 마지막 날짜 entry를 사용
    if (!visitEntry) {
      const weeklyVisits =
        record.visits?.filter((v) => {
          const vDate = new Date(v.datetime);
          return vDate >= weekStart && vDate <= saturdayDate;
        }) ?? [];
      if (weeklyVisits.length > 0) {
        visitEntry = weeklyVisits.reduce((prev, curr) => (new Date(prev.datetime) > new Date(curr.datetime) ? prev : curr));
      }
    }
    // 해당 entry가 있으면 방문수, 없으면 0
    const visitsCount = visitEntry ? visitEntry.visits : 0;
    // 부서명은 code_name 사용
    const department = record.code_name;

    // 해당 토요일의 데이터가 없으면 생성
    if (!weeklyData[saturdayStr]) {
      weeklyData[saturdayStr] = {};
    }
    // 부서별 데이터 초기화
    if (!weeklyData[saturdayStr][department]) {
      weeklyData[saturdayStr][department] = { total: 0, count: 0 };
    }
    // 누적 합산: 해당 기사 방문수 누적, 기사 수 증가
    weeklyData[saturdayStr][department].total += visitsCount;
    weeklyData[saturdayStr][department].count += 1;
  });

  // 결과를 원하는 출력 형식으로 변환
  // 최종 결과: [{ datetime: "YYYY-MM-DD", departments: [ { department, totalViews, articleCount, averageViews }, ... ] }, ... ]
  const result = Object.entries(weeklyData)
    .map(([saturday, depData]) => {
      // 부서별 결과 배열 생성
      const departments = Object.entries(depData).map(([department, stats]) => ({
        department,
        totalViews: stats.total,
        articleCount: stats.count,
        averageViews: stats.count > 0 ? Number((stats.total / stats.count).toFixed(2)) : 0,
      }));

      // 전체 부서 합산 계산
      const overall = departments.reduce(
        (acc, { totalViews, articleCount }) => {
          acc.totalViews += totalViews;
          acc.articleCount += articleCount;
          return acc;
        },
        { totalViews: 0, articleCount: 0 }
      );
      overall.averageViews = overall.articleCount > 0 ? Number((overall.totalViews / overall.articleCount).toFixed(2)) : 0;

      // "전체부서"를 맨 앞에 추가
      departments.unshift({
        department: "전체부서",
        totalViews: overall.totalViews,
        articleCount: overall.articleCount,
        averageViews: overall.averageViews,
      });

      return { datetime: saturday, departments };
    })
    // 날짜 순 정렬 (오름차순)
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  return result;
}

export default weeklyDepartmentVisits;
