import WrapperContainer from "@/components/admin/wrapper-container";
import AdminHeader from "@/components/admin/admin-header";
import adminRoutes from "@/config/routes/admin-routes.config";
import useStaffAxios from "@/hooks/useStaffAxios";
import { apiRoutes } from "@/config/routes/api-routes.config";
import { useNavigate, useParams } from "react-router-dom";
import { IVoucher, TVoucherType } from "../../../../types/voucher";
import { useEffect, useState } from "react";
import iconConfig, { iconSize } from "@/config/icons/icon-config";
import {
  Button,
  Chip,
  Divider,
  Input,
  Radio,
  RadioGroup,
  RangeCalendar,
  ScrollShadow,
  Select,
  SelectItem,
  Snippet,
  Textarea,
  Tooltip,
} from "@nextui-org/react";
import clsx from "clsx";
import Loading from "@/components/admin/loading";

import { formatDate } from "@/utils/format-date";
import { GiClover } from "react-icons/gi";
import { ICustomer } from "@/types/customer";
import { copyToClipboard } from "@/utils/copy-to-clipboard";
import { toast } from "react-toastify";
import { MapVoucherTypeColor, MapVoucherTypeIcon } from "@/utils/map-data/vouchers";
import useRole from "@/hooks/useRole";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import { IAPIResponse } from "@/types/api-response";

const MapVoucherType: Record<string, string> = {
  shipFee: "Phí vận chuyển",
  percentage: "Phần trăm ",
  fixed: "Cố định",
};

type ReMapVoucherData = Exclude<IVoucher, "branchId" | "whiteListUsers"> & {
  branchId: {
    _id: string;
    branchConfig: {
      branchDisplayName: string;
    };
  };
  whiteListUsers: ICustomer[];
};

