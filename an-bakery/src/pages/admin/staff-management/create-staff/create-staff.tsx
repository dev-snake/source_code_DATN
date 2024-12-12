import WrapperContainer from "@/components/admin/wrapper-container";
import AdminHeader from "@/components/admin/admin-header";
import adminRoutes from "@/config/routes/admin-routes.config";
import { Input, Select, SelectItem, DateInput, Switch, Button, Radio, RadioGroup } from "@nextui-org/react";
import iconConfig from "@/config/icons/icon-config";
import { INewStaff } from "../../../../types/staff";
import { useEffect, useState } from "react";
import { IBranch } from "@/types/branch";
import useStaffAxios from "@/hooks/useStaffAxios";
import { apiRoutes } from "@/config/routes/api-routes.config";
import { IAPIResponse } from "@/types/api-response";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useRole from "@/hooks/useRole";
import useCurrentBranch from "@/hooks/useCurrentBranch";

const CreateStaff = () => {
  const staffAxios = useStaffAxios();

  const currentStaffRole = useRole();
  const currentBranch = useCurrentBranch();

  const navigate = useNavigate();
  const [newStaffInfo, setNewStaffInfo] = useState<INewStaff>({
    staffCode: "",
    password: "",
    staffName: "",
    role: 0,
    branchRef: currentStaffRole !== 2 ? currentBranch : null,
  });

  const [listBranches, setListBranches] = useState<IBranch[]>([]);

  const getListBranch = () => {
    staffAxios
      .get(apiRoutes.branches.getAll)
      .then((response) => response.data)
      .then((response) => {
        setListBranches(response.results);
      });
  };

  const handleCreateNewAccount = () => {
    staffAxios
      .post<IAPIResponse<{ newStaffId: string }>>(apiRoutes.staffAuth.create, {
        ...newStaffInfo,
        staffCode: `ANB-${newStaffInfo.staffCode}`,
      })
      .then((response) => response.data)
      .then((response) => {
        navigate(adminRoutes.staff.details(response.results.newStaffId));
      })
      .catch((error) => {
        const { response } = error;
        toast.error(response.data.message);
      });
  };

  useEffect(() => {
    getListBranch();
  }, []);

  useEffect(() => {
    if (newStaffInfo.role === 2) {
      setNewStaffInfo((prevState) => ({
        ...prevState,
        branchRef: null,
      }));
    }
  }, [newStaffInfo]);

  return (
    <WrapperContainer>
      <AdminHeader title={"Tạo tài khoản nhân viên"} showBackButton={true} refBack={adminRoutes.staff.root} />
      <div className="flex w-1/2 flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom">
          <h5>Thông tin nhân viên</h5>
          <div className="flex gap-x-2">
            <Input
              label={"Tên nhân viên"}
              labelPlacement={"outside"}
              variant="bordered"
              size="lg"
              placeholder="Nhập tên nhân viên"
              value={newStaffInfo.staffName}
              onValueChange={(value) =>
                setNewStaffInfo({
                  ...newStaffInfo,
                  staffName: value,
                })
              }
            />
            <Input
              label={"Mã nhân viên"}
              labelPlacement={"outside"}
              variant="bordered"
              size="lg"
              placeholder="Nhập mã đăng nhập"
              value={newStaffInfo.staffCode}
              startContent={"ANB-"}
              max={4}
              errorMessage={newStaffInfo.staffCode.length > 8 ? "Mã code chỉ được có tối đa 12 ký tự" : ""}
              isInvalid={newStaffInfo.staffCode.length > 8}
              onValueChange={(value) =>
                setNewStaffInfo({
                  ...newStaffInfo,
                  staffCode: value,
                })
              }
            />
          </div>
          <Input
            label={"Mật khẩu"}
            labelPlacement={"outside"}
            variant={"bordered"}
            size={"lg"}
            type={"password"}
            placeholder={"Nhập mật khẩu"}
            value={newStaffInfo.password}
            onValueChange={(value) =>
              setNewStaffInfo({
                ...newStaffInfo,
                password: value,
              })
            }
          />
          <div className="flex flex-col gap-4">
            <div className={"flex items-center gap-2"}>
              <p className={"min-w-max"}>Chọn Chi nhánh làm việc:</p>
              <Select
                size="lg"
                aria-label={"Chọn chi nhánh làm việc"}
                items={listBranches}
                selectedKeys={[newStaffInfo?.branchRef ?? ""]}
                isDisabled={newStaffInfo.role === 2 || currentStaffRole !== 2}
                onSelectionChange={(e) =>
                  setNewStaffInfo({
                    ...newStaffInfo,
                    branchRef: Array.from(e).join(""),
                  })
                }
              >
                {(branch) => (
                  <SelectItem key={branch._id}>{branch.branchConfig.branchDisplayName}</SelectItem>
                )}
              </Select>
            </div>
            <div className={"flex items-center gap-2"}>
              <p className={"min-w-max"}>Chọn chức vụ:</p>
              <RadioGroup
                value={`${newStaffInfo.role}`}
                onValueChange={(value) =>
                  setNewStaffInfo({
                    ...newStaffInfo,
                    role: +value,
                  })
                }
                orientation={"horizontal"}
                className={"min-w-max"}
              >
                <Radio value="0">Nhân viên</Radio>
                <Radio value="1">Quản lí chi nhánh</Radio>
                {currentStaffRole === 2 && <Radio value="2">Super Admin</Radio>}
              </RadioGroup>
            </div>
          </div>
        </div>
        <Button
          color="primary"
          startContent={iconConfig.add.medium}
          size="lg"
          onClick={handleCreateNewAccount}
        >
          Tạo tài khoản nhân viên mới
        </Button>
      </div>
    </WrapperContainer>
  );
};

export default CreateStaff;
