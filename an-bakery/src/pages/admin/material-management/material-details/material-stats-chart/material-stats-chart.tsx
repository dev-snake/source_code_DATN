import { IMaterialStats } from "@/types/material";
import { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

const months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

interface MaterialStatsChartProps {
  statsList: IMaterialStats[];
  calUnit: string;
}

const MaterialStatsChart: React.FC<MaterialStatsChartProps> = ({ statsList, calUnit }) => {
  const materialData = {
    forOrder: Array(12).fill(0),
    newImport: Array(12).fill(0),
  };

  statsList.forEach((item) => {
    const monthIndex = item.month - 1;
    const totalWeight = item.totalWeight;
    const type = item.type;
    if (type === "forOrder") {
      materialData.forOrder[monthIndex] += Math.abs(totalWeight);
    } else if (type === "newImport") {
      materialData.newImport[monthIndex] += totalWeight;
    }
  });

  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 400,
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    xaxis: {
      categories: months,
      labels: {
        style: {
          fontSize: "12px",
          fontFamily: "'Raleway', sans-serif",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          fontFamily: "'Raleway', sans-serif",
        },
        formatter: function (value) {
          return value.toLocaleString("vi-VN") + ` ${calUnit}`;
        },
      },
    },
    colors: ["#cc293d", "#6bd3d2"],
  };

  const chartSeries = [
    {
      name: "Dùng cho đơn hàng",
      data: materialData.forOrder,
    },
    {
      name: "Nhập nguyên liệu",
      data: materialData.newImport,
    },
  ];

  return (
    <div className={"flex flex-col gap-4"}>
      <h4 className={"text-center font-bold text-dark/50"}>BIỂU ĐỒ BIẾN ĐỘNG KHỐI LƯỢNG CỦA NGUYÊN LIỆU</h4>
      <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={400} />
    </div>
  );
};

export default MaterialStatsChart;
