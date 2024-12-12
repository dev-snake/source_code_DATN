import clientRoutes from "@/config/routes/client-routes.config";
import { LocalStorage } from "@/utils/storage-key";
import { ReactNode } from "react";
import { useCookies } from "react-cookie";
import { Navigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

const UnauthorizedClientRoutes = ({ children }: Props) => {
  const [cookies] = useCookies(["refreshToken"]);
  const redirectPath = LocalStorage.getRedirectPathSignIn();
  const { refreshToken } = cookies;

  if (refreshToken) {
    if (redirectPath) {
      LocalStorage.clearRedirectPathSignIn();
      return <Navigate to={redirectPath} replace={true} />;
    } else {
      return <Navigate to={clientRoutes.home} replace={true} />;
    }
  }

  return <>{children}</>;
};

export default UnauthorizedClientRoutes;
