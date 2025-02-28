function weeklyVisits(data) {
  // 결과를 저장할 객체: { '토요일날짜(YYYY-MM-DD)': { total: 총조회수, count: 기사수 } }
  const weeklyData = {};

  data.forEach((record) => {
    // newsdate를 Date 객체로 변환 (UTC 기준)
    const newsDate = new Date(record.newsdate);
    // 요일: 일요일 0 ~ 토요일 6
    const dayOfWeek = newsDate.getUTCDay();
    // 해당 주의 토요일까지 남은 일수 계산
    const diffToSaturday = 6 - dayOfWeek;
    // newsdate 기준 토요일 날짜 구하기
    const saturdayDate = new Date(newsDate);
    saturdayDate.setUTCDate(newsDate.getUTCDate() + diffToSaturday);
    // YYYY-MM-DD 형식으로 변환
    const saturdayStr = saturdayDate.toISOString().split("T")[0];

    // visits 배열 중, datetime의 날짜가 해당 토요일 날짜와 일치하는 항목 찾기
    const visitEntry = record.visits.find((v) => v.datetime.startsWith(saturdayStr));
    const visitsCount = visitEntry ? visitEntry.visits : 0;

    // 같은 토요일 날짜의 조회수 및 기사 수 누적
    if (weeklyData[saturdayStr]) {
      weeklyData[saturdayStr].total += visitsCount;
      weeklyData[saturdayStr].count += 1;
    } else {
      weeklyData[saturdayStr] = { total: visitsCount, count: 1 };
    }
  });

  // 결과를 배열 형태의 테이블 데이터로 변환 (토요일, 총조회수, 평균조회수, 기사개수)
  const tableData = Object.entries(weeklyData)
    .map(([saturday, { total, count }]) => ({
      saturday,
      totalVisits: total,
      averageVisits: count > 0 ? (total / count).toFixed(2) : 0,
      articleCount: count,
    }))
    // 날짜 순서 정렬 (오름차순)
    .sort((a, b) => new Date(a.saturday) - new Date(b.saturday));

  return tableData;
}

export default weeklyVisits;

// const tableData = [
//   {
//     articleCount: 632,
//     averageVisits: "321.79",
//     saturday: "2025-02-28",
//     totalVisits: 203374,
//   },
//   {
//     articleCount: 632,
//     averageVisits: "321.79",
//     saturday: "2025-02-28",
//     totalVisits: 203374,
//   },
//   {
//     articleCount: 632,
//     averageVisits: "321.79",
//     saturday: "2025-02-28",
//     totalVisits: 203374,
//   },
//   {
//     articleCount: 632,
//     averageVisits: "321.79",
//     saturday: "2025-02-28",
//     totalVisits: 203374,
//   },
// ];
