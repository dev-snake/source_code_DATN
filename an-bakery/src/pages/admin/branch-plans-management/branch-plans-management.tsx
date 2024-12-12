import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import ModalConfirmDelete from "@/components/admin/modal-confirm-delete";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig, { iconSize } from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import textSizes from "@/config/styles/text-size";
import useStaffAxios from "@/hooks/useStaffAxios";
import { TableColumnsPlan } from "@/pages/admin/branch-plans-management/columns";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { IAPIResponseError } from "@/types/api-response-error";
import { IPlan } from "@/types/plan";
import { PlanStatus, PlanStatusColor, PlanType, PlanTypeColor } from "@/types/plan-map";
import { formatDate } from "@/utils/format-date";
import {
  Button,
  Chip,
  Input,
  Pagination,
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
import { AsyncListData, useAsyncList } from "@react-stately/data";
import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { BiPlus, BiSearchAlt } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PlanManagement = () => {
  const navigate = useNavigate();
  const axiosStaff = useStaffAxios();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [idDelete, setIdDelete] = useState<string>("");
  const [planList, setPlanList] = useState<IPlan[]>([]);
  const [allPlanList, setAllPlanList] = useState<IPlan[]>([]);
  const planRef = useRef<AsyncListData<IPlan>>();
  const [metadata, setMetadata] = useState<IPaginationMetadata>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentType, setCurrentType] = useState<string>("all");
  const [currentStatus, setCurrentStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const getPlanList = (noPagination: boolean = false) => {
    return axiosStaff
      .get<
        IAPIResponse<IPlan[]>
      >(apiRoutes.plans.getAll, { params: { page: currentPage, noPagination, planType: currentType === "all" ? undefined : currentType, planStatus: currentStatus === "all" ? undefined : currentStatus } })
      .then((response) => response.data);
  };

  const handleDeletePlan = (onClose: () => void) => {
    onClose();
    axiosStaff
      .delete<IAPIResponse<IPlan>>(apiRoutes.plans.delete(idDelete))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          setCurrentPage(1);
          toast.success(response.message);
          list.reload();
        }
      })
      .catch((error: AxiosError) => toast.error((error.response?.data as IAPIResponseError).message));
  };

  const handleSearchChange = (searchString: string) => {
    if (searchString === "") {
      if (planRef.current) {
        console.log("vao day ne no");
        planRef.current.items = allPlanList.slice(0, 10);
      }
      setPlanList(allPlanList.slice(0, 10));
      console.log("b", planRef.current);
    } else {
      const filtered = allPlanList.filter(
        (plan) =>
          plan.planName.toLowerCase().includes(searchString.toLowerCase()) ||
          plan.creatorId.toLowerCase().includes(searchString.toLowerCase()),
      );
      console.log("filterdd", filtered);
      if (planRef.current) {
        console.log("vao day ne");
        planRef.current.items = filtered;
      }
      console.log("a", planRef.current);
      setPlanList(filtered);
    }
    setSearchTerm(searchString);
  };

  useEffect(() => {
    list.reload();
  }, [currentPage, currentStatus, currentType]);

  const list: AsyncListData<IPlan> = useAsyncList({
    async load() {
      setIsLoading(true);
      const [plans, allPlans] = await Promise.all([getPlanList(), getPlanList(true)]);
      setIsLoading(false);
      setMetadata(plans.metadata);
      setAllPlanList(allPlans.results);
      const items = plans?.results || [];
      return {
        items,
      };
    },
    async sort({ items, sortDescriptor }) {
      const key = sortDescriptor.column as keyof IPlan;
      const sortedItems = [...items].sort((a, b) => {
        const first = a[key];
        const second = b[key];

        if (first === undefined || second === undefined) return first === undefined ? -1 : 1;
        const firstValue = typeof first === "string" ? parseInt(first) || first : first;
        const secondValue = typeof second === "string" ? parseInt(second) || second : second;

        const cmp = firstValue < secondValue ? -1 : 1;
        return sortDescriptor.direction === "descending" ? -cmp : cmp;
      });
      return { items: sortedItems };
    },
  });

  planRef.current = list;
  const data = searchTerm !== "" ? planList : planRef.current.items;

  return (
    <WrapperContainer>
      <AdminHeader title="Quản lí kế hoạch sản xuất" />
      <ModalConfirmDelete
        name="kế hoạch"
        isOpen={isOpen}
        onClose={onOpenChange}
        onConfirm={() => handleDeletePlan(onOpenChange)}
      />
      <div className={"flex flex-col gap-4"}>
        <div className="flex justify-between">
          <Input
            size="lg"
            variant="bordered"
            className="max-w-80"
            onValueChange={handleSearchChange}
            value={searchTerm}
            endContent={<BiSearchAlt size={iconSize.medium} className="text-dark/25" />}
            placeholder="Nhập tên kế hoạch | mã nhân viên"
          />
          <div className="flex items-center gap-x-4">
            <Pagination
              showControls
              showShadow
              color="primary"
              page={currentPage}
              total={metadata?.totalPages ?? 1}
              onChange={setCurrentPage}
              className={"min-w-max"}
            />

            <Select
              label={"Loại kế hoạch:"}
              labelPlacement={"outside-left"}
              selectedKeys={[currentType]}
              onSelectionChange={(e) => setCurrentType(Array.from(e).join(""))}
              classNames={{
                base: "items-center",
                mainWrapper: "min-w-48",
                label: "text-base min-w-max",
              }}
              size={"lg"}
              disallowEmptySelection={true}
            >
              <SelectItem key={"all"}>Tất cả</SelectItem>
              <SelectItem key={"day"}>{PlanType["day"]}</SelectItem>
              <SelectItem key={"week"}>{PlanType["week"]}</SelectItem>
            </Select>

            <Select
              label={"Trạng thái:"}
              labelPlacement={"outside-left"}
              selectedKeys={[currentStatus]}
              onSelectionChange={(e) => setCurrentStatus(Array.from(e).join(""))}
              classNames={{
                base: "items-center",
                mainWrapper: "min-w-48",
                label: "text-base min-w-max",
              }}
              size={"lg"}
              disallowEmptySelection={true}
            >
              <SelectItem key={"all"}>Tất cả</SelectItem>
              <SelectItem key={"open"}>{PlanStatus["open"]}</SelectItem>
              <SelectItem key={"closed"}>{PlanStatus["closed"]}</SelectItem>
              <SelectItem key={"pending"}>{PlanStatus["pending"]}</SelectItem>
              <SelectItem key={"in_progress"}>{PlanStatus["in_progress"]}</SelectItem>
              <SelectItem key={"completed"}>{PlanStatus["completed"]}</SelectItem>
            </Select>

            <Button
              className={"w-full"}
              size="lg"
              color="primary"
              startContent={<BiPlus size={iconSize.medium} />}
              onClick={() => navigate(adminRoutes.branchPlan.create)}
            >
              Thêm mới
            </Button>
          </div>
        </div>
        <Table
          aria-label="Table show all plans"
          className="min-h-[650px]"
          removeWrapper
          sortDescriptor={list.sortDescriptor}
          onSortChange={list.sort}
        >
          <TableHeader columns={TableColumnsPlan}>
            {(column) => (
              <TableColumn
                key={column.key}
                allowsSorting={column.allowSort}
                align={column.isCenter ? "center" : "start"}
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            emptyContent={
              isLoading ? <Loading /> : <p className={"italic"}>Chi nhánh chưa có kế hoạch nào</p>
            }
            className={"h-full"}
          >
            {data.map((plan, index) => (
              <TableRow key={index}>
                <TableCell className={textSizes.base}>{index + (currentPage - 1) * 10 + 1}</TableCell>
                <TableCell className={textSizes.base}>{plan.planName}</TableCell>
                <TableCell className={textSizes.base}>
                  <div className={"inline-flex items-center gap-2"}>
                    <Chip variant={"dot"} size="md" color={"success"} radius="sm">
                      {formatDate(plan.planActivated.startDate as string, "onlyDate")}
                    </Chip>
                    <Chip variant={"dot"} size="md" color={"danger"} radius="sm">
                      {formatDate(plan.planActivated.endDate as string, "onlyDate")}
                    </Chip>
                  </div>
                </TableCell>
                <TableCell className={textSizes.base}>
                  <Chip variant="solid" color={PlanTypeColor[plan.planType as "day" | "week"]} size="md">
                    {PlanType[plan.planType as "day" | "week"]}
                  </Chip>
                </TableCell>
                <TableCell className={textSizes.base}>
                  <Chip
                    variant={"solid"}
                    size="md"
                    color={
                      PlanStatusColor[
                        new Date(plan.planActivated.startDate as string).getDate() > new Date().getDate()
                          ? "pending"
                          : plan.planStatus!
                      ]
                    }
                  >
                    {
                      PlanStatus[
                        new Date(plan.planActivated.startDate as string).getDate() > new Date().getDate()
                          ? "pending"
                          : plan.planStatus!
                      ]
                    }
                  </Chip>
                </TableCell>
                <TableCell className={textSizes.base}>{plan.creatorId}</TableCell>
                <TableCell>
                  <div className={"flex items-center gap-1"}>
                    <Button
                      color={"secondary"}
                      isIconOnly
                      variant={"ghost"}
                      onClick={() => navigate(adminRoutes.branchPlan.details(plan._id as string))}
                    >
                      {iconConfig.details.base}
                    </Button>
                    <Button
                      color={"warning"}
                      isIconOnly
                      variant={"ghost"}
                      onClick={() => navigate(adminRoutes.branchPlan.edit(plan._id as string))}
                    >
                      {iconConfig.edit.base}
                    </Button>
                    <Button
                      color={"danger"}
                      isIconOnly
                      variant={"ghost"}
                      onClick={() => {
                        setIdDelete(plan._id as string);
                        onOpen();
                      }}
                    >
                      {iconConfig.delete.base}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </WrapperContainer>
  );
};

export default PlanManagement;
