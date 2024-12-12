import WrapperContainer from "@/components/admin/wrapper-container";
import AdminHeader from "@/components/admin/admin-header";
import { Input, Button, Textarea, Switch } from "@nextui-org/react";
import adminRoutes from "@/config/routes/admin-routes.config";
import { toast } from "react-toastify";
import iconConfig from "@/config/icons/icon-config";
import { useState } from "react";
import generateCategoryKey from "@/utils/generate-category-key";
import useStaffAxios from "@/hooks/useStaffAxios.ts";
import { apiRoutes } from "@/config/routes/api-routes.config";
import { IAPIResponse } from "@/types/api-response";
import { useNavigate } from "react-router-dom";
import { ICategoryForm } from "@/types/category";
const CreateCategory = () => {
  const staffAxios = useStaffAxios();
  const navigate = useNavigate();
  const [category, setCategory] = useState<ICategoryForm>({
    categoryName: "",
    categoryKey: "",
    categoryDescription: "",
    isActive: true,
  });

  const handleActiveChange = (value: boolean) => {
    setCategory({ ...category, isActive: value });
  };
  const handleCategoryNameChange = (e: string) => {
    const categoryName = e;
    setCategory({
      ...category,
      categoryName: e,
      categoryKey: generateCategoryKey(categoryName),
    });
  };
  const handleCreateCategory = () => {
    staffAxios
      .post<IAPIResponse>(apiRoutes.categories.create, category)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          setCategory({
            categoryName: "",
            categoryKey: "",
            categoryDescription: "",
            isActive: true,
          });
          toast.success(response.message);
          return navigate(adminRoutes.category.root);
        }
      })
      .catch((error) => console.log(error));
  };
  console.log(category);
  return (
    <WrapperContainer>
      <AdminHeader title="Thêm danh mục mới" refBack={adminRoutes.category.root} showBackButton={true} />
      <div className="flex w-1/2 min-w-[800px] flex-col gap-4">
        <div className="flex w-full flex-col gap-4 rounded-2xl border p-4 shadow-custom">
          <h5>Thông tin danh mục mới</h5>
          <div className={"flex items-center gap-2"}>
            <Input
              placeholder="Nhập tên danh mục"
              size="lg"
              variant="bordered"
              onValueChange={handleCategoryNameChange}
              label={"Tên danh mục"}
              isRequired={true}
              labelPlacement={"outside"}
            />

            <Input
              label={"Khóa danh mục"}
              isRequired={true}
              labelPlacement={"outside"}
              placeholder={"Khóa danh mục"}
              size="lg"
              isReadOnly
              value={category.categoryKey}
            />
          </div>
          <Textarea
            label={"Mô tả ngắn về danh mục"}
            labelPlacement={"outside"}
            placeholder={"Nhập mô tả..."}
            size={"lg"}
            variant={"bordered"}
            onValueChange={(e) => setCategory({ ...category, categoryDescription: e })}
          />
        </div>
        <Button color="primary" size="lg" startContent={iconConfig.add.medium} onClick={handleCreateCategory}>
          Thêm danh mục mới
        </Button>
      </div>
    </WrapperContainer>
  );
};

export default CreateCategory;
