import textSizes from "@/config/styles/text-size";
import IconSuccess from "./icon/icon";
import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import clientRoutes from "@/config/routes/client-routes.config";
import Lottie from "react-lottie";
import orderSuccessLottie from "@/assets/lottie-gif-icon/order-success.json";
const OrderSuccess = () => {
  const navigate = useNavigate();
  return (
    <section>
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex max-w-64 items-center">
          <Lottie
            options={{
              loop: true,
              autoplay: true,
              animationData: orderSuccessLottie,
              rendererSettings: {
                preserveAspectRatio: "xMidYMid slice",
              },
            }}
          />
        </div>

        <h3 className="text-center">Đặt đơn hàng thành công</h3>

        <p className={`text-default-flat mb-8 text-center`}>Cảm ơn bạn đã mua hàng của chúng tôi</p>
        <div className="flex gap-x-4">
          <Button variant="bordered" size="lg" onClick={() => navigate(clientRoutes.profile.root)}>
            Xem đơn hàng
          </Button>
          <Button color="success" size="lg" onClick={() => navigate(clientRoutes.cakes.root)}>
            Tiếp tục mua hàng
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OrderSuccess;
