// 동적 렌더링 활성화를 위해 추가
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { MongoClient } from "mongodb";

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
    const limit = parseInt(searchParams.get('limit') || '10000'); // 기본 10,000건으로 제한

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
      // 기본값: 최근 6개월 (성능 최적화)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      dateFilter = { newsdate: { $gte: sixMonthsAgo } };
    }

    // 조회할 필드 지정 (필수 필드만 - 성능 최적화)
    const projection = {
      newsdate: 1,
      newskey: 1,
      code_name: 1,
      byline_gijaname: 1,
      buseid: 1, // 부서 매핑용 추가
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

    // newsdate의 시간 부분을 00:00:00.000Z로 통일
    const normalizedData = optimizedArticlesData.map((article) => ({
      ...article,
      newsdate: new Date(new Date(article.newsdate).toDateString()).toISOString(),
      level: article.level || "5",
    }));

    if (normalizedData && normalizedData.length > 0) {
      return Response.json(normalizedData, { 
        status: 200, 
        headers: { 
          "Cache-Control": "no-store" 
        } 
      });
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