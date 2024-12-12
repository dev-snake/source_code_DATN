import textSizes from "@/config/styles/text-size";
import { Button, Input } from "@nextui-org/react";

interface OrderVoucherProps {
  onOpenSystemVoucherChange: () => void;
}
interface IVoucherCodeSystemApplied {
  voucherCode: string;
  reducedFee: number;
}
const OrderVoucher = ({ onOpenSystemVoucherChange }: OrderVoucherProps) => {
  const getVoucherCode = (): string => {
    const voucherCodeSystem = new URLSearchParams(window.location.search).get("voucherCodeSystem");
    if (!voucherCodeSystem) return "";

    const decodedVoucherCode = atob(voucherCodeSystem);
    if (decodedVoucherCode === "ée") return "";

    try {
      const parsedVoucher = JSON.parse(decodedVoucherCode);
      return parsedVoucher.voucherCode || "";
    } catch (error) {
      console.error("Failed to parse voucher code:", error);
      return "";
    }
  };
  return (
    <div className="flex items-center gap-2">
      <Input
        value={getVoucherCode()}
        isReadOnly
        radius="md"
        label={"Mã giảm giá: "}
        labelPlacement={"outside-left"}
        classNames={{
          mainWrapper: "w-full",
          label: "text-base min-w-max",
        }}
      />
      <Button color="primary" onPress={() => onOpenSystemVoucherChange()}>
        Chọn
      </Button>
    </div>
  );
};

export default OrderVoucher;
