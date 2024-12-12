import { baseURL } from "@/config/routes/api-routes.config";
import useCustomerRefreshToken from "@/hooks/useCustomerRefreshToken.ts";
import axios from "axios";
import { useEffect } from "react";
import { useCookies } from "react-cookie";

const useCustomerAxios = () => {
  const getRefreshToken = useCustomerRefreshToken();
  const [cookies] = useCookies(["accessToken"]);
  const axiosServer = axios.create({
    baseURL: baseURL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  useEffect(() => {
    const requestIntercept = axiosServer.interceptors.request.use(
      async (config) => {
        const accessToken = cookies.accessToken || (await getRefreshToken());
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseIntercept = axiosServer.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;
          const newAccessToken = await getRefreshToken();

          prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosServer(prevRequest);
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axiosServer.interceptors.request.eject(requestIntercept);
      axiosServer.interceptors.response.eject(responseIntercept);
    };
  }, [getRefreshToken]); // Add cookies and getRefreshToken to dependency array

  return axiosServer;
};

export default useCustomerAxios;
