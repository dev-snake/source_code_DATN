import iconConfig from "@/config/icons/icon-config";
import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
interface IPropsType {
  title: string;
  refBack?: string;
  showBackButton?: boolean;
  addOnElement?: JSX.Element;
}
const AdminHeader = ({ title, refBack = "", showBackButton = false, addOnElement }: IPropsType) => {
  const navigate = useNavigate();
  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="truncate py-4 uppercase text-default-300 max-lg:text-4xl">{title}</h1>
      <div className={"flex items-center gap-4"}>
        {addOnElement}
        {showBackButton && (
          <Button
            onClick={() => navigate(refBack)}
            size="lg"
            color="secondary"
            startContent={iconConfig.back.base}
          >
            Quay lại
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminHeader;
