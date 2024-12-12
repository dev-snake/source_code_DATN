import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";

import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig, { iconSize } from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import textSizes from "@/config/styles/text-size";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useRole from "@/hooks/useRole";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { IVoucher, TVoucherType } from "@/types/voucher";
import { copyToClipboard } from "@/utils/copy-to-clipboard";
import {
  MapValidStatusColor,
  MapValidStatusText,
  MapVoucherTypeColor,
  MapVoucherTypeIcon,
  MapVoucherTypeText,
} from "@/utils/map-data/vouchers";
import {
  Button,
  Checkbox,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Radio,
  RadioGroup,
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
import { GiClover } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MapStaffBranchColor } from "../../../utils/map-data/staffs/index";
import { IBranch } from "@/types/branch";

const VouchersManagement = () => {
  const navigate = useNavigate();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [listVouchers, setListVouchers] = useState<IVoucher[]>([]);
  const [listAllVouchers, setListAllVouchers] = useState<IVoucher[]>([]);
  const [listBranches, setListBranches] = useState<IBranch[]>([]);

  const [metadata, setMetadata] = useState<IPaginationMetadata>();
  const [selectedId, setSelectedId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentTypeFilter, setCurrentTypeFilter] = useState<string>("all");
  const [currentBranchFilter, setCurrentBranchFilter] = useState<string>("");
  const [currentStatusFilter, setCurrentStatusFilter] = useState<string>("all");
  const [onlyWhiteList, setOnlyWhiteList] = useState<boolean>(false);
  const [currentAction, setCurrentAction] = useState<"recover" | "softDel" | "hardDel">();
  const currentStaffRole = useRole();

  const currentBranch = useCurrentBranch();

  const staffAxios = useStaffAxios();

  const checkValidStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return "notStarted";
    } else if (now > end) {
      return "hasExpired";
    } else {
      return "onActive";
    }
  };

  const getListVouchers = (noPagination: boolean = false) => {
    return staffAxios
      .get<IAPIResponse<IVoucher[]>>(
        currentStaffRole !== 2 ? apiRoutes.branches.vouchers(currentBranch) : apiRoutes.vouchers.getAll,
        {
          params: {
            noPagination,
            page: currentPage,
            "voucherConfig.type": currentTypeFilter !== "all" ? currentTypeFilter : undefined,
            branchId: currentBranchFilter !== "" ? currentBranchFilter : undefined,
            "voucherConfig.isWhiteList": onlyWhiteList ? true : undefined,
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

  const handleFilterStatus = (listVoucher: IVoucher[]) => {
    return listVoucher.filter((voucher) => {
      if (currentStatusFilter === "all") {
        return true;
      }

      return (
        checkValidStatus(voucher.voucherConfig.validFrom, voucher.voucherConfig.validTo) ===
        currentStatusFilter
      );
    });
  };

  const handleFetch = () => {
    setListVouchers([]);
    setListAllVouchers([]);
    setIsLoading(true);

    Promise.all([getListVouchers(), getListVouchers(true)])
      .then(([vouchers, allVouchers]) => {
        setListVouchers(handleFilterStatus(vouchers.results));
        setListAllVouchers(handleFilterStatus(allVouchers.results));
        setMetadata(vouchers.metadata);
        getListBranches();
      })
      .catch((error) => {
        const { data } = error.response;
        setListVouchers(data.results);
        setListAllVouchers(data.results);
        setMetadata(data.metadata);
      })
      .finally(() => setIsLoading(false));
  };

  const handleSearch = (searchString: string) => {
    if (searchString === "") {
      return setListVouchers(listAllVouchers.slice(0, 10));
    }

    const searchResult = listAllVouchers.filter((voucher) =>
      voucher.voucherCode.toLowerCase().includes(searchString.toLowerCase()),
    );
    setListVouchers(searchResult);
  };

  const handleHardDeleteVoucher = (onClose: () => void) => {
    staffAxios
      .delete<IAPIResponse<IVoucher[]>>(apiRoutes.vouchers.delete(selectedId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
          handleFetch();
        }
      })
      .catch((error) => {
        console.log(error);
        const { data } = error.response;
        toast.error(data.message);
      })

      .finally(() => onClose());
  };

  const handleSoftDeleteVoucher = (onClose: () => void) => {
    staffAxios
      .patch<IAPIResponse>(apiRoutes.vouchers.softDelete(selectedId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
          handleFetch();
        }
      })
      .catch((error) => {
        console.log(error);
        const { data } = error.response;
        toast.error(data.message);
      })

      .finally(() => onClose());
  };
  const handleRecoverVoucher = (onClose: () => void) => {
    staffAxios
      .patch<IAPIResponse>(apiRoutes.vouchers.recover(selectedId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
          handleFetch();
        }
      })
      .catch((error) => {
        console.log(error);
        const { data } = error.response;
        toast.error(data.message);
      })

      .finally(() => onClose());
  };

  useEffect(() => {
    handleFetch();
  }, [currentPage, currentTypeFilter, onlyWhiteList, currentBranchFilter, currentStatusFilter]);

  return (
    <WrapperContainer>
      <AdminHeader title="Quản lí mã giảm giá" />

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top" size={"5xl"}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h5>
                  {currentAction === "recover"
                    ? "Xác nhận KHÔI PHỤC MÃ GIẢM GIÁ"
                    : "Xác nhận XÓA MÃ GIẢM GIÁ"}
                </h5>
              </ModalHeader>
              <ModalBody>
                <div className={"flex flex-col gap-4"}>
                  {!currentAction ? (
                    <Loading />
                  ) : currentAction === "softDel" ? (
                    <p className={"text-lg italic text-danger"}>Bạn có chắc chắn muốn xóa mã giảm giá này?</p>
                  ) : currentAction === "recover" ? (
                    <p className={"text-lg italic"}>Bạn có chắc chắn muốn khôi phục lại mã giảm giá này?</p>
                  ) : (
                    <p className={"text-lg italic text-danger"}>
                      Bạn có chắc chắn muốn xóa vĩnh viễn mã giảm giá này?
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
                      ? handleSoftDeleteVoucher(onClose)
                      : currentAction === "recover"
                        ? handleRecoverVoucher(onClose)
                        : handleHardDeleteVoucher(onClose)
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
          placeholder={"Nhập mã giảm giá"}
          onValueChange={(value) => handleSearch(value)}
        />
        <div className="flex items-center gap-x-4">
          <Pagination
            showControls
            showShadow
            color="primary"
            total={metadata?.totalPages ?? 1}
            onChange={setCurrentPage}
          />

          <div className="flex items-center gap-2">
            {currentStaffRole === 2 && (
              <Select
                label={"Chi nhánh:"}
                labelPlacement={"outside-left"}
                classNames={{
                  label: "min-w-max text-base",
                  base: "items-center",
                  mainWrapper: " min-w-36",
                }}
                selectedKeys={[currentBranchFilter]}
                onSelectionChange={(e) => setCurrentBranchFilter(Array.from(e).join(""))}
                size={"lg"}
                placeholder={"Tất cả"}
              >
                {listBranches.map((branch) => (
                  <SelectItem key={branch._id}>{branch.branchConfig.branchDisplayName}</SelectItem>
                ))}
              </Select>
            )}
            <Dropdown size={"lg"}>
              <DropdownTrigger>
                <Button startContent={iconConfig.filter.base} variant={"flat"}>
                  Bộ lọc
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                closeOnSelect={false}
                disableAnimation={false}
                itemClasses={{
                  base: ["data-[hover=true]:bg-transparent"],
                }}
              >
                <DropdownSection
                  title={"Loại mã"}
                  classNames={{
                    heading: "text-base",
                  }}
                  showDivider={true}
                >
                  <DropdownItem>
                    <RadioGroup value={currentTypeFilter} onValueChange={setCurrentTypeFilter}>
                      <Radio value={"all"}>Tất cả</Radio>
                      <Radio value={"shipFee"}>Phí vận chuyển</Radio>
                      <Radio value={"fixed"}>Cố định</Radio>
                      <Radio value={"percentage"}>Phần trăm</Radio>
                    </RadioGroup>
                  </DropdownItem>
                </DropdownSection>
                <DropdownSection
                  title={"Trạng thái mã"}
                  classNames={{
                    heading: "text-base",
                  }}
                  showDivider={true}
                >
                  <DropdownItem>
                    <RadioGroup value={currentStatusFilter} onValueChange={setCurrentStatusFilter}>
                      <Radio value={"all"}>Tất cả</Radio>
                      <Radio value={"notStarted"}>Chưa bắt đầu</Radio>
                      <Radio value={"onActive"}>Đang hoạt động</Radio>
                      <Radio value={"hasExpired"}>Hết hạn</Radio>
                    </RadioGroup>
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox onValueChange={setOnlyWhiteList}>Chỉ Whitelist</Checkbox>
          </div>
          {currentStaffRole !== 0 && (
            <Button
              size="lg"
              color="primary"
              startContent={iconConfig.add.base}
              onClick={() => navigate(adminRoutes.voucher.create)}
            >
              Tạo mã mới
            </Button>
          )}
        </div>
      </div>
      <Table aria-label="Table show all vouchers" className="mt-4" removeWrapper>
        <TableHeader>
          <TableColumn className={"text-center"}>STT</TableColumn>
          <TableColumn>MÃ GIẢM GIÁ</TableColumn>
          <TableColumn>KIỂU MÃ GIẢM GIÁ</TableColumn>
          <TableColumn>LƯỢT SỬ DỤNG</TableColumn>
          <TableColumn>NGƯỜI TẠO</TableColumn>
          <TableColumn>PHẠM VI</TableColumn>
          <TableColumn align={"center"}>TRẠNG THÁI</TableColumn>
          <TableColumn>HÀNH ĐỘNG</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={isLoading ? <Loading /> : <p className={"italic"}>Không có mã giảm giá nào</p>}
        >
          {listVouchers.map((voucher, index) => (
            <TableRow key={index}>
              <TableCell className={"text-center"}>{index + (currentPage - 1) * 10 + 1}</TableCell>
              <TableCell>
                <Button
                  color={"primary"}
                  variant={"flat"}
                  endContent={iconConfig.copy.base}
                  onClick={() => {
                    copyToClipboard(voucher.voucherCode);
                    toast.success("Đã sao chép mã giảm giá");
                  }}
                >
                  {voucher.voucherCode}
                </Button>
              </TableCell>
              <TableCell>
                <div className={"flex items-center gap-1"}>
                  <Chip
                    size={"lg"}
                    variant={"flat"}
                    color={MapVoucherTypeColor[voucher.voucherConfig.type]}
                    startContent={MapVoucherTypeIcon[voucher.voucherConfig.type]}
                  >
                    {MapVoucherTypeText[voucher.voucherConfig.type]}
                  </Chip>
                  {voucher.voucherConfig.isWhiteList && (
                    <Chip
                      size={"lg"}
                      variant={"flat"}
                      color={"secondary"}
                      startContent={<GiClover size={iconSize.base} />}
                    >
                      Whitelist
                    </Chip>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {voucher.usedCount}/{voucher.voucherConfig.maxTotalUsage ?? "Không giới hạn"}
              </TableCell>
              <TableCell>{voucher.creatorId}</TableCell>
              <TableCell>
                <Chip color={MapStaffBranchColor[voucher.branchId ? "branch" : "system"]} variant={"shadow"}>
                  {voucher.branchId ? "Chi nhánh" : "Toàn hệ thống"}
                </Chip>
              </TableCell>
              <TableCell className={"table-cell items-center"}>
                <div className={"flex items-center justify-center gap-2"}>
                  <Chip
                    color={
                      MapValidStatusColor[
                        checkValidStatus(voucher.voucherConfig.validFrom, voucher.voucherConfig.validTo)
                      ]
                    }
                    variant={"flat"}
                  >
                    {
                      MapValidStatusText[
                        checkValidStatus(voucher.voucherConfig.validFrom, voucher.voucherConfig.validTo)
                      ]
                    }
                  </Chip>
                  {voucher.isDeleted && <Chip color={"danger"}>Bị xóa</Chip>}
                </div>
              </TableCell>
              <TableCell>
                <div className={"flex items-center gap-1"}>
                  <Button
                    isIconOnly={true}
                    variant={"ghost"}
                    color={"secondary"}
                    onClick={() => navigate(adminRoutes.voucher.details(voucher._id))}
                  >
                    {iconConfig.details.base}
                  </Button>
                  {currentStaffRole !== 0 &&
                    (voucher.isDeleted ? (
                      <>
                        <Button
                          isIconOnly={true}
                          color={"success"}
                          onClick={() => {
                            setSelectedId(voucher._id);
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
                            setSelectedId(voucher._id);
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
                          onClick={() => navigate(adminRoutes.voucher.edit(voucher._id))}
                        >
                          {iconConfig.edit.base}
                        </Button>
                        <Button
                          isIconOnly={true}
                          variant={"ghost"}
                          color={"danger"}
                          onPress={() => {
                            setSelectedId(voucher._id);
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

export default VouchersManagement;
