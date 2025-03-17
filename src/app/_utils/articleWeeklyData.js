// import { getCurrentWeekRange } from "@/app/_utils/aggregateWeeklyData";

// /**
//  * 주간 기사 데이터를 변환하는 함수
//  * 입력 데이터: 원시 뉴스 데이터 배열 (각 기사는 visits 배열을 포함)
//  * 출력 데이터 형식:
//  * [
//  *   {
//  *     title: "제목",        // 여기서는 newskey를 제목으로 사용 (필요 시 다른 필드를 사용할 수 있음)
//  *     keyword: "",         // 키워드는 비워둠
//  *     totalViews: 100,     // 최신 방문자수 (토요일 23:59:59 이전의 가장 최신 방문 기록)
//  *     newsdate: "2023-04-01",  // 기사의 작성일 (YYYY-MM-DD 형식)
//  *     category: "",        // 분류는 비워둠
//  *     department: "부서",  // 기사에 해당하는 부서 (code_name)
//  *     reporter: "기자",    // 기자 이름 (gijaname)
//  *   },
//  *   ...
//  * ]
//  */
// export function transformWeeklyArticles(newsData) {
//   const { startOfWeek, endOfWeek } = getCurrentWeekRange();

//   // 이번 주 범위 내에 생성된 기사만 필터링
//   const weeklyArticles = newsData.filter((article) => {
//     const newsDate = new Date(article.newsdate);
//     return newsDate >= startOfWeek && newsDate <= endOfWeek;
//   });

//   // 각 기사를 변환
//   const transformedArticles = weeklyArticles.map((article) => {
//     let latestVisitValue = 0;
//     let latestVisitTime = null;

//     if (Array.isArray(article.visits)) {
//       article.visits.forEach((v) => {
//         const visitDate = new Date(v.datetime);
//         // 토요일 23:59:59 이전의 방문 기록 중 가장 최신의 방문수를 선택
//         if (visitDate <= endOfWeek) {
//           if (!latestVisitTime || visitDate > latestVisitTime) {
//             latestVisitTime = visitDate;
//             latestVisitValue = v.visits;
//           }
//         }
//       });
//     }

//     // 작성일시를 ISO 형식 ("2025-03-03T00:00:00.000Z")으로 변환
//     const dateObj = new Date(article.newsdate);
//     const year = String(dateObj.getFullYear()).slice(-2);
//     const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
//     const day = ("0" + dateObj.getDate()).slice(-2);
//     const formattedNewsDate = `${year}.${month}.${day}`;
//     return {
//       title: article.newstitle, // 기사 제목 자리 (newskey 사용)
//       newskey: article.newskey, // 기사 제목 자리 (newskey 사용)
//       keyword: article.keyword, // 키워드는 비워둠
//       totalViews: latestVisitValue,
//       newsdate: formattedNewsDate,
//       category: article.newsclass_names, // 분류는 비워둠
//       department: article.code_name,
//       reporter: article.gijaname,
//     };
//   });

//   return transformedArticles;
// }

export function transformWeeklyArticles(newsData) {
  // 그룹을 저장할 Map: key는 해당 주 토요일 날짜("YYYY-MM-DD"), value는 { datetime, articles }
  const groups = new Map();

  newsData.forEach((article) => {
    // 기사 작성일을 Date 객체로 파싱
    const articleDate = new Date(article.newsdate);
    // 해당 기사가 속한 주의 토요일을 계산 (getDay(): 0(일) ~ 6(토))
    const day = articleDate.getDay();
    const diff = 6 - day; // 토요일까지 남은 일수
    const saturday = new Date(articleDate);
    saturday.setDate(articleDate.getDate() + diff);
    saturday.setHours(0, 0, 0, 0);
    const groupKey = saturday.toISOString().slice(0, 10); // "YYYY-MM-DD"

    // visits 배열에서 토요일(그룹 기준) 이전(포함) 기록 중 가장 최신의 방문수 선택
    let latestVisitValue = 0;
    let latestVisitTime = null;
    if (Array.isArray(article.visits)) {
      article.visits.forEach((v) => {
        const visitDate = new Date(v.datetime);
        if (visitDate <= saturday) {
          if (!latestVisitTime || visitDate > latestVisitTime) {
            latestVisitTime = visitDate;
            latestVisitValue = v.visits;
          }
        }
      });
    }

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
