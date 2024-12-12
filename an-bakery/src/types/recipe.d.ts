import { IMaterial } from "@/types/material";
import { IRecipeVariant } from "@/types/recipe";

interface IIngredients {
  materialId: string | IMaterial;
  quantity: number;
}
interface IRecipeStep {
  step: number;
  value: string;
}
interface IRecipeVariantItem {
  _id?: string;
  itemLabel: string;
  materialId: string | IMaterial;
  quantity: number;
}

interface IRecipeVariant {
  _id?: string;
  variantLabel: string;
  variantItems: IRecipeVariantItem[];
}

export interface IRecipeVariantItemForm {
  itemLabel: string;
  materialId: string | IMaterial;
  quantity: number;
}

export interface IRecipeVariantForm {
  variantLabel: string;
  variantItems: IRecipeVariantItemForm[];
}
interface IRecipe {
  _id: string;
  recipeName: string;
  recipeDescription: string;
  recipeServings: number;
  cookTime: number;
  recipeIngredients: IIngredients[];
  recipeInstructions: IRecipeStep[];
  recipeVariants: IRecipeVariant[];
  createdAt: string;
  creatorId: string;
  isDeleted: boolean;
}
