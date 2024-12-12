import textSizes from "@/config/styles/text-size";
import { ISupplier } from "@/types/supplier";
import { Chip, Divider } from "@nextui-org/react";

interface SupplierInforProps {
  supplierData: ISupplier;
}

const SupplierInfor = ({ supplierData }: SupplierInforProps) => (
  <div className="flex w-full flex-col gap-4 rounded-2xl border p-4">
    <h5>Thông tin nhà cung cấp</h5>
    <div className={"w-ful flex justify-between gap-4"}>
      <div className="col-span-1 flex w-full flex-col gap-2">
        <div className={"flex items-center justify-between"}>
          <p className={"text-dark/50"}>Tên công ty</p>
          <p className={"font-bold text-primary"}>{supplierData.supplierName}</p>
        </div>
        <div className={"flex items-center justify-between"}>
          <p className={"text-dark/50"}>Email</p>
          <p className={"font-bold text-primary"}>{supplierData.supplierContact.email}</p>
        </div>
        <div className={"flex items-center justify-between"}>
          <p className={"text-dark/50"}>Số điện thoại</p>
          <p className={"font-bold text-primary"}>{supplierData.supplierContact.phone}</p>
        </div>
        <div className={"flex items-center justify-between"}>
          <p className={"text-dark/50"}>Địa chỉ</p>
          <p className={"font-bold text-primary"}>{supplierData.supplierContact.address}</p>
        </div>
      </div>
      <div>
        <Divider orientation={"vertical"}></Divider>
      </div>
      <div className="col-span-1 flex w-full flex-col gap-2">
        <div className={"flex items-center justify-between"}>
          <p className={"text-dark/50"}>Tên nhân viên tư vấn</p>
          <p className={"font-bold text-primary"}>{supplierData.supplierContactPerson.name}</p>
        </div>
        <div className={"flex items-center justify-between"}>
          <p className={"text-dark/50"}>Email nhân viên</p>
          <p className={"font-bold text-primary"}>{supplierData.supplierContactPerson.email}</p>
        </div>
        <div className={"flex items-center justify-between"}>
          <p className={"text-dark/50"}>Số điện thoại</p>
          <p className={"font-bold text-primary"}>{supplierData.supplierContactPerson.phone}</p>
        </div>
      </div>
    </div>
  </div>
);

export default SupplierInfor;
