import LoadingClient from "@/components/common/loading-client";
import OrderCard from "@/components/orders/order-card";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useCustomerAxios from "@/hooks/useCustomerAxios";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { ReMapOrderData } from "@/types/order-map";
import { Pagination, ScrollShadow } from "@nextui-org/react";
import { useEffect, useState } from "react";

const OrderHistory = () => {
  const axiosCustomer = useCustomerAxios();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listOrders, setListOrders] = useState<ReMapOrderData[]>([]);
  const [metadata, setMetadata] = useState<IPaginationMetadata>();

  useEffect(() => {
    axiosCustomer
      .get<IAPIResponse<ReMapOrderData[]>>(apiRoutes.customers.me.orders)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          setListOrders(response.results);
          setMetadata(response.metadata);
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  }, []);
  if (isLoading) return <LoadingClient />;

  return (
    <div className={"flex flex-col gap-2"}>
      <ScrollShadow
        hideScrollBar={true}
        className="flex h-[650px] max-h-[650px] flex-col gap-2 overflow-auto rounded-2xl border p-4"
      >
        {listOrders.length === 0 ? (
          <p className="p-4 text-center italic">Bạn chưa có đơn hàng nào</p>
        ) : (
          listOrders.map((orderData) => (
            <OrderCard refLink={"customer"} orderData={orderData} key={orderData._id} />
          ))
        )}
      </ScrollShadow>
      <div className="flex justify-center">
        <Pagination
          total={metadata?.totalPages || 1}
          page={metadata?.currentPage || 1}
          onChange={(page) => {
            axiosCustomer
              .get<IAPIResponse<ReMapOrderData[]>>(apiRoutes.customers.me.orders, {
                params: { page },
              })
              .then((response) => response.data)
              .then((response) => {
                if (response.status === "success") {
                  setListOrders(response.results.reverse());
                  setMetadata(response.metadata);
                }
              })
              .catch((error) => console.log(error));
          }}
        />
      </div>
    </div>
  );
};

export default OrderHistory;
