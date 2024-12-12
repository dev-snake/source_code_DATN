import WrapperContainer from "@/components/admin/wrapper-container";
import AdminHeader from "@/components/admin/admin-header";
import {
  Input,
  Button,
  Select,
  SelectItem,
  Textarea,
  RadioGroup,
  Radio,
  ButtonGroup,
  Checkbox,
  ListboxItem,
  Listbox,
  Divider,
  ScrollShadow,
} from "@nextui-org/react";
import { RangeCalendar } from "@nextui-org/react";
import { today, getLocalTimeZone } from "@internationalized/date";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";

import { useEffect, useState } from "react";
import { IVoucherForm, TVoucherType } from "@/types/voucher";
import { IBranch } from "@/types/branch";
import { IAPIResponse } from "@/types/api-response";
import { apiRoutes } from "@/config/routes/api-routes.config";
import { toast } from "react-toastify";
import Loading from "@/components/admin/loading";
import useStaffAxios from "@/hooks/useStaffAxios";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useRole from "@/hooks/useRole";
import { ICustomer } from "@/types/customer";
const CreateVouchers = () => {
  const navigate = useNavigate();

  const [newVoucherData, setNewVoucherData] = useState<IVoucherForm>({
    branchId: "all",
    voucherCode: "",
    voucherDescription: "",
    discountValue: 0,
    maxValue: 0,
    validFrom: "",
    validTo: "",
    maxTotalUsage: null,
    maxUserUsage: null,
    minimumOrderValues: null,
    type: "shipFee",
    isWhiteList: false,
    whiteListUsers: [],
  });

  const [listBranches, setListBranches] = useState<IBranch[]>([]);
  const [listCustomers, setListCustomers] = useState<ICustomer[]>([]);
  const [listAllCustomers, setListAllCustomers] = useState<ICustomer[]>([]);

  const [searchString, setSearchString] = useState<string>("");

  const staffAxios = useStaffAxios();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const currentBranch = useCurrentBranch();
  const currentStaffRole = useRole();

  const getListBranches = () => {
    staffAxios
      .get<IAPIResponse<IBranch[]>>(apiRoutes.branches.getAll)
      .then((response) => response.data)
      .then((response) => setListBranches(response.results))
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  };

  const getListCustomers = () => {
    staffAxios
      .get(apiRoutes.customers.getAll, {
        params: {
          noPagination: true,
        },
      })
      .then((response) => response.data)
      .then((response) => {
        setListCustomers(response.results);
        setListAllCustomers(response.results);
      });
  };

  const handleSearchCustomer = () => {
    if (searchString === "") {
      setListCustomers(listAllCustomers);
      return;
    }
    const searchResult = listAllCustomers.filter((customer) =>
      customer.email.toLowerCase().includes(searchString.toLowerCase()),
    );
    setListCustomers(searchResult);
  };

  useEffect(() => {
    handleSearchCustomer();
  }, [searchString]);

  useEffect(() => {
    getListBranches();
    getListCustomers();
    if (currentBranch) {
      setNewVoucherData({ ...newVoucherData, branchId: currentBranch });
    }
  }, []);

  useEffect(() => {
    console.log(newVoucherData);
  }, [newVoucherData]);

  const handleCreateVoucher = () => {
    const {
      voucherCode,
      voucherDescription,
      branchId,
      discountValue,
      maxValue,
      maxTotalUsage,
      maxUserUsage,
      validFrom,
      validTo,
      minimumOrderValues,
      type,
      isWhiteList,
      whiteListUsers,
    } = newVoucherData;

    if ([voucherCode, discountValue, validFrom, validTo].includes("")) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (maxTotalUsage && maxUserUsage && maxTotalUsage < maxUserUsage) {
      toast.error("Số lần sử dụng tối đa của người dùng không thể lớn hơn số lần sử dụng tối đa của voucher");
      return;
    }
    const newVoucher = {
      voucherCode,
      voucherDescription,
      branchId,
      discountValue,
      maxValue,
      maxTotalUsage: maxTotalUsage === 0 ? null : maxTotalUsage,
      maxUserUsage: maxUserUsage === 0 ? null : maxUserUsage,
      validFrom,
      validTo,
      minimumOrderValues: minimumOrderValues === 0 ? null : minimumOrderValues,
      type,
      isWhiteList,
      whiteListUsers,
    };

    staffAxios
      .post(apiRoutes.vouchers.create, newVoucher)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
          navigate(adminRoutes.voucher.root);
        }
      })
      .catch((error) => {
        const { data } = error.response;
        toast.error(data.message);
      });
  };
  const handleRandomVoucherCode = () => {
    function randomString() {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const minLength = 10;
      const maxLength = 12;
      const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
      let randomString = "";

      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters[randomIndex];
      }

      return randomString;
    }

    setNewVoucherData({ ...newVoucherData, voucherCode: randomString() });
  };
  if (isLoading) return <Loading />;

  return (
    <WrapperContainer>
      <AdminHeader title="Thêm voucher mới" showBackButton={true} refBack={adminRoutes.voucher.root} />
      <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom">
        <h5>Thông tin mã giảm giá mới</h5>
        <div className="grid max-xl:gap-y-2 xl:grid-cols-2 xl:gap-4">
          <div className={"flex flex-col gap-4"}>
            <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom">
              <div className={"flex items-center gap-2"}>
                <p className="min-w-max">Áp dụng mã cho: </p>
                {!currentBranch || currentStaffRole === 2 ? (
                  <ButtonGroup className={"flex w-full justify-start"}>
                    <Button
                      color={newVoucherData.branchId === "all" ? "primary" : "default"}
                      onClick={() => setNewVoucherData({ ...newVoucherData, branchId: "all" })}
                    >
                      Hệ thống
                    </Button>
                    <Button
                      color={newVoucherData.branchId !== "all" ? "primary" : "default"}
                      onClick={() => setNewVoucherData({ ...newVoucherData, branchId: listBranches[0]._id })}
                    >
                      Chi nhánh
                    </Button>
                  </ButtonGroup>
                ) : (
                  <Button
                    color={newVoucherData.branchId !== "all" ? "primary" : "default"}
                    onClick={() => setNewVoucherData({ ...newVoucherData, branchId: listBranches[0]._id })}
                  >
                    Chi nhánh
                  </Button>
                )}
              </div>
              <div
                className={clsx("flex items-center gap-1", {
                  hidden: newVoucherData.branchId === "all",
                })}
              >
                <Select
                  variant="bordered"
                  label={"Chi nhánh áp dụng"}
                  labelPlacement={"outside"}
                  placeholder="Chọn chi nhánh áp dụng"
                  size={"lg"}
                  selectedKeys={[
                    newVoucherData.branchId
                      ? newVoucherData.branchId !== "all"
                        ? newVoucherData.branchId
                        : ""
                      : "all",
                  ]}
                  isDisabled={currentStaffRole !== 2 && currentBranch}
                  onSelectionChange={(e) =>
                    setNewVoucherData({
                      ...newVoucherData,
                      branchId: Array.from(e).join("") ? Array.from(e).join("") : "all",
                    })
                  }
                >
                  {listBranches.map((branch) => (
                    <SelectItem key={branch._id}>{branch.branchConfig.branchDisplayName}</SelectItem>
                  ))}
                </Select>
              </div>
              <div className="flex items-end gap-x-2">
                <Input
                  label={"Mã giảm giá"}
                  labelPlacement={"outside"}
                  placeholder={"Nhập mã giảm giá"}
                  size={"lg"}
                  variant="bordered"
                  isRequired
                  value={newVoucherData.voucherCode}
                  onValueChange={(value) => setNewVoucherData({ ...newVoucherData, voucherCode: value })}
                />
                <Button size={"lg"} isIconOnly color="secondary" onClick={handleRandomVoucherCode}>
                  {iconConfig.random.medium}
                </Button>
              </div>
              <RadioGroup
                label={"Loại mã"}
                orientation={"horizontal"}
                value={newVoucherData.type}
                onValueChange={(value) =>
                  setNewVoucherData({
                    ...newVoucherData,
                    type: value as TVoucherType,
                  })
                }
              >
                <Radio value={"shipFee"}>Phí vận chuyển</Radio>
                <Radio value={"percentage"}>Phần trăm (%)</Radio>
                <Radio value={"fixed"}>Cố định</Radio>
              </RadioGroup>
              <Textarea
                label={"Mô tả"}
                labelPlacement={"outside"}
                placeholder="Nhập mô tả voucher"
                variant="bordered"
                size={"lg"}
                onValueChange={(value) => setNewVoucherData({ ...newVoucherData, voucherDescription: value })}
              />
            </div>
            <Button
              size={"lg"}
              color="primary"
              startContent={iconConfig.add.medium}
              onClick={handleCreateVoucher}
            >
              Tạo mã giảm giá
            </Button>
          </div>
          <div className={"flex w-full flex-col gap-4"}>
            <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom">
              <div className={"flex w-full items-center gap-2"}>
                <Input
                  label={`Giá trị giảm`}
                  labelPlacement={"outside"}
                  size={"lg"}
                  placeholder={`Nhập giá trị giảm`}
                  variant={"bordered"}
                  min={0}
                  type={"number"}
                  isRequired={true}
                  endContent={newVoucherData.type === "fixed" ? "VNĐ" : "%"}
                  onValueChange={(value) =>
                    setNewVoucherData({
                      ...newVoucherData,
                      discountValue: +value,
                    })
                  }
                />
                <Input
                  label={"Số lượt dùng tối đa"}
                  labelPlacement={"outside"}
                  placeholder={"Nhập số lượt "}
                  size={"lg"}
                  variant={"bordered"}
                  type={"number"}
                  endContent={"lượt"}
                  value={newVoucherData.maxTotalUsage?.toString() ?? ""}
                  onValueChange={(value) =>
                    setNewVoucherData({
                      ...newVoucherData,
                      maxTotalUsage: value === "0" ? null : +value,
                    })
                  }
                />
                <Input
                  label={"Số lượt tối đa / khách"}
                  labelPlacement={"outside"}
                  size={"lg"}
                  variant={"bordered"}
                  placeholder={"Nhập số lượt"}
                  type={"number"}
                  endContent={"lượt"}
                  value={newVoucherData.maxUserUsage?.toString() ?? ""}
                  onValueChange={(value) =>
                    setNewVoucherData({
                      ...newVoucherData,
                      maxUserUsage: value === "0" ? null : +value,
                    })
                  }
                />
              </div>
              <div className={"flex items-center gap-2"}>
                <Input
                  label={"Giá trị đơn hàng tối thiểu"}
                  labelPlacement={"outside"}
                  variant={"bordered"}
                  placeholder={"Nhập giá trị đơn hàng tối thiểu"}
                  size={"lg"}
                  endContent={"VNĐ"}
                  value={newVoucherData.minimumOrderValues?.toString() ?? ""}
                  onValueChange={(value) =>
                    setNewVoucherData({
                      ...newVoucherData,
                      minimumOrderValues: +value || null,
                    })
                  }
                />
                <Input
                  label={"Số tiền giảm giá tối đa"}
                  labelPlacement={"outside"}
                  variant={"bordered"}
                  size={"lg"}
                  placeholder={"Nhập giá trị giảm giá tối đa"}
                  endContent={"VNĐ"}
                  value={newVoucherData.maxValue?.toString() ?? ""}
                  onValueChange={(value) =>
                    setNewVoucherData({
                      ...newVoucherData,
                      maxValue: +value || null,
                    })
                  }
                />
              </div>
              <div className={"flex flex-col gap-2"}>
                <p>Hạn sử dụng mã</p>
                <RangeCalendar
                  onChange={(e) =>
                    setNewVoucherData({
                      ...newVoucherData,
                      validFrom: e.start.toString(),
                      validTo: e.end.toString(),
                    })
                  }
                  visibleMonths={3}
                  color="secondary"
                />
              </div>
            </div>
            <div className={"flex flex-col gap-4 rounded-2xl p-4 shadow-custom"}>
              <Checkbox
                isSelected={newVoucherData.isWhiteList}
                onValueChange={(value) => setNewVoucherData({ ...newVoucherData, isWhiteList: value })}
              >
                Bật Whitelist
              </Checkbox>

              {newVoucherData.isWhiteList && (
                <div className={"flex gap-4"}>
                  <div className={"flex h-[430px] w-full flex-col gap-2 overflow-hidden"}>
                    <Input
                      aria-label={"search customer"}
                      placeholder={"Nhập email của khách hàng"}
                      onValueChange={setSearchString}
                      value={searchString}
                      isDisabled={!newVoucherData.isWhiteList}
                    />

                    <Listbox
                      aria-label={"select customer"}
                      emptyContent={
                        searchString === "" ? "Nhập email để tìm kiếm" : "Không tìm thấy khách hàng phù hợp"
                      }
                      selectionMode={"multiple"}
                      selectedKeys={newVoucherData.whiteListUsers}
                      variant={"bordered"}
                      onSelectionChange={(e) => {
                        setNewVoucherData({ ...newVoucherData, whiteListUsers: Array.from(e) as string[] });
                        setSearchString("");
                      }}
                      classNames={{
                        list: "max-h-[400px] overflow-y-auto",
                      }}
                    >
                      {listCustomers.map((customer) => (
                        <ListboxItem key={customer._id}>
                          <div className={"flex w-full flex-col gap-1"}>
                            <p>{customer.userName}</p>
                            <small>{customer.email}</small>
                          </div>
                        </ListboxItem>
                      ))}
                    </Listbox>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid gap-4 xl:flex"></div>
      </div>
    </WrapperContainer>
  );
};

export default CreateVouchers;
