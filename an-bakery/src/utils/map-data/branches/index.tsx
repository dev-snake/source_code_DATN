import iconConfig from "@/config/icons/icon-config";
import { TBranchType } from "@/types/branch";
import { ChipProps, ButtonProps } from "@nextui-org/react";
import React from "react";

export const MapBranchTypeText: Record<TBranchType, string> = {
  direct: "Trực tiếp",
  online: "Trực tuyến",
};

export const MapBranchTypeColor: Record<TBranchType, ChipProps["color"]> = {
  direct: "primary",
  online: "secondary",
};

export const MapBranchTypeIcon: Record<TBranchType, React.ReactNode> = {
  direct: iconConfig.directStore.base,
  online: iconConfig.onlineStore.base,
};

export const MapBranchStatusText: Record<string, string> = {
  true: "Đang hoạt động",
  false: "Ngưng hoạt động",
};

export const MapBranchStatusColor: Record<string, ButtonProps["color"]> = {
  true: "success",
  false: "danger",
};
