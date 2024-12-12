import iconConfig from "@/config/icons/icon-config";
import textSizes from "@/config/styles/text-size";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Input,
} from "@nextui-org/react";
import WrapperContainer from "@/components/admin/wrapper-container";
import AdminHeader from "@/components/admin/admin-header";
const BranchOrders = () => {
  const navigate = useNavigate();
  return (
    <WrapperContainer>
      <AdminHeader title="Quản lí đơn hàng theo chi nhánh" />{" "}
      <div className="flex justify-between">
        <Input
          size="lg"
          variant="bordered"
          className="max-w-80"
          endContent={<div className="text-default-300">{iconConfig.search.medium}</div>}
          placeholder="Nhập tên sản phẩm"
        />
        <Button size="lg" startContent={iconConfig.filter.medium}>
          Bộ lọc
        </Button>
      </div>
      <Table
        aria-label="Example static collection table"
        removeWrapper
        className="mt-4"
        bottomContent={
          <div className="mb-4 flex w-full justify-center">
            <Pagination isCompact showControls showShadow color="primary" total={10} />
          </div>
        }
      >
        <TableHeader>
          <TableColumn>MÃ ĐƠN HÀNG</TableColumn>
          <TableColumn>NGƯỜI ĐẶT HÀNG</TableColumn>
          <TableColumn>NGÀY ĐẶT HÀNG</TableColumn>
          <TableColumn>TỔNG ĐƠN HÀNG</TableColumn>
          <TableColumn>PHƯƠNG THỨC THANH TOÁN</TableColumn>
          <TableColumn>CHI NHÁNH</TableColumn>
          <TableColumn>TRẠNG THÁI</TableColumn>
          <TableColumn>HÀNH ĐỘNG</TableColumn>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell className={textSizes.base}>#DeF12neas</TableCell>
              <TableCell className={textSizes.base}>Đặng Văn Hậu</TableCell>
              <TableCell className={textSizes.base}>15/09/2024 10:10:32</TableCell>
              <TableCell className={textSizes.base}>10.000.000 đ</TableCell>
              <TableCell className={textSizes.base}>Momo</TableCell>
              <TableCell className={textSizes.base}>TP.HCM</TableCell>
              <TableCell>
                <Chip color="warning" variant="flat">
                  Đang xử lí
                </Chip>
              </TableCell>
              <TableCell>
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly variant="light">
                      {iconConfig.threeDots.medium}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Static Actions">
                    <DropdownItem key="new">New file</DropdownItem>
                    <DropdownItem key="copy">Copy link</DropdownItem>
                    <DropdownItem key="edit">Edit file</DropdownItem>
                    <DropdownItem key="delete" className="text-danger" color="danger">
                      Delete file
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

export default BranchOrders;
