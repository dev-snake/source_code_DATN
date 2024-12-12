import AdminHeader from "@/components/admin/admin-header";
import WrapperContainer from "@/components/admin/wrapper-container";

import BranchOrders from "./branch-orders";
import BranchProducts from "./branch-products";
import adminRoutes from "@/config/routes/admin-routes.config";
import { IBranch } from "../../../../types/branch";
import { useEffect, useState } from "react";
import useStaffAxios from "@/hooks/useStaffAxios";
import { apiRoutes } from "@/config/routes/api-routes.config";
import BranchInformation from "./branch-infor";
import { useNavigate, useParams } from "react-router-dom";
import { ICake } from "@/types/cake";
import { IAPIResponse } from "@/types/api-response";
import Loading from "@/components/admin/loading";
import { IStaff } from "@/types/staff";
import { Accordion, AccordionItem, Button } from "@nextui-org/react";
import BranchStaffs from "./branch-staffs";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useRole from "@/hooks/useRole";
import iconConfig from "@/config/icons/icon-config";

interface BracnhDetailsProps {
  refBack: string;
}

const BranchDetails = ({ refBack }: BracnhDetailsProps) => {
  const staffAxios = useStaffAxios();
  const navigate = useNavigate();

  const { branchId } = useParams();

  const currentBranch = useCurrentBranch();
  const currentStaffRole = useRole();

  const [branchInfo, setBranchInfo] = useState<IBranch>();
  const [businessProducts, setBusinessProducts] = useState<ICake[]>([]);
  const [listBranchOrders, setListBranchOrders] = useState([]);
  const [listStaffs, setListStaffs] = useState<IStaff[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  const getBranchInfo = (branchId: string) => {
    staffAxios
      .get(apiRoutes.branches.getBranchInfo(branchId))
      .then((response) => response.data)
      .then((response) => {
        setBranchInfo(response.results);
      });
  };

  const getBusinessProducts = (branchId: string) => {
    staffAxios
      .get(apiRoutes.branches.getBusinessProducts(branchId))
      .then((response) => response.data)
      .then((response) => {
        setBusinessProducts(response.results);
        console.log(response.results);
      });
  };

  const getBranchOrders = (branchId: string) => {
    staffAxios
      .get(`${apiRoutes.branches.getBranchOrders(branchId)}?limit=5`)
      .then((response) => response.data)
      .then((response) => {
        setListBranchOrders(response.results);
        console.log(response.results);
      });
  };

  const getBranchStaffs = (branchId: string) => {
    staffAxios
      .get<IAPIResponse<IStaff[]>>(apiRoutes.branches.staffs(branchId))
      .then((response) => response.data)
      .then((response) => {
        setListStaffs(response.results);
      });
  };

  useEffect(() => {
    if (!branchId) {
      if (!currentBranch) {
        return;
      }
    }

    Promise.all([
      getBranchInfo(branchId || currentBranch),
      getBusinessProducts(branchId || currentBranch),
      getBranchOrders(branchId || currentBranch),
      getBranchStaffs(branchId || currentBranch),
    ]).finally(() => setIsFetching(false));
  }, []);

  if (!branchInfo || !businessProducts || isFetching) {
    return <Loading></Loading>;
  }

  return (
    <WrapperContainer>
      <AdminHeader title="THÔNG TIN CHI NHÁNH" showBackButton={true} refBack={refBack} />
      <div className="grid gap-x-4 max-2xl:gap-y-4 2xl:grid-cols-2">
        <div className={"flex w-full flex-col gap-4"}>
          <BranchInformation branchInfo={branchInfo} numOfStaffs={listStaffs.length} />
          {currentStaffRole !== 2 && (
            <Button
              size={"lg"}
              color={"primary"}
              startContent={iconConfig.edit.base}
              onClick={() => navigate(adminRoutes.branchConfig.edit)}
            >
              Sửa thông tin chi nhánh
            </Button>
          )}
        </div>
        <div>
          <Accordion variant={"splitted"} defaultExpandedKeys={["business-products"]}>
            <AccordionItem
              key={"business-products"}
              title={<h5>Sản phẩm kinh doanh - {businessProducts.length} sản phẩm</h5>}
            >
              <BranchProducts businessProducts={businessProducts} />
            </AccordionItem>
            <AccordionItem key={"branch-orders"} title={<h5>Đơn hàng của chi nhánh</h5>}>
              <BranchOrders listBranchOrder={listBranchOrders} />
            </AccordionItem>
            <AccordionItem key={"staffs"} title={<h5>Danh sách nhân viên quản lí</h5>}>
              <BranchStaffs listStaffs={listStaffs} />
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </WrapperContainer>
  );
};

export default BranchDetails;
