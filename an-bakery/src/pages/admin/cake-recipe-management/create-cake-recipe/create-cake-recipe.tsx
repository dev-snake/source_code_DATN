import AdminHeader from "@/components/admin/admin-header";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useStaffAxios from "@/hooks/useStaffAxios";
import RecipeVariants from "@/pages/admin/cake-recipe-management/common/recipe-variants";
import { IAPIResponse } from "@/types/api-response";
import {
  Accordion,
  AccordionItem,
  Button,
  Input,
  Textarea,
  Tooltip,
  RadioGroup,
  Radio,
} from "@nextui-org/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Ingredients from "../common/ingredients";
import Instructions from "../common/instructions";
import { IIngredients, IRecipeStep, IRecipeVariant } from "@/types/recipe";
interface BaseInfoOfRecipe {
  recipeName: string;
  recipeDescription: string;
  recipeServings: number;
  cookTime: number;
}
const CreateCakeRecipe = () => {
  const axiosStaff = useStaffAxios();
  const navigate = useNavigate();
  const [showVariants, setShowVariants] = useState<boolean>(false);
  const [recipeVariants, setRecipeVariants] = useState<IRecipeVariant[]>([
    {
      variantLabel: "",
      variantItems: [
        {
          itemLabel: "",
          materialId: "",
          quantity: 0,
        },
      ],
    },
  ]);
  const [baseInfoOfRecipe, setBaseInfoOfRecipe] = useState<BaseInfoOfRecipe>({
    recipeName: "",
    recipeDescription: "",
    recipeServings: 0,
    cookTime: 0,
  });
  const [listOfIngredients, setListOfIngredients] = useState<IIngredients[]>([
    {
      materialId: "",
      quantity: 0,
    },
  ]);
  const [listOfInstructions, setListOfInstructions] = useState<IRecipeStep[]>([
    {
      step: 1,
      value: "",
    },
  ]);
  const handleAddNewRecipe = () => {
    const newRecipe: { [key: string]: unknown } = {
      ...baseInfoOfRecipe,
      recipeIngredients: listOfIngredients,
      recipeInstructions: listOfInstructions,
    };
    const { cookTime, recipeName, recipeDescription, recipeServings } = baseInfoOfRecipe;
    if ([cookTime, recipeName, recipeDescription, recipeServings].includes("")) {
      return toast.error("Vui lòng điền đầy đủ thông tin");
    }
    const isHasRecipeVariants = recipeVariants.some((variant) => variant.variantLabel === "");
    if (!isHasRecipeVariants) newRecipe["recipeVariants"] = recipeVariants;
    axiosStaff
      .post<IAPIResponse>(apiRoutes.cakeRecipe.create, newRecipe)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success("Tạo công thức thành công");
          navigate(adminRoutes.cakeRecipe.root);
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <WrapperContainer>
      <AdminHeader
        title="Tạo mới công thức bánh"
        showBackButton={true}
        refBack={adminRoutes.cakeRecipe.root}
      />
      <div className="grid grid-cols-3 gap-4">
        <div className="sticky top-4 col-span-1 flex h-[calc(100vh-5rem)] flex-col gap-y-4">
          <div className="rounded-2xl border p-4 shadow-custom">
            <h5 className="mb-4">Thông tin công thức làm bánh</h5>
            <div className="flex flex-col gap-2">
              <Input
                value={baseInfoOfRecipe.recipeName}
                placeholder="Nhập tên công thức bánh"
                size="lg"
                variant="bordered"
                onValueChange={(value) => setBaseInfoOfRecipe((prev) => ({ ...prev, recipeName: value }))}
              />
              <div className="flex gap-x-2">
                <Input
                  value={baseInfoOfRecipe.recipeServings.toString()}
                  placeholder="Khẩu phần ăn"
                  size="lg"
                  variant="bordered"
                  title="Khẩu phần ăn"
                  endContent={<p className={"min-w-max"}>người ăn</p>}
                  onValueChange={(value) =>
                    setBaseInfoOfRecipe((prev) => ({ ...prev, recipeServings: +value }))
                  }
                />
                <Input
                  value={baseInfoOfRecipe.cookTime.toString()}
                  placeholder="Thời gian nấu"
                  size="lg"
                  variant="bordered"
                  title="Thời gian nấu"
                  endContent={"phút"}
                  onValueChange={(value) => setBaseInfoOfRecipe((prev) => ({ ...prev, cookTime: +value }))}
                />
              </div>
              <Textarea
                value={baseInfoOfRecipe.recipeDescription}
                size="lg"
                variant={"bordered"}
                placeholder="Nhập mô tả"
                onValueChange={(value) =>
                  setBaseInfoOfRecipe((prev) => ({ ...prev, recipeDescription: value }))
                }
              />
              <div className={"flex items-center gap-2"}>
                Loại công thức
                <RadioGroup
                  value={showVariants.toString()}
                  onValueChange={(value) => setShowVariants(value === "true" ? true : false)}
                >
                  <Radio value={"false"}>Công thức không có biến thể</Radio>
                  <Radio value={"true"}>Công thức có biến thể</Radio>
                </RadioGroup>
              </div>
            </div>
          </div>
          <Instructions
            listOfInstructions={listOfInstructions}
            setListOfInstructions={setListOfInstructions}
          />
          <Button size="lg" color="primary" startContent={iconConfig.add.medium} onClick={handleAddNewRecipe}>
            Thêm công thức mới
          </Button>
        </div>
        <div className="col-span-2">
          <Accordion variant={"splitted"} defaultExpandedKeys={["ingredients"]}>
            <AccordionItem key={"recipe_variants"} title={<h5>Tùy chỉnh công thức biến thể</h5>}>
              {showVariants ? (
                <RecipeVariants recipeVariants={recipeVariants} setRecipeVariants={setRecipeVariants} />
              ) : (
                <p>
                  Hãy chuyển sang loại: <strong className={"text-primary"}>Công thức có biến thể</strong> để
                  tùy chỉnh công thức biến thể
                </p>
              )}
            </AccordionItem>
            <AccordionItem key={"ingredients"} title={<h5>Danh sách nguyên liệu trong công thức</h5>}>
              <Ingredients
                listOfIngredients={listOfIngredients}
                setListOfIngredients={setListOfIngredients}
              />
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </WrapperContainer>
  );
};

export default CreateCakeRecipe;
