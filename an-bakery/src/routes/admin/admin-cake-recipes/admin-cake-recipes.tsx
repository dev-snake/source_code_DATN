import CakeRecipeManagement from "@/pages/admin/cake-recipe-management";
import RecipeDetails from "@/pages/admin/cake-recipe-management/cake-recipe-details";
import CreateCakeRecipe from "@/pages/admin/cake-recipe-management/create-cake-recipe";
import EditCakeRecipe from "@/pages/admin/cake-recipe-management/edit-cake-recipe";
import { RouteObject } from "react-router-dom";

const adminCakeRecipeRoutes: RouteObject[] = [
  {
    path: "cake-recipe-management",
    element: <CakeRecipeManagement />,
  },
  {
    path: "cake-recipe-management/create",
    element: <CreateCakeRecipe />,
  },
  {
    path: "cake-recipe-management/:recipeId/edit",
    element: <EditCakeRecipe />,
  },
  {
    path: "cake-recipe-management/:recipeId",
    element: <RecipeDetails />,
  },
];
export default adminCakeRecipeRoutes;
