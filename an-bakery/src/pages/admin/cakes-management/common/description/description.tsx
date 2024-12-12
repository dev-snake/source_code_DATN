import iconConfig from "@/config/icons/icon-config";
import { ICakeProperty } from "@/types/cake";
import { Button, Input } from "@nextui-org/react";
import * as React from "react";

interface DescriptionProps {
  cakeProperties: ICakeProperty[];
  setCakeProperties: React.Dispatch<React.SetStateAction<ICakeProperty[]>>;
}

const Description = ({ cakeProperties, setCakeProperties }: DescriptionProps) => {
  const addVariantItem = (): void => {
    if (cakeProperties.length < 5) {
      setCakeProperties([...cakeProperties, { propertyKey: "", propertyValue: "" }]);
    }
  };
  const deleteVariantItem = (variantIndex: number) => {
    if (cakeProperties.length > 1) {
      setCakeProperties(cakeProperties.filter((_, i) => i !== variantIndex));
    }
  };
  const handleVariantInput = (variantIndex: number, name: string, value: string) => {
    cakeProperties[variantIndex][name as keyof ICakeProperty] = value;
    setCakeProperties([...cakeProperties]);
  };
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Button startContent={iconConfig.add.base} color="secondary" onClick={addVariantItem}>
            Thêm mô tả
          </Button>
          <span className="text-danger">({cakeProperties.length}/5)</span>
        </div>
      </div>
      <div className="flex flex-col gap-y-2">
        {cakeProperties.map((cakeProperty, index) => (
          <div className="flex items-center gap-x-2" key={index}>
            <p className={"text-lg"}>{index + 1}. </p>
            <Input
              value={cakeProperty.propertyKey}
              name="propertyKey"
              placeholder="Nhập tên mô tả"
              size="lg"
              variant="bordered"
              onValueChange={(value) => handleVariantInput(index, "propertyKey", value)}
            />
            <Input
              value={cakeProperty.propertyValue}
              name="propertyValue"
              placeholder="Nhập nội dung"
              size="lg"
              onValueChange={(value) => handleVariantInput(index, "propertyValue", value)}
              variant="bordered"
            />
            <Button
              isIconOnly
              size="lg"
              variant="flat"
              color="danger"
              onClick={() => deleteVariantItem(index)}
            >
              {iconConfig.xMark.medium}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Description;
