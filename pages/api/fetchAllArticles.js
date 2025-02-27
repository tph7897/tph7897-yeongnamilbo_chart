import { MongoClient } from "mongodb";

export default async function fetchAllArticles(req, res) {
  if (req.method === "GET") {
    const client = new MongoClient(process.env.MONGO_DB_URL);

    try {
      await client.connect();
      const database = client.db("yeongnam-visits");
      const articlesCollection = database.collection("articles");
      
      const fullArticlesData = await articlesCollection
        .find({ visits: { $exists: true }, deleted: false })
        .sort({ _id: -1 })
        .toArray();
      if (fullArticlesData && fullArticlesData.length > 0) {
        res.status(200).json(fullArticlesData);
    } else {
        res.status(204).end(); 
    }

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Nextjs Route Error" });
    } finally {
      await client.close();
    }
  } else {
    res.status(403).json({ message: "Method not allowed" });
  }
}