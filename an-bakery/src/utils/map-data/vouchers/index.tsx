import { iconSize } from "@/config/icons/icon-config";
import { TVoucherType } from "@/types/voucher";
import { ChipProps } from "@nextui-org/react";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { TbTruckDelivery, TbCirclePercentage } from "react-icons/tb";

export const MapVoucherTypeColor: Record<TVoucherType, ChipProps["color"]> = {
  shipFee: "warning",
  percentage: "primary",
  fixed: "success",
};

export const MapVoucherTypeText: Record<TVoucherType, string> = {
  shipFee: "Phí vận chuyển",
  percentage: "Phần trăm",
  fixed: "Cố định",
};

export const MapValidStatusColor: Record<"notStarted" | "onActive" | "hasExpired", ChipProps["color"]> = {
  notStarted: "warning",
  onActive: "success",
  hasExpired: "danger",
};

export const MapValidStatusText: Record<"notStarted" | "onActive" | "hasExpired", string> = {
  notStarted: "Chưa bắt đầu",
  onActive: "Đang hoạt động",
  hasExpired: "Đã hết hạn",
};

export const MapVoucherTypeIcon: Record<TVoucherType, React.ReactNode> = {
  shipFee: <TbTruckDelivery size={iconSize.base} />,
  percentage: <TbCirclePercentage size={iconSize.base} />,
  fixed: <HiOutlineCurrencyDollar size={iconSize.base} />,
};
