import WrapperContainer from "@/components/admin/wrapper-container";
import AdminHeader from "@/components/admin/admin-header";
import { Input, Button, Textarea, Switch, Chip } from "@nextui-org/react";
import adminRoutes from "@/config/routes/admin-routes.config";
import iconConfig from "@/config/icons/icon-config";
import useStaffAxios from "@/hooks/useStaffAxios";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { IAPIResponse } from "@/types/api-response";
import { apiRoutes } from "@/config/routes/api-routes.config";
import { ICategoryForm } from "@/types/category";
import { toast } from "react-toastify";
import generateCategoryKey from "@/utils/generate-category-key";
import { useNavigate } from "react-router-dom";
import { MapCategoryStatusColor } from "@/utils/map-data/categories";

const EditCategory = () => {
  const staffAxios = useStaffAxios();
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<ICategoryForm>({
    categoryName: "",
    categoryKey: "",
    categoryDescription: "",
    isActive: true,
  });

  const getCategoryData = (categoryId: string) => {
    staffAxios
      .get<IAPIResponse<ICategoryForm>>(apiRoutes.categories.infor(categoryId))
      .then((response) => response.data)
      .then((response) => {
        setCategory({
          categoryName: response.results.categoryName,
          categoryKey: response.results.categoryKey,
          categoryDescription: response.results.categoryDescription,
          isActive: response.results.isActive,
        });
      });
  };

  const handleCategoryNameChange = (value: string) => {
    const categoryName = value;
    setCategory({
      ...category,
      categoryName: value,
      categoryKey: generateCategoryKey(categoryName),
    });
  };

  const handleUpdateCategory = () => {
    staffAxios
      .patch<IAPIResponse>(apiRoutes.categories.update(categoryId as string), category)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
          return navigate(adminRoutes.category.root);
        }
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    if (!categoryId) return;

    getCategoryData(categoryId);
  }, []);

  return (
    <WrapperContainer>
      <AdminHeader title="Chỉnh sửa danh mục" refBack={adminRoutes.category.root} showBackButton={true} />
      <div className="flex flex-col gap-4">
        <div className="flex w-full flex-col gap-4 rounded-2xl border p-4 shadow-custom">
          <h5>Thông tin danh mục</h5>
          <div className={"flex items-center gap-2"}>
            <Input
              label={"Tên danh mục"}
              labelPlacement={"outside"}
              placeholder={"Nhập tên danh mục"}
              isRequired={true}
              size="lg"
              variant="bordered"
              value={category.categoryName}
              onValueChange={handleCategoryNameChange}
            />
            <Input
              label={"Khóa danh mục"}
              labelPlacement={"outside"}
              placeholder={"Nhập khóa danh mục"}
              isRequired={true}
              isReadOnly={true}
              size="lg"
              value={category.categoryKey}
              onValueChange={(e) => setCategory({ ...category, categoryKey: e })}
            />
          </div>

          <Textarea
            label={"Mô tả ngắn về danh mục"}
            labelPlacement={"outside"}
            placeholder="Nhập mô tả"
            size="lg"
            variant="bordered"
            value={category.categoryDescription}
            onValueChange={(e) => setCategory({ ...category, categoryDescription: e })}
            classNames={{
              label: "text-base",
            }}
          />
          <Switch
            color={MapCategoryStatusColor[category.isActive.toString()]}
            isSelected={category.isActive}
            onValueChange={(e) => setCategory({ ...category, isActive: e })}
            classNames={{
              base: "flex-row-reverse gap-2",
            }}
          >
            Hiện danh mục
          </Switch>
        </div>
        <Button
          color="primary"
          size="lg"
          startContent={iconConfig.edit.medium}
          onClick={handleUpdateCategory}
        >
          Cập nhật thông tin danh mục
        </Button>
      </div>
    </WrapperContainer>
  );
};

export default EditCategory;
