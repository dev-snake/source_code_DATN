import { ICustomerInfo, TPaymentStatus } from "@/types/order";
import React from "react";

import { Chip, Divider, Input, Textarea } from "@nextui-org/react";
import { MapPaymentMethodText, MapPaymentStatusColor, MapPaymentStatusText } from "@/utils/map-data/orders";
import { MapPaymentMethodColor } from "../../../../../utils/map-data/orders/index";

interface CustomerInforProps {
  customerOrderInfo?: ICustomerInfo;
  orderPaymentMethod?: TPaymentStatus;
  orderNote?: string;
}
const CustomerInfor: React.FC<CustomerInforProps> = ({
  customerOrderInfo,
  orderPaymentMethod,
  orderNote,
}) => {
  if (!customerOrderInfo) return <></>;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom">
      <h5 className="max-lg:text-xl">Thông tin khách hàng</h5>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-base font-bold uppercase text-dark/50">Họ và tên</p>
          <p className="text-lg font-bold">{customerOrderInfo?.fullName}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-base font-bold uppercase text-dark/50">Số điện thoại</p>
          <p className="text-lg font-bold">{customerOrderInfo?.phoneNumber}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-base font-bold uppercase text-dark/50">Email</p>
          <p className="text-lg font-bold">{customerOrderInfo?.email}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-base font-bold uppercase text-dark/50">Phương thức thanh toán</p>
          <div className={"flex items-center gap-1"}>
            <Chip color={MapPaymentMethodColor[orderPaymentMethod || "cashOnDelivery"]}>
              {MapPaymentMethodText[orderPaymentMethod || "cashOnDelivery"]}
            </Chip>
            <Chip color={MapPaymentStatusColor[orderPaymentMethod || "cashOnDelivery"]}>
              {MapPaymentStatusText[orderPaymentMethod || "cashOnDelivery"]}
            </Chip>
          </div>
        </div>
        <Divider className={"my-2"} />
        <div className="flex flex-col gap-1">
          <Input
            value={customerOrderInfo?.fullAddress}
            label={"Địa chỉ khách hàng"}
            labelPlacement={"outside"}
            isReadOnly
            size={"lg"}
            classNames={{
              label: "font-bold text-base uppercase !text-dark/50",
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Textarea
            classNames={{
              label: "font-bold text-base uppercase !text-dark/50",
            }}
            value={orderNote || "Khách hàng không để lại ghi chú!"}
            label={"Ghi chú của khách hàng"}
            labelPlacement={"outside"}
            size={"lg"}
            isReadOnly
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerInfor;
