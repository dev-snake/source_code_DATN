import iconConfig from "@/config/icons/icon-config";
import { TOrderStatus } from "@/types/order";
import { Button, Spinner } from "@nextui-org/react";

interface OrderStatusProps {
  orderStatus: TOrderStatus;
  explainReason: string;
}

const OrderStatus = ({ orderStatus, explainReason }: OrderStatusProps) => {
  let statusContent,
    statusColor: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined,
    statusIcon;

  switch (orderStatus) {
    case "rejected":
      statusContent = "Đơn hàng bị từ chối";
      statusColor = "danger";
      statusIcon = iconConfig.xMark.medium;
      break;
    case "cancelled":
      statusContent = "Đơn hàng bị hủy";
      statusColor = "danger";
      statusIcon = iconConfig.xMark.medium;
      break;
    case "pending":
      statusContent = "Đang chờ xác nhận";
      statusColor = "warning";
      statusIcon = <Spinner size="sm" color="warning" />;
      break;
    case "queue":
      statusContent = "Đã tiếp nhận đơn hàng";
      statusColor = "secondary";
      statusIcon = iconConfig.check.medium;
      break;
    case "processing":
      statusContent = "Đang làm đơn hàng";
      statusColor = "secondary";
      statusIcon = <Spinner size="sm" color="secondary" />;
      break;
    case "ready":
      statusContent = "Đã sẵn sàng giao/nhận";
      statusColor = "secondary";
      statusIcon = iconConfig.check.medium;
      break;
    case "shipping":
      statusContent = "Đang giao hàng";
      statusColor = "secondary";
      statusIcon = <Spinner size="sm" color="secondary" />;
      break;
    case "completed":
      statusContent = "Đã giao hàng";
      statusColor = "success";
      statusIcon = iconConfig.check.medium;
      break;
    case "returned":
      statusContent = "Đơn hàng bị trả về";
      statusColor = "danger";
      statusIcon = iconConfig.returnedBack.medium;
      break;
    default:
      statusContent = "Trạng thái không xác định";
      statusColor = "default";
      statusIcon = null;
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom">
      <h4>Trạng thái đơn hàng</h4>
      <div className="flex flex-col gap-y-2">
        <Button isDisabled color={statusColor} startContent={statusIcon} variant="flat">
          {statusContent}
        </Button>
        {["rejected", "cancelled"].includes(orderStatus) && (
          <p className="small italic text-danger">Lí do: {explainReason}</p>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;
