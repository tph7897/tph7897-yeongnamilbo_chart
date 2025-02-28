"use client";

import LineChart from "@/app/_components/LineChart";
import { useEffect, useState } from "react";

export default function Home() {
  const [allArticles, setAllArticles] = useState([]);

  useEffect(() => {
    fetch("/api/fetchAllArticles")
      .then((response) => response.json())
      .then((data) => {
        // console.log("Fetched data:", data); // Debugging API response
        const thresholdDate = new Date("2025-02-23T00:00:00.000Z");

        const filteredData = data.filter((item) => {
          // newsdate가 thresholdDate 이전이면 false 반환
          return new Date(item.newsdate) >= thresholdDate;
        });

        // console.log(filteredData);
        setAllArticles(filteredData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // console.log("Current state:", allArticles); // Logs after state updates

  if (allArticles.length === 0) {
    return <div>Loading...</div>;
  }
  return (
    <main>
      <LineChart newsData={allArticles} />
    </main>
  );
}
