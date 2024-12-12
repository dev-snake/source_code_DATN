import UsersManagement from "@/pages/admin/customers-management";
import CustomerDetails from "@/pages/admin/customers-management/customer-details";
import { RouteObject } from "react-router-dom";

const adminUserRoutes: RouteObject[] = [
  {
    path: "customers-management",
    element: <UsersManagement />,
  },
  {
    path: "customers-management/:userId",
    element: <CustomerDetails />,
  },
];
export default adminUserRoutes;
