import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useRole from "@/hooks/useRole";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { ICustomer, TProvider } from "@/types/customer";
import { formatDate } from "@/utils/format-date";
import { MapProviderIcon } from "@/utils/map-data/customers";
import {
  Button,
  Chip,
  Input,
  Pagination,
  Select,
  SelectedItems,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const UsersManagement = () => {
  const navigate = useNavigate();
  const staffAxios = useStaffAxios();
  const currentStaffRole = useRole();

  const [listCustomers, setListCustomers] = useState<ICustomer[]>([]);
  const [listAllCustomers, setListAllCustomers] = useState<ICustomer[]>([]);
  const [metadata, setMetadata] = useState<IPaginationMetadata>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentStatusFilter, setCurrentStatusFilter] = useState<string>("all");
  const [currentProviderFilter, setCurrentProviderFilter] = useState<string>("all");

  const getListCustomers = (noPagination: boolean = false): Promise<IAPIResponse<ICustomer[]>> => {
    return staffAxios
      .get<IAPIResponse<ICustomer[]>>(apiRoutes.customers.getAll, {
        params: {
          page: currentPage,
          noPagination,
          isActive: currentStatusFilter === "all" ? undefined : currentStatusFilter,
          provider: currentProviderFilter === "all" ? undefined : currentProviderFilter,
        },
      })
      .then((response) => response.data);
  };

  const handleSearchCustomer = (searchString: string) => {
    if (searchString === "") {
      return setListCustomers(listAllCustomers.slice(0, 10));
    }
    const filtered = listAllCustomers.filter(
      (customer) =>
        customer.userName.toLowerCase().includes(searchString.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchString.toLowerCase()),
    );
    return setListCustomers(filtered);
  };

  useEffect(() => {
    if (currentStaffRole !== 2) {
      toast.error("Bạn không có quyền truy cập vào trang Quản lí Khách hàng");
      return navigate(adminRoutes.cakes.root);
    }

    setListCustomers([]);
    setListAllCustomers([]);
    setIsLoading(true);

    Promise.all([getListCustomers(), getListCustomers(true)])

      .then(([customers, allCustomers]) => {
        setListCustomers(customers.results);
        setListAllCustomers(allCustomers.results);
        setMetadata(customers.metadata);
      })
      .catch((error) => {
        const { data } = error.response;
        setListCustomers(data.results);
        setListAllCustomers(data.results);
        setMetadata(data.metadata);
      })
      .finally(() => setIsLoading(false));
  }, [currentPage, currentStatusFilter, currentProviderFilter]);

  return (
    <WrapperContainer>
      <AdminHeader title="Quản lí tài khoản khách hàng" />
      <div className="flex justify-between">
        <div className={"w-max"}>
          <Input
            aria-label={"Search customer"}
            size="lg"
            variant="bordered"
            className="min-w-96"
            endContent={<div className="text-dark/25">{iconConfig.search.medium}</div>}
            placeholder="Nhập Username / Email"
            onValueChange={handleSearchCustomer}
          />
        </div>
        <div className="flex min-w-max items-center gap-x-4">
          <Pagination
            showControls
            showShadow
            color="primary"
            total={metadata?.totalPages ?? 1}
            onChange={setCurrentPage}
            className={"w-full"}
          />

          <Select
            label={"Trạng thái tài khoản: "}
            labelPlacement={"outside-left"}
            classNames={{
              base: "flex items-center",
              label: "text-base min-w-max",
              trigger: "min-w-48",
            }}
            aria-label={"Select status filter"}
            selectedKeys={[currentStatusFilter?.toString()]}
            onSelectionChange={(e) => setCurrentStatusFilter(Array.from(e).join(""))}
            size={"lg"}
            disallowEmptySelection={true}
          >
            <SelectItem key={"all"}>Tất cả</SelectItem>
            <SelectItem key={"true"}>Đang hoạt động</SelectItem>
            <SelectItem key={"false"}>Bị khóa</SelectItem>
          </Select>

          <Select
            label={"Provider: "}
            labelPlacement={"outside-left"}
            classNames={{
              base: "flex items-center",
              label: "text-base min-w-max",
              trigger: "min-w-48",
            }}
            aria-label={"Select status filter"}
            selectedKeys={[currentProviderFilter?.toString()]}
            onSelectionChange={(e) => {
              setCurrentProviderFilter(Array.from(e).join(""));
            }}
            size={"lg"}
            disallowEmptySelection={true}
            renderValue={(items: SelectedItems) =>
              items.map((item) => (
                <div className={"flex items-center gap-2"} key={item.key}>
                  {MapProviderIcon[item.key as TProvider]}
                  {item.textValue}
                </div>
              ))
            }
          >
            <SelectItem key={"all"}>Tất cả</SelectItem>
            <SelectItem key={"google"} textValue={"Google"}>
              <div className={"flex items-center gap-2"}>
                {MapProviderIcon["google"]}
                Google
              </div>
            </SelectItem>
            <SelectItem key={"facebook"} textValue={"Facebook"}>
              <div className={"flex items-center gap-2"}>
                {MapProviderIcon["facebook"]}
                Facebook
              </div>
            </SelectItem>
            <SelectItem key={"credentials"} textValue={"Credentials"}>
              <div className={"flex items-center gap-2"}>
                {MapProviderIcon["credentials"]}
                Credentials
              </div>
            </SelectItem>
          </Select>
        </div>
      </div>
      <Table aria-label="Table show all customers" className="mt-4" removeWrapper>
        <TableHeader>
          <TableColumn className={"text-center"}>STT</TableColumn>
          <TableColumn>TÊN NGƯỜI DÙNG</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn className={"text-center"}>ĐIỂM TIÊU DÙNG</TableColumn>
          <TableColumn className={"hidden text-center xl:table-cell"}>NGÀY ĐĂNG KÍ</TableColumn>
          <TableColumn className={"hidden text-center 2xl:table-cell"}>HOẠT ĐỘNG GẦN NHẤT</TableColumn>
          <TableColumn className={"text-center"}>NGUỒN</TableColumn>
          <TableColumn className={"text-center"}>TRẠNG THÁI</TableColumn>
          <TableColumn className={"text-center"}>HÀNH ĐỘNG</TableColumn>
        </TableHeader>
        <TableBody
          aria-label="Table show all customers"
          emptyContent={isLoading ? <Loading /> : <p className={"italic"}>Chưa có khách hàng nào</p>}
        >
          {listCustomers.map((customer, index) => (
            <TableRow key={index}>
              <TableCell className={"text-center"}>{index + (currentPage - 1) * 10 + 1}</TableCell>
              <TableCell>{customer.userName}</TableCell>
              <TableCell className={`overflow-hidden`}>
                <span className="block w-full truncate max-lg:w-16">{customer.email}</span>
              </TableCell>
              <TableCell className={"text-center"}>
                <h6>{customer.vipPoints.currentPoint.toLocaleString("vi-VN")}</h6>
              </TableCell>
              <TableCell className={"hidden text-center xl:table-cell"}>
                {formatDate(customer.createdAt)}
              </TableCell>
              <TableCell className={"hidden text-center 2xl:table-cell"}>
                {formatDate(customer.updatedAt)}
              </TableCell>
              <TableCell className={"text-center"}>
                <div className={"flex justify-center"}>{MapProviderIcon[customer.provider]}</div>
              </TableCell>
              <TableCell className={"text-center"}>
                {customer.isActive ? (
                  <Chip color="success" variant="flat">
                    Đang hoạt động
                  </Chip>
                ) : (
                  <Chip color="danger" variant="flat">
                    Đang bị khóa
                  </Chip>
                )}
              </TableCell>

              <TableCell className={"text-center"}>
                <Button
                  onClick={() => navigate(adminRoutes.customer.details(customer._id))}
                  startContent={iconConfig.details.base}
                  isIconOnly={true}
                  color={"secondary"}
                  variant={"ghost"}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </WrapperContainer>
  );
};

export default UsersManagement;
