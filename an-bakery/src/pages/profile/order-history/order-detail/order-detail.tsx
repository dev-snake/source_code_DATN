import ClientHeader from "@/components/client/client-header";
import LoadingClient from "@/components/common/loading-client";
import iconConfig from "@/config/icons/icon-config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import clientRoutes from "@/config/routes/client-routes.config";
import useAxios from "@/hooks/useAxios";
import useCart from "@/hooks/useCart";
import useCustomerAxios from "@/hooks/useCustomerAxios";
import { IAPIResponse } from "@/types/api-response";
import { ICake, ICakeRate } from "@/types/cake";
import { IOrder, IOrderItem, IOrderUrgent } from "@/types/order";
import { calculateDiscountPrice, formatCurrencyVND } from "@/utils/money-format";
import { sliceText } from "@/utils/slice-text";
import { slugify } from "@/utils/slugify";
import { Button, Image, useDisclosure } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import BillInfo from "./bill-info";
import FormCancelOrder from "./form-cancel-order";
import FormConfirmBuyAgaintOrder from "./form-confirm-buy-againt-order";
import FormOrderFeedback from "./form-order-feedback";
import FormReturnOrder from "./form-return-order";
import OrderCustomerInfo from "./order-customer-info";
import OrderStatus from "./order-status";
const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isOpenBuyAgain,
    onOpen: onOpenBuyAgain,
    onOpenChange: onOpenChangeBuyAgain,
  } = useDisclosure();
  const {
    isOpen: isOpenOrderReturn,
    onOpen: onOpenOrderReturn,
    onOpenChange: onOpenChangeOrderReturn,
  } = useDisclosure();
  const { handleShowSelectedVariant, handlePrice } = useCart();
  const axiosClient = useAxios();
  const axiosCustomer = useCustomerAxios();
  const [cakePayload, setCakePayload] = useState<Partial<IOrderItem>>({
    cakeId: "",
    selectedVariants: [],
  });
  const [cancelReason, setCancelReason] = useState<string>("");
  const [orderReturn, setOrderReturn] = useState<string>("");
  const [orderData, setOrderData] = useState<IOrder>();

  const [rates, setRates] = useState<ICakeRate>({
    rateContent: "",
    rateStars: 5,
  });
  const {
    isOpen: isOpenFeedback,
    onOpen: onOpenFeedback,
    onOpenChange: onOpenChangeFeedback,
  } = useDisclosure();

  const navigate = useNavigate();
  const handleCancelOrder = (orderId: string) => {
    console.log("Cancel order", cancelReason);
    if (orderData?.orderStatus !== "processing") {
      onOpenChange();
      return toast.error("Bạn không thể hủy đơn hàng đã được xác nhận");
    }
    axiosClient
      .patch<IAPIResponse>(apiRoutes.orders.cancelOrder(orderId), {
        explainReason: cancelReason,
        orderStatus: "cancelled",
      })
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          setOrderData({ ...orderData!, orderStatus: "cancelled", explainReason: cancelReason });
        }
      })
      .catch((err) => console.log(err))
      .finally(() => onOpenChange());
  };
  const handleOrderReturn = async (_orderId: string) => {
    axiosClient
      .patch<IAPIResponse>(apiRoutes.orders.cancelOrder(_orderId), {
        explainReason: orderReturn,
        orderStatus: "returned",
      })
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          setOrderData({ ...orderData!, orderStatus: "returned", explainReason: orderReturn });
        }
      })
      .catch((err) => console.log(err))
      .finally(() => onOpenChangeOrderReturn());
  };
  const handleFeedbackOrder = () => {
    axiosCustomer
      .post<IAPIResponse>(apiRoutes.orders.rates(orderId as string), {
        cakePayload,
        rateContent: rates.rateContent,
        rateStars: rates.rateStars,
      })
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          console.log("Feedback order", response);
          toast.success("Đánh giá đơn hàng thành công");
          navigate(clientRoutes.profile.root);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => onOpenChangeFeedback());
  };
  const handleBuyAgainOrder = () => {
    console.log("Buy again order", orderId);
  };
  const getOrderData = (orderId: string) => {
    axiosClient
      .get<IAPIResponse<IOrder>>(apiRoutes.orders.getOne(orderId))
      .then((response) => response.data)
      .then((response) => {
        console.log("🚀 ~ .then ~ response:", response.results);
        setOrderData(response.results);
      });
  };

  useEffect(() => {
    if (!orderId) {
      return;
    }

    getOrderData(orderId);
  }, []);

  if (!orderData || !orderId) {
    return <LoadingClient />;
  }

  return (
    <section>
      <FormCancelOrder
        isOpen={isOpen}
        onOpen={onOpen}
        onOpenChange={onOpenChange}
        onConfirm={() => handleCancelOrder(orderId)}
        setCancelReason={setCancelReason}
      />
      <FormReturnOrder
        isOpen={isOpenOrderReturn}
        onOpen={onOpenChangeOrderReturn}
        onOpenChange={onOpenChangeOrderReturn}
        onConfirm={() => handleOrderReturn(orderId)}
        setOrderReturn={setOrderReturn}
      />
      <FormConfirmBuyAgaintOrder
        isOpen={isOpenBuyAgain}
        onOpen={onOpenBuyAgain}
        onOpenChange={onOpenChangeBuyAgain}
        onConfirm={handleBuyAgainOrder}
      />
      <FormOrderFeedback
        isOpen={isOpenFeedback}
        onOpen={onOpenFeedback}
        onOpenChange={onOpenChangeFeedback}
        onConfirm={handleFeedbackOrder}
        setRates={setRates}
      />
      <div className="mx-auto mt-8 w-[1280px]">
        <div>
          <ClientHeader
            title={`Thông tin đơn hàng #${sliceText(orderData._id)}`}
            showBackButton={true}
            refBack={clientRoutes.profile.root}
          />

          <div className="mt-8 flex gap-x-3">
            <div className="flex w-full flex-col gap-4">
              <div className="rounded-2xl border shadow-custom">
                <div className="flex items-center justify-between px-4 py-2">
                  <h4 className={"text-dark"}>Danh sách mặt hàng - {orderData.orderItems.length} bánh</h4>
                  <h6 className="rounded-lg bg-default/50 px-4 py-2">
                    {orderData.branchId.branchConfig.branchDisplayName}
                  </h6>
                </div>
                <div className="px-4 py-2">
                  {orderData.orderItems.map((item, index) => (
                    <div className="mt-2 flex items-center justify-between p-2" key={index}>
                      <div className="flex items-center gap-x-4">
                        <Image
                          src={`http://localhost:3000/images/${(item?.cakeId as ICake)._id}/${(item?.cakeId as ICake)?.cakeThumbnail}`}
                          alt={slugify((item.cakeId as ICake).cakeName)}
                          height={75}
                          width={75}
                        />
                        <div className="overflow-hidden">
                          <h5>{(item?.cakeId as ICake).cakeName}</h5>
                          <p className="mt-1 truncate text-sm">
                            {handleShowSelectedVariant(
                              item.selectedVariants,
                              (item?.cakeId as ICake).cakeVariants,
                            )}
                          </p>
                          <p className="mt-1 text-base font-semibold text-default-300">x{item.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-x-8">
                        <h5 className="text-primary">
                          {formatCurrencyVND(
                            (item.cakeId as ICake).cakeDefaultPrice,
                            (item.cakeId as ICake).discountPercents,
                          )}
                        </h5>
                        <h5 className="text-primary">
                          {handlePrice(
                            calculateDiscountPrice(
                              (item.cakeId as ICake).cakeDefaultPrice,
                              (item.cakeId as ICake).discountPercents,
                            ) * item.quantity,
                            item.selectedVariants,
                            (item.cakeId as ICake).cakeVariants,
                            item.quantity,
                          )}
                        </h5>
                        {orderData.orderStatus === "completed" && (
                          <Button
                            isIconOnly
                            color={"warning"}
                            variant={"ghost"}
                            isDisabled={item.isRated as boolean}
                            onPress={() => {
                              onOpenChangeFeedback();
                              setCakePayload({
                                cakeId: (item?.cakeId as ICake)._id,
                                selectedVariants: item.selectedVariants,
                              });
                            }}
                          >
                            {iconConfig.star.base}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <OrderCustomerInfo
                customerInfo={orderData.orderGroupId.customerInfo}
                paymentStatus={orderData.orderGroupId.paymentStatus}
                deliveryMethod={orderData.orderOptions?.deliveryMethod}
                urgentOrder={orderData.orderUrgent as IOrderUrgent}
              />
            </div>
            <div className="flex basis-4/12 flex-col gap-4">
              <BillInfo
                orderSummary={orderData.orderSummary}
                voucherData={orderData.voucherCode}
                orderPointUsage={orderData.orderPoint ?? 0}
              />
              <OrderStatus orderStatus={orderData.orderStatus} explainReason={orderData.explainReason} />
              <div className="w-full">
                {orderData.orderStatus === "completed" && (
                  <>
                    <Button
                      className="mb-2 w-full"
                      variant="ghost"
                      color="secondary"
                      size="lg"
                      radius="lg"
                      onPress={() => onOpenBuyAgain()}
                    >
                      Mua lại đơn hàng này
                    </Button>
                    <Button
                      className="mb-2 w-full"
                      variant="solid"
                      color="danger"
                      size="lg"
                      radius="lg"
                      onPress={onOpenChangeOrderReturn}
                    >
                      Trả Hàng
                    </Button>
                  </>
                )}
                {orderData.orderStatus !== "cancelled" &&
                orderData.orderStatus !== "completed" &&
                orderData.orderStatus !== "returned" ? (
                  <Button
                    startContent={iconConfig.xMark.medium}
                    color="danger"
                    className="w-full"
                    size="lg"
                    onClick={onOpen}
                    radius="lg"
                  >
                    Hủy đơn hàng
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderDetail;
