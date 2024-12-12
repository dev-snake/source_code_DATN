import adminRoutes from "@/config/routes/admin-routes.config";
import { baseURL } from "@/config/routes/api-routes.config";
import useStaffRefreshToken from "@/hooks/useStaffRefreshToken.ts";
import axios from "axios";
import { useEffect } from "react";
import { useCookies } from "react-cookie";

const useStaffAxios = () => {
  const getRefreshToken = useStaffRefreshToken();
  const [cookies, , removeCookie] = useCookies(["staffRefreshToken", "staffAccessToken"]);

  const axiosStaffServer = axios.create({
    baseURL: baseURL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  useEffect(() => {
    const requestIntercept = axiosStaffServer.interceptors.request.use(
      async (config) => {
        const accessToken = cookies.staffAccessToken;
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseIntercept = axiosStaffServer.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error?.response?.status === 500 && error?.response?.data?.message === "jwt malformed") {
          removeCookie("staffRefreshToken", { path: "/", domain: "localhost" });
          removeCookie("staffAccessToken", { path: "/", domain: "localhost" });
          window.location.replace(adminRoutes.authStaff.signIn);
        }
        const prevRequest = error?.config;
        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;
          const newAccessToken = await getRefreshToken();
          prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosStaffServer(prevRequest);
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axiosStaffServer.interceptors.request.eject(requestIntercept);
      axiosStaffServer.interceptors.response.eject(responseIntercept);
    };
  }, [getRefreshToken]);

  return axiosStaffServer;
};

export default useStaffAxios;
