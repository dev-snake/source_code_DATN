import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import textSizes from "@/config/styles/text-size";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useRole from "@/hooks/useRole";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { IBranch } from "@/types/branch";
import { IStaff } from "@/types/staff";
import { copyToClipboard } from "@/utils/copy-to-clipboard";
import { formatDate } from "@/utils/format-date";
import {
  MapStaffBranchColor,
  MapStaffRoleColor,
  MapStaffRoleText,
  MapStaffStatusColor,
  MapStaffStatusText,
} from "@/utils/map-data/staffs";
import {
  Button,
  Chip,
  ChipProps,
  Input,
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
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const StaffManagement = () => {
  const navigate = useNavigate();
  const staffAxios = useStaffAxios();
  const currentStaffRole = useRole();
  const currentBranch = useCurrentBranch();

  const [metadata, setMetadata] = useState<IPaginationMetadata>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentRoleFilter, setCurrentRoleFilter] = useState<number>(-1);
  const [currentBranchFilter, setCurrentBranchFilter] = useState<string>("");

  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [listStaffs, setListStaffs] = useState<IStaff[]>([]);
  const [listAllStaffs, setListAllStaffs] = useState<IStaff[]>([]);
  const [listBranches, setListBranches] = useState<IBranch[]>([]);

  const getListStaffs = (noPagination: boolean = false) => {
    return staffAxios
      .get<IAPIResponse<IStaff[]>>(
        currentStaffRole === 2 ? apiRoutes.staff.getAll : apiRoutes.branches.staffs(currentBranch!),
        {
          params: {
            page: currentPage,
            role: currentRoleFilter !== -1 ? currentRoleFilter : undefined,
            noPagination,
            branchRef: currentBranchFilter !== "" ? currentBranchFilter : undefined,
          },
        },
      )
      .then((response) => response.data);
  };

  const getListBranches = () => {
    return staffAxios
      .get<IAPIResponse<IBranch[]>>(apiRoutes.branches.getAll, {
        params: {
          noPagination: true,
        },
      })
      .then((response) => response.data)
      .then((response) => {
        setListBranches(response.results);
      });
  };

  const handleSearchStaffs = (searchString: string) => {
    if (searchString === "") {
      return setListStaffs(listAllStaffs);
    }

    const filteredStaffs = listAllStaffs.filter(
      (staff) =>
        staff.staffName.toLowerCase().includes(searchString.toLowerCase()) ||
        staff.staffCode.toLowerCase().includes(searchString.toLowerCase()),
    );

    return setListStaffs(filteredStaffs);
  };

  const handleFetch = () => {
    setListStaffs([]);
    setListAllStaffs([]);
    setIsFetching(true);
    Promise.all([getListStaffs(), getListStaffs(true), getListBranches()])
      .then(([staffs, allStaffs]) => {
        const filteredRoleStaffs = staffs.results.filter((staffs) => staffs.role === currentRoleFilter);
        setListStaffs(currentRoleFilter === -1 ? staffs.results : filteredRoleStaffs);
        setListAllStaffs(allStaffs.results);
        setMetadata(staffs.metadata);
      })
      .finally(() => {
        setIsFetching(false);
      });
  };

  useEffect(() => {
    if (currentStaffRole === 0) {
      return navigate(adminRoutes.branchOrder.root);
    }

    handleFetch();
  }, [currentPage, currentRoleFilter, currentBranchFilter]);

  return (
    <WrapperContainer>
      <AdminHeader title="Quản lí Nhân viên" />
      <div className={"flex flex-col gap-4"}>
        <div className="flex justify-between">
          <Input
            size="lg"
            variant="bordered"
            className="max-w-80"
            endContent={<div className="text-dark/25">{iconConfig.search.medium}</div>}
            placeholder="Nhập tên | mã nhân viên"
            onValueChange={handleSearchStaffs}
          />
          <div className="flex min-w-max items-center gap-4">
            <div className="flex w-max justify-center">
              <Pagination
                showControls
                showShadow
                color="primary"
                total={metadata?.totalPages ?? 1}
                onChange={setCurrentPage}
              />
            </div>

            <div className={"flex min-w-max items-center gap-2"}>
              <Select
                label={"Chức vụ: "}
                labelPlacement={"outside-left"}
                classNames={{
                  mainWrapper: "min-w-48",
                  base: "items-center",
                  label: "text-base min-w-max",
                }}
                aria-label={"Chức vụ"}
                selectedKeys={[currentRoleFilter?.toString()]}
                onSelectionChange={(e) => {
                  return setCurrentRoleFilter(+Array.from(e).join(""));
                }}
                className={"min-w-48"}
                size={"lg"}
                disallowEmptySelection={true}
              >
                <SelectItem key={"-1"}>Tất cả</SelectItem>
                <SelectItem key={"0"}>Nhân viên</SelectItem>
                <SelectItem key={"1"}>Quản lí chi nhánh</SelectItem>
                <SelectItem key={"2"}>Super Admin</SelectItem>
              </Select>

              <Select
                label={"Chi nhánh: "}
                labelPlacement={"outside-left"}
                classNames={{
                  mainWrapper: "min-w-48",
                  base: "items-center",
                  label: "text-base min-w-max",
                }}
                placeholder={"Tất cả"}
                aria-label={"Chi nhánh"}
                selectedKeys={[currentBranchFilter]}
                onSelectionChange={(e) => {
                  return setCurrentBranchFilter(Array.from(e).join(""));
                }}
                size={"lg"}
              >
                {[
                  <SelectItem key={"null"}> Hệ thống</SelectItem>,
                  ...listBranches.map((branch) => (
                    <SelectItem key={branch._id}> {branch.branchConfig.branchDisplayName}</SelectItem>
                  )),
                ]}
              </Select>
            </div>
            <Button
              size="lg"
              color="primary"
              startContent={iconConfig.add.medium}
              onClick={() => navigate(adminRoutes.staff.create)}
            >
              Thêm mới
            </Button>
          </div>
        </div>
        <Table aria-label="Table show all staff" removeWrapper>
          <TableHeader>
            <TableColumn className={"text-center"}>STT</TableColumn>
            <TableColumn>MÃ NHÂN VIÊN</TableColumn>
            <TableColumn>TÊN NHÂN VIÊN</TableColumn>
            <TableColumn align={"center"} className="max-lg:hidden">
              THỜI GIAN (BẮT ĐẦU / NGHỈ)
            </TableColumn>
            <TableColumn align={"center"}>VAI TRÒ</TableColumn>
            <TableColumn align={"center"}>CHI NHÁNH LÀM VIỆC</TableColumn>
            <TableColumn align={"center"}>TRẠNG THÁI</TableColumn>
            <TableColumn>HÀNH ĐỘNG</TableColumn>
          </TableHeader>
          <TableBody emptyContent={isFetching ? <Loading /> : <p className={"italic"}>Không có dữ liệu</p>}>
            {listStaffs &&
              listStaffs.map((staff, index) => (
                <TableRow key={index}>
                  <TableCell className={"text-center"}>{index + (currentPage - 1) * 10 + 1}</TableCell>
                  <TableCell>
                    <Tooltip content={"Click để copy mã nhân viên"} showArrow={true}>
                      <Chip
                        onClick={() => {
                          copyToClipboard(staff.staffCode);
                          toast.success("Đã sao chép mã nhân viên");
                        }}
                        variant={"shadow"}
                        className={"cursor-pointer"}
                      >
                        {staff.staffCode}
                      </Chip>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{staff.staffName}</TableCell>
                  <TableCell className={"max-lg:hidden"}>
                    <div className="flex items-center justify-center gap-x-2">
                      <Chip color="success" radius="sm" variant="dot">
                        {formatDate(staff.workTime.joinDate, "onlyDate")}
                      </Chip>
                      {staff.workTime.outDate && (
                        <Chip color="danger" radius="sm" variant="dot">
                          {formatDate(staff.workTime.outDate, "onlyDate")}
                        </Chip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={"text-center"}>
                    <Chip color={MapStaffRoleColor[staff.role]} variant="shadow">
                      {MapStaffRoleText[staff.role]}
                    </Chip>
                  </TableCell>
                  <TableCell className={"text-center"}>
                    <Chip
                      color={
                        MapStaffBranchColor[
                          staff.role === 2 ? "system" : staff.branchRef ? "branch" : "undefinded"
                        ]
                      }
                      variant="shadow"
                    >
                      {staff.role === 2
                        ? "Hệ thống"
                        : (staff.branchRef?.branchConfig?.branchDisplayName ?? "Không xác định")}
                    </Chip>
                  </TableCell>
                  <TableCell className={"text-center"}>
                    <Chip color={MapStaffStatusColor[staff.isActive.toString()]} variant={"flat"}>
                      {MapStaffStatusText[staff.isActive.toString()]}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        isIconOnly={true}
                        variant={"ghost"}
                        color={"secondary"}
                        onClick={() => navigate(adminRoutes.staff.details(staff._id as string))}
                      >
                        {iconConfig.details.base}
                      </Button>
                      <Button
                        isIconOnly={true}
                        variant={"ghost"}
                        color={"warning"}
                        onClick={() => navigate(adminRoutes.staff.edit(staff._id as string))}
                      >
                        {iconConfig.edit.base}
                      </Button>
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

export default StaffManagement;
