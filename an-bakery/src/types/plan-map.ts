import { ChipProps } from "@nextui-org/react";

export const PlanStatus = {
  open: "Đang mở",
  closed: "Đã đóng",
  pending: "Chờ thực hiện",
  in_progress: "Trong tiến trình",
  completed: "Hoàn thành",
} as const;
export const PlanType = {
  day: "Ngày",
  week: "Tuần",
} as const;
export const PlanTypeColor: Record<"day" | "week", ChipProps["color"]> = {
  day: "primary",
  week: "secondary",
};
export const PlanStatusColor: Record<keyof typeof PlanStatus, ChipProps["color"]> = {
  open: "success",
  closed: "danger",
  pending: "default",
  in_progress: "warning",
  completed: "primary",
};
