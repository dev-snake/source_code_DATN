import OrdersManagement from "@/pages/admin/orders-management";
import OrderDetails from "@/pages/admin/orders-management/order-details";
import OrdersStatus from "@/pages/admin/orders-management/orders-status";
import BranchOrderManagement from "@/pages/admin/branch-order-management";
import { RouteObject } from "react-router-dom";
import adminRoutes from "@/config/routes/admin-routes.config";
import CreateOrder from "@/pages/admin/create-order";

const adminOrderRoutes: RouteObject[] = [
  {
    path: "orders-management",
    element: <OrdersManagement />,
  },
  {
    path: "orders-management/:orderId",
    element: <OrderDetails refBack={adminRoutes.order.root} />,
  },
  {
    path: "orders-management/orders-status",
    element: <OrdersStatus />,
  },
  {
    path: "branch-orders-management/",
    element: <BranchOrderManagement />,
  },
  {
    path: "branch-orders-management/:orderId",
    element: <OrderDetails refBack={adminRoutes.branchOrder.root} />,
  },
  {
    path: "create-order",
    element: <CreateOrder />,
  },
];
export default adminOrderRoutes;
