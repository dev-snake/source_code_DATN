import AdminHeader from "@/components/admin/admin-header";
import WrapperContainer from "@/components/admin/wrapper-container";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useStaffAxios from "@/hooks/useStaffAxios";
import adminRoutes from "@/config/routes/admin-routes.config";
import { IAPIResponse } from "@/types/api-response";
import { IMaterialForm, IPackagingType, TMaterialType } from "@/types/material";
import useHandleTokenExpiration from "@/utils/token-expired";
import { Input, Button, Radio, RadioGroup } from "@nextui-org/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import iconConfig from "@/config/icons/icon-config";
const CreateMaterial = () => {
  const axiosStaff = useStaffAxios();
  const navigate = useNavigate();
  const handleTokenExpiration = useHandleTokenExpiration();

  const [materialForm, setMaterialForm] = useState<IMaterialForm>({
    materialName: "",
    materialType: "baking-ingredient",
    calUnit: "",
  });

  const handleCreateMaterial = () => {
    const { materialName, materialType, calUnit } = materialForm;
    if ([materialName, materialType, calUnit].includes("")) {
      return toast.error("Vui lòng điền đầy đủ thông tin");
    }
    axiosStaff
      .post<IAPIResponse<IMaterialForm>>(apiRoutes.materials.create, materialForm)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
          navigate(adminRoutes.materials.root);
        }
      })
      .catch((error: any) => {
        console.log(error);
        handleTokenExpiration(error);
      });
  };

  return (
    <WrapperContainer>
      <AdminHeader title="Thêm nguyên liệu mới" refBack={adminRoutes.materials.root} showBackButton={true} />
      <div className="flex flex-col gap-4">
        <div className={"flex w-1/2 min-w-[800px] flex-col gap-4"}>
          <div className={"flex h-max flex-col gap-4 rounded-xl border p-4 shadow-custom"}>
            <h5>Thông tin nguyên liệu</h5>
            <div className={"flex flex-col gap-4"}>
              <Input
                placeholder="Nhập tên nguyên liệu"
                size="lg"
                label={"Tên nguyên liệu"}
                labelPlacement={"outside"}
                variant="bordered"
                value={materialForm.materialName}
                onValueChange={(value) => setMaterialForm({ ...materialForm, materialName: value })}
              />
              <div className="flex items-center gap-4">
                <Input
                  label="Đơn vị tính"
                  labelPlacement={"outside"}
                  placeholder={"Nhập đơn vị tính"}
                  size="lg"
                  variant={"bordered"}
                  className={"w-full"}
                  onValueChange={(e) => setMaterialForm({ ...materialForm, calUnit: e })}
                />
                <RadioGroup
                  className={"w-full"}
                  label={"Loại nguyên liệu"}
                  onValueChange={(value) =>
                    setMaterialForm({ ...materialForm, materialType: value as TMaterialType })
                  }
                  orientation={"horizontal"}
                >
                  <Radio className="mr-2" value={"baking-ingredient"}>
                    Nguyên liệu làm bánh
                  </Radio>
                  <Radio value={"accessory"}>Phụ kiện</Radio>
                </RadioGroup>
              </div>
            </div>
          </div>
          <Button
            size="lg"
            color="primary"
            className="w-full"
            startContent={iconConfig.add.medium}
            onClick={handleCreateMaterial}
          >
            Tạo nguyên liệu
          </Button>
        </div>
      </div>
    </WrapperContainer>
  );
};

export default CreateMaterial;
