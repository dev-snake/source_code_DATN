import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useRole from "@/hooks/useRole";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse } from "@/types/api-response";
import { IBranch, IBranchUpdateForm, TBranchType } from "@/types/branch";
import { ICake } from "@/types/cake";
import { Time } from "@internationalized/date";
import {
  Button,
  Chip,
  Divider,
  Input,
  ScrollShadow,
  Select,
  SelectItem,
  Switch,
  TimeInput,
} from "@nextui-org/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

interface EditBranchProps {
  refBack: string;
}

const EditBranch = ({ refBack }: EditBranchProps) => {
  const { branchId } = useParams();

  const currentBranch = useCurrentBranch();
  const currentRole = useRole();

  const staffAxios = useStaffAxios();

  const [branchData, setBranchData] = useState<IBranchUpdateForm>();
  const [branchBusinessProducts, setBranchBusinessProducts] = useState<string[]>([]);
  const [listCakes, setListCakes] = useState<ICake[]>([]);

  const getBranchInfo = (branchId: string) => {
    staffAxios
      .get<IAPIResponse<IBranch>>(apiRoutes.branches.getBranchInfo(branchId))
      .then((response) => response.data)
      .then((response) => {
        setBranchData({
          branchDisplayName: response.results.branchConfig.branchDisplayName,
          activeTime: response.results.branchConfig.activeTime,
          branchType: response.results.branchConfig.branchType,
          branchAddress: response.results.branchConfig.branchAddress,
          branchContact: response.results.branchConfig.branchContact,
          mapLink: response.results.branchConfig.mapLink,
          isActive: response.results.isActive,
        });
        setBranchBusinessProducts(response.results.businessProducts);
      });
  };

  const getBranchBusinessProducts = (branchId: string) => {
    staffAxios
      .get<IAPIResponse<ICake[]>>(apiRoutes.branches.getBusinessProducts(branchId))
      .then((response) => response.data)
      .then((response) => {
        console.log("🚀 ~ .then ~ response:", response.results);
      });
  };

  const getListCakes = () => {
    staffAxios
      .get(`${apiRoutes.cakes.getAll}?noPagination=true`)
      .then((response) => response.data)
      .then((response) => {
        setListCakes(response.results);
      });
  };

  const handleSetActiveTime = (value: Time, time: "open" | "close") => {
    if (branchData) {
      setBranchData({
        ...branchData,
        activeTime: {
          ...branchData.activeTime,
          [time]: value.toString().slice(0, 5),
        },
      });
    }
  };

  const handleBusinessProducts = (cakeId: string) => {
    if (branchBusinessProducts.includes(cakeId)) {
      setBranchBusinessProducts(branchBusinessProducts.filter((id) => id !== cakeId));
    } else {
      setBranchBusinessProducts([...branchBusinessProducts, cakeId]);
    }
  };

  const handleSelectAllCakes = () => {
    if (branchBusinessProducts.length === listCakes.length) {
      return setBranchBusinessProducts([]);
    }
    setBranchBusinessProducts(listCakes.map((cake) => cake._id));
  };

  const handleUpdateBranch = (branchId: string) => {
    // if (!branchData) return;

    // const updateData = branchData;

    delete branchData?.isActive;

    staffAxios
      .patch(apiRoutes.branches.updateBranchInfor(branchId), branchData)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success("Cập nhật thông tin chi nhánh thành công");
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error("Cập nhật thông tin chi nhánh thất bại");
      });
  };

  const handleToggleActiveBranch = (branchId: string, value: boolean) => {
    if (!branchData) return;

    setBranchData({
      ...branchData,
      isActive: value,
    });
    staffAxios
      .patch(apiRoutes.branches.visibility(branchId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success("Cập nhật trạng thái hoạt động thành công");
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error("Cập nhật trạng thái hoạt động thất bại");
      });
  };

  const handleUpdateBusinessProducts = (branchId: string) => {
    staffAxios
      .patch(apiRoutes.branches.updateBusinessProducts(branchId), {
        businessProducts: branchBusinessProducts,
      })
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success("Cập nhật sản phẩm kinh doanh thành công");
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error("Cập nhật sản phẩm kinh doanh thất bại");
      });
  };

  useEffect(() => {
    if (!branchId && !currentBranch) return;

    Promise.all([
      getListCakes(),
      getBranchInfo(branchId || currentBranch),
      getBranchBusinessProducts(branchId || currentBranch),
    ]);
  }, []);

  useEffect(() => {
    getListCakes();
  }, []);

  useEffect(() => {
    console.log(branchData?.isActive);
  }, [branchData]);

  if (!branchData || (!branchId && !currentBranch)) {
    return <Loading></Loading>;
  }

  return (
    <WrapperContainer>
      <AdminHeader title="Cập nhật thông tin chi nhánh " refBack={refBack} showBackButton={true} />
      <div className="grid max-2xl:gap-y-4 2xl:grid-cols-2 2xl:gap-x-4">
        <div className="flex w-full flex-col gap-2">
          <div className="rounded-2xl border p-4 shadow-custom">
            {branchData ? (
              <>
                <h5 className="mb-4">Thông tin chi nhánh</h5>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Input
                      label={"Tên chi nhánh"}
                      labelPlacement={"outside"}
                      size={"lg"}
                      variant={"bordered"}
                      isRequired={true}
                      value={branchData.branchDisplayName}
                      onValueChange={(value) =>
                        setBranchData({
                          ...branchData,
                          branchDisplayName: value,
                        })
                      }
                    />
                  </div>
                  <div className="grid w-full grid-cols-3 items-center justify-between gap-8">
                    <div className={"flex flex-col gap-2"}>
                      <p>Kiểu chi nhánh</p>
                      <Select
                        variant={"bordered"}
                        className={"min-w-40"}
                        selectedKeys={[branchData.branchType]}
                        onSelectionChange={(e) => {
                          setBranchData({
                            ...branchData,
                            branchType: Array.from(e).join("") as TBranchType,
                          });
                        }}
                      >
                        <SelectItem key={"direct"}>Trực tiếp</SelectItem>
                        <SelectItem key={"online"}>Trực tuyến</SelectItem>
                      </Select>
                    </div>
                    <div className={"flex flex-col gap-2"}>
                      <p>Trạng thái hoạt động</p>
                      <div className={"flex items-center gap-1"}>
                        <Switch
                          isSelected={branchData.isActive}
                          onValueChange={(value) =>
                            handleToggleActiveBranch(branchId || currentBranch, value)
                          }
                          color={"success"}
                        ></Switch>
                        <Chip color={branchData.isActive ? "success" : "danger"}>
                          {branchData.isActive ? "Hoạt động" : "Ngưng hoạt động"}
                        </Chip>
                      </div>
                    </div>
                    <div className={"flex flex-col items-center gap-2"}>
                      <p>Thời gian hoạt động</p>
                      <div className={"flex w-full items-center gap-2"}>
                        <TimeInput
                          className={"w-full"}
                          aria-label={"Open Time"}
                          defaultValue={
                            new Time(
                              Number(branchData.activeTime.open.slice(0, 2)),
                              Number(branchData.activeTime.open.slice(3, 5)),
                            )
                          }
                          variant={"bordered"}
                          startContent={iconConfig.dot.base}
                          color={"success"}
                          hourCycle={24}
                          size={"md"}
                          onChange={(value) => handleSetActiveTime(value, "open")}
                        />
                        <TimeInput
                          className={"w-full"}
                          aria-label={"Close Time"}
                          variant={"bordered"}
                          startContent={iconConfig.dot.base}
                          color={"danger"}
                          hourCycle={24}
                          size={"md"}
                          defaultValue={
                            new Time(
                              Number(branchData.activeTime.close.slice(0, 2)),
                              Number(branchData.activeTime.close.slice(3, 5)),
                            )
                          }
                          onChange={(value) => handleSetActiveTime(value, "close")}
                        />
                      </div>
                    </div>
                  </div>
                  <Divider />
                  <div className="flex items-center gap-4">
                    <Input
                      label={"Chủ chi nhánh"}
                      labelPlacement={"outside"}
                      size={"lg"}
                      variant={"bordered"}
                      onValueChange={(value) =>
                        setBranchData({
                          ...branchData,
                          branchContact: {
                            ...branchData.branchContact,
                            branchOwnerName: value,
                          },
                        })
                      }
                      value={branchData.branchContact.branchOwnerName}
                    />
                    <Input
                      label={"Số điện thoại liên hệ"}
                      labelPlacement={"outside"}
                      size={"lg"}
                      variant={"bordered"}
                      onValueChange={(value) =>
                        setBranchData({
                          ...branchData,
                          branchContact: {
                            ...branchData.branchContact,
                            branchPhoneNumber: value,
                          },
                        })
                      }
                      value={branchData.branchContact.branchPhoneNumber}
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <Input
                      label={"Địa chỉ chi nhánh"}
                      labelPlacement={"outside"}
                      size={"lg"}
                      variant={"bordered"}
                      onValueChange={(value) =>
                        setBranchData({
                          ...branchData,
                          branchAddress: value,
                        })
                      }
                      value={branchData.branchAddress}
                    />
                    <Input
                      label={"Link Map/Link Facebook"}
                      labelPlacement={"outside"}
                      size={"lg"}
                      variant={"bordered"}
                      onValueChange={(value) =>
                        setBranchData({
                          ...branchData,
                          mapLink: value,
                        })
                      }
                      value={branchData.mapLink}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className={"flex w-full items-center justify-center"}>
                <Loading></Loading>
              </div>
            )}
          </div>
          <Button
            size="lg"
            color="primary"
            startContent={iconConfig.edit.base}
            className="w-full"
            onClick={() => handleUpdateBranch(branchId || currentBranch)}
          >
            Cập nhật
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <div className={"flex max-h-[80vh] w-full flex-col gap-4 rounded-2xl border p-4 shadow-custom"}>
            <div className={"flex items-center justify-between"}>
              <h5>Chọn các sản phẩm kinh doanh trong chi nhánh</h5>
              <div className={"flex items-center gap-2"}>
                <h5>Đã chọn </h5>
                <h5 className={"text-primary"}>{branchBusinessProducts.length}</h5>
                <h5>sản phẩm</h5>
              </div>
            </div>
            <div>
              <Button
                startContent={iconConfig.listCheck.base}
                color={branchBusinessProducts.length === listCakes.length ? "primary" : "default"}
                onClick={handleSelectAllCakes}
              >
                Chọn tất cả
              </Button>
            </div>
            <ScrollShadow
              hideScrollBar={true}
              className="grid max-h-[450px] grid-cols-4 gap-2 overflow-y-auto"
            >
              {listCakes &&
                branchData &&
                listCakes.map((cakeData, index) => (
                  <div
                    className={clsx(
                      "relative flex flex-col items-center justify-center rounded-2xl border-2 p-4",
                      {
                        "border-primary": branchBusinessProducts?.includes(cakeData._id),
                        "border-default": !branchBusinessProducts?.includes(cakeData._id),
                      },
                    )}
                    onClick={() => handleBusinessProducts(cakeData._id)}
                    key={index}
                  >
                    <img
                      src={`http://localhost:3000/images/${cakeData._id}/${cakeData.cakeThumbnail}`}
                      alt="Error"
                      className="size-32"
                    />
                    <span>{cakeData.cakeName}</span>
                  </div>
                ))}
            </ScrollShadow>
          </div>
          <Button
            color={"primary"}
            onClick={() => handleUpdateBusinessProducts(branchId || currentBranch)}
            size={"lg"}
            startContent={iconConfig.edit.base}
          >
            Cập nhật sản phẩm kinh doanh
          </Button>
        </div>
      </div>
    </WrapperContainer>
  );
};

export default EditBranch;
