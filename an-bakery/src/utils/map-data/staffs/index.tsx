import { ChipProps, Chip } from "@nextui-org/react";

export const MapStaffStatusText: Record<string, string> = {
  true: "Đang làm việc",
  false: "Nghỉ việc",
};

export const MapStaffStatusColor: Record<string, ChipProps["color"]> = {
  true: "success",
  false: "danger",
};

export const MapStaffRoleText: Record<string, string> = {
  0: "Nhân viên",
  1: "Quản lý chi nhánh",
  2: "Super Admin",
};

export const MapStaffRoleColor: Record<string, ChipProps["color"]> = {
  0: "warning",
  1: "secondary",
  2: "primary",
};

export const MapStaffBranchColor: Record<string, ChipProps["color"]> = {
  branch: "secondary",
  system: "primary",
  undefinded: "default",
};
