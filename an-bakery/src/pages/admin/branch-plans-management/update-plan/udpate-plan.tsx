import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse } from "@/types/api-response";
import { IPlan } from "@/types/plan";
import { PlanType } from "@/types/plan-map";
import { formatDate } from "@/utils/format-date";
import { CalendarDate, getLocalTimeZone, parseDate, today } from "@internationalized/date";
import {
  Button,
  DateInput,
  Divider,
  Input,
  RangeCalendar,
  Select,
  SelectItem,
  Textarea,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const UpdatePlan = () => {
  const { id: planId } = useParams();
  const staffAxios = useStaffAxios();
  const currentBranch = useCurrentBranch();
  const navigate = useNavigate();
  const [currentPlanType, setCurrentPlanType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [planInfomation, setPlanInfomation] = useState<Partial<IPlan>>({
    planName: "",
    planDescription: "",
    planType: "",
    planActivated: {
      startDate: "",
      endDate: "",
    },
    planStatus: "open",
  });

  const handleSetDate = (value: CalendarDate) => {
    const startDate = new Date(value.year, value.month - 1, value.day);
    const updatedNextDate = new Date(startDate);
    updatedNextDate.setDate(startDate.getDate() + 1);
    setPlanInfomation((prevPlanInfomation) => ({
      ...prevPlanInfomation,
      planActivated: {
        ...prevPlanInfomation.planActivated,
        startDate,
        endDate: updatedNextDate,
      },
    }));
  };
  const handleUpdatePlan = () => {
    if (!currentBranch || !planId) return;
    const payload: Partial<IPlan> = {
      ...planInfomation,
      planType: currentPlanType || planInfomation.planType,
      branchId: currentBranch,
    };
    if (Object.values(payload).includes("")) {
      return toast.error("Vui lòng điền đủ thông tin");
    }
    staffAxios
      .patch<IAPIResponse<IPlan>>(apiRoutes.plans.edit(planId), payload)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
          navigate(adminRoutes.branchPlan.root);
        }
      });
  };
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
          });
          setCurrentPlanType(response.results.planType);
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (planId) {
      getCurrentPlan(planId);
    }
  }, [planId]);

  if (isLoading) return <Loading />;

  return (
    <WrapperContainer>
      <AdminHeader title="Cập nhật kế hoạch" refBack={adminRoutes.branchPlan.root} showBackButton={true} />
      <div className="grid gap-x-4 max-2xl:gap-y-4 2xl:grid-cols-2">
        <div className="flex w-full flex-col gap-4 max-2xl:order-2 2xl:order-1">
          <div className="rounded-2xl border border-dark/25 p-4 shadow-custom">
            <h5 className="mb-4 w-max">Thông tin kế hoạch</h5>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Input
                  label={"Tên kế hoạch"}
                  labelPlacement={"outside"}
                  placeholder={"Nhập tên kế hoạch"}
                  variant={"bordered"}
                  size={"lg"}
                  isRequired
                  value={planInfomation.planName}
                  className="select-none"
                  onValueChange={(value) =>
                    setPlanInfomation({
                      ...planInfomation,
                      planName: value,
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="planDescription">Mô tả kế hoạch</label>
                <Textarea
                  id="planDescription"
                  size="lg"
                  variant={"bordered"}
                  placeholder="Nhập mô tả kế hoạch"
                  value={planInfomation.planDescription}
                  onValueChange={(value) =>
                    setPlanInfomation({
                      ...planInfomation,
                      planDescription: value,
                    })
                  }
                />
              </div>
              <Divider />
              <div className="flex items-start">
                <div className="flex w-40 flex-col gap-2">
                  <label htmlFor="planType">Kiểu kế hoạch</label>
                  <Select
                    isRequired
                    id="planType"
                    variant="flat"
                    placeholder="Kiểu kế hoạch"
                    selectedKeys={[currentPlanType]}
                    onSelectionChange={(keys) => setCurrentPlanType(Array.from(keys).join(""))}
                    disallowEmptySelection={true}
                  >
                    <SelectItem key={"day"}>{PlanType["day"]}</SelectItem>
                    <SelectItem key={"week"}>{PlanType["week"]}</SelectItem>
                  </Select>
                </div>
                {currentPlanType === "day" ? (
                  <div className="ml-8 flex w-full max-w-xs flex-col gap-2">
                    <label htmlFor="planActivated">Thời gian bắt đầu (hiện tại/kết thúc)</label>
                    <div className={"flex w-full items-center gap-2"}>
                      <DateInput
                        className="w-max"
                        aria-label="Open Date"
                        value={parseDate(
                          formatDate(planInfomation.planActivated?.startDate as string, "onlyDateReverse"),
                        )}
                        variant="bordered"
                        startContent={iconConfig.dot.base}
                        color="success"
                        hourCycle={24}
                        size="md"
                        onChange={handleSetDate}
                      />
                      <DateInput
                        className="w-max"
                        aria-label="End Date"
                        isReadOnly
                        value={parseDate(
                          formatDate(planInfomation.planActivated?.endDate as string, "onlyDateReverse"),
                        )}
                        variant="bordered"
                        startContent={iconConfig.dot.base}
                        color="danger"
                        hourCycle={24}
                        size="md"
                        onChange={handleSetDate}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={"ml-8 flex w-full max-w-xs flex-col gap-2"}>
                    <p>Thời gian hoạt động (tuần)</p>
                    <RangeCalendar
                      minValue={today(getLocalTimeZone())}
                      value={{
                        start: parseDate(
                          formatDate(planInfomation.planActivated?.startDate as string, "onlyDateReverse"),
                        ),
                        end: parseDate(
                          formatDate(planInfomation.planActivated?.endDate as string, "onlyDateReverse"),
                        ),
                      }}
                      color="secondary"
                      onChange={(e) => {
                        const startDate = new Date(e.start.toString());
                        const endDate = new Date(e.end.toString());
                        const timeDifference = endDate.getDate() - startDate.getDate();
                        if (timeDifference > 7) {
                          toast.warn("Thời gian không quá 1 tuần");
                          return;
                        }
                        setPlanInfomation({
                          ...planInfomation,
                          planActivated: {
                            startDate: e.start.toString(),
                            endDate: e.end.toString(),
                          },
                        });
                      }}
                    />
                  </div>
                )}
              </div>
              <Button
                size="lg"
                color="primary"
                startContent={iconConfig.add.base}
                className="w-full"
                onClick={handleUpdatePlan}
              >
                Cập nhật kế hoạch
              </Button>
            </div>
          </div>
        </div>
      </div>
    </WrapperContainer>
  );
};

export default UpdatePlan;
