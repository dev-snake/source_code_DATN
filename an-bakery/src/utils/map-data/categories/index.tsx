import { ButtonProps } from "@nextui-org/react";

export const MapCategoryStatusColor: Record<string, ButtonProps["color"]> = {
  true: "success",
  false: "danger",
};

export const MapCategoryStatusText: Record<string, string> = {
  true: "Đang hiện",
  false: "Đang ẩn",
};
