import { MongoClient } from "mongodb";

export async function GET(request) {
  const client = new MongoClient(process.env.NEXT_PUBLIC_MONGO_DB_URL);

  try {
    await client.connect();
    const database = client.db("yeongnam-visits");
    const articlesCollection = database.collection("full_data");

    // Specify exactly the fields you want to retrieve
    const projection = {
      buseid: 1,
      byline_gijaname: 1,
      code_name: 1,
      delete: 1,
      gijaname: 1,
      keyword: 1,
      newsclass_ids: 1,
      newsclass_names: 1,
      newsdate: 1,
      newskey: 1,
      newstitle: 1,
      ref: 1,
      _id: 0  // Explicitly exclude _id unless you need it
    };

    const optimizedArticlesData = await articlesCollection
      .find({ ref: { $exists: true } })
      .project(projection)
      .sort({ newsdate: -1 })
      .toArray();

    if (optimizedArticlesData && optimizedArticlesData.length > 0) {
      return Response.json(optimizedArticlesData, { status: 200 });
    } else {
      return new Response(null, { status: 204 });
    }
  } catch (error) {
    console.error("Data fetch error:", error);
    return Response.json({ 
      message: "Nextjs Route Error", 
      error: error.message 
    }, { status: 500 });
  } finally {
    await client.close();
  }
}