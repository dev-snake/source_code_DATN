import LoadingClient from "@/components/common/loading-client";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useCustomerAxios from "@/hooks/useCustomerAxios";
import OrderHistory from "@/pages/profile/order-history";
import { IAPIResponse } from "@/types/api-response";
import { ICustomer } from "@/types/customer";
import { Tab, Tabs } from "@nextui-org/react";
import { useEffect, useState } from "react";
import AddressList from "./address-list";
import CustomerInfor from "./customer-infor";
import FeedbackHistory from "./feedback-history";
import VipPoints from "./vip-points";
import { toast } from "react-toastify";

const Profile = () => {
  const customerAxios = useCustomerAxios();

  const [customerInfo, setCustomerInfo] = useState<ICustomer>();
  const [newUsername, setNewUsername] = useState<string>("");

  const [originalUsername, setOriginalUsername] = useState<string>("");
  const getCustomerInfo = () => {
    customerAxios
      .get<IAPIResponse<ICustomer>>(apiRoutes.customers.me.info)
      .then((response) => response.data)
      .then((response) => {
        setCustomerInfo(response.results);
        setOriginalUsername(response.results.userName);
        setNewUsername(response.results.userName);
      });
  };

  const handleChangeUsername = (newUsername: string) => {
    if (!newUsername || newUsername.length === 0) return toast.error("Vui lòng nhập tên hiển thị");
    if (newUsername.includes(" ")) {
      setCustomerInfo((prev) => prev && { ...prev, userName: originalUsername });
      setNewUsername(originalUsername);
      return toast.error("Cập nhật username thất bại !");
    }
    customerAxios
      .patch<IAPIResponse<ICustomer>>(apiRoutes.customers.me.info, { userName: newUsername })
      .then((response) => {
        if (response.data.status === "success") {
          toast.success("Cập nhật thông tin thành công");
          setCustomerInfo((prev) => prev && { ...prev, userName: newUsername });
        }
      });
  };

  useEffect(() => {
    getCustomerInfo();
  }, []);

  if (!customerInfo) return <LoadingClient />;

  return (
    <section className={"flex w-full justify-center"}>
      <div
        className={
          "mt-8 w-full max-w-7xl flex-col gap-y-4 max-sm:flex max-sm:px-2 sm:grid sm:gap-y-4 sm:px-4 lg:grid-cols-2 lg:gap-x-4"
        }
      >
        <div className={"flex flex-col gap-4"}>
          <CustomerInfor
            customerInfo={customerInfo}
            onChangeUsername={handleChangeUsername}
            newUsername={newUsername}
            setNewUsername={setNewUsername}
          />
          <AddressList customerAddress={customerInfo?.userAddresses} />
        </div>
        <div className="w-full rounded-2xl border p-4 shadow-custom">
          <Tabs aria-label="Tabs sizes" variant="solid">
            <Tab key="orders" title="Đơn hàng">
              <OrderHistory />
            </Tab>
            <Tab key="points" title="Điểm tích luỹ">
              <VipPoints customerPoints={customerInfo?.vipPoints} />
            </Tab>
            <Tab key="feebacks" title="Lịch sử đánh giá">
              <FeedbackHistory />
            </Tab>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default Profile;
