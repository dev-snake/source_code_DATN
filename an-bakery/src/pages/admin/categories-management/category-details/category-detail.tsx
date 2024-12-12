import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import WrapperContainer from "@/components/admin/wrapper-container";
import CakeCard from "@/components/cakes/cake-card";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse } from "@/types/api-response";
import { ICake } from "@/types/cake";
import { ICategory } from "@/types/category";
import { MapCategoryStatusColor, MapCategoryStatusText } from "@/utils/map-data/categories";
import { Chip, Input, Textarea } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CategoryDetail = () => {
  const { categoryId } = useParams();
  const staffAxios = useStaffAxios();
  const [categoryData, setCategoryData] = useState<ICategory>();

  const [listCakes, setListCakes] = useState<ICake[]>([]);
  const getCategoryData = (categoryId: string) => {
    staffAxios
      .get<IAPIResponse<ICategory>>(apiRoutes.categories.infor(categoryId))
      .then((response) => response.data)
      .then((response) => {
        setCategoryData(response.results);
      });
  };

  const getListCakesInCategory = (categoryId: string) => {
    staffAxios
      .get<IAPIResponse<ICake[]>>(apiRoutes.categories.cakes(categoryId))
      .then((response) => response.data)
      .then((response) => {
        setListCakes(response.results);
      });
  };

  useEffect(() => {
    if (!categoryId) return;

    Promise.all([getCategoryData(categoryId), getListCakesInCategory(categoryId)]);
  }, []);

  return (
    <WrapperContainer>
      <AdminHeader title={`THÔNG TIN DANH MỤC`} refBack={adminRoutes.category.root} showBackButton={true} />
      <div className={"flex flex-col gap-4"}>
        <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom max-lg:w-full">
          <h5 className="grow truncate max-[900px]:hidden">Thông tin danh mục</h5>
          <div className="flex w-full flex-col gap-4">
            <div className={"flex items-center gap-2"}>
              <Input
                label={"Tên danh mục"}
                labelPlacement={"outside"}
                size="lg"
                isReadOnly={true}
                value={categoryData?.categoryName ?? "Đang lấy dữ liệu..."}
              />
              <Input
                label={"Khóa danh mục"}
                labelPlacement={"outside"}
                placeholder={"Nhập khóa danh mục"}
                isReadOnly={true}
                size="lg"
                value={categoryData?.categoryKey ?? "Đang lấy dữ liệu..."}
              />
            </div>

            <Textarea
              label={"Mô tả ngắn về danh mục"}
              labelPlacement={"outside"}
              size="lg"
              isReadOnly={true}
              value={(categoryData?.categoryDescription ?? "Đang lấy dữ liệu...") || "Không có mô tả"}
              classNames={{
                label: "text-base",
              }}
            />
            <div className={"flex items-center gap-2"}>
              <p>Trạng thái danh mục</p>
              <Chip
                color={categoryData ? MapCategoryStatusColor[categoryData.isActive.toString()] : "warning"}
                variant={"flat"}
              >
                {categoryData
                  ? MapCategoryStatusText[categoryData.isActive.toString()]
                  : "Đang lấy dữ liệu..."}
              </Chip>
            </div>
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-8 rounded-2xl border p-4 shadow-custom">
          <div className={"flex items-center gap-1"}>
            <h5 className={"text-primary"}>{listCakes.length}</h5>
            <h5>sản phẩm trong danh mục</h5>
          </div>
          <div className="grid gap-4 max-lg:grid-cols-3 max-[800px]:grid-cols-2 max-sm:grid-cols-1 lg:grid-cols-4">
            {listCakes.map((cake, index) => (
              <CakeCard key={index} cakeData={cake} isShowUtils={false} />
            ))}
          </div>
        </div>
      </div>
    </WrapperContainer>
  );
};

export default CategoryDetail;
