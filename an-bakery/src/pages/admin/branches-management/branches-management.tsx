import AdminHeader from "@/components/admin/admin-header";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import textSizes from "@/config/styles/text-size";
import { IBranch, TBranchType } from "@/types/branch";
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
  ChipProps,
  SelectItem,
  Select,
  ButtonProps,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import useStaffAxios from "@/hooks/useStaffAxios";
import { apiRoutes } from "@/config/routes/api-routes.config";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import Loading from "@/components/admin/loading";
import { sliceText } from "@/utils/slice-text";
import { toast } from "react-toastify";
import { MapBranchTypeColor, MapBranchTypeIcon, MapBranchTypeText } from "@/utils/map-data/branches";
import { copyToClipboard } from "@/utils/copy-to-clipboard";

const BranchesManagement = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const navigate = useNavigate();
  const staffAxios = useStaffAxios();

  const [listBranches, setListBranches] = useState<IBranch[]>([]);
  const [listAllBranches, setListAllBranches] = useState<IBranch[]>([]);
  const [metadata, setMetadata] = useState<IPaginationMetadata>();
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("null");
  const [branchTypeFilter, setBranchTypeFilter] = useState<string>("null");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [selectedId, setSelectedId] = useState<string>("");
  const [currentAction, setCurrentAction] = useState<"recover" | "softDel" | "hardDel">();

  const getListBranches = (noPagination: boolean = false): Promise<IAPIResponse<IBranch[]>> => {
    return staffAxios
      .get(apiRoutes.branches.getAll, {
        params: {
          page: currentPage,
          noPagination,
          isActive: activeStatusFilter !== "null" ? activeStatusFilter : undefined,
          "branchConfig.branchType": branchTypeFilter !== "null" ? branchTypeFilter : undefined,
        },
      })
      .then((response) => response.data);
  };

  const handleHardDeleteBranch = (onClose: () => void) => {
    return staffAxios
      .delete(apiRoutes.branches.delete(selectedId))
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

  const handleSoftDeleteBranch = (onClose: () => void) => {
    return staffAxios
      .patch(apiRoutes.branches.softDelete(selectedId))
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

  const handleRecoverBranch = (onClose: () => void) => {
    return staffAxios
      .patch(apiRoutes.branches.recover(selectedId))
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

  const handleSearchBranches = (searchString: string) => {
    if (searchString === "") {
      setListBranches(listAllBranches.slice(0, 10));
    } else {
      setListBranches(
        listAllBranches.filter(
          (branch) =>
            branch.branchConfig.branchDisplayName.toLowerCase().includes(searchString.toLowerCase()) ||
            branch.branchConfig.branchContact.branchOwnerName
              .toLowerCase()
              .includes(searchString.toLowerCase()) ||
            branch.branchConfig.branchContact.branchPhoneNumber
              .toLowerCase()
              .includes(searchString.toLowerCase()),
        ),
      );
    }
  };

  const handleFetch = () => {
    setListBranches([]);
    setListAllBranches([]);
    setIsFetching(true);
    return Promise.all([getListBranches(), getListBranches(true)])
      .then(([branches, allBranches]) => {
        setListBranches(branches.results);
        setListAllBranches(allBranches.results);
        setMetadata(branches.metadata);
      })
      .catch((error) => {
        const { response } = error;

        setListAllBranches([]);
        setListBranches([]);
        setMetadata(response.data.results.metadata);
      })
      .finally(() => setIsFetching(false));
  };

  useEffect(() => {
    handleFetch();
  }, [activeStatusFilter, branchTypeFilter]);

  return (
    <WrapperContainer>
      <AdminHeader title="Quản lí tất cả Chi nhánh" refBack="" />

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top" size={"5xl"}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h4>
                  {currentAction === "recover" ? "Xác nhận KHÔI PHỤC CHI NHÁNH" : "Xác nhận XÓA CHI NHÁNH"}
                </h4>
              </ModalHeader>
              <ModalBody>
                <div className={"flex flex-col gap-4"}>
                  {!currentAction ? (
                    <Loading />
                  ) : currentAction === "softDel" ? (
                    <div className={"flex flex-col gap-2"}>
                      <h4>Thao tác xóa chi nhánh sẽ kèm theo các hành động sau:</h4>
                      <p className={"text-lg italic text-danger"}>- Tạm xóa các voucher của chi nhánh</p>
                    </div>
                  ) : currentAction === "recover" ? (
                    <p className={"text-lg italic"}>Bạn có chắc chắn muốn khôi phục lại chi nhánh này?</p>
                  ) : (
                    <p className={"text-lg italic text-danger"}>
                      Bạn có chắc chắn muốn xóa vĩnh viễn chi nhánh này?
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
                      ? handleSoftDeleteBranch(onClose)
                      : currentAction === "recover"
                        ? handleRecoverBranch(onClose)
                        : handleHardDeleteBranch(onClose)
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
          radius="md"
          variant="bordered"
          className="max-w-96"
          endContent={<div className="text-default-300">{iconConfig.search.medium}</div>}
          placeholder={"Nhập tên chi nhánh | Chủ chi nhánh | Số điện thoại"}
          onValueChange={handleSearchBranches}
        />
        <div className="flex items-center gap-x-4">
          <Pagination
            showControls
            showShadow
            color="primary"
            total={metadata?.totalPages ?? 1}
            onChange={setCurrentPage}
          />
          <div className={"flex w-max items-center gap-2"}>
            <p className={"min-w-max"}>Trạng thái:</p>
            <Select
              size={"lg"}
              selectedKeys={[activeStatusFilter]}
              onSelectionChange={(e) => setActiveStatusFilter(Array.from(e).join(""))}
              className={"min-w-48"}
              disallowEmptySelection={true}
            >
              <SelectItem key={"null"}>Tất cả</SelectItem>
              <SelectItem key={"true"}>Hoạt động</SelectItem>
              <SelectItem key={"false"}>Ngưng hoạt động</SelectItem>
            </Select>
          </div>
          <div className={"flex w-max items-center gap-2"}>
            <p className={"min-w-max"}>Kiểu chi nhánh:</p>
            <Select
              size={"lg"}
              selectedKeys={[branchTypeFilter]}
              onSelectionChange={(e) => setBranchTypeFilter(Array.from(e).join(""))}
              className={"min-w-48"}
              disallowEmptySelection={true}
            >
              <SelectItem key={"null"}>Tất cả</SelectItem>
              <SelectItem key={"direct"}>Trực tiếp</SelectItem>
              <SelectItem key={"online"}>Trực tuyến</SelectItem>
            </Select>
          </div>

          <Button
            size="lg"
            color="primary"
            startContent={iconConfig.add.medium}
            onClick={() => navigate(adminRoutes.branch.create)}
          >
            Thêm mới
          </Button>
        </div>
      </div>
      <Table aria-label="Table show all branches" className="mt-4" removeWrapper>
        <TableHeader>
          <TableColumn align={"center"}>STT</TableColumn>
          <TableColumn>MÃ CHI NHÁNH</TableColumn>
          <TableColumn>TÊN CHI NHÁNH</TableColumn>
          <TableColumn className={"text-center"}>THỜI GIAN (ĐÓNG/MỞ)</TableColumn>
          <TableColumn className={"text-center max-[1400px]:hidden"}>LOẠI HÌNH CHI NHÁNH</TableColumn>
          <TableColumn className={"text-center max-xl:hidden"}>SỐ ĐIỆN THOẠI</TableColumn>
          <TableColumn className={"text-center max-[874px]:hidden"}>QUẢN LÍ CHI NHÁNH</TableColumn>
          <TableColumn className={"text-center"}>TRẠNG THÁI</TableColumn>
          <TableColumn className={"text-center"}>HÀNH ĐỘNG</TableColumn>
        </TableHeader>
        <TableBody emptyContent={isFetching ? <Loading></Loading> : <p>Không có chi nhánh nào!</p>}>
          {listBranches.map((branch, index) => (
            <TableRow key={index}>
              <TableCell>{index + (currentPage - 1) * 10 + 1}</TableCell>
              <TableCell>#{sliceText(branch._id)}</TableCell>
              <TableCell className={`overflow-hidden`}>{branch.branchConfig.branchDisplayName}</TableCell>
              <TableCell>
                <div className="flex justify-center max-lg:gap-x-1 lg:gap-x-2">
                  <Chip
                    color="success"
                    startContent={iconConfig.dot.base}
                    classNames={{
                      content: "font-semibold",
                    }}
                  >
                    {branch.branchConfig.activeTime.open}
                  </Chip>
                  <Chip
                    color="danger"
                    startContent={iconConfig.dot.base}
                    classNames={{
                      content: "font-semibold",
                    }}
                  >
                    {branch.branchConfig.activeTime.close}
                  </Chip>
                </div>
              </TableCell>
              <TableCell className={`text-center max-[1400px]:hidden`}>
                <Chip
                  color={MapBranchTypeColor[branch.branchConfig.branchType]}
                  startContent={MapBranchTypeIcon[branch.branchConfig.branchType]}
                  className={"gap-1 px-2"}
                >
                  {MapBranchTypeText[branch.branchConfig.branchType]}
                </Chip>
              </TableCell>
              <TableCell className={`text-center max-xl:hidden`}>
                <Chip
                  endContent={iconConfig.copy.base}
                  color={"primary"}
                  variant={"shadow"}
                  classNames={{
                    base: "gap-1 px-2 cursor-pointer",
                    content: "pl-1",
                  }}
                  onClick={() => {
                    copyToClipboard(branch.branchConfig.branchContact.branchPhoneNumber);
                    toast.success("Đã sao chép số điện thoại");
                  }}
                >
                  {branch.branchConfig.branchContact.branchPhoneNumber}
                </Chip>
              </TableCell>
              <TableCell className={`overflow-hidden text-center max-[874px]:hidden`}>
                {branch.branchConfig.branchContact.branchOwnerName}
              </TableCell>
              <TableCell className={"text-center"}>
                {branch.isDeleted ? (
                  <Chip variant="flat" color={"danger"}>
                    Đã bị xóa
                  </Chip>
                ) : (
                  <Chip variant="flat" color={branch.isActive ? "success" : "danger"}>
                    {branch.isActive ? "Hoạt động" : "Ngưng hoạt động"}
                  </Chip>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <Button
                    isIconOnly={true}
                    variant={"ghost"}
                    color={"secondary"}
                    onClick={() => navigate(adminRoutes.branch.details(branch._id))}
                  >
                    {iconConfig.details.base}
                  </Button>
                  {branch.isDeleted ? (
                    <>
                      <Button
                        isIconOnly={true}
                        color={"success"}
                        onClick={() => {
                          setSelectedId(branch._id);
                          setCurrentAction("recover");
                          onOpen();
                        }}
                      >
                        {iconConfig.reset.base}
                      </Button>
                      <Button
                        isIconOnly={true}
                        color={"danger"}
                        onClick={() => {
                          setSelectedId(branch._id);
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
                        onClick={() => navigate(adminRoutes.branch.edit(branch._id))}
                      >
                        {iconConfig.edit.base}
                      </Button>
                      <Button
                        isIconOnly={true}
                        variant={"ghost"}
                        color={"danger"}
                        onClick={() => {
                          setSelectedId(branch._id);
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

export default BranchesManagement;
