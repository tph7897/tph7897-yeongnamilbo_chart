import { MongoClient } from "mongodb";

export async function GET(request){

    const client = new MongoClient(process.env.NEXT_PUBLIC_MONGO_DB_URL);

    try {
      await client.connect();
      const database = client.db("yeongnam-visits");
      const articlesCollection = database.collection("articles");
      
      const fullArticlesData = await articlesCollection
        .find({ visits: { $exists: true }, deleted: false })
        .sort({ _id: -1 })
        .toArray();

      if (fullArticlesData && fullArticlesData.length > 0) {
        return Response.json(fullArticlesData, { status: 200 });
      } else {
        return new Response(null, { status: 204 });
      }

    } catch (error) {
      console.error(error);
      return Response.json({ message: "Nextjs Route Error" }, { status: 500 });
    } finally {
      await client.close();
    }

  }