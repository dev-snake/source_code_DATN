const formatCurrencyVND = (amount: number, discountPercent: number = 0) => {
  const formatCurrency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
  if (discountPercent === 0) return formatCurrency.format(amount);
  const discountPrice = amount * ((100 - discountPercent) / 100);
  return formatCurrency.format(discountPrice);
};
const calculateDiscountPrice = (amount: number, discountPercent: number = 0) => {
  if (discountPercent === 0) return amount;
  return amount * ((100 - discountPercent) / 100);
};
export { formatCurrencyVND, calculateDiscountPrice };
