import iconConfig from "@/config/icons/icon-config";
import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import BranchCart from "./branch-cart";
import clientRoutes from "@/config/routes/client-routes.config";

const Cart = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-[1280px] overflow-auto pt-8 max-lg:px-2">
      <div className="flex items-center justify-between">
        <h1 className="text-default-300">GIỎ HÀNG CỦA BẠN</h1>
        <Button
          startContent={iconConfig.back.base}
          color="secondary"
          size="lg"
          onClick={() => navigate(clientRoutes.cakes.root)}
        >
          Quay lại
        </Button>
      </div>
      <BranchCart />
    </div>
  );
};

export default Cart;
