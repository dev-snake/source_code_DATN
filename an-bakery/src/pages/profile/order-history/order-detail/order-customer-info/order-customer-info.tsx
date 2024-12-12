import iconConfig from "@/config/icons/icon-config";
import { ICustomerInfo, IOrderUrgent, TDeliveryMethod, TPaymentStatus } from "@/types/order";
import { formatDate } from "@/utils/format-date";
import {
  MapPaymentStatusColor,
  MapPaymentStatusText,
  MapDeliveryMethodColor,
  MapDeliveryMethodText,
} from "@/utils/map-data/orders";
import { Chip, Input } from "@nextui-org/react";

interface OrderCustomerInfoProps {
  customerInfo: ICustomerInfo;
  paymentStatus: TPaymentStatus;
  deliveryMethod: TDeliveryMethod;
  urgentOrder: IOrderUrgent;
}

const OrderCustomerInfo = ({
  customerInfo,
  paymentStatus,
  deliveryMethod,
  urgentOrder,
}: OrderCustomerInfoProps) => (
  <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom">
    <h4>Thông tin nhận hàng</h4>
    <div className="flex w-full items-center gap-4">
      <Input
        label="Họ và tên"
        labelPlacement={"outside"}
        value={customerInfo.fullName}
        size={"lg"}
        isReadOnly
      />
      <Input
        label="Số điện thọai"
        labelPlacement={"outside"}
        value={customerInfo.phoneNumber}
        size={"lg"}
        isReadOnly
      />
      <Input label="Email" labelPlacement={"outside"} value={customerInfo.email} size={"lg"} isReadOnly />
    </div>
    <div className="mt-2">
      <Input
        label="Địa chỉ nhận hàng"
        labelPlacement={"outside"}
        value={customerInfo.fullAddress}
        size={"lg"}
        isReadOnly
      />
    </div>
    <div className="flex items-center gap-4">
      <div className={"flex flex-col items-center gap-2"}>
        <p className="text-dark">Phương thức thanh toán</p>
        <Chip color={MapPaymentStatusColor[paymentStatus]} size={"lg"}>
          {MapPaymentStatusText[paymentStatus]}
        </Chip>
      </div>
      <div className={"flex flex-col items-center gap-2"}>
        <p className="text-dark">Phương thức nhận hàng</p>
        <Chip color={MapDeliveryMethodColor[deliveryMethod]} size={"lg"}>
          {MapDeliveryMethodText[deliveryMethod]}
        </Chip>
      </div>
      {urgentOrder?.isUrgent && (
        <div className={"flex flex-col items-center gap-2"}>
          <p className="text-dark">Đơn hoả tốc</p>
          <Chip size={"lg"} color="danger" startContent={iconConfig.reset.noti.base}>
            {formatDate(urgentOrder.orderExpectedTime, "onlyDate")}
          </Chip>
        </div>
      )}
    </div>
  </div>
);

export default OrderCustomerInfo;
