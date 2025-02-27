"use client"

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: '영남일보 조회수',
    },
  },
};

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July']; //x축 기준

const data = {
  labels,
  datasets: [
    {
      label: '분류 1', //그래프 분류되는 항목
      data: [1, 2, 3, 4, 5, 6, 7], //실제 그려지는 데이터(Y축 숫자)
      borderColor: 'rgb(255, 99, 132)', //그래프 선 color
      backgroundColor: 'rgba(255, 99, 132, 0.5)', //마우스 호버시 나타나는 분류네모 표시 bg
    },
    {
      label: '분류 2',
      data: [2, 3, 4, 5, 4, 7, 8],
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};
const LineChart = () => {
  return (
    <div>
        <Line options={options} data={data} />
    </div>
  )
}

export default LineChart