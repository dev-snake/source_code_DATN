import { ChipProps } from "@nextui-org/react";

export const MapSupplierPriorityText: Record<number, string> = {
  1: "Thấp",
  2: "Thường",
  3: "Cao",
};

export const MapSupplierPriorityColor: Record<number, ChipProps["color"]> = {
  1: "default",
  2: "secondary",
  3: "primary",
};
