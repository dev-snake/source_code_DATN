import iconConfig, { iconSize } from "@/config/icons/icon-config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import clientRoutes from "@/config/routes/client-routes.config";
import useAxios from "@/hooks/useAxios";
import useCustomerAxios from "@/hooks/useCustomerAxios";
import { IAPIResponse } from "@/types/api-response";
import { IAPIResponseError } from "@/types/api-response-error";
import { IBranch } from "@/types/branch";
import { ICake } from "@/types/cake";
import { ICustomerCartForm, IUserCart, TSelectedVariant } from "@/types/cart";
import { displayImage } from "@/utils/display-image";
import { formatCurrencyVND } from "@/utils/money-format";
import { slugify } from "@/utils/slugify";
import {
  Button,
  ButtonGroup,
  CheckboxGroup,
  Chip,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
  Spinner,
  useDisclosure,
} from "@nextui-org/react";
import { AxiosError } from "axios";
import clsx from "clsx";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { FaCheckCircle, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ModalOrderOutside from "./modal-order-outside";
interface CakeDetailsProps {
  cakeData: ICake;
  isShowUtils?: boolean;
}
const CakeCard = ({ cakeData, isShowUtils = true }: CakeDetailsProps) => {
  const navigate = useNavigate();
  const axiosClient = useAxios();
  const axiosCustomer = useCustomerAxios();
  const [customerCartForm, setCustomerCartForm] = useState<ICustomerCartForm>({
    cakeId: null,
    branchId: null,
    quantity: 1,
    selectedVariants: [],
  });
  const [cookies, setCookie] = useCookies(["totalQuantity"]);
  const { isOpen, onOpenChange } = useDisclosure();
  const [listBranches, setListBranches] = useState<IBranch[]>([]);
  const [activeBorder, setActiveBorder] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string>("");
  const [cakeId, setCakeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const handleViewCake = (cakeId: string) => {
    navigate(clientRoutes.cakes.details(cakeId));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const fetchBranches = () => {
    axiosClient
      .get<IAPIResponse<IBranch[]>>(apiRoutes.branches.getAll + "?noPagination=true")
      .then((response) => response.data)
      .then((response) => {
        const branchWithCake = response.results.filter((branch) =>
          branch.businessProducts.includes(cakeData._id),
        );

        console.log("cakeData._id", cakeData.cakeVariants);
        console.log("branchWithCake", branchWithCake);
        setListBranches(branchWithCake);
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  };
  const handleShowBranches = () => {
    fetchBranches();
    onOpenChange();
  };
  const handleAddToCart = () => {
    if (!branchId || !cakeId) {
      toast.error("Vui lòng chọn chi nhánh", { autoClose: 1000 });
      return;
    }
    axiosCustomer
      .post<IAPIResponse<IUserCart>>(apiRoutes.cart.addToCart, customerCartForm)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          setCookie("totalQuantity", (cookies.totalQuantity ?? 0) + customerCartForm.quantity, { path: "/" });
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
    onOpenChange();
  };
  const handleSelectVariant = (variantKey: string, itemKey: string) => {
    const selectedVariants = customerCartForm.selectedVariants;
    const variantIndex = selectedVariants.findIndex((variant) => variant.variantKey === variantKey);
    if (variantIndex === -1) {
      selectedVariants.push({ variantKey, itemKey });
    } else {
      if (selectedVariants[variantIndex].itemKey === itemKey) {
        selectedVariants.splice(variantIndex, 1);
        setCustomerCartForm({ ...customerCartForm, selectedVariants });
        return;
      }
      selectedVariants[variantIndex].itemKey = itemKey;
    }
    setCustomerCartForm({ ...customerCartForm, selectedVariants });
  };
  return (
    <>
      <ModalOrderOutside
        isLoading={isLoading}
        isOpen={isOpen}
        activeBorder={activeBorder}
        listBranches={listBranches}
        customerCartForm={customerCartForm}
        cakeData={cakeData}
        onOpenChange={onOpenChange}
        setBranchId={setBranchId}
        setCakeId={setCakeId}
        setCustomerCartForm={setCustomerCartForm}
        setActiveBorder={setActiveBorder}
        handleSelectVariant={handleSelectVariant}
        handleAddToCart={handleAddToCart}
      />
      <div
        className="relative w-full cursor-pointer justify-self-center rounded-2xl px-4 pb-4 pt-2 shadow-custom"
        onClick={() => navigate(clientRoutes.cakes.details(cakeData._id))}
      >
        <div className="relative -top-6 rounded-2xl bg-secondary-100">
          {isShowUtils && (
            <Chip
              size="lg"
              radius="full"
              startContent={iconConfig.check.base}
              color="primary"
              className="absolute right-2 top-2 z-50 px-2"
            >
              Đặt trước
            </Chip>
          )}
          <div className="flex justify-center">
            <Image
              src={
                cakeData.cakeThumbnail
                  ? displayImage(cakeData.cakeThumbnail, cakeData._id)
                  : "https://placehold.co/400"
              }
              alt={slugify(cakeData.cakeName)}
              className="size-[268px] object-center p-4 hover:scale-90"
            />
          </div>
        </div>
        <div className={"flex flex-col gap-1"}>
          <h5 className="truncate max-sm:text-base">{cakeData.cakeName}</h5>
          <div className="inline-flex items-center gap-x-4">
            <h2 className="text-primary max-sm:text-2xl">
              {formatCurrencyVND(cakeData.cakeDefaultPrice, cakeData.discountPercents)}
            </h2>
            {cakeData.discountPercents > 0 && (
              <Chip variant="flat" color="primary" size="sm" radius="full">
                -{cakeData.discountPercents}%
              </Chip>
            )}
          </div>
          {isShowUtils && (
            <>
              <div className="flex w-full gap-2">
                <Button className="w-full" onClick={() => handleViewCake(cakeData._id)} color="primary">
                  Xem sản phẩm
                </Button>
                <Button
                  isIconOnly
                  color="primary"
                  variant="bordered"
                  onClick={() => {
                    setCustomerCartForm({ ...customerCartForm, cakeId: cakeData._id, selectedVariants: [] });
                    handleShowBranches();
                  }}
                >
                  <FaShoppingCart />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CakeCard;
