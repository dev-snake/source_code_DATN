import AdminHeader from "@/components/admin/admin-header";
import WrapperContainer from "@/components/admin/wrapper-container";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useStaffAxios from "@/hooks/useStaffAxios";
import { Chip, Image } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IStaff } from "../../../../types/staff";

import logoAnBakery from "@/assets/images/WithSloganColorful.png";
import { formatDate } from "@/utils/format-date";
import {
  MapStaffRoleColor,
  MapStaffRoleText,
  MapStaffStatusColor,
  MapStaffStatusText,
} from "@/utils/map-data/staffs";
import useRole from "@/hooks/useRole";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import { IAPIResponse } from "@/types/api-response";
import { toast } from "react-toastify";

const StaffDetails = () => {
  const { staffId } = useParams();

  const currentStaffRole = useRole();
  const currentBranch = useCurrentBranch();
  const navigate = useNavigate();
  const [staffInfo, setStaffInfo] = useState<IStaff>();

  const staffAxios = useStaffAxios();

  const getStaffInfo = (staffId: string) => {
    staffAxios

      .get<IAPIResponse<IStaff>>(apiRoutes.staff.getStaffInfo(staffId))
      .then((response) => response.data)
      .then((response) => {
        if (currentStaffRole !== 2 && response.results.branchRef !== currentBranch) {
          toast.error("Nhân viên này không thuộc chi nhánh bạn quản lí");
          return navigate(adminRoutes.staff.root);
        }
        setStaffInfo(response.results);
      });
  };

  useEffect(() => {
    if (!staffId) {
      return;
    }

    getStaffInfo(staffId);
  }, [staffId]);

  return (
    <WrapperContainer>
      <AdminHeader
        title="Thông tin chi tiết nhân viên"
        showBackButton={true}
        refBack={adminRoutes.staff.root}
      />
      <div className="grid xl:grid-cols-2">
        <div
          className={
            "w-[900px] rounded-2xl border bg-gradient-to-r from-primary/20 to-secondary/20 px-16 py-8 shadow-custom"
          }
        >
          <div className={"flex w-full flex-col items-center gap-8"}>
            <div className={"flex w-full justify-center"}>
              <Image src={logoAnBakery} alt={"image"} width={250} />
            </div>
            <h1 className={"title text-center text-primary"}>{staffInfo?.staffCode ?? "-"}</h1>
            <div className={"flex flex-col items-center gap-4"}>
              <h1 className={"text-center font-bold text-primary"}>{staffInfo?.staffName ?? "-"}</h1>
              <Chip color={MapStaffRoleColor[staffInfo?.role ?? "0"]} className={"italic"} size={"lg"}>
                {staffInfo ? MapStaffRoleText[staffInfo?.role] : "-"}
              </Chip>
            </div>
            <div className={"flex items-center gap-4"}>
              <p>
                Bắt đầu làm việc từ {staffInfo ? formatDate(staffInfo.workTime.joinDate, "onlyDate") : "-"}
              </p>
              {staffInfo && staffInfo.workTime.outDate && (
                <>
                  <small>|</small>
                  <small>{staffInfo ? formatDate(staffInfo.workTime.outDate, "onlyDate") : "-"}</small>
                </>
              )}
            </div>
            <Chip color={MapStaffStatusColor[staffInfo?.isActive.toString() ?? "false"]} size={"lg"}>
              {MapStaffStatusText[staffInfo?.isActive.toString() ?? "false"]}
            </Chip>
          </div>
        </div>
      </div>
    </WrapperContainer>
  );
};

export default StaffDetails;
