import iconConfig from "@/config/icons/icon-config";

import { IVoucher } from "@/types/voucher";
import { copyToClipboard } from "@/utils/copy-to-clipboard";
import { formatDate } from "@/utils/format-date";
import { MapVoucherTypeColor, MapVoucherTypeIcon, MapVoucherTypeText } from "@/utils/map-data/vouchers";
import { formatCurrencyVND } from "@/utils/money-format";
import { Chip, Progress, Tooltip } from "@nextui-org/react";
import { toast } from "react-toastify";

interface VoucherCardProps {
  voucherData: IVoucher;
}

const VoucherCard = ({ voucherData }: VoucherCardProps) => (
  <div className="col-span-1 flex flex-col items-center justify-between gap-8 rounded-xl border bg-gradient-to-r from-primary/25 to-secondary/25 p-4">
    <div className={"flex items-center gap-2"}>
      <Chip
        color={MapVoucherTypeColor[voucherData.voucherConfig.type]}
        startContent={MapVoucherTypeIcon[voucherData.voucherConfig.type]}
        className={"px-4"}
        size={"lg"}
        variant={"shadow"}
      >
        {MapVoucherTypeText[voucherData.voucherConfig.type]}
      </Chip>
      <Chip color={voucherData.branchId ? "secondary" : "primary"} variant={"shadow"} size={"lg"}>
        {voucherData.branchId ? `${voucherData.branchId.branchConfig.branchDisplayName}` : "Hệ thống"}
      </Chip>
    </div>
    <Tooltip showArrow={true} content="Nhấn để copy mã" color={"primary"} closeDelay={0}>
      <div className={"flex cursor-pointer items-center gap-2"}>
        <p
          className={"text-4xl font-black text-primary"}
          onClick={() => {
            copyToClipboard(voucherData.voucherCode);
            toast.success("Đã sao chép mã giảm giá");
          }}
        >
          {voucherData.voucherCode}
        </p>
        <div className={"text-primary"}>{iconConfig.copy.base}</div>
      </div>
    </Tooltip>
    <div className={"flex flex-col gap-2"}>
      {voucherData.voucherConfig.minimumOrderValues && (
        <p>
          Đơn tối thiểu từ{" "}
          <span className={"font-semibold text-primary"}>
            {formatCurrencyVND(voucherData.voucherConfig.minimumOrderValues)}
          </span>
        </p>
      )}
      {voucherData.voucherConfig.maxValue && (
        <p>
          Giảm lên đến{" "}
          <span className={"font-semibold text-primary"}>
            {formatCurrencyVND(voucherData.voucherConfig.maxValue)}
          </span>
        </p>
      )}
    </div>
    <div className={"flex flex-col items-center gap-2"}>
      <div className={"flex items-center gap-2"}>
        <Chip color={"success"} size={"lg"} variant={"shadow"} startContent={iconConfig.dot.base}>
          {formatDate(voucherData.voucherConfig.validFrom, "onlyDate")}
        </Chip>
        <p>đến</p>
        <Chip color={"danger"} size={"lg"} variant={"shadow"} startContent={iconConfig.dot.base}>
          {formatDate(voucherData.voucherConfig.validTo, "onlyDate")}
        </Chip>
      </div>
    </div>
    <Progress
      label={
        voucherData.voucherConfig.maxTotalUsage
          ? `${voucherData.usedCount}/${voucherData.voucherConfig.maxTotalUsage}`
          : "Không giới hạn"
      }
      value={
        voucherData.voucherConfig.maxTotalUsage
          ? (voucherData.usedCount / voucherData.voucherConfig.maxTotalUsage) * 100
          : 100
      }
      maxValue={voucherData.voucherConfig.maxTotalUsage || 100}
      className="w-full"
      size={"sm"}
      classNames={{
        base: "flex flex-row-reverse items-center",
        track: "w-full",
        label: "min-w-max small",
      }}
    />
  </div>
);

export default VoucherCard;
