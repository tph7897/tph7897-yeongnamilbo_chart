function transformWeeklyDataToChartData(weeklyData) {
  // 부서 목록을 배열로 정의합니다.
  const departments = ["전체부서", "경북부(지역)", "디지털뉴스부", "경제_산업팀", "경북본사", "사회1팀", "콘텐츠_문화팀", "사회2팀", "경제_경제팀", "사진팀", "정치_서울본부", "기획취재부", "편집국", "콘텐츠_체육팀", "정치_대구", "사회3팀", "경제", "편집팀", "디지털국", "디지털컨텐츠팀", "정치", "논설실"];

  return weeklyData.map((item) => {
    // 결과 객체에 날짜를 추가합니다.
    const result = { date: item.datetime };

    // 각 부서에 대해 totalViews 값을 결과 객체에 추가합니다.
    departments.forEach((deptName) => {
      const deptData = item.departments.find((dept) => dept.department === deptName);
      result[deptName] = deptData ? deptData.totalViews : 0;
    });

    return result;
  });
}

export default transformWeeklyDataToChartData;
