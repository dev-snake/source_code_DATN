import Loading from "@/components/admin/loading";
import iconConfig from "@/config/icons/icon-config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import textSizes from "@/config/styles/text-size";
import useAxios from "@/hooks/useAxios";
import { IAPIResponse } from "@/types/api-response";
import { IMaterial } from "@/types/material";
import { IRecipeVariantForm } from "@/types/recipe";
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface IRecipeVariantsProps {
  recipeVariants: IRecipeVariantForm[];
  setRecipeVariants: React.Dispatch<React.SetStateAction<IRecipeVariantForm[]>>;
}
const RecipeVariants: React.FC<IRecipeVariantsProps> = ({ recipeVariants, setRecipeVariants }) => {
  const [listMaterials, setListMaterials] = useState<IMaterial[]>([]);
  const axiosClient = useAxios();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    axiosClient
      .get<IAPIResponse<IMaterial[]>>(apiRoutes.materials.getAll + "?noPagination=true")
      .then((response) => response.data)
      .then((response) => {
        console.log(response.results);
        setListMaterials(response.results);
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  }, []);

  const addVarriantItem = () => {
    if (recipeVariants.length === 5) {
      return toast.error("Bạn chỉ có thể thêm tối đa 5 biến thể cho một công thức");
    }
    setRecipeVariants([
      ...recipeVariants,
      {
        variantLabel: "",
        variantItems: [
          {
            itemLabel: "",
            materialId: "",
            quantity: 0,
          },
        ],
      },
    ]);
  };
  const deleteVariantItem = (index: number) => {
    setRecipeVariants(recipeVariants.filter((_, i) => i !== index));
  };

  const addChildVariant = (parentIndex: number) => {
    if (recipeVariants[parentIndex].variantItems.length === 5)
      return toast.error("Bạn chỉ có thể thêm tối đa 5 tùy chọn cho một biến thể");

    setRecipeVariants((prev) => {
      const updatedVariants = [...prev];
      updatedVariants[parentIndex] = {
        ...updatedVariants[parentIndex],
        variantItems: [
          ...updatedVariants[parentIndex].variantItems,
          {
            itemLabel: "",
            materialId: "",
            quantity: 0,
          },
        ],
      };
      return updatedVariants;
    });
  };
  const deleteChildVariant = (parentIndex: number, childIndex: number) => {
    setRecipeVariants((prev) => {
      const updatedVariants = [...prev];
      if (updatedVariants[parentIndex].variantItems.length > 1) {
        const filterChildVariant = updatedVariants[parentIndex].variantItems.filter(
          (_, i) => i !== childIndex,
        );
        updatedVariants[parentIndex] = {
          ...updatedVariants[parentIndex],
          variantItems: filterChildVariant,
        };
        return updatedVariants;
      }
      return updatedVariants;
    });
  };
  const handleChangeLabel = (parentIndex: number, name: string, value: string) => {
    setRecipeVariants((prev) => {
      const updatedLabel = [...prev];
      updatedLabel[parentIndex] = {
        ...updatedLabel[parentIndex],
        [name]: value,
      };
      return updatedLabel;
    });
  };
  const handleChangeChildVariant = (name: string, value: string, parentIndex: number, childIndex: number) => {
    setRecipeVariants((prevVariants) => {
      return prevVariants.map((parent, pIndex) => {
        if (pIndex !== parentIndex) return parent;
        return {
          ...parent,
          variantItems: parent.variantItems.map((child, cIndex) => {
            if (cIndex !== childIndex) return child;
            return {
              ...child,
              [name]: value,
            };
          }),
        };
      });
    });
  };
  const handleChooseMaterial = (parentIndex: number, childIndex: number, materialId: string) => {
    setRecipeVariants((prev) => {
      const updatedVariants = [...prev];
      const updatedVariantItems = [...updatedVariants[parentIndex].variantItems];

      updatedVariantItems[childIndex] = {
        ...updatedVariantItems[childIndex],
        materialId: materialId,
      };

      updatedVariants[parentIndex].variantItems = updatedVariantItems;
      return updatedVariants;
    });
  };
  const handleUpdateQuantity = (parentIndex: number, childIndex: number, quantity: number) => {
    setRecipeVariants((prev) => {
      const updatedVariants = [...prev];
      const updatedVariantItems = [...updatedVariants[parentIndex].variantItems];

      updatedVariantItems[childIndex] = {
        ...updatedVariantItems[childIndex],
        quantity: quantity,
      };

      updatedVariants[parentIndex].variantItems = updatedVariantItems;
      return updatedVariants;
    });
  };

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col gap-4 rounded-2xl">
      <div className="flex items-center gap-x-4">
        <Button color="secondary" onClick={addVarriantItem} startContent={iconConfig.add.base}>
          Thêm biến thể
        </Button>
        <span className="text-danger">({recipeVariants.length}/5)</span>
      </div>
      <div className={"flex flex-col gap-2"}>
        {recipeVariants.map((v, parentIndex) => (
          <div className="rounded-2xl border p-4 shadow-custom" key={parentIndex}>
            <div className="flex flex-col gap-y-2">
              <div className="flex w-full justify-between">
                <h6 className={"underline"}>Công thức biến thể {parentIndex + 1}</h6>
                <Button isIconOnly color="danger" size={"sm"} onClick={() => deleteVariantItem(parentIndex)}>
                  {iconConfig.xMark.base}
                </Button>
              </div>
              <div>
                <span className={`${textSizes.base} mb-2 block`}>Tên biến thể</span>
                <Input
                  value={v.variantLabel}
                  name="variantLabel"
                  onValueChange={(value) => handleChangeLabel(parentIndex, "variantLabel", value)}
                  placeholder="Nhập tên nhãn"
                  variant="bordered"
                  size="lg"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <p className={`inline-block`}>Các tùy chọn của biến thể</p>
                  <div className="flex items-center gap-x-4">
                    <p className="text-danger">{v.variantItems.length}/5</p>
                    <Button
                      isIconOnly
                      color="secondary"
                      size="sm"
                      onClick={() => addChildVariant(parentIndex)}
                    >
                      {iconConfig.add.base}
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  {v.variantItems.map((variantItem, childIndex) => {
                    console.log(variantItem);
                    return (
                      <div className="flex w-full gap-x-2">
                        <div className="grid grid-cols-4 gap-x-2">
                          <div className="col-span-2">
                            <Input
                              value={variantItem.itemLabel}
                              onValueChange={(value) =>
                                handleChangeChildVariant("itemLabel", value, parentIndex, childIndex)
                              }
                              name="itemLabel"
                              placeholder="Nhãn biến thể"
                              variant="bordered"
                              size="lg"
                            />
                          </div>
                          <Select
                            selectedKeys={[
                              (variantItem.materialId as IMaterial)?._id ??
                                (variantItem.materialId as string),
                            ]}
                            placeholder="Chọn nguyên liệu"
                            size="lg"
                            variant={"bordered"}
                            aria-label="Select an option"
                            onSelectionChange={(e) =>
                              handleChooseMaterial(parentIndex, childIndex, Array.from(e).join(""))
                            }
                          >
                            {listMaterials.map((material) => (
                              <SelectItem key={material._id} textValue={material.materialName}>
                                {material.materialName}
                              </SelectItem>
                            ))}
                          </Select>
                          <Input
                            value={variantItem.quantity.toString()}
                            type="number"
                            placeholder="Số lượng"
                            size="lg"
                            variant="bordered"
                            onValueChange={(value) => handleUpdateQuantity(parentIndex, childIndex, +value)}
                          />
                        </div>
                        <Button
                          isIconOnly
                          size="lg"
                          color="danger"
                          variant="flat"
                          onClick={() => deleteChildVariant(parentIndex, childIndex)}
                        >
                          {iconConfig.xMark.base}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeVariants;
