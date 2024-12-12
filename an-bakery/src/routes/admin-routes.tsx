import AdminLayout from "@/layouts/admin-layout";
import CakesManagement from "@/pages/admin/cakes-management";
import ErrorPage from "@/pages/common/error";
import adminPlanRoutes from "@/routes/admin/admin-plans/admin-plans";
import { RouteObject } from "react-router-dom";
import adminBranchRoutes from "./admin/admin-branches/admin-branches";
import adminCakeRecipeRoutes from "./admin/admin-cake-recipes/admin-cake-recipes";
import adminCakesRoutes from "./admin/admin-cakes/admin-cakes";
import adminCategoriesRoutes from "./admin/admin-categories/admin-categories";
import adminImportRequests from "./admin/admin-import-requests/admin-import-requests";
import adminInventoryRoutes from "./admin/admin-inventory/admin-inventory";
import adminMaterialRoutes from "./admin/admin-materials/admin-materials";
import adminOrderRoutes from "./admin/admin-orders/admin-orders";
import adminStaff from "./admin/admin-staff/admin-staff";
import adminSupplierRoutes from "./admin/admin-suppliers/admin-suppliers";
import adminUserRoutes from "./admin/admin-users/admin-users";
import adminVoucherRoutes from "./admin/admin-vouchers/admin-vouchers";
import adminAnalyticsRoutes from "./admin/admin-analytics/admin-analytics";

const adminRoutes: RouteObject[] = [
  {
    path: "admin",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <CakesManagement />,
      },
      ...adminAnalyticsRoutes,
      ...adminCakesRoutes,
      ...adminCategoriesRoutes,
      ...adminBranchRoutes,
      ...adminSupplierRoutes,
      ...adminMaterialRoutes,
      ...adminUserRoutes,
      ...adminOrderRoutes,
      ...adminVoucherRoutes,
      ...adminStaff,
      ...adminCakeRecipeRoutes,
      ...adminImportRequests,
      ...adminInventoryRoutes,
      ...adminPlanRoutes,
    ],
  },
];
export default adminRoutes;
