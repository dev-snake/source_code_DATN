import AdminHeader from "@/components/admin/admin-header";
import ModalConfirmDelete from "@/components/admin/modal-confirm-delete";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig, { iconSize } from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import textSizes from "@/config/styles/text-size";
import useAxios from "@/hooks/useAxios";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { IMaterialForm as IMaterial } from "@/types/material";
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { BiFilter, BiPlus, BiSearchAlt } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const NotificationManagement = () => {
  const navigate = useNavigate();
  const axiosClient = useAxios();
  const axiosStaff = useStaffAxios();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [idDelete, setIdDelete] = useState<string>("");
  const [listMaterials, setListMaterials] = useState<IMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<IMaterial[]>([]);
  const [metaData, setMetaData] = useState<IPaginationMetadata>();
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchMaterials = (page: number = 1) => {
    console.log(page);
    axiosClient
      .get<IAPIResponse<IMaterial[]>>(apiRoutes.materials.getAll, { params: { page } })
      .then((response) => response.data)
      .then((response) => {
        setListMaterials(response.results);
        setFilteredMaterials(response.results);
        console.log(response);
        setMetaData(response.metadata);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchMaterials(currentPage);
  }, [currentPage]);

  const handleDeleteMaterial = (onClose: () => void) => {
    onClose();
    axiosStaff
      .delete<IAPIResponse>(apiRoutes.materials.delete(idDelete))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          fetchMaterials(currentPage);
          toast.success(response.message);
          console.log(response);
        }
      })
      .catch((error) => console.log(error));
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (value === "") {
      setFilteredMaterials(listMaterials);
    } else {
      const filtered = listMaterials.filter((material) =>
        material.materialName.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredMaterials(filtered);
    }
  };

  // if (isLoading) return <Loading />;

  return (
    <WrapperContainer>
      <AdminHeader title="Quản lí nguyên liệu" refBack="" />
      <ModalConfirmDelete
        name="nguyên liệu"
        isOpen={isOpen}
        onClose={onOpenChange}
        onConfirm={() => handleDeleteMaterial(onOpenChange)}
      />

      <div className="flex justify-between">
        <Input
          size="lg"
          radius="md"
          variant="bordered"
          className="max-w-80"
          value={searchValue}
          onValueChange={handleSearchChange}
          endContent={<BiSearchAlt size={iconSize.medium} className="text-dark/25" />}
          placeholder="Nhập tên nguyên liệu"
        />
        <div className="flex items-center gap-x-4">
          <Button size="lg" startContent={<BiFilter size={iconSize.medium} />}>
            Bộ lọc
          </Button>
          <Button
            size="lg"
            color="primary"
            startContent={<BiPlus size={iconSize.medium} />}
            onClick={() => navigate(adminRoutes.materials.create)}
          >
            Thêm mới
          </Button>
        </div>
      </div>
      <Table
        aria-label="Table show all products"
        className="mt-4"
        removeWrapper
        bottomContent={
          <div className="mb-4 flex w-full justify-center">
            <Pagination
              showControls
              showShadow
              color="primary"
              page={currentPage}
              total={metaData?.totalPages as number}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>
        }
      >
        <TableHeader>
          <TableColumn>STT</TableColumn>
          <TableColumn>TÊN NGUYÊN LIỆU</TableColumn>
          <TableColumn>KIỂU NGUYÊN LIỆU</TableColumn>
          <TableColumn>ĐƠN VỊ </TableColumn>
          <TableColumn>HÀNH ĐỘNG</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"Không có nguyên liệu nào"}>
          {filteredMaterials.map((material, index) => (
            <TableRow key={index}>
              <TableCell className={textSizes.base}>{index + 1}</TableCell>
              <TableCell className={textSizes.base}>{material.materialName}</TableCell>
              <TableCell>
                <Chip size="sm" radius="md" variant="flat" color="primary">
                  {material.materialType === "baking-ingredient" ? "Nguyên liệu làm bánh" : "Phụ kiện"}
                </Chip>
              </TableCell>
              <TableCell className={textSizes.base}>{material.calUnit}</TableCell>
              <TableCell>
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly variant="light">
                      {iconConfig.threeDots.medium}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Static Actions">
                    <DropdownItem
                      key="new"
                      onClick={() => navigate(adminRoutes.materials.details(material._id as string))}
                    >
                      Xem chi tiết
                    </DropdownItem>
                    <DropdownItem
                      key="edit"
                      onClick={() => navigate(adminRoutes.materials.edit(material._id as string))}
                    >
                      Chỉnh sửa
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      variant="flat"
                      color="danger"
                      onPress={() => {
                        setIdDelete(material._id as string);
                        onOpen();
                      }}
                    >
                      Xóa
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </WrapperContainer>
  );
};

export default NotificationManagement;
