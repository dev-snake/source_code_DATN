import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import WrapperContainer from "@/components/admin/wrapper-container";
import ExpandableText from "@/components/common/expandable-text";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { ICake } from "@/types/cake";
import { IMaterial } from "@/types/material";
import { IRecipe, IRecipeVariant } from "@/types/recipe";
import { displayImage } from "@/utils/display-image";
import { formatHours } from "@/utils/format-date";
import { formatCurrencyVND } from "@/utils/money-format";
import { sliceText } from "@/utils/slice-text";
import { slugify } from "@/utils/slugify";
import {
  Accordion,
  AccordionItem,
  Chip,
  Divider,
  Image,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import cakeInfo from "../../cakes-management/common/cake-info";
import CakeItem from "../../branches-management/branch-details/branch-products/cake-item";
import { MapRecipeTypeColor, MapRecipeTypeText } from "@/utils/map-data/cake-recipes";

const RecipeDetails = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const staffAxios = useStaffAxios();

  const [recipeDetail, setRecipeDetail] = useState<IRecipe>();
  const [listCakeUsage, setListCakeUsage] = useState<ICake[]>([]);
  const [metadata, setMetadata] = useState<IPaginationMetadata | undefined>(undefined);

  const getRecipeDetail = (recipeId: string) => {
    staffAxios
      .get<IAPIResponse<IRecipe>>(apiRoutes.cakeRecipe.getOne(recipeId))
      .then((response) => response.data)
      .then((response) => {
        setRecipeDetail(response.results);
      });
  };
  const getListCakeUsage = (recipeId: string) => {
    staffAxios
      .get<IAPIResponse<ICake[]>>(apiRoutes.cakeRecipe.getListCakeUseRecipe(recipeId))
      .then((response) => response.data)
      .then((response) => {
        setListCakeUsage(response.results);
        setMetadata(response.metadata);
      });
  };

  useEffect(() => {
    if (recipeId) {
      Promise.all([getRecipeDetail(recipeId), getListCakeUsage(recipeId)]);
    }
  }, []);

  if (!recipeDetail) return <Loading />;
  console.log("recipeDetail.recipeVariants", recipeDetail.recipeVariants);
  return (
    <WrapperContainer>
      <AdminHeader title="Chi tiết công thức" refBack={adminRoutes.cakeRecipe.root} showBackButton={true} />
      <div className="grid max-xl:gap-y-4 xl:grid-cols-2 xl:gap-x-4">
        <div className={"flex flex-col gap-4"}>
          <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom">
            <h5>Thông tin công thức làm bánh</h5>
            <div className="flex flex-col gap-4">
              <Input
                label={"Tên công thức"}
                labelPlacement={"outside"}
                value={recipeDetail.recipeName}
                isReadOnly={true}
                size={"lg"}
              />

              <Textarea
                label={"Mô tả công thức"}
                labelPlacement={"outside"}
                value={recipeDetail.recipeDescription}
                isReadOnly={true}
                size={"lg"}
                classNames={{
                  label: "text-base",
                }}
              />
              <div className="flex items-center gap-4">
                <Chip
                  color={MapRecipeTypeColor[recipeDetail.recipeVariants.length > 0 ? "true" : "false"]}
                  startContent={iconConfig.tag.base}
                  className={"px-4 py-1"}
                  size={"lg"}
                  classNames={{
                    base: "gap-1",
                  }}
                >
                  {MapRecipeTypeText[recipeDetail.recipeVariants.length > 0 ? "true" : "false"]}
                </Chip>
                <div className={"h-full"}>
                  <Divider orientation={"vertical"} />
                </div>
                <Chip
                  color={"danger"}
                  startContent={iconConfig.foodRation.medium}
                  className={"px-4 py-1"}
                  size={"lg"}
                  classNames={{
                    base: "gap-1",
                  }}
                >
                  {recipeDetail.recipeServings} người
                </Chip>

                <Chip
                  color={"danger"}
                  startContent={iconConfig.cookingTime.medium}
                  className={"px-4 py-1"}
                  size={"lg"}
                  classNames={{
                    base: "gap-1",
                  }}
                >
                  {formatHours(recipeDetail.cookTime)}
                </Chip>
              </div>
            </div>
          </div>
        </div>
        <Accordion variant={"splitted"} defaultExpandedKeys={["ingredients"]}>
          <AccordionItem key={"ingredients"} title={<h5>Bảng nguyên liệu trong công thức</h5>}>
            <div className={"flex flex-col gap-4 pb-4"}>
              <Table aria-label="Table of recipe" topContent={<h5>Nguyên liệu chính</h5>}>
                <TableHeader>
                  <TableColumn key="materialName">TÊN NGUYÊN LIỆU</TableColumn>
                  <TableColumn className={"text-center"} key="quantity">
                    SỐ LƯỢNG SỬ DỤNG
                  </TableColumn>
                </TableHeader>
                <TableBody
                  items={recipeDetail.recipeIngredients}
                  emptyContent={"Công thức không dùng nguyên liệu nào"}
                >
                  {(item) => (
                    <TableRow key={(item.materialId as IMaterial)._id}>
                      <TableCell>{(item.materialId as IMaterial).materialName}</TableCell>

                      <TableCell className={"text-center"}>
                        {item.quantity} {(item.materialId as IMaterial).calUnit}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {recipeDetail.recipeVariants.map((variant) => (
                <Table aria-label="Table of recipe" topContent={<h5>Biến thể: {variant.variantLabel}</h5>}>
                  <TableHeader>
                    <TableColumn key="materialName">Tên biến thể con</TableColumn>
                    <TableColumn key="calUnit">Nguyên liệu</TableColumn>
                    <TableColumn key="quantity">Số lượng sử dụng</TableColumn>
                  </TableHeader>
                  <TableBody
                    items={variant.variantItems}
                    emptyContent={"Công thức không dùng nguyên liệu nào"}
                  >
                    {(item) => (
                      <TableRow key={item._id}>
                        <TableCell>{item.itemLabel}</TableCell>
                        <TableCell>{(item.materialId as IMaterial)?.materialName}</TableCell>
                        <TableCell>
                          {item.quantity} {(item.materialId as IMaterial)?.calUnit}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              ))}
            </div>
          </AccordionItem>
          <AccordionItem
            key={"cakes"}
            title={
              <div className={"flex w-full justify-between"}>
                <h5>Bánh sử dụng Công thức</h5>
                <Pagination
                  showControls
                  showShadow
                  color="primary"
                  total={metadata?.totalPages ?? 1}
                  initialPage={metadata?.currentPage ?? 1}
                  onChange={(page) => {
                    staffAxios
                      .get<IAPIResponse<ICake[]>>(
                        apiRoutes.cakeRecipe.getListCakeUseRecipe(recipeId as string),
                        {
                          params: {
                            page,
                          },
                        },
                      )
                      .then((response) => response.data)
                      .then((response) => {
                        setListCakeUsage(response.results);
                        setMetadata(response.metadata);
                      });
                  }}
                />
              </div>
            }
          >
            <div className="flex h-max flex-col gap-2 pb-4">
              {(listCakeUsage as ICake[])?.length > 0 ? (
                (listCakeUsage as ICake[]).map((cake) => <CakeItem cakeData={cake} />)
              ) : (
                <p className="text-center italic">Chưa có bánh nào dùng công thức này</p>
              )}
            </div>
          </AccordionItem>
        </Accordion>
      </div>
    </WrapperContainer>
  );
};

export default RecipeDetails;
