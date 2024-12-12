import WrapperContainer from "@/components/admin/wrapper-container";
import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IBranchConfig, TBranchType } from "@/types/branch";
import { ICake } from "@/types/cake";
import { Time, getLocalTimeZone } from "@internationalized/date";
import { Button, Divider, Input, ScrollShadow, Select, SelectItem, TimeInput } from "@nextui-org/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateBranch = () => {
  const staffAxios = useStaffAxios();

  const navigate = useNavigate();

  const [listCakes, setListCakes] = useState<ICake[]>([]);

  const [branchConfig, setBranchConfig] = useState<IBranchConfig>({
    branchDisplayName: "",
    activeTime: {
      open: new Time(new Date().getHours(), new Date().getMinutes()).toString().slice(0, 5),
      close: new Time(new Date().getHours() + 8, new Date().getMinutes()).toString().slice(0, 5),
    },
    branchType: "direct",
    branchAddress: "",
    branchContact: {
      branchOwnerName: "",
      branchPhoneNumber: "",
    },
    mapLink: "",
  });

  const [businessProducts, setBusinessProducts] = useState<string[]>([]);

  const getListCakes = () => {
    staffAxios
      .get(`${apiRoutes.cakes.getAll}?noPagination=true`)
      .then((response) => response.data)
      .then((response) => {
        setListCakes(response.results);
      });
  };

  const handleSetActiveTime = (value: Time, time: "open" | "close") => {
    return setBranchConfig({
      ...branchConfig,
      activeTime: { ...branchConfig.activeTime, [time]: value.toString().slice(0, 5) },
    });
  };

  const handleBusinessProducts = (cakeId: string) => {
    if (businessProducts.includes(cakeId)) {
      setBusinessProducts(businessProducts.filter((id) => id !== cakeId));
    } else {
      setBusinessProducts([...businessProducts, cakeId]);
    }
  };

  const handleSelectAllCakes = () => {
    if (businessProducts.length === listCakes.length) {
      return setBusinessProducts([]);
    }
    setBusinessProducts(listCakes.map((cake) => cake._id));
  };

  const handleCreateBranch = () => {
    staffAxios
      .post(apiRoutes.branches.create, {
        branchConfig,
        businessProducts,
      })
      .then((response) => response.data)
      .then((response) => {
        navigate(adminRoutes.branch.details(response.results._id));
      });
  };

  useEffect(() => {
    getListCakes();
    console.log(branchConfig);
  }, []);

  return (
    <WrapperContainer>
      <AdminHeader title="Thêm chi nhánh mới" refBack={adminRoutes.branch.root} showBackButton={true} />
      <div className="grid gap-x-4 max-2xl:gap-y-4 2xl:grid-cols-2">
        {/* col1 */}
        <div className="flex w-full flex-col gap-4 max-2xl:order-2 2xl:order-1">
          <div className="rounded-2xl border p-4 shadow-custom">
            {branchConfig ? (
              <>
                <h5 className="mb-4">Thông tin chi nhánh</h5>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Input
                      label={"Tên chi nhánh"}
                      labelPlacement={"outside"}
                      placeholder={"Nhập tên chi nhánh"}
                      variant={"bordered"}
                      size={"lg"}
                      isRequired={true}
                      value={branchConfig.branchDisplayName}
                      onValueChange={(value) =>
                        setBranchConfig({
                          ...branchConfig,
                          branchDisplayName: value,
                        })
                      }
                    />
                  </div>
                  <div className="flex w-full items-center gap-8">
                    <div className={"flex w-max flex-col gap-2"}>
                      <p>Kiểu chi nhánh</p>
                      <Select
                        className={"min-w-40"}
                        variant={"bordered"}
                        selectedKeys={[branchConfig.branchType]}
                        onSelectionChange={(e) => {
                          setBranchConfig({
                            ...branchConfig,
                            branchType: Array.from(e).join("") as TBranchType,
                          });
                        }}
                      >
                        <SelectItem key={"direct"}>Trực tiếp</SelectItem>
                        <SelectItem key={"online"}>Trực tuyến</SelectItem>
                      </Select>
                    </div>
                    <div className={"flex w-max flex-col items-center gap-2"}>
                      <p>Thời gian hoạt động</p>
                      <div className={"flex w-full items-center gap-2"}>
                        <TimeInput
                          className={"w-max"}
                          aria-label={"Open Time"}
                          defaultValue={
                            new Time(
                              Number(branchConfig.activeTime.open.slice(0, 2)),
                              Number(branchConfig.activeTime.open.slice(3, 5)),
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
                          className={"w-max"}
                          aria-label={"Close Time"}
                          variant={"bordered"}
                          startContent={iconConfig.dot.base}
                          color={"danger"}
                          hourCycle={24}
                          size={"md"}
                          defaultValue={
                            new Time(
                              Number(branchConfig.activeTime.close.slice(0, 2)),
                              Number(branchConfig.activeTime.close.slice(3, 5)),
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
                      placeholder={"Nhập tên chủ chi nhánh"}
                      variant={"bordered"}
                      size={"lg"}
                      onValueChange={(value) =>
                        setBranchConfig({
                          ...branchConfig,
                          branchContact: {
                            ...branchConfig.branchContact,
                            branchOwnerName: value,
                          },
                        })
                      }
                      value={branchConfig.branchContact.branchOwnerName}
                    />
                    <Input
                      label={"Số điện thoại liên hệ"}
                      labelPlacement={"outside"}
                      placeholder={"Nhập số điện thoại liên hệ"}
                      variant={"bordered"}
                      size={"lg"}
                      onValueChange={(value) =>
                        setBranchConfig({
                          ...branchConfig,
                          branchContact: {
                            ...branchConfig.branchContact,
                            branchPhoneNumber: value,
                          },
                        })
                      }
                      value={branchConfig.branchContact.branchPhoneNumber}
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <Input
                      label={"Địa chỉ chi nhánh"}
                      labelPlacement={"outside"}
                      placeholder={"Nhập địa chỉ chi nhánh"}
                      variant={"bordered"}
                      size={"lg"}
                      onValueChange={(value) =>
                        setBranchConfig({
                          ...branchConfig,
                          branchAddress: value,
                        })
                      }
                      value={branchConfig.branchAddress}
                    />
                    <Input
                      label={"Link Map/Link Facebook"}
                      placeholder={"Nhập Link Map hoặc Link Facebook của chi nhánh"}
                      variant={"bordered"}
                      labelPlacement={"outside"}
                      size={"lg"}
                      onValueChange={(value) =>
                        setBranchConfig({
                          ...branchConfig,
                          mapLink: value,
                        })
                      }
                      value={branchConfig.mapLink}
                    />
                  </div>
                  <Button
                    size="lg"
                    color="primary"
                    startContent={iconConfig.add.base}
                    className="w-full"
                    onClick={handleCreateBranch}
                  >
                    Tạo chi nhánh mới
                  </Button>
                </div>
              </>
            ) : (
              <div className={"flex w-full items-center justify-center"}>
                <Loading></Loading>
              </div>
            )}
          </div>
        </div>
        {/* col2 */}
        <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom max-2xl:order-1 2xl:order-2">
          <div className={"flex items-center justify-between"}>
            <h5 className="">Chọn sản phẩm kinh doanh</h5>
            <h5>
              Đã chọn: <span className={"font-semibold text-primary"}>{businessProducts.length}</span> sản
              phẩm
            </h5>
          </div>
          <div>
            <Button
              startContent={iconConfig.listCheck.base}
              color={businessProducts.length === listCakes.length ? "primary" : "default"}
              onClick={handleSelectAllCakes}
            >
              Chọn tất cả
            </Button>
          </div>
          <ScrollShadow hideScrollBar className="grid max-h-[450px] grid-cols-4 gap-2 overflow-y-auto">
            {listCakes.map((cake) => (
              <div
                className={clsx("relative flex justify-center rounded-2xl border-2 p-6 text-center", {
                  "border-primary": businessProducts.includes(cake._id),
                })}
                key={cake._id}
                onClick={() => handleBusinessProducts(cake._id)}
              >
                <div>
                  <img
                    src={`http://localhost:3000/images/${cake._id}/${cake.cakeThumbnail}`}
                    alt="Error"
                    className="size-32 object-contain"
                  />
                  <p>{cake.cakeName}</p>
                </div>
              </div>
            ))}
          </ScrollShadow>
        </div>
      </div>
    </WrapperContainer>
  );
};

export default CreateBranch;
