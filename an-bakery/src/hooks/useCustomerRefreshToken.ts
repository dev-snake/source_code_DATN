import useAxios from "./useAxios";
import { useCookies } from "react-cookie";

const useCustomerRefreshToken = () => {
  const [cookies, setCookie] = useCookies(["refreshToken", "accessToken"]);
  const axiosClient = useAxios();

  return async () => {
    const { refreshToken } = cookies;
    if (refreshToken) {
      const token = await axiosClient.get("/auth/rftk");
      const newAccessToken = token.data.results;
      setCookie("accessToken", newAccessToken, { path: "/" });
      return newAccessToken;
    } else {
      return null;
    }
  };
};

export default useCustomerRefreshToken;
