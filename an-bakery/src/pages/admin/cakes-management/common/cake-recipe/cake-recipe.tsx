import Loading from "@/components/admin/loading";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useAxios from "@/hooks/useAxios";
import { IAPIResponse } from "@/types/api-response";
import { IRecipe, IRecipeVariant } from "@/types/recipe";
import { Select, SelectItem, SelectSection } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
interface ICakeRecipeProps {
  cakeRecipes: string | null;
  setCakeRecipes: React.Dispatch<React.SetStateAction<string | null>>;
  setRecipeVariantList: React.Dispatch<React.SetStateAction<IRecipeVariant[]>>;
  onChangeRecipe?: (selectedId: string) => void;
}
const CakeRecipe = ({
  cakeRecipes,
  setCakeRecipes,
  setRecipeVariantList,
  onChangeRecipe,
}: ICakeRecipeProps) => {
  const axiosClient = useAxios();
  const [listRecipes, setListRecipes] = useState<IRecipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    axiosClient
      .get<IAPIResponse<IRecipe[]>>(apiRoutes.cakeRecipe.getAll + "?noPagination=true")
      .then((response) => response.data)
      .then((response) => {
        console.log("listRecipes test-x", response);
        return setListRecipes(response.results);
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChangeRecipe = (selectedValue: string) => {
    setCakeRecipes(selectedValue);
    const selectedRecipe = listRecipes.find((recipe) => recipe._id === selectedValue);
    if (selectedRecipe) {
      const recipeVariants = selectedRecipe.recipeVariants;

      if (onChangeRecipe) onChangeRecipe(selectedRecipe._id as string);
      setRecipeVariantList(recipeVariants as IRecipeVariant[]);
    }
  };
  if (isLoading) return <Loading />;

  return (
    <div className="rounded-2xl border p-4 shadow-custom">
      <div className="mb-4 flex items-center justify-between">
        <h5>Chọn Công thức làm bánh</h5>
      </div>
      <Select
        selectedKeys={[cakeRecipes as string]}
        aria-label="Chọn công thức bánh"
        placeholder="Chọn công thức bánh"
        variant="bordered"
        size="lg"
        onSelectionChange={(e) => handleChangeRecipe(Array.from(e).join(""))}
      >
        <SelectSection showDivider title="Công thức">
          {listRecipes.map((recipe) => (
            <SelectItem
              key={recipe._id as string}
              value={recipe._id}
              data-recipe-variants={recipe?.recipeVariants}
            >
              {recipe.recipeName}
            </SelectItem>
          ))}
        </SelectSection>
      </Select>
    </div>
  );
};

export default CakeRecipe;
