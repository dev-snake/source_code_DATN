import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import ModalConfirmDelete from "@/components/admin/modal-confirm-delete";
import WrapperContainer from "@/components/admin/wrapper-container";
import CakeCard from "@/components/cakes/cake-card";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { ICake } from "@/types/cake";
import { ICategory } from "@/types/category";
import useHandleTokenExpiration from "@/utils/token-expired";
import {
  Button,
  ButtonProps,
  Checkbox,
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
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CakeItem from "../branches-management/branch-details/branch-products/cake-item";
import { MapCategoryStatusColor, MapCategoryStatusText } from "@/utils/map-data/categories";

const SoftDeleteModalContent = ({ listCakesInCategory }: { listCakesInCategory: ICake[] }) => {
  return (
    <>
      <div className={"flex flex-col gap-4"}>
        <h4>Lưu ý:</h4>
        <p className={"text-lg italic text-danger"}>
          Khi xóa <strong>DANH MỤC NÀY</strong>, các <strong>SẢN PHẨM BÁNH</strong> thuộc{" "}
          <strong>DANH MỤC</strong> sẽ bị <strong>ẨN</strong> và <strong>KHÔNG THỂ KINH DOANH</strong>, bạn
          chắc chắn muốn xóa chứ?
        </p>
      </div>
      <div className={"flex flex-col gap-4"}>
        <h4>Các sản phẩm thuộc danh mục:</h4>
        <ScrollShadow className={"flex flex-col gap-2"}>
          {listCakesInCategory.length > 0 ? (
            listCakesInCategory.map((cake) => <CakeItem cakeData={cake} />)
          ) : (
            <p className={"italic"}>Danh mục này không có sản phẩm nào</p>
          )}
        </ScrollShadow>
      </div>
    </>
  );
};

const CategoriesManagement = () => {
  const navigate = useNavigate();

  const staffAxios = useStaffAxios();

  const handleTokenExpiration = useHandleTokenExpiration();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedId, setSelectedId] = useState<string>("");

  const [listCategories, setListCategories] = useState<ICategory[]>([]);
  const [listAllCategories, setListAllCategories] = useState<ICategory[]>([]);
  const [listCakesInCategory, setListCakesInCategory] = useState<ICake[]>([]);
  const [metadata, setMetadata] = useState<IPaginationMetadata>();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [currentFilterStatus, setCurrentFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentAction, setCurrentAction] = useState<"recover" | "softDel" | "hardDel">();
  const getListCategories = (noPagination: boolean = false) => {
    return staffAxios
      .get<IAPIResponse<ICategory[]>>(apiRoutes.categories.getAll, {
        params: {
          page: currentPage,
          noPagination,
          isActive: currentFilterStatus === "all" ? undefined : currentFilterStatus,
        },
      })
      .then((response) => response.data);
  };

  const handleSoftDeleteCategory = (onClose: () => void) => {
    staffAxios
      .patch<IAPIResponse>(apiRoutes.categories.softDelete(selectedId))
      .then((response) => response.data)
      .then((response) => {
        console.log(response);
        if (response.status === "success") {
          toast.success(response.message);
          setListCakesInCategory([]);
          setSelectedId("");
          handleFetch();
          onClose();
        }
      })
      .catch((error: any) => {
        const { data } = error.response;

        toast.error(data.message);
      });
    onClose();
  };

  const handleHardDeleteCategory = (onClose: () => void) => {
    staffAxios
      .delete<IAPIResponse>(apiRoutes.categories.delete(selectedId))
      .then((response) => response.data)
      .then((response) => {
        console.log(response);
        if (response.status === "success") {
          toast.success(response.message);
          setListCakesInCategory([]);
          setSelectedId("");
          handleFetch();
        }
      })
      .catch((error: any) => {
        const { data } = error.response;

        toast.error(data.message);
      })
      .finally(() => onClose());
  };

  const handleRecoverDeleteCategory = (onClose: () => void) => {
    staffAxios
      .patch<IAPIResponse>(apiRoutes.categories.recover(selectedId))
      .then((response) => response.data)
      .then((response) => {
        console.log(response);
        if (response.status === "success") {
          toast.success(response.message);
          handleFetch();
        }
      })
      .catch((error: any) => {
        const { data } = error.response;
        toast.error(data.message);
      })
      .finally(() => onClose());
  };

  const handlerSearch = (searchString: string) => {
    if (searchString === "") {
      setListCategories(listAllCategories.slice(0, 10));
    } else {
      const filtered = listAllCategories.filter((category) =>
        category.categoryName.toLowerCase().includes(searchString.toLowerCase()),
      );
      setListCategories(filtered);
    }
  };

  const getListCakesInCategory = (categoryId: string) => {
    return staffAxios
      .get<IAPIResponse<ICake[]>>(apiRoutes.categories.cakes(categoryId))
      .then((response) => response.data)
      .then((response) => {
        setListCakesInCategory(response.results);
      });
  };

  const handleFetch = () => {
    setListCategories([]);
    setListAllCategories([]);
    setIsLoading(true);
    Promise.all([getListCategories(), getListCategories(true)])
      .then(([categories, allCategories]) => {
        setListCategories(categories.results);
        setListAllCategories(allCategories.results);
        setMetadata(categories.metadata);
      })
      .catch((error) => {
        const { data } = error.response;
        setListCategories(data.results);
        setListAllCategories(data.results);
        setMetadata(data.metadata);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (selectedId === "") return setListCakesInCategory([]);
    getListCakesInCategory(selectedId);
  }, [selectedId]);

  useEffect(() => {
    handleFetch();
  }, [currentPage, currentFilterStatus]);

  return (
    <WrapperContainer>
      <AdminHeader title="Quản lí danh mục" />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top" size={"5xl"}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h4>
                  {currentAction === "recover" ? "Xác nhận KHÔI PHỤC DANH MỤC" : "Xác nhận XÓA DANH MỤC"}
                </h4>
              </ModalHeader>
              <ModalBody>
                <div className={"flex flex-col gap-4"}>
                  {!currentAction ? (
                    <Loading />
                  ) : currentAction === "softDel" ? (
                    <SoftDeleteModalContent listCakesInCategory={listCakesInCategory} />
                  ) : currentAction === "recover" ? (
                    <p className={"text-lg italic"}>Bạn có chắc chắn muốn khôi phục lại danh mục này?</p>
                  ) : (
                    <p className={"italic text-danger"}>Bạn có chắc chắn muốn xóa vĩnh viễn danh mục này?</p>
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
                      ? handleSoftDeleteCategory(onClose)
                      : currentAction === "recover"
                        ? handleRecoverDeleteCategory(onClose)
                        : handleHardDeleteCategory(onClose)
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
          onValueChange={handlerSearch}
          endContent={<div className="text-dark/25">{iconConfig.search.medium}</div>}
          placeholder="Nhập khóa | tên danh mục"
        />
        <div className="flex items-center gap-4">
          <Pagination
            showControls
            showShadow
            color="primary"
            total={metadata?.totalPages ?? 1}
            onChange={setCurrentPage}
          />
          <div className={"flex min-w-max items-center gap-2"}>
            <p className={"min-w-max"}>Trạng thái:</p>
            <Select
              aria-label={"Select filter status"}
              selectedKeys={[currentFilterStatus?.toString()]}
              onSelectionChange={(e) => setCurrentFilterStatus(Array.from(e).join(""))}
              className={"min-w-48"}
              size={"lg"}
              disallowEmptySelection={true}
            >
              <SelectItem key={"all"}>Tất cả</SelectItem>
              <SelectItem key={"true"}>Đang hoạt động</SelectItem>
              <SelectItem key={"false"}>Đang ẩn</SelectItem>
            </Select>
          </div>

          <Button
            size="lg"
            color="primary"
            startContent={iconConfig.add.medium}
            onClick={() => navigate(adminRoutes.category.create)}
          >
            Thêm mới
          </Button>
        </div>
      </div>
      <Table aria-label="Table show all products" className="mt-4" removeWrapper>
        <TableHeader>
          <TableColumn className={"text-center"}>STT</TableColumn>
          <TableColumn>MÃ DANH MỤC</TableColumn>
          <TableColumn>TÊN DANH MỤC</TableColumn>
          <TableColumn className={"text-center"}>TRẠNG THÁI</TableColumn>
          <TableColumn className={"text-center"}>NGƯỜI TẠO</TableColumn>
          <TableColumn className={"text-center"}>HÀNH ĐỘNG</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={isLoading ? <Loading /> : <p className={"italic"}>Không tìm thấy danh mục nào</p>}
        >
          {!!listCategories && listCategories.length > 0
            ? listCategories.map((category, index) => (
                <TableRow key={index}>
                  <TableCell className={"text-center"}>{index + (currentPage - 1) * 10 + 1}</TableCell>
                  <TableCell>{category.categoryKey}</TableCell>
                  <TableCell>{category.categoryName}</TableCell>
                  <TableCell className={"text-center"}>
                    {category.isDeleted ? (
                      <Chip variant={"flat"} color={"danger"}>
                        Đã bị xóa
                      </Chip>
                    ) : (
                      <Chip variant={"flat"} color={MapCategoryStatusColor[category.isActive.toString()]}>
                        {MapCategoryStatusText[category.isActive.toString()]}
                      </Chip>
                    )}
                  </TableCell>
                  <TableCell className={"text-center"}>{category.creatorId}</TableCell>
                  <TableCell className={"text-center"}>
                    <div className={"flex items-center justify-center gap-1"}>
                      <Button
                        color={"secondary"}
                        isIconOnly
                        variant={"ghost"}
                        onClick={() => navigate(adminRoutes.category.details(category._id))}
                      >
                        {iconConfig.details.base}
                      </Button>
                      {category.isDeleted ? (
                        <>
                          <Button
                            color={"success"}
                            isIconOnly
                            onClick={() => {
                              setCurrentAction("recover");
                              setSelectedId(category._id);
                              onOpen();
                            }}
                          >
                            {iconConfig.reset.base}
                          </Button>
                          <Button
                            color={"danger"}
                            isIconOnly
                            onClick={() => {
                              setCurrentAction("hardDel");
                              setSelectedId(category._id);
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
                            onClick={() => navigate(adminRoutes.category.edit(category._id))}
                          >
                            {iconConfig.edit.base}
                          </Button>
                          <Button
                            color={"danger"}
                            isIconOnly
                            variant={"ghost"}
                            onClick={() => {
                              setSelectedId(category._id);
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
              ))
            : []}
        </TableBody>
      </Table>
    </WrapperContainer>
  );
};

export default CategoriesManagement;
