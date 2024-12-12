import { ChipProps } from "@nextui-org/react";

export const MapRecipeTypeText: Record<string, string> = {
  true: "Công thức có biến thể",
  false: "Công thức không biến thể",
};

export const MapRecipeTypeColor: Record<string, ChipProps["color"]> = {
  true: "primary",
  false: "secondary",
};

export const MapRecipeStatusText: Record<string, string> = {
  true: "Đã bị xóa",
  false: "Bình thường",
};
export const MapRecipeStatusColor: Record<string, ChipProps["color"]> = {
  true: "danger",
  false: "success",
};
