import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ButtonGroup,
  Input,
  Image,
  Button,
  useDisclosure,
  Checkbox,
  Tooltip,
} from "@nextui-org/react";

import iconConfig from "@/config/icons/icon-config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import clientRoutes from "@/config/routes/client-routes.config";
import useAxios from "@/hooks/useAxios";
import useCart from "@/hooks/useCart";
import useCustomerAxios from "@/hooks/useCustomerAxios";
import { IAPIResponse } from "@/types/api-response";
import { IBranch } from "@/types/branch";
import { calculateDiscountPrice, formatCurrencyVND } from "@/utils/money-format";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalConfirmDeleteItemCart from "./modal-confirm-delete-item-cart";
import { TSelectedVariant } from "@/types/cart";
import { toast } from "react-toastify";
import ModalConfirm from "@/components/admin/modal-confirm";
import { ICake } from "@/types/cake";
const BranchCart = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isOpenDelete, onOpen: onOpenDelete, onOpenChange: onOpenChangeDelete } = useDisclosure();
  const {
    isOpen: isOpenResetCart,
    onOpen: onOpenResetCart,
    onClose: onCloseResetCart,
    onOpenChange: onOpenChangeResetCart,
  } = useDisclosure();
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [listBranches, setListBranches] = useState<IBranch[]>([]);
  const {
    handleDecreaseQuantity,
    handleIncreaseQuantity,
    handlePrice,
    totalPayment,
    deleteCakeFromBranchCart,
    handleShowSelectedVariant,
    cartCustomer,
    refetchCart,
  } = useCart();
  const [infoToDelete, setInfoToDelete] = useState<{
    branchId: string;
    cakeId: string;
    selectedVariants: TSelectedVariant[];
    cartId: string;
  }>();
  const axiosCustomer = useCustomerAxios();
  const axiosClient = useAxios();
  const navigate = useNavigate();
  useEffect(() => {
    axiosClient
      .get<IAPIResponse<IBranch[]>>(apiRoutes.branches.getAll)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          setListBranches(response.results);
        }
      })
      .catch((error) => console.log(error));
  }, []);

  const handleApplyVoucher = () => {
    onOpenChange();
    const orderData = {
      branchId: cartCustomer[0].branchId,
      subTotalPrice: totalPayment(),
    };
    axiosCustomer
      .post<IAPIResponse>(apiRoutes.cart.useDiscountCode, { voucherCode, orderData })
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          console.log(response.results);
        }
      })
      .catch((error) => console.log(error));
  };

  const showBranchName = (branchId: string) => {
    const branch = listBranches.find((branch) => branch._id === branchId);
    return branch?.branchConfig.branchDisplayName;
  };
  const handleConfirmItemCart = (
    branchId: string,
    cakeId: string,
    selectedVariants: TSelectedVariant[],
    quantity: number,
    cartId: string,
    isDelete = false,
  ) => {
    if (quantity === 1 || isDelete) {
      setInfoToDelete({ branchId, cakeId, selectedVariants, cartId });
      return onOpenDelete();
    } else {
      handleDecreaseQuantity(branchId, cakeId, selectedVariants, quantity, cartId);
    }
  };
  const handleDeleteConfirm = () => {
    onOpenChangeDelete();
    if (infoToDelete) {
      deleteCakeFromBranchCart(
        infoToDelete.branchId,
        infoToDelete.cakeId,
        infoToDelete.selectedVariants,
        infoToDelete.cartId,
      );
    }
  };
  const handleResetCart = () => {
    axiosCustomer
      .delete(apiRoutes.cart.resetCart)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success("Đã làm mới giỏ hàng");
          refetchCart();
          onOpenChangeResetCart();
        }
      })
      .catch((error) => console.log(error));
  };
  if (cartCustomer.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="italic text-default-400">Giỏ hàng của bạn đang trống</p>
      </div>
    );
  }
  console.log("cartCustomer", cartCustomer);
  return (
    <>
      <ModalConfirmDeleteItemCart
        isOpen={isOpenDelete}
        onOpen={onOpenDelete}
        onOpenChange={onOpenChangeDelete}
        onConfirmDelete={() => handleDeleteConfirm()}
      />
      <ModalConfirm
        message="Bạn có chắc chắn muốn làm mới giỏ hàng?"
        isOpen={isOpenResetCart}
        onClose={onCloseResetCart}
        onConfirm={handleResetCart}
      />
      <div className="mt-8 rounded-2xl border px-4 py-4">
        {cartCustomer.map((branchCart, index) => (
          <div key={index}>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" placement="top">
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      <h6>Chọn Voucher mã giảm giá</h6>
                    </ModalHeader>
                    <ModalBody>
                      <div className="flex flex-col gap-y-4">
                        <div className="flex gap-x-2">
                          <Input
                            placeholder="Nhập mã giảm giá"
                            size="md"
                            onValueChange={(value) => setVoucherCode(value)}
                          />
                          <Button onClick={handleApplyVoucher}>Áp dụng</Button>
                        </div>
                        <div>
                          <h6>Voucher của cửa hàng</h6>
                          <div className="flex h-96 scroll-pb-1 flex-col gap-y-2 overflow-y-scroll">
                            {Array.from({ length: 4 }).map((_, index) => (
                              <div
                                className="mr-2 flex h-28 items-center gap-x-2 rounded-md border p-4"
                                key={index}
                              >
                                <Checkbox />
                                <div className="flex flex-col gap-y-1">
                                  <h6>Giảm 10% cho đơn hàng trên 1,000,000đ</h6>
                                  <p>Đơn tối thiểu 300k</p>
                                  <p className="text-xs">
                                    HSD: 31/12/2021 - 31/12/2022 - 31/12/2023 - 31/12/2024
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* <div className="h-28 bg-primary opacity-15"></div> */}
                        </div>
                      </div>
                    </ModalBody>
                    <ModalFooter>
                      <Button color="danger" variant="light" onPress={onClose}>
                        Hủy bỏ
                      </Button>
                      <Button color="primary" onPress={onClose}>
                        Xác nhận
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
            <div className="flex items-center justify-between rounded-lg bg-default-100 p-2">
              <h5>{showBranchName(branchCart.branchId)}</h5>
            </div>
            <div>
              {branchCart.cartItems.map((cake, index) => {
                const selectedVariantsLength = handleShowSelectedVariant(
                  cake.selectedVariants,
                  (cake.cakeInfo as ICake).cakeVariants,
                );

                return (
                  <div className="mt-4 grid grid-cols-6 items-center max-md:grid-cols-5" key={index}>
                    <div className="flex gap-x-1 justify-self-center">
                      <Image
                        src={`http://localhost:3000/images/${cake?.cakeInfo?._id}/${cake.cakeInfo?.cakeThumbnail}`}
                        alt="Error"
                        className="h-[142px] w-[147px]"
                      />
                    </div>
                    <div className="col-span-2 flex h-full flex-col justify-center gap-4">
                      <h5>{cake.cakeInfo?.cakeName}</h5>

                      {selectedVariantsLength && (
                        <Tooltip color="primary" content={selectedVariantsLength}>
                          <p className="truncate">{selectedVariantsLength}</p>
                        </Tooltip>
                      )}
                      <Button
                        color="danger"
                        variant="flat"
                        size="sm"
                        className={"w-max"}
                        onClick={() =>
                          handleConfirmItemCart(
                            branchCart.branchId,
                            cake.cakeId as string,
                            cake.selectedVariants,
                            cake.quantity,
                            cake._id as string,
                            true,
                          )
                        }
                      >
                        Xóa
                      </Button>
                    </div>
                    <ButtonGroup size="md">
                      <Button
                        isIconOnly
                        onClick={() =>
                          handleConfirmItemCart(
                            branchCart.branchId,
                            cake.cakeId as string,
                            cake.selectedVariants,
                            cake.quantity,
                            cake._id as string,
                          )
                        }
                      >
                        {iconConfig.minus.small}
                      </Button>
                      <Button isIconOnly variant={"flat"}>
                        {cake.quantity}
                      </Button>
                      <Button
                        isIconOnly
                        onClick={() =>
                          handleIncreaseQuantity(
                            branchCart.branchId,
                            cake.cakeId as string,
                            cake.selectedVariants,
                            cake.quantity + 1,
                            cake._id as string,
                          )
                        }
                      >
                        {iconConfig.add.small}
                      </Button>
                    </ButtonGroup>
                    <h5 className="justify-self-center text-primary">
                      {formatCurrencyVND(
                        cake?.cakeInfo?.cakeDefaultPrice ?? 0,
                        cake?.cakeInfo?.discountPercents ?? 0,
                      )}
                    </h5>
                    <h5 className="justify-self-center text-primary">
                      {handlePrice(
                        calculateDiscountPrice(
                          cake?.cakeInfo?.cakeDefaultPrice ?? 0,
                          cake?.cakeInfo?.discountPercents ?? 0,
                        ) * cake.quantity,
                        cake.selectedVariants,
                        cake?.cakeInfo?.cakeVariants ?? [],
                        cake.quantity,
                      )}
                    </h5>
                  </div>
                );
              })}
              <div className="my-4 flex flex-col gap-y-4">
                <hr />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between gap-x-4 rounded-2xl border p-4">
        <Button startContent={iconConfig.reset.small} color="danger" onPress={onOpenResetCart}>
          Xóa tất cả
        </Button>
        <div className="flex gap-4">
          <div className="col-span-2 flex items-center gap-2">
            <h6>Tổng thanh toán</h6>
            <h4 className="text-primary">{formatCurrencyVND(totalPayment())}</h4>
          </div>
          <Button
            size="lg"
            radius="md"
            color="primary"
            onClick={() => navigate(clientRoutes.orderSteps.root)}
          >
            Thanh toán
          </Button>
        </div>
      </div>
    </>
  );
};

export default BranchCart;
