import React from "react";
import DailyArticleStats from "../charts/DailyArticleStats";
import WebArticleList from "../tables/WebArticleList";

const StatsSection = () => {
  // TODO: 여기서 자체기사 통계용 데이터를 fetch 하거나 처리
  const Articles = []; // 임시 빈 배열

  return (
    <>
      <div>
        <DailyArticleStats levelData={Articles} />
      </div>
      <div>
        <WebArticleList webArticleData={Articles} />
      </div>
    </>
  );
};

export default StatsSection;
