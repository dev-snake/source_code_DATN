import AdminHeader from "@/components/admin/admin-header";
import WrapperContainer from "@/components/admin/wrapper-container";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import { ChipProps } from "@nextui-org/react";
import CakesInventory from "./cakes-inventory";
import MaterialsInventory from "./materials-inventory";

export const MapHistoryChangeTypeText: Record<string, string> = {
  forOrder: "Đơn hàng",
  removeExpired: "Hết hạn",
  newImport: "Nhập kho",
  forTest: "Thử nghiệm",
};

export const MapHistoryChangeTypeColor: Record<string, ChipProps["color"]> = {
  forOrder: "success",
  removeExpired: "danger",
  newImport: "warning",
  forTest: "secondary",
};

const BranchInventoryManagement = () => {
  const currentBranch = useCurrentBranch();
  return (
    <WrapperContainer>
      <AdminHeader title="Quản lí kho" refBack="" />
      <div className={"grid grid-cols-2 gap-4"}>
        <MaterialsInventory currentBranch={currentBranch} />
        <CakesInventory currentBranch={currentBranch} />
      </div>
    </WrapperContainer>
  );
};

export default BranchInventoryManagement;
