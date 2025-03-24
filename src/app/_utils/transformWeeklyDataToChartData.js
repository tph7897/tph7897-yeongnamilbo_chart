const departments = ["전체부서", "경북부(지역)", "디지털뉴스부", "경제_산업팀", "경북본사", "사회1팀", "콘텐츠_문화팀", "사회2팀", "경제_경제팀", "사진팀", "정치_서울본부", "기획취재부", "편집국", "콘텐츠_체육팀", "정치_대구", "사회3팀", "경제", "편집팀", "디지털국", "디지털컨텐츠팀", "정치", "논설실"];
// /app/_utils/transformWeeklyDataToChartData.js
export default function transformWeeklyDataToChartData(newsData) {
  const weeklyMap = {};

  newsData.forEach((article) => {
    // 뉴스 날짜를 Date 객체로 변환
    const articleDate = new Date(article.newsdate);
    // 해당 날짜가 속한 주의 일요일을 구함 (일요일부터 시작)
    const weekSunday = new Date(articleDate);
    weekSunday.setDate(articleDate.getDate() - articleDate.getDay());
    // 그 주의 토요일 날짜 계산 (일요일 + 6일)
    const weekSaturday = new Date(weekSunday);
    weekSaturday.setDate(weekSunday.getDate() + 6);
    const weekLabel = weekSaturday.toISOString(); // ISO 형식 문자열
    const timestamp = weekSaturday.getTime();

    // 해당 주가 map에 없으면 초기화
    if (!weeklyMap[weekLabel]) {
      weeklyMap[weekLabel] = { date: weekLabel, total: 0, digital: 0, timestamp };
    }

    // 조회수는 ref 값 (문자열일 경우 숫자로 변환)
    const refCount = Number(article.ref) || 0;
    weeklyMap[weekLabel].total += refCount;
    // code_name이 "디지털뉴스부"인 경우 디지털 조회수에 추가
    if (article.code_name === "디지털뉴스부") {
      weeklyMap[weekLabel].digital += refCount;
    }
  });

  // Map 객체를 배열로 변환한 후 타임스탬프를 기준으로 정렬
  const weeklyData = Object.values(weeklyMap);
  weeklyData.sort((a, b) => a.timestamp - b.timestamp);
  // timestamp는 최종 데이터에서 제거
  weeklyData.forEach((item) => delete item.timestamp);

  return weeklyData;
}
