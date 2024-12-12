import { TVoucherType } from "@/types/voucher";
const calculateDiscount = (
  orderValue: number,
  shippingFee: number,
  type: TVoucherType,
  discountValue: number,
  maxValue: number,
) => {
  let discountAmount = 0;
  switch (type) {
    case "fixed":
      discountAmount = discountValue;
      if (maxValue > 0) {
        discountAmount = Math.min(discountAmount, maxValue);
      }
      return discountAmount;
    case "percentage":
      discountAmount = (discountValue / 100) * orderValue;
      if (maxValue === 0) {
        return discountAmount;
      }
      discountAmount = Math.min(discountAmount, maxValue);
      return discountAmount;
    case "shipFee":
      discountAmount = (discountValue / 100) * shippingFee;
      if (maxValue === 0) {
        return discountAmount;
      }
      discountAmount = Math.min(discountAmount, maxValue);
      return discountAmount;
  }
};
export default calculateDiscount;
