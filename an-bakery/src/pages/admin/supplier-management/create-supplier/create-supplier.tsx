import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse } from "@/types/api-response";
import { IBranch } from "@/types/branch";
import { IMaterial } from "@/types/material";
import { ISupplier, ISupplierForm } from "@/types/supplier";
import { Button, Divider, Input, Listbox, ListboxItem, Radio, RadioGroup } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SupplyItem from "../common/supply-item";

const CreateSupplier = () => {
  const navigate = useNavigate();
  const [supplierForm, setSupplierForm] = useState<ISupplierForm>({
    supplierName: "",
    supplierContact: {
      email: "",
      phone: "",
      address: "",
    },
    supplierContactPerson: {
      name: "",
      email: "",
      phone: "",
    },
    supplierPriority: 1,
    supplyItems: [],
    supplierDescription: "",
    branchId: [],
  });
  const [listBranches, setListBranches] = useState<IBranch[]>([]);
  const [listMaterials, setListMaterials] = useState<IMaterial[]>([]);
  const [listMaterialsCopy, setListMaterialsCopy] = useState<IMaterial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const staffAxios = useStaffAxios();

  useEffect(() => {
    Promise.all([
      staffAxios.get<IAPIResponse<IBranch[]>>(apiRoutes.branches.getAll),
      staffAxios.get<IAPIResponse<IMaterial[]>>(apiRoutes.materials.getAll + "?noPagination=true"),
    ])
      .then(([branches, materials]) => Promise.all([branches.data, materials.data]))
      .then(([branches, materials]) => {
        setListBranches(branches.results);
        setListMaterials(materials.results);
        setListMaterialsCopy(materials.results);
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreateSupplier = () => {
    const {
      supplyItems,
      supplierName,
      supplierContact: { email, phone, address },
      supplierDescription,
      branchId,
    } = supplierForm;
    if ([supplierName, email, phone, address, branchId].includes("")) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (supplyItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một nguyên vật liệu cung cấp");
      return;
    }

    staffAxios
      .post<IAPIResponse<ISupplier, { newSupplierId: string }>>(apiRoutes.suppliers.create, supplierForm)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success("Thêm nhà cung cấp thành công");
          if (response.metadata?.newSupplierId) {
            navigate(adminRoutes.supplier.details(response.metadata?.newSupplierId));
          } else {
            navigate(adminRoutes.supplier.root);
          }
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error("Thêm nhà cung cấp thất bại");
      });
  };

  useEffect(() => {
    console.log(supplierForm);
  }, [supplierForm]);

  if (isLoading) return <Loading />;

  return (
    <WrapperContainer>
      <AdminHeader title="Thêm nhà cung cấp mới" showBackButton={true} refBack={adminRoutes.supplier.root} />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {/* <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom"> */}
          <div className="flex flex-col gap-4 rounded-xl border p-4 shadow-custom">
            <span className={"w-max border-b-1 border-dark"}>
              <h5>Thông tin nhà cung cấp</h5>
            </span>
            <div className="flex flex-col gap-4">
              <Input
                label={"Tên nhà cung cấp"}
                labelPlacement={"outside"}
                placeholder={"Nhập tên nhà cung cấp"}
                isRequired={true}
                size="lg"
                variant="bordered"
                value={supplierForm.supplierName}
                onValueChange={(e) => setSupplierForm((prev) => ({ ...prev, supplierName: e }))}
              />
              <div className="flex items-center gap-2">
                <Input
                  label={"Email"}
                  labelPlacement={"outside"}
                  placeholder={"Nhập email nhà cung cấp"}
                  size="lg"
                  variant="bordered"
                  value={supplierForm.supplierContact.email}
                  onValueChange={(e) =>
                    setSupplierForm((prev) => ({
                      ...prev,
                      supplierContact: { ...prev.supplierContact, email: e },
                    }))
                  }
                />

                <Input
                  label={"Số điện thoại"}
                  labelPlacement={"outside"}
                  placeholder={"Nhập số điện thoại nhà cung cấp"}
                  size="lg"
                  variant="bordered"
                  value={supplierForm.supplierContact.phone}
                  onValueChange={(e) =>
                    setSupplierForm((prev) => ({
                      ...prev,
                      supplierContact: { ...prev.supplierContact, phone: e },
                    }))
                  }
                />
              </div>
              <Input
                label={"Địa chỉ nhà cung cấp"}
                labelPlacement={"outside"}
                placeholder={"Nhập địa chỉ nhà cung cấp"}
                size="lg"
                variant="bordered"
                value={supplierForm.supplierContact.address}
                onValueChange={(e) =>
                  setSupplierForm((prev) => ({
                    ...prev,
                    supplierContact: { ...prev.supplierContact, address: e },
                  }))
                }
              />
              <div className="flex items-center gap-2">
                <p className={"text-dark"}>Độ ưu tiên:</p>
                <RadioGroup
                  onValueChange={(e) => setSupplierForm((prev) => ({ ...prev, supplierPriority: +e }))}
                  orientation={"horizontal"}
                >
                  <Radio value={"1"}>Thấp</Radio>
                  <Radio value={"2"}>Trung bình</Radio>
                  <Radio value={"3"}>Cao</Radio>
                </RadioGroup>
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
                placeholder={"Nhập tên nhân viên"}
                size="lg"
                variant="bordered"
                value={supplierForm.supplierContactPerson.name}
                onValueChange={(e) =>
                  setSupplierForm((prev) => ({
                    ...prev,
                    supplierContactPerson: { ...prev.supplierContactPerson, name: e },
                  }))
                }
              />

              <Input
                label={"Email nhân viên"}
                labelPlacement={"outside"}
                placeholder={"Nhập email nhân viên"}
                size="lg"
                variant="bordered"
                value={supplierForm.supplierContactPerson.email}
                onValueChange={(e) =>
                  setSupplierForm((prev) => ({
                    ...prev,
                    supplierContactPerson: { ...prev.supplierContactPerson, email: e },
                  }))
                }
              />

              <Input
                label={"Số điện thoại liên hệ"}
                labelPlacement={"outside"}
                placeholder={"Nhập số điện thoại nhân viên"}
                size="lg"
                variant="bordered"
                value={supplierForm.supplierContactPerson.phone}
                onValueChange={(e) =>
                  setSupplierForm((prev) => ({
                    ...prev,
                    supplierContactPerson: { ...prev.supplierContactPerson, phone: e },
                  }))
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-xl border p-4 shadow-custom">
            <span className={"w-max border-b-1 border-dark"}>
              <h5>Chi nhánh nhận</h5>
            </span>
            <div className={"rounded-xl border border-dark/25"}>
              <Listbox
                aria-label={"Chọn chi nhánh"}
                selectionMode={"multiple"}
                selectedKeys={supplierForm.branchId}
                onSelectionChange={(e) =>
                  setSupplierForm((prev) => ({ ...prev, branchId: Array.from(e).map(String) }))
                }
              >
                {listBranches.map((branch) => (
                  <ListboxItem key={branch._id}>
                    <p>{branch.branchConfig.branchDisplayName}</p>
                  </ListboxItem>
                ))}
              </Listbox>
            </div>
          </div>
          {/* </div> */}
          <SupplyItem
            listMaterials={listMaterials}
            listMaterialsCopy={listMaterialsCopy}
            setListMaterials={setListMaterials}
            supplierForm={supplierForm}
            setSupplierForm={setSupplierForm}
          />
          <Button
            size="lg"
            variant="solid"
            className="w-full"
            color="primary"
            startContent={iconConfig.add.medium}
            onClick={handleCreateSupplier}
          >
            Thêm nhà cung cấp mới
          </Button>
        </div>
      </div>
    </WrapperContainer>
  );
};

export default CreateSupplier;
