export const MapRequestStatusText: Record<string, string> = {
  pending: "Đang chờ xác nhận",
  confirmed: "Đã chấp nhận",
  waiting: "Chờ nhập hàng",
  completed: "Đã nhập xong",
};

export const MapRequestStatusColor: Record<string, "warning" | "secondary" | "danger" | "success"> = {
  pending: "warning",
  confirmed: "secondary",
  waiting: "danger",
  completed: "success",
};

export const MapImportStatusText: Record<string, string> = {
  true: "Đã nhập",
  false: "Đang chờ",
};

export const MapImportStatusColor: Record<string, "success" | "warning"> = {
  true: "success",
  false: "warning",
};
