import BranchMaterialsManagement from "@/pages/admin/branch-inventory-management";
import MaterialManagement from "@/pages/admin/material-management";
import CreateMaterial from "@/pages/admin/material-management/create-material";
import EditMaterial from "@/pages/admin/material-management/edit-material";
import MaterialDetails from "@/pages/admin/material-management/material-details";
import { RouteObject } from "react-router-dom";

const adminMaterialRoutes: RouteObject[] = [
  {
    path: "materials-management",
    element: <MaterialManagement />,
  },
  {
    path: "materials-management/create",
    element: <CreateMaterial />,
  },
  {
    path: "materials-management/:materialId/edit",
    element: <EditMaterial />,
  },
  {
    path: "materials-management/:materialId",
    element: <MaterialDetails />,
  },
];
export default adminMaterialRoutes;
