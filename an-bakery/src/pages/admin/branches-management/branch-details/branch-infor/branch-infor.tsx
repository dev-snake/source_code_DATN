import Loading from "@/components/admin/loading";
import iconConfig from "@/config/icons/icon-config";
import { IBranch } from "@/types/branch";
import { copyToClipboard } from "@/utils/copy-to-clipboard";
import {
  MapBranchTypeColor,
  MapBranchTypeText,
  MapBranchStatusColor,
  MapBranchStatusText,
  MapBranchTypeIcon,
} from "@/utils/map-data/branches";
import { Chip, Divider, Input, Tooltip } from "@nextui-org/react";
import { toast } from "react-toastify";

interface BranchInforProps {
  branchInfo: IBranch;
  numOfStaffs: number;
}

const BranchInformation = ({ branchInfo, numOfStaffs }: BranchInforProps) => {
  return (
    <div className="rounded-2xl border p-4 shadow-custom">
      {branchInfo ? (
        <>
          <h5 className="mb-4">Thông tin chi nhánh</h5>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Input
                label={"Tên chi nhánh"}
                labelPlacement={"outside"}
                size={"lg"}
                isReadOnly
                value={branchInfo.branchConfig.branchDisplayName}
              />
            </div>
            <div className="flex w-full items-center gap-8">
              <div className={"flex flex-col items-center gap-2"}>
                <p>Kiểu chi nhánh</p>
                <Chip
                  size="lg"
                  color={MapBranchTypeColor[branchInfo.branchConfig.branchType]}
                  startContent={MapBranchTypeIcon[branchInfo.branchConfig.branchType]}
                  className={"gap-1 px-4"}
                >
                  {MapBranchTypeText[branchInfo.branchConfig.branchType]}
                </Chip>
              </div>
              <div className={"flex flex-col items-center gap-2"}>
                <p>Nhân viên chi nhánh</p>
                <Chip
                  size="lg"
                  color={"primary"}
                  startContent={iconConfig.user2.base}
                  className={"gap-1 px-4"}
                >
                  {numOfStaffs ?? 0} nhân viên
                </Chip>
              </div>
              <div className={"flex flex-col items-center gap-2"}>
                <p>Thời gian hoạt động</p>
                <div className={"flex items-center gap-2"}>
                  <Chip variant={"dot"} size="lg" color={"success"}>
                    {branchInfo.branchConfig.activeTime.open}
                  </Chip>
                  <Chip variant={"dot"} size="lg" color={"danger"}>
                    {branchInfo.branchConfig.activeTime.close}
                  </Chip>
                </div>
              </div>
              <div className={"flex flex-col items-center gap-2"}>
                <p>Trạng thái hoạt động</p>
                <Chip
                  startContent={iconConfig.dot.base}
                  size="lg"
                  color={MapBranchStatusColor[branchInfo.isActive.toString()]}
                >
                  {MapBranchStatusText[branchInfo.isActive.toString()]}
                </Chip>
              </div>
            </div>
            <Divider />
            <div className="flex items-center gap-4">
              <Input
                label={"Chủ chi nhánh"}
                labelPlacement={"outside"}
                size={"lg"}
                isReadOnly
                value={branchInfo.branchConfig.branchContact.branchOwnerName}
              />
              <Tooltip content={"Click để copy số điện thoại"} placement={"bottom"} showArrow={true}>
                <Input
                  label={"Số điện thoại liên hệ"}
                  labelPlacement={"outside"}
                  size={"lg"}
                  isReadOnly
                  onClick={() => {
                    copyToClipboard(branchInfo.branchConfig.branchContact.branchPhoneNumber);
                    toast.success("Sao chép số điện thoại chi nhánh");
                  }}
                  value={branchInfo.branchConfig.branchContact.branchPhoneNumber}
                />
              </Tooltip>
            </div>
            <div className="flex flex-col gap-4">
              <Input
                label={"Địa chỉ chi nhánh"}
                labelPlacement={"outside"}
                size={"lg"}
                isReadOnly
                value={branchInfo.branchConfig.branchAddress}
              />
              <Input
                label={"Link Map/Link Facebook"}
                labelPlacement={"outside"}
                size={"lg"}
                isReadOnly
                value={branchInfo.branchConfig.mapLink}
              />
            </div>
          </div>
        </>
      ) : (
        <div className={"flex w-full items-center justify-center"}>
          <Loading></Loading>
        </div>
      )}
    </div>
  );
};

export default BranchInformation;
