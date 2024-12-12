import WrapperContainer from "@/components/admin/wrapper-container";
import AdminHeader from "@/components/admin/admin-header";
import {
  Input,
  Button,
  Select,
  SelectItem,
  Textarea,
  ButtonGroup,
  Radio,
  RadioGroup,
  Chip,
  Checkbox,
  Listbox,
  ListboxItem,
} from "@nextui-org/react";
import { RangeCalendar } from "@nextui-org/react";
import { today, getLocalTimeZone, DateValue, parseDate } from "@internationalized/date";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { useEffect, useState } from "react";
import { IVoucher, IVoucherForm, TVoucherType } from "@/types/voucher";
import useAxios from "@/hooks/useAxios";
import { IBranch } from "@/types/branch";
import { IAPIResponse } from "@/types/api-response";
import { apiRoutes } from "@/config/routes/api-routes.config";
import { toast } from "react-toastify";
import Loading from "@/components/admin/loading";
import useStaffAxios from "@/hooks/useStaffAxios";
import { useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import { formatDate } from "@/utils/format-date";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useRole from "@/hooks/useRole";
import { ICustomer } from "@/types/customer";

const EditVouchers = () => {
  const navigate = useNavigate();
  const { voucherId } = useParams<{ voucherId: string }>();

  const currentBranch = useCurrentBranch();
  const currentStaffRole = useRole();

  const [validTimeParsed, setValidTimeParsed] = useState({
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone()).add({ weeks: 2 }),
  });

  const [voucherInfo, setVoucherInfo] = useState<IVoucherForm>({
    voucherCode: "",
    voucherDescription: "",
    branchId: "",
    discountValue: 0,
    maxValue: null,
    maxTotalUsage: null,
    maxUserUsage: null,
    validFrom: "",
    validTo: "",
    minimumOrderValues: null,
    type: "fixed",
    isWhiteList: false,
    whiteListUsers: [],
  });

  const [listBranches, setListBranches] = useState<IBranch[]>([]);
  const [listCustomers, setListCustomers] = useState<ICustomer[]>([]);
  const [listAllCustomers, setListAllCustomers] = useState<ICustomer[]>([]);
  const [searchString, setSearchString] = useState<string>("");
  const staffAxios = useStaffAxios();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getVoucherData = (voucherId: string) => {
    staffAxios
      .get<IAPIResponse<IVoucher>>(apiRoutes.vouchers.getOne(voucherId))
      .then((response) => response.data)
      .then((response) => {
        setVoucherInfo({
          voucherCode: response.results.voucherCode,
          voucherDescription: response.results.voucherDescription,
          branchId: response.results.branchId?._id ?? null,
          discountValue: response.results.voucherConfig.discountValue,
          maxValue: response.results.voucherConfig.maxValue,
          maxTotalUsage: response.results.voucherConfig.maxTotalUsage,
          maxUserUsage: response.results.voucherConfig.maxUserUsage,
          validFrom: response.results.voucherConfig.validFrom,
          validTo: response.results.voucherConfig.validTo,
          minimumOrderValues: response.results.voucherConfig.minimumOrderValues,
          type: response.results.voucherConfig.type,
          isWhiteList: response.results.voucherConfig.isWhiteList,
          whiteListUsers: response.results.whiteListUsers,
        });

        setValidTimeParsed({
          start: parseDate(formatDate(response.results.voucherConfig.validFrom, "onlyDateReverse")),
          end: parseDate(formatDate(response.results.voucherConfig.validTo, "onlyDateReverse")),
        });
      });
  };

  const getListBranches = () => {
    staffAxios
      .get<IAPIResponse<IBranch[]>>(apiRoutes.branches.getAll)
      .then((response) => response.data)
      .then((response) => {
        setListBranches(response.results);
      });
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
    if (!voucherId) {
      return;
    }

    Promise.all([getListBranches(), getVoucherData(voucherId), getListCustomers()]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    setVoucherInfo({
      ...voucherInfo,
      validFrom: new Date(validTimeParsed.start.toString()).toISOString(),
      validTo: new Date(validTimeParsed.end.toString()).toISOString(),
    });
  }, [validTimeParsed]);

  const handleEditVoucher = (voucherId: string) => {
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
    } = voucherInfo;
    if (maxTotalUsage && maxUserUsage && maxTotalUsage < maxUserUsage) {
      toast.error("Số lần sử dụng tối đa của người dùng không thể lớn hơn số lần sử dụng tối đa của voucher");
      return;
    }

    staffAxios
      .patch<IAPIResponse<IVoucher>>(apiRoutes.vouchers.edit(voucherId), voucherInfo)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
          navigate(adminRoutes.voucher.root);
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  if (isLoading || !voucherInfo || !voucherId) return <Loading />;

  return (
    <WrapperContainer>
      <AdminHeader title="Cập nhật voucher" showBackButton={true} refBack={adminRoutes.voucher.root} />
      <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom">
        <h5>Thông tin mã giảm giá</h5>
        <div className="grid max-xl:gap-2 xl:grid-cols-2 xl:gap-4">
          <div className={"flex flex-col gap-4"}>
            <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom">
              <div className={"flex items-center gap-2"}>
                <p className="min-w-max">Phạm vi áp dụng mã:</p>
                <Chip color={voucherInfo.branchId ? "secondary" : "primary"}>
                  {voucherInfo.branchId ? "Chi nhánh" : "Hệ thống"}
                </Chip>
              </div>
              <div
                className={clsx("flex items-center gap-1", {
                  hidden: voucherInfo.branchId === null,
                })}
              >
                <Select
                  variant="bordered"
                  label={"Chi nhánh áp dụng"}
                  labelPlacement={"outside"}
                  placeholder="Chọn chi nhánh áp dụng"
                  size={"lg"}
                  selectedKeys={
                    currentStaffRole === 2
                      ? [voucherInfo.branchId !== null ? voucherInfo.branchId : ""]
                      : [currentBranch]
                  }
                  isDisabled={currentStaffRole !== 2}
                  disallowEmptySelection={true}
                  onSelectionChange={(e) =>
                    setVoucherInfo({ ...voucherInfo, branchId: Array.from(e).join("") })
                  }
                >
                  {listBranches.map((branch) => (
                    <SelectItem key={branch._id}>{branch.branchConfig.branchDisplayName}</SelectItem>
                  ))}
                </Select>
              </div>
              <div className="flex items-end gap-x-2">
                <div className={"flex w-full items-center gap-2"}>
                  <Input
                    label={"Mã giảm giá"}
                    labelPlacement={"outside"}
                    placeholder={"Nhập mã giảm giá"}
                    size={"lg"}
                    value={voucherInfo.voucherCode}
                    isReadOnly={true}
                  />
                </div>
              </div>
              <RadioGroup
                label={"Loại mã"}
                orientation={"horizontal"}
                value={voucherInfo.type}
                onValueChange={(value) =>
                  setVoucherInfo({
                    ...voucherInfo,
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
                value={voucherInfo.voucherDescription}
                placeholder="Nhập mô tả voucher"
                variant="bordered"
                size={"lg"}
                onValueChange={(value) => setVoucherInfo({ ...voucherInfo, voucherDescription: value })}
              />
            </div>
            <Button
              size={"lg"}
              color="primary"
              startContent={iconConfig.edit.medium}
              onClick={() => handleEditVoucher(voucherId)}
            >
              Cập nhật thông tin mới
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
                  type={"number"}
                  isRequired={true}
                  endContent={voucherInfo.type === "fixed" ? "VNĐ" : "%"}
                  value={voucherInfo.discountValue.toString()}
                  onValueChange={(value) =>
                    setVoucherInfo({
                      ...voucherInfo,
                      discountValue: +value,
                    })
                  }
                />
                <Input
                  label={"Số lượt dùng tối đa"}
                  labelPlacement={"outside"}
                  placeholder={"Nhập số lượt dùng tối đa"}
                  size={"lg"}
                  variant={"bordered"}
                  type={"number"}
                  endContent={"lượt"}
                  value={voucherInfo.maxTotalUsage?.toString() ?? ""}
                  onValueChange={(value) =>
                    setVoucherInfo({
                      ...voucherInfo,
                      maxTotalUsage: +value,
                    })
                  }
                />
                <Input
                  label={"Số lượt tối đa / khách"}
                  labelPlacement={"outside"}
                  size={"lg"}
                  variant={"bordered"}
                  placeholder={"Nhập số lượt tối đa / khách)"}
                  endContent={"lượt"}
                  value={voucherInfo.maxUserUsage?.toString() ?? ""}
                  onValueChange={(value) =>
                    setVoucherInfo({
                      ...voucherInfo,
                      maxUserUsage: +value,
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
                  value={voucherInfo.minimumOrderValues?.toString() ?? ""}
                  onValueChange={(value) =>
                    setVoucherInfo({
                      ...voucherInfo,
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
                  value={voucherInfo.maxValue?.toString() ?? ""}
                  onValueChange={(value) =>
                    setVoucherInfo({
                      ...voucherInfo,
                      maxValue: +value || null,
                    })
                  }
                />
              </div>
              <div className={"flex flex-col gap-2"}>
                <p>Hạn sử dụng mã</p>
                <RangeCalendar
                  value={validTimeParsed}
                  onChange={setValidTimeParsed}
                  visibleMonths={3}
                  color="secondary"
                />
              </div>
            </div>
            <div className={"flex flex-col gap-4 rounded-2xl p-4 shadow-custom"}>
              <Checkbox
                isSelected={voucherInfo.isWhiteList}
                onValueChange={(value) => setVoucherInfo({ ...voucherInfo, isWhiteList: value })}
              >
                Bật Whitelist
              </Checkbox>

              {voucherInfo.isWhiteList && (
                <div className={"flex gap-4"}>
                  <div className={"flex h-[430px] w-full flex-col gap-2"}>
                    <Input
                      aria-label={"search customer"}
                      placeholder={"Nhập email của khách hàng"}
                      onValueChange={setSearchString}
                      value={searchString}
                      isDisabled={!voucherInfo.isWhiteList}
                    />

                    <Listbox
                      aria-label={"select customer"}
                      emptyContent={
                        searchString === "" ? "Nhập email để tìm kiếm" : "Không tìm thấy khách hàng phù hợp"
                      }
                      selectionMode={"multiple"}
                      selectedKeys={voucherInfo.whiteListUsers}
                      variant={"bordered"}
                      onSelectionChange={(e) => {
                        setVoucherInfo({ ...voucherInfo, whiteListUsers: Array.from(e) as string[] });
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

export default EditVouchers;
