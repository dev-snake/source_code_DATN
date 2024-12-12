import AdminHeader from "@/components/admin/admin-header";
import WrapperContainer from "@/components/admin/wrapper-container";

import adminRoutes from "@/config/routes/admin-routes.config";
import { Select, SelectItem, Button, Radio, RadioGroup, Input } from "@nextui-org/react";
import useStaffAxios from "@/hooks/useStaffAxios";
import { useState, useEffect } from "react";
import { IStaff } from "@/types/staff";
import { apiRoutes } from "@/config/routes/api-routes.config";
import { useParams } from "react-router-dom";
import { IBranch } from "@/types/branch";
import Loading from "@/components/admin/loading";
import { IAPIResponse } from "@/types/api-response";
import useRole from "@/hooks/useRole";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import { toast } from "react-toastify";

const EditStaff = () => {
  const { staffId } = useParams();

  const staffAxios = useStaffAxios();
  const currentBranch = useCurrentBranch();
  const currentStaffRole = useRole();

  const [staffInfo, setStaffInfo] = useState<IStaff>();
  const [currentBranchRef, setCurrentBranchRef] = useState<string | null>("");
  const [listBranches, setListBranches] = useState<IBranch[]>([]);

  const getStaffInfo = (staffId: string) => {
    staffAxios
      .get<IAPIResponse<IStaff>>(apiRoutes.staff.getStaffInfo(staffId))
      .then((response) => response.data)
      .then((response) => {
        setStaffInfo(response.results);
        setCurrentBranchRef(response.results.branchRef?._id ?? null);
      });
  };

  const getListBranch = () => {
    staffAxios
      .get(apiRoutes.branches.getAll)
      .then((response) => response.data)
      .then((response) => {
        setListBranches(response.results);
      });
  };

  const handleUpdateStaffRole = (staffId: string, newRole: string) => {
    if (staffInfo) {
      setStaffInfo({
        ...staffInfo,
        role: Number(newRole) as 0 | 1 | 2,
      });
    }

    staffAxios
      .post(apiRoutes.staff.changeRole(staffId), {
        newRole,
      })
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
        }
      })
      .catch((error) => {
        const { data } = error.response;
        toast.error(data.message);
      });
  };

  const handleJobQuit = (staffId: string) => {
    if (staffInfo) {
      setStaffInfo({
        ...staffInfo,
        isActive: false,
      });
    }

    staffAxios
      .delete(apiRoutes.staff.jobQuit(staffId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
        }
      })
      .catch((error) => {
        const { data } = error.response;
        toast.error(data.message);
      });
  };

  const handleActiveAccount = (staffId: string) => {
    if (staffInfo) {
      setStaffInfo({
        ...staffInfo,
        isActive: true,
      });
    }

    staffAxios
      .patch(apiRoutes.staff.active(staffId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
        }
      })
      .catch((error) => {
        const { data } = error.response;
        toast.error(data.message);
      });
  };

  const handleChangeBranch = (staffId: string, branchRef: string) => {
    if (staffInfo) {
      setCurrentBranchRef(branchRef);
    }

    staffAxios
      .patch(apiRoutes.staff.changeBranch(staffId), {
        newBranchRef: branchRef,
      })
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success(response.message);
        }
      })
      .catch((error) => {
        const { data } = error.response;
        toast.error(data.message);
      });
  };

  useEffect(() => {
    if (staffId) {
      getStaffInfo(staffId);
      getListBranch();
    }
  }, []);

  return (
    <WrapperContainer>
      <AdminHeader
        title="Cập nhật Tài khoản Nhân viên"
        showBackButton={true}
        refBack={adminRoutes.staff.root}
      />
      <div className="w-1/2">
        {staffInfo ? (
          <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom">
            <h5>Thông tin nhân viên</h5>
            <div className="flex items-center gap-4">
              <Input
                label={"Mã nhân viên"}
                labelPlacement={"outside"}
                size={"lg"}
                value={staffInfo.staffCode}
                isReadOnly={true}
              />
              <Input
                label={"Tên nhân viên"}
                labelPlacement={"outside"}
                size={"lg"}
                value={staffInfo.staffName}
                isReadOnly={true}
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className={"flex items-center gap-2"}>
                <p className={"min-w-max"}>Chi nhánh làm việc:</p>
                <Select
                  size="lg"
                  aria-label={"Chọn chi nhánh làm việc"}
                  items={listBranches}
                  selectedKeys={currentStaffRole === 2 ? [currentBranchRef] : [currentBranch]}
                  onSelectionChange={(e) => handleChangeBranch(staffInfo._id, Array.from(e).join(""))}
                  isDisabled={currentStaffRole !== 2}
                  variant={"bordered"}
                >
                  {(branch) => (
                    <SelectItem key={branch._id}>{branch.branchConfig.branchDisplayName}</SelectItem>
                  )}
                </Select>
              </div>
              <RadioGroup
                value={`${staffInfo.role}`}
                onValueChange={(value) => handleUpdateStaffRole(staffInfo._id as string, value)}
                orientation={"horizontal"}
                className={"min-w-max"}
                label={"Chức vụ:"}
                classNames={{
                  base: "flex flex-row items-center gap-2",
                  label: "text-dark",
                }}
              >
                <Radio value="0">Nhân viên</Radio>
                <Radio value="1">Quản lí chi nhánh</Radio>
                {currentStaffRole === 2 && <Radio value="2">Super Admin</Radio>}
              </RadioGroup>
            </div>
            <div>
              {staffInfo.isActive ? (
                <Button color={"danger"} onClick={() => handleJobQuit(staffInfo._id as string)}>
                  Khóa tài khoản
                </Button>
              ) : (
                <Button color={"success"} onClick={() => handleActiveAccount(staffInfo._id as string)}>
                  Kích hoạt lại tài khoản
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Loading></Loading>
        )}
      </div>
    </WrapperContainer>
  );
};

export default EditStaff;
