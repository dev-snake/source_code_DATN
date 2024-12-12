import { ICake } from "@/types/cake";
import { Input, Radio, RadioGroup, Select, SelectItem, Textarea } from "@nextui-org/react";
import React from "react";
import { useState, useEffect } from "react";
import useAxios from "@/hooks/useAxios";
import { ICategory } from "@/types/category";
import { IAPIResponse } from "@/types/api-response";
import { apiRoutes } from "@/config/routes/api-routes.config";
interface CakeBaseInfor {
  cakeName: string;
  cakeCategory: string;
  cakeDescription: string;
  discountPercents: number;
  cakeDefaultPrice: number;
}
interface CakeInfoProps {
  cakeInfo: Pick<ICake, keyof CakeBaseInfor>;
  setCakeInfo: React.Dispatch<React.SetStateAction<Pick<ICake, keyof CakeBaseInfor>>>;
  showVariants: boolean;
  setShowVariants: React.Dispatch<React.SetStateAction<boolean>>;
}
const CakeInfo = ({ cakeInfo, setCakeInfo, showVariants, setShowVariants }: CakeInfoProps) => {
  const [listCategories, setListCategories] = useState<ICategory[]>([]);
  const axiosClient = useAxios();
  useEffect(() => {
    axiosClient
      .get<IAPIResponse<ICategory[]>>(apiRoutes.categories.getAll)
      .then((response) => response.data)
      .then((response) => setListCategories(response.results))
      .catch((error) => console.log(error));
  }, []);
  const handleChange = (name: string, value: string) => {
    setCakeInfo({ ...cakeInfo, [name]: value });
  };

  return (
    <div className="rounded-2xl border p-4 shadow-custom">
      <h5 className="mb-4">Thông tin sản phẩm</h5>
      <div className="flex flex-col gap-4">
        <Input
          value={cakeInfo.cakeName}
          name="cakeName"
          className="w-full"
          variant="bordered"
          label={"Tên sản phẩm"}
          labelPlacement={"outside"}
          placeholder={"Nhập tên sản phẩm"}
          size={"lg"}
          onValueChange={(value) => handleChange("cakeName", value)}
        />
        <div className="grid grid-cols-3 gap-x-2">
          <Input
            value={cakeInfo.cakeDefaultPrice.toString()}
            name="cakeDefaultPrice"
            variant="bordered"
            label="Giá sản phẩm"
            labelPlacement={"outside"}
            size="lg"
            onValueChange={(value) => handleChange("cakeDefaultPrice", value)}
            type="number"
          />
          <Input
            value={cakeInfo.discountPercents.toString()}
            type="number"
            name="discountPercents"
            variant="bordered"
            label="Giảm giá"
            labelPlacement={"outside"}
            size={"lg"}
            min={0}
            max={100}
            onValueChange={(value) => handleChange("discountPercents", value)}
          />
          <Select
            selectedKeys={[cakeInfo.cakeCategory]}
            name="cakeCategory"
            label={"Chọn danh mục"}
            labelPlacement={"outside"}
            size="lg"
            variant={"bordered"}
            placeholder="Chọn danh mục"
            aria-label="categories list"
            onSelectionChange={(e) => setCakeInfo({ ...cakeInfo, cakeCategory: Array.from(e).join("") })}
          >
            {listCategories.map((category) => (
              <SelectItem key={category.categoryKey}>{category.categoryName}</SelectItem>
            ))}
          </Select>
        </div>
        <Textarea
          value={cakeInfo.cakeDescription}
          name="cakeDescription"
          onValueChange={(value) => handleChange("cakeDescription", value)}
          placeholder="Mô tả sản phẩm"
          variant="bordered"
          size="lg"
          label={"Mô tả sản phẩm"}
          labelPlacement={"outside"}
          classNames={{
            label: "text-base",
          }}
        />
        <RadioGroup
          value={showVariants.toString()}
          onValueChange={(value) => setShowVariants(value === "true" ? true : false)}
        >
          <Radio value={"false"}>Bánh không có biến thể</Radio>
          <Radio value={"true"}>Bánh có biến thể</Radio>
        </RadioGroup>
      </div>
    </div>
  );
};

export default CakeInfo;
