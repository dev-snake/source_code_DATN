import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useRole from "@/hooks/useRole";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { IBranch } from "@/types/branch";
import { IImportRequest } from "@/types/import-request";
import { MapRequestStatusColor, MapRequestStatusText } from "@/types/import-request-map";
import { formatDate } from "@/utils/format-date";
import { sliceText } from "@/utils/slice-text";
import {
  Button,
  Chip,
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
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ImportRequestManagement = () => {
  const navigate = useNavigate();

  const currentStaffRole = useRole();
  const currentBranch = useCurrentBranch();

  const [listRequests, setListRequests] = useState<IImportRequest[]>([]);
  const [listAllRequests, setListAllRequests] = useState<IImportRequest[]>([]);
  const [listBranches, setListBranches] = useState<IBranch[]>([]);

  const [isFetching, setIsFetching] = useState<boolean>(true);

  const [metadata, setMetadata] = useState<IPaginationMetadata>();
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [currentStatusFilter, setCurrentStatusFilter] = useState<string>("all");
  const [currentBranchFilter, setCurrentBranchFilter] = useState<string>("");

  const staffAxios = useStaffAxios();

  const getListImportRequests = (noPagination: boolean = false) => {
    return staffAxios
      .get<IAPIResponse<IImportRequest[]>>(
        currentStaffRole !== 2
          ? apiRoutes.branches.getImportRequests(currentBranch)
          : apiRoutes.importRequests.getAll,
        {
          params: {
            noPagination,
            page: currentPage,
            requestStatus: currentStatusFilter === "all" ? undefined : currentStatusFilter,
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

  const handleSearchRequests = (searchString: string) => {
    if (searchString === "") {
      return setListRequests(listAllRequests);
    }
    const filteredRequests = listAllRequests.filter((request) =>
      request._id.toLowerCase().includes(searchString.toLowerCase()),
    );
    return setListRequests(filteredRequests);
  };

  const handleFetch = () => {
    setListAllRequests([]);
    setListRequests([]);
    setIsFetching(true);

    Promise.all([getListImportRequests(), getListImportRequests(true), getListBranches()])
      .then(([requests, allRequests]) => {
        setMetadata(requests.metadata);
        setListRequests(requests.results);
        setListAllRequests(allRequests.results);
      })
      .catch((error) => {
        const { data } = error.response;
        setMetadata(data.metadata);
        setListRequests(data.results);
        setListAllRequests(data.results);
      })
      .finally(() => {
        setIsFetching(false);
      });
  };

  useEffect(() => {
    handleFetch();
  }, [currentPage, currentStatusFilter, currentBranchFilter]);

  return (
    <WrapperContainer>
      <AdminHeader title="YÊU CẦU NHẬP HÀNG" />
      <div className={"flex flex-col gap-4"}>
        <div className="flex justify-between">
          <Input
            size="lg"
            variant="bordered"
            className="max-w-80"
            endContent={<div className="text-dark/25">{iconConfig.search.medium}</div>}
            placeholder="Nhập mã yêu cầu"
            onValueChange={handleSearchRequests}
          />
          <div className="flex items-center gap-4">
            <Pagination
              showControls
              showShadow
              color="primary"
              total={metadata?.totalPages ?? 1}
              onChange={setCurrentPage}
            />

            <div className="flex items-center gap-2">
              <Select
                label={"Trạng thái nhập"}
                labelPlacement={"outside-left"}
                classNames={{
                  base: "items-center ",
                  mainWrapper: "min-w-48",
                  label: "text-base min-w-max",
                }}
                selectedKeys={[currentStatusFilter]}
                onSelectionChange={(e) => setCurrentStatusFilter(Array.from(e).join(""))}
                size={"lg"}
                disallowEmptySelection={true}
              >
                <SelectItem key={"all"}>Tất cả</SelectItem>
                <SelectItem key={"pending"}>Chờ xác nhận</SelectItem>
                <SelectItem key={"confirmed"}>Đã chấp nhận</SelectItem>
                <SelectItem key={"waiting"}>Đang chờ nhập</SelectItem>
                <SelectItem key={"completed"}>Đã nhập xong</SelectItem>
              </Select>

              {currentStaffRole === 2 && (
                <Select
                  label={"Chi nhánh"}
                  labelPlacement={"outside-left"}
                  classNames={{
                    base: "items-center ",
                    mainWrapper: "min-w-48",
                    label: "text-base min-w-max",
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
            </div>

            <Button
              size={"lg"}
              color={"primary"}
              startContent={iconConfig.add.medium}
              onClick={() => navigate(adminRoutes.importRequests.new)}
            >
              Tạo yêu cầu mới
            </Button>
          </div>
        </div>
        <Table
          aria-label="Bảng danh sách yêu cầu nhập hàng"
          className=""
          removeWrapper
          classNames={{
            th: "text-small",
            tr: "text-sm",
            td: "text-sm",
          }}
        >
          <TableHeader>
            <TableColumn align={"center"}>STT</TableColumn>
            <TableColumn>MÃ YÊU CẦU</TableColumn>
            <TableColumn>CHI NHÁNH YÊU CẦU</TableColumn>
            <TableColumn>NHÀ CUNG CẤP</TableColumn>
            <TableColumn align={"center"}>TRẠNG THÁI NHẬP HÀNG</TableColumn>
            <TableColumn>TRẠNG THÁI YÊU CẦU</TableColumn>
            <TableColumn>NGÀY TẠO YÊU CẦU</TableColumn>
            <TableColumn align={"center"}>NGƯỜI TẠO</TableColumn>
            <TableColumn>HÀNH ĐỘNG</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={
              isFetching ? <Loading /> : <p className={"italic"}>Không có yêu cầu nhập hàng nào</p>
            }
          >
            {listRequests.map((request, index) => (
              <TableRow key={request._id}>
                <TableCell className={"text-center"}>{index + (currentPage - 1) * 10 + 1}</TableCell>
                <TableCell>#{sliceText(request._id)}</TableCell>
                <TableCell>{request.branchId.branchConfig.branchDisplayName}</TableCell>
                <TableCell>{request.supplierId?.supplierName ?? "-"}</TableCell>

                <TableCell>
                  <Chip
                    color={`${request.requestItems.filter((item) => item.importStatus).length === request.requestItems.length ? "success" : "danger"}`}
                    variant={"shadow"}
                  >
                    {`${request.requestItems.filter((item) => item.importStatus).length}/${request.requestItems.length}`}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Chip color={MapRequestStatusColor[request.requestStatus]} variant={"shadow"}>
                    {MapRequestStatusText[request.requestStatus]}
                  </Chip>
                </TableCell>
                <TableCell>{formatDate(request.createdAt)}</TableCell>
                <TableCell>{request.creatorId}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => navigate(adminRoutes.importRequests.details(request._id))}
                    startContent={iconConfig.details.base}
                    isIconOnly={true}
                    color={"secondary"}
                    variant={"ghost"}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </WrapperContainer>
  );
};

export default ImportRequestManagement;
