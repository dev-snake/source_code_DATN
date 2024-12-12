import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useStaffAxios from "@/hooks/useStaffAxios";
import { TableColumnsRecipe } from "@/pages/admin/cake-recipe-management/columns";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { ICake } from "@/types/cake";
import { IRecipe } from "@/types/recipe";
import { formatDate, formatHours } from "@/utils/format-date";
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  ScrollShadow,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import { AsyncListData, useAsyncList } from "@react-stately/data";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CakeItem from "../branches-management/branch-details/branch-products/cake-item";
import {
  MapRecipeStatusColor,
  MapRecipeStatusText,
  MapRecipeTypeColor,
  MapRecipeTypeText,
} from "@/utils/map-data/cake-recipes";

const SoftDeleteModalContent = ({ listCakesUseRecipe }: { listCakesUseRecipe: ICake[] }) => {
  return (
    <>
      <div className={"flex flex-col gap-2"}>
        <h4>Lưu ý:</h4>
        <p className={"text-lg italic text-danger"}>
          Khi xóa <strong>CÔNG THỨC</strong>, các <strong>BÁNH ĐANG SỬ DỤNG CÔNG THỨC</strong> NÀY sẽ bị{" "}
          <strong>ẨN</strong> và <strong>KHÔNG THỂ KINH DOANH</strong>, bạn chắc chắn muốn xóa chứ?
        </p>
      </div>
      <div className={"flex flex-col gap-2"}>
        <h4>Các bánh sử dụng công thức:</h4>
        <ScrollShadow className={"flex flex-col gap-2"}>
          {listCakesUseRecipe.length > 0 ? (
            listCakesUseRecipe.map((cake) => <CakeItem cakeData={cake} />)
          ) : (
            <p className={"italic"}>Công thức này không có sản phẩm nào</p>
          )}
        </ScrollShadow>
      </div>
    </>
  );
};

