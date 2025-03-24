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

    // 기사 작성일을 Date 객체로 파싱
    const articleDate = new Date(article.newsdate);
    // 해당 기사가 속한 주의 토요일을 계산 (getDay(): 0(일) ~ 6(토))
    const day = articleDate.getDay();
    const diff = 6 - day; // 토요일까지 남은 일수
    const saturday = new Date(articleDate);
    saturday.setDate(articleDate.getDate() + diff);
    saturday.setHours(0, 0, 0, 0);
    // 로컬 날짜 형식으로 groupKey 생성
    const groupKey = formatLocalDate(saturday); // "YYYY-MM-DD"

    // 조회수는 ref 필드를 사용 (문자열일 경우 숫자로 변환)
    const latestVisitValue = Number(article.ref) || 0;

    // 작성일(newsdate)을 "YY.MM.DD" 형식으로 변환
    const d = new Date(article.newsdate);
    const yy = String(d.getFullYear()).slice(-2);
    const mm = ("0" + (d.getMonth() + 1)).slice(-2);
    const dd = ("0" + d.getDate()).slice(-2);
    const formattedNewsDate = `${yy}.${mm}.${dd}`;

    // transformed article 객체 생성
    const transformedArticle = {
      category: Array.isArray(article.newsclass_names) ? article.newsclass_names : article.newsclass_names ? [article.newsclass_names] : [],
      department: article.code_name,
      keyword: article.keyword || "",
      newsdate: formattedNewsDate,
      newskey: article.newskey,
      reporter: article.gijaname,
      title: article.newstitle,
      totalViews: latestVisitValue,
    };

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
