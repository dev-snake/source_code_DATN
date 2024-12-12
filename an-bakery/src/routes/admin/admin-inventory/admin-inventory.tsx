import BranchInventoryManagement from "@/pages/admin/branch-inventory-management";
import { RouteObject } from "react-router-dom";

const adminInventoryRoutes: RouteObject[] = [
  {
    path: "branch-inventory-management",
    element: <BranchInventoryManagement />,
  },
];
export default adminInventoryRoutes;
