import AdminHeader from "@/components/admin/admin-header";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig, { iconSize } from "@/config/icons/icon-config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useAxios from "@/hooks/useAxios";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useStaffAxios from "@/hooks/useStaffAxios";
import FormCancelOrder from "@/pages/profile/order-history/order-detail/form-cancel-order";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { IAPIResponseError } from "@/types/api-response-error";
import { IBranch, TCakeInventory, TMaterialInventory, TMaterialPlanOrder } from "@/types/branch";
import { ICake } from "@/types/cake";
import { IMaterial } from "@/types/material";
import { IOrder, IOrderItem, TOrderStatus } from "@/types/order";
import { IPlan } from "@/types/plan";
import { formatDate } from "@/utils/format-date";
import {
  MapDeliveryMethodColor,
  MapDeliveryMethodText,
  MapOrderStatusColor,
  MapOrderStatusText,
} from "@/utils/map-data/orders";
import { sliceText } from "@/utils/slice-text";
import {
  Button,
  Chip,
  cn,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Switch,
  useDisclosure,
} from "@nextui-org/react";
import { AxiosError } from "axios";
import clsx from "clsx";
import { useEffect, useState } from "react";
import {
  BiCheck,
  BiCheckCircle,
  BiError,
  BiListCheck,
  BiLoaderCircle,
  BiMessageAltX,
  BiSolidTruck,
  BiUndo,
  BiX,
} from "react-icons/bi";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import CakeList from "./cake-list";
import CustomerInfor from "./customer-infor";
import FormRejectedOrderProps from "./form-rejected-order";
import InvoiceSummary from "./invoice-summary";
import MaterialUsagePlan from "./material-usage-plan";
import Loading from "@/components/admin/loading";

type ButtonConfig = {
  color: "warning" | "danger" | "success" | "default" | "primary" | "secondary";
  label: string;
  icon: JSX.Element;
  isDisabled?: boolean;
  onClick?: () => void;
};
interface IMaterialMap {
  [key: string]: {
    materialId: string | IMaterial;
    quantity: number;
    [key: string]: unknown;
  };
}
interface OrderDetailsProps {
  refBack: string;
}

