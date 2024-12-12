import adminRoutes from "@/config/routes/admin-routes.config";
import BranchesManagement from "@/pages/admin/branches-management";
import BranchDetails from "@/pages/admin/branches-management/branch-details";
import BranchOrders from "@/pages/admin/branches-management/branch-orders";
import CreateBranch from "@/pages/admin/branches-management/create-branch";
import EditBranch from "@/pages/admin/branches-management/edit-branch";
import { RouteObject } from "react-router-dom";

const adminBranchRoutes: RouteObject[] = [
  {
    path: "branches-management",
    element: <BranchesManagement />,
  },
  {
    path: "branches-management/branch-orders",
    element: <BranchOrders />,
  },
  {
    path: "branches-management/import-requests",
    element: <BranchOrders />,
  },
  {
    path: "branches-management/create",
    element: <CreateBranch />,
  },
  {
    path: "branches-management/:branchId/edit",
    element: <EditBranch refBack={adminRoutes.branch.root} />,
  },
  {
    path: "branches-management/:branchId",
    element: <BranchDetails refBack={adminRoutes.branch.root} />,
  },
  {
    path: "branch-config",
    element: <BranchDetails refBack={adminRoutes.branchConfig.root} />,
  },
  {
    path: "branch-config/edit",
    element: <EditBranch refBack={adminRoutes.branchConfig.root} />,
  },
];
export default adminBranchRoutes;
