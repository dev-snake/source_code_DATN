import { ChipProps } from "@nextui-org/react";

export const MapCakeStatusText: Record<string, string> = {
  true: "Chưa mở bán",
  false: "Đang mở bán",
};

export const MapCakeStatusColor: Record<string, ChipProps["color"]> = {
  true: "danger",
  false: "success",
};

export const MapCakeTypeText: Record<string, string> = {
  true: "Bánh có biến thể",
  false: "Bánh không biến thể",
};

export const MapCakeTypeColor: Record<string, ChipProps["color"]> = {
  true: "primary",
  false: "secondary",
};
