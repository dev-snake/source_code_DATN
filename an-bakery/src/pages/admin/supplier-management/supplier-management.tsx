import AdminHeader from "@/components/admin/admin-header";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Pagination,
  Button,
  Input,
  useDisclosure,
  ChipProps,
  Select,
  SelectItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiRoutes } from "@/config/routes/api-routes.config";
import Loading from "@/components/admin/loading";

import adminRoutes from "@/config/routes/admin-routes.config";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { ISupplier } from "@/types/supplier";
import useStaffAxios from "@/hooks/useStaffAxios";
import { sliceText } from "@/utils/slice-text";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useRole from "@/hooks/useRole";
import { toast } from "react-toastify";
import { MapSupplierPriorityText, MapSupplierPriorityColor } from "@/utils/map-data/suppliers";
import { copyToClipboard } from "@/utils/copy-to-clipboard";
import { IBranch } from "@/types/branch";

const SupplierManagement = () => {
  const navigate = useNavigate();

  const currentBranch = useCurrentBranch();
  const currentStaffRole = useRole();

  const staffAxios = useStaffAxios();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [listSuppliers, setListSuppliers] = useState<ISupplier[]>([]);
  const [listAllSuppliers, setListAllSuppliers] = useState<ISupplier[]>([]);
  const [listBranches, setListBranches] = useState<IBranch[]>([]);
  const [metadata, setMetadata] = useState<IPaginationMetadata>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedId, setSelectedId] = useState<string>("");

  const [currentSelectedPriority, setCurrentSelectedPriority] = useState<string>("all");
  const [currentBranchFilter, setCurrentBranchFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [currentAction, setCurrentAction] = useState<"recover" | "softDel" | "hardDel">();

  const getListSuppliers = (noPagination: boolean = false) => {
    return staffAxios
      .get<IAPIResponse<ISupplier[]>>(
        currentStaffRole !== 2 ? apiRoutes.branches.suppliers(currentBranch) : apiRoutes.suppliers.getAll,
        {
          params: {
            page: currentPage,
            noPagination,
            supplierPriority: currentSelectedPriority === "all" ? undefined : currentSelectedPriority,
            branchId: currentBranchFilter === "" ? undefined : currentBranchFilter,
          },
        },
      )
      .then((response) => response.data);
  };

  const getListBranches = () => {
    if (currentStaffRole !== 2) {
      return;
    }

    return staffAxios
      .get<IAPIResponse<IBranch[]>>(apiRoutes.branches.getAll)
      .then((response) => response.data)
      .then((response) => {
        setListBranches(response.results);
      });
  };

  const handleFetch = () => {
    setListSuppliers([]);
    setListAllSuppliers([]);
    setIsLoading(true);

    return Promise.all([getListSuppliers(), getListSuppliers(true), getListBranches()])
      .then(([suppliers, allSuppliers]) => {
        setListSuppliers(suppliers.results);
        setListAllSuppliers(allSuppliers.results);
        setMetadata(suppliers.metadata);
      })
      .catch((error) => {
        const { data } = error.response;
        if (data.status !== "error") {
          setListSuppliers(data.results);
          setListAllSuppliers(data.results);
          setMetadata(data.metadata);
        } else {
          // handleFetch();
        }
      })
      .finally(() => setIsLoading(false));
  };

  const handleHardDeleteSupplier = (onClose: () => void) => {
    return staffAxios
      .delete<IAPIResponse<ISupplier>>(apiRoutes.suppliers.delete(selectedId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
          handleFetch();
        }
      })
      .catch((error) => {
        const { data } = error.response;

        toast.error(data.message);
      })
      .finally(() => onClose());
  };
  const handleSoftDeleteSupplier = (onClose: () => void) => {
    return staffAxios
      .patch<IAPIResponse>(apiRoutes.suppliers.softDelete(selectedId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
          handleFetch();
        }
      })
      .catch((error) => {
        const { data } = error.response;

        toast.error(data.message);
      })
      .finally(() => onClose());
  };
  const handleRecoverSupplier = (onClose: () => void) => {
    return staffAxios
      .patch<IAPIResponse>(apiRoutes.suppliers.recover(selectedId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
          handleFetch();
        }
      })
      .catch((error) => {
        const { data } = error.response;

        toast.error(data.message);
      })
      .finally(() => onClose());
  };

  const handleSearchSupplier = (searchString: string) => {
    if (searchString === "") {
      return setListSuppliers(listAllSuppliers.slice(0, 10));
    }

    const filteredSuppliers = listAllSuppliers.filter((supplier) =>
      supplier.supplierName.toLowerCase().includes(searchString.toLowerCase()),
    );
    setListSuppliers(filteredSuppliers);
  };

  useEffect(() => {
    handleFetch();
  }, [currentPage, currentSelectedPriority, currentBranchFilter]);

  return (
    <WrapperContainer>
      <AdminHeader title="Quản lí nhà cung cấp" />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top" size={"2xl"}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h5>
                  {currentAction === "recover"
                    ? "Xác nhận KHÔI PHỤC NHÀ CUNG CẤP"
                    : "Xác nhận XÓA NHÀ CUNG CẤP"}
                </h5>
              </ModalHeader>
              <ModalBody>
                <div className={"flex flex-col gap-4"}>
                  {!currentAction ? (
                    <Loading />
                  ) : currentAction === "softDel" ? (
                    <p className={"text-lg italic text-danger"}>
                      Bạn có chắc chắn muốn xóa nhà cung cấp này?
                    </p>
                  ) : currentAction === "recover" ? (
                    <p className={"text-lg italic"}>Bạn có chắc chắn muốn khôi phục lại nhà cung cấp này?</p>
                  ) : (
                    <p className={"text-lg italic text-danger"}>
                      Bạn có chắc chắn muốn xóa vĩnh viễn nhà cung cấp này?
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
                      ? handleSoftDeleteSupplier(onClose)
                      : currentAction === "recover"
                        ? handleRecoverSupplier(onClose)
                        : handleHardDeleteSupplier(onClose)
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
          onValueChange={handleSearchSupplier}
          placeholder="Nhập tên nhà cung cấp"
        />
        <div className="flex items-center gap-x-4">
          <Pagination
            showControls
            showShadow
            color="primary"
            total={metadata?.totalPages || 1}
            onChange={setCurrentPage}
          />
          <div className={"flex items-center gap-2"}>
            <Select
              label={"Độ ưu tiên: "}
              labelPlacement={"outside-left"}
              classNames={{
                label: "min-w-max text-base",
                base: "items-center",
                mainWrapper: "min-w-48",
              }}
              selectedKeys={[currentSelectedPriority]}
              onSelectionChange={(e) => setCurrentSelectedPriority(Array.from(e).join(""))}
              disallowEmptySelection={true}
              size={"lg"}
              className={"min-w-48"}
            >
              <SelectItem key={"all"}>Tất cả</SelectItem>
              <SelectItem key={"1"}>{MapSupplierPriorityText["1"]}</SelectItem>
              <SelectItem key={"2"}>{MapSupplierPriorityText["2"]}</SelectItem>
              <SelectItem key={"3"}>{MapSupplierPriorityText["3"]}</SelectItem>
            </Select>
            <Select
              label={"Chi nhánh: "}
              labelPlacement={"outside-left"}
              classNames={{
                label: "min-w-max text-base",
                base: "items-center",
                mainWrapper: "min-w-48",
              }}
              selectedKeys={[currentBranchFilter]}
              onSelectionChange={(e) => setCurrentBranchFilter(Array.from(e).join(""))}
              placeholder={"Tất cả"}
              size={"lg"}
              className={"min-w-48"}
            >
              {listBranches.map((branch) => (
                <SelectItem key={branch._id}>{branch.branchConfig.branchDisplayName}</SelectItem>
              ))}
            </Select>
          </div>

          <Button
            size="lg"
            color="primary"
            startContent={iconConfig.add.medium}
            onClick={() => navigate(adminRoutes.supplier.create)}
          >
            Thêm mới
          </Button>
        </div>
      </div>
      <Table aria-label="Table show all products" className="mt-4" removeWrapper>
        <TableHeader>
          <TableColumn className={"text-center"}>STT</TableColumn>
          <TableColumn>MÃ NHÀ CUNG CẤP</TableColumn>
          <TableColumn>TÊN NHÀ CUNG CẤP</TableColumn>
          <TableColumn>TÊN NHÂN VIÊN TƯ VẤN</TableColumn>
          <TableColumn className={"text-center"}>SỐ ĐIỆN THOẠI NHÂN VIÊN TƯ VẤN</TableColumn>
          <TableColumn className={"text-center"}>MỨC ƯU TIÊN</TableColumn>
          <TableColumn>HÀNH ĐỘNG</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={isLoading ? <Loading /> : <p className={"italic"}>Không có nhà cung cấp nào</p>}
        >
          {listSuppliers.map((supplier, index) => (
            <TableRow key={index}>
              <TableCell className={"text-center"}>{index + (currentPage - 1) * 10 + 1}</TableCell>
              <TableCell>#{sliceText(supplier._id)}</TableCell>
              <TableCell>{supplier.supplierName}</TableCell>
              <TableCell>{supplier.supplierContactPerson.name}</TableCell>
              <TableCell className={"text-center"}>
                <Chip
                  endContent={iconConfig.copy.base}
                  color={"primary"}
                  variant={"shadow"}
                  classNames={{
                    base: "gap-1 px-2 cursor-pointer",
                    content: "pl-1",
                  }}
                  onClick={() => {
                    copyToClipboard(supplier.supplierContactPerson.phone);
                    toast.success("Đã sao chép số điện thoại");
                  }}
                >
                  {supplier.supplierContactPerson.phone}
                </Chip>
              </TableCell>
              <TableCell className={"text-center"}>
                <Chip variant={"solid"} color={MapSupplierPriorityColor[supplier.supplierPriority]}>
                  {MapSupplierPriorityText[supplier.supplierPriority]}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    isIconOnly={true}
                    variant={"ghost"}
                    color={"secondary"}
                    onClick={() => navigate(adminRoutes.supplier.details(supplier._id as string))}
                  >
                    {iconConfig.details.base}
                  </Button>
                  {currentStaffRole === 2 &&
                    (supplier.isDeleted ? (
                      <>
                        <Button
                          isIconOnly={true}
                          color={"success"}
                          onClick={() => {
                            setSelectedId(supplier._id);
                            setCurrentAction("recover");
                            onOpen();
                          }}
                        >
                          {iconConfig.reset.base}
                        </Button>
                        <Button
                          isIconOnly={true}
                          color="danger"
                          onClick={() => {
                            setSelectedId(supplier._id);
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
                          isIconOnly={true}
                          variant={"ghost"}
                          color={"warning"}
                          onClick={() => navigate(adminRoutes.supplier.edit(supplier._id as string))}
                        >
                          {iconConfig.edit.base}
                        </Button>
                        <Button
                          isIconOnly={true}
                          variant={"ghost"}
                          color="danger"
                          onClick={() => {
                            setSelectedId(supplier._id);
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

export default SupplierManagement;
