import iconConfig from "@/config/icons/icon-config";
import textSizes from "@/config/styles/text-size";
import { ICakeChildVariant, ICakeVariant } from "@/types/cake";
import { IRecipeVariant } from "@/types/recipe";
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import * as React from "react";

interface VariantCakesProps {
  variantCakes: ICakeVariant[];
  recipeVariantList: IRecipeVariant[] | [];
  setVariantCakes: React.Dispatch<React.SetStateAction<ICakeVariant[]>>;
}
const VariantCakes = ({ variantCakes, setVariantCakes, recipeVariantList }: VariantCakesProps) => {
  const recipeVariantItems = React.useMemo(() => {
    return recipeVariantList.length > 0
      ? recipeVariantList.flatMap((variant) =>
          variant.variantItems.map((item) => ({
            ...item,
            variantLabel: variant.variantLabel,
          })),
        )
      : [];
  }, [recipeVariantList]);

  const addVarriantItem = () => {
    if (variantCakes.length < 5) {
      setVariantCakes([
        ...variantCakes,
        {
          variantLabel: "",
          variantItems: [
            {
              itemLabel: "",
              itemPrice: 0,
              itemRecipe: "",
            },
          ],
        },
      ]);
    }
  };
  const deleteVariantItem = (index: number) => {
    setVariantCakes(variantCakes.filter((_, i) => i !== index));
  };
  const addChildVariant = (index: number) => {
    setVariantCakes((prev) => {
      const updatedVariants = [...prev];
      if (updatedVariants[index].variantItems.length < 5) {
        updatedVariants[index] = {
          ...updatedVariants[index],
          variantItems: [
            ...prev[index].variantItems,
            { itemLabel: "", itemPrice: 0, additional: { weight: 0, materialId: "" } },
          ] as ICakeChildVariant[],
        };
        return updatedVariants;
      }
      return prev;
    });
  };
  const deleteChildVariant = (parentIndex: number, childIndex: number) => {
    setVariantCakes((prev) => {
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
    setVariantCakes((prev) => {
      const updatedLabel = [...prev];
      updatedLabel[parentIndex] = {
        ...updatedLabel[parentIndex],
        [name]: value,
      };
      return updatedLabel;
    });
  };
  const handleChangeChildVariant = (parentIndex: number, childIndex: number, name: string, value: string) => {
    setVariantCakes((prevVariants) => {
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
  const handleSectionChildVariantChange = (
    parentIndex: number,
    childIndex: number,
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setVariantCakes((prevVariants) => {
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
  console.log("recipeVariantItems", recipeVariantItems);
  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl">
        <div className={"flex items-center justify-between"}>
          <div className="flex items-center gap-x-4">
            <Button startContent={iconConfig.add.base} color="secondary" onClick={addVarriantItem}>
              Thêm biến thể
            </Button>
            <span className="text-danger">({variantCakes.length}/5)</span>
          </div>
        </div>
        <div className={"flex flex-col gap-2"}>
          {variantCakes.map((v, parentIndex) => (
            <div className="rounded-2xl border p-4" key={v._id}>
              <div className="flex flex-col gap-y-2">
                <div className="flex w-full justify-between">
                  <h6 className={"underline"}>Biến thể bánh {parentIndex + 1}</h6>
                  <Button isIconOnly color="danger" size="sm" onClick={() => deleteVariantItem(parentIndex)}>
                    {iconConfig.xMark.base}
                  </Button>
                </div>
                <div>
                  <Input
                    value={v.variantLabel}
                    name="variantLabel"
                    onValueChange={(value) => handleChangeLabel(parentIndex, "variantLabel", value)}
                    placeholder="Nhập tên nhãn"
                    variant="bordered"
                    size="lg"
                  />
                </div>

                <div className={"flex flex-col gap-4"}>
                  <div className="flex items-center justify-between">
                    <p className={`nline-block`}>Các tùy chọn của biến thể</p>
                    <div className="flex items-center gap-x-4">
                      <span className="text-danger">({v.variantItems.length}/5)</span>
                      <Button
                        isIconOnly
                        color="secondary"
                        size="lg"
                        radius="lg"
                        onClick={() => addChildVariant(parentIndex)}
                      >
                        {iconConfig.add.medium}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    {v.variantItems.map((_, childIndex) => (
                      <div className="flex items-end gap-2" key={_._id}>
                        <p>{childIndex + 1}. </p>
                        <div className="grid grid-cols-3 gap-x-2">
                          <Input
                            value={v.variantItems[childIndex].itemLabel}
                            onValueChange={(value) =>
                              handleChangeChildVariant(parentIndex, childIndex, "itemLabel", value)
                            }
                            name="itemLabel"
                            placeholder="Nhãn sản phẩm"
                            label={"Nhãn sản phẩm"}
                            labelPlacement={"outside"}
                            variant="bordered"
                            size="lg"
                          />
                          <Input
                            value={v.variantItems[childIndex].itemPrice.toString()}
                            onValueChange={(value) =>
                              handleChangeChildVariant(parentIndex, childIndex, "itemPrice", value)
                            }
                            name="itemPrice"
                            label="Giá cộng thêm"
                            labelPlacement={"outside"}
                            placeholder="Giá cộng thêm"
                            variant="bordered"
                            size="lg"
                            type="number"
                          />
                          <Select
                            selectedKeys={[v.variantItems[childIndex].itemRecipe as string]}
                            name="itemRecipe"
                            onChange={(selectedKeys) =>
                              handleSectionChildVariantChange(parentIndex, childIndex, selectedKeys)
                            }
                            size="lg"
                            label={"Chọn CT biến thể"}
                            labelPlacement={"outside"}
                            variant={"bordered"}
                            placeholder="Chọn CT biến thể"
                            aria-label="material list"
                          >
                            {recipeVariantItems.map((recipe) => (
                              <SelectItem key={recipe._id as string} value={recipe._id}>
                                {`${recipe.itemLabel} / ${recipe.variantLabel}`}
                              </SelectItem>
                            ))}
                          </Select>
                        </div>
                        <Button
                          isIconOnly
                          size={"lg"}
                          color="danger"
                          variant="flat"
                          onClick={() => deleteChildVariant(parentIndex, childIndex)}
                        >
                          {iconConfig.xMark.medium}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default VariantCakes;
