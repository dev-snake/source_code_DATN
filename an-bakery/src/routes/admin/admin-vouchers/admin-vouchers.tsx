import VouchersManagement from "@/pages/admin/vouchers-management";
import CreateVouchers from "@/pages/admin/vouchers-management/create-vouchers";
import EditVouchers from "@/pages/admin/vouchers-management/edit-vouchers";
import VoucherDetails from "@/pages/admin/vouchers-management/voucher-details";
import { RouteObject } from "react-router-dom";

const adminVoucherRoutes: RouteObject[] = [
  {
    path: "vouchers-management",
    element: <VouchersManagement />,
  },
  {
    path: "vouchers-management/:voucherId",
    element: <VoucherDetails />,
  },
  {
    path: "vouchers-management/create",
    element: <CreateVouchers />,
  },
  {
    path: "vouchers-management/:voucherId/edit",
    element: <EditVouchers />,
  },
];
export default adminVoucherRoutes;
