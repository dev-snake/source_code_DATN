import WrapperContainer from "@/components/admin/wrapper-container";

import AdminHeader from "@/components/admin/admin-header";
import SupplierInfor from "./supplier-infor";
import useStaffAxios from "@/hooks/useStaffAxios";
import { useEffect, useState } from "react";
import { ISupplier, ReMapSupplyItem } from "@/types/supplier";
import { useParams } from "react-router-dom";
import { apiRoutes } from "@/config/routes/api-routes.config";
import Loading from "@/components/admin/loading";
import SupplyItemsList from "./supply-items-list/supplier-item-list";
import { Chip, Input, Listbox, ListboxItem, Radio, RadioGroup } from "@nextui-org/react";
import { IBranch } from "@/types/branch";
import { MapSupplierPriorityColor, MapSupplierPriorityText } from "@/utils/map-data/suppliers";

interface SupplierDetailsProps {
  refBack: string;
}

const SupplierDetails = ({ refBack }: SupplierDetailsProps) => {
  const { supplierId } = useParams<{ supplierId: string }>();

  const staffAxios = useStaffAxios();

  const [supplierData, setSupplierData] = useState<ISupplier>();

  const [listBranches, setListBranches] = useState<IBranch[]>([]);

  const getSupplierData = (supplierId: string) => {
    staffAxios
      .get(apiRoutes.suppliers.getOne(supplierId))
      .then((response) => response.data)
      .then((response) => {
        setSupplierData(response.results);
      });
  };

  const getListBranches = () => {
    staffAxios
      .get(apiRoutes.branches.getAll, {
        params: {
          noPagination: true,
        },
      })
      .then((response) => response.data)
      .then((response) => {
        setListBranches(response.results);
      });
  };

  useEffect(() => {
    if (supplierId) {
      getSupplierData(supplierId);
      getListBranches();
    }
  }, []);

  if (!supplierData) {
    return <Loading></Loading>;
  }

  return (
    <WrapperContainer>
      <AdminHeader title="CHI TIẾT  NHÀ CUNG CẤP" refBack={refBack} showBackButton={true} />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-xl border p-4 shadow-custom">
          <span className={"w-max border-b-1 border-dark"}>
            <h5>Thông tin cơ bản</h5>
          </span>
          <div className="flex flex-col gap-4">
            <Input
              label={"Tên nhà cung cấp"}
              labelPlacement={"outside"}
              size="lg"
              isReadOnly={true}
              value={supplierData.supplierName}
            />
            <div className="flex items-center gap-2">
              <Input
                label={"Email"}
                labelPlacement={"outside"}
                size="lg"
                isReadOnly={true}
                value={supplierData.supplierContact.email}
              />
              <Input
                label={"Số điện thoại"}
                labelPlacement={"outside"}
                size="lg"
                isReadOnly={true}
                value={supplierData.supplierContact.phone}
              />
            </div>
            <Input
              label={"Địa chỉ nhà cung cấp"}
              labelPlacement={"outside"}
              size="lg"
              isReadOnly={true}
              value={supplierData.supplierContact.address}
            />
            <div className="flex items-center gap-2">
              <p className={"text-dark"}>Mức độ ưu tiên:</p>
              <Chip color={MapSupplierPriorityColor[supplierData.supplierPriority]} size={"lg"}>
                {MapSupplierPriorityText[supplierData.supplierPriority]}
              </Chip>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-xl border p-4 shadow-custom">
          <span className={"w-max border-b-1 border-dark"}>
            <h5>Thông tin nhân viên tư vấn</h5>
          </span>
          <div className="flex w-full gap-2">
            <Input
              label={"Tên nhân viên"}
              labelPlacement={"outside"}
              size="lg"
              isReadOnly={true}
              value={supplierData.supplierContactPerson.name}
            />
            <Input
              label={"Email nhân viên"}
              labelPlacement={"outside"}
              size="lg"
              isReadOnly={true}
              value={supplierData.supplierContactPerson.email}
            />
            <Input
              label={"Số điện thoại liên hệ"}
              labelPlacement={"outside"}
              size="lg"
              isReadOnly={true}
              value={supplierData.supplierContactPerson.phone}
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-xl border p-4 shadow-custom">
          <span className={"w-max border-b-1 border-dark"}>
            <h5>Chi nhánh cung cấp</h5>
          </span>
          <div className={"flex flex-col gap-2"}>
            {listBranches
              .filter((branch) => supplierData.branchId.includes(branch._id))
              .map((branch, index) => (
                <p className={"italic"}>
                  {index + 1}. {branch.branchConfig.branchDisplayName}
                </p>
              ))}
          </div>
        </div>
        <SupplyItemsList supplyItems={supplierData.supplyItems as ReMapSupplyItem[]} />
      </div>
    </WrapperContainer>
  );
};

export default SupplierDetails;
