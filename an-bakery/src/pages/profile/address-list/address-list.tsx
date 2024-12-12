import iconConfig from "@/config/icons/icon-config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import clientRoutes from "@/config/routes/client-routes.config";
import textSizes from "@/config/styles/text-size";
import useCustomerAxios from "@/hooks/useCustomerAxios";
import { IAPIResponse } from "@/types/api-response";
import { IUserAddresses } from "@/types/customer";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
  useDisclosure,
} from "@nextui-org/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface AddressListProps {
  customerAddress: IUserAddresses[];
}
const AddressList: React.FC<AddressListProps> = ({ customerAddress }) => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [addressId, setAddressId] = useState<string>("");
  const axiosCustomer = useCustomerAxios();
  const [listAddress, setListAddress] = useState<IUserAddresses[]>(customerAddress);

  const handleDeleteAddress = (onClose: () => void) => {
    axiosCustomer
      .delete<IAPIResponse<IUserAddresses[]>>(apiRoutes.customers.me.delete(addressId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success("Xóa địa chỉ thành công");
          setListAddress((prevState) => prevState.filter((address) => address._id !== addressId));
          onClose();
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="w-full rounded-2xl border p-4 shadow-custom">
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h6>Xác nhận xóa địa chỉ</h6>
              </ModalHeader>
              <ModalBody>
                <p>Bạn có chắc chắn muốn xóa địa chỉ này không?</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Hủy bỏ
                </Button>
                <Button color="danger" onPress={() => handleDeleteAddress(onClose)}>
                  Xác nhận
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className={"flex flex-col gap-4"}>
        <div className="flex items-center justify-between">
          <h5>Địa chỉ của bạn</h5>
          <Button
            color={"primary"}
            startContent={iconConfig.add.small}
            onClick={() => navigate(clientRoutes.profile.addAddress)}
          >
            Thêm địa chỉ mới
          </Button>
        </div>
        <ScrollShadow className="flex max-h-96 flex-col gap-4 pb-2 pr-2">
          {listAddress.length === 0 ? (
            <p className="p-4 text-center italic text-dark">Bạn chưa có địa chỉ nào</p>
          ) : (
            listAddress.map((address, index) => (
              <div className="rounded-xl border px-4 py-2" key={index}>
                <div className="flex items-start justify-between">
                  <div className={"flex items-center"}>
                    <h6>
                      {address.fullName} - {address.phoneNumber}
                    </h6>
                  </div>
                  <div className={"flex gap-1"}>
                    <Button
                      color="warning"
                      variant="light"
                      size="sm"
                      isIconOnly
                      onClick={() => navigate(clientRoutes.profile.editAddress(address._id as string))}
                    >
                      {iconConfig.edit.base}
                    </Button>
                    <Button
                      color={"danger"}
                      variant={"light"}
                      size={"sm"}
                      isIconOnly
                      onClick={() => {
                        onOpen();
                        setAddressId(address._id as string);
                      }}
                    >
                      {iconConfig.delete.base}
                    </Button>
                  </div>
                </div>
                <p className={`${textSizes.sm} truncate pt-4`}>{address.fullAddress}</p>
              </div>
            ))
          )}
        </ScrollShadow>
      </div>
    </div>
  );
};

export default AddressList;