const VoucherDetails = () => {
  const { voucherId } = useParams();

  const currentStaffRole = useRole();
  const currentBranch = useCurrentBranch();
  const navigate = useNavigate();
  const staffAxios = useStaffAxios();

  const [voucherData, setVoucherData] = useState<ReMapVoucherData>();
  const getVoucherInfo = () => {
    if (!voucherId) return;

    staffAxios
      .get<IAPIResponse<ReMapVoucherData>>(apiRoutes.vouchers.getOne(voucherId))
      .then((response) => response.data)
      .then((response) => {
        if (
          response.results.branchId._id !== null &&
          currentStaffRole !== 2 &&
          response.results.branchId._id !== currentBranch
        ) {
          toast.error("Bạn không thể xem mã giảm giá không thuộc chi nhánh quản lí");
          return navigate(adminRoutes.voucher.root);
        }

        setVoucherData(response.results);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getVoucherInfo();
  }, []);

  if (!voucherData) return <Loading />;

  return (
    <WrapperContainer>
      <AdminHeader title="Thông tin mã giảm giá" showBackButton={true} refBack={adminRoutes.voucher.root} />
      <div className={"flex w-full gap-4"}>
        <div className="flex w-1/2 flex-col gap-4 rounded-2xl border p-4 shadow-custom">
          <h5>Thông tin mã giảm giá</h5>

          <div className={"flex flex-col gap-4"}>
            <div className={"flex flex-col gap-4 rounded-2xl p-4 shadow-custom"}>
              <div className={"flex items-center gap-2"}>
                <p className="min-w-max">Phạm vi áp dụng mã:</p>
                <Chip color={voucherData.branchId ? "secondary" : "primary"}>
                  {voucherData.branchId ? "Chi nhánh" : "Hệ thống"}
                </Chip>
              </div>
              <div
                className={clsx("flex items-center gap-1", {
                  hidden: voucherData.branchId === null,
                })}
              >
                <Input
                  label={"Chi nhánh áp dụng"}
                  labelPlacement={"outside"}
                  placeholder="Chọn chi nhánh áp dụng"
                  size={"lg"}
                  value={voucherData.branchId?.branchConfig.branchDisplayName}
                  isReadOnly={true}
                ></Input>
              </div>
              <div className="flex items-end gap-x-2">
                <div className={"flex w-full flex-col gap-2"}>
                  <p className={"min-w-max"}>Mã giảm giá</p>
                  <Tooltip showArrow={true} content="Nhấn để copy mã" color={"primary"} closeDelay={0}>
                    <Button
                      size={"lg"}
                      color={"primary"}
                      variant={"shadow"}
                      endContent={iconConfig.copy.base}
                      onClick={() => {
                        copyToClipboard(voucherData.voucherCode);
                        toast.success("Copy mã giảm giá thành công");
                      }}
                    >
                      {voucherData.voucherCode}
                    </Button>
                  </Tooltip>
                </div>
              </div>
              <div className={"flex flex-col gap-1"}>
                <p>Loại mã: </p>
                <div className={"flex items-center gap-2"}>
                  <Chip
                    color={MapVoucherTypeColor[voucherData.voucherConfig.type]}
                    startContent={MapVoucherTypeIcon[voucherData.voucherConfig.type]}
                    className={"px-2"}
                    variant={"flat"}
                    size={"lg"}
                  >
                    {MapVoucherType[voucherData.voucherConfig.type] || "Không xác định"}
                  </Chip>
                  {voucherData.voucherConfig.isWhiteList && (
                    <Chip
                      size={"lg"}
                      variant={"flat"}
                      color={"secondary"}
                      startContent={<GiClover size={iconSize.base} />}
                    >
                      Whitelist
                    </Chip>
                  )}
                </div>
              </div>
              <div className={"flex flex-col gap-1"}>
                <p>Mô tả: </p>
                <Textarea
                  className={"italic"}
                  value={voucherData.voucherDescription || "Không có mô tả"}
                  isReadOnly={true}
                ></Textarea>
              </div>
              <Divider />
              <div className={"flex w-full items-center gap-2"}>
                <Input
                  label={`Giá trị giảm`}
                  labelPlacement={"outside"}
                  size={"lg"}
                  placeholder={`Nhập giá trị giảm`}
                  isReadOnly={true}
                  value={`${voucherData.voucherConfig.discountValue.toLocaleString()} ${
                    voucherData.voucherConfig.type === "fixed" ? "VNĐ" : "%"
                  }`}
                />
                <Input
                  label={"Số lượt dùng tối đa"}
                  labelPlacement={"outside"}
                  placeholder={"Nhập số lượt dùng tối đa"}
                  size={"lg"}
                  value={
                    voucherData.voucherConfig.maxTotalUsage
                      ? `${voucherData.voucherConfig.maxTotalUsage?.toLocaleString()} lượt`
                      : "Không giới hạn lượt"
                  }
                  isReadOnly={true}
                />
                <Input
                  label={"Số lượt tối đa / khách"}
                  labelPlacement={"outside"}
                  size={"lg"}
                  placeholder={"Nhập số lượt tối đa / khách)"}
                  value={
                    voucherData.voucherConfig.maxUserUsage
                      ? `${voucherData.voucherConfig.maxUserUsage?.toLocaleString()} lượt`
                      : "Không giới hạn lượt"
                  }
                  isReadOnly={true}
                />
              </div>
              <div className={"flex items-center gap-2"}>
                <Input
                  label={"Giá trị đơn hàng tối thiểu"}
                  labelPlacement={"outside"}
                  placeholder={"Nhập giá trị đơn hàng tối thiểu"}
                  size={"lg"}
                  value={
                    voucherData.voucherConfig.minimumOrderValues
                      ? `${voucherData.voucherConfig.minimumOrderValues?.toString()} VNĐ`
                      : "Không yêu cầu"
                  }
                  isReadOnly={true}
                />
                <Input
                  label={"Số tiền giảm giá tối đa"}
                  labelPlacement={"outside"}
                  size={"lg"}
                  placeholder={"Nhập giá trị giảm giá tối đa"}
                  value={
                    voucherData.voucherConfig.maxValue
                      ? `${voucherData.voucherConfig.maxValue?.toLocaleString()} VNĐ`
                      : "Không giới hạn"
                  }
                  isReadOnly={true}
                />
              </div>
              <div className="flex items-center gap-2">
                <p>Hạn sử dụng từ </p>
                <div className={"flex items-center gap-2"}>
                  <Chip color={"success"} variant={"dot"} size={"lg"}>
                    {formatDate(voucherData.voucherConfig.validFrom, "onlyDate")}
                  </Chip>
                  <p>đến</p>
                  <Chip color={"danger"} variant={"dot"} size={"lg"}>
                    {formatDate(voucherData.voucherConfig.validTo, "onlyDate")}
                  </Chip>
                </div>
              </div>
            </div>
          </div>
        </div>

        {voucherData.voucherConfig.isWhiteList && (
          <div className="flex w-1/2 flex-col gap-4 rounded-2xl border p-4 shadow-custom">
            <h5>Danh sách {voucherData.whiteListUsers.length} khách hàng trong whitelists</h5>
            <div className={"flex h-full flex-col gap-2 rounded-2xl p-4 shadow-custom"}>
              <ScrollShadow className={"flex h-full max-h-full flex-wrap gap-2"}>
                {(voucherData.whiteListUsers as ICustomer[]).map((user) => (
                  <div className={"flex h-max w-max flex-col gap-1 rounded-2xl border-2 px-4 py-2"}>
                    <p>{user.userName}</p>
                    <small>{user.email}</small>
                  </div>
                ))}
              </ScrollShadow>
            </div>
          </div>
        )}
      </div>
    </WrapperContainer>
  );
};

export default VoucherDetails;
