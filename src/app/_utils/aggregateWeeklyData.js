const buseCode = {
  1006: "정치",
  1007: "정치_대구",
  1008: "정치_서울본부",
  1010: "경제",
  1011: "경제_경제팀",
  1012: "사회1팀",
  1013: "사회2팀",
  1015: "콘텐츠_문화팀",
  1016: "콘텐츠_문화팀",
  1018: "종교팀",
  1019: "경북본사",
  1020: "경북부(지역)",
};

// 로컬 날짜를 "YYYY-MM-DD" 형식으로 포맷하는 함수
function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

export function aggregateWeeklyData(data) {
  // 1. 원시 데이터를 주별(각 기사의 기준 토요일)로 그룹화
  const weekGroups = new Map();

  data.forEach((article) => {
    // code_name이 빈 문자열이라면 buseCode에서 buseid 값을 대입
    if (!article.code_name || article.code_name.trim() === "") {
      const buseid = Number(article.buseid);
      if (buseCode[buseid]) {
        article.code_name = buseCode[buseid];
      }
      console.log("article", article);
    }

    const newsDate = new Date(article.newsdate);
    // 해당 기사의 주의 토요일 계산
    const day = newsDate.getDay(); // 0(일) ~ 6(토)
    const diff = 6 - day; // 토요일까지 남은 일수
    const saturday = new Date(newsDate);
    saturday.setDate(newsDate.getDate() + diff);
    saturday.setHours(0, 0, 0, 0);
    // 로컬 날짜를 사용해 그룹키 생성 (토요일 날짜)
    const groupKey = formatLocalDate(saturday); // "YYYY-MM-DD"

    if (!weekGroups.has(groupKey)) {
      weekGroups.set(groupKey, []);
    }
    weekGroups.get(groupKey).push(article);
  });

  // 2. 각 주별로 부서 집계 수행 (조회수는 ref 필드를 사용)
  const result = [];
  weekGroups.forEach((articles, weekKey) => {
    // 주간 범위: 이번 그룹의 토요일(그룹키)을 기준으로, 해당 토요일 23:59:59까지
    const weekEndDate = new Date(weekKey);
    weekEndDate.setHours(23, 59, 59, 999);

    // 부서별 집계를 위한 맵 (key: 부서명)
    const departmentMap = new Map();

    articles.forEach((article) => {
      const department = article.code_name; // 부서명
      // 조회수는 ref 필드 (문자열일 경우 숫자로 변환)
      const viewCount = Number(article.ref) || 0;

      if (!departmentMap.has(department)) {
        departmentMap.set(department, {
          department,
          totalViews: 0,
          articleCount: 0,
        });
      }
      const deptData = departmentMap.get(department);
      deptData.totalViews += viewCount;
      deptData.articleCount += 1;
    });

    // 3. 부서별 집계 결과 배열 생성 (평균 조회수 포함)
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
      datetime: weekKey, // 토요일 날짜가 그룹키로 들어감
      department: deptArray,
    });
  });

  // 6. 결과를 주 시작일 기준 오름차순 정렬
  result.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  console.log("result", result);
  return result;
}
