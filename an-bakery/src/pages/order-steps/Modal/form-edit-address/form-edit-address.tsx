import { apiRoutes } from "@/config/routes/api-routes.config";
import useCustomerAxios from "@/hooks/useCustomerAxios";
import { IDistrict, IProvince, IWard } from "@/types/api-address";
import { IAPIResponse } from "@/types/api-response";
import { ICustomer, IUserAddresses } from "@/types/customer";
import validateEmail from "@/utils/validate-email";
import validatePhoneNumber from "@/utils/validate-phonenumber";
import {
  Button,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
interface FormEditAddressProps {
  isOpen: boolean;
  onOpenEditAddressChange: () => void;
  addressId: string | null;
  onUpdateAddress: (updatedAddress: IUserAddresses) => void;
}

const FormEditAddress = ({
  isOpen,
  onOpenEditAddressChange,
  addressId,
  onUpdateAddress,
}: FormEditAddressProps) => {
  const [provinces, setProvinces] = useState<IProvince[]>([]);
  const [districts, setDistricts] = useState<IDistrict[]>([]);
  const [wards, setWards] = useState<IWard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const axiosCustomer = useCustomerAxios();
  const [addressForm, setAddressForm] = useState<IUserAddresses>({
    email: "",
    fullName: "",
    phoneNumber: "",
    fullAddress: "",
    provinceId: "",
    districtId: "",
    wardId: "",
  });
  const handleProvinceChange = (value: string) => {
    if (value === "") return;
    setAddressForm((prev) => ({ ...prev, provinceId: value, districtId: "" }));
    const findProvince = provinces.find((province) => province.province_id === value);
    if (!findProvince) return;
    const newAddress = addressForm.fullAddress.split(",");
    newAddress[3] = findProvince.province_name;
    // setAddressForm((prev) => ({ ...prev, fullAddress: newAddress.slice(0, 2).join(",") }));
    setAddressForm((prev) => ({ ...prev, fullAddress: newAddress.join(",") }));
    axios
      .get(apiRoutes.locationAPI.district(value))
      .then((response) => response.data)
      .then(({ results }) => {
        return setDistricts(results);
      })
      .catch((error) => console.error(error));
  };

  const handleDistrictChange = (value: string) => {
    if (value === "") return;
    setAddressForm((prev) => ({ ...prev, districtId: value }));
    const findDistrict = districts.find((district) => district.district_id === value);
    if (!findDistrict) return;
    const newAddress = addressForm.fullAddress.split(",");
    newAddress[2] = findDistrict.district_name;
    setAddressForm((prev) => ({ ...prev, fullAddress: newAddress.join(",") }));
    axios
      .get(apiRoutes.locationAPI.ward(value))
      .then((response) => response.data)
      .then(({ results }) => setWards(results))
      .catch((error) => console.error(error));
  };
  const handleWardChange = (value: string) => {
    if (value === "") return;
    setAddressForm((prev) => ({ ...prev, wardId: value }));
    const findWard = wards.find((ward) => ward.ward_id === value);
    if (!findWard) return;
    const newAddress = addressForm.fullAddress.split(",");
    newAddress[1] = findWard.ward_name;
    setAddressForm((prev) => ({ ...prev, fullAddress: newAddress.join(",") }));
  };
  const handleFullAddressChange = (value: string) => {
    const newValue = value.replace(/,/g, " - ");
    const newAddress = addressForm.fullAddress.split(",");
    newAddress[0] = newValue;
    setAddressForm((prev) => ({ ...prev, fullAddress: newAddress.join(",") }));
  };
  const handleEditNewAddress = () => {
    if ([addressForm.email, addressForm.fullName, addressForm.phoneNumber].includes("")) {
      toast.info("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (!validateEmail(addressForm.email)) {
      toast.error("Email không hợp lệ");
      return;
    }
    if (!validatePhoneNumber(addressForm.phoneNumber)) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }
    const fullAddressValid = addressForm.fullAddress.split(",").map((str) => str.trim());
    if (fullAddressValid.length < 4 || fullAddressValid.includes("")) {
      return toast.error("Vui lòng chọn địa chỉ cụ thể.");
    }
    axiosCustomer
      .patch<IAPIResponse<ICustomer>>(apiRoutes.customers.me.update(addressId as string), addressForm)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success("Cập nhật địa chỉ mới thành công.");
          onUpdateAddress(addressForm);
          onOpenEditAddressChange();
        }
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    Promise.all([
      axios.get(apiRoutes.locationAPI.provinces),
      axiosCustomer.get<IAPIResponse<IUserAddresses>>(
        apiRoutes.customers.me.getAddressInfo(addressId as string),
      ),
    ])
      .then(([provincesResponse, addressResponse]) =>
        Promise.all([provincesResponse.data, addressResponse.data]),
      )
      .then(([provincesData, addressData]) => {
        const { email, fullName, phoneNumber, fullAddress, provinceId, districtId, wardId } =
          addressData.results;
        setProvinces(provincesData.results);
        setAddressForm({
          email,
          fullName,
          phoneNumber,
          fullAddress,
          provinceId,
          districtId,
          wardId,
        });
      })
      .catch((error) => console.error(error))
      .finally(() => setIsLoading(false));
  }, []);
  useEffect(() => {
    if (addressForm.provinceId && addressForm.districtId) {
      const fetchDistricts = axios
        .get(apiRoutes.locationAPI.district(addressForm.provinceId as string))
        .then((response) => response.data);
      const fetchWards = fetchDistricts.then(() =>
        axios
          .get(apiRoutes.locationAPI.ward(addressForm.districtId as string))
          .then((response) => response.data),
      );
      Promise.all([fetchDistricts, fetchWards])
        .then(([districtData, wardData]) => {
          setDistricts(districtData.results);
          setWards(wardData.results);
        })
        .catch((error) => console.error(error))
        .finally(() => setIsLoading(false));
    } else {
      setWards([]);
    }
  }, [addressForm.provinceId, addressForm.districtId]);
  console.log(addressForm);
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenEditAddressChange} size="3xl" placement="top">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Cập nhật địa chỉ mới</ModalHeader>
            <ModalBody className="flex flex-col gap-y-4">
              <div className="flex gap-x-2">
                <Input
                  value={addressForm.fullName}
                  label="Họ và tên"
                  labelPlacement={"outside"}
                  placeholder={"Nhập họ và tên"}
                  variant="bordered"
                  size={"lg"}
                  onValueChange={(e) => setAddressForm((prev) => ({ ...prev, fullName: e }))}
                />
                <Input
                  value={addressForm.phoneNumber}
                  label="Số điện thoại"
                  labelPlacement={"outside"}
                  placeholder={"Nhập số điện thoại"}
                  size={"lg"}
                  variant="bordered"
                  onValueChange={(value) => setAddressForm((prev) => ({ ...prev, phoneNumber: value }))}
                />
              </div>
              <Input
                value={addressForm.email}
                label="Email"
                labelPlacement={"outside"}
                placeholder={"Nhập email"}
                size={"lg"}
                variant="bordered"
                onValueChange={(value) => setAddressForm((prev) => ({ ...prev, email: value }))}
              />
              <Divider />
              <div className="flex gap-x-2">
                <Select
                  variant={"bordered"}
                  selectedKeys={[addressForm.provinceId as string]}
                  placeholder="Chọn Tỉnh/Thành phố"
                  aria-label="Tỉnh thành phố"
                  label={"Tỉnh/Thành phố"}
                  labelPlacement={"outside"}
                  size="lg"
                  onSelectionChange={(e) => handleProvinceChange(Array.from(e).join(""))}
                >
                  {provinces.map((province) => (
                    <SelectItem key={province.province_id}>{province.province_name}</SelectItem>
                  ))}
                </Select>
                <Select
                  variant={"bordered"}
                  selectedKeys={[addressForm.districtId as string]}
                  placeholder="Chọn Quận/Huyện"
                  label={"Quận/Huyện"}
                  labelPlacement={"outside"}
                  size="lg"
                  aria-label="Quận Huyện"
                  onSelectionChange={(e) => handleDistrictChange(Array.from(e).join(""))}
                >
                  {districts.map((district) => (
                    <SelectItem key={district.district_id}>{district.district_name}</SelectItem>
                  ))}
                </Select>
                <Select
                  variant={"bordered"}
                  selectedKeys={[addressForm.wardId as string]}
                  placeholder="Chọn Phường/Xã"
                  label={"Phường/Xã"}
                  labelPlacement={"outside"}
                  aria-label="Phường Xã"
                  size="lg"
                  onSelectionChange={(e) => handleWardChange(Array.from(e).join(""))}
                >
                  {wards.map((ward) => (
                    <SelectItem key={ward.ward_id}>{ward.ward_name}</SelectItem>
                  ))}
                </Select>
              </div>
              <Input
                value={addressForm.fullAddress.split(",")[0]}
                label="Địa chỉ cụ thể"
                labelPlacement={"outside"}
                placeholder={"Nhập địa chỉ cụ thể"}
                size="lg"
                variant="bordered"
                onValueChange={handleFullAddressChange}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Trở lại
              </Button>
              <Button color="primary" onPress={handleEditNewAddress}>
                Hoàn thành
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default FormEditAddress;
