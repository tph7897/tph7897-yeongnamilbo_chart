// 동적 렌더링 활성화를 위해 추가
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { MongoClient } from "mongodb";

export async function GET(request) {
  const client = new MongoClient(process.env.NEXT_PUBLIC_MONGO_DB_URL);

  try {
    await client.connect();
    const database = client.db("yeongnam-visits");
    const articlesCollection = database.collection("wms_data");

    // 최근 3개월 전 날짜 계산
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // 새로운 데이터 구조에 맞는 필드 지정
    const projection = {
      _id: 1,
      nid: 1,
      service_daytime: 1,
      title: 1,
      writers: 1,
      level: 1,
      embargo_type: 1,
      reg_dt: 1,
      reg_id: 1,
      art_org_class: 1,
      last_update: 1,
    };

    const optimizedArticlesData = await articlesCollection
      .find({ 
        service_daytime: { $gte: threeMonthsAgo },
        title: { $exists: true }
      })
      .project(projection)
      .sort({ service_daytime: -1 })
      .toArray();

    // 데이터 정규화 - 새로운 필드명에 맞춰 변환
    const normalizedData = optimizedArticlesData.map((article) => ({
      _id: article._id,
      newskey: article.nid || article._id, // nid를 newskey로 매핑
      newsdate: article.service_daytime, // service_daytime을 newsdate로 매핑
      newstitle: article.title, // title을 newstitle로 매핑
      writers: article.writers,
      level: article.level || "5",
      embargo_type: article.embargo_type,
      reg_dt: article.reg_dt,
      reg_id: article.reg_id,
      art_org_class: article.art_org_class,
      last_update: article.last_update,
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