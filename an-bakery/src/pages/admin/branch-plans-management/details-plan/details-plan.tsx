import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useStaffAxios from "@/hooks/useStaffAxios";
import { TableColumnsPlanDetail } from "@/pages/admin/branch-plans-management/details-plan/columns";

import { IAPIResponse } from "@/types/api-response";
import { IBranch, IBranchConfig } from "@/types/branch";
import { ICake, ICakeVariant } from "@/types/cake";
import { TSelectedVariant } from "@/types/cart";
import { IMaterial } from "@/types/material";
import { IPlan, TMaterialItem, TPlanStatus } from "@/types/plan";
import { PlanStatus, PlanStatusColor, PlanType, PlanTypeColor } from "@/types/plan-map";
import { IStaff } from "@/types/staff";
import { addCommas } from "@/utils/add-comma";
import { formatDate } from "@/utils/format-date";
import { MapStaffRoleText } from "@/utils/map-data/staffs";
import {
  Button,
  Chip,
  cn,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaHourglassStart, FaPause, FaPlay } from "react-icons/fa";
import { useParams } from "react-router-dom";

type ButtonConfig = {
  color: "warning" | "danger" | "success" | "default" | "primary" | "secondary";
  label: string;
  icon: JSX.Element;
  isDisabled?: boolean;
  onClick?: () => void;
};

