import { formatCurrencyVND } from "@/utils/money-format";
import { Checkbox } from "@nextui-org/react";

interface OrderPointProps {
  pointOfCustomer: number;
  isCheckUsePoint: boolean;
  handleApplyPoint: () => void;
}

const OrderPoint = ({ isCheckUsePoint, pointOfCustomer, handleApplyPoint }: OrderPointProps) => (
  <div className="rounded-2xl border px-4 py-2 shadow-custom">
    <div className="flex items-center justify-between">
      <div className="flex items-end gap-x-4">
        <h6 className="">Sử dụng AnXu của bạn</h6>
        <h6>/</h6>
        <h6 className={"text-primary"}>Bạn đang có: {pointOfCustomer} xu</h6>
      </div>
      {pointOfCustomer > 0 && (
        <div className="flex items-center gap-x-4">
          <h6 className="text-primary">- {formatCurrencyVND(pointOfCustomer)}</h6>
          <Checkbox
            onValueChange={handleApplyPoint}
            isSelected={isCheckUsePoint}
            isDisabled={pointOfCustomer === 0}
          />
        </div>
      )}
    </div>
  </div>
);

export default OrderPoint;
