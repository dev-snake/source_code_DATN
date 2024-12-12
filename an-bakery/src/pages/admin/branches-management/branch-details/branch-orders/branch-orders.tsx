import OrderCard from "@/components/orders/order-card";
import adminRoutes from "@/config/routes/admin-routes.config";
import { IOrder } from "@/types/order";
import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

interface BranchOrdersProps {
  listBranchOrder: IOrder[];
}

const BranchOrders = ({ listBranchOrder }: BranchOrdersProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-y-2">
      {listBranchOrder.length > 0 ? (
        <>
          {listBranchOrder.map((order, index) => (
            <OrderCard refLink={"admin"} key={index} orderData={order} />
          ))}
          <div className={"flex w-full justify-center"}>
            <Button
              color={"primary"}
              variant={"light"}
              className={"w-max"}
              onClick={() => navigate(adminRoutes.order.root)}
            >
              Xem tất cả
            </Button>
          </div>
        </>
      ) : (
        <p className={"italic"}>Chi nhánh chưa có đơn hàng nào</p>
      )}
    </div>
  );
};

export default BranchOrders;
