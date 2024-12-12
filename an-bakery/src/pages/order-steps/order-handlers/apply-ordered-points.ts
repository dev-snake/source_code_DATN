import { IOrderGroup, IOrderGroupForm } from "@/types/order";
interface ApplyOrderedPointsProps {
  isCheckUsePoint: boolean;
  setIsCheckUsePoint: React.Dispatch<React.SetStateAction<boolean>>;
  setOrderGroup: React.Dispatch<React.SetStateAction<IOrderGroupForm>>;
  pointOfCustomer: number;
}
const applyOrderedPoints = ({
  isCheckUsePoint,
  setIsCheckUsePoint,
  setOrderGroup,
  pointOfCustomer,
}: ApplyOrderedPointsProps) => {
  setIsCheckUsePoint(!isCheckUsePoint);
  if (isCheckUsePoint) {
    setOrderGroup((prev) => ({
      ...prev,
      orderApplyPoint: 0,
      // totalPrice: prev.totalPrice + pointOfCustomer,
    }));
  } else {
    setOrderGroup((prev) => ({
      ...prev,
      orderApplyPoint: pointOfCustomer,
      // totalPrice: prev.totalPrice - pointOfCustomer,
    }));
  }
};
export default applyOrderedPoints;
