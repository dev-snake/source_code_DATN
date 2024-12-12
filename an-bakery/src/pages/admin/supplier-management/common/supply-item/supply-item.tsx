import iconConfig from "@/config/icons/icon-config";
import textSizes from "@/config/styles/text-size";
import { Input, Button, Chip, ScrollShadow } from "@nextui-org/react";
import { ISupplierForm, ISupplyItem } from "@/types/supplier";
import { IMaterial } from "@/types/material";
import { MapMaterialTypeColor, MapMaterialTypeText } from "@/utils/map-data/materials";

interface SupplyItemProps {
  supplierForm: ISupplierForm;
  setSupplierForm: React.Dispatch<React.SetStateAction<ISupplierForm>>;
  listMaterialsCopy: IMaterial[];
  listMaterials: IMaterial[];
  setListMaterials: React.Dispatch<React.SetStateAction<IMaterial[]>>;
}

const SupplyItem = ({
  listMaterialsCopy,
  listMaterials,
  supplierForm,
  setSupplierForm,
  setListMaterials,
}: SupplyItemProps) => {
  const handleSearchMaterial = (value: string) => {
    if (value === "") {
      setListMaterials(listMaterialsCopy);
    } else {
      const filteredMaterials = listMaterialsCopy.filter((material) =>
        material.materialName.toLowerCase().includes(value.toLowerCase()),
      );
      setListMaterials(filteredMaterials);
    }
  };

  const checkMaterialExist = (materialId: string) => {
    const material = supplierForm.supplyItems.find((item) => item.materialId === materialId);
    return material ? true : false;
  };

  const getMaterialAttribute = (materialId: string, attributeName: "materialName" | "calUnit") => {
    const material = listMaterialsCopy.find((material) => material._id === materialId);
    return material?.[attributeName] ?? "";
  };

  const handleAddSupplyItem = (materialId: string) => {
    const newSupplyItem: ISupplyItem = {
      materialId,
      materialSpecs: {
        baseUnit: "",
        pricePerUnit: 0,
        packsPerUnit: 0,
        quantityPerPack: 0,
      },
    };
    const findMaterial = supplierForm.supplyItems.find((item) => item.materialId === materialId);

    if (findMaterial) return;

    setSupplierForm((prev) => ({ ...prev, supplyItems: [...prev.supplyItems, newSupplyItem] }));
  };

  const handleEditSupplyItem = (
    materialId: string,
    field: keyof ISupplyItem["materialSpecs"],
    value: number | string,
  ) => {
    setSupplierForm((prev) => ({
      ...prev,
      supplyItems: prev.supplyItems.map((item) =>
        item.materialId === materialId
          ? { ...item, materialSpecs: { ...item.materialSpecs, [field]: value } }
          : item,
      ),
    }));
  };

  const handleDeleteSupplyItem = (materialId: string) => {
    const newSupplyItems = supplierForm.supplyItems.filter((item) => item.materialId !== materialId);
    setSupplierForm((prev) => ({ ...prev, supplyItems: newSupplyItems }));
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border p-4 shadow-custom xl:col-span-5">
      <span className={"w-max border-b-1 border-dark"}>
        <h5>Chọn mặt hàng cung cấp</h5>
      </span>
      <Input
        variant={"bordered"}
        placeholder="Nhập tên nguyên/vật liệu muốn thêm"
        size={"lg"}
        onValueChange={(value) => handleSearchMaterial(value)}
      />
      <div className="flex flex-col gap-4 rounded-xl border p-4 shadow-custom">
        <div className="grid grid-cols-3 overflow-hidden rounded-md bg-dark/10 px-4 py-2">
          <h6 className={`justify-self-start truncate`}>Tên nguyên liệu </h6>
          <h6 className={`justify-self-center`}>Kiểu nguyên/vật liệu</h6>
          <h6 className={`justify-self-end`}>Thêm/Xóa</h6>
        </div>

        <div className="h-56 overflow-auto">
          {listMaterials.length === 0 ? (
            <p className="text-center italic text-default-300">Không có nguyên liệu nào</p>
          ) : (
            listMaterials.map((material, index) => (
              <div className="grid grid-cols-3 px-4 py-2" key={index}>
                <p className={`justify-self-start`}>{material.materialName}</p>
                <Chip
                  variant={"flat"}
                  color={MapMaterialTypeColor[material.materialType]}
                  className={"justify-self-center"}
                >
                  {MapMaterialTypeText[material.materialType]}
                </Chip>
                {!checkMaterialExist(material._id) ? (
                  <Button
                    isIconOnly
                    className={`justify-self-end`}
                    color="secondary"
                    variant="flat"
                    onClick={() => handleAddSupplyItem(material._id)}
                  >
                    {iconConfig.add.base}
                  </Button>
                ) : (
                  <Button
                    isIconOnly
                    className={`justify-self-end`}
                    color="danger"
                    variant="flat"
                    onClick={() => handleDeleteSupplyItem(material._id)}
                  >
                    {iconConfig.delete.base}
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="w-full rounded-xl border p-4 shadow-custom">
        <div className="grid grid-cols-5 gap-4 overflow-hidden rounded-xl bg-dark/10 p-2">
          <h6 className={`col-span-1 justify-self-center truncate`}>Tên nguyên liệu </h6>
          <h6 className={`col-span-1`}>Cách đóng gói</h6>
          <h6 className={`col-span-1`}>Sản phẩm/kiện</h6>
          <h6 className={`col-span-1`}>Trọng lượng sản phẩm</h6>
          <h6 className={`col-span-1`}>Giá đề xuất</h6>
        </div>
        <div className="flex w-full flex-col">
          {supplierForm.supplyItems.length === 0 ? (
            <p className="mt-4 text-center italic text-default-300">Không có nguyên liệu nào được thêm</p>
          ) : (
            supplierForm.supplyItems.map((material, index) => (
              <div className="grid grid-cols-5 items-center gap-4 p-2" key={index}>
                <h6 className={`${textSizes.sm} col-span-1 justify-self-center`}>
                  {getMaterialAttribute(material.materialId, "materialName")}
                </h6>
                <Input
                  className={"col-span-1"}
                  fullWidth
                  size="lg"
                  variant="bordered"
                  value={material.materialSpecs.baseUnit}
                  onValueChange={(e) => handleEditSupplyItem(material.materialId, "baseUnit", e)}
                />
                <Input
                  className={"col-span-1"}
                  size="lg"
                  variant="bordered"
                  type="number"
                  value={material.materialSpecs.packsPerUnit.toString()}
                  onValueChange={(e) => handleEditSupplyItem(material.materialId, "packsPerUnit", +e)}
                />
                <Input
                  className={"col-span-1"}
                  size="lg"
                  variant="bordered"
                  type="number"
                  value={material.materialSpecs.quantityPerPack.toString()}
                  endContent={getMaterialAttribute(material.materialId, "calUnit")}
                  onValueChange={(e) => handleEditSupplyItem(material.materialId, "quantityPerPack", +e)}
                />
                <Input
                  className={"col-span-1"}
                  size="lg"
                  variant="bordered"
                  type="number"
                  value={material.materialSpecs.pricePerUnit.toString()}
                  endContent={"VNĐ"}
                  onValueChange={(e) => handleEditSupplyItem(material.materialId, "pricePerUnit", +e)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplyItem;
