// 동적 렌더링 활성화를 위해 추가
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { MongoClient } from "mongodb";

// 문자열 정제 함수
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 제어 문자 제거
    .replace(/[\\"]/g, '') // 백슬래시와 따옴표 제거
    .replace(/\n/g, ' ') // 줄바꿈을 공백으로 변경
    .replace(/\r/g, ' ') // 캐리지 리턴을 공백으로 변경
    .replace(/\t/g, ' ') // 탭을 공백으로 변경
    .replace(/\s+/g, ' ') // 연속된 공백을 하나로 축소
    .trim(); // 앞뒤 공백 제거
}

// 객체의 모든 문자열 필드를 정제하는 함수
function sanitizeObject(obj) {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export async function GET(request) {
  const client = new MongoClient(process.env.NEXT_PUBLIC_MONGO_DB_URL);

  try {
    await client.connect();
    const database = client.db("yeongnam-visits");
    const articlesCollection = database.collection("full_data");

    // URL에서 날짜 범위와 제한 수 파라미터 추출
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '50000'); // 기본 50,000건으로 제한

    // 날짜 필터 조건 설정
    let dateFilter = {};
    if (fromDate && toDate) {
      dateFilter = {
        newsdate: {
          $gte: new Date(fromDate),
          $lte: new Date(toDate)
        }
      };
    } else {
      // 기본값: 최근 1년
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      dateFilter = { newsdate: { $gte: oneYearAgo } };
    }

    // 조회할 필드 지정 (필수 필드만)
    const projection = {
      newsdate: 1,
      newskey: 1,
      code_name: 1,
      byline_gijaname: 1,
      buseid: 1, // 부서 매핑용 추가
      newsclassid: 1,
      newstitle: 1,
      ref: 1,
      level: 1,
    };

    const optimizedArticlesData = await articlesCollection
      .find({ 
        ref: { $exists: true, $ne: null, $ne: 0 }, // ref가 존재하고 null이 아니며 0이 아닌 경우만
        ...dateFilter 
      })
      .project(projection)
      .sort({ newsdate: -1 })
      .limit(limit) // 결과 제한
      .toArray();

    // newsdate의 시간 부분을 00:00:00.000Z로 통일하고 문자열 정제
    const normalizedData = optimizedArticlesData.map((article) => {
      // 기본 정규화
      const normalized = {
        ...article,
        newsdate: new Date(new Date(article.newsdate).toDateString()).toISOString(),
        level: article.level || "5",
      };
      
      // 문자열 필드 정제
      return sanitizeObject(normalized);
    });

    if (normalizedData && normalizedData.length > 0) {
      // JSON 직렬화를 안전하게 처리
      try {
        const jsonData = JSON.stringify(normalizedData);
        return new Response(jsonData, { 
          status: 200, 
          headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "no-store" 
          } 
        });
      } catch (jsonError) {
        console.error("JSON serialization error:", jsonError);
        return Response.json({
          message: "Data serialization error",
          error: "Unable to serialize data to JSON"
        }, { status: 500 });
      }
    } else {
      return new Response(null, { status: 204 });
    }
  } catch (error) {
    console.error("Data fetch error:", error);
    return Response.json({
      message: "Nextjs Route Error",
      error: error.message,
    }, { status: 500 });
  } finally {
    await client.close();
  }
}