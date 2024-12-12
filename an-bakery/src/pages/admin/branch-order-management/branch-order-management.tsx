import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { IOrder } from "@/types/order";
import { formatDate } from "@/utils/format-date";
import {
  MapOrderStatusText,
  MapPaymentMethodColor,
  MapPaymentMethodText,
  MapOrderTypeColor,
  MapOrderTypeText,
  MapOrderStatusColor,
} from "@/utils/map-data/orders";
import { formatCurrencyVND } from "@/utils/money-format";
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

const BranchOrderManagement = () => {
  const navigate = useNavigate();

  const staffAxios = useStaffAxios();

  const currentBranch = useCurrentBranch();

  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [metadata, setMetadata] = useState<IPaginationMetadata>();
  const [listOrders, setListOrders] = useState<IOrder[]>([]);
  const [listAllOrders, setListAllOrders] = useState<IOrder[]>([]);
  const [currentStatusFilter, setCurrentStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const getBranchOrders = (noPagination: boolean = false) => {
    return staffAxios
      .get<IAPIResponse<IOrder[]>>(apiRoutes.branches.getBranchOrders(currentBranch), {
        params: {
          noPagination,
          page: currentPage,
          orderStatus: currentStatusFilter === "all" ? undefined : currentStatusFilter,
        },
      })
      .then((response) => response.data);
  };
  const handleSearchTerm = (searchTerm: string) => {
    if (searchTerm === "") {
      setListOrders(listAllOrders.slice(0, 10));
    } else {
      const filteredOrders = listAllOrders.filter((order) => order._id.includes(searchTerm));
      setListOrders(filteredOrders);
    }
  };

  const handleFetch = () => {
    setIsFetching(true);
    setListOrders([]);
    setListAllOrders([]);
    Promise.all([getBranchOrders(), getBranchOrders(true)])
      .then(([orders, allOrders]) => {
        setListOrders(orders.results);
        setListAllOrders(allOrders.results);
        setMetadata(orders.metadata);
      })
      .catch((error) => {
        const { data } = error.response;
        setListOrders(data.results);
        setListAllOrders(data.results);
        setMetadata(data.metadata);
      })
      .finally(() => setIsFetching(false));
  };

  useEffect(() => {
    if (currentBranch) {
      handleFetch();
    }
  }, [currentBranch, currentPage, currentStatusFilter]);

  return (
    <WrapperContainer>
      <AdminHeader title="Đơn hàng của chi nhánh" />
      <div className={"flex flex-col gap-4"}>
        <div className="flex justify-between">
          <Input
            size="lg"
            variant="bordered"
            className="max-w-80"
            endContent={<div className="text-default-300">{iconConfig.search.medium}</div>}
            placeholder="Nhập mã đơn hàng"
            onValueChange={handleSearchTerm}
          />
          <div className="flex items-center gap-x-4">
            <Pagination
              showControls
              showShadow
              color="primary"
              total={metadata?.totalPages || 1}
              page={metadata?.currentPage || 1}
              onChange={setCurrentPage}
            />
            <div className={"flex items-center gap-2"}>
              <p className={"min-w-max"}>Trạng thái đơn hàng</p>
              <Select
                className={"min-w-52"}
                selectedKeys={[currentStatusFilter]}
                onSelectionChange={(e) => {
                  setCurrentStatusFilter(Array.from(e).join(""));
                }}
                disallowEmptySelection={true}
              >
                <SelectItem key={"all"}>Tất cả</SelectItem>
                <SelectItem key={"pending"}>{MapOrderStatusText["pending"]}</SelectItem>
                <SelectItem key={"processing"}>{MapOrderStatusText["processing"]}</SelectItem>
                <SelectItem key={"ready"}>{MapOrderStatusText["ready"]}</SelectItem>
                <SelectItem key={"shipping"}>{MapOrderStatusText["shipping"]}</SelectItem>
                <SelectItem key={"completed"}>{MapOrderStatusText["completed"]}</SelectItem>
                <SelectItem key={"cancelled"}>{MapOrderStatusText["cancelled"]}</SelectItem>
                <SelectItem key={"returned"}>{MapOrderStatusText["returned"]}</SelectItem>
              </Select>
            </div>
          </div>
        </div>
        <Table removeWrapper>
          <TableHeader>
            <TableColumn>STT</TableColumn>
            <TableColumn>MÃ ĐƠN HÀNG</TableColumn>
            <TableColumn className={"max-2xl:hidden"}>NGƯỜI ĐẶT HÀNG</TableColumn>
            <TableColumn align={"center"}>SL SẢN PHẨM</TableColumn>
            <TableColumn align={"center"}>THÀNH TIỀN</TableColumn>
            <TableColumn align={"center"} className={"max-lg:hidden"}>
              PHƯƠNG THỨC THANH TOÁN
            </TableColumn>
            <TableColumn align={"center"} className={"max-xl:hidden"}>
              CHI NHÁNH
            </TableColumn>
            <TableColumn align={"center"}>THỜI GIAN ĐẶT HÀNG</TableColumn>
            <TableColumn align={"center"} className={"max-xl:hidden"}>
              LOẠI ĐƠN HÀNG
            </TableColumn>
            <TableColumn>TRẠNG THÁI</TableColumn>
            <TableColumn>HÀNH ĐỘNG</TableColumn>
          </TableHeader>
          <TableBody emptyContent={isFetching ? <Loading /> : "Không có đơn hàng nào!"}>
            {listOrders.length > 0
              ? listOrders.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + (currentPage - 1) * 10 + 1}</TableCell>
                    <TableCell>#{sliceText(order._id)}</TableCell>
                    <TableCell className={"min-w-max max-2xl:hidden"}>
                      {order.orderGroupId?.customerInfo?.fullName ?? "Hệ thống"}
                    </TableCell>
                    <TableCell>
                      <div className={"flex justify-center"}>
                        <p
                          className={
                            "flex h-8 w-8 items-center justify-center rounded-full bg-success font-semibold text-white"
                          }
                        >
                          {order.orderItems.length}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className={"font-semibold text-primary"}>
                        {formatCurrencyVND(order.orderSummary.totalPrice)}
                      </p>
                    </TableCell>
                    <TableCell className={`text-center max-lg:hidden`}>
                      <Chip color={MapPaymentMethodColor[order.orderGroupId.paymentStatus]}>
                        {MapPaymentMethodText[order.orderGroupId.paymentStatus]}
                      </Chip>
                    </TableCell>
                    <TableCell className={`text-center max-xl:hidden`}>
                      {order.branchId?.branchConfig?.branchDisplayName ?? "-"}
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt as string, "fullDate")}</TableCell>

                    <TableCell className={`text-center max-lg:hidden`}>
                      <Chip color={MapOrderTypeColor[order.orderType]} variant={"flat"}>
                        {MapOrderTypeText[order.orderType]}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip color={MapOrderStatusColor[order.orderStatus]} variant="flat">
                        {MapOrderStatusText[order.orderStatus]}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => navigate(adminRoutes.order.details(order._id))}
                        startContent={iconConfig.details.base}
                        isIconOnly={true}
                        color={"secondary"}
                        variant={"ghost"}
                      />
                    </TableCell>
                  </TableRow>
                ))
              : []}
          </TableBody>
        </Table>
      </div>
    </WrapperContainer>
  );
};

export default BranchOrderManagement;
