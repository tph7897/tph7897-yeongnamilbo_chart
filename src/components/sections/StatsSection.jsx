"use client";
import React, { useEffect, useState } from "react";
import DailyArticleStats from "../charts/DailyArticleStats";
import WebArticleList from "../tables/WebArticleList";

const StatsSection = () => {
  const [articlesData, setArticlesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticlesData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/fetchWMSArticles');
        
        if (response.status === 204) {
          setArticlesData([]);
          return;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setArticlesData(data);
      } catch (err) {
        console.error('기사 데이터 가져오기 실패:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticlesData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div>데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-500">데이터 로딩 실패: {error}</div>
      </div>
    );
  }

  return (
    <>
      <div>
        <DailyArticleStats newsData={articlesData} />
      </div>
      <div>
        <WebArticleList webArticleData={articlesData} />
      </div>
    </>
  );
};

export default StatsSection;
