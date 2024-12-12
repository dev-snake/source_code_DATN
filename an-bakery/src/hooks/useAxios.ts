import { baseURL } from "@/config/routes/api-routes.config";
import axios from "axios";
import { useCookies } from "react-cookie";
const useAxios = (rftk: "customer" | "staff" = "customer") => {
  const [cookies] = useCookies(["refreshToken", "staffRefreshToken"]);
  const { refreshToken, staffRefreshToken } = cookies;
  const axiosClient = axios.create({
    baseURL: baseURL,
    headers: {
      "Content-Type": "application/json",
      "x-rftk": rftk === "customer" ? refreshToken : staffRefreshToken,
    },
    withCredentials: true,
  });

  return axiosClient;
};

export default useAxios;
