import personBuse from "@/app/data/personBuse"; // 추가: personBuse import

export function transformWeeklyArticles(newsData) {
  // 부서 매핑 객체
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

  // 새로운 함수: 개별 기사를 변환하는 함수
  function transformArticle(article) {
    const d = new Date(article.newsdate);
    const yy = String(d.getFullYear()).slice(-2);
    const mm = ("0" + (d.getMonth() + 1)).slice(-2);
    const dd = ("0" + d.getDate()).slice(-2);
    const formattedNewsDate = `${yy}.${mm}.${dd}`;
    const latestVisitValue = Number(article.ref) || 0;
    
    return {
      category: Array.isArray(article.newsclass_names)
        ? article.newsclass_names
        : article.newsclass_names
        ? [article.newsclass_names]
        : [],
      // 부서: personBuse 매핑 사용, 없으면 code_name 사용
      department: personBuse[article.byline_gijaname] || article.code_name,
      keyword: article.keyword || "",
      newsdate: formattedNewsDate,
      newskey: article.newskey,
      reporter: article.byline_gijaname,
      title: article.newstitle,
      totalViews: latestVisitValue,
    };
  }

  // 그룹을 저장할 Map: key는 해당 주 토요일 날짜("YYYY-MM-DD"), value는 { datetime, articles }
  const groups = new Map();

  newsData.forEach((article) => {
    // code_name이 빈 문자열이면, buseid 값을 기반으로 부서명 채우기
    if (!article.code_name || article.code_name.trim() === "") {
      const buseid = Number(article.buseid);
      if (buseCode[buseid]) {
        article.code_name = buseCode[buseid];
      }
    }

    // 기사 작성일을 Date 객체로 파싱 및 주 토요일 계산
    const articleDate = new Date(article.newsdate);
    const day = articleDate.getDay();
    const diff = 6 - day;
    const saturday = new Date(articleDate);
    saturday.setDate(articleDate.getDate() + diff);
    saturday.setHours(0, 0, 0, 0);
    const groupKey = formatLocalDate(saturday); // "YYYY-MM-DD"

    // 개별 기사 데이터를 transformArticle 함수를 사용해 변환
    const transformedArticle = transformArticle(article);

    // 그룹에 추가 (이미 존재하면 배열에 push, 없으면 새 그룹 생성)
    if (groups.has(groupKey)) {
      groups.get(groupKey).articles.push(transformedArticle);
    } else {
      groups.set(groupKey, { datetime: groupKey, articles: [transformedArticle] });
    }
  });

  // 그룹을 배열로 변환 및 날짜 순 정렬 (오래된 순)
  const result = Array.from(groups.values());
  result.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  return result;
}
