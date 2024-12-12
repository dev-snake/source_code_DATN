import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import { IOrder, ITotalAnalytics } from "@/types/order";
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
} from "@nextui-org/react";
import QuickReport from "./quick-report";
import adminRoutes from "@/config/routes/admin-routes.config";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { formatDate } from "@/utils/format-date";
import { formatCurrencyVND } from "@/utils/money-format";
import { sliceText } from "@/utils/slice-text";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapOrderStatusText,
  MapPaymentMethodColor,
  MapPaymentMethodText,
  MapOrderTypeColor,
  MapOrderTypeText,
  MapOrderStatusColor,
} from "@/utils/map-data/orders";
import useRole from "@/hooks/useRole";

const OrdersManagement = () => {
  const navigate = useNavigate();
  const staffAxios = useStaffAxios();
  const currentStaffRole = useRole();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [listOrders, setListOrders] = useState<IOrder[]>([]);
  const [listAllOrders, setListAllOrders] = useState<IOrder[]>([]);
  const [metadata, setMetadata] = useState<IPaginationMetadata>();
  const [currentStatusFilter, setCurrentStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [analyticsData, setAnalyticsData] = useState<ITotalAnalytics>();

  const getAllOrders = (noPagination: boolean = false) => {
    return staffAxios
      .get<IAPIResponse<IOrder[]>>(apiRoutes.orders.getAll, {
        params: {
          noPagination,
          page: currentPage,
          orderStatus: currentStatusFilter === "all" ? undefined : currentStatusFilter,
        },
      })
      .then((response) => response.data);
  };

  const handleSearchOrders = (searchText: string) => {
    if (searchText === "") {
      setListOrders(listAllOrders.slice(0, 10));
    } else {
      const filteredOrders = listAllOrders.filter((order) => order._id.includes(searchText));
      setListOrders(filteredOrders);
    }
  };

  const getTotalAnalytics = () => {
    staffAxios
      .get(apiRoutes.orders.analytics)
      .then((response) => response.data)
      .then((response) => {
        setAnalyticsData(response.results);
      });
  };

  useEffect(() => {
    if (currentStaffRole !== 2) {
      return navigate(adminRoutes.branchOrder.root);
    }

    setIsLoading(true);
    Promise.all([getAllOrders(), getAllOrders(true), getTotalAnalytics()])
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
      .finally(() => setIsLoading(false));
  }, [currentPage, currentStatusFilter]);

  return (
    <WrapperContainer>
      <AdminHeader title="Quản lí đơn hàng" refBack="Orders" />
      <div className={"flex flex-col items-start gap-4"}>
        <QuickReport analyticsData={analyticsData} />
        <div className={"flex w-full items-center justify-between"}>
          <Input
            size={"lg"}
            variant="bordered"
            className="max-w-80"
            endContent={<div className="text-dark/25">{iconConfig.search.medium}</div>}
            onValueChange={handleSearchOrders}
            placeholder="Nhập mã đơn hàng"
          />
          <div className={"flex items-center gap-4"}>
            <Pagination
              showControls
              showShadow
              color="primary"
              total={metadata?.totalPages || 1}
              page={metadata?.currentPage || 1}
              onChange={setCurrentPage}
            />
            <div className="flex items-center gap-2">
              <p className={"min-w-max"}>Trạng thái đơn hàng</p>
              <Select
                className={"min-w-52"}
                size={"lg"}
                selectedKeys={[currentStatusFilter]}
                onSelectionChange={(e) => setCurrentStatusFilter(Array.from(e).join(""))}
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
        <div className={"flex w-full flex-col gap-4"}>
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
            <TableBody emptyContent={isLoading ? <Loading /> : "Không có đơn hàng nào!"}>
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
      </div>
    </WrapperContainer>
  );
};

export default OrdersManagement;
