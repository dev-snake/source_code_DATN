import { IVoucher, TVoucherType } from "@/types/voucher";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  Button,
  ModalFooter,
  Chip,
  Divider,
} from "@nextui-org/react";
import useAxios from "@/hooks/useAxios";
import { useEffect, useState } from "react";
import { IAPIResponse } from "@/types/api-response";
import { apiRoutes } from "@/config/routes/api-routes.config";
import clsx from "clsx";
import { formatDate } from "@/utils/format-date";
import { formatCurrencyVND } from "@/utils/money-format";
import { IOrderGroup, IOrderGroupForm } from "@/types/order";
import { IoCloseOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import Loading from "@/components/admin/loading";
import iconConfig from "@/config/icons/icon-config";
import { MapVoucherTypeColor } from "@/utils/map-data/vouchers";

interface IVoucherCodeBranchApplied {
  [key: string]: {
    voucherCode: string;
    branchId: string;
    reducedFee: number;
    type: TVoucherType;
  };
}
interface BranchVoucherProps {
  isOpen: boolean;
  onOpenChange: () => void;
  handleApplyVoucher: () => void;
  branchId: string;
  setOrderGroup: React.Dispatch<React.SetStateAction<IOrderGroupForm>>;
  setVoucherCodeBranchApplied: React.Dispatch<React.SetStateAction<IVoucherCodeBranchApplied | undefined>>;
  voucherCodeBranchApplied: IVoucherCodeBranchApplied | undefined;
  setInputVoucherCodeOfBranch: React.Dispatch<React.SetStateAction<string>>;
}

const BranchVoucher = ({
  isOpen,
  branchId,
  voucherCodeBranchApplied,
  onOpenChange,
  setOrderGroup,
  handleApplyVoucher,
  setInputVoucherCodeOfBranch,
  setVoucherCodeBranchApplied,
}: BranchVoucherProps) => {
  const [activeBorder, setActiveBorder] = useState<string>("");
  const [listFreeVoucher, setListFreeVoucher] = useState<IVoucher[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const axiosClient = useAxios();

  const handleChooseVoucher = (voucherCode: string) => {
    setActiveBorder(voucherCode);
    if (activeBorder === voucherCode) {
      setActiveBorder("");
    }
    if (voucherCodeBranchApplied && voucherCodeBranchApplied[branchId]?.voucherCode === voucherCode) {
      const urlParams = new URLSearchParams(window.location.search);
      const voucherCodeSystem = urlParams.get("voucherCodeSystem");
      const newVoucherCodeBranchApplied = { ...voucherCodeBranchApplied };
      setOrderGroup((prev) => {
        return {
          ...prev,
          orderData: prev.orderData.map((orderItem) => {
            if (orderItem.branchId === branchId) {
              const { type, reducedFee } = newVoucherCodeBranchApplied[branchId];
              const { orderSummary } = orderItem;
              const originalTotalPrice = orderSummary.subTotalPrice + orderSummary.shippingFee;

              return {
                ...orderItem,
                branchVoucher: null,
                orderSummary: {
                  ...orderSummary,
                  reducedFee:
                    type === "shipFee" ? orderSummary.reducedFee : orderSummary.reducedFee - reducedFee,
                  shippingFee:
                    type === "shipFee" ? orderSummary.shippingFee + reducedFee : orderSummary.shippingFee,
                  totalPrice: originalTotalPrice - orderSummary.reducedFee + reducedFee,
                },
              };
            }
            return orderItem;
          }),
        };
      });

      delete newVoucherCodeBranchApplied[branchId];
      const encodedVoucherCodeBranch = btoa(JSON.stringify(newVoucherCodeBranchApplied));
      urlParams.set("voucherCodeBranch", encodedVoucherCodeBranch);
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      if (Object.keys(newVoucherCodeBranchApplied).length === 0) {
        urlParams.delete("voucherCodeBranch");
        if (voucherCodeSystem) {
          urlParams.set("voucherCodeSystem", voucherCodeSystem);
        }
        window.history.pushState({}, "", `${window.location.pathname}?${urlParams.toString()}`);
      } else {
        window.history.pushState({}, "", newUrl);
      }
      setVoucherCodeBranchApplied(newVoucherCodeBranchApplied);
    } else {
      setInputVoucherCodeOfBranch(voucherCode);
    }
  };
  const handleRemoveBranchVoucher = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const voucherCodeSystem = urlParams.get("voucherCodeSystem");
    const newVoucherCodeBranchApplied = { ...voucherCodeBranchApplied };
    console.log(newVoucherCodeBranchApplied, "newVoucherCodeBranchApplied remove");
    setOrderGroup((prev) => {
      const updatedOrderData = prev.orderData.map((orderItem) => {
        if (orderItem.branchId === branchId) {
          const { type, reducedFee } = newVoucherCodeBranchApplied[branchId];
          const { orderSummary } = orderItem;
          const originalTotalPrice = orderSummary.subTotalPrice + orderSummary.shippingFee;

          return {
            ...orderItem,
            branchVoucher: null,
            orderSummary: {
              ...orderSummary,
              reducedFee: type === "shipFee" ? orderSummary.reducedFee : orderSummary.reducedFee - reducedFee,
              shippingFee:
                type === "shipFee" ? orderSummary.shippingFee + reducedFee : orderSummary.shippingFee,
              // totalPrice: originalTotalPrice - orderSummary.reducedFee + reducedFee,
              totalPrice:
                type === "shipFee"
                  ? orderSummary.subTotalPrice +
                    orderSummary.shippingFee +
                    newVoucherCodeBranchApplied[branchId].reducedFee -
                    orderSummary.reducedFee
                  : originalTotalPrice <= orderSummary.reducedFee + reducedFee
                    ? 0
                    : originalTotalPrice - orderSummary.reducedFee + reducedFee,
            },
          };
        }
        return orderItem;
      });
      // const newTotalPrice = updatedOrderData.reduce((acc, orderItem) => {
      //   return acc + orderItem.orderSummary.totalPrice;
      // }, 0);
      return {
        ...prev,
        orderData: updatedOrderData,
        // totalPrice: newTotalPrice,
      };
    });

    delete newVoucherCodeBranchApplied[branchId];
    const encodedVoucherCodeBranch = btoa(JSON.stringify(newVoucherCodeBranchApplied));
    urlParams.set("voucherCodeBranch", encodedVoucherCodeBranch);
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    if (Object.keys(newVoucherCodeBranchApplied).length === 0) {
      urlParams.delete("voucherCodeBranch");
      if (voucherCodeSystem) {
        urlParams.set("voucherCodeSystem", voucherCodeSystem);
      }
      window.history.pushState({}, "", `${window.location.pathname}?${urlParams.toString()}`);
    } else {
      window.history.pushState({}, "", newUrl);
    }
    setVoucherCodeBranchApplied(newVoucherCodeBranchApplied);
  };

  const handleGetListVoucherOfBranch = () => {
    const currentDay = new Date();
    currentDay.setHours(0, 0, 0, 0);
    return axiosClient
      .get<IAPIResponse<IVoucher[]>>(apiRoutes.branches.vouchers(branchId), {
        params: {
          noPagination: true,
          "voucherConfig.validTo[gte]": currentDay.toISOString(),
        },
      })
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          setListFreeVoucher(response.results);
        }
      })
      .catch((error) => {
        const { data } = error.response;
        toast.error(data.message);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    handleGetListVoucherOfBranch();
  }, [branchId]);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const voucherCodeBranch = urlParams.get("voucherCodeBranch");
    const encodedVoucherCodeBranch = atob(voucherCodeBranch as string);
    if (voucherCodeBranch) {
      const convertJSON = JSON.parse(encodedVoucherCodeBranch);
      setVoucherCodeBranchApplied(convertJSON);
    }
  }, []);
  console.log(voucherCodeBranchApplied, "voucherCodeBranchApplied");
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={() => {
        setInputVoucherCodeOfBranch("");
        onOpenChange();
      }}
      size="2xl"
      placement="top"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h6>Chọn mã giảm giá</h6>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <h6 className="">Nhập mã hoặc chọn mã từ danh sách bên dưới</h6>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Nhập mã giảm giá"
                    variant={"bordered"}
                    size={"lg"}
                    onValueChange={(e) => setInputVoucherCodeOfBranch(e)}
                  />
                  <Button
                    size={"lg"}
                    color={"primary"}
                    onClick={() => {
                      handleApplyVoucher();
                    }}
                  >
                    Áp dụng
                  </Button>
                </div>
                <div className={"flex flex-col gap-4"}>
                  <div className="flex gap-4">
                    {isLoading ? (
                      <Loading />
                    ) : voucherCodeBranchApplied !== undefined &&
                      voucherCodeBranchApplied[branchId] !== undefined ? (
                      <Chip
                        color="danger"
                        variant="flat"
                        size="sm"
                        startContent={
                          <IoCloseOutline
                            className="text-danger hover:cursor-pointer"
                            size={18}
                            onClick={handleRemoveBranchVoucher}
                          />
                        }
                      >
                        {voucherCodeBranchApplied[branchId].voucherCode}
                      </Chip>
                    ) : null}
                  </div>
                  <div className="w-scrollbar flex max-h-96 scroll-pb-1 flex-col gap-y-2 overflow-y-scroll">
                    {listFreeVoucher.length === 0 ? (
                      <span className="p-4 text-center italic">Cửa hàng không có mã giảm giá</span>
                    ) : (
                      listFreeVoucher.map((voucher, index) => (
                        <div
                          className={clsx(
                            `relative mr-2 flex h-28 cursor-pointer items-center gap-2 rounded-2xl border-2 px-4 py-2 hover:border-primary`,
                            {
                              "border-2 border-primary": activeBorder === voucher.voucherCode,
                              "border-2 border-secondary":
                                voucherCodeBranchApplied !== undefined &&
                                voucherCodeBranchApplied[branchId] &&
                                voucherCodeBranchApplied[branchId].voucherCode === voucher.voucherCode,
                            },
                          )}
                          key={index}
                          onClick={() => {
                            handleChooseVoucher(voucher.voucherCode);
                          }}
                        >
                          {voucherCodeBranchApplied !== undefined &&
                          voucherCodeBranchApplied[branchId] &&
                          voucherCodeBranchApplied[branchId].voucherCode === voucher.voucherCode ? (
                            <Chip color="secondary" radius={"sm"} className="absolute right-2 top-2 text-xs">
                              Mã đã áp dụng
                            </Chip>
                          ) : null}
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
                      ))
                    )}
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Hủy bỏ
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  handleApplyVoucher();
                  onClose();
                }}
              >
                Áp dụng mã
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BranchVoucher;
