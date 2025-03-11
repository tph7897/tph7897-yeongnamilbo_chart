"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale, // can be removed if not used elsewhere
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import weeklyVisits from "../app/_utils/weeklyVisits";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ChartsContainer = ({ newsData }) => {
  const digitalNewsData = newsData.filter((article) => [16, 90, 97, 98].includes(article.buseid));

  const digitalTableData = useMemo(() => weeklyVisits(digitalNewsData), [digitalNewsData]);

  const totalTableData = useMemo(() => weeklyVisits(newsData), [newsData]);

  // 각 차트에 대한 공통 옵션 (차트별 title만 다르게 설정)
  const createOptions = (titleText) => ({
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: titleText },
    },
  });

  // 각 차트에 표시할 데이터 (단일 값이므로 X축은 한 개의 항목)
  const createChartData = (label, data, color = "rgba(75, 192, 192, 0.5)") => {
    let valueMapping;

    if (label === "기사 평균 조회수") {
      valueMapping = (item) => Number(item.averageVisits);
    } else {
      // 기본값: totalVisits 사용
      valueMapping = (item) => Number(item.totalVisits);
    }

    return {
      labels: data?.map((item) => item.saturday),
      datasets: [
        {
          label,
          data: data?.map(valueMapping),
          backgroundColor: color,
          borderColor: color.replace("0.5", "1"),
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "2rem" }}>
      <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
        <Line options={createOptions("총 조회수")} data={createChartData("기사 조회수", totalTableData)} />
      </div>
      <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
        <Line options={createOptions("기사 평균 조회수")} data={createChartData("기사 평균 조회수", totalTableData, "rgba(255, 159, 64, 0.5)")} />
      </div>
      <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
        <Line options={createOptions("디지털국 총 조회수")} data={createChartData("기사 조회수", digitalTableData)} />
      </div>
      <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
        <Line options={createOptions("디지털국 기사 평균 조회수")} data={createChartData("기사 평균 조회수", digitalTableData, "rgba(255, 159, 64, 0.5)")} />
      </div>
    </div>
  );
};

export default ChartsContainer;
