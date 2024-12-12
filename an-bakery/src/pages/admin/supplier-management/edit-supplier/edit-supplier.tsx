import WrapperContainer from "@/components/admin/wrapper-container";
import AdminHeader from "@/components/admin/admin-header";
import {
  Input,
  Textarea,
  Select,
  SelectItem,
  Button,
  RadioGroup,
  Radio,
  Divider,
  Listbox,
  ListboxItem,
  Accordion,
  AccordionItem,
} from "@nextui-org/react";

import iconConfig from "@/config/icons/icon-config";
import { IBranch } from "@/types/branch";
import { useEffect, useState } from "react";
import { apiRoutes } from "@/config/routes/api-routes.config";
import { IAPIResponse } from "@/types/api-response";
import LoadingClient from "@/components/common/loading-client";
import { IMaterial } from "@/types/material";
import { ISupplier, ISupplierForm } from "@/types/supplier";
import SupplyItem from "../common/supply-item";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import adminRoutes from "@/config/routes/admin-routes.config";
import useStaffAxios from "@/hooks/useStaffAxios";
const EditSupplier = () => {
  const navigate = useNavigate();
  const { supplierId } = useParams();

  const [supplierUpdateForm, setSupplierForm] = useState<ISupplierForm>({
    supplierName: "",
    supplierContact: {
      email: "",
      phone: "",
      address: "",
    },
    supplierContactPerson: {
      email: "",
      name: "",
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

  const getListBranches = () => {
    staffAxios
      .get<IAPIResponse<IBranch[]>>(`${apiRoutes.branches.getAll}?noPagination=true`)
      .then((response) => response.data)
      .then((response) => {
        setListBranches(response.results);
      });
  };

  const getListMaterials = () => {
    staffAxios
      .get<IAPIResponse<IMaterial[]>>(apiRoutes.materials.getAll + "?noPagination=true")
      .then((response) => response.data)
      .then((response) => {
        setListMaterials(response.results);
        setListMaterialsCopy(response.results);
      });
  };

  const getSupplierInfo = (supplierId: string) => {
    staffAxios
      .get<IAPIResponse<ISupplier>>(apiRoutes.suppliers.getOne(supplierId))
      .then((response) => response.data)
      .then((response) => {
        setSupplierForm({
          supplierName: response.results.supplierName,
          supplierContact: response.results.supplierContact,
          supplierContactPerson: response.results.supplierContactPerson,
          supplierPriority: response.results.supplierPriority,
          supplyItems: response.results.supplyItems.map((item) => ({
            ...item,
            materialId: item.materialId._id,
          })),
          supplierDescription: response.results.supplierDescription,
          branchId: response.results.branchId,
        });
      });
  };

  useEffect(() => {
    if (!supplierId) {
      return;
    }

    Promise.all([getListBranches(), getListMaterials(), getSupplierInfo(supplierId)])
      .then(() => setIsLoading(false))
      .catch((error) => console.log(error));
  }, []);

  const handleEditSupplier = () => {
    const {
      supplyItems,
      supplierName,
      supplierContact: { email, phone, address },
      branchId,
    } = supplierUpdateForm;

    if ([supplierName, email, phone, address, branchId].includes("")) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (supplyItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một nguyên vật liệu cung cấp");
      return;
    }

    staffAxios
      .patch<IAPIResponse<ISupplier>>(apiRoutes.suppliers.edit(supplierId as string), supplierUpdateForm)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success("Cập nhật nhà cung cấp thành công");
          navigate(adminRoutes.supplier.root);
        }
      })
      .catch((error) => console.log(error));
  };

  if (isLoading) return <LoadingClient />;

  return (
    <WrapperContainer>
      <AdminHeader title="Cập nhật nhà cung cấp" showBackButton={true} refBack={adminRoutes.supplier.root} />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <Accordion variant={"splitted"} defaultSelectedKeys={["info"]}>
            <AccordionItem
              key={"info"}
              title={<h5>Chỉnh sửa thông tin nhà cung cấp</h5>}
              className={"font-bold"}
            >
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
                      variant="bordered"
                      value={supplierUpdateForm.supplierName}
                      onValueChange={(e) => setSupplierForm((prev) => ({ ...prev, supplierName: e }))}
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        label={"Email"}
                        labelPlacement={"outside"}
                        size="lg"
                        variant="bordered"
                        value={supplierUpdateForm.supplierContact.email}
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
                        size="lg"
                        variant="bordered"
                        value={supplierUpdateForm.supplierContact.phone}
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
                      size="lg"
                      variant="bordered"
                      value={supplierUpdateForm.supplierContact.address}
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
                        value={supplierUpdateForm.supplierPriority.toString()}
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
                      size="lg"
                      variant="bordered"
                      value={supplierUpdateForm.supplierContactPerson.name}
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
                      size="lg"
                      variant="bordered"
                      value={supplierUpdateForm.supplierContactPerson.email}
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
                      size="lg"
                      variant="bordered"
                      value={supplierUpdateForm.supplierContactPerson.phone}
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
                      selectedKeys={supplierUpdateForm.branchId}
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
              </div>
            </AccordionItem>
            <AccordionItem
              key="supply-items"
              title={<h5>Chỉnh sửa mặt hàng cung cấp</h5>}
              className={"font-bold"}
            >
              <SupplyItem
                listMaterials={listMaterials}
                listMaterialsCopy={listMaterialsCopy}
                setListMaterials={setListMaterials}
                supplierForm={supplierUpdateForm}
                setSupplierForm={setSupplierForm}
              />
            </AccordionItem>
          </Accordion>

          <Button
            size="lg"
            variant="solid"
            className="w-full"
            color="primary"
            startContent={iconConfig.edit.medium}
            onClick={handleEditSupplier}
          >
            Cập nhật thông tin nhà cung cấp
          </Button>
        </div>
      </div>
    </WrapperContainer>
  );
};

export default EditSupplier;
