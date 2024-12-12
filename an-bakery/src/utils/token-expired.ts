import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import adminRoutes from "@/config/routes/admin-routes.config";

const useHandleTokenExpiration = () => {
  const navigate = useNavigate();
  const [, removeCookie] = useCookies(["staffAccessToken", "staffRefreshToken"]);

  const handleTokenExpiration = (error: any) => {
    const { data } = error.response;
    if (data.message === "refreshToken has expired") {
      console.log("refreshToken has expired");
      removeCookie("staffAccessToken", { path: "/" });
      removeCookie("staffRefreshToken", { path: "/" });
      navigate(adminRoutes.authStaff.signIn);
    }
  };

  return handleTokenExpiration;
};

export default useHandleTokenExpiration;
