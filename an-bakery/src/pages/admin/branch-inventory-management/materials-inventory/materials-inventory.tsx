import iconConfig, { iconSize } from "@/config/icons/icon-config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useStaffAxios from "@/hooks/useStaffAxios";
import { TMaterialHistoryChange, TMaterialInventory } from "@/types/branch";
import {
  Button,
  Chip,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { BiSearchAlt } from "react-icons/bi";
import { MapHistoryChangeTypeColor, MapHistoryChangeTypeText } from "../branch-inventory-management";
import { formatDate } from "@/utils/format-date";
import Loading from "@/components/admin/loading";
import { IMaterial } from "@/types/material";

interface MaterialsInventoryProps {
  currentBranch: string;
}

type TSortMode = "default" | "asc" | "desc";

const MapSortIcon: Record<TSortMode, React.ReactNode> = {
  default: "",
  asc: iconConfig.sortUp.base,
  desc: iconConfig.sortDown.base,
};

const MapNextSortMode: Record<TSortMode, TSortMode> = {
  default: "asc",
  asc: "desc",
  desc: "default",
};
const MaterialsInventory = ({ currentBranch }: MaterialsInventoryProps) => {
  const staffAxios = useStaffAxios();

  const [searchValue, setSearchValue] = useState<string>("");
  const [listAllMaterials, setListAllMaterials] = useState<TMaterialInventory[]>([]);
  const [listMaterials, setListMaterials] = useState<TMaterialInventory[]>([]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenRemove, onOpen: onOpenRemove, onClose: onCloseRemove } = useDisclosure();

  const [currentSelectMaterial, setCurrentSelectMaterial] = useState<TMaterialHistoryChange[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<TMaterialInventory | null>(null);
  const [selectedRemoveMaterial, setSelectedRemoveMaterial] = useState<string>("");

  const [inInventoryWeight, setInInventoryWeight] = useState<number>(0);
  const [removeWeight, setRemoveWeight] = useState<number>(0);

  const [currentSortMode, setCurrentSortMode] = useState<TSortMode>("default");

  const [isFetching, setIsFetching] = useState<boolean>(true);

  const getBranchMaterials = () => {
    if (currentBranch) {
      staffAxios
        .get(apiRoutes.branches.getInventory(currentBranch, "materials"))
        .then((response) => response.data)
        .then((response) => {
          setListAllMaterials(response.results);
          setListMaterials(response.results);
        })
        .catch((error) => {
          const { data } = error.response;
          setListAllMaterials(data.results);
          setListMaterials(data.results);
        })
        .finally(() => setIsFetching(false));
    }
  };

  const handleShowHistory = (materialId: string) => {
    setSelectedMaterial(
      listAllMaterials.find(
        (x) => x.materialId._id.toString() === materialId.toString(),
      ) as TMaterialInventory,
    );
    setCurrentSelectMaterial(
      listAllMaterials
        .find((material) => material.materialId._id === materialId)
        ?.historyChange.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) ||
        [],
    );
    onOpen();
  };

  const handleSort = () => {
    const nextSortMode = MapNextSortMode[currentSortMode];
    setCurrentSortMode(nextSortMode);
    if (nextSortMode === "default") {
      setListMaterials([...listAllMaterials]);
    } else if (nextSortMode === "asc") {
      setListMaterials([...listMaterials].sort((a, b) => a.inventoryVolume - b.inventoryVolume));
    } else {
      setListMaterials([...listMaterials].sort((a, b) => b.inventoryVolume - a.inventoryVolume));
    }
  };

  const handleSearch = (searchValue: string) => {
    setSearchValue(() => searchValue);
    if (searchValue === "") {
      setListMaterials([...listAllMaterials]);
    } else {
      const result = listAllMaterials.filter((material) => {
        console.log(material.materialId.materialName.toLowerCase().includes(searchValue.toLowerCase()));
        console.log(material.materialId.materialName);
        console.log(searchValue);
        return material.materialId.materialName.toLowerCase().includes(searchValue.toLowerCase());
      });
      setListMaterials(result);
    }
  };

  const handleRemoveExpiredMaterial = () => {
    staffAxios
      .patch(apiRoutes.branches.removeExpiredMaterials(currentBranch), {
        materialId: selectedRemoveMaterial,
        removeWeight,
      })
      .then((response) => response.data)
      .then((response) => {
        console.log(response);
        getBranchMaterials();
        onCloseRemove();
      })
      .finally(() => {
        onCloseRemove();
        setRemoveWeight(0);
        setInInventoryWeight(0);
        setSelectedRemoveMaterial("");
      });
  };

  useEffect(() => {
    if (selectedRemoveMaterial) {
      const material = listAllMaterials.find((x) => x.materialId._id === selectedRemoveMaterial);
      setInInventoryWeight(material?.inventoryVolume || 0);
    }
  }, [selectedRemoveMaterial]);

  useEffect(() => {
    getBranchMaterials();
  }, []);

  return (
    <div className={"flex flex-col gap-4 rounded-xl border p-4 shadow-custom"}>
      <div className="flex items-center justify-between">
        <Input
          size="lg"
          variant="bordered"
          className="max-w-80"
          value={searchValue}
          onValueChange={(value) => handleSearch(value)}
          endContent={<BiSearchAlt size={iconSize.medium} className="text-dark/25" />}
          placeholder="Nhập tên nguyên liệu"
        />
        <Button color={"danger"} startContent={iconConfig.xMark.base} onClick={onOpenRemove}>
          Hủy nguyên liệu hư
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableColumn>Tên nguyên liệu</TableColumn>
          <TableColumn onClick={handleSort} className={"flex items-center justify-center gap-2 text-center"}>
            Tồn trong kho {MapSortIcon[currentSortMode]}
          </TableColumn>
          <TableColumn className={"text-center"}>Đơn vị tính</TableColumn>
          <TableColumn className={"text-center"}>Thao tác</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={
            isFetching ? <Loading /> : <p className={"italic"}>Không có nguyên liệu tồn trong kho</p>
          }
        >
          {listMaterials.map((material) => (
            <TableRow key={material.materialId._id}>
              <TableCell>{material.materialId.materialName}</TableCell>
              <TableCell className={"text-center"}>{material.inventoryVolume.toLocaleString()}</TableCell>
              <TableCell className={"text-center"}>{material.materialId.calUnit}</TableCell>
              <TableCell className={"text-center"}>
                <Button
                  isIconOnly={true}
                  color="secondary"
                  variant={"ghost"}
                  onClick={() => handleShowHistory(material.materialId._id)}
                >
                  {iconConfig.history.base}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal size={"xl"} isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Lịch sử thay đổi: {selectedMaterial?.materialId.materialName}
              </ModalHeader>
              <ModalBody>
                <Table className={"max-h-[80vh]"} isHeaderSticky>
                  <TableHeader>
                    <TableColumn>Số lượng thay đổi</TableColumn>
                    <TableColumn>Loại</TableColumn>
                    <TableColumn>Thời gian</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {currentSelectMaterial.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {row.weightChange > 0 && "+"} {row.weightChange.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip color={MapHistoryChangeTypeColor[row.type]} variant={"flat"}>
                            {MapHistoryChangeTypeText[row.type]}
                          </Chip>
                        </TableCell>
                        <TableCell>{formatDate(row.createdAt, "fullDate")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        size={"3xl"}
        isOpen={isOpenRemove}
        onClose={() => {
          setRemoveWeight(0);
          setInInventoryWeight(0);
          onCloseRemove();
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Hủy nguyên liệu</ModalHeader>
              <ModalBody>
                <div className={"flex flex-col gap-4"}>
                  <Select
                    label={"Chọn nguyên liệu cần hủy"}
                    labelPlacement={"outside"}
                    placeholder={"Chọn nguyên liệu"}
                    onSelectionChange={(value) => setSelectedRemoveMaterial(Array.from(value).toString())}
                  >
                    {listAllMaterials.map((material) => (
                      <SelectItem key={material.materialId._id}>
                        {material.materialId.materialName}
                      </SelectItem>
                    ))}
                  </Select>
                  <Divider />
                  <div className={"flex items-center gap-2"}>
                    <Input
                      label={"Số lượng còn trong kho"}
                      labelPlacement={"outside"}
                      value={inInventoryWeight.toString()}
                      isReadOnly={true}
                    />
                    <Input
                      label={"Số lượng cần hủy"}
                      labelPlacement={"outside"}
                      value={removeWeight.toString()}
                      onValueChange={(value) => setRemoveWeight(+value)}
                      isInvalid={removeWeight > inInventoryWeight}
                      errorMessage={
                        removeWeight > inInventoryWeight
                          ? "Số lượng hủy không được lớn hơn số lượng còn trong kho"
                          : ""
                      }
                      variant={"bordered"}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color={"danger"}
                  startContent={iconConfig.xMark.base}
                  onClick={handleRemoveExpiredMaterial}
                >
                  Xác nhận hủy nguyên liệu
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default MaterialsInventory;