const DetailsPlan = () => {
  const { id: planId } = useParams();
  const staffAxios = useStaffAxios();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const {
    isOpen: isOpenTotal,
    onOpen: onOpenTotal,
    onClose: onCloseTotal,
    onOpenChange: onOpenTotalChange,
  } = useDisclosure();

  const [planInfomation, setPlanInfomation] = useState<Partial<IPlan>>({
    planName: "",
    planDescription: "",
    planType: "",
    planActivated: {
      startDate: "",
      endDate: "",
    },
    planStatus: undefined,
    planDetails: [
      {
        cakeId: "",
        orderCount: 0,
        orderAmount: 0,
        currentInventory: 0,
        plannedProduction: 0,
        selectedVariants: [
          {
            itemKey: "",
            variantKey: "",
          },
        ],
        totalMaterials: [
          {
            materialId: "",
            quantity: 0,
          },
        ],
      },
    ],
  });
  const [branchConfig, setBranchConfig] = useState<Partial<IBranchConfig>>({
    branchDisplayName: "",
    branchAddress: "",
    branchContact: {
      branchOwnerName: "",
      branchPhoneNumber: "",
    },
  });
  const [creatorPlan, setCreatorPlan] = useState<Partial<IStaff>>({
    staffCode: "",
    staffName: "",
    role: undefined,
  });
  const [totalMaterials, setTotalMaterials] = useState<TMaterialItem[]>([]);
  const [selectedTotalMaterials, setselectedTotalMaterials] = useState<TMaterialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentPlan = (planId: string) => {
    if (!planId) return;
    staffAxios
      .get<IAPIResponse<IPlan>>(apiRoutes.plans.getOne(planId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          setPlanInfomation({
            planName: response.results.planName,
            planDescription: response.results.planDescription,
            planType: response.results.planType,
            planActivated: {
              startDate: response.results.planActivated.startDate,
              endDate: response.results.planActivated.endDate,
            },
            planStatus: response.results.planStatus,
            planDetails: response.results.planDetails,
          });
          const totalMaterialsUsage: TMaterialItem[] | undefined = response.results.planDetails.reduce(
            (acc, item) => {
              item.totalMaterials.forEach((material) => {
                const existingMaterial: TMaterialItem | undefined = acc.find(
                  (m: TMaterialItem) =>
                    (m.materialId as IMaterial)?._id.toString() ===
                    (material.materialId as IMaterial)?._id.toString(),
                );
                if (existingMaterial) {
                  existingMaterial.quantity += material.quantity;
                } else {
                  acc.push({ ...material });
                }
              });
              return acc;
            },
            [] as TMaterialItem[],
          );
          setTotalMaterials(totalMaterialsUsage as TMaterialItem[]);
          setBranchConfig((response.results.branchId as IBranch).branchConfig);
          const metadata = response.metadata as unknown as {
            planId: string;
            planName: string;
            staffInfo: Partial<IStaff>;
          };
          setCreatorPlan(metadata.staffInfo);
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (planId) getCurrentPlan(planId);
  }, [planId]);

  const handleChangePlanStatus = (planStatus: Partial<TPlanStatus>, totalMaterials: TMaterialItem[] = []) => {
    if (!planId) return;
    staffAxios
      .patch<IAPIResponse<IPlan>>(apiRoutes.plans.updateStatus(planId), {
        planStatus,
        totalMaterials,
      })
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          setPlanInfomation((prevState) => ({ ...prevState, planStatus: response.results.planStatus }));
        }
      })
      .finally(() => setIsLoading(false));
  };
  const handleShowSelectedVariant = (selectedVariants: TSelectedVariant[], cakeVariants: ICakeVariant[]) => {
    const nameOfVariants: string[] = [];
    selectedVariants.map((variant) => {
      return cakeVariants?.map((cakeVariant) => {
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

  if (isLoading) return <Loading />;

  const planButtonConfigs: { [key in Partial<keyof typeof PlanStatus>]: ButtonConfig } = {
    open: {
      color: "primary",
      label: PlanStatus.open,
      icon: <FaPlay />,
      onClick: () => handleChangePlanStatus("closed"),
    },
    closed: {
      color: "secondary",
      label: "Xác nhận sản xuất",
      icon: <FaHourglassStart />,
      onClick: () => handleChangePlanStatus("in_progress", totalMaterials),
    },
    pending: {
      color: "warning",
      label: PlanStatus.pending,
      icon: <FaPause />,
      onClick: () => handleChangePlanStatus("pending"),
    },
    in_progress: {
      color: "success",
      label: "Kết thúc sản xuất",
      icon: <FaPlay />,
      onClick: () => handleChangePlanStatus("completed"),
    },
    completed: {
      color: "primary",
      label: PlanStatus.completed,
      icon: <FaCheckCircle />,
      isDisabled: true,
    },
  };

  return (
    <WrapperContainer>
      <AdminHeader title="Chi tiết kế hoạch" refBack={adminRoutes.branchPlan.root} showBackButton={true} />
      <div className={"flex w-full flex-col gap-8"}>
        <div className={"grid w-full grid-cols-2 items-center gap-4"}>
          <div className="col-span-1 flex w-full flex-col gap-4 rounded-xl border p-4 shadow-custom">
            <h4 className={"w-full text-center font-bold text-primary"}>THÔNG TIN CHI NHÁNH</h4>
            <Input
              label={"Tên chi nhánh:"}
              labelPlacement={"outside-left"}
              size={"lg"}
              fullWidth={true}
              value={branchConfig.branchDisplayName}
              classNames={{ label: "text-base min-w-max", input: "w-full", mainWrapper: "w-full" }}
              isReadOnly={true}
            />
            <Input
              label={"Địa chỉ:"}
              labelPlacement={"outside-left"}
              size={"lg"}
              fullWidth={true}
              value={branchConfig.branchAddress}
              classNames={{ label: "text-base min-w-max", input: "w-full", mainWrapper: "w-full" }}
              isReadOnly={true}
            />
            <Input
              label={"Số điện thoại:"}
              labelPlacement={"outside-left"}
              size={"lg"}
              fullWidth={true}
              value={branchConfig.branchContact?.branchPhoneNumber}
              classNames={{ label: "text-base min-w-max", input: "w-full", mainWrapper: "w-full" }}
              isReadOnly={true}
            />
          </div>
          <div className="col-span-1 flex w-full flex-col gap-4 rounded-xl border p-4 shadow-custom">
            <h4 className={"w-full text-center font-bold text-primary"}>THÔNG TIN NGƯỜI TẠO</h4>
            <Input
              label={"Mã nhân viên:"}
              labelPlacement={"outside-left"}
              size={"lg"}
              fullWidth={true}
              value={creatorPlan?.staffCode}
              classNames={{ label: "text-base min-w-max", input: "w-full", mainWrapper: "w-full" }}
              isReadOnly={true}
            />
            <Input
              label={"Tên nhân viên:"}
              labelPlacement={"outside-left"}
              size={"lg"}
              fullWidth={true}
              value={creatorPlan?.staffName}
              classNames={{ label: "text-base min-w-max", input: "w-full", mainWrapper: "w-full" }}
              isReadOnly={true}
            />
            <Input
              label={"Vai trò:"}
              labelPlacement={"outside-left"}
              size={"lg"}
              fullWidth={true}
              value={MapStaffRoleText[creatorPlan?.role ?? ""]}
              classNames={{ label: "text-base min-w-max", input: "w-full", mainWrapper: "w-full" }}
              isReadOnly={true}
            />
          </div>
        </div>
        <div className={"flex w-full flex-col gap-4"}>
          <Table
            topContent={
              <div className={"flex w-full items-center justify-between"}>
                <div className="inline-flex flex-col 2xl:gap-2">
                  <h4 className={"font-bold text-primary"}>{planInfomation.planName}</h4>
                  <div className="inline-flex items-center gap-2">
                    <span className="font-semibold">
                      Từ ngày:{" "}
                      <time>{formatDate(planInfomation.planActivated?.startDate as string, "onlyDate")}</time>
                    </span>
                    <span className="font-semibold">
                      Đến ngày:{" "}
                      <time>{formatDate(planInfomation.planActivated?.endDate as string, "onlyDate")}</time>
                    </span>
                  </div>
                </div>
                <div className="inline-flex items-center 2xl:gap-1">
                  <p className="font-semibold">Loại kế hoạch:</p>
                  <Chip
                    variant="solid"
                    color={PlanTypeColor[planInfomation.planType as "day" | "week"]}
                    size="md"
                  >
                    {PlanType[planInfomation.planType as "day" | "week"]}
                  </Chip>
                </div>
              </div>
            }
            bottomContent={
              <div className={"flex w-full items-center justify-between gap-4 px-4 py-2"}>
                <div className={"flex items-center gap-2"}>
                  <p>Trạng thái kế hoạch:</p>
                  <Chip variant={"solid"} size="md" color={PlanStatusColor[planInfomation.planStatus!]}>
                    {PlanStatus[planInfomation.planStatus!]}
                  </Chip>
                </div>
                <div>
                  <Button radius="lg" variant="solid" color="secondary" onClick={onOpenTotal}>
                    Xem tổng nguyên liệu
                  </Button>
                </div>
              </div>
            }
            className="rounded-xl shadow-custom"
          >
            <TableHeader columns={TableColumnsPlanDetail}>
              {(column) => (
                <TableColumn key={column.key} className="text-center">
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody aria-label={"Bảng kế hoạch sản xuất"} emptyContent={"Kế hoạch hiện đang trống!"}>
              {planInfomation.planDetails && planInfomation.planDetails.length > 0
                ? planInfomation.planDetails.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className={"text-center"}>{index + 1}</TableCell>
                      <TableCell className={"text-center"}>
                        <div className="inline-flex flex-col">
                          {(item.cakeId as ICake)?.cakeName}
                          <span className="text-[12px]">
                            {handleShowSelectedVariant(
                              item.selectedVariants,
                              (item.cakeId as ICake)?.cakeVariants,
                            ) !== ""
                              ? `Biến thể: ${handleShowSelectedVariant(item.selectedVariants, (item.cakeId as ICake).cakeVariants)}`
                              : undefined}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className={"text-center"}>{item.orderCount}</TableCell>
                      <TableCell className={"text-center"}>{item.orderAmount}</TableCell>
                      <TableCell className={"text-center"}>{item.currentInventory}</TableCell>
                      <TableCell className={"text-center"}>{item.plannedProduction}</TableCell>
                      <TableCell className={"text-center"}>
                        <Button
                          isIconOnly
                          color={"secondary"}
                          variant={"ghost"}
                          onClick={() => {
                            onOpen();
                            setselectedTotalMaterials(item.totalMaterials);
                          }}
                        >
                          {iconConfig.details.base}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                : []}
            </TableBody>
          </Table>
          {Object.keys(PlanStatus).map((statusKey) => {
            const status = statusKey as keyof typeof PlanStatus;
            const buttonConfig = planButtonConfigs[status];
            return (
              <Button
                key={status}
                color={buttonConfig.color}
                onClick={buttonConfig.onClick}
                disabled={buttonConfig.isDisabled}
                className={cn({ hidden: planInfomation.planStatus !== status })}
              >
                {buttonConfig.icon} {buttonConfig.label}
              </Button>
            );
          })}
        </div>
      </div>
      <Modal size={"xl"} isOpen={isOpen} onOpenChange={onOpenChange} onClose={onClose}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Bảng tổng hợp nguyên liệu</ModalHeader>
              <ModalBody>
                <Table className={"max-h-[80vh]"} isHeaderSticky>
                  <TableHeader>
                    <TableColumn className="text-center">Tên nguyên liệu</TableColumn>
                    <TableColumn className="text-center">Đơn vị tính</TableColumn>
                    <TableColumn className="text-center">Số lượng sử dụng</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {selectedTotalMaterials.length > 0
                      ? selectedTotalMaterials.map((material, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-center">
                              {(material.materialId as IMaterial)?.materialName}
                            </TableCell>
                            <TableCell className="text-center">
                              {(material.materialId as IMaterial)?.calUnit}
                            </TableCell>
                            <TableCell className="text-center">{addCommas(material.quantity)}</TableCell>
                          </TableRow>
                        ))
                      : []}
                  </TableBody>
                </Table>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Đóng
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal size={"xl"} isOpen={isOpenTotal} onOpenChange={onOpenTotalChange} onClose={onCloseTotal}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Bảng tổng hợp nguyên liệu</ModalHeader>
              <ModalBody>
                <Table className={"max-h-[80vh]"} isHeaderSticky>
                  <TableHeader>
                    <TableColumn className="text-center">STT</TableColumn>
                    <TableColumn className="text-center">Tên nguyên liệu</TableColumn>
                    <TableColumn className="text-center">Đơn vị tính</TableColumn>
                    <TableColumn className="text-center">Số lượng sử dụng</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {totalMaterials.length > 0
                      ? totalMaterials.map((material, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-center">{index + 1}</TableCell>
                            <TableCell className="text-center">
                              {(material.materialId as IMaterial).materialName}
                            </TableCell>
                            <TableCell className="text-center">
                              {(material.materialId as IMaterial).calUnit}
                            </TableCell>
                            <TableCell className="text-center">{addCommas(material.quantity)}</TableCell>
                          </TableRow>
                        ))
                      : []}
                  </TableBody>
                </Table>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onCloseTotal}>
                  Đóng
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </WrapperContainer>
  );
};

export default DetailsPlan;
