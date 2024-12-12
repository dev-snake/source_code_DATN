import LoadingClient from "@/components/common/loading-client";
import { apiRoutes } from "@/config/routes/api-routes.config";
import clientRoutes from "@/config/routes/client-routes.config";
import useAxios from "@/hooks/useAxios";
import useCart from "@/hooks/useCart";
import useCustomerAxios from "@/hooks/useCustomerAxios";
import { IAPIResponse, IAPIResponseVoucher } from "@/types/api-response";
import { IBranch } from "@/types/branch";
import { ICustomer, IUserAddresses } from "@/types/customer";
import { IOrderGroup, IOrderGroupForm } from "@/types/order";
import calculateDiscount from "@/utils/calculate-discount";
import { calculateDiscountPrice } from "@/utils/money-format";
import { LocalStorage } from "@/utils/storage-key";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { Button, ButtonGroup, DateValue, Image, Input, useDisclosure } from "@nextui-org/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import clsx from "clsx";
import BranchVoucher from "./Modal/branch-voucher";
import FormAddAddress from "./Modal/form-add-address";
import FormEditAddress from "./Modal/form-edit-address";
import OrderAddress from "./Modal/order-address";
import SystemVoucher from "./Modal/system-voucher";
import OrderItems from "./order-items";

import OrderPoint from "./order-point";
import OrderVoucher from "./order-voucher";
import OrderSummary from "./order-summary";
import showBranchName from "./order-handlers/show-branch-name";
import clearCart from "./order-handlers/clear-cart";
import applyOrderedPoints from "./order-handlers/apply-ordered-points";
import handleApplySystemVoucher from "./order-handlers/handle-apply-system-voucher";
import iconConfig from "@/config/icons/icon-config";
import ClientHeader from "@/components/client/client-header";
import vnpayIcon from "@/assets/images/vnpay_icon.png";
import { IVoucherCodeBranchApplied, IDecodedUrlParams, IVoucherCodeSystemApplied } from "@/types/voucher";

