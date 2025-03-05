function transformWeeklyDataToChartData(weeklyData) {
  return weeklyData.map((item) => {
    // "전체부서"와 "디지털국" 부서의 데이터를 찾습니다.
    const totalDept = item.departments.find((dept) => dept.department === "전체부서");
    const digitalDept = item.departments.find((dept) => dept.department === "디지털뉴스부");
    return {
      date: item.datetime, // 예: "2025-03-01"
      total: totalDept ? totalDept.totalViews : 0,
      digital: digitalDept ? digitalDept.totalViews : 0,
    };
  });
}

export default transformWeeklyDataToChartData;
