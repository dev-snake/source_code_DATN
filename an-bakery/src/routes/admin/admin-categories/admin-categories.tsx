import CategoriesManagement from "@/pages/admin/categories-management";
import CreateCategory from "@/pages/admin/categories-management/create-category";
import EditCategory from "@/pages/admin/categories-management/edit-category";
import CategoryDetail from "@/pages/admin/categories-management/category-details";
import { RouteObject } from "react-router-dom";
const adminCategoriesRoutes: RouteObject[] = [
  {
    path: "categories-management",
    element: <CategoriesManagement />,
  },
  {
    path: "categories-management/create",
    element: <CreateCategory />,
  },
  {
    path: "categories-management/:categoryId/edit",
    element: <EditCategory />,
  },
  {
    path: "categories-management/:categoryId",
    element: <CategoryDetail />,
  },
];
export default adminCategoriesRoutes;