const CakeRecipeManagement = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();
  const staffAxios = useStaffAxios();

  const [listAllCakeRecipes, setListAllCakeRecipes] = useState<IRecipe[]>([]);
  const [listRecipes, setListRecipes] = useState<IRecipe[]>([]);
  const [listCakesUseRecipe, setlistCakesUseRecipe] = useState<ICake[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [metadata, setMetadata] = useState<IPaginationMetadata>();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const recipeRef = useRef<AsyncListData<IRecipe>>();
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [currentAction, setCurrentAction] = useState<"recover" | "softDel" | "hardDel">();
  const [currentStatusFilter, setCurrentStatusFilter] = useState<string>("all");

  const getListRecipe = async (noPagination = false) => {
    try {
      const response = await staffAxios.get<IAPIResponse<IRecipe[]>>(apiRoutes.cakeRecipe.getAll, {
        params: {
          noPagination,
          page: currentPage,
          isDeleted: currentStatusFilter === "all" ? undefined : currentStatusFilter,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch recipes", error);
      return null;
    }
  };

  const getListCakesUseRecipe = () => {
    if (!selectedId) return setlistCakesUseRecipe([]);

    staffAxios
      .get<IAPIResponse<ICake[]>>(apiRoutes.cakeRecipe.getListCakeUseRecipe(selectedId))
      .then((response) => response.data)
      .then((response) => {
        setlistCakesUseRecipe(response.results);
      });
  };

  const handleHardDeleteRecipe = (onClose: () => void) => {
    staffAxios
      .delete<IAPIResponse<IRecipe[]>>(apiRoutes.cakeRecipe.delete(selectedId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
          list.reload();
        }
      })
      .catch((error) => {
        const { data } = error.response;
        toast.error(data.message);
      })
      .finally(() => onClose());
  };

  const handleSoftDeleteRecipe = (onClose: () => void) => {
    staffAxios
      .patch<IAPIResponse>(apiRoutes.cakeRecipe.softDelete(selectedId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
          list.reload();
        }
      })
      .catch((error) => {
        const { data } = error.response;
        toast.error(data.message);
      })
      .finally(() => onClose());
  };

  const handleRecoverRecipe = (onClose: () => void) => {
    staffAxios
      .patch<IAPIResponse>(apiRoutes.cakeRecipe.recover(selectedId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
          list.reload();
        }
      })
      .catch((error) => {
        const { data } = error.response;
        toast.error(data.message);
      })
      .finally(() => onClose());
  };

  const handleSearchTerm = (searchTerm: string) => {
    const filtered = searchTerm
      ? listAllCakeRecipes.filter((recipe) =>
          recipe.recipeName.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : listAllCakeRecipes.slice(0, 10);
    setListRecipes(filtered);
    setSearchTerm(searchTerm);
  };

  const list = useAsyncList({
    async load() {
      setIsLoading(true);
      const [recipes, allRecipes] = await Promise.all([getListRecipe(), getListRecipe(true)]);
      setIsLoading(false);
      setMetadata(recipes!.metadata);
      setListRecipes(recipes!.results);
      setListAllCakeRecipes(allRecipes!.results);
      return {
        items: recipes?.results || [],
      };
    },
    async sort({ items, sortDescriptor }) {
      const key = sortDescriptor.column as keyof IRecipe;
      const sortedItems = [...items].sort((a, b) => {
        const first = a[key];
        const second = b[key];

        if (first === undefined || second === undefined) return first === undefined ? -1 : 1;
        const firstValue = typeof first === "string" ? parseInt(first) || first : first;
        const secondValue = typeof second === "string" ? parseInt(second) || second : second;

        const cmp = firstValue < secondValue ? -1 : 1;
        return sortDescriptor.direction === "descending" ? -cmp : cmp;
      });
      return { items: sortedItems };
    },
  });

  useEffect(() => {
    list.reload();
  }, [currentPage, currentStatusFilter]);

  useEffect(() => {
    getListCakesUseRecipe();
  }, [selectedId]);

  recipeRef.current = list;
  const data = searchTerm !== "" ? listRecipes : recipeRef.current.items;

  return (
    <WrapperContainer>
      <AdminHeader title="Quản lí công thức bánh" />
      <Modal
        isOpen={isOpen}
        onOpenChange={() => {
          setlistCakesUseRecipe([]);
          onOpenChange();
        }}
        placement="top"
        size={"5xl"}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h4>
                  {currentAction === "recover" ? "Xác nhận KHÔI PHỤC CÔNG THỨC" : "Xác nhận XÓA CÔNG THỨC"}
                </h4>
              </ModalHeader>
              <ModalBody>
                <div className={"flex flex-col gap-4"}>
                  {!currentAction ? (
                    <Loading />
                  ) : currentAction === "softDel" ? (
                    <SoftDeleteModalContent listCakesUseRecipe={listCakesUseRecipe} />
                  ) : currentAction === "recover" ? (
                    <p className={"italic"}>Bạn có chắc chắn muốn khôi phục lại công thức này?</p>
                  ) : (
                    <p className={"italic text-danger"}>Bạn có chắc chắn muốn xóa vĩnh viễn công thức này?</p>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="flat" onPress={onClose}>
                  Hủy
                </Button>
                <Button
                  color={currentAction === "recover" ? "success" : "danger"}
                  onPress={() =>
                    currentAction === "softDel"
                      ? handleSoftDeleteRecipe(onClose)
                      : currentAction === "recover"
                        ? handleRecoverRecipe(onClose)
                        : handleHardDeleteRecipe(onClose)
                  }
                >
                  {currentAction === "softDel"
                    ? "Xóa"
                    : currentAction === "recover"
                      ? "Khôi phục"
                      : "Xóa vĩnh viễn"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex justify-between">
        <Input
          size="lg"
          variant="bordered"
          className="max-w-80"
          endContent={<div className="text-default-300">{iconConfig.search.medium}</div>}
          placeholder="Nhập tên công thức"
          onValueChange={handleSearchTerm}
          value={searchTerm}
        />

        <div className="flex items-center gap-x-4">
          <Pagination
            showControls
            showShadow
            color="primary"
            total={metadata?.totalPages ?? 1}
            page={metadata?.currentPage}
            onChange={setCurrentPage}
            className={"min-w-max"}
          />
          <Select
            label={"Trạng thái:"}
            labelPlacement={"outside-left"}
            classNames={{ label: "min-w-max text-base", base: "items-center", mainWrapper: " min-w-36" }}
            selectedKeys={[currentStatusFilter]}
            onSelectionChange={(e) => setCurrentStatusFilter(Array.from(e).join(""))}
            size={"lg"}
            disallowEmptySelection={true}
          >
            <SelectItem key={"all"}>Tất cả</SelectItem>
            <SelectItem key={"false"}>Đang hoạt động</SelectItem>
            <SelectItem key={"true"}>Bị xóa</SelectItem>
          </Select>
          <Button
            size="lg"
            color="primary"
            startContent={iconConfig.add.base}
            onClick={() => navigate(adminRoutes.cakeRecipe.create)}
            className={"min-w-max"}
          >
            Thêm mới
          </Button>
        </div>
      </div>
      <Table
        aria-label="Table show all cake recipes"
        sortDescriptor={list.sortDescriptor}
        onSortChange={list.sort}
        className="mt-4"
        removeWrapper
      >
        <TableHeader columns={TableColumnsRecipe}>
          {(column) => (
            <TableColumn
              align={
                ["recipeServings", "creator", "cookTime", "recipeType"].includes(column.key)
                  ? "center"
                  : "start"
              }
              key={column.key}
              allowsSorting={!["index", "action", "cookTime "].includes(column.key)}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={isLoading ? <Loading /> : <p className={"italic"}>Không tìm thấy công thức nào</p>}
        >
          {data.map((recipe, index) => (
            <TableRow key={index}>
              <TableCell>{index + (currentPage - 1) * 10 + 1}</TableCell>
              <TableCell>{recipe.recipeName}</TableCell>
              <TableCell>
                <Chip
                  color={"danger"}
                  startContent={iconConfig.foodRation.medium}
                  className={"py-1"}
                  classNames={{
                    base: "gap-1 ",
                  }}
                >
                  {recipe.recipeServings} người
                </Chip>
              </TableCell>
              <TableCell>
                <Chip
                  color={"danger"}
                  startContent={iconConfig.cookingTime.medium}
                  className={"py-1"}
                  classNames={{
                    base: "gap-1 ",
                  }}
                >
                  {formatHours(recipe.cookTime)}
                </Chip>
              </TableCell>
              <TableCell>{recipe.creatorId}</TableCell>
              <TableCell>
                <Chip color={MapRecipeTypeColor[recipe.recipeVariants.length > 0 ? "true" : "false"]}>
                  {MapRecipeTypeText[recipe.recipeVariants.length > 0 ? "true" : "false"]}
                </Chip>
              </TableCell>
              <TableCell>
                <Chip color={MapRecipeStatusColor[recipe.isDeleted.toString()]} variant={"flat"}>
                  {MapRecipeStatusText[recipe.isDeleted.toString()]}
                </Chip>
              </TableCell>
              <TableCell>
                <div className={"flex items-center gap-1"}>
                  <Button
                    color={"secondary"}
                    isIconOnly
                    variant={"ghost"}
                    onClick={() => navigate(adminRoutes.cakeRecipe.details(recipe._id as string))}
                  >
                    {iconConfig.details.base}
                  </Button>
                  {recipe.isDeleted ? (
                    <>
                      <Button
                        color={"success"}
                        isIconOnly
                        onClick={() => {
                          setSelectedId(recipe._id ?? "");
                          setCurrentAction("recover");
                          onOpen();
                        }}
                      >
                        {iconConfig.reset.base}
                      </Button>
                      <Button
                        color={"danger"}
                        isIconOnly
                        onClick={() => {
                          setSelectedId(recipe._id ?? "");
                          setCurrentAction("hardDel");
                          onOpen();
                        }}
                      >
                        {iconConfig.deleteAll.base}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        color={"warning"}
                        isIconOnly
                        variant={"ghost"}
                        onClick={() => navigate(adminRoutes.cakeRecipe.edit(recipe._id as string))}
                      >
                        {iconConfig.edit.base}
                      </Button>
                      <Button
                        color={"danger"}
                        isIconOnly
                        variant={"ghost"}
                        onClick={() => {
                          setSelectedId(recipe._id ?? "");
                          setCurrentAction("softDel");
                          onOpen();
                        }}
                      >
                        {iconConfig.delete.base}
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </WrapperContainer>
  );
};

export default CakeRecipeManagement;
