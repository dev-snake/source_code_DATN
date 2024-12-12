import { apiRoutes } from "@/config/routes/api-routes.config";
import { IAPIResponse } from "@/types/api-response";
import { AxiosInstance } from "axios";
import { toast } from "react-toastify";

const clearCart = ({ axiosCustomer }: { axiosCustomer: AxiosInstance }) => {
  axiosCustomer
    .delete<IAPIResponse>(apiRoutes.cart.resetCart)
    .then((response) => response.data)
    .then((response) => {
      if (response.status !== "success") return toast.error(response.message);
    })
    .catch((error) => console.log(error));
};
export default clearCart;
