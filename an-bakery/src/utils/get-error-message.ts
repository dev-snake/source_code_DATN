import { toast } from "react-toastify";

interface Error {
  response: {
    data: {
      message: string;
      status: string;
    };
  };
}
const getErrorMessageApplyVoucher = (error: Error) => {
  if (error.response.data.message === "Voucher is not valid in the current date range.") {
    toast.error("Mã giảm giá đã hết hạn");
  } else if (
    error.response.data.message === "Order subtotal doesn't meet the minimum value required for the voucher."
  ) {
    toast.error("Đơn hàng không đủ điều kiện");
  } else if (error.response.data.message === "Voucher is not valid for this branch.") {
    toast.error("Mã giảm giá không hợp lệ cho");
  } else {
    toast.error("Mã giảm giá không hợp lệ");
  }
};
export default getErrorMessageApplyVoucher;
