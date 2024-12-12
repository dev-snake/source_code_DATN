import { ICakeRecipe } from "@/types/cake";
import { addCommas } from "@/utils/add-comma";

interface ICakeRecipeProps {
  cakeRecipe?: ICakeRecipe[];
}
const PropertyRecipe = ({ cakeRecipe }: ICakeRecipeProps) => {
  return (
    <div className="flex flex-col gap-y-2">
      {cakeRecipe ? (
        cakeRecipe.map((recipe, index) => (
          <div className="flex items-center justify-between gap-x-2" key={index}>
            <span className="text-default-300">{recipe.materialName}</span>
            <span>{`${addCommas(recipe.quantity)} ${recipe.calUnit}`}</span>
          </div>
        ))
      ) : (
        <p className="text-center italic">Chưa cập nhật công thức</p>
      )}
    </div>
  );
};

export default PropertyRecipe;
