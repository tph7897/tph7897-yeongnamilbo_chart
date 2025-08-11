// 동적 렌더링 활성화를 위해 추가
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { MongoClient } from "mongodb";

export async function GET(request) {
  const client = new MongoClient(process.env.NEXT_PUBLIC_MONGO_DB_URL);

  try {
    await client.connect();
    const database = client.db("yeongnam-visits");
    const articlesCollection = database.collection("recent_data");

    // 최근 3개월 전 날짜 계산
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // 조회할 필드 지정
    const projection = {
      newsdate: 1,
      newskey: 1,
      code_name: 1,
      byline_gijaname: 1,
      newsclassid: 1,
      newsclass_names: 1,
      newstitle: 1,
      ref: 1,
      level: 1,
    };

    const optimizedArticlesData = await articlesCollection
      .find({ ref: { $exists: true }, newsdate: { $gte: threeMonthsAgo } })
      .project(projection)
      .sort({ newsdate: -1 })
      .toArray();

    // newsdate의 시간 부분을 00:00:00.000Z로 통일
    const normalizedData = optimizedArticlesData.map((article) => ({
      ...article,
      newsdate: new Date(new Date(article.newsdate).toDateString()).toISOString(),
      level: article.level || "5",
    }));

    if (normalizedData && normalizedData.length > 0) {
      return Response.json(normalizedData, { status: 200, headers: { "Cache-Control": "no-store" } });
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