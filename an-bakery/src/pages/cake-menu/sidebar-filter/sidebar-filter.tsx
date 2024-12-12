import { IBranch } from "@/types/branch";
import { ICategory } from "@/types/category";
import { Checkbox, CheckboxGroup } from "@nextui-org/checkbox";
import { Divider, Radio, RadioGroup } from "@nextui-org/react";
import { useState } from "react";
interface ISelectedBranch {
  branchName: string | null;
  businessProducts?: string[];
  isActive?: boolean;
}
interface ISidebarFilterProps {
  listCategories: ICategory[];
  listBranches: IBranch[];
  selectedBranch: ISelectedBranch | null;
  selectedCategoriesWithBranch: string[];
  selectedPriceWithBranch: string | null;
  onFiltersChange: (value: { [key: string]: string | number } | {}) => void;
  setSelectedBranch: React.Dispatch<React.SetStateAction<ISelectedBranch | null>>;
  setSelectedCategoriesWithBranch: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedPriceWithBranch: React.Dispatch<React.SetStateAction<string | null>>;
}

const listOfPrices = [
  {
    name: "0 - 100.000 VNĐ",
    value: "0-100000",
  },
  {
    name: "100.000 - 200.000 VNĐ",
    value: "100000-200000",
  },
  {
    name: "200.000 - 300.000 VNĐ",
    value: "200000-300000",
  },
  {
    name: "300.000 - 400.000 VNĐ",
    value: "300000-400000",
  },
  {
    name: "400.000 - 500.000 VNĐ",
    value: "400000-500000",
  },
  {
    name: "500.000 - 600.000 VNĐ",
    value: "500000-600000",
  },
  {
    name: "Trên 600.000 VNĐ",
    value: "600000-1000000",
  },
];

const SidebarFilter = ({
  onFiltersChange,
  setSelectedBranch,
  setSelectedCategoriesWithBranch,
  setSelectedPriceWithBranch,
  selectedPriceWithBranch,
  listCategories,
  listBranches,
  selectedBranch,
}: ISidebarFilterProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const handleCategoryChange = (value: string[]) => {
    setSelectedCategories(value);
    const newFilters = {
      cakeCategory: value.map((cat) => cat.toLowerCase().trim()).join(","),
    };
    if (onFiltersChange) onFiltersChange(newFilters);
  };

  const handlePriceChange = (value: string) => {
    console.log(value);
    const [min, max] = value.split("-").map(Number);
    setSelectedPrice((prev) => {
      const newValue = prev === value ? null : value;
      const newFilters = newValue
        ? { "cakeDefaultPrice[gte]": min, "cakeDefaultPrice[lte]": max }
        : { "cakeDefaultPrice[gte]": 0, "cakeDefaultPrice[lte]": 0 };
      if (onFiltersChange) onFiltersChange(newFilters);
      return newValue;
    });
  };

  const handleCategoryChangeWithBranch = (value: string[]) => {
    setSelectedCategoriesWithBranch(value);
  };

  const handlePriceChangeWithBranch = (value: string) => {
    setSelectedPriceWithBranch((prev) => {
      return prev === value ? null : value;
    });
  };
  return (
    <div className="col-span-3 max-lg:hidden">
      <div className="w-full">
        <div className="w-full flex-col gap-4 rounded-2xl border p-4 shadow-custom">
          <div className="flex flex-col gap-4">
            <h5>Bộ lọc</h5>
            <Divider />
            <CheckboxGroup
              onValueChange={(value) => {
                if (selectedBranch) {
                  handleCategoryChangeWithBranch(value);
                } else {
                  handleCategoryChange(value);
                }
              }}
              label="Loại bánh"
            >
              {listCategories.map((category) => (
                <Checkbox
                  key={category._id}
                  value={category.categoryKey}
                  isSelected={selectedCategories.includes(category.categoryKey)}
                >
                  {category.categoryName}
                </Checkbox>
              ))}
            </CheckboxGroup>
            <Divider />
            <CheckboxGroup label="Khoảng giá">
              {listOfPrices.map((price) => (
                <Checkbox
                  key={price.value}
                  value={price.value}
                  onValueChange={() =>
                    selectedBranch === null
                      ? handlePriceChange(price.value)
                      : handlePriceChangeWithBranch(price.value)
                  }
                  isSelected={
                    selectedBranch === null
                      ? selectedPrice === price.value
                      : selectedPriceWithBranch === price.value
                  }
                >
                  {price.name}
                </Checkbox>
              ))}
            </CheckboxGroup>
            <Divider />
            <RadioGroup
              label="Chi nhánh"
              onValueChange={(value) => {
                setSelectedBranch(() => {
                  if (value === "all") return null;

                  const branch = listBranches.find((branch) => branch._id === value);

                  if (branch === undefined) return null;
                  return {
                    branchName: branch.branchConfig.branchDisplayName,
                    businessProducts: branch.businessProducts,
                    isActive: branch.isActive,
                  };
                });
              }}
            >
              <Radio value={"all"}>Tất cả</Radio>
              {listBranches.map((branch) => (
                <Radio key={branch._id} value={branch._id}>
                  {branch.branchConfig.branchDisplayName}
                </Radio>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarFilter;
