import AdminHeader from "@/components/admin/admin-header";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import textSizes from "@/config/styles/text-size";
import {
  Button,
  Chip,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

const OrdersStatus = () => {
  const navigate = useNavigate();
  return (
    <WrapperContainer>
      <AdminHeader title="Quản lí trạng thái đơn hàng chi nhánh" />
      <div className="flex justify-between">
        <Input
          size="lg"
          variant="bordered"
          className="max-w-80"
          endContent={<div className="text-default-300">{iconConfig.search.medium}</div>}
          placeholder="Nhập tên sản phẩm"
        />
        <div className="flex items-center gap-x-4">
          <Button size="lg" startContent={iconConfig.filter.medium}>
            Bộ lọc
          </Button>
          <Button
            size="lg"
            color="primary"
            startContent={iconConfig.add.medium}
            onClick={() => navigate("/")}
          >
            Thêm mới
          </Button>
        </div>
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
          <TableColumn>TRẠNG THÁI</TableColumn>
          <TableColumn>NGÀY ĐẶT HÀNG</TableColumn>

          <TableColumn>HÀNH ĐỘNG</TableColumn>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell className={textSizes.base}>#DeF12neas</TableCell>
              <TableCell className={textSizes.base}>Đặng Văn Hậu</TableCell>
              <TableCell>
                <Chip color="warning" variant="flat">
                  Đang xử lí
                </Chip>
              </TableCell>
              <TableCell className={textSizes.base}>15/09/2024 10:10:32</TableCell>

              <TableCell>
                <Button color="success" size="sm" startContent={iconConfig.edit.base}>
                  Lưu
                </Button>
                {/* <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly variant="light">
                      {iconConfig.dot.medium}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Static Actions">
                    <DropdownItem key="new">New file</DropdownItem>
                    <DropdownItem key="copy">Copy link</DropdownItem>
                    <DropdownItem key="edit">Edit file</DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                    >
                      Delete file
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown> */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </WrapperContainer>
  );
};

export default OrdersStatus;
