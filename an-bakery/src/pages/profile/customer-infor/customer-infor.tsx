import vippoint from "@/assets/images/vippoint.png";
import iconConfig from "@/config/icons/icon-config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useCustomerAxios from "@/hooks/useCustomerAxios";

import { IAPIResponse } from "@/types/api-response";
import { IChangePasswordForm, ICustomer } from "@/types/customer";
import { formatDate } from "@/utils/format-date";
import { MapProviderIcon } from "@/utils/map-data/customers";

import {
  Avatar,
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import clsx from "clsx";
import { useState } from "react";
import { toast } from "react-toastify";

interface CustomerInforProps {
  customerInfo: ICustomer;
  onChangeUsername: (newUsername: string) => void;
  newUsername: string;
  setNewUsername: React.Dispatch<React.SetStateAction<string>>;
}
const CustomerInfor = ({
  customerInfo,
  onChangeUsername,
  newUsername,
  setNewUsername,
}: CustomerInforProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const customerAxios = useCustomerAxios();

  const [editingMode, setEditingMode] = useState<boolean>(false);
  const [changePasswordForm, setChangePasswordForm] = useState<IChangePasswordForm>({
    oldPassword: "",
    newPassword: "",
    retypeNewPassword: "",
    otpCode: "",
  });

  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);

  const handleSendEmail = () => {
    setIsSendingEmail(true);
    customerAxios
      .post<IAPIResponse>(apiRoutes.email.sendOtp)
      .then((response) => response.data)
      .then((data) => {
        if (data.status === "success") {
          toast.success("Gửi email thành công");
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setIsSendingEmail(false));
  };

  const handleChangePassword = (onClose: () => void) => {
    customerAxios
      .post<IAPIResponse>(apiRoutes.customers.changePassword, changePasswordForm)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success("Đổi mật khẩu thành công");
          onClose();
        }
      })
      .catch((error) => {
        const { data } = error.response;
        toast.error(data.message);
      });
  };

  const handleModalOnOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setChangePasswordForm({
        oldPassword: "",
        newPassword: "",
        retypeNewPassword: "",
        otpCode: "",
      });
      onOpenChange();
    }
  };

  const handleChangeUsername = () => {
    onChangeUsername(newUsername);
    setEditingMode(false);
  };

  return (
    <>
      <div className="flex items-start gap-4 rounded-2xl border p-4 shadow-custom">
        <div className={"w-max"}>
          <Avatar className="size-[82px]" name={customerInfo.userName.slice(0, 3)} size="lg" />
        </div>
        <div className="flex w-full justify-between">
          <div className="flex flex-col gap-4">
            <div>
              <div className={"flex items-center gap-2"}>
                <h5>{customerInfo?.userName}</h5>
                <Chip variant={"flat"} color={"success"}>
                  Thành viên
                </Chip>

                <div className={"flex justify-center"}>{MapProviderIcon[customerInfo.provider]}</div>
              </div>
              <p className="small italic text-dark/50">{customerInfo?.email}</p>
            </div>
            <div className={"flex items-center gap-1"}>
              <p className={"small italic text-dark/50"}>Tham gia hệ thống từ ngày</p>
              <p className={"font-semibold italic text-dark"}>
                {formatDate(customerInfo?.createdAt, "onlyDate")}
              </p>
            </div>
          </div>
          <div>
            <h5 className="mr-1 inline-block text-warning">{customerInfo?.vipPoints.currentPoint}</h5>
            <img src={vippoint} className="inline-block h-[19px] w-[26px]" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom">
        <div className="flex items-start justify-between">
          <h5>Thông tin của bạn</h5>
          <div className={"flex items-center gap-2"}>
            {customerInfo.provider === "credentials" && (
              <Button
                variant={"light"}
                startContent={iconConfig.lock.base}
                color={"secondary"}
                onClick={onOpen}
              >
                Đổi mật khẩu
              </Button>
            )}
            <Button
              startContent={iconConfig.edit.base}
              color={editingMode ? "success" : "warning"}
              onClick={() => (editingMode ? handleChangeUsername() : setEditingMode((prev) => !prev))}
            >
              {editingMode ? "Xong" : "Sửa"}
            </Button>
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-4 max-sm:grid-cols-1">
          <Input
            label={"Tên của bạn"}
            labelPlacement={"outside"}
            value={newUsername}
            onValueChange={setNewUsername}
            isReadOnly={!editingMode}
            variant={editingMode ? "bordered" : "flat"}
            size={"lg"}
          />
          <Input
            label={"Email của bạn"}
            labelPlacement={"outside"}
            value={customerInfo?.email}
            isReadOnly={true}
            size={"lg"}
          />
        </div>
      </div>
      <Modal isOpen={isOpen} onOpenChange={handleModalOnOpenChange} placement="top-center" size={"lg"}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h4>Đổi mật khẩu</h4>
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Mật khẩu cũ:"
                  labelPlacement={"outside-left"}
                  size={"lg"}
                  placeholder="Nhập mật khẩu cũ"
                  value={changePasswordForm.oldPassword}
                  onValueChange={(value) =>
                    setChangePasswordForm({ ...changePasswordForm, oldPassword: value })
                  }
                  variant="bordered"
                  classNames={{ label: "text-base min-w-[180px]", input: "w-full", mainWrapper: "w-full" }}
                />
                <Input
                  label="Mật khẩu mới:"
                  labelPlacement={"outside-left"}
                  size={"lg"}
                  placeholder="Nhập mật khẩu mới"
                  value={changePasswordForm.newPassword}
                  onValueChange={(value) =>
                    setChangePasswordForm({ ...changePasswordForm, newPassword: value })
                  }
                  variant="bordered"
                  classNames={{ label: "text-base min-w-[180px]", input: "w-full", mainWrapper: "w-full" }}
                />
                <Input
                  label="Nhập lại mật khẩu mới:"
                  labelPlacement={"outside-left"}
                  size={"lg"}
                  placeholder="Nhập lại mật khẩu mới"
                  value={changePasswordForm.retypeNewPassword}
                  onValueChange={(value) =>
                    setChangePasswordForm({ ...changePasswordForm, retypeNewPassword: value })
                  }
                  variant="bordered"
                  classNames={{ label: "text-base min-w-[180px]", input: "w-full", mainWrapper: "w-full" }}
                  isInvalid={
                    changePasswordForm.retypeNewPassword !== "" &&
                    changePasswordForm.newPassword !== changePasswordForm.retypeNewPassword
                  }
                  errorMessage="Mật khẩu không khớp"
                />
                <div className="flex items-end gap-x-4">
                  <Input
                    variant={"bordered"}
                    size={"lg"}
                    label={"Mã OTP:"}
                    labelPlacement={"outside-left"}
                    placeholder="Nhập OTP"
                    value={changePasswordForm.otpCode}
                    onValueChange={(value) =>
                      setChangePasswordForm({ ...changePasswordForm, otpCode: value })
                    }
                    classNames={{ label: "text-base min-w-[180px]", input: "w-full", mainWrapper: "w-full" }}
                  />
                  <Button
                    color={isSendingEmail ? "default" : "secondary"}
                    size={"lg"}
                    className={clsx("basis-36", {
                      "hover:cursor-wait": isSendingEmail,
                    })}
                    fullWidth={true}
                    isDisabled={isSendingEmail}
                    onClick={handleSendEmail}
                  >
                    Lấy mã
                  </Button>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Hủy
                </Button>
                <Button color="primary" onPress={() => handleChangePassword(onClose)}>
                  Đổi mật khẩu
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CustomerInfor;
