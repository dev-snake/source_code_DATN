import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  Button,
  ModalFooter,
  Spinner,
  Chip,
} from "@nextui-org/react";
import useAxios from "@/hooks/useAxios";
import { useState, useEffect } from "react";
import { IVoucher } from "@/types/voucher";
import { IAPIResponse } from "@/types/api-response";
import { apiRoutes } from "@/config/routes/api-routes.config";
import { formatCurrencyVND } from "@/utils/money-format";
import { formatDate } from "@/utils/format-date";
import clsx from "clsx";
import { IOrderGroupForm } from "@/types/order";
import { FaXmark } from "react-icons/fa6";
import { IoCloseOutline } from "react-icons/io5";
import iconConfig from "@/config/icons/icon-config";

interface SystemVoucherProps {
  isOpen: boolean;
  orderGroup: IOrderGroupForm;
  onOpenChange: () => void;
  handleApplyVoucher: () => void;
  discountValueOfSystemVoucher: number;
  setDiscountValueOfSystemVoucher: React.Dispatch<React.SetStateAction<number>>;
  setOrderGroup: React.Dispatch<React.SetStateAction<IOrderGroupForm>>;
  setInputVoucherCode: React.Dispatch<React.SetStateAction<IVoucherCodeSystemApplied | undefined>>;
}
interface IVoucherCodeSystemApplied {
  voucherCode: string;
  reducedFee: number;
}
const SystemVoucher = ({
  isOpen,
  orderGroup,
  discountValueOfSystemVoucher,
  onOpenChange,
  handleApplyVoucher,
  setOrderGroup,
  setInputVoucherCode,
  setDiscountValueOfSystemVoucher,
}: SystemVoucherProps) => {
  const axiosClient = useAxios();

  const [voucherApplied, setVoucherApplied] = useState<IVoucherCodeSystemApplied>({
    voucherCode: "",
    reducedFee: 0,
  });

  const [listVoucherOfSystem, setListVoucherOfSystem] = useState<IVoucher[]>([]);
  const [activeBorder, setActiveBorder] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleChooseVoucher = (voucherIndex: number, voucherCode: string) => {
    setActiveBorder((prev) => (prev === voucherIndex ? -1 : voucherIndex));
    console.log(voucherCode);
    if (voucherApplied.voucherCode === voucherCode) {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.delete("voucherCodeSystem");
      window.history.replaceState({}, "", `${window.location.pathname}?${urlParams}`);
      setVoucherApplied({
        voucherCode: "",
        reducedFee: 0,
      });
      setInputVoucherCode({
        voucherCode: "",
        reducedFee: 0,
      });
      setDiscountValueOfSystemVoucher(0);
      setOrderGroup((prev) => {
        const splitDiscountForBranches = discountValueOfSystemVoucher / prev.orderData.length;
        return {
          ...prev,
          reducedFee: 0,
          totalPrice: prev.totalPrice + prev.reducedFee,
          voucherCode: "",
          orderData: prev.orderData.map((orderInfo) => {
            return {
              ...orderInfo,
              orderSummary: {
                ...orderInfo.orderSummary,
                reducedFee: orderInfo.orderSummary.reducedFee - splitDiscountForBranches,
                totalPrice: orderInfo.orderSummary.totalPrice + splitDiscountForBranches,
              },
            };
          }),
        };
      });
    } else {
      setInputVoucherCode({
        voucherCode: voucherCode,
        reducedFee: discountValueOfSystemVoucher,
      });
    }
  };
  const handleRemoveVoucher = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const getUrlParams = urlParams.get("voucherCodeSystem");

    setVoucherApplied({
      voucherCode: "",
      reducedFee: 0,
    });
    setInputVoucherCode({
      voucherCode: "",
      reducedFee: 0,
    });
    setDiscountValueOfSystemVoucher(0);
    if (getUrlParams) {
      const decodedUrlParams = JSON.parse(atob(getUrlParams));
      if (decodedUrlParams.type === "shipFee") {
        setOrderGroup((prev) => {
          return {
            ...prev,
            shippingFee: prev.shippingFee + decodedUrlParams.reducedFee,
            // reducedFee: prev.reducedFee - decodedUrlParams.reducedFee,
            // totalPrice: prev.subTotalPrice + prev.shippingFee + decodedUrlParams.reducedFee,
          };
        });
        urlParams.delete("voucherCodeSystem");
        window.history.replaceState({}, "", `${window.location.pathname}?${urlParams}`);
        return;
      } else {
        const splitDiscountForBranches = decodedUrlParams.reducedFee / orderGroup.orderData.length;
        setOrderGroup((prev) => {
          const updatedOrderData = prev.orderData.map((orderItem) => {
            return {
              ...orderItem,
              orderSummary: {
                ...orderItem.orderSummary,
                reducedFee: orderItem.orderSummary.reducedFee - splitDiscountForBranches,
                totalPrice:
                  orderItem.orderSummary.subTotalPrice + orderItem.orderSummary.shippingFee <=
                  orderItem.orderSummary.reducedFee - splitDiscountForBranches
                    ? 0
                    : orderItem.orderSummary.subTotalPrice +
                      orderItem.orderSummary.shippingFee -
                      (orderItem.orderSummary.reducedFee - splitDiscountForBranches),
              },
            };
          });
          return {
            ...prev,
            orderData: updatedOrderData,
            reducedFee: 0,
          };
        });
        urlParams.delete("voucherCodeSystem");
        window.history.replaceState({}, "", `${window.location.pathname}?${urlParams}`);

        return;
      }
    }
  };

  useEffect(() => {
    axiosClient
      .get<IAPIResponse<IVoucher[]>>(apiRoutes.vouchers.getAll + "?noPagination=true")
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          setListVoucherOfSystem(response.results.filter((voucher) => voucher.branchId === null));
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  }, []);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const getUrlParams = urlParams.get("voucherCodeSystem");
    if (getUrlParams) {
      const decodedUrlParams = atob(getUrlParams);
      setVoucherApplied(JSON.parse(decodedUrlParams));
    }
  }, []);
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => {
        setInputVoucherCode({
          voucherCode: "",
          reducedFee: 0,
        });
        onOpenChange();
      }}
      size="2xl"
      placement="top"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h6 className="">Chọn mã giảm giá</h6>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-y-4">
                <h6 className="">Nhập mã hoặc chọn mã từ danh sách bên dưới</h6>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Nhập mã giảm giá"
                    size="lg"
                    onValueChange={(value) => {
                      setInputVoucherCode({
                        voucherCode: value,
                        reducedFee: discountValueOfSystemVoucher,
                      });
                    }}
                  />
                  <Button size={"lg"} color={"primary"} onClick={handleApplyVoucher}>
                    Áp dụng
                  </Button>
                </div>
                <div>
                  <div className="mb-4">
                    {voucherApplied.voucherCode && (
                      <Chip
                        startContent={
                          <IoCloseOutline
                            className="text-danger hover:cursor-pointer"
                            size={18}
                            onClick={handleRemoveVoucher}
                          />
                        }
                        variant="flat"
                        color="danger"
                      >
                        {voucherApplied.voucherCode && voucherApplied.voucherCode}
                      </Chip>
                    )}
                  </div>
                  <div className="w-scrollbar flex max-h-96 scroll-pb-1 flex-col gap-y-2 overflow-y-scroll">
                    {isLoading && (
                      <div className="flex justify-center">
                        <Spinner label="Đang tải dữ liệu" />
                      </div>
                    )}
                    {listVoucherOfSystem.map((voucher, index) => (
                      <div
                        className={clsx(
                          `relative mr-2 flex h-28 cursor-pointer items-center gap-2 rounded-2xl border-2 px-4 py-2 hover:border-primary`,
                          {
                            "border-2 border-primary": activeBorder === index,
                            "border-2 border-secondary": voucherApplied.voucherCode === voucher.voucherCode,
                          },
                        )}
                        key={index}
                        onClick={() => handleChooseVoucher(index, voucher.voucherCode)}
                      >
                        {voucherApplied.voucherCode === voucher.voucherCode && (
                          <Chip color="secondary" radius={"sm"} className="absolute right-2 top-2 text-xs">
                            Mã đã áp dụng
                          </Chip>
                        )}
                        <div className="flex flex-col gap-y-2">
                          {voucher.voucherConfig.type === "shipFee" ? (
                            <p className={"text-lg font-semibold"}>
                              Giảm{" "}
                              <span className={"font-semibold text-primary"}>
                                {voucher.voucherConfig.discountValue}%
                              </span>{" "}
                              phí vận chuyển
                              {voucher.voucherConfig.maxValue ? `, tối đa ` : ""}
                              {voucher.voucherConfig.maxValue ? (
                                <span className={"font-semibold text-primary"}>
                                  {formatCurrencyVND(voucher.voucherConfig.maxValue)}
                                </span>
                              ) : (
                                ""
                              )}
                            </p>
                          ) : voucher.voucherConfig.type === "fixed" ? (
                            <p className={"text-lg font-semibold"}>
                              Giảm trực tiếp{" "}
                              <span className={"font-semibold text-primary"}>
                                {formatCurrencyVND(voucher.voucherConfig.discountValue)}
                              </span>{" "}
                              giá trị đơn hàng
                            </p>
                          ) : (
                            <p className={"text-lg font-semibold"}>
                              Giảm{" "}
                              <span className={"font-semibold text-primary"}>
                                {voucher.voucherConfig.discountValue}%
                              </span>{" "}
                              giá trị đơn hàng
                            </p>
                          )}
                          <div className={"flex items-center gap-2"}>
                            <small>
                              Đơn tối thiểu{" "}
                              <span className={"font-semibold text-primary"}>
                                {formatCurrencyVND(voucher.voucherConfig.minimumOrderValues || 0)}
                              </span>
                            </small>

                            {voucher.voucherConfig.maxValue ? (
                              <>
                                <small>|</small>
                                <small>
                                  Giảm tối đa{" "}
                                  <span className={"font-semibold text-primary"}>
                                    {formatCurrencyVND(voucher.voucherConfig.maxValue)}
                                  </span>
                                </small>
                              </>
                            ) : (
                              ""
                            )}
                          </div>
                          <div className={"flex items-center gap-2"}>
                            <small className="text-xs">Có hiệu lực đến ngày</small>
                            <Chip size={"sm"} color={"success"} startContent={iconConfig.dot.small}>
                              {formatDate(voucher.voucherConfig.validTo, "onlyDate")}
                            </Chip>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={() => {
                  onClose();
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  handleApplyVoucher();
                  onClose();
                }}
              >
                Áp mã
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SystemVoucher;
