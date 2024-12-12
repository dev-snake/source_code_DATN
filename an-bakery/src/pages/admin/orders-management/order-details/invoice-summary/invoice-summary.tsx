import { IOrderSummary } from "@/types/order";
import { formatCurrencyVND } from "@/utils/money-format";
import { Divider, Skeleton } from "@nextui-org/react";
import React from "react";

interface InvoiceSummaryProps {
  orderId?: string;
  orderSummary?: IOrderSummary;
}
const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({ orderId, orderSummary }) => {
  return (
    <div className="w-full rounded-2xl border p-4 shadow-custom">
      <h5 className="mb-4 max-lg:text-xl">Hóa đơn</h5>
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between">
          <p className="text-base font-bold uppercase text-dark/50">Tạm tính</p>
          {!orderSummary ? (
            <Skeleton className={"w-48 rounded-lg"}>
              <p>-</p>
            </Skeleton>
          ) : (
            <p className="text-lg font-bold">{formatCurrencyVND(orderSummary.subTotalPrice)}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-base font-bold uppercase text-dark/50">Phí vận chuyển</p>
          {!orderSummary ? (
            <Skeleton className={"w-48 rounded-lg"}>
              <p>-</p>
            </Skeleton>
          ) : (
            <p className="text-lg font-bold">{formatCurrencyVND(orderSummary.shippingFee)}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-base font-bold uppercase text-dark/50">Mã giảm giá</p>
          {!orderSummary ? (
            <Skeleton className={"w-48 rounded-lg"}>
              <p>-</p>
            </Skeleton>
          ) : (
            <p className="text-lg font-bold">{formatCurrencyVND(orderSummary.reducedFee)}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-base font-bold uppercase text-dark/50">Giảm phí vận chuyển</p>
          {!orderSummary ? (
            <Skeleton className={"w-48 rounded-lg"}>
              <p>-</p>
            </Skeleton>
          ) : (
            <p className="text-lg font-bold">{formatCurrencyVND(orderSummary.reducedFee)}</p>
          )}
        </div>
        <Divider />
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold uppercase text-dark">Tổng thanh toán</p>
          {!orderSummary ? (
            <Skeleton className={"w-48 rounded-lg"}>
              <p className={"text-2xl"}>-</p>
            </Skeleton>
          ) : (
            <p className="text-2xl font-bold text-[var(--primary-color)]">
              {formatCurrencyVND(orderSummary.totalPrice)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceSummary;
