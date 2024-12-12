import { Divider, Radio, RadioGroup } from "@nextui-org/react";
import { useEffect, useState } from "react";

import useAxios from "@/hooks/useAxios";
import { apiRoutes } from "@/config/routes/api-routes.config";
import { IVoucher } from "@/types/voucher";
import { IAPIResponse } from "@/types/api-response";
import VoucherCard from "./voucher-card";
import { IBranch } from "@/types/branch";

interface VouchersProps {}

const Vouchers = (props: VouchersProps) => {
  const axiosClient = useAxios();

  const [listVouchers, setListVouchers] = useState<IVoucher[]>([]);
  const [selectedFilterVoucherType, setSelectedFilterVoucherType] = useState<string>("all");
  const [selectedFilterBranch, setSelectedFilterBranch] = useState<string>("all");
  const [listBranches, setListBranches] = useState<IBranch[]>([]);
  const getListVoucher = () => {
    const currentDay = new Date();
    currentDay.setHours(0, 0, 0, 0);

    axiosClient
      .get<IAPIResponse<IVoucher[]>>(apiRoutes.vouchers.getAll, {
        params: {
          "voucherConfig.validTo[gte]": currentDay.toISOString(),
          "voucherConfig.type": selectedFilterVoucherType === "all" ? undefined : selectedFilterVoucherType,
          branchId: selectedFilterBranch === "all" ? undefined : selectedFilterBranch,
        },
      })
      .then((response) => response.data)
      .then((response) => {
        setListVouchers(response.results);
      });
  };

  const getListBranches = () => {
    axiosClient
      .get<IAPIResponse<IBranch[]>>(apiRoutes.branches.getAll, {
        params: {
          isActive: true,
          noPagination: true,
        },
      })
      .then((response) => response.data)
      .then((response) => {
        setListBranches(response.results);
      });
  };

  useEffect(() => {
    Promise.all([getListBranches(), getListVoucher()]);
  }, [selectedFilterVoucherType, selectedFilterBranch]);

  return (
    <div className={"flex justify-center"}>
      <div className={"mt-8 flex w-full max-w-7xl flex-col items-center gap-8 max-xl:px-4"}>
        <header>
          <h1 className={"title uppercase text-dark/25 max-xl:text-7xl"}>Danh sách mã giảm giá </h1>
        </header>
        <main className={"grid w-full grid-cols-4 gap-4"}>
          <div className={"col-span-1 flex flex-col gap-4 rounded-2xl border p-4 shadow-custom"}>
            <h4>Bộ lọc</h4>
            <Divider />
            <RadioGroup
              label={"Chọn loại mã giảm giá"}
              onValueChange={setSelectedFilterVoucherType}
              value={selectedFilterVoucherType}
            >
              <Radio value={"all"}>Tất cả</Radio>
              <Radio value={"fixed"}>Giảm Cố định</Radio>
              <Radio value={"percentage"}>Giảm Phần trăm</Radio>
              <Radio value={"shipFee"}>Vận chuyển</Radio>
            </RadioGroup>
            <Divider />
            <RadioGroup
              label={"Chọn chi nhánh"}
              onValueChange={setSelectedFilterBranch}
              value={selectedFilterBranch}
            >
              <Radio value={"all"}>Tất cả</Radio>
              <Radio value={"null"}>Hệ thống</Radio>
              {listBranches.map((branch) => (
                <Radio value={branch._id}>{branch.branchConfig.branchDisplayName}</Radio>
              ))}
            </RadioGroup>
          </div>
          <div className="col-span-3 flex flex-col gap-4 rounded-2xl border p-4 shadow-custom">
            <div className={"flex flex-col gap-4"}>
              <h4>
                Có <span className={"font-semibold text-primary"}>{listVouchers.length}</span> mã phù hợp
              </h4>
              <div className={"grid grid-cols-2 gap-4 max-xl:grid-cols-1"}>
                {listVouchers.map((voucherData) => (
                  <VoucherCard key={voucherData._id} voucherData={voucherData} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Vouchers;
