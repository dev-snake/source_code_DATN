import iconConfig from "@/config/icons/icon-config";
import {
  Button,
  Select,
  SelectItem,
  Input,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Table,
} from "@nextui-org/react";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IMaterialForm as IMaterial } from "@/types/material";
import { useEffect, useState } from "react";
import { IAPIResponse } from "@/types/api-response";
import { apiRoutes } from "@/config/routes/api-routes.config";
import Loading from "@/components/admin/loading";
import { IIngredients } from "@/types/recipe";
import { toast } from "react-toastify";
import { copyToClipboard } from "@/utils/copy-to-clipboard";
interface IngredientsProps {
  listOfIngredients: IIngredients[];
  setListOfIngredients: React.Dispatch<React.SetStateAction<IIngredients[]>>;
}
const Ingredients = ({ listOfIngredients, setListOfIngredients }: IngredientsProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const axiosStaff = useStaffAxios();
  const [listMaterials, setListMaterials] = useState<IMaterial[]>([]);
  const [listSearchMaterials, setListSearchMaterials] = useState<IMaterial[]>([]);
  const [listAllMaterials, setListAllMaterials] = useState<IMaterial[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inputMaterialId, setInputMaterialId] = useState<string>("");

  const fetchMaterials = () => {
    axiosStaff
      .get<IAPIResponse<IMaterial[]>>(apiRoutes.materials.getAll, {
        params: {
          noPagination: true,
        },
      })
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          setListMaterials(response.results);
          setListSearchMaterials(response.results);
          setListAllMaterials(response.results);
        }
      })
      .catch((error) => console.error(error))
      .finally(() => setIsLoading(false));
  };
  useEffect(() => {
    fetchMaterials();
  }, []);
  if (isLoading)
    return (
      <div className="flex justify-center">
        <Loading />
      </div>
    );

  const handleAddNewIngredient = (materialId: string = "") => {
    if (
      materialId !== "" &&
      listOfIngredients.find((item) =>
        (item.materialId as IMaterial)?._id
          ? (item.materialId as IMaterial)?._id === materialId
          : item.materialId === materialId,
      )
    ) {
      return toast.error("Nguyên liệu đã tồn tại trong danh sách");
    }

    return setListOfIngredients((prev) => [
      ...prev,
      {
        materialId: materialId || "",
        quantity: 0,
      },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (listOfIngredients.length === 1) return;
    setListOfIngredients((prev) => prev.filter((_, i) => i !== index));
  };
  const handleChooseMaterial = (index: number, materialId: string) => {
    if (
      materialId !== "" &&
      listOfIngredients.find((item) =>
        (item.materialId as IMaterial)?._id
          ? (item.materialId as IMaterial)?._id === materialId
          : item.materialId === materialId,
      )
    ) {
      return toast.error("Nguyên liệu đã tồn tại trong danh sách");
    }
    setListOfIngredients((prev) => prev.map((item, i) => (i === index ? { ...item, materialId } : item)));
  };
  const handleUpdateQuantity = (index: number, quantity: number) => {
    setListOfIngredients((prev) => prev.map((item, i) => (i === index ? { ...item, quantity } : item)));
  };

  const handleAddNewRowIngredient = () => {
    if (inputMaterialId) {
      handleAddNewIngredient(inputMaterialId);
      setInputMaterialId("");
    } else {
      handleAddNewIngredient();
    }
  };

  const handleSearchMaterial = (searchString: string) => {
    if (!searchString) {
      return setListSearchMaterials(listAllMaterials);
    }

    const filteredMaterials = listAllMaterials.filter((material) => {
      return material.materialName.toLowerCase().includes(searchString.toLowerCase());
    });

    setListSearchMaterials(filteredMaterials);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <Input
            aria-label={"Thêm nhanh nguyên liệu bằng mã"}
            placeholder="Thêm nhanh nguyên liệu bằng mã"
            variant="bordered"
            size={"lg"}
            value={inputMaterialId}
            onValueChange={(e) => setInputMaterialId(e)}
          />
          <Button
            size={"lg"}
            color="secondary"
            onClick={() => handleAddNewRowIngredient()}
            startContent={iconConfig.add.medium}
            className={"min-w-max"}
          >
            Thêm hàng mới
          </Button>
          <Button
            size={"lg"}
            color="warning"
            onClick={() => onOpen()}
            startContent={iconConfig.view.base}
            className={"min-w-max"}
          >
            Xem bảng mã
          </Button>
        </div>
        <Divider />
        <div className="flex flex-col gap-y-2">
          {listOfIngredients.map((_, index) => (
            <div className="flex items-center gap-2" key={(_.materialId as IMaterial)._id}>
              <p className={"text-lg"}>{index + 1}. </p>
              <div className="flex w-full gap-x-2">
                <Select
                  selectedKeys={[(_.materialId as IMaterial)._id || (_.materialId as string)]}
                  placeholder="Chọn nguyên liệu"
                  size="lg"
                  variant="bordered"
                  aria-label="Select an option"
                  onSelectionChange={(e) => handleChooseMaterial(index, Array.from(e).join(""))}
                >
                  {listMaterials.map((material) => (
                    <SelectItem key={material._id ?? ""} value={material._id}>
                      {material.materialName}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  value={_.quantity.toString()}
                  type="number"
                  placeholder="Số lượng"
                  size="lg"
                  variant="bordered"
                  onValueChange={(e) => handleUpdateQuantity(index, +e)}
                />
              </div>
              <Button
                isIconOnly
                size="lg"
                color="danger"
                variant="flat"
                onClick={() => handleRemoveIngredient(index)}
              >
                {iconConfig.xMark.base}
              </Button>
            </div>
          ))}
        </div>
      </div>
      <Modal size={"2xl"} isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Bảng mã nguyên liệu</ModalHeader>
              <ModalBody>
                <div className={"flex flex-col gap-4"}>
                  <Input
                    aria-label={"Tìm kiếm nguyên liệu"}
                    placeholder="Tìm kiếm nguyên liệu"
                    variant="bordered"
                    size={"lg"}
                    endContent={iconConfig.search.medium}
                    onValueChange={(value) => handleSearchMaterial(value)}
                  />
                  <Table
                    aria-label={"Bảng mã nguyên liệu"}
                    className={"h-[500px]"}
                    selectionMode={"single"}
                    selectedKeys={[""]}
                    onSelectionChange={(e) => {
                      copyToClipboard(Array.from(e).join(""));
                      toast.success("Đã sao chép mã nguyên liệu");
                    }}
                  >
                    <TableHeader>
                      <TableColumn>Mã nguyên liệu</TableColumn>
                      <TableColumn>Tên nguyên liệu</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {listSearchMaterials.map((material) => (
                        <TableRow key={material._id}>
                          <TableCell>{material._id}</TableCell>
                          <TableCell>{material.materialName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Đóng
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Ingredients;
