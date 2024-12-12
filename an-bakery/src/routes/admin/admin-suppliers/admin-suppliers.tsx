import adminRoutes from "@/config/routes/admin-routes.config";
import SupplierManagement from "@/pages/admin/supplier-management";
import CreateSupplier from "@/pages/admin/supplier-management/create-supplier";
import EditSupplier from "@/pages/admin/supplier-management/edit-supplier";
import SupplierDetails from "@/pages/admin/supplier-management/supplier-details";
import { RouteObject } from "react-router-dom";
const adminSupplierRoutes: RouteObject[] = [
  {
    path: "suppliers-management",
    element: <SupplierManagement />,
  },
  {
    path: "suppliers-management/create",
    element: <CreateSupplier />,
  },
  {
    path: "suppliers-management/:supplierId",
    element: <SupplierDetails refBack={adminRoutes.supplier.root} />,
  },
  {
    path: "suppliers-management/:supplierId/edit",
    element: <EditSupplier />,
  },
];
export default adminSupplierRoutes;
