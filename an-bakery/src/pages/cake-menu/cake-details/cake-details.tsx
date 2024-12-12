import iconConfig, { iconSize } from "@/config/icons/icon-config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import textSizes from "@/config/styles/text-size";
import { Button, ButtonGroup, Image, Input, Select, SelectItem, useDisclosure } from "@nextui-org/react";
import { Fragment, useEffect, useState } from "react";
import { FaCartPlus, FaStar } from "react-icons/fa";
import { useParams } from "react-router-dom";
import CakeProperties from "./cake-properties";
import Description from "./description";
import Feedbacks from "./feedbacks";
import SimilarProducts from "./similar-cakes";
import LoadingClient from "@/components/common/loading-client";
import useAxios from "@/hooks/useAxios";
import useCustomerAxios from "@/hooks/useCustomerAxios";
import { IAPIResponse } from "@/types/api-response";
import { IAPIResponseError } from "@/types/api-response-error";
import { IBranch } from "@/types/branch";
import { ICake, ICakeDetail } from "@/types/cake";
import { ICartItem, IUserCart } from "@/types/cart";
import { formatCurrencyVND } from "@/utils/money-format";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import clientRoutes from "@/config/routes/client-routes.config";
import { useCookies } from "react-cookie";
import ModelFeedBacks from "./model-feed-backs";
import ModalConfirm from "@/components/admin/modal-confirm";
const ProductDetails = () => {
  const { cakeId } = useParams();
  const navigate = useNavigate();
  const axiosClient = useAxios();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onOpenChange: onOpenChangeCofirm } = useDisclosure();

  const [cookies, setCookie] = useCookies(["totalQuantity", "buyNow"]);
  const axiosCustomer = useCustomerAxios();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cakeInfo, setCakeInfo] = useState<ICakeDetail>({} as ICakeDetail);
  const [listBraches, setListBranches] = useState<IBranch[]>([]);
  const [customerCart, setCustomerCart] = useState<ICartItem>({
    branchId: "",
    cakeId: "" as string,
    selectedVariants: [],
    quantity: 1,
    cakeInfo: {} as ICake,
  });
  useEffect(() => {
    Promise.all([
      axiosClient.get<IAPIResponse<ICakeDetail>>(apiRoutes.cakes.getOne(cakeId as string)),
      axiosClient.get<IAPIResponse<IBranch[]>>(apiRoutes.branches.getAll),
      axiosClient.post<IAPIResponse<ICakeDetail>>(apiRoutes.cakes.increaseView(cakeId as string)),
    ])
      .then(([cakeResponse, branchResponse, viewResponse]) =>
        Promise.all([cakeResponse.data, branchResponse.data, viewResponse.data]),
      )
      .then(([cakeData, branchData]) => {
        const branchWithCake = branchData.results.filter((branch) =>
          branch.businessProducts.includes(cakeId as string),
        );
        if (cakeData.results.cakeInfo.isDeleted) {
          toast.error("Sản phẩm đã bị xóa !");
          return navigate(clientRoutes.home);
        }
        setCakeInfo(cakeData.results);

        setListBranches(branchWithCake);
        setCustomerCart({ ...customerCart, cakeId: cakeData.results.cakeInfo._id });
      })
      .catch((error) => {
        if (error instanceof AxiosError) {
          const responseError = error.response?.data as IAPIResponseError;
          if (
            responseError.message.includes("CastError - Cast to ObjectId failed for value") &&
            responseError.status === "error"
          ) {
            toast.error("Hệ thống không có sản phẩm này !");
            return navigate(clientRoutes.home);
          }
        }
        console.log(error);
      })
      .finally(() => setIsLoading(false));
  }, [cakeId]);
  const handleIncreaseQuantity = () => {
    setCustomerCart({ ...customerCart, quantity: customerCart.quantity + 1 });
  };
  const handleDecreaseQuantity = () => {
    if (customerCart.quantity === 1) return;
    setCustomerCart({ ...customerCart, quantity: customerCart.quantity - 1 });
  };

  const handleAddToCart = () => {
    if (!customerCart.branchId) return toast.warning("Vui lòng chọn cửa hàng", { autoClose: 1000 });
    if (customerCart.quantity >= 10) {
      return onOpenChangeCofirm();
    }
    axiosCustomer
      .post<IAPIResponse<IUserCart>>(apiRoutes.cart.addToCart, customerCart)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          setCookie("totalQuantity", (cookies.totalQuantity ?? 0) + customerCart.quantity, { path: "/" });
          toast.success("Thêm vào giỏ hàng thành công", {
            autoClose: 1000,
          });
        }
      })
      .catch((error) => {
        if (error instanceof AxiosError) {
          const responseError = error.response?.data as IAPIResponseError;
          if (responseError && responseError.status === "error") {
            toast.error("Khách hàng vui lòng đăng nhập", { autoClose: 2000 });
          } else {
            toast.error("Đã có lỗi xảy ra", { autoClose: 2000 });
          }
        } else {
          toast.error("Đã có lỗi xảy ra", { autoClose: 2000 });
        }
      });
  };
  const handleConfirmStillAdd = () => {
    axiosCustomer
      .post<IAPIResponse<IUserCart>>(apiRoutes.cart.addToCart, customerCart)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          setCookie("totalQuantity", (cookies.totalQuantity ?? 0) + customerCart.quantity, { path: "/" });
          toast.success("Thêm vào giỏ hàng thành công", {
            autoClose: 1000,
          });
          onOpenChangeCofirm();
        }
      })
      .catch((error) => {
        if (error instanceof AxiosError) {
          const responseError = error.response?.data as IAPIResponseError;
          if (responseError && responseError.status === "error") {
            toast.error("Khách hàng vui lòng đăng nhập", { autoClose: 2000 });
          } else {
            toast.error("Đã có lỗi xảy ra", { autoClose: 2000 });
          }
        } else {
          toast.error("Đã có lỗi xảy ra", { autoClose: 2000 });
        }
      });
  };

  const handleSelectVariant = (variantKey: string, itemKey: string) => {
    const selectedVariants = customerCart.selectedVariants;
    const variantIndex = selectedVariants.findIndex((variant) => variant.variantKey === variantKey);
    if (variantIndex === -1) {
      selectedVariants.push({ variantKey, itemKey });
    } else {
      if (selectedVariants[variantIndex].itemKey === itemKey) {
        selectedVariants.splice(variantIndex, 1);
        setCustomerCart({ ...customerCart, selectedVariants });
        return;
      }
      selectedVariants[variantIndex].itemKey = itemKey;
    }
    setCustomerCart({ ...customerCart, selectedVariants });
  };
  const handleChangeImage = (image: string) => {
    console.log(image);
    const newCakeInfo = { ...cakeInfo };
    console.log(newCakeInfo);
    newCakeInfo.cakeMedias = newCakeInfo.cakeMedias.filter((media) => media !== image);
    newCakeInfo.cakeMedias.unshift(image);
    setCakeInfo(newCakeInfo);
  };
  const handleBuyNow = () => {
    if (!customerCart.branchId) return toast.warning("Hãy chọn một cửa hàng", { autoClose: 1000 });
    axiosCustomer
      .post<IAPIResponse<IUserCart>>(apiRoutes.cart.addToCart, customerCart)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success("Thêm vào giỏ hàng thành công", {
            autoClose: 1000,
          });
          // localStorage.setItem("buyNow", JSON.stringify(customerCart));
          navigate(clientRoutes.orderSteps.root);
        }
      })
      .catch((error) => {
        if (error instanceof AxiosError) {
          const responseError = error.response?.data as IAPIResponseError;
          if (responseError && responseError.status === "error") {
            toast.error("Khách hàng vui lòng đăng nhập", { autoClose: 2000 });
          } else {
            toast.error("Đã có lỗi xảy ra", { autoClose: 2000 });
          }
        } else {
          toast.error("Đã có lỗi xảy ra", { autoClose: 2000 });
        }
      });
  };
  if (isLoading) return <LoadingClient />;
  console.log(cakeInfo, "cakeInfo");
  return (
    <section>
      <ModalConfirm
        isOpen={isOpenConfirm}
        message="Bạn có chắc chắn vẫn thêm với số lượng này"
        onClose={onOpenChangeCofirm}
        onConfirm={handleConfirmStillAdd}
        color="primary"
        confirmMessage="Vẫn thêm"
      />
      <ModelFeedBacks isOpen={isOpen} onOpenChange={onOpenChange} cakeRates={cakeInfo.cakeRates} />
      <div className="mx-auto mt-8 max-w-7xl overflow-hidden max-[1310px]:px-2">
        <div className="grid max-w-7xl gap-x-4 gap-y-2 max-lg:px-4 md:grid-cols-2">
          <div className="w-full">
            <div className="flex items-center justify-center rounded-lg bg-danger-50 px-4 md:h-[632px]">
              <Image
                src={`http://localhost:3000/images/${cakeInfo.cakeInfo._id}/${cakeInfo.cakeMedias[0]}`}
                alt="Error"
                className="h-96 w-full object-cover max-sm:h-96"
              />
            </div>
            <div className="w-scrollbar scrollbar-track mt-4 flex w-full gap-x-2 overflow-hidden overflow-x-auto">
              {cakeInfo.cakeMedias.map((media, index) => (
                <img
                  src={`http://localhost:3000/images/${cakeInfo.cakeInfo._id}/${media}`}
                  className="size-48 rounded-xl bg-secondary-100 hover:cursor-pointer"
                  key={index}
                  onClick={() => handleChangeImage(media)}
                />
              ))}
            </div>
          </div>
          <div>
            <h1 className="max-lg:text-4xl">{cakeInfo.cakeInfo.cakeName}</h1>
            <div className="mt-2 flex items-center gap-x-3">
              <div className="flex gap-x-2">
                {Array.from({
                  length: 5,
                }).map((_, index) => {
                  return (
                    <FaStar
                      className={
                        index <
                        Math.round(
                          cakeInfo.cakeRates.reduce((acc, rate) => acc + rate.rateStars, 0) /
                            cakeInfo.cakeRates.length,
                        )
                          ? "text-warning"
                          : "text-default-300"
                      }
                      size={iconSize.medium}
                      key={index}
                    />
                  );
                })}
                {/* <FaStar className="text-warning" size={iconSize.medium} />
                <FaStar className="text-warning" size={iconSize.medium} />
                <FaStar className="text-warning" size={iconSize.medium} />
                <FaStar className="text-warning" size={iconSize.medium} />
                <FaStar className="text-warning" size={iconSize.medium} /> */}
                <span className={`${textSizes.base}`}>
                  (
                  {cakeInfo.cakeRates.length === 0
                    ? 0
                    : Math.round(
                        cakeInfo.cakeRates.reduce((acc, rate) => acc + rate.rateStars, 0) /
                          cakeInfo.cakeRates.length,
                      )}
                  .0 )
                </span>
              </div>
              <span className={`${textSizes.base} truncate text-warning`}>
                {cakeInfo.cakeRates.length} lượt đánh giá
              </span>
              <span className={`${textSizes.base} text-success`}>|</span>
              <span className={`${textSizes.base} truncate text-success`}>
                {cakeInfo?.cakeInfo.soldCount} Lượt bán
              </span>
              <span className={`${textSizes.base} truncate text-success`}>
                {cakeInfo?.cakeInfo.views} Lượt xem
              </span>
            </div>
            <h1 className="text-primary max-lg:py-4 max-lg:text-4xl lg:my-8">
              {formatCurrencyVND(cakeInfo.cakeInfo.cakeDefaultPrice, cakeInfo.cakeInfo.discountPercents)}
            </h1>
            <div className="flex flex-col gap-8">
              <div className={"flex flex-col gap-4"}>
                {cakeInfo.cakeVariants.map((variantItem, index) => (
                  <div key={index}>
                    <small className="block font-bold uppercase text-dark/50" key={index}>
                      {variantItem.variantLabel}
                    </small>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {variantItem.variantItems.map((variantChild, index) => (
                        <Button
                          size="sm"
                          radius="sm"
                          color={
                            customerCart.selectedVariants.find(
                              (variant) =>
                                variant.variantKey === variantItem._id &&
                                variant.itemKey === variantChild._id,
                            )
                              ? "primary"
                              : "default"
                          }
                          key={index}
                          onClick={() =>
                            handleSelectVariant(variantItem._id as string, variantChild._id as string)
                          }
                        >
                          {variantChild.itemLabel}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className={`flex gap-x-4`}>
                <div>
                  <Select
                    className="mt-2 w-[307px]"
                    size={"lg"}
                    aria-label="Chọn cửa hàng"
                    placeholder="Chọn cửa hàng"
                    label={"CHỌN CỬA HÀNG"}
                    labelPlacement={"outside"}
                    classNames={{
                      label: "font-bold",
                    }}
                    onSelectionChange={(e) =>
                      setCustomerCart({ ...customerCart, branchId: Array.from(e).join("") })
                    }
                  >
                    {listBraches.map((branch) => (
                      <SelectItem key={branch._id} value={branch._id}>
                        {branch.branchConfig.branchDisplayName}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className={"flex flex-col gap-1"}>
                  <span className={`${textSizes.base} text-default-flat block font-bold`}>SỐ LƯỢNG</span>
                  <ButtonGroup radius="sm" size="md" aria-label="btnGroup">
                    <Button isIconOnly className="w-10" onClick={handleDecreaseQuantity}>
                      {iconConfig.minus.base}
                    </Button>
                    <Button variant={"flat"} isIconOnly>
                      {customerCart.quantity}
                    </Button>
                    <Button isIconOnly className="w-10" onClick={handleIncreaseQuantity}>
                      {iconConfig.add.base}
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
              <div className={`flex gap-2 ${cakeInfo.cakeInfo.isHide ? "hidden" : ""}`}>
                <Button
                  size="lg"
                  color="primary"
                  variant="bordered"
                  startContent={<FaCartPlus size={iconSize.small} />}
                  onClick={handleAddToCart}
                >
                  Thêm vào giỏ hàng
                </Button>
                <Button className="grow-[1]" size="lg" color="primary" radius="md" onClick={handleBuyNow}>
                  Mua ngay
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 gap-x-4 gap-y-2 max-lg:px-4 lg:grid lg:grid-cols-2">
          <div className="flex flex-col gap-y-2">
            <CakeProperties cakeProperties={cakeInfo.cakeProperties} />
            <Description cakeDescription={cakeInfo.cakeInfo.cakeDescription} />
          </div>
          <Feedbacks cakeRates={cakeInfo.cakeRates} onOpenChange={onOpenChange} />
        </div>
        <SimilarProducts cakeId={cakeInfo.cakeInfo._id as string} />
      </div>
    </section>
  );
};
export default ProductDetails;
