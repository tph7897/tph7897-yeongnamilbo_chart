"use client";

import { useEffect, useState } from "react";

export default function ApiCallSample() {
  const [allArticles, setAllArticles] = useState([]);

  useEffect(() => {
    fetch("/api/fetchAllArticles")
      .then((response) => response.json())
      .then((data) => {
        // console.log("Fetched data:", data); // Debugging API response

        setAllArticles(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // console.log("Current state:", allArticles); // Logs after state updates

  if (allArticles.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <div>
        <h1>Hello from placeholder!</h1>
        <ul>
          {allArticles.map((article, index) => (
            <li key={index}>
              <p>Article Newskey: {article.newskey}</p>
              <p>Visits Data:</p>
              <ul>
                {article.visits.map((visit, idx) => (
                  <>
                    <li key={idx}>
                      {idx} - {JSON.stringify(visit)} {/* Convert dictionary to string */}
                    </li>
                    <br />
                  </>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
