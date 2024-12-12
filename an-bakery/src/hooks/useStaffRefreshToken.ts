import { AxiosError } from "axios";
import { useCookies } from "react-cookie";
import useAxios from "./useAxios";

const useStaffRefreshToken = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["staffRefreshToken", "staffAccessToken"]);
  const axiosClient = useAxios("staff");

  return async () => {
    const { staffRefreshToken } = cookies;
    if (staffRefreshToken) {
      try {
        const token = await axiosClient.get("/staff-auth/rftk");

        const newAccessToken = token.data.results;

        setCookie("staffAccessToken", newAccessToken, { path: "/", maxAge: 10 });
        return newAccessToken;
      } catch (error) {
        if ((error as AxiosError).status === 400) {
          removeCookie("staffRefreshToken", { path: "/", domain: "localhost" });
          removeCookie("staffAccessToken", { path: "/", domain: "localhost" });
          return null;
        }
      }
    } else {
      return null;
    }
  };
};

export default useStaffRefreshToken;
