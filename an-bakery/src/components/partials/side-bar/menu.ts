import { iconSize } from "@/config/icons/icon-config";
import {
  BiCalendarCheck,
  BiCartAlt,
  BiMap,
  BiObjectsVerticalBottom,
  BiSolidCategory,
  BiSolidDiscount,
  BiSolidStoreAlt,
  BiSolidUser,
} from "react-icons/bi";
import { FaBirthdayCake } from "react-icons/fa";
import { FaClipboardUser, FaTruckFast } from "react-icons/fa6";

import React from "react";
import { GrPlan, GrRestaurant } from "react-icons/gr";
import { BsCartPlusFill } from "react-icons/bs";
interface MenuList {
  label: string;
  icon: React.ElementType;
  size: number;
  path: string;
  minRequiredRole: number[];
}

const menuList: MenuList[] = [
  {
    label: "Thống kê",
    size: iconSize.medium,
    icon: BiObjectsVerticalBottom,
    path: "analytics",
    minRequiredRole: [1, 2],
  },
  // {
  //   label: "Thông báo",
  //   size: iconSize.medium,
  //   icon: BiSolidBellRing,
  //   path: "notifications",
  //   minRequiredRole: [1, 2],
  // },
  {
    label: "Khách hàng",
    size: iconSize.medium,
    icon: BiSolidUser,
    path: "customers-management",
    minRequiredRole: [2],
  },
  {
    label: "Danh mục",
    size: iconSize.medium,
    icon: BiSolidCategory,
    path: "categories-management",
    minRequiredRole: [2],
  },
  {
    label: "Sản phẩm",
    icon: FaBirthdayCake,
    size: iconSize.medium,
    path: "cakes-management",
    minRequiredRole: [0, 1, 2],
  },
  {
    label: "Sản phẩm KD",
    icon: FaBirthdayCake,
    size: iconSize.medium,
    path: "business-products",
    minRequiredRole: [0, 1],
  },
  {
    label: "Công thức bánh",
    size: iconSize.medium,
    icon: GrRestaurant,
    path: "cake-recipe-management",
    minRequiredRole: [2],
  },
  {
    label: "Nguyên liệu",
    size: iconSize.medium,
    icon: BiSolidStoreAlt,
    path: "materials-management",
    minRequiredRole: [2],
  },
  {
    label: "Kho",
    size: iconSize.medium,
    icon: BiSolidStoreAlt,
    path: "branch-inventory-management",
    minRequiredRole: [0, 1],
  },
  {
    label: "Kế hoạch",
    size: iconSize.medium,
    icon: GrPlan,
    path: "branch-plans-management",
    minRequiredRole: [1],
  },
  {
    label: "Đơn hàng",
    size: iconSize.medium,
    icon: BiCartAlt,
    path: "orders-management",
    minRequiredRole: [2],
  },
  {
    label: "Tạo đơn hàng",
    size: iconSize.medium,
    icon: BsCartPlusFill,
    path: "create-order",
    minRequiredRole: [0, 1],
  },
  {
    label: "Đơn hàng",
    size: iconSize.medium,
    icon: BiCartAlt,
    path: "branch-orders-management",
    minRequiredRole: [0, 1],
  },
  {
    label: "Chi nhánh",
    size: iconSize.medium,
    icon: BiMap,
    path: "branches-management",
    minRequiredRole: [2],
  },
  {
    label: "QL Chi nhánh",
    size: iconSize.medium,
    icon: BiMap,
    path: "branch-config",
    minRequiredRole: [1],
  },
  {
    label: "Nhà cung cấp",
    size: iconSize.medium,
    icon: BiCalendarCheck,
    path: "suppliers-management",
    minRequiredRole: [0, 1, 2],
  },
  {
    label: "Nhân viên",
    size: iconSize.medium,
    icon: FaClipboardUser,
    path: "staff-management",
    minRequiredRole: [1, 2],
  },
  {
    label: "Mã giảm giá",
    size: iconSize.medium,
    icon: BiSolidDiscount,
    path: "vouchers-management",
    minRequiredRole: [0, 1, 2],
  },
  {
    label: "Nhập hàng",
    size: iconSize.medium,
    icon: FaTruckFast,
    path: "import-requests-management",
    minRequiredRole: [0, 1, 2],
  },
];
export default menuList;
