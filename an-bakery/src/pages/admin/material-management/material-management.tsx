import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig, { iconSize } from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import textSizes from "@/config/styles/text-size";
import useAxios from "@/hooks/useAxios";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { IMaterial } from "@/types/material";
import { IRecipe } from "@/types/recipe";
import { MapMaterialTypeText, MapMaterialTypeColor } from "@/utils/map-data/materials";
import {
  Button,
  Chip,
  ChipProps,
  Divider,
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
import { BiPlus, BiSearchAlt } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SoftDeleteModalContent = ({ listRecipes }: { listRecipes: IRecipe[] }) => {
  const navigate = useNavigate();

  return (
    <div className={"flex flex-col gap-2"}>
      <h4>Lưu ý, khi xóa nguyên liệu này sẽ kèm theo các hành động sau:</h4>
      <p className={"text-lg italic text-danger"}>
        - Nếu <strong>NGUYÊN LIỆU NÀY ĐANG CÒN TỒN TRONG KHO</strong> của các chi nhánh,{" "}
        <strong>TOÀN BỘ KHỐI LƯỢNG ĐANG CÒN</strong> sẽ bị chuyển sang
        <strong>TRẠNG THÁI HẾT HẠN</strong>
      </p>
      <Divider />
      <h6>Điều kiện để xóa nguyên liệu:</h6>
      <p className={"italic text-danger"}>
        - <strong>NGUYÊN LIỆU ĐANG KHÔNG ĐƯỢC SỬ DỤNG TRONG BẤT KỲ CÔNG THỨC NÀO</strong>
      </p>
      <p className={"italic text-danger"}>
        - <strong>KHÔNG CÓ YÊU CẦU NHẬP HÀNG CHƯA HOÀN THÀNH</strong> nào liên quan đến nguyên liệu này
      </p>
      <Divider />

      <h6>Các các công thức sử dụng nguyên liệu:</h6>
      <ScrollShadow className={"flex flex-col gap-1"}>
        {listRecipes.length > 0 ? (
          listRecipes.map((recipe) => {
            return (
              <Link to={adminRoutes.cakeRecipe.details(recipe._id ?? "")} target="_blank">
                <div
                  key={recipe._id}
                  className={"flex w-full items-center justify-between rounded-2xl border p-2"}
                >
                  <p>{recipe.recipeName}</p>
                  <p>{iconConfig.next.base}</p>
                </div>
              </Link>
            );
          })
        ) : (
          <p className={"italic"}>Nguyên liệu này chưa được sử dụng trong công thức nào</p>
        )}
      </ScrollShadow>
    </div>
  );
};

const MaterialManagement = () => {
  const navigate = useNavigate();
  const axiosClient = useAxios();
  const axiosStaff = useStaffAxios();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedId, setSelectedId] = useState<string>("");
  const [listMaterials, setListMaterials] = useState<IMaterial[]>([]);
  const [listAllMaterials, setListAllMaterials] = useState<IMaterial[]>([]);
  const [metadata, setMetadata] = useState<IPaginationMetadata>();
  const [listRecipes, setListRecipes] = useState<IRecipe[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentTypeFilter, setCurrentTypeFilter] = useState<string>("all");
  const [currentStatusFilter, setCurrentStatusFilter] = useState<string>("all");
  const [currentAction, setCurrentAction] = useState<"softDel" | "hardDel" | "recover">();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getListMaterials = (noPagination: boolean = false) => {
    return axiosClient
      .get<
        IAPIResponse<IMaterial[]>
      >(apiRoutes.materials.getAll, { params: { page: currentPage, noPagination, materialType: currentTypeFilter === "all" ? undefined : currentTypeFilter, isDeleted: currentStatusFilter === "all" ? undefined : currentStatusFilter } })
      .then((response) => response.data);
  };

  const handleFetch = () => {
    setListMaterials([]);
    setListAllMaterials([]);
    setIsLoading(true);
    Promise.all([getListMaterials(), getListMaterials(true)])
      .then(([materials, allMaterials]) => {
        setListMaterials(materials.results);
        setListAllMaterials(allMaterials.results);
        setMetadata(materials.metadata);
      })
      .catch((error) => {
        const { data } = error.response;
        setListMaterials(data.results);
        setListAllMaterials(data.results);
        setMetadata(data.metadata);
      })
      .finally(() => setIsLoading(false));
  };

  const handleHardDeleteMaterial = (onClose: () => void) => {
    onClose();
    axiosStaff
      .delete<IAPIResponse>(apiRoutes.materials.delete(selectedId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          handleFetch();
          toast.success(response.message);
        }
      })

      .catch((error) => {
        const { data } = error.response;
        toast.error(data.message);
      })
      .finally(() => onClose());
  };

  const handleSoftDeleteMaterial = (onClose: () => void) => {
    onClose();
    axiosStaff
      .patch<IAPIResponse>(apiRoutes.materials.softDelete(selectedId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
          setSelectedId("");
          handleFetch();
        }
      })
      .catch((error) => {
        const { data } = error.response;
        toast.error(data.message);
      })
      .finally(() => onClose());
  };

  const handleRecoverMaterial = (onClose: () => void) => {
    onClose();
    axiosStaff
      .patch<IAPIResponse>(apiRoutes.materials.recover(selectedId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
          setSelectedId("");
          handleFetch();
        }
      })
      .catch((error) => {
        const { data } = error.response;
        toast.error(data.message);
      })
      .finally(() => onClose());
  };

  const getListRecipesUsingMaterial = () => {
    if (selectedId === "") return setListRecipes([]);

    axiosStaff
      .get(apiRoutes.materials.getListRecipes(selectedId))
      .then((response) => response.data)
      .then((response) => {
        setListRecipes(response.results);
      });
  };

  const handleSearchChange = (searchString: string) => {
    if (searchString === "") {
      setListMaterials(listAllMaterials.slice(0, 10));
    } else {
      const filtered = listAllMaterials.filter((material) =>
        material.materialName.toLowerCase().includes(searchString.toLowerCase()),
      );
      setListMaterials(filtered);
    }
  };

  useEffect(() => {
    handleFetch();
  }, [currentPage, currentTypeFilter, currentStatusFilter]);

  useEffect(() => {
    getListRecipesUsingMaterial();
  }, [selectedId]);

  return (
    <WrapperContainer>
      <AdminHeader title="Quản lí nguyên liệu" refBack="" />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top" size={"5xl"}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h4>
                  {currentAction === "recover"
                    ? "Xác nhận KHÔI PHỤC NGUYÊN LIỆU"
                    : "Xác nhận XÓA NGUYÊN LIỆU"}
                </h4>
              </ModalHeader>
              <ModalBody>
                <div className={"flex flex-col gap-4"}>
                  {!currentAction ? (
                    <Loading />
                  ) : currentAction === "softDel" ? (
                    <SoftDeleteModalContent listRecipes={listRecipes}></SoftDeleteModalContent>
                  ) : currentAction === "recover" ? (
                    <p className={"text-lg italic"}>Bạn có chắc chắn muốn khôi phục lại nguyên liệu này?</p>
                  ) : (
                    <p className={"text-lg italic text-danger"}>
                      Bạn có chắc chắn muốn xóa vĩnh viễn nguyên liệu này?
                    </p>
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
                      ? handleSoftDeleteMaterial(onClose)
                      : currentAction === "recover"
                        ? handleRecoverMaterial(onClose)
                        : handleHardDeleteMaterial(onClose)
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

      <div className={"flex flex-col gap-4"}>
        <div className="flex justify-between">
          <Input
            size="lg"
            variant="bordered"
            className="max-w-80"
            onValueChange={handleSearchChange}
            endContent={<BiSearchAlt size={iconSize.medium} className="text-dark/25" />}
            placeholder="Nhập tên nguyên liệu"
          />
          <div className="flex items-center gap-x-4">
            <Pagination
              showControls
              showShadow
              color="primary"
              page={currentPage}
              total={metadata?.totalPages ?? 1}
              onChange={setCurrentPage}
            />
            <div className={"flex min-w-max items-center gap-2"}>
              <Select
                label={"Trạng thái:"}
                labelPlacement={"outside-left"}
                classNames={{ label: "min-w-max text-base", base: "items-center", mainWrapper: " min-w-52" }}
                selectedKeys={[currentStatusFilter]}
                onSelectionChange={(e) => setCurrentStatusFilter(Array.from(e).join(""))}
                size={"lg"}
                disallowEmptySelection={true}
              >
                <SelectItem key={"all"}>Tất cả</SelectItem>
                <SelectItem key={"false"}>Đang hoạt động</SelectItem>
                <SelectItem key={"true"}>Bị xóa</SelectItem>
              </Select>
              <Select
                label={"Loại nguyên liệu:"}
                labelPlacement={"outside-left"}
                classNames={{ label: "min-w-max text-base", base: "items-center", mainWrapper: " min-w-52" }}
                selectedKeys={[currentTypeFilter]}
                onSelectionChange={(e) => setCurrentTypeFilter(Array.from(e).join(""))}
                size={"lg"}
                disallowEmptySelection={true}
              >
                <SelectItem key={"all"}>Tất cả</SelectItem>
                <SelectItem key={"accessory"}>{MapMaterialTypeText["accessory"]}</SelectItem>
                <SelectItem key={"baking-ingredient"}>{MapMaterialTypeText["baking-ingredient"]}</SelectItem>
              </Select>
            </div>
            <Button
              size="lg"
              color="primary"
              startContent={<BiPlus size={iconSize.medium} />}
              onClick={() => navigate(adminRoutes.materials.create)}
            >
              Thêm mới
            </Button>
          </div>
        </div>
        <Table aria-label="Table show all products" className="min-h-[650px]" removeWrapper>
          <TableHeader>
            <TableColumn className={"text-center"}>STT</TableColumn>
            <TableColumn>TÊN NGUYÊN LIỆU</TableColumn>
            <TableColumn className={"text-center"}>KIỂU NGUYÊN LIỆU</TableColumn>
            <TableColumn className={"text-center"}>ĐƠN VỊ TÍNH</TableColumn>
            <TableColumn className={"text-center"}>TRẠNG THÁI</TableColumn>
            <TableColumn className={"text-center"}>HÀNH ĐỘNG</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={isLoading ? <Loading /> : <p className={"italic"}>Không có nguyên liệu nào</p>}
            className={"h-full"}
          >
            {listMaterials.map((material, index) => (
              <TableRow key={index}>
                <TableCell className={"text-center"}>{index + (currentPage - 1) * 10 + 1}</TableCell>
                <TableCell>{material.materialName}</TableCell>
                <TableCell className={"text-center"}>
                  <Chip color={MapMaterialTypeColor[material.materialType]}>
                    {MapMaterialTypeText[material.materialType]}
                  </Chip>
                </TableCell>
                <TableCell className={"text-center"}>{material.calUnit}</TableCell>
                <TableCell className={"text-center"}>
                  <Chip variant={"flat"} color={material.isDeleted ? "danger" : "success"}>
                    {material.isDeleted ? "Đã bị xóa" : "Bình thường"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className={"flex items-center justify-center gap-1"}>
                    <Button
                      color={"secondary"}
                      isIconOnly
                      variant={"ghost"}
                      onClick={() => navigate(adminRoutes.materials.details(material._id as string))}
                    >
                      {iconConfig.details.base}
                    </Button>
                    {material.isDeleted ? (
                      <>
                        <Button
                          color={"success"}
                          isIconOnly
                          onClick={() => {
                            setCurrentAction("recover");
                            setSelectedId(material._id);
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
                            setSelectedId(material._id);
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
                          onClick={() => navigate(adminRoutes.materials.edit(material._id as string))}
                        >
                          {iconConfig.edit.base}
                        </Button>
                        <Button
                          color={"danger"}
                          isIconOnly
                          variant={"ghost"}
                          onClick={() => {
                            setCurrentAction("softDel");
                            setSelectedId(material._id);
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
      </div>
    </WrapperContainer>
  );
};

export default MaterialManagement;
