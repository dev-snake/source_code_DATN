import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useStaffAxios from "@/hooks/useStaffAxios";
import RecipeVariants from "@/pages/admin/cake-recipe-management/common/recipe-variants";
import { IAPIResponse } from "@/types/api-response";
import { IIngredients, IRecipe, IRecipeStep, IRecipeVariant, IRecipeVariantForm } from "@/types/recipe";
import {
  Accordion,
  AccordionItem,
  Button,
  Input,
  Radio,
  RadioGroup,
  Textarea,
  Tooltip,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Ingredients from "../common/ingredients";
import Instructions from "../common/instructions";
interface BaseInfoOfRecipe {
  recipeName: string;
  recipeDescription: string;
  recipeServings: number;
  cookTime: number;
}
const EditCakeRecipe = () => {
  const axiosStaff = useStaffAxios();
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [baseInfoOfRecipe, setBaseInfoOfRecipe] = useState<BaseInfoOfRecipe>({
    recipeName: "",
    recipeDescription: "",
    recipeServings: 0,
    cookTime: 0,
  });
  const [showVariants, setShowVariants] = useState<boolean>(false);
  const [recipeVariants, setRecipeVariants] = useState<IRecipeVariantForm[]>([
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
  useEffect(() => {
    axiosStaff
      .get<IAPIResponse<IRecipe>>(apiRoutes.cakeRecipe.getOne(recipeId as string))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          setBaseInfoOfRecipe({
            recipeName: response.results.recipeName,
            recipeDescription: response.results.recipeDescription,
            recipeServings: response.results.recipeServings,
            cookTime: response.results.cookTime,
          });
          setListOfIngredients(response.results.recipeIngredients);
          setListOfInstructions(response.results.recipeInstructions);
          setShowVariants(response.results.recipeVariants.length > 0);
          setRecipeVariants(response.results.recipeVariants as IRecipeVariant[]);
        }
      })
      .catch((error) => console.error(error))
      .finally(() => setIsLoading(false));
  }, []);
  const handleEditRecipe = () => {
    const newRecipe: { [key: string]: unknown } = {
      ...baseInfoOfRecipe,
      recipeIngredients: listOfIngredients,
      recipeInstructions: listOfInstructions,
    };
    const { cookTime, recipeName, recipeDescription, recipeServings } = baseInfoOfRecipe;
    if ([cookTime, recipeName, recipeDescription, recipeServings].includes("")) {
      return toast.error("Vui lòng điền đầy đủ thông tin");
    }
    const isHasVariants =
      recipeVariants.some((variant) => variant.variantLabel === "") || recipeVariants.length === 0;
    if (!isHasVariants) newRecipe["recipeVariants"] = recipeVariants;
    console.log("newRecipe", newRecipe);
    axiosStaff
      .patch<IAPIResponse<IRecipe>>(apiRoutes.cakeRecipe.edit(recipeId as string), newRecipe)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success("Cập nhật công thức thành công");
          navigate(adminRoutes.cakeRecipe.root);
        }
      })
      .catch((error) => console.error(error));
  };
  if (isLoading) return <Loading />;

  return (
    <WrapperContainer>
      <AdminHeader
        title="Cập nhật công thức bánh"
        showBackButton={true}
        refBack={adminRoutes.cakeRecipe.root}
      />
      <div className="grid grid-cols-3 gap-4">
        <div className="sticky top-4 col-span-1 flex flex-col gap-y-4">
          <div className="rounded-2xl border p-4 shadow-custom">
            <h5 className="mb-4">Thông tin công thức làm bánh</h5>
            <div className="flex flex-col gap-4">
              <Input
                value={baseInfoOfRecipe.recipeName}
                label={"Tên công thức"}
                labelPlacement={"outside"}
                placeholder="Nhập tên công thức bánh"
                size="lg"
                variant="bordered"
                onValueChange={(value) => setBaseInfoOfRecipe((prev) => ({ ...prev, recipeName: value }))}
              />
              <div className="flex gap-2">
                <Input
                  label={"Khẩu phần ăn"}
                  labelPlacement={"outside"}
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
                  label={"Thời gian nấu"}
                  labelPlacement={"outside"}
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
                placeholder="Nhập mô tả"
                variant={"bordered"}
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
          <Button color="primary" size="lg" startContent={iconConfig.edit.medium} onClick={handleEditRecipe}>
            Cập nhật công thức mới
          </Button>
        </div>

        <div className="col-span-2">
          <Accordion
            variant={"splitted"}
            className={""}
            defaultExpandedKeys={showVariants ? ["recipe_variants"] : ["ingredients"]}
          >
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

export default EditCakeRecipe;