const OrderDetails = ({ refBack }: OrderDetailsProps) => {
  const { orderId } = useParams();
  const staffAxios = useStaffAxios();
  const axiosClient = useAxios();
  const currentBranch = useCurrentBranch();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isOpenCancel, onOpen: onOpenCancel, onOpenChange: onOpenCancelChange } = useDisclosure();
  const {
    isOpen: isOpenQueue,
    onOpen: onOpenQueue,
    onOpenChange: onOpenQueueChange,
    onClose,
  } = useDisclosure();

  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isFetchingPlan, setIsFetchingPlan] = useState<boolean>(true);
  const [orderDetail, setOrderDetail] = useState<IOrder | null>(null);
  const [planList, setPlanList] = useState<IPlan[] | null>(null);
  const [planUsageMaterials, setPlanUsageMaterials] = useState<TMaterialPlanOrder[] | []>([]);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [rejectedReason, setRejectedReason] = useState<string>("");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [selectedDayType, setSelectedDayType] = useState(true);

  const fetchData = async () => {
    try {
      const [orderDetailResponse, planListResponse] = await Promise.all([
        staffAxios.get<IAPIResponse<IOrder>>(apiRoutes.orders.getOne(orderId as string)),
        staffAxios.get<IAPIResponse<IPlan[], IPaginationMetadata>>(apiRoutes.plans.getAll, {
          params: {
            noPagination: true,
            planStatus: "open",
            planType: selectedDayType ? "day" : "week",
          },
        }),
      ]);

      setOrderDetail(orderDetailResponse.data.results);
      const materialUsage = calcPlanUsageMaterials(
        orderDetailResponse.data.results.orderItems as IOrderItem[],
        orderDetailResponse.data.results.branchId.branchInventory?.materials as TMaterialInventory[],
      );
      setPlanUsageMaterials(materialUsage);
      setPlanList(planListResponse.data.results);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsFetching(false);
      setIsFetchingPlan(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDayType]);

  const calcPlanUsageMaterials = (
    orderItems: IOrderItem[],
    branchInventoryMaterials: TMaterialInventory[],
  ): TMaterialPlanOrder[] => {
    const cakeOrderMaterial = orderItems.flatMap((item) => {
      const { recipeIngredients, recipeVariants } = (item.cakeId as ICake).cakeRecipe;
      const allIngredients = [
        ...recipeIngredients.map((x) => ({
          ...x,
          quantity: x.quantity * item.quantity,
        })),
      ];
      if (item.selectedVariants.length === 0) {
        return (item.cakeId as ICake).cakeRecipe.recipeIngredients.map((x) => ({
          ...x,
          quantity: x.quantity * item.quantity,
        }));
      } else {
        const variantIngredients = item.selectedVariants.flatMap((variant) => {
          const matchingVariant = (item.cakeId as ICake).cakeVariants
            .find((rv) => rv._id?.toString() === variant.variantKey)
            ?.variantItems.filter((rvItem) => rvItem._id?.toString() === variant.itemKey);
          if (matchingVariant) {
            return matchingVariant.flatMap((mItem) => {
              return recipeVariants!.flatMap((recipeVariant) => {
                return recipeVariant.variantItems
                  .filter((recipeItem) => recipeItem._id === mItem.itemRecipe)
                  .map((recipeItem) => ({
                    ...recipeIngredients.find((ri) => ri.materialId === recipeItem.materialId),
                    materialId: recipeItem.materialId,
                    quantity: recipeItem.quantity * item.quantity,
                  }));
              });
            });
          }
          return [];
        });
        allIngredients.push(...variantIngredients);
      }
      return allIngredients;
    });

    const materialMap: IMaterialMap = cakeOrderMaterial.reduce((acc, item) => {
      const id = (item.materialId as IMaterial)._id.toString();
      if (acc[id]) {
        acc[id].quantity += item.quantity;
      } else {
        acc[id] = { ...item, quantity: item.quantity };
      }
      return acc;
    }, {} as IMaterialMap);

    const filteredInventory = Object.values(materialMap).map((item) => {
      const matchingMaterial = branchInventoryMaterials.find(
        (material) => material.materialId.toString() === (item.materialId as IMaterial)._id.toString(),
      );
      return {
        ...item,
        inventoryVolume: matchingMaterial ? matchingMaterial.inventoryVolume : 0,
        materialId: item.materialId,
        empty: !matchingMaterial
          ? true
          : matchingMaterial?.inventoryVolume < item.quantity || matchingMaterial?.inventoryVolume === 0
            ? true
            : false,
      };
    });

    return filteredInventory as TMaterialPlanOrder[];
  };
  const calcInventoryCakes = (inventoryCake: TCakeInventory[] | undefined, orderItems: IOrderItem[]) => {
    if (!Array.isArray(orderItems) || orderItems.length === 0) return [];

    if (!inventoryCake || inventoryCake.length === 0) {
      return orderItems.map((item) => ({
        ...item,
        currentInventory: 0,
      }));
    }
    const uniqueOrderItems = orderItems.reduce((acc: IOrderItem[], item: IOrderItem) => {
      const existingItem = acc.find((i) => {
        const cakeIdMatch = (i.cakeId as ICake)._id.toString() === (item.cakeId as ICake)._id.toString();
        const variantsMatch =
          i.selectedVariants.length === item.selectedVariants.length &&
          i.selectedVariants.every(
            (v, index) =>
              v.variantKey.toString() === item.selectedVariants[index].variantKey.toString() &&
              v.itemKey.toString() === item.selectedVariants[index].itemKey.toString(),
          );
        return cakeIdMatch && variantsMatch;
      });

      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        acc.push({
          ...item,
        });
      }
      return acc;
    }, []);

    return uniqueOrderItems.map((item) => {
      let currentInventory = 0;
      let itemPrice = item.priceAtBuy;

      const matchingCake = inventoryCake.find((cake) => {
        const cakeIdMatches = cake.cakeId.toString() === (item.cakeId as ICake)._id.toString();
        if (item.selectedVariants.length === 0) {
          return cakeIdMatches && cake.selectedVariants.length === 0;
        }
        if (cakeIdMatches) {
          return (
            cake.selectedVariants.length === item.selectedVariants.length &&
            item.selectedVariants.every((variant) =>
              cake.selectedVariants.some(
                (cakeVariant) =>
                  cakeVariant.variantKey.toString() === variant.variantKey.toString() &&
                  cakeVariant.itemKey.toString() === variant.itemKey.toString(),
              ),
            )
          );
        }
        return false;
      });

      if (matchingCake) {
        if (item.selectedVariants && item.selectedVariants.length > 0 && orderDetail?.customerId) {
          item.selectedVariants.forEach((variant) => {
            const matchingVariant = (item.cakeId as ICake).cakeVariants.find(
              (v) => v._id === variant.variantKey,
            );
            if (matchingVariant) {
              const matchingItem = matchingVariant.variantItems.find((vi) => vi._id === variant.itemKey);
              if (matchingItem) {
                itemPrice += matchingItem.itemPrice;
              }
            }
          });
        }
        currentInventory = matchingCake.inventoryVolume;
      }
      return { ...item, currentInventory, priceAtBuy: itemPrice };
    });
  };

  const calcOrderItems = calcInventoryCakes(
    orderDetail?.branchId.branchInventory?.cakes as TCakeInventory[],
    orderDetail?.orderItems as IOrderItem[],
  );

  const handleConfirmOrder = (orderId: string, status: TOrderStatus) => {
    const orderStatus: Record<string, Partial<TOrderStatus>> = {
      orderStatus: status,
    };
    if (currentBranch) {
      staffAxios
        .patch<IAPIResponse<IOrder>>(apiRoutes.orders.updateStatus(orderId as string), orderStatus)
        .then((response) => response.data)
        .then((response) => {
          setIsFetching(false);
          if (response.status === "success") fetchData();
        })
        .catch((err: AxiosError) =>
          toast.error((err.response?.data as IAPIResponseError).message.split(": ")[1] || err?.message),
        )
        .finally(() => setIsFetching(false));
    }
  };
  const handleDestroyOrder = (orderId: string, orderStatus: Partial<TOrderStatus>) => {
    if (orderStatus === "cancelled" && cancelReason === "")
      return toast.warn("Vui lòng nhập lý do", { autoClose: 2000 });
    if (orderStatus === "rejected" && rejectedReason === "")
      return toast.warn("Vui lòng nhập lý do", { autoClose: 2000 });
    const payload = {
      orderStatus,
      explainReason: orderStatus === "cancelled" ? cancelReason : rejectedReason,
    };
    setIsFetching(true);
    axiosClient
      .patch<IAPIResponse<IOrder>>(apiRoutes.orders.cancelOrder(orderId), payload)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          fetchData();
          toast.success("Thao tác thành công");
        }
      })
      .catch((err) => console.log(err))
      .finally(() => {
        if (orderStatus === "cancelled") {
          onOpenCancelChange();
        } else {
          onOpenChange();
        }
        setIsFetching(false);
      });
  };
  const handleAddQueueProduction = (calcOrderItems: IOrderItem[], branchId: string, onClose: () => void) => {
    staffAxios
      .patch<IAPIResponse<IPlan>>(apiRoutes.plans.addQueue(selectedPlanId), {
        orderId: orderDetail?._id,
        orderItems: calcOrderItems,
        branchId,
      })
      .then((response) => response.data)
      .then((plan) => {
        if (plan.results) {
          toast.success("Thêm vào kế hoạch thành công");
          handleConfirmOrder(orderDetail?._id as string, "queue");
          onClose();
        }
      });
  };

  if (!orderDetail) return <Loading />;

  const buttonConfigs = (
    hasCustomerId: boolean,
    orderType: "customerOrder" | "selfOrder",
  ): Record<TOrderStatus, ButtonConfig[]> => ({
    pending: [
      {
        color: "warning",
        label: hasCustomerId
          ? "Xác nhận đơn hàng"
          : orderType === "customerOrder"
            ? "Xác nhận đơn khách hàng"
            : "Xác nhận đơn nội bộ",
        icon: <BiListCheck size={iconSize.medium} />,
        isDisabled: planUsageMaterials.some((x) => x.empty),
        onClick: () =>
          orderDetail?.orderUrgent?.isUrgent ||
          (!orderDetail.customerId && orderDetail.orderType === "customerOrder") ||
          orderDetail.orderGroupId.paymentStatus === "success"
            ? handleConfirmOrder(String(orderDetail?._id), "processing")
            : onOpenQueue(),
      },
      {
        color: "danger",
        label: "Hủy đơn",
        icon: <BiMessageAltX size={iconSize.medium} />,
        onClick: onOpenCancel,
      },
    ],
    queue: [
      {
        color: "warning",
        label: "Đơn hàng đang chờ sản xuất",
        icon: <BiLoaderCircle size={iconSize.medium} />,
        isDisabled: true,
      },
    ],
    processing: [
      {
        color: "primary",
        label: "Đơn hàng đang xử lý",
        icon: <BiLoaderCircle size={iconSize.medium} />,
        onClick: () => handleConfirmOrder(String(orderDetail?._id), "ready"),
        isDisabled: isFetching,
      },
    ],
    ready: [
      {
        color: "secondary",
        label: "Đơn hàng sẵn sàng để giao",
        icon: <BiCheckCircle size={iconSize.medium} />,
        onClick: () => handleConfirmOrder(String(orderDetail?._id), "shipping"),
        isDisabled: isFetching,
      },
    ],
    shipping: [
      {
        color: "success",
        label: "Đơn hàng đang được giao",
        icon: <BiSolidTruck size={iconSize.medium} />,
        onClick: () => handleConfirmOrder(String(orderDetail?._id), "completed"),
        isDisabled: isFetching,
      },
      {
        color: "warning",
        label: "Đơn hàng bị từ chối",
        icon: <BiError size={iconSize.medium} />,
        onClick: onOpen,
      },
    ],
    completed: [
      {
        color: "success",
        label: "Đơn hàng đã hoàn thành",
        icon: <BiCheck size={iconSize.medium} />,
        isDisabled: true,
      },
    ],
    rejected: [
      {
        color: "warning",
        label: "Đơn hàng bị từ chối",
        isDisabled: true,
        icon: <BiError size={iconSize.medium} />,
      },
    ],
    cancelled: [
      {
        color: "danger",
        label: "Đơn hàng đã hủy",
        isDisabled: true,
        icon: <BiX size={iconSize.medium} />,
      },
    ],
    returned: [
      {
        color: "secondary",
        label: "Đơn hàng đã được trả lại",
        isDisabled: true,
        icon: <BiUndo size={iconSize.medium} />,
      },
    ],
  });

  const currentButtons =
    buttonConfigs(!!orderDetail?.orderGroupId?.customerId, orderDetail?.orderType ?? "customerOrder")[
      orderDetail?.orderStatus as TOrderStatus
    ] || [];

  return (
    <WrapperContainer>
      <FormRejectedOrderProps
        isOpen={isOpen}
        onOpen={onOpen}
        onOpenChange={onOpenChange}
        onConfirm={() => handleDestroyOrder(orderId as string, "rejected")}
        setRejectedReason={setRejectedReason}
      />
      <FormCancelOrder
        isOpen={isOpenCancel}
        onOpen={onOpenCancel}
        onOpenChange={onOpenCancelChange}
        onConfirm={() => handleDestroyOrder(orderId as string, "cancelled")}
        setCancelReason={setCancelReason}
      />
      <AdminHeader
        title={`THÔNG TIN ĐƠN HÀNG #${orderDetail ? sliceText(orderDetail._id) : "Đang lấy dữ liệu..."}`}
        refBack={refBack}
        showBackButton={true}
        addOnElement={
          <Chip size={"lg"} color={orderDetail ? MapOrderStatusColor[orderDetail.orderStatus] : "warning"}>
            {orderDetail ? MapOrderStatusText[orderDetail?.orderStatus] : "Đang lấy dữ liệu"}
          </Chip>
        }
      />
      <div className="grid max-2xl:gap-y-4 2xl:grid-cols-8 2xl:gap-x-4">
        <div className="flex flex-col gap-4 2xl:col-span-5">
          <CakeList
            orderItems={calcOrderItems as IOrderItem[]}
            orderType={orderDetail?.orderType ?? "customerOrder"}
            isCustomerOrder={!!orderDetail?.orderGroupId?.customerId || true}
          />
          <MaterialUsagePlan materialUsage={planUsageMaterials} />
        </div>
        <div className="flex w-full flex-col gap-2 2xl:col-span-3">
          <div className="flex items-center gap-4 rounded-2xl border p-4 shadow-custom">
            <h5 className="max-lg:text-xl">Hẹn giao nhận</h5>
            <div className={"flex items-center gap-2"}>
              {orderDetail?.orderUrgent?.isUrgent ? (
                <Chip size={"lg"} color="danger" startContent={iconConfig.reset.noti.base}>
                  {formatDate(orderDetail.orderUrgent.orderExpectedTime, "onlyDate")}
                </Chip>
              ) : (
                <Chip size={"lg"} color="secondary" startContent={iconConfig.reset.noti.base}>
                  Giao thường
                </Chip>
              )}
              {orderDetail?.orderOptions && (
                <Chip size={"lg"} color={MapDeliveryMethodColor[orderDetail.orderOptions.deliveryMethod]}>
                  {MapDeliveryMethodText[orderDetail.orderOptions.deliveryMethod]}
                </Chip>
              )}
            </div>
          </div>
          <InvoiceSummary orderId={orderDetail?._id ?? ""} orderSummary={orderDetail?.orderSummary} />

          <CustomerInfor
            customerOrderInfo={orderDetail?.orderGroupId.customerInfo}
            orderPaymentMethod={orderDetail?.orderGroupId.paymentStatus}
            orderNote={orderDetail?.orderNote}
          />
          <div className={cn("grid gap-x-2", currentButtons.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
            {currentButtons.map((btn: ButtonConfig, index: number) => (
              <Button
                key={index}
                color={btn.color}
                className="w-full"
                size="lg"
                startContent={btn.icon}
                onClick={btn.onClick}
                variant={btn.color === "danger" ? "flat" : undefined}
                isDisabled={btn.isDisabled}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <Modal size={"xl"} isOpen={isOpenQueue} onOpenChange={onOpenQueueChange} onClose={onClose}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">{`Danh sách kế hoạch sản xuất ${selectedDayType ? "ngày" : "tuần"}`}</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-y-2">
                  <div className="self-end">
                    <Switch
                      isSelected={selectedDayType}
                      onValueChange={(isSelected) => {
                        setSelectedDayType(isSelected);
                        setIsFetchingPlan(true);
                      }}
                    >
                      {selectedDayType ? "Ngày" : "Tuần"}
                    </Switch>
                  </div>
                  {isFetchingPlan ? (
                    <Spinner label="Đang tải dữ liệu..." />
                  ) : planList && planList.length === 0 ? (
                    <p className="italic">Hiện tại chưa có kế hoạch sản xuất nào!</p>
                  ) : (
                    planList &&
                    planList.map((plan) => (
                      <div
                        key={plan._id}
                        className={clsx(
                          `flex select-none items-center justify-between gap-2 rounded-lg border p-4 hover:cursor-pointer`,
                          {
                            "border-2 border-primary": selectedPlanId === plan._id,
                          },
                        )}
                        onClick={() => {
                          setSelectedPlanId(plan._id as string);
                        }}
                        onDoubleClick={() => setSelectedPlanId("")}
                      >
                        <h6>{plan.planName}</h6>
                      </div>
                    ))
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Đóng
                </Button>
                <Button
                  color="primary"
                  variant="solid"
                  onPress={() =>
                    handleAddQueueProduction(
                      calcOrderItems as IOrderItem[],
                      (orderDetail.branchId as IBranch)._id,
                      onClose,
                    )
                  }
                  isDisabled={!selectedPlanId}
                >
                  Xác nhận
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </WrapperContainer>
  );
};

export default OrderDetails;
