import { apiRoutes } from "@/config/routes/api-routes.config";

import LoadingClient from "@/components/common/loading-client";
import iconConfig from "@/config/icons/icon-config";
import clientRoutes from "@/config/routes/client-routes.config";
import useCustomerAxios from "@/hooks/useCustomerAxios";
import { IDistrict, IProvince, IWard } from "@/types/api-address";
import { IAPIResponse } from "@/types/api-response";
import { IUserAddresses } from "@/types/customer";
import validateEmail from "@/utils/validate-email";
import validatePhoneNumber from "@/utils/validate-phonenumber";
import { Button, Divider, Input, Select, SelectItem } from "@nextui-org/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ClientHeader from "@/components/client/client-header";

const AddAddress = () => {
  const navigate = useNavigate();
  const axiosCustomer = useCustomerAxios();
  const [provinces, setProvinces] = useState<IProvince[]>([]);
  const [districts, setDistricts] = useState<IDistrict[]>([]);
  const [wards, setWards] = useState<IWard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [addressForm, setAddressForm] = useState<IUserAddresses>({
    email: "",
    fullName: "",
    phoneNumber: "",
    fullAddress: "",
    provinceId: "",
    districtId: "",
    wardId: "",
  });
  useEffect(() => {
    axios
      .get(apiRoutes.locationAPI.provinces)
      .then((response) => response.data)
      .then(({ results }) => setProvinces(results))
      .catch((error) => console.error(error))
      .finally(() => setIsLoading(false));
  }, []);

  const handleProvinceChange = (value: string) => {
    if (value === "") return;

    const selectedProvince = provinces.find((province) => province.province_id === value);
    if (!selectedProvince) return;

    setAddressForm((prev) => {
      const [specificAddress] = prev.fullAddress.split(",", 1);
      return {
        ...prev,
        provinceId: value,
        districtId: "",
        wardId: "",
        fullAddress: `${specificAddress || "_"},_,_,${selectedProvince.province_name}`,
      };
    });

    axios
      .get(apiRoutes.locationAPI.district(value))
      .then((response) => response.data)
      .then(({ results }) => setDistricts(results))
      .catch((error) => console.error(error));
  };

  const handleDistrictChange = (value: string) => {
    if (value === "") return;

    const selectedDistrict = districts.find((district) => district.district_id === value);
    if (!selectedDistrict) return;

    setAddressForm((prev) => {
      const [specificAddress, wardName] = prev.fullAddress.split(",");
      return {
        ...prev,
        districtId: value,
        wardId: "",
        fullAddress: `${specificAddress || "_"},${"_"},${selectedDistrict.district_name},${prev.fullAddress.split(",")[3]}`,
      };
    });

    axios
      .get(apiRoutes.locationAPI.ward(value))
      .then((response) => response.data)
      .then(({ results }) => setWards(results))
      .catch((error) => console.error(error));
  };

  const handleWardChange = (value: string) => {
    if (value === "") return;

    const selectedWard = wards.find((ward) => ward.ward_id === value);
    if (!selectedWard) return;

    setAddressForm((prev) => {
      const [specificAddress] = prev.fullAddress.split(",", 1);
      return {
        ...prev,
        wardId: value,
        fullAddress: `${specificAddress || "_"},${selectedWard.ward_name},${prev.fullAddress.split(",")[2]},${prev.fullAddress.split(",")[3]}`,
      };
    });
  };

  const handleFullAddressChange = (value: string) => {
    setAddressForm((prev) => {
      const [, wardName, districtName, provinceName] = prev.fullAddress.split(",");
      return {
        ...prev,
        fullAddress: `${value || "_"},${wardName || "_"},${districtName || "_"},${provinceName || "_"}`,
      };
    });
  };

  const handleCreateAddress = () => {
    const { email, fullName, phoneNumber, fullAddress } = addressForm;
    if ([email, fullName, phoneNumber, fullAddress].includes("")) {
      return toast.error("Vui lòng điền đầy đủ thông tin.");
    }
    if (!validateEmail(email)) {
      return toast.error("Email không đúng định dạng.");
    }
    if (!validatePhoneNumber(phoneNumber)) {
      return toast.error("Số điện thoại không đúng định dạng.");
    }
    const fullAddressValid = addressForm.fullAddress.split(", ").map((str) => str.trim());
    if (fullAddressValid.length < 4 || fullAddressValid.includes("")) {
      return toast.error("Vui lòng chọn địa chỉ cụ thể.");
    }
    if (/\d/.test(fullName)) {
      return toast.error("Tên khách hàng không hợp lệ.");
    }

    axiosCustomer
      .post<IAPIResponse>(apiRoutes.customers.me.createAddress, addressForm)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success("Thêm địa chỉ mới thành công.");
          navigate(clientRoutes.profile.root);
        }
      })
      .catch((error) => console.error(error));
  };
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
  if (isLoading) return <LoadingClient />;

  return (
    <section className={"flex w-full justify-center"}>
      <div className="mt-8 flex w-full max-w-7xl flex-col gap-4 max-lg:px-4">
        <ClientHeader title={"Thêm địa chỉ mới"} showBackButton={true} refBack={clientRoutes.profile.root} />
        <div className="flex flex-col gap-y-4 rounded-2xl border p-4 shadow-custom max-lg:px-2">
          <div className="flex gap-2 max-sm:flex-wrap">
            <Input
              onValueChange={(value) => setAddressForm((prev) => ({ ...prev, fullName: value }))}
              label="Tên người nhận"
              placeholder="Nhập tên người nhận"
              labelPlacement="outside"
              size="lg"
              variant="bordered"
            />
            <Input
              onValueChange={(value) => setAddressForm((prev) => ({ ...prev, email: value }))}
              type="email"
              label="Email"
              placeholder="Nhập email "
              labelPlacement="outside"
              size="lg"
              variant="bordered"
            />
            <Input
              onValueChange={(value) => setAddressForm((prev) => ({ ...prev, phoneNumber: value }))}
              label="Số điện thoại"
              placeholder="Nhập số điện thoại "
              labelPlacement="outside"
              size="lg"
              variant="bordered"
            />
          </div>
          <div>
            <Input
              type="email"
              label="Địa chỉ đầy đủ (điền bằng form bên dưới)"
              placeholder="_,_,_,_"
              labelPlacement="outside"
              size="lg"
              variant="bordered"
              value={addressForm.fullAddress}
              isReadOnly
            />
          </div>
          <Divider />
          <div className="flex flex-wrap gap-2">
            <Select
              label="Chọn tỉnh/Thành phố"
              labelPlacement="outside"
              placeholder="Chọn tỉnh/Thành phố"
              variant="bordered"
              size="lg"
              className="grow basis-72"
              onSelectionChange={(e) => handleProvinceChange(Array.from(e).join(""))}
            >
              {provinces.map((province) => (
                <SelectItem key={province.province_id}>{province.province_name}</SelectItem>
              ))}
            </Select>
            <Select
              label="Chọn Huyện"
              labelPlacement="outside"
              placeholder="Chọn Huyện"
              variant="bordered"
              size="lg"
              className="grow basis-72"
              onSelectionChange={(e) => handleDistrictChange(Array.from(e).join(""))}
            >
              {districts.map((district) => (
                <SelectItem key={district.district_id}>{district.district_name}</SelectItem>
              ))}
            </Select>
            <Select
              label="Chọn Xã"
              className="grow basis-72"
              labelPlacement="outside"
              placeholder="Chọn Xã"
              variant="bordered"
              size="lg"
              onSelectionChange={(e) => handleWardChange(Array.from(e).join(""))}
            >
              {wards.map((ward) => (
                <SelectItem key={ward.ward_id}>{ward.ward_name}</SelectItem>
              ))}
            </Select>
          </div>
          <div>
            <Input
              type="text"
              label="Địa chỉ cụ thể"
              placeholder="Nhập địa chỉ cụ thể."
              onValueChange={handleFullAddressChange}
              labelPlacement="outside"
              size="lg"
              variant="bordered"
            />
          </div>
          <Button
            color="primary"
            size={"lg"}
            startContent={iconConfig.add.base}
            onClick={handleCreateAddress}
          >
            Thêm địa chỉ mới
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AddAddress;
