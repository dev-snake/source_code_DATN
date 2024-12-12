import iconConfig, { iconSize } from "@/config/icons/icon-config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useStaffAxios from "@/hooks/useStaffAxios";
import { TCakeHistoryChange, TCakeInventory } from "@/types/branch";
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { BiSearchAlt } from "react-icons/bi";
import { MapHistoryChangeTypeColor, MapHistoryChangeTypeText } from "../branch-inventory-management";
import { formatDate } from "@/utils/format-date";
import Loading from "@/components/admin/loading";
import { TSelectedVariant } from "@/types/cart";
import { ICakeVariant } from "@/types/cake";

interface CakesInventoryProps {
  currentBranch: string;
}

const CakesInventory = ({ currentBranch }: CakesInventoryProps) => {
  const staffAxios = useStaffAxios();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [searchValue, setSearchValue] = useState<string>("");
  const [listCakes, setListCakes] = useState<TCakeInventory[]>([]);
  const [listAllCakes, setListAllCakes] = useState<TCakeInventory[]>([]);
  const [currentSelectCake, setCurrentSelectCake] = useState<TCakeHistoryChange[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const getBranchCakes = () => {
    if (currentBranch) {
      staffAxios
        .get(apiRoutes.branches.getInventory(currentBranch, "cakes"))
        .then((response) => response.data)
        .then((response) => {
          setListCakes(response.results || []);
          setListAllCakes(response.results || []);
        })
        .catch((error) => {
          const { data } = error.response;
          setListCakes(data.results);
          setListAllCakes(data.results || []);
        })
        .finally(() => setIsFetching(false));
    }
  };

  const handleShowHistory = (cakeId: string, selectedVariants: TSelectedVariant[]) => {
    setCurrentSelectCake(
      listCakes.find(
        (cake) =>
          cake.cakeId._id === cakeId &&
          cake.selectedVariants.every((variant) =>
            selectedVariants.some(
              (cakeVariant) =>
                cakeVariant.variantKey.toString() === variant.variantKey.toString() &&
                cakeVariant.itemKey.toString() === variant.itemKey.toString(),
            ),
          ),
      )?.historyChange || [],
    );
    onOpen();
  };

  const handleShowSelectedVariant = (selectedVariants: TSelectedVariant[], cakeVariants: ICakeVariant[]) => {
    const nameOfVariants: string[] = [];
    selectedVariants.map((variant) => {
      return cakeVariants.map((cakeVariant) => {
        if (cakeVariant._id === variant.variantKey) {
          return cakeVariant.variantItems.map((variantItem) => {
            if (variantItem._id === variant.itemKey) {
              nameOfVariants.push(variantItem.itemLabel);
            }
          });
        }
      });
    });
    return nameOfVariants.join(" - ");
  };

  const handleSearch = (searchString: string) => {
    setSearchValue(searchString);
    if (searchString === "") {
      return setListCakes(listAllCakes);
    }

    setListCakes(
      listAllCakes.filter((cake) => cake.cakeId.cakeName.toLowerCase().includes(searchString.toLowerCase())),
    );
  };

  useEffect(() => {
    getBranchCakes();
  }, []);

  const LIMIT = 10;
  const OFFSET = (currentPage - 1) * LIMIT;
  const totalCakesInventory = Array.from(new Set([...listCakes]));
  const totalPagesCakesInventory = Math.ceil(totalCakesInventory.length / LIMIT);
  const paginatedData = totalCakesInventory.slice(OFFSET, OFFSET + LIMIT);

  return (
    <div className={"flex flex-col gap-4 rounded-xl border p-4 shadow-custom"}>
      <div className="flex justify-between">
        <Input
          size="lg"
          variant="bordered"
          className="max-w-80"
          value={searchValue}
          onValueChange={handleSearch}
          endContent={<BiSearchAlt size={iconSize.medium} className="text-dark/25" />}
          placeholder="Nhập tên bánh"
        />
      </div>
      <Table
        bottomContent={
          paginatedData.length !== 0 && (
            <div className="mb-4 flex w-full justify-center">
              <Pagination
                showControls
                showShadow
                color="primary"
                total={totalPagesCakesInventory}
                page={currentPage}
                onChange={setCurrentPage}
              />
            </div>
          )
        }
      >
        <TableHeader>
          <TableColumn>Tên bánh</TableColumn>
          <TableColumn>Tồn trong kho</TableColumn>
          <TableColumn>Thao tác</TableColumn>
        </TableHeader>
        <TableBody
          items={searchValue ? listCakes : paginatedData}
          emptyContent={isFetching ? <Loading /> : <p className={"italic"}>Không có bánh tồn trong kho</p>}
        >
          {(cake) => (
            <TableRow key={cake.cakeId._id}>
              <TableCell>
                <Tooltip
                  content={`Biến thể: ${handleShowSelectedVariant(cake.selectedVariants, cake.cakeId.cakeVariants)}`}
                  placement="top-start"
                >
                  <span>{cake.cakeId.cakeName}</span>
                </Tooltip>
              </TableCell>
              <TableCell>{cake.inventoryVolume} cái</TableCell>
              <TableCell>
                <Button
                  isIconOnly={true}
                  color="secondary"
                  variant="ghost"
                  onClick={() => handleShowHistory(cake.cakeId._id, cake.selectedVariants)}
                >
                  {iconConfig.history.base}
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal size={"xl"} isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Lịch sử thay đổi</ModalHeader>
              <ModalBody>
                <Table>
                  <TableHeader>
                    <TableColumn>Số lượng thay đổi</TableColumn>
                    <TableColumn>Loại</TableColumn>
                    <TableColumn>Thời gian</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {currentSelectCake.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {row.quantityChange > 0 && "+"}
                          {row.quantityChange}
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
    </div>
  );
};

export default CakesInventory;
