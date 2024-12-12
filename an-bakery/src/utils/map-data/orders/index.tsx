import { TOrderStatus, TPaymentStatus, TDeliveryMethod, TOrderType } from "@/types/order";
import { ChipProps } from "@nextui-org/react";

export const MapOrderStatusText: Record<TOrderStatus, string> = {
  pending: "Đang chờ xác nhận",
  queue: "Đang chờ sản xuất",
  processing: "Đang làm đơn hàng",
  shipping: "Đang giao hàng",
  cancelled: "Đơn hàng bị hủy",
  ready: "Đã sẵn sàng giao/nhận",
  rejected: "Đơn hàng bị từ chối",
  completed: "Đã giao hàng",
  returned: "Đơn hàng bị trả về",
};

export const MapOrderStatusColor: Record<TOrderStatus, ChipProps["color"]> = {
  pending: "warning",
  queue: "warning",
  shipping: "secondary",
  ready: "secondary",
  processing: "success",
  completed: "success",
  cancelled: "danger",
  rejected: "danger",
  returned: "danger",
};

export const MapPaymentStatusText: Record<TPaymentStatus, string> = {
  pending: "Đang chờ thanh toán",
  success: "Đã thanh toán",
  failed: "Thanh toán thất bại",
  cashOnDelivery: "Thanh toán khi nhận hàng",
};

export const MapPaymentMethodText: Record<TPaymentStatus, string> = {
  pending: "Thẻ/Ví",
  success: "Thẻ/Ví",
  failed: "Thẻ/Ví",
  cashOnDelivery: "Tiền mặt",
};

export const MapPaymentMethodColor: Record<TPaymentStatus, ChipProps["color"]> = {
  pending: "secondary",
  success: "secondary",
  failed: "secondary",
  cashOnDelivery: "primary",
};

export const MapPaymentStatusColor: Record<TPaymentStatus, "warning" | "success" | "danger" | "secondary"> = {
  pending: "warning",
  success: "success",
  failed: "danger",
  cashOnDelivery: "secondary",
};

export const MapDeliveryMethodText: Record<TDeliveryMethod, string> = {
  toHouse: "Giao tận nhà",
  atStore: "Nhận tại cửa hàng",
};

export const MapDeliveryMethodColor: Record<TDeliveryMethod, "primary" | "secondary"> = {
  toHouse: "primary",
  atStore: "secondary",
};

export const MapOrderTypeText: Record<TOrderType, string> = {
  selfOrder: "Cửa hàng",
  customerOrder: "Khách",
};

export const MapOrderTypeColor: Record<TOrderType, ChipProps["color"]> = {
  selfOrder: "secondary",
  customerOrder: "default",
};
