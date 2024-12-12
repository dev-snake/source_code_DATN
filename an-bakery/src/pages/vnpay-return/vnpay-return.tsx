import { useEffect, useState } from "react";
import Lottie from "react-lottie";
import { useNavigate, useSearchParams } from "react-router-dom";

import orderFailureLottie from "@/assets/lottie-gif-icon/order-failure.json";
import orderSuccessLottie from "@/assets/lottie-gif-icon/order-success.json";
import waitingLottie from "@/assets/lottie-gif-icon/waiting.json";
import { apiRoutes } from "@/config/routes/api-routes.config";
import clientRoutes from "@/config/routes/client-routes.config";
import useAxios from "@/hooks/useAxios";
import useCustomerAxios from "@/hooks/useCustomerAxios";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse } from "@/types/api-response";
import { IOrder, IOrderGroup } from "@/types/order";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import clearCart from "../order-steps/order-handlers/clear-cart";

interface VnpayReturnProps {}

const VnpayReturn = (props: VnpayReturnProps) => {
  const navigate = useNavigate();
  const staffAxios = useStaffAxios();
  const clientAxios = useAxios();
  const customerAxios = useCustomerAxios();
  const [_, setCookie] = useCookies(["totalQuantity"]);
  const [searchParams] = useSearchParams();

  const [transactionStatus, setTransactionStatus] = useState<string>("");
  const [orderGroupId, setOrderGroupId] = useState<string>("");

  useEffect(() => {
    if (searchParams) {
      setOrderGroupId(searchParams?.get("vnp_TxnRef") ?? "");
      setTransactionStatus(searchParams?.get("vnp_TransactionStatus") ?? "");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!orderGroupId) return;
    const handleUpdatePaymentStatus = async () => {
      try {
        const [orderGroup, orderDetail] = await Promise.all([
          clientAxios.patch<IAPIResponse<IOrderGroup>>(apiRoutes.orders.updatePaymentStatus(orderGroupId), {
            paymentStatus: transactionStatus === "00" ? "success" : "failed",
          }),
          clientAxios.get<IAPIResponse<IOrder>>(apiRoutes.orders.getOrderByGroupId(orderGroupId)),
        ]);
        if (orderGroup.data.results && orderDetail.data.results) {
          if (orderGroup.data.results.paymentStatus === "failed") {
            await staffAxios.patch<IAPIResponse<IOrder>>(
              apiRoutes.orders.cancelOrder(orderDetail.data.results._id),
              {
                orderStatus: "cancelled",
                explainReason: "Huỷ do không thanh toán.",
              },
            );
          } else {
            setCookie("totalQuantity", 0, { path: "/" });
            clearCart({ axiosCustomer: customerAxios });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        toast.info("Điều hướng về trang chủ", { autoClose: 4000 });
        setTimeout(() => {
          navigate(clientRoutes.home);
        }, 4000);
      }
    };
    handleUpdatePaymentStatus();
  }, [orderGroupId, transactionStatus]);

  return (
    <section>
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex max-w-64 items-center">
          <Lottie
            options={{
              loop: true,
              autoplay: true,
              animationData: !transactionStatus
                ? waitingLottie
                : transactionStatus === "00"
                  ? orderSuccessLottie
                  : orderFailureLottie,
              rendererSettings: {
                preserveAspectRatio: "xMidYMid slice",
              },
            }}
          />
        </div>
        {!transactionStatus ? (
          <h3 className="text-center">ĐANG ĐỢI PHẢN HỒI</h3>
        ) : transactionStatus === "00" ? (
          <h3 className={"text-center"}>Thanh toán thành công</h3>
        ) : (
          <h3 className={"text-center"}>Thanh toán thất bại</h3>
        )}

        <p className={`text-default-flat mb-8 text-center`}>
          {!transactionStatus
            ? "Bạn đợi tí nhaaa, sắp được rồi"
            : transactionStatus === "00"
              ? "Cảm ơn bạn đã mua hàng của chúng tôi"
              : "Thanh toán không thành công do có lỗi"}
        </p>
      </div>
    </section>
  );
};

export default VnpayReturn;
