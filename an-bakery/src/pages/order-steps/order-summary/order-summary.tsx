import { IUserCart } from "@/types/cart";
import { IOrderGroupForm } from "@/types/order";
import { formatCurrencyVND } from "@/utils/money-format";
import { Button, Divider } from "@nextui-org/react";

interface OrderSummaryProps {
  cartCustomer: IUserCart[];
  orderGroup: IOrderGroupForm;
  shipFee: number;
  pointOfCustomer: number;
  isCheckUsePoint: boolean;
  calculateOrderInfo: {
    subTotalPrice: number;
    shippingFee: number;
    reducedFeeOfBranches: number;
    totalPrice: number;
  };
  handleCreateOrder: () => void;
  totalBranch: (branchId: string) => number;
}

const OrderSummary = ({
  orderGroup,
  pointOfCustomer,
  isCheckUsePoint,
  calculateOrderInfo,
  handleCreateOrder,
}: OrderSummaryProps) => {
  return (
    <div className="flex grow flex-col gap-2 bg-transparent">
      <div className="flex items-center justify-between">
        <p className={"text-lg font-bold text-dark/50"}>TỔNG THÀNH TIỀN ĐƠN HÀNG:</p>
        <p className={"text-2xl font-bold"}>{formatCurrencyVND(orderGroup.subTotalPrice)}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className={"text-lg font-bold text-dark/50"}>TỔNG PHÍ VẬN CHUYỂN:</p>
        <p className={"text-2xl font-bold"}>{formatCurrencyVND(orderGroup.shippingFee)}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className={"text-lg font-bold text-dark/50"}>TỔNG GIẢM GIÁ CHI NHÁNH:</p>
        <p className={"text-2xl font-bold"}>- {formatCurrencyVND(calculateOrderInfo.reducedFeeOfBranches)}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className={"text-lg font-bold text-dark/50"}>GIẢM GIÁ HT:</p>
        <p className={"text-2xl font-bold"}>{formatCurrencyVND(orderGroup.reducedFee)}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className={"text-lg font-bold text-dark/50"}>GIẢM GIÁ XU ĐIỂM TIÊU DÙNG:</p>
        <p className={"text-2xl font-bold"}>
          - {isCheckUsePoint ? formatCurrencyVND(pointOfCustomer) : "0đ"}
        </p>
      </div>
      <Divider />
      <div className="flex items-center justify-between">
        <p className={"text-2xl font-bold text-dark"}>TỔNG THANH TOÁN:</p>
        <p className={"text-4xl font-bold text-primary"}>{formatCurrencyVND(orderGroup.totalPrice)}</p>
      </div>
      <Button size="lg" color="primary" onPress={handleCreateOrder}>
        Đặt hàng
      </Button>
    </div>
  );
};

export default OrderSummary;
