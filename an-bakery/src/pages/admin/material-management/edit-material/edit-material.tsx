import AdminHeader from "@/components/admin/admin-header";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useStaffAxios from "@/hooks/useStaffAxios";
import adminRoutes from "@/config/routes/admin-routes.config";
import { IAPIResponse } from "@/types/api-response";
import { IMaterialForm, TMaterialType } from "@/types/material";
import useHandleTokenExpiration from "@/utils/token-expired";
import { Input, Button, Radio, RadioGroup } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import Loading from "@/components/admin/loading";
const EditMaterial = () => {
  const axiosStaff = useStaffAxios();
  const navigate = useNavigate();
  const { materialId } = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const handleTokenExpiration = useHandleTokenExpiration();
  const [materialEditForm, setMaterialEditForm] = useState<IMaterialForm>({
    calUnit: "",
    _id: "",
    creatorId: "",
    materialName: "",
    materialType: "baking-ingredient",
    createdAt: "",
  });
  useEffect(() => {
    axiosStaff
      .get<IAPIResponse<IMaterialForm[]>>(apiRoutes.materials.getAll)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          // setMaterialEditForm(response.results);
          const material = response.results.find((material) => material._id === materialId);
          if (material) {
            setMaterialEditForm(material);
          }
        }
      })
      .catch((error: any) => {
        console.log(error);
        handleTokenExpiration(error);
      })
      .finally(() => setIsLoading(false));
  }, []);
  const handleEditMaterial = () => {
    const { materialName, materialType, calUnit } = materialEditForm;
    if ([materialName, materialType, calUnit].includes("")) {
      return toast.error("Vui lòng điền đầy đủ thông tin");
    }
    axiosStaff
      .patch<IAPIResponse<IMaterialForm>>(apiRoutes.materials.edit(materialId as string), materialEditForm)
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
  if (isLoading) return <Loading />;
  console.log(materialEditForm);
  return (
    <WrapperContainer>
      <AdminHeader title="Chỉnh sửa nguyên liệu" refBack={adminRoutes.materials.root} showBackButton={true} />
      <div className="flex flex-col gap-4">
        <div className={"flex flex-col gap-4"}>
          <div className={"flex h-max flex-col gap-4 rounded-xl border p-4 shadow-custom"}>
            <h5>Thông tin nguyên liệu</h5>
            <div className={"flex flex-col gap-4"}>
              <Input
                label={"Tên nguyên liệu"}
                labelPlacement={"outside"}
                placeholder="Nhập tên nguyên liệu"
                size="lg"
                variant="bordered"
                value={materialEditForm.materialName}
                onValueChange={(value) => setMaterialEditForm({ ...materialEditForm, materialName: value })}
              />
              <div className="flex items-center gap-4">
                <Input
                  label="Đơn vị tính"
                  labelPlacement={"outside"}
                  variant={"bordered"}
                  size={"lg"}
                  className={"w-full"}
                  onValueChange={(e) => setMaterialEditForm({ ...materialEditForm, calUnit: e })}
                  value={materialEditForm.calUnit}
                />
                <RadioGroup
                  label={"Loại nguyên liệu"}
                  className={"w-full"}
                  value={materialEditForm.materialType}
                  onValueChange={(value) =>
                    setMaterialEditForm({ ...materialEditForm, materialType: value as TMaterialType })
                  }
                  orientation={"horizontal"}
                >
                  <Radio value={"baking-ingredient"}>Nguyên liệu làm bánh</Radio>
                  <Radio value={"accessory"}>Phụ kiện</Radio>
                </RadioGroup>
              </div>
            </div>
          </div>
          <Button
            size="lg"
            color="primary"
            className="w-full"
            startContent={iconConfig.edit.medium}
            onClick={handleEditMaterial}
          >
            Cập nhật
          </Button>
        </div>
      </div>
    </WrapperContainer>
  );
};

export default EditMaterial;
