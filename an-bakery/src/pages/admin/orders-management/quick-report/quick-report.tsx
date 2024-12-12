import iconConfig from "@/config/icons/icon-config";
import useWindowSize from "@/hooks/useWindowSize";
import { ITotalAnalytics } from "@/types/order";
import { formatCurrencyVND } from "@/utils/money-format";
import { Button, Chip, Divider } from "@nextui-org/react";
import clsx from "clsx";
import { useEffect, useState } from "react";

interface QuickReportProps {
  analyticsData?: ITotalAnalytics;
}

const QuickReport = ({ analyticsData }: QuickReportProps) => {
  const [growthIndexTotalYesterday, setGrowthIndexTotalYesterday] = useState<number>(0);
  const [growthIndexTotalLastMonth, setGrowthIndexTotalLastMonth] = useState<number>(0);
  const [growthIndexRevenueYesterday, setGrowthIndexRevenueYesterday] = useState<number>(0);
  const [growthIndexRevenueLastMonth, setGrowthIndexRevenueLastMonth] = useState<number>(0);

  const [currentView, setCurrentView] = useState<"revenue" | "order">("order");

  const { width } = useWindowSize();

  useEffect(() => {
    if (analyticsData) {
      // Tính chỉ số tăng trưởng đơn hàng so với hôm qua
      if (analyticsData.totalOrdersYesterday === 0) {
        setGrowthIndexTotalYesterday(analyticsData.totalOrdersToday * 100);
      } else {
        setGrowthIndexTotalYesterday(
          ((analyticsData.totalOrdersToday - analyticsData.totalOrdersYesterday) /
            analyticsData.totalOrdersYesterday) *
            100,
        );
      }

      // Tính chỉ số tăng trưởng đơn hàng so với tháng trước
      if (analyticsData.totalOrdersLastMonth === 0) {
        setGrowthIndexTotalLastMonth(analyticsData.totalOrdersLastMonth * 100);
      } else {
        setGrowthIndexTotalLastMonth(
          ((analyticsData.totalOrdersThisMonth - analyticsData.totalOrdersLastMonth) /
            analyticsData.totalOrdersLastMonth) *
            100,
        );
      }

      // Tính chỉ số tăng trưởng doanh thu so với hôm qua
      if (analyticsData.totalRevenueYesterday === 0) {
        setGrowthIndexRevenueYesterday(analyticsData.totalRevenueToday);
      } else {
        setGrowthIndexRevenueYesterday(
          ((analyticsData.totalRevenueToday - analyticsData.totalRevenueYesterday) /
            analyticsData.totalRevenueYesterday) *
            100,
        );
      }

      // Tính chỉ số tăng trưởng doanh thu so với tháng trước
      if (analyticsData.totalRevenueLastMonth === 0) {
        setGrowthIndexRevenueLastMonth(analyticsData.totalRevenueThisMonth);
      } else {
        setGrowthIndexRevenueLastMonth(
          ((analyticsData.totalRevenueThisMonth - analyticsData.totalRevenueLastMonth) /
            analyticsData.totalRevenueLastMonth) *
            100,
        );
      }
    }
  }, [analyticsData]);

  return (
    <div className="flex w-full items-center gap-4 overflow-hidden">
      <div
        className={clsx({
          "flex w-full items-center gap-4": width >= 1900,
          "grid w-full grid-cols-3 items-center gap-4": width < 1900,
        })}
      >
        {/* Tổng đơn hàng hôm nay */}
        <div
          className={clsx("col-span-1 w-full flex-col gap-2 rounded-2xl border p-4", {
            hidden: width < 1900 && currentView === "revenue",
            flex: (width < 1900 && currentView === "order") || width >= 1900,
          })}
        >
          <h6 className="min-w-max text-dark">Đơn hàng hôm nay</h6>
          <div className="flex items-center gap-4">
            <h2
              className={clsx("md:text-2xl lg:text-5xl", {
                "text-success": growthIndexTotalYesterday >= 0,
                "text-danger": growthIndexTotalYesterday < 0,
              })}
            >
              {analyticsData?.totalOrdersToday ?? "-"}
            </h2>
            <Chip
              size="lg"
              variant="flat"
              color={growthIndexTotalYesterday >= 0 ? "success" : "danger"}
              startContent={
                growthIndexTotalYesterday >= 0 ? iconConfig.upArrow.base : iconConfig.downArrow.base
              }
            >
              {growthIndexTotalYesterday.toLocaleString("vi-VN", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
              %
            </Chip>
          </div>
          <Divider />
          <div className={"flex items-center gap-1"}>
            <p className={"min-w-max"}>so với hôm qua:</p>
            <p
              className={clsx("font-semibold", {
                "text-success": growthIndexTotalYesterday >= 0,
                "text-danger": growthIndexTotalYesterday < 0,
              })}
            >
              {analyticsData?.totalOrdersYesterday ?? "-"}
            </p>
          </div>
        </div>

        {/* Tổng đơn hàng tháng này */}
        <div
          className={clsx("col-span-1 w-full flex-col gap-2 rounded-2xl border p-4", {
            hidden: width < 1900 && currentView === "revenue",
            flex: (width < 1900 && currentView === "order") || width >= 1900,
          })}
        >
          <h6 className="min-w-max text-dark">Tổng đơn hàng tháng này</h6>
          <div className="flex items-center gap-4">
            <h2
              className={clsx("md:text-2xl lg:text-5xl", {
                "text-success": growthIndexTotalLastMonth >= 0,
                "text-danger": growthIndexTotalLastMonth < 0,
              })}
            >
              {analyticsData?.totalOrdersThisMonth ?? "-"}
            </h2>
            <Chip
              size="lg"
              variant="flat"
              color={growthIndexTotalLastMonth >= 0 ? "success" : "danger"}
              startContent={
                growthIndexTotalLastMonth >= 0 ? iconConfig.upArrow.base : iconConfig.downArrow.base
              }
            >
              {growthIndexTotalLastMonth.toLocaleString("vi-VN", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
              %
            </Chip>
          </div>
          <Divider />
          <div className={"flex items-center gap-1"}>
            <p className={"min-w-max"}>so với tháng trước:</p>
            <p
              className={clsx("font-semibold", {
                "text-success": growthIndexTotalLastMonth >= 0,
                "text-danger": growthIndexTotalLastMonth < 0,
              })}
            >
              {analyticsData?.totalOrdersLastMonth ?? "-"}
            </p>
          </div>
        </div>

        {/* Tổng doanh thu hôm nay */}
        <div
          className={clsx("col-span-1 w-full flex-col gap-2 rounded-2xl border p-4", {
            hidden: width < 1900 && currentView === "order",
            flex: (width < 1900 && currentView === "revenue") || width >= 1900,
          })}
        >
          <h6 className="min-w-max text-dark">Doanh thu hôm nay</h6>
          <div className="flex items-center gap-4">
            <h2
              className={clsx("md:text-2xl lg:text-5xl", {
                "text-success": growthIndexRevenueYesterday >= 0,
                "text-danger": growthIndexRevenueYesterday < 0,
              })}
            >
              {formatCurrencyVND(analyticsData?.totalRevenueToday ?? 0) ?? "-"}
            </h2>
            <Chip
              size="lg"
              variant="flat"
              color={growthIndexRevenueYesterday >= 0 ? "success" : "danger"}
              startContent={
                growthIndexRevenueYesterday >= 0 ? iconConfig.upArrow.base : iconConfig.downArrow.base
              }
            >
              {growthIndexRevenueYesterday.toLocaleString("vi-VN", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
              %
            </Chip>
          </div>
          <Divider />
          <div className={"flex items-center gap-1"}>
            <p className={"min-w-max"}>so với hôm qua:</p>
            <p
              className={clsx("font-semibold", {
                "text-success": growthIndexRevenueYesterday >= 0,
                "text-danger": growthIndexRevenueYesterday < 0,
              })}
            >
              {formatCurrencyVND(analyticsData?.totalRevenueYesterday ?? 0) ?? "-"}
            </p>
          </div>
        </div>

        {/* Tổng doanh thu tháng này */}
        <div
          className={clsx("col-span-1 w-full flex-col gap-2 rounded-2xl border p-4", {
            hidden: width < 1900 && currentView === "order",
            flex: (width < 1900 && currentView === "revenue") || width >= 1900,
          })}
        >
          <h6 className="min-w-max text-dark">Doanh thu tháng này</h6>
          <div className="flex items-center gap-4">
            <h2
              className={clsx("md:text-2xl lg:text-5xl", {
                "text-success": growthIndexRevenueLastMonth >= 0,
                "text-danger": growthIndexRevenueLastMonth < 0,
              })}
            >
              {formatCurrencyVND(analyticsData?.totalRevenueThisMonth ?? 0) ?? "-"}
            </h2>
            <Chip
              size="lg"
              variant="flat"
              color={growthIndexRevenueLastMonth >= 0 ? "success" : "danger"}
              startContent={
                growthIndexRevenueLastMonth >= 0 ? iconConfig.upArrow.base : iconConfig.downArrow.base
              }
            >
              {growthIndexRevenueLastMonth.toLocaleString("vi-VN", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
              %
            </Chip>
          </div>
          <Divider />
          <div className={"flex items-center gap-1"}>
            <p className={"min-w-max"}>so với tháng trước:</p>
            <p
              className={clsx("font-semibold", {
                "text-success": growthIndexRevenueLastMonth >= 0,
                "text-danger": growthIndexRevenueLastMonth < 0,
              })}
            >
              {formatCurrencyVND(analyticsData?.totalRevenueLastMonth ?? 0) ?? "-"}
            </p>
          </div>
        </div>
        <Button
          endContent={iconConfig.next.base}
          color={"primary"}
          className={clsx({
            hidden: width >= 1900,
            "col-span-1 w-max": width < 1900,
          })}
          onClick={() => setCurrentView(currentView === "order" ? "revenue" : "order")}
        >
          Xem phân tích {currentView === "order" ? "doanh thu" : "đơn hàng"}
        </Button>
      </div>
    </div>
  );
};

export default QuickReport;
