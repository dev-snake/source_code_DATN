import Loading from "@/components/admin/loading";
import OrderCard from "@/components/orders/order-card";
import { IPaginationMetadata } from "@/types/api-response";
import { IOrder } from "@/types/order";
import { Pagination } from "@nextui-org/react";

interface OrderHistoryProps {
  customerOrders: IOrder[];
  customerOrdersMetadata?: IPaginationMetadata;
  onChangePage: (page: number) => void;
  isFetching: boolean;
}

const OrderHistory = ({
  customerOrders,
  customerOrdersMetadata,
  onChangePage,
  isFetching,
}: OrderHistoryProps) => {
  return (
    <div className="flex min-h-min flex-col gap-4 rounded-2xl border p-4 shadow-custom">
      <div className={"flex items-center gap-2"}>
        <h5>Lịch sử mua hàng</h5>
        <h5>-</h5>
        <h5>{customerOrdersMetadata?.totalRecords ?? 0} đơn hàng</h5>
      </div>
      <div className="flex h-max flex-col gap-y-2">
        {isFetching ? (
          <Loading />
        ) : customerOrders.length > 0 ? (
          customerOrders.map((order, index) => <OrderCard refLink={"admin"} orderData={order} key={index} />)
        ) : (
          <p className={"italic"}>Khách hàng này chưa có đơn hàng nào</p>
        )}
      </div>

      <div className="flex w-full justify-center">
        <Pagination
          total={customerOrdersMetadata?.totalPages ?? 1}
          initialPage={customerOrdersMetadata?.currentPage ?? 1}
          showControls
          showShadow
          isCompact
          onChange={(page) => onChangePage(page)}
        />
      </div>
    </div>
  );
};

export default OrderHistory;
