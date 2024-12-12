import textSizes from "@/config/styles/text-size";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  RadioGroup,
  Radio,
  cn,
  Button,
  ModalFooter,
} from "@nextui-org/react";
import { IUserAddresses } from "@/types/customer";
import { ICustomerInfo, IOrderGroup, IOrderGroupForm } from "@/types/order";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import useCustomerAxios from "@/hooks/useCustomerAxios";
import { IAPIResponse } from "@/types/api-response";
import { apiRoutes } from "@/config/routes/api-routes.config";
import { Spinner } from "@nextui-org/react";
import iconConfig from "@/config/icons/icon-config";
interface OrderAddressProps {
  isOpen: boolean;
  onOpenChange: () => void;
  customerInfo: ICustomerInfo;
  onOpenAddAddressChange: () => void;
  onOpenEditAddressChange: (addressId: string) => void;
  setOrderGroup: React.Dispatch<React.SetStateAction<IOrderGroupForm>>;
}

const OrderAddress = ({
  isOpen,
  onOpenChange,
  customerInfo,
  setOrderGroup,
  onOpenAddAddressChange,
  onOpenEditAddressChange,
}: OrderAddressProps) => {
  const axiosCustomer = useCustomerAxios();
  const [listAddressOfCustomer, setListAddressOfCustomer] = useState<IUserAddresses[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  useEffect(() => {
    axiosCustomer
      .get<IAPIResponse<IUserAddresses[]>>(apiRoutes.customers.me.addresses)
      .then((response) => response.data)
      .then((data) => setListAddressOfCustomer(data.results))
      .catch((error) => console.error(error))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChangeAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("orderAddress", addressId);
    window.history.replaceState(null, "", `${window.location.pathname}?${urlParams}`);
    const selectedAddress = listAddressOfCustomer.find((address) => address._id === addressId);
    if (selectedAddress) {
      setOrderGroup((prev) => ({
        ...prev,
        customerInfo: {
          email: selectedAddress.email || "",
          fullAddress: selectedAddress.fullAddress || "",
          fullName: selectedAddress.fullName || "",
          phoneNumber: selectedAddress.phoneNumber || "",
        },
      }));
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const addressId = urlParams.get("orderAddress");
    if (addressId) {
      setSelectedAddressId(addressId);
    }
  }, []);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" placement="top">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Chọn địa chỉ nhận hàng</ModalHeader>
            <ModalBody>
              {isLoading && <Spinner label="Đang tải dữ liệu ..." />}
              <div className="w-scrollbar flex max-h-96 flex-col gap-2 overflow-y-auto">
                <RadioGroup color="primary" value={selectedAddressId} onValueChange={handleChangeAddress}>
                  {listAddressOfCustomer.map((address) => (
                    <Radio
                      key={address._id}
                      value={address._id || ""}
                      className={clsx(`rounded-2xl border-2`)}
                      classNames={{
                        base: cn(
                          "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
                          "flex-row-reverse max-w-full cursor-pointer rounded-lg gap-2 p-2 border-2 ",
                          "data-[selected=true]:border-primary",
                        ),
                      }}
                    >
                      <div className={"flex flex-col gap-2"}>
                        <div className="flex items-start justify-between">
                          <h6>
                            {address.fullName} - {address.phoneNumber}
                          </h6>
                        </div>
                        <p>{address.fullAddress}</p>
                        <Button
                          onClick={() => {
                            onOpenEditAddressChange(address._id || "");
                            onClose();
                          }}
                          size={"md"}
                          color={"primary"}
                          variant={"light"}
                          className={"w-max"}
                        >
                          Cập nhật
                        </Button>
                      </div>
                    </Radio>
                  ))}
                </RadioGroup>
                <Button
                  color="primary"
                  startContent={iconConfig.add.base}
                  onClick={() => {
                    onOpenAddAddressChange();
                    onClose();
                  }}
                  className={"w-max"}
                >
                  Thêm địa chỉ mới
                </Button>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Hủy bỏ
              </Button>
              <Button color="primary" onClick={onClose}>
                Xác nhận
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
export default OrderAddress;
