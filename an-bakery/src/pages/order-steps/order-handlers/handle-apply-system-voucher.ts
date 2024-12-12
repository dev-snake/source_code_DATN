import { IOrderGroupForm } from "@/types/order";
import { IAPIResponse } from "@/types/api-response";
import { apiRoutes } from "@/config/routes/api-routes.config";
import calculateDiscount from "@/utils/calculate-discount";
import { AxiosInstance } from "axios";
import { toast } from "react-toastify";

interface IVoucherCodeSystemApplied {
  voucherCode: string;
  reducedFee: number;
  originalReducedFee?: number;
}

interface IApplySystemVoucherProps {
  axiosCustomer: AxiosInstance;
  orderGroup: IOrderGroupForm;
  shipFee: number;
  inputVoucherCode: IVoucherCodeSystemApplied | undefined;
  onOpenSystemVoucherChange: () => void;
  setOrderGroup: React.Dispatch<React.SetStateAction<IOrderGroupForm>>;
  setDiscountValueOfSystemVoucher: React.Dispatch<React.SetStateAction<number>>;
}

const handleApplySystemVoucher = ({
  shipFee,
  orderGroup,
  axiosCustomer,
  inputVoucherCode,
  onOpenSystemVoucherChange,
  setOrderGroup,
  setDiscountValueOfSystemVoucher,
}: IApplySystemVoucherProps) => {
  const urlParams = new URLSearchParams(window.location.search);
  const getUrlParams = urlParams.get("voucherCodeSystem");
  if (!inputVoucherCode?.voucherCode) {
    return toast.error("Vui lòng nhập mã giảm giá");
  }
  if (getUrlParams) {
    const decodedUrlParams = atob(getUrlParams);
    if (decodedUrlParams === inputVoucherCode.voucherCode) {
      return toast.error("Bạn đã áp dụng mã voucher.");
    }
  }

  axiosCustomer
    .post<IAPIResponse>(apiRoutes.vouchers.check, {
      voucherCode: inputVoucherCode.voucherCode,
      orderData: {
        subTotalPrice: orderGroup.subTotalPrice,
      },
    })
    .then((response) => response.data)
    .then((response: any) => {
      if (response.status === "success") {
        const { discountValue, maxValue, type } = response.voucherData;
        const subTotalPrice = orderGroup.subTotalPrice;
        let reducedFee: number = calculateDiscount(subTotalPrice, shipFee, type, discountValue, maxValue);

        setDiscountValueOfSystemVoucher(reducedFee);
        const encodedVoucherCodeSystem = btoa(
          JSON.stringify({
            voucherCode: inputVoucherCode.voucherCode,
            reducedFee,
            type,
          }),
        );
        if (getUrlParams) {
          const decodedUrlParams = JSON.parse(atob(getUrlParams));
          if (decodedUrlParams.voucherCode !== inputVoucherCode.voucherCode) {
            return toast.error("Vui lòng xóa mã giảm giá cũ trước khi thêm mã giảm giá mới");
          }
        }
        if (type === "shipFee") {
          if (orderGroup.shippingFee === 0) {
            return toast.warning(
              "Không thể áp dụng mã giảm giá phí vận chuyển cho đơn hàng không có phí vận chuyển",
            );
          }
          setOrderGroup((prev) => ({ ...prev }));
        } else {
          const splitDiscountForBranches = reducedFee / orderGroup.orderData.length;
          setOrderGroup((prev) => {
            const updatedOrderData = prev.orderData.map((orderItem) => {
              return {
                ...orderItem,
                orderSummary: {
                  ...orderItem.orderSummary,
                  reducedFee: orderItem.orderSummary.reducedFee + splitDiscountForBranches,
                  // 🚀
                  totalPrice:
                    orderItem.orderSummary.totalPrice === 0
                      ? 0
                      : orderItem.orderSummary.subTotalPrice + orderItem.orderSummary.shippingFee <=
                          orderItem.orderSummary.reducedFee + splitDiscountForBranches
                        ? 0
                        : orderItem.orderSummary.subTotalPrice + orderItem.orderSummary.shippingFee,
                  // 🚀
                },
              };
            });

            return {
              ...prev,
              orderData: updatedOrderData,
              reducedFee,
            };
          });
        }
        urlParams.set("voucherCodeSystem", encodedVoucherCodeSystem);
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.pushState({}, "", newUrl);
        onOpenSystemVoucherChange();
      }
    })
    .catch((error) => {
      toast.error(error.response.data.message);
    });
};

export default handleApplySystemVoucher;
