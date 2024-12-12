import cake from "@/assets/images/seasonalcake2.png";
import Loading from "@/components/admin/loading";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useAxios from "@/hooks/useAxios";
import { IAPIResponse } from "@/types/api-response";
import { ICakeDetail, ICakeRecipe } from "@/types/cake";
import { Accordion, AccordionItem, Button, Chip, Image } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseInformation from "./base-information";
import OptionsList from "./options-list";
import { slugify } from "@/utils/slugify";
import { displayImage } from "@/utils/display-image";
import AdminHeader from "@/components/admin/admin-header";
import { toast } from "react-toastify";
import adminRoutes from "@/config/routes/admin-routes.config";

interface CakeDetailsProps {
  refBack: string;
}

const CakeDetails = ({ refBack }: CakeDetailsProps) => {
  const navigate = useNavigate();
  const { cakeId } = useParams();
  const [cakeInfo, setCakeInfo] = useState<ICakeDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const axiosClient = useAxios();

  const handleGetCakeDetails = (cakeId: string) => {
    axiosClient
      .get<IAPIResponse<ICakeDetail>>(apiRoutes.cakes.getOne(cakeId))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          setCakeInfo(response.results);
        }
      })
      .catch((error) => {
        const { data } = error.response;
        toast.error(data.message);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (cakeId) {
      handleGetCakeDetails(cakeId);
    }
  }, []);
  if (isLoading || !cakeInfo) return <Loading />;

  return (
    <WrapperContainer>
      <AdminHeader
        title="Thông tin sản phẩm"
        showBackButton={true}
        refBack={refBack}
        addOnElement={
          <Chip
            // variant={"flat"}
            startContent={iconConfig.dot.base}
            size="lg"
            color={!cakeInfo?.cakeInfo.isHide ? "success" : "danger"}
          >
            {!cakeInfo?.cakeInfo.isHide ? "Đang mở bán" : "Chưa mở bán"}
          </Chip>
        }
      />
      <div className={"flex w-full gap-4"}>
        <div className="flex w-full flex-col">
          {cakeInfo?.cakeInfo && (
            <BaseInformation
              cakeInfo={cakeInfo.cakeInfo}
              cakeProperties={cakeInfo.cakeProperties}
              cakeMedias={cakeInfo.cakeMedias}
            />
          )}
        </div>
        <div className="flex w-full flex-col">
          <Accordion variant={"splitted"}>
            <AccordionItem title={<h5>Các biến thể</h5>}>
              <OptionsList cakeVariants={cakeInfo.cakeVariants} />
            </AccordionItem>
            <AccordionItem
              title={
                <div className={"flex w-full items-center justify-between"}>
                  <h5>Công thức</h5>
                  <Button
                    color={"primary"}
                    variant={"flat"}
                    onClick={() => navigate(adminRoutes.cakeRecipe.details(cakeInfo.cakeRecipe._id))}
                  >
                    Xem công thức
                  </Button>
                </div>
              }
            ></AccordionItem>
          </Accordion>
        </div>
      </div>
    </WrapperContainer>
  );
};

export default CakeDetails;
