import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";

import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useRole from "@/hooks/useRole";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { ICake } from "@/types/cake";
import { ICategory } from "@/types/category";
import { displayImage } from "@/utils/display-image";
import { formatDate } from "@/utils/format-date";
import {
  MapCakeStatusColor,
  MapCakeStatusText,
  MapCakeTypeColor,
  MapCakeTypeText,
} from "@/utils/map-data/cakes";
import { formatCurrencyVND } from "@/utils/money-format";
import { slugify } from "@/utils/slugify";
import {
  Button,
  Chip,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CakesManagement = () => {
  const navigate = useNavigate();

  const currentStaffRole = useRole();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [listCakes, setListCakes] = useState<ICake[]>([]);
  const [listAllCakes, setListAllCakes] = useState<ICake[]>([]);
  const [metadata, setMetadata] = useState<IPaginationMetadata>();
  const [listCategories, setListCategories] = useState<ICategory[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string>("");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentStatusFilter, setCurrentStatusFilter] = useState<string>("all");
  const [currentCategoryFilter, setCurrentCategoryFilter] = useState<string>("");

  const [currentAction, setCurrentAction] = useState<"recover" | "softDel" | "hardDel">();

  const staffAxios = useStaffAxios();

  const getListCakes = (noPagination: boolean = false) => {
    return staffAxios
      .get<IAPIResponse<ICake[]>>(apiRoutes.cakes.getAll, {
        params: {
          noPagination,
          page: currentPage,
          isHide: currentStatusFilter !== "all" ? currentStatusFilter : undefined,
          cakeCategory: currentCategoryFilter !== "" ? currentCategoryFilter : undefined,
        },
      })
      .then((response) => response.data);
  };

  const getListCategories = () => {
    return staffAxios
      .get<IAPIResponse<ICategory[]>>(apiRoutes.categories.getAll, {
        params: { noPagination: true },
      })
      .then((response) => response.data)
      .then((response) => {
        setListCategories(response.results);
      });
  };

  const handleSoftDeleteCake = (onClose: () => void) => {
    staffAxios
      .patch(apiRoutes.cakes.softDelete(selectedDeleteId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          handleFetch();
          toast.success(response.message);
          setSelectedDeleteId("");
        }
      })
      .catch((error) => {
        const { data } = error.response;
        toast.error(data.message);
      })
      .finally(() => onClose());
  };

  const handleRecoverCake = (onClose: () => void) => {
    staffAxios
      .patch(apiRoutes.cakes.recover(selectedDeleteId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          handleFetch();
          toast.success(response.message);
          setSelectedDeleteId("");
        }
      })
      .catch((error) => {
        const { data } = error.response;
        toast.error(data.message);
      })
      .finally(() => onClose());
  };
  const handleHardDeleteCake = (onClose: () => void) => {
    staffAxios
      .delete(apiRoutes.cakes.delete(selectedDeleteId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          handleFetch();
          toast.success(response.message);
          setSelectedDeleteId("");
        }
      })
      .catch((error) => {
        const { data } = error.response;
        toast.error(data.message);
      })
      .finally(() => onClose());
  };

  const handleSearchCake = (searchString: string) => {
    if (searchString === "") {
      return setListCakes(listAllCakes.slice(0, 10));
    }
    const filtered = listAllCakes.filter((cake) =>
      cake.cakeName.toLowerCase().includes(searchString.toLowerCase()),
    );
    setListCakes(filtered);
  };

  const handleFetch = () => {
    setListCakes([]);
    setListAllCakes([]);
    setIsLoading(true);
    Promise.all([getListCakes(), getListCakes(true), getListCategories()])
      .then(([cakes, allCakes]) => {
        setListCakes(cakes.results);
        setListAllCakes(allCakes.results);
        setMetadata(cakes.metadata);
      })
      .catch((error) => {
        const { data } = error.response;
        setListAllCakes(data.results);
        setListCakes(data.results);
        setMetadata(data.metadata);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    handleFetch();
  }, [currentPage, currentStatusFilter, currentCategoryFilter]);

  useEffect(() => {
    console.log(currentCategoryFilter);
  }, [currentCategoryFilter]);
  return (
    <WrapperContainer>
      <AdminHeader title="Quản lí sản phẩm" />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top" size={"5xl"}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h4>
                  {currentAction === "recover" ? "Xác nhận KHÔI PHỤC SẢN PHẨM" : "Xác nhận XÓA SẢN PHẨM"}
                </h4>
              </ModalHeader>
              <ModalBody>
                <div className={"flex flex-col gap-4"}>
                  {!currentAction ? (
                    <Loading />
                  ) : currentAction === "softDel" ? (
                    <div className={"flex flex-col gap-2"}>
                      <h4 className={"italic"}>Thao tác xóa sản phẩm sẽ kèm theo các hành động sau:</h4>
                      <p className={"text-lg italic text-danger"}>
                        1. Nếu <strong>SẢN PHẨM</strong> này đang là <strong>SẢN PHẨM KINH DOANH</strong> của
                        một chi nhánh, sản phẩm sẽ bị xóa ra khỏi{" "}
                        <strong>DANH SÁCH SẢN PHẨM KINH DOANH</strong>
                      </p>
                      <p className={"text-lg italic text-danger"}>
                        2. Nếu <strong>SẢN PHẨM</strong> này đang có ở trong{" "}
                        <strong className="text-danger">KHO của bất kì chi nhánh nào</strong>, sản phẩm sẽ bị
                        xóa ra khỏi <strong className="text-danger">KHO CỦA CHI NHÁNH</strong>
                      </p>
                    </div>
                  ) : currentAction === "recover" ? (
                    <p className={"italic"}>Bạn có chắc chắn muốn khôi phục lại sản phẩm này?</p>
                  ) : (
                    <p className={"italic text-danger"}>Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này?</p>
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
                      ? handleSoftDeleteCake(onClose)
                      : currentAction === "recover"
                        ? handleRecoverCake(onClose)
                        : handleHardDeleteCake(onClose)
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
          endContent={<div className="text-dark/25">{iconConfig.search.medium}</div>}
          onValueChange={handleSearchCake}
          placeholder="Nhập tên sản phẩm"
        />
        <div className="flex items-center gap-x-4">
          <Pagination
            showControls
            showShadow
            color="primary"
            total={metadata?.totalPages ?? 1}
            page={metadata?.currentPage ?? 1}
            onChange={setCurrentPage}
          />
          <div className={"flex min-w-max items-center gap-2"}>
            <Select
              label={"Trạng thái:"}
              labelPlacement={"outside-left"}
              selectedKeys={[currentStatusFilter?.toString()]}
              onSelectionChange={(e) => setCurrentStatusFilter(Array.from(e).join(""))}
              className={"min-w-48"}
              size={"lg"}
              disallowEmptySelection={true}
              classNames={{
                label: "min-w-max text-base",
                base: "items-center",
                mainWrapper: "min-w-48",
              }}
            >
              <SelectItem key={"all"}>Tất cả</SelectItem>
              <SelectItem key={"false"}>Đang mở bán</SelectItem>
              <SelectItem key={"true"}>Chưa mở bán</SelectItem>
            </Select>
            <Select
              label={"Danh mục:"}
              labelPlacement={"outside-left"}
              selectedKeys={[currentCategoryFilter?.toString()]}
              onSelectionChange={(e) => setCurrentCategoryFilter(Array.from(e).join(""))}
              className={"min-w-48"}
              size={"lg"}
              placeholder={"Tất cả"}
              classNames={{
                label: "min-w-max text-base",
                base: "items-center",
                mainWrapper: "min-w-48",
              }}
            >
              {/* <SelectItem key={"all"}>Tất cả</SelectItem> */}
              {listCategories.map((category) => (
                <SelectItem key={category.categoryKey}>{category.categoryName}</SelectItem>
              ))}
            </Select>
          </div>
          <Button
            size="lg"
            color="primary"
            startContent={iconConfig.add.medium}
            onClick={() => navigate(adminRoutes.cakes.create)}
          >
            Thêm mới
          </Button>
        </div>
      </div>
      <Table aria-label="Table show all products" className="mt-4" removeWrapper>
        <TableHeader>
          <TableColumn align={"center"}>STT</TableColumn>
          <TableColumn>HÌNH ẢNH</TableColumn>
          <TableColumn>TÊN SẢN PHẨM</TableColumn>
          <TableColumn align={"center"} className={"max-lg:hidden"}>
            SỐ LƯỢNG BÁN
          </TableColumn>
          <TableColumn align={"center"}>LOẠI BÁNH</TableColumn>
          <TableColumn align={"center"}>DANH MỤC</TableColumn>
          <TableColumn align={"center"}>TRẠNG THÁI</TableColumn>
          <TableColumn align={"center"}>GIÁ</TableColumn>

          <TableColumn align={"center"} className={"max-xl:hidden"}>
            NGƯỜI TẠO
          </TableColumn>
          <TableColumn align={"center"}>HÀNH ĐỘNG</TableColumn>
        </TableHeader>
        <TableBody emptyContent={isLoading ? <Loading /> : <p className={"italic"}>Không có sản phẩm nào</p>}>
          {listCakes.map((cake, index) => (
            <TableRow key={index}>
              <TableCell>{index + (currentPage - 1) * 10 + 1}</TableCell>
              <TableCell>
                <Image
                  src={cake.cakeThumbnail && displayImage(cake.cakeThumbnail, cake._id)}
                  fallbackSrc={"https://placehold.co/400"}
                  width={60}
                  height={60}
                  alt={slugify(cake.cakeName)}
                  className="object-contain"
                />
              </TableCell>
              <TableCell>{cake.cakeName}</TableCell>
              <TableCell className="max-lg:hidden">
                <Chip color={"warning"}>{cake.soldCount}</Chip>
              </TableCell>
              <TableCell>
                <Chip color={MapCakeTypeColor[cake.cakeVariants.length > 0 ? "true" : "false"]}>
                  {MapCakeTypeText[cake.cakeVariants.length > 0 ? "true" : "false"]}
                </Chip>
              </TableCell>
              <TableCell>{cake.cakeCategory}</TableCell>
              <TableCell>
                {cake.isDeleted ? (
                  <Chip color={"danger"}>Đã bị xóa</Chip>
                ) : (
                  <Chip color={MapCakeStatusColor[cake.isHide.toString()]}>
                    {MapCakeStatusText[cake.isHide.toString()]}
                  </Chip>
                )}
              </TableCell>
              <TableCell>
                <Tooltip
                  showArrow={true}
                  content={cake.discountPercents !== 0 ? `Giảm ${cake.discountPercents}%` : `Giảm 0%`}
                >
                  <div className={"flex items-center justify-center gap-1"}>
                    <p
                      className={clsx("font-semibold", {
                        "text-dark/25 line-through": cake.discountPercents !== 0,
                        "text-primary": cake.discountPercents === 0,
                      })}
                    >
                      {formatCurrencyVND(cake.cakeDefaultPrice)}
                    </p>
                    {cake.discountPercents !== 0 && (
                      <>
                        <p>-</p>
                        <p className={"font-semibold text-primary"}>
                          {formatCurrencyVND(cake.cakeDefaultPrice, cake.discountPercents)}
                        </p>
                      </>
                    )}
                  </div>
                </Tooltip>
              </TableCell>
              <TableCell className={`text-center max-xl:hidden`}>{cake.creatorId}</TableCell>
              <TableCell>
                <div className={"flex items-center justify-center gap-1"}>
                  <Button
                    isIconOnly
                    variant={"ghost"}
                    color={"secondary"}
                    onClick={() => navigate(adminRoutes.cakes.details(cake._id))}
                  >
                    {iconConfig.details.base}
                  </Button>
                  {currentStaffRole === 2 &&
                    (cake.isDeleted ? (
                      <>
                        <Button
                          isIconOnly
                          color={"success"}
                          onClick={() => {
                            setSelectedDeleteId(cake._id);
                            setCurrentAction("recover");
                            onOpen();
                          }}
                        >
                          {iconConfig.reset.base}
                        </Button>
                        <Button
                          isIconOnly
                          color="danger"
                          onClick={() => {
                            setSelectedDeleteId(cake._id);
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
                          isIconOnly
                          variant={"ghost"}
                          color={"warning"}
                          onClick={() => navigate(adminRoutes.cakes.edit(cake._id))}
                        >
                          {iconConfig.edit.base}
                        </Button>
                        <Button
                          isIconOnly
                          color="danger"
                          variant={"ghost"}
                          onClick={() => {
                            setSelectedDeleteId(cake._id);
                            setCurrentAction("softDel");
                            onOpen();
                          }}
                        >
                          {iconConfig.delete.base}
                        </Button>
                      </>
                    ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </WrapperContainer>
  );
};

export default CakesManagement;
