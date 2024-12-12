import adminRoutes from "@/config/routes/admin-routes.config";
import BranchProductsManagement from "@/pages/admin/business-products-management";
import CakesManagement from "@/pages/admin/cakes-management";
import CreateCake from "@/pages/admin/cakes-management/create-cake";
import EditCake from "@/pages/admin/cakes-management/edit-cake";
import CakeDetailsAdmin from "@/pages/admin/cakes-management/cake-details";
import { RouteObject } from "react-router-dom";

const adminProductsRoutes: RouteObject[] = [
  {
    path: "cakes-management",
    element: <CakesManagement />,
  },

  {
    path: "cakes-management/create",
    element: <CreateCake />,
  },
  {
    path: "cakes-management/:cakeId/edit",
    element: <EditCake />,
  },
  {
    path: "cakes-management/:cakeId",
    element: <CakeDetailsAdmin refBack={adminRoutes.cakes.root} />,
  },
  {
    path: "business-products",
    element: <BranchProductsManagement />,
  },
  {
    path: "business-products/:cakeId",
    element: <CakeDetailsAdmin refBack={adminRoutes.branchCakes.root} />,
  },
];
export default adminProductsRoutes;
