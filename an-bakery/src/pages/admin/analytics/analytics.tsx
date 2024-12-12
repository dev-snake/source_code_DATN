import AdminHeader from "@/components/admin/admin-header";
import WrapperContainer from "@/components/admin/wrapper-container";
import { useEffect, useState } from "react";
import Loading from "@/components/admin/loading";
import ApexCharts from "apexcharts";
import AnalyticBlock from "./analytic-block";
import useStaffAxios from "@/hooks/useStaffAxios";
import { apiRoutes } from "@/config/routes/api-routes.config";
import {
  IAnalytics,
  TBranchOrders,
  TDailyAnalytics,
  TMonthAnalytics,
  TMonthRevenueAnalytics,
} from "@/types/analytics";
import { IAPIResponse } from "@/types/api-response";
import { ColorCode } from "@/utils/map-data/color";
import { IBranch } from "../../../types/branch";

interface AnalyticsProps {}

const Analytics = (props: AnalyticsProps) => {
  const staffAxios = useStaffAxios();

  const [orderInYearData, setOrderInYearData] = useState<TMonthAnalytics[]>();
  const [revenueInYearData, setRevenueInYearData] = useState<TMonthRevenueAnalytics[]>();
  const [customerInYearData, setCustomerInYearData] = useState<TMonthAnalytics[]>();
  const [listBranchOrders, setListBranchOrders] = useState<TBranchOrders[]>([]);

  const [orderChartData, setOrderChartData] = useState<number[]>([]);
  const [revenueChartData, setRevenueChartData] = useState<number[]>([]);
  const [customerChartData, setCustomerChartData] = useState<number[]>([]);
  const [orderInMonthChartData, setOrderInMonthChartData] = useState<TDailyAnalytics[]>([]);

  const getAnalyticsData = () => {
    return staffAxios
      .get<IAPIResponse<IAnalytics>>(apiRoutes.analytics.root)
      .then((response) => response.data)
      .then((response) => {
        setOrderInYearData(response.results.orderInYear);
        setRevenueInYearData(response.results.revenueInYear);
        setCustomerInYearData(response.results.customerInYear);
        setListBranchOrders(response.results.branchOrders);

        setOrderChartData(response.results.orderInYear.map((_v) => _v.value));
        setRevenueChartData(response.results.revenueInYear.map((_v) => _v.revenues));
        setCustomerChartData(response.results.customerInYear.map((_v) => _v.value));
        setOrderInMonthChartData(response.results.orderInMonth);
      });
  };

  const renderOrdersInMonthChart = () => {
    if (!orderInMonthChartData) {
      return;
    }

    const maxValue = Math.max(...orderInMonthChartData.map((item) => item.value));
    const rangeStep = Math.ceil(maxValue / 4);
    const dynamicRanges = [
      { from: 0, to: 0, color: "#efeff0", name: "Very Low" },
      { from: 1, to: rangeStep, color: "#ffe4e8", name: "Very Low" },
      { from: rangeStep + 1, to: rangeStep * 2, color: "#fca5b5", name: "Low" },
      { from: rangeStep * 2 + 1, to: rangeStep * 3, color: "#f34069", name: "Moderate" },
      { from: rangeStep * 3 + 1, to: maxValue, color: "#bd1347", name: "High" },
    ];

    const totalDays = orderInMonthChartData.length;

    const weeks = Math.ceil(totalDays / 7);
    const heatmapData = Array.from({ length: weeks }, (_, weekIndex) => {
      const weekStart = weekIndex * 7 + 1;
      const weekEnd = Math.min(weekStart + 6, totalDays);
      return {
        name: `Week ${weekIndex + 1}`,
        data: orderInMonthChartData
          .filter((item) => Number(item.day) >= weekStart && Number(item.day) <= weekEnd)
          .map((item) => ({
            x: `Day ${item.day}`,
            y: item.value,
          })),
      };
    });

    const options = {
      chart: {
        height: 400,
        type: "heatmap",
        toolbar: {
          show: false,
        },
      },
      series: heatmapData.reverse(),
      plotOptions: {
        heatmap: {
          shadeIntensity: 0.5,
          distributed: true, // Ensures each block has equal size
          colorScale: {
            ranges: dynamicRanges,
          },
        },
      },
      dataLabels: {
        enabled: false,
      },

      xaxis: {
        labels: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
      },
      yaxis: {
        show: false,
      },
    };

    const chart = new ApexCharts(document.querySelector(`#ordersInMonth`), options);

    chart.render();
  };

  const renderCharts = (
    elementName: string,
    colorCode: string,
    {
      chartName,
      chartData,
    }: {
      chartName: string;
      chartData: number[];
    },
  ) => {
    const options = {
      chart: {
        height: 75,
        width: "100%",
        type: "line",
        toolbar: {
          show: false,
        },
      },
      series: [
        {
          name: chartName,
          data: chartData,
        },
      ],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 3,
      },
      xaxis: {
        labels: {
          show: false,
        },
        axisBorder: {
          show: false,
        },

        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        show: false,
      },
      grid: {
        show: false,
      },

      legend: {
        show: true,
        position: "top",
      },
      colors: [colorCode],
    };
    const chart = new ApexCharts(document.querySelector(`#${elementName}`), options);

    chart.render();
  };

  useEffect(() => {
    getAnalyticsData();
  }, []);

  const getColorCode = (mainNum: number, subNum: number) => {
    return mainNum > subNum ? ColorCode["success"] : ColorCode["danger"];
  };

  useEffect(() => {
    if (!orderInYearData || !revenueInYearData || !customerInYearData) {
      return;
    }

    renderCharts(
      "totalOrdersChart",
      getColorCode(orderChartData[orderChartData.length - 1], orderChartData[orderChartData.length - 2]),
      {
        chartName: "Đơn hàng",
        chartData: orderChartData,
      },
    );

    renderCharts(
      "totalRevenuesChart",
      getColorCode(revenueChartData[orderChartData.length - 1], revenueChartData[orderChartData.length - 2]),
      {
        chartName: "Doanh thu",
        chartData: revenueChartData,
      },
    );

    renderCharts(
      "totalCustomersChart",
      getColorCode(
        customerChartData[orderChartData.length - 1],
        customerChartData[orderChartData.length - 2],
      ),
      {
        chartName: "Khách hàng",
        chartData: customerChartData,
      },
    );

    renderOrdersInMonthChart();
  }, [orderInYearData, revenueInYearData, customerInYearData, orderInMonthChartData]);

  return (
    <WrapperContainer>
      <AdminHeader title="THỐNG KÊ HOẠT ĐỘNG HỆ THỐNG" refBack="" />
      <div className={"flex flex-col gap-8"}>
        <div className={"flex items-center gap-4"}>
          <AnalyticBlock
            title={"Đơn hàng"}
            mainNum={orderChartData[orderChartData.length - 1]}
            subNum={orderChartData[orderChartData.length - 2]}
            diffNum={orderChartData[orderChartData.length - 1] - orderChartData[orderChartData.length - 2]}
            chartId={"totalOrdersChart"}
          />
          <AnalyticBlock
            title={"Doanh thu"}
            mainNum={revenueChartData[revenueChartData.length - 1]}
            subNum={revenueChartData[revenueChartData.length - 2]}
            diffNum={
              revenueChartData[revenueChartData.length - 1] - revenueChartData[revenueChartData.length - 2]
            }
            chartId={"totalRevenuesChart"}
          />
          <AnalyticBlock
            title={"Khách hàng"}
            mainNum={customerChartData[customerChartData.length - 1]}
            subNum={customerChartData[customerChartData.length - 2]}
            diffNum={
              customerChartData[customerChartData.length - 1] -
              customerChartData[customerChartData.length - 2]
            }
            chartId={"totalCustomersChart"}
          />
        </div>
        <div className={"grid grid-cols-12 gap-4"}>
          <div className={"col-span-8 flex flex-col gap-4 rounded-xl p-4 shadow-custom"}>
            <h4>Thống kê lượng đơn hàng trong tháng</h4>
            <div id="ordersInMonth"></div>
          </div>
          <div className={"col-span-4 flex flex-col gap-4 rounded-xl p-4 shadow-custom"}>
            <h4>Đơn hàng của các chi nhánh</h4>
            <div id="branchOrdersInMonth" className={"flex flex-col gap-2"}>
              {listBranchOrders.map((branchOrder, index) => (
                <div className={"flex items-center justify-between rounded-lg border-1 px-4 py-2"}>
                  <div className={"flex items-center gap-1"}>
                    <p className={"font-semibold"}>{index + 1}.</p>
                    <p className={"font-semibold"}>{branchOrder.branch.branchConfig.branchDisplayName}</p>
                  </div>
                  <p className={"font-semibold text-primary"}>{branchOrder.orders} đơn</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WrapperContainer>
  );
};

export default Analytics;
