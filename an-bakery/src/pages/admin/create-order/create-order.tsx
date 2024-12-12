import AdminHeader from "@/components/admin/admin-header";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useRole from "@/hooks/useRole";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse } from "@/types/api-response";
import { IBranch } from "@/types/branch";
import { ICake } from "@/types/cake";
import { ICartItem } from "@/types/cart";
import { IOrderGroup, ISelfOrderForm } from "@/types/order";
import { displayImage } from "@/utils/display-image";
import { calculateDiscountPrice, formatCurrencyVND } from "@/utils/money-format";
import { slugify } from "@/utils/slugify";
import {
  Button,
  ButtonGroup,
  Divider,
  Image,
  ScrollShadow,
  Select,
  SelectItem,
  Switch,
} from "@nextui-org/react";
import clsx from "clsx";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface CreateOrderProps {}

const CreateOrder = (props: CreateOrderProps) => {
  const navigate = useNavigate();
  const staffAxios = useStaffAxios();
  const currentBranch = useCurrentBranch();
  const currentStaffRole = useRole();

  const [listCakes, setListCakes] = useState<ICake[]>([]);
  const [listSelectedCakes, setListSelectedCakes] = useState<ICake[]>([]);
  const [tempCart, setTempCart] = useState<ICartItem[]>([]);
  const [listBranches, setListBranches] = useState<IBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [currentOrderType, setCurrentOrderType] = useState<boolean>(true);

  const getListBranches = () => {
    return staffAxios
      .get(apiRoutes.branches.getAll)
      .then((response) => response.data)
      .then((response) => {
        setListBranches(response.results);
      });
  };

  const getListCakes = () => {
    if (currentStaffRole === 2 && selectedBranch === "") {
      return;
    }

    return staffAxios
      .get(apiRoutes.branches.getBusinessProducts(currentStaffRole === 2 ? selectedBranch : currentBranch), {
        params: {
          noPagination: true,
        },
      })
      .then((response) => response.data)
      .then((response) => {
        setListCakes(response.results);
      });
  };

  const handleAddCakeToListSelected = (cakeId: string) => {
    const addData: ICartItem = {
      cakeId,
      branchId: currentBranch,
      selectedVariants: [],
      quantity: 1,
    };
    if (listCakes.find((_i) => _i._id === cakeId)) {
      setListSelectedCakes([...listSelectedCakes, listCakes.find((_i) => _i._id === cakeId)!]);
      setTempCart([...tempCart, addData]);
      toast.success("Thêm thành công");
    } else {
      toast.error("Sản phẩm không tồn tại");
    }
  };

  const handleRemove = (index: number) => {
    console.log(index);
    setTempCart((prev) =>
      prev.filter((_i, _index) => {
        console.log(_index);
        return _index !== index;
      }),
    );
    setListSelectedCakes((prev) => prev.filter((_i, _index) => _index !== index));

    toast.success("Xóa thành công");
  };

  const handleChangeQuantity = (index: number, action: "minus" | "add") => {
    setTempCart((prev) =>
      prev.map((item, _index) => {
        if (_index === index) {
          if (action === "add") {
            return {
              ...item,
              quantity: item.quantity + 1,
            };
          } else {
            if (item.quantity - 1 !== 0) {
              return {
                ...item,
                quantity: item.quantity - 1,
              };
            }
          }
        }
        return item;
      }),
    );
  };

  const handleSelectVariant = (index: number, variantKey: string, itemKey: string) => {
    setTempCart((prev) =>
      prev.map((item, _index) => {
        if (_index === index) {
          return {
            ...item,
            selectedVariants: [
              ...item.selectedVariants.filter((_v) => _v.variantKey !== variantKey),
              {
                variantKey,
                itemKey,
              },
            ],
          };
        }
        return item;
      }),
    );
  };

  const calculateTotalPriceOfCake = (index: number) => {
    const cakeData = listSelectedCakes[index];
    const inCartData = tempCart[index];

    let total = calculateDiscountPrice(cakeData.cakeDefaultPrice, cakeData.discountPercents);
    inCartData.selectedVariants.forEach((variant) => {
      const variantData = cakeData.cakeVariants.find((_v) => _v._id === variant.variantKey);
      const itemData = variantData?.variantItems.find((_i) => _i._id === variant.itemKey);

      total += itemData?.itemPrice ?? 0;
    });

    return {
      number: total * inCartData.quantity,
      text: formatCurrencyVND(total * inCartData.quantity),
    };
  };

  const calculateTotalCart = () => {
    let total = 0;
    tempCart.forEach((item, index) => {
      total += calculateTotalPriceOfCake(index).number;
    });
    return {
      number: total,
      text: formatCurrencyVND(total),
    };
  };

  const handleResetCart = () => {
    setListSelectedCakes([]);
    setTempCart([]);
  };

  const handleCreateOrder = () => {
    const postData: ISelfOrderForm = {
      subTotalPrice: calculateTotalCart().number,
      totalPrice: calculateTotalCart().number,
      reducedFee: 0,
      shippingFee: 0,
      orderType: currentOrderType ? "selfOrder" : "customerOrder",
      paymentStatus: "cashOnDelivery",
      orderData: [
        {
          branchId: currentStaffRole === 2 ? selectedBranch : currentBranch,
          branchVoucher: null,
          orderItems: tempCart.map((item, index) => ({
            ...item,
            priceAtBuy: calculateTotalPriceOfCake(index).number,
          })),
          orderNote: "",
          orderSummary: {
            subTotalPrice: calculateTotalCart().number,
            totalPrice: calculateTotalCart().number,
            reducedFee: 0,
            shippingFee: 0,
          },
          orderType: currentOrderType ? "selfOrder" : "customerOrder",
          orderOptions: { deliveryMethod: "atStore", deliveryTime: new Date().toISOString() },
        },
      ],
    };
    staffAxios
      .post<IAPIResponse<IOrderGroup>>(apiRoutes.orders.selfOrder, postData)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success("Tạo đơn hàng thành công");
          if (!currentBranch) {
            navigate(adminRoutes.order.root);
          } else {
            navigate(adminRoutes.branchOrder.root);
          }
        }
      });
  };

  const handleChangeBranch = (branchId: string) => setSelectedBranch(branchId);

  useEffect(() => {
    Promise.all([getListCakes(), getListBranches()]);
  }, []);

  useEffect(() => {
    getListCakes();
  }, [listSelectedCakes, tempCart, selectedBranch]);

  return (
    <WrapperContainer>
      <AdminHeader title={"Tạo đơn hàng"} />
      <div className={"flex flex-col gap-4"}>
        <div className={"rounded-2xl border p-4 shadow-custom"}>
          <Select
            label={"Chi nhánh"}
            labelPlacement={"outside-left"}
            size={"lg"}
            classNames={{ label: "min-w-max text-base", base: "items-center" }}
            selectedKeys={currentStaffRole === 2 ? [selectedBranch] : [currentBranch]}
            isDisabled={currentStaffRole !== 2}
            onSelectionChange={(e) => handleChangeBranch(Array.from(e).toString())}
          >
            {listBranches.map((branch) => (
              <SelectItem key={branch._id} value={branch._id}>
                {branch.branchConfig.branchDisplayName}
              </SelectItem>
            ))}
          </Select>
        </div>
        <div className={"grid grid-cols-12 gap-4"}>
          <div
            className={"col-span-4 flex max-h-[695px] flex-col gap-4 rounded-2xl border p-4 shadow-custom"}
          >
            <h4>Chọn sản phẩm</h4>
            <ScrollShadow hideScrollBar className={"flex max-h-[700px] flex-col gap-1 overflow-y-auto"}>
              {listCakes?.map((cake) => (
                <div
                  key={cake._id}
                  className={
                    "flex w-full items-center justify-between gap-4 rounded-xl p-2 transition-all duration-300 hover:bg-secondary/15"
                  }
                >
                  <div className={"flex items-center gap-4"}>
                    <Image
                      src={displayImage(cake.cakeThumbnail, cake._id)}
                      fallbackSrc="https://placehold.co/400"
                      alt={cake._id}
                      width={75}
                      height={75}
                      className={"border p-2"}
                    />
                    <p>{cake.cakeName}</p>
                  </div>
                  <Button
                    isIconOnly={true}
                    color={"primary"}
                    variant={"ghost"}
                    onClick={() => handleAddCakeToListSelected(cake._id)}
                  >
                    {iconConfig.add.base}
                  </Button>
                </div>
              ))}
            </ScrollShadow>
          </div>
          <div className={"col-span-8 flex flex-col gap-2"}>
            <div className={"flex h-4/5 flex-col gap-4 rounded-2xl border p-4 shadow-custom"}>
              <div className={"flex w-full items-center justify-between"}>
                <div className={"flex items-center gap-1"}>
                  <h4>Đã chọn </h4>
                  <h4 className={"text-primary"}>{listSelectedCakes.length}</h4>
                  <h4>sản phẩm</h4>
                </div>
                <Button color={"danger"} onClick={handleResetCart} startContent={iconConfig.deleteAll.base}>
                  Xóa tất cả
                </Button>
              </div>
              <ScrollShadow
                hideScrollBar={true}
                className={"flex h-full max-h-[700px] min-h-[60vh] flex-col gap-2"}
              >
                {listSelectedCakes.map((cake, index) => (
                  <Fragment key={cake._id + index}>
                    <div className={"grid w-full grid-cols-12 items-center justify-between gap-4"}>
                      <div
                        className={clsx("col-span-7 flex gap-4", {
                          "items-start": cake.cakeVariants?.length > 0,
                          "items-center": cake.cakeVariants?.length === 0,
                        })}
                      >
                        <Image
                          src={displayImage(cake.cakeThumbnail ?? "", cake._id ?? "")}
                          fallbackSrc="https://placehold.co/400"
                          alt={slugify(cake.cakeName)}
                          width={75}
                          height={75}
                          className={"max-w-[75px] border p-2"}
                        />
                        <div className={"flex w-full flex-col gap-1"}>
                          <p>{cake.cakeName}</p>
                          <div className={"grid grid-cols-2 items-center gap-4"}>
                            {cake.cakeVariants.map((variant) => (
                              <Select
                                aria-label={"Select variant"}
                                placeholder={variant.variantLabel}
                                className={"shrink-1"}
                                size={"sm"}
                                key={variant._id}
                                selectedKeys={[
                                  tempCart[index].selectedVariants.find((_v) => _v.variantKey === variant._id)
                                    ?.itemKey ?? "",
                                ]}
                                onSelectionChange={(e) =>
                                  handleSelectVariant(index, variant._id ?? "", Array.from(e).toString())
                                }
                              >
                                {variant.variantItems.map((item) => (
                                  <SelectItem
                                    key={item._id ?? ""}
                                    textValue={`${item.itemLabel} / +${formatCurrencyVND(item.itemPrice)}`}
                                  >
                                    {item.itemLabel} / +{formatCurrencyVND(item.itemPrice)}
                                  </SelectItem>
                                ))}
                              </Select>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className={"col-span-2 flex items-center justify-center gap-2"}>
                        <p className={"text-center text-2xl font-bold text-primary"}>
                          {calculateTotalPriceOfCake(index).text}
                        </p>
                      </div>
                      <div className={"col-span-2 flex justify-center"}>
                        <ButtonGroup variant={"flat"}>
                          <Button onClick={() => handleChangeQuantity(index, "minus")} isIconOnly={true}>
                            {iconConfig.minus.base}
                          </Button>
                          <Button isIconOnly={true}>{tempCart[index].quantity}</Button>
                          <Button onClick={() => handleChangeQuantity(index, "add")} isIconOnly={true}>
                            {iconConfig.add.base}
                          </Button>
                        </ButtonGroup>
                      </div>
                      <div className={"col-span-1 flex justify-center"}>
                        <Button
                          isIconOnly={true}
                          color={"danger"}
                          variant={"ghost"}
                          onClick={() => handleRemove(index)}
                        >
                          {iconConfig.delete.base}
                        </Button>
                      </div>
                    </div>
                    {index !== listSelectedCakes.length - 1 && <Divider className={"my-2"} />}
                  </Fragment>
                ))}
              </ScrollShadow>
            </div>
            <div className={"h-max rounded-2xl border p-4 shadow-custom"}>
              <div className={"flex justify-between"}>
                <div className={"flex items-center gap-2"}>
                  <p>Khách hàng</p>
                  <Switch isSelected={currentOrderType} onValueChange={setCurrentOrderType}></Switch>
                  <p>Cửa hàng</p>
                </div>
                <div className={"flex items-center gap-4"}>
                  <div className={"flex items-center gap-2"}>
                    <p>Tổng cộng: </p>
                    <p className={"text-3xl font-bold text-primary"}>{calculateTotalCart().text}</p>
                  </div>
                  <Button
                    size={"lg"}
                    color={"primary"}
                    onClick={handleCreateOrder}
                    isDisabled={tempCart.length === 0}
                  >
                    Tạo đơn hàng
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WrapperContainer>
  );
};

export default CreateOrder;