const OrderSteps = () => {
  const axiosCustomer = useCustomerAxios();
  const axiosClient = useAxios();
  const navigate = useNavigate();
  const { isOpen: isOpenBranchVoucher, onOpenChange: onOpenBranchVoucherChange } = useDisclosure();
  const { isOpen: isOpenSystemVoucher, onOpenChange: onOpenSystemVoucherChange } = useDisclosure();
  const { isOpen: isOpenAddAddress, onOpenChange: onOpenAddAddressChange } = useDisclosure();
  const { isOpen: isOpenEditAddress, onOpenChange: onOpenEditAddressChange } = useDisclosure();
  const [, setCookie] = useCookies(["totalQuantity"]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [inputVoucherCode, setInputVoucherCode] = useState<IVoucherCodeSystemApplied>();
  const [inputVoucherCodeOfBranch, setInputVoucherCodeOfBranch] = useState<string>("");
  const [discountValueOfSystemVoucher, setDiscountValueOfSystemVoucher] = useState<number>(0);
  const [dateValue, setDateValue] = useState<DateValue>(parseDate(today(getLocalTimeZone()).toString()));
  const [pointOfCustomer, setPointOfCustomer] = useState<number>(0);
  const [isCheckUsePoint, setIsCheckUsePoint] = useState<boolean>(false);
  const [shipFee] = useState<number>(20000);
  const { isOpen, onOpenChange } = useDisclosure();
  const [listBranches, setListBranches] = useState<IBranch[]>([]);
  const [voucherBranchId, setVoucherBranchId] = useState<string>("");
  const [voucherCodeBranchApplied, setVoucherCodeBranchApplied] = useState<IVoucherCodeBranchApplied>();
  const { cartCustomer, isLoading, handleShowSelectedVariant, handlePrice, totalBranch } = useCart();

  const [orderGroup, setOrderGroup] = useState<IOrderGroupForm>({
    customerId: LocalStorage.getCustomerLocalStorage()._id,
    customerInfo: {
      email: "",
      fullAddress: "",
      fullName: "",
      phoneNumber: "",
    },
    orderData: [
      {
        branchId: "",
        branchVoucher: "",
        orderItems: [],
        orderNote: "",
        orderSummary: {
          reducedFee: 0,
          shippingFee: shipFee,
          subTotalPrice: 0,
          totalPrice: 0,
        },
        orderOptions: {
          deliveryMethod: "toHouse",
        },
        orderType: "customerOrder",
      },
    ],
    orderType: "customerOrder",
    paymentStatus: "cashOnDelivery",
    orderApplyPoint: 0,
    reducedFee: 0,
    shippingFee: 0,
    subTotalPrice: 0,
    totalPrice: 0,
  });

  const handleApplyBranchVoucher = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const getUrlParams = urlParams.get("voucherCodeBranch");
    if (!inputVoucherCodeOfBranch) {
      return toast.error("Vui lòng nhập mã giảm giá hoặc chọn giảm giá khác !");
    }
    let previousReducedFee = 0;
    if (getUrlParams) {
      const decodedUrlParams = JSON.parse(atob(getUrlParams));
      if (
        decodedUrlParams[voucherBranchId] &&
        decodedUrlParams[voucherBranchId].voucherCode === inputVoucherCodeOfBranch
      ) {
        return toast.error("Bạn đã áp mã này rồi!");
      } else if (decodedUrlParams[voucherBranchId]) {
        previousReducedFee = decodedUrlParams[voucherBranchId].reducedFee;
      }
    }
    axiosCustomer
      .post<IAPIResponseVoucher>(apiRoutes.cart.useDiscountCode, {
        voucherCode: inputVoucherCodeOfBranch,
        orderData: {
          branchId: voucherBranchId,
          subTotalPrice: totalBranch(voucherBranchId),
        },
      })
      .then((response) => response.data)
      .then((response) => {
        console.log(response, "response voucher");
        if (response.status === "success") {
          const { discountValue, maxValue, type } = response.results;
          const newVoucherCodeBranchApplied = { ...voucherCodeBranchApplied };

          const subTotalPrice = totalBranch(voucherBranchId);
          let reducedFee = calculateDiscount(subTotalPrice, shipFee, type, discountValue, maxValue);
          if (newVoucherCodeBranchApplied[voucherBranchId]) {
            return toast.error("Vui lòng xóa mã giảm giá cũ trước khi áp mã giảm giá mới");
          }
          if (type === "shipFee") {
            const orderOfBranch = orderGroup.orderData.find(
              (orderItem) => orderItem.branchId === voucherBranchId,
            );
            if (orderOfBranch && orderOfBranch.orderOptions.deliveryMethod === "atStore") {
              return toast.error("Mã giảm giá này chỉ áp dụng cho hình thức giao hàng tận nơi");
            }
            if (orderOfBranch && orderOfBranch.orderSummary.totalPrice === 0) {
              return toast.warning("Đơn hàng của bạn đã được giảm giá hết rồi");
            }
            if (orderGroup.shippingFee === 0) {
              return toast.warning(
                "Không thể áp dụng mã giảm giá phí vận chuyển cho đơn hàng không có phí vận chuyển",
              );
            }
            newVoucherCodeBranchApplied[voucherBranchId] = {
              branchId: voucherBranchId,
              voucherCode: inputVoucherCodeOfBranch,
              reducedFee,
              type,
            };
            const encodedVoucherCodeBranch = btoa(JSON.stringify(newVoucherCodeBranchApplied));
            urlParams.set("voucherCodeBranch", encodedVoucherCodeBranch);
            const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
            window.history.pushState({}, "", newUrl);
            setVoucherCodeBranchApplied((prev) => ({
              ...prev,
              [voucherBranchId]: {
                branchId: voucherBranchId,
                voucherCode: inputVoucherCodeOfBranch,
                reducedFee,
                type,
              },
            }));

            setOrderGroup((prev) => {
              const updatedOrderData = prev.orderData.map((orderData) => {
                if (orderData.branchId === voucherBranchId) {
                  return {
                    ...orderData,
                    branchVoucher: response.results._id,
                    orderSummary: {
                      ...orderData.orderSummary,
                      shippingFee: orderData.orderSummary.shippingFee - reducedFee,
                      totalPrice:
                        orderData.orderSummary.subTotalPrice -
                        orderData.orderSummary.reducedFee +
                        (orderData.orderSummary.shippingFee - reducedFee),
                    },
                  };
                }
                return orderData;
              });
              return {
                ...prev,
                orderData: updatedOrderData,
              };
            });
          } else {
            newVoucherCodeBranchApplied[voucherBranchId] = {
              branchId: voucherBranchId,
              voucherCode: inputVoucherCodeOfBranch,
              reducedFee,
              type,
            };
            const encodedVoucherCodeBranch = btoa(JSON.stringify(newVoucherCodeBranchApplied));
            urlParams.set("voucherCodeBranch", encodedVoucherCodeBranch);
            const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
            window.history.pushState({}, "", newUrl);
            setVoucherCodeBranchApplied((prev) => ({
              ...prev,
              [voucherBranchId]: {
                branchId: voucherBranchId,
                voucherCode: inputVoucherCodeOfBranch,
                reducedFee,
                type,
              },
            }));
            setOrderGroup((prev) => {
              const updatedOrderData = prev.orderData.map((orderData) => {
                if (orderData.branchId === voucherBranchId) {
                  const newTotalPrice =
                    orderData.orderSummary.subTotalPrice + orderData.orderSummary.shippingFee <=
                    orderData.orderSummary.reducedFee + reducedFee
                      ? 0
                      : orderData.orderSummary.subTotalPrice +
                        orderData.orderSummary.shippingFee -
                        reducedFee;
                  return {
                    ...orderData,
                    branchVoucher: response.results._id,
                    orderSummary: {
                      ...orderData.orderSummary,
                      reducedFee: orderData.orderSummary.reducedFee + reducedFee,
                      totalPrice: newTotalPrice,
                    },
                  };
                }
                return orderData;
              });
              return {
                ...prev,
                orderData: updatedOrderData,
              };
            });
          }
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const handleCreateOrder = () => {
    const {
      customerInfo: { email, fullAddress, fullName, phoneNumber },
    } = orderGroup;
    if ([email, fullAddress, fullName, phoneNumber].includes("")) {
      toast.error("Vui lòng chọn địa chỉ nhận hàng");
      return;
    }
    if (orderGroup.orderData.length === 0) {
      return toast.error("Vui lòng chọn sản phẩm");
    }

    axiosCustomer
      .post<IAPIResponse<IOrderGroup>>(apiRoutes.orders.create, orderGroup)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          if (orderGroup.paymentStatus === "cashOnDelivery") {
            LocalStorage.setVipointsLocalStorage(0);
            setCookie("totalQuantity", 0, { path: "/" });
            clearCart({ axiosCustomer });
            navigate(clientRoutes.orderSteps.success);
          } else {
            axiosCustomer
              .post(apiRoutes.vnPay.createPayment, {
                bankCode: "",
                amount: orderGroup.totalPrice,
                orderId: response.results._id,
              })
              .then((response) => response.data)
              .then((response) => {
                window.location.href = response.results;
              });
          }
        }
      })
      .catch((error) => console.log(error));
  };
  const handleChooseExpressDelivery = (branchId: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    const getUrlParams = urlParams.get("voucherCodeBranch");
    if (getUrlParams) {
      const decodedUrlParams: IDecodedUrlParams = JSON.parse(atob(getUrlParams as string));
      console.log(decodedUrlParams, "decodedUrlParams");
      if (decodedUrlParams[branchId] && decodedUrlParams[branchId].type === "shipFee") {
        setOrderGroup((prev) => {
          const updatedOrderData = prev.orderData.map((orderItem) => {
            if (orderItem.branchId === branchId) {
              return {
                ...orderItem,
                orderSummary: {
                  ...orderItem.orderSummary,
                  shippingFee: !orderItem.orderUrgent?.isUrgent
                    ? shipFee * 3 - decodedUrlParams[branchId].reducedFee
                    : shipFee - decodedUrlParams[branchId].reducedFee,
                  totalPrice: !orderItem.orderUrgent?.isUrgent
                    ? orderItem.orderSummary.subTotalPrice +
                      (shipFee * 3 - decodedUrlParams[branchId].reducedFee)
                    : orderItem.orderSummary.subTotalPrice + shipFee - decodedUrlParams[branchId].reducedFee,
                },
                orderUrgent: {
                  isUrgent: !orderItem.orderUrgent?.isUrgent,
                  orderExpectedTime: !orderItem.orderUrgent?.isUrgent ? new Date().toISOString() : "",
                },
              };
            }
            return orderItem;
          });
          // const newShippingFee = updatedOrderData.reduce(
          //   (total, orderItem) => total + (orderItem.orderUrgent?.isUrgent ? shipFee * 3 : shipFee),
          //   0,
          // );
          return {
            ...prev,
            orderData: updatedOrderData,
            // shippingFee: newShippingFee,
          };
        });
      } else if (
        (decodedUrlParams[branchId] && decodedUrlParams[branchId].type === "percentage") ||
        (decodedUrlParams[branchId] && decodedUrlParams[branchId].type === "fixed")
      ) {
        console.log("fixed or percentage");
        setOrderGroup((prev) => {
          return {
            ...prev,
            orderData: prev.orderData.map((orderItem) => {
              if (orderItem.branchId === branchId) {
                return {
                  ...orderItem,
                  orderSummary: {
                    ...orderItem.orderSummary,
                    shippingFee: !orderItem.orderUrgent?.isUrgent ? shipFee * 3 : shipFee,
                    totalPrice:
                      orderItem.orderSummary.subTotalPrice + shipFee * 3 <
                      decodedUrlParams[branchId].reducedFee
                        ? 0
                        : !orderItem.orderUrgent?.isUrgent
                          ? orderItem.orderSummary.subTotalPrice +
                            shipFee * 3 -
                            decodedUrlParams[branchId].reducedFee
                          : orderItem.orderSummary.subTotalPrice +
                            shipFee -
                            decodedUrlParams[branchId].reducedFee,
                  },
                  orderUrgent: {
                    isUrgent: !orderItem.orderUrgent?.isUrgent,
                    orderExpectedTime: !orderItem.orderUrgent?.isUrgent ? new Date().toISOString() : "",
                  },
                };
              }
              return orderItem;
            }),
          };
        });
      }
    } else {
      setOrderGroup((prev) => {
        const updatedOrderData = prev.orderData.map((orderItem) => {
          if (orderItem.branchId === branchId) {
            return {
              ...orderItem,
              orderSummary: {
                ...orderItem.orderSummary,
                shippingFee: !orderItem.orderUrgent?.isUrgent
                  ? orderItem.orderSummary.shippingFee * 3
                  : orderItem.orderSummary.shippingFee / 3,
                totalPrice: !orderItem.orderUrgent?.isUrgent
                  ? orderItem.orderSummary.subTotalPrice +
                    orderItem.orderSummary.shippingFee * 3 -
                    orderItem.orderSummary.reducedFee
                  : orderItem.orderSummary.subTotalPrice +
                    orderItem.orderSummary.shippingFee / 3 -
                    orderItem.orderSummary.reducedFee,
              },
              orderUrgent: {
                isUrgent: !orderItem.orderUrgent?.isUrgent,
                orderExpectedTime: !orderItem.orderUrgent?.isUrgent ? new Date().toISOString() : "",
              },
            };
          }
          return orderItem;
        });
        const newShippingFee = updatedOrderData.reduce(
          (total, orderItem) => total + (orderItem.orderUrgent?.isUrgent ? shipFee * 3 : shipFee),
          0,
        );
        return {
          ...prev,
          orderData: updatedOrderData,
          shippingFee: newShippingFee,
        };
      });
    }
  };
  const updateCustomerAddress = (updatedAddress: IUserAddresses) => {
    setOrderGroup((prev) => ({
      ...prev,
      customerInfo: {
        email: updatedAddress.email,
        fullAddress: updatedAddress.fullAddress,
        fullName: updatedAddress.fullName,
        phoneNumber: updatedAddress.phoneNumber,
      },
    }));
  };
  const openEditAddressModal = (addressId: string) => {
    setSelectedAddressId(addressId);
    onOpenEditAddressChange();
  };

  const calculateOrderInfo = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let systemVoucherReducedFee = 0;
    const getUrlParams = urlParams.get("voucherCodeSystem");
    if (getUrlParams) {
      const { type, reducedFee }: IVoucherCodeSystemApplied = JSON.parse(atob(getUrlParams));
      console.log("type", type);
      if (type === "shipFee") {
        systemVoucherReducedFee = reducedFee;
      }
    }
    const subTotalPrice = orderGroup.orderData.reduce(
      (total, orderData) => total + orderData.orderSummary.subTotalPrice,
      0,
    );
    const shippingFee =
      orderGroup.orderData.reduce((total, orderData) => total + orderData.orderSummary.shippingFee, 0) -
      systemVoucherReducedFee;
    const reducedFeeOfBranches = orderGroup.orderData.reduce(
      (total, orderData) => total + orderData.orderSummary.reducedFee,
      0,
    );
    const totalPrice =
      subTotalPrice + shippingFee - reducedFeeOfBranches - (orderGroup.orderApplyPoint ?? 0) <= 0
        ? 0
        : subTotalPrice + shippingFee - reducedFeeOfBranches - (orderGroup.orderApplyPoint ?? 0);

    return {
      subTotalPrice,
      shippingFee,
      reducedFeeOfBranches,
      totalPrice,
    };
  }, [orderGroup]);
  useEffect(() => {
    const { subTotalPrice, shippingFee, totalPrice } = calculateOrderInfo;
    if (
      orderGroup.subTotalPrice !== subTotalPrice ||
      orderGroup.shippingFee !== shippingFee ||
      orderGroup.totalPrice !== totalPrice
    ) {
      setOrderGroup((prev) => ({
        ...prev,
        subTotalPrice,
        shippingFee,
        totalPrice,
      }));
    }
  }, [calculateOrderInfo]);
  useEffect(() => {
    Promise.all([
      axiosClient.get<IAPIResponse<IBranch[]>>(apiRoutes.branches.getAll),
      axiosCustomer.get<IAPIResponse<ICustomer>>(apiRoutes.customers.me.info),
    ])
      .then(([branchesResponse, customerInfoResponse]) =>
        Promise.all([branchesResponse.data, customerInfoResponse.data]),
      )
      .then(([branchesResponse, customerInfoResponse]) => {
        setListBranches(branchesResponse.results);
        setPointOfCustomer(customerInfoResponse.results.vipPoints.currentPoint);
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    // const urlParams = new URLSearchParams(window.location.search);
    // const getUrlParams = urlParams.get("quickBuyProducts");
    // if (getUrlParams) {
    //   const decodedUrlParams: {
    //     branchId: string;
    //     cartId: string;
    //   } = JSON.parse(getUrlParams);

    //   const newCartCustomer = cartCustomer.filter((branchCart) => {
    //     if (branchCart.branchId === decodedUrlParams.branchId) {
    //       return (branchCart.cartItems = branchCart.cartItems.filter(
    //         (cartItem) => cartItem._id === decodedUrlParams.cartId,
    //       ));
    //     }
    //   });
    //   console.log(newCartCustomer, "newCartCustomer");
    // }
    setOrderGroup((prev) => ({
      ...prev,
      subTotalPrice: cartCustomer.reduce((total, branchCart) => total + totalBranch(branchCart.branchId), 0),
      totalPrice:
        cartCustomer.reduce((total, branchCart) => total + totalBranch(branchCart.branchId), 0) +
        cartCustomer.length * shipFee,
      shippingFee: cartCustomer.length * shipFee,

      orderData: cartCustomer.map((branchCart: any) => ({
        branchId: branchCart.branchId,
        branchVoucher: null,
        orderNote: "",
        orderItems: branchCart.cartItems.map((cake: any) => ({
          cakeId: cake.cakeInfo._id,
          selectedVariants: cake.selectedVariants,
          quantity: cake.quantity,
          priceAtBuy: calculateDiscountPrice(cake.cakeInfo.cakeDefaultPrice, cake.cakeInfo.discountPercents),
        })),
        orderSummary: {
          shippingFee: shipFee,
          reducedFee: 0,
          subTotalPrice: totalBranch(branchCart.branchId),
          totalPrice: totalBranch(branchCart.branchId) + shipFee,
        },
        orderType: "customerOrder",
        orderOptions: {
          deliveryMethod: "toHouse",
        },
      })),
    }));
  }, [isLoading]);
  const prevCartCustomerRef = useRef(cartCustomer);
  // Xử lí mua nhanh
  // code ...
  //
  console.log(orderGroup, "orderGroup");
  useEffect(() => {
    const isPageReloaded = !!sessionStorage.getItem("isPageReloaded");
    if (isPageReloaded) {
      console.log("page reloaded");
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.delete("voucherCodeSystem");
      urlParams.delete("voucherCodeBranch");
      urlParams.delete("orderAddress");
      window.history.replaceState({}, "", `${window.location.pathname}?${urlParams}`);
    } else {
      console.log("page not reloaded");
    }
    sessionStorage.setItem("isPageReloaded", String(true));
  }, []);

  useEffect(() => {
    console.log(voucherBranchId);
  }, [voucherBranchId]);

  if (isLoading) return <LoadingClient />;

  return (
    <>
      {orderGroup.orderData.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center">
          <h3 className="mb-4 text-default-400">Bạn chưa có sản phẩm nào trong giỏ hàng!</h3>
          <Button
            startContent={iconConfig.reset.small}
            color="primary"
            onClick={() => navigate(clientRoutes.home)}
          >
            Quay lại trang chủ
          </Button>
        </div>
      ) : (
        <section>
          {isOpenAddAddress && (
            <FormAddAddress isOpen={isOpenAddAddress} onOpenChange={onOpenAddAddressChange} />
          )}
          {isOpenEditAddress && (
            <FormEditAddress
              isOpen={isOpenEditAddress}
              onOpenEditAddressChange={onOpenEditAddressChange}
              addressId={selectedAddressId}
              onUpdateAddress={updateCustomerAddress}
            />
          )}
          {isOpen && (
            <OrderAddress
              isOpen={isOpen}
              onOpenChange={onOpenChange}
              setOrderGroup={setOrderGroup}
              customerInfo={orderGroup.customerInfo}
              onOpenAddAddressChange={onOpenAddAddressChange}
              onOpenEditAddressChange={openEditAddressModal}
            />
          )}
          {isOpenBranchVoucher && (
            <BranchVoucher
              branchId={voucherBranchId}
              isOpen={isOpenBranchVoucher}
              voucherCodeBranchApplied={voucherCodeBranchApplied}
              setInputVoucherCodeOfBranch={setInputVoucherCodeOfBranch}
              setOrderGroup={setOrderGroup}
              onOpenChange={onOpenBranchVoucherChange}
              handleApplyVoucher={handleApplyBranchVoucher}
              setVoucherCodeBranchApplied={setVoucherCodeBranchApplied}
            />
          )}
          {isOpenSystemVoucher && (
            <SystemVoucher
              isOpen={isOpenSystemVoucher}
              orderGroup={orderGroup}
              onOpenChange={onOpenSystemVoucherChange}
              setInputVoucherCode={setInputVoucherCode}
              discountValueOfSystemVoucher={discountValueOfSystemVoucher}
              setDiscountValueOfSystemVoucher={setDiscountValueOfSystemVoucher}
              handleApplyVoucher={() =>
                handleApplySystemVoucher({
                  shipFee,
                  orderGroup,
                  axiosCustomer,
                  inputVoucherCode,
                  onOpenSystemVoucherChange,
                  setOrderGroup,
                  setDiscountValueOfSystemVoucher,
                })
              }
              setOrderGroup={setOrderGroup}
            />
          )}
          <div className="relative mx-auto flex w-[1280px] flex-col gap-4">
            <div className={"mt-8 flex flex-col gap-4"}>
              <ClientHeader title={"thanh toán đơn hàng"} />
              <div className="grid grid-cols-12 gap-x-4 rounded-2xl border bg-dark/10 px-4 py-2 text-dark">
                <p className="col-span-6 font-bold">SẢN PHẨM </p>
                <p className="col-span-2 text-center font-bold">ĐƠN GIÁ</p>
                <p className="col-span-2 text-center font-bold">SỐ LƯỢNG</p>
                <p className="col-span-2 text-center font-bold">THÀNH TIỀN</p>
              </div>
            </div>
            <OrderItems
              cartCustomer={cartCustomer}
              handlePrice={handlePrice}
              handleShowSelectedVariant={handleShowSelectedVariant}
              totalBranch={totalBranch}
              dateValue={dateValue}
              handleChooseExpressDelivery={handleChooseExpressDelivery}
              showBranchName={(branchId) => showBranchName(branchId, listBranches)}
              setOrderGroup={setOrderGroup}
              setVoucherBranchId={setVoucherBranchId}
              orderGroup={orderGroup}
              onOpenBranchVoucherChange={onOpenBranchVoucherChange}
              setDateValue={setDateValue}
            />
            <OrderPoint
              isCheckUsePoint={isCheckUsePoint}
              pointOfCustomer={pointOfCustomer}
              handleApplyPoint={() =>
                applyOrderedPoints({ isCheckUsePoint, setIsCheckUsePoint, setOrderGroup, pointOfCustomer })
              }
            />
            <div className="sticky bottom-4 z-50 flex gap-4 rounded-2xl border bg-white p-4 shadow-custom">
              <div className="flex w-full flex-col gap-2">
                <div className={"flex items-center gap-2"}>
                  <Input
                    label={"Thông tin nhận hàng: "}
                    labelPlacement={"outside-left"}
                    classNames={{
                      mainWrapper: "w-full",
                      label: "text-base min-w-max",
                    }}
                    value={orderGroup.customerInfo.fullAddress}
                    isReadOnly
                  />
                  <Button color="primary" onPress={onOpenChange}>
                    Chọn
                  </Button>
                </div>
                <div className={"flex items-center gap-2"}>
                  <p className={"min-w-max"}>Phương thức thanh toán: </p>
                  <ButtonGroup variant={"flat"}>
                    <Button
                      color={orderGroup.paymentStatus === "cashOnDelivery" ? "primary" : "default"}
                      onClick={() => setOrderGroup((prev) => ({ ...prev, paymentStatus: "cashOnDelivery" }))}
                      startContent={iconConfig.cashStack.base}
                    >
                      Thanh toán khi nhận hàng
                    </Button>
                    <Button
                      color={orderGroup.paymentStatus === "pending" ? "primary" : "default"}
                      onClick={() => setOrderGroup((prev) => ({ ...prev, paymentStatus: "pending" }))}
                      startContent={<Image src={vnpayIcon} width={18} />}
                    >
                      VnPay
                    </Button>
                  </ButtonGroup>
                </div>
                <OrderVoucher onOpenSystemVoucherChange={onOpenSystemVoucherChange} />
              </div>
              <div className={"w-full"}>
                <OrderSummary
                  calculateOrderInfo={calculateOrderInfo}
                  cartCustomer={cartCustomer}
                  isCheckUsePoint={isCheckUsePoint}
                  orderGroup={orderGroup}
                  pointOfCustomer={pointOfCustomer}
                  shipFee={shipFee}
                  handleCreateOrder={handleCreateOrder}
                  totalBranch={totalBranch}
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};
export default OrderSteps;
