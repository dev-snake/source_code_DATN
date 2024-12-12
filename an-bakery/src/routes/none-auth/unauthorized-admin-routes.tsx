import adminRoutes from "@/config/routes/admin-routes.config";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import { ReactNode } from "react";
import { useCookies } from "react-cookie";
import { Navigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

const UnauthorizedAdminRoutes = ({ children }: Props) => {
  const [cookies] = useCookies(["staffRefreshToken"]);
  const currentBranch = useCurrentBranch();
  const { staffRefreshToken } = cookies;
  if (staffRefreshToken) {
    return <Navigate to={adminRoutes.dashboard} replace={true} />;
  }
  return <>{children}</>;
};

export default UnauthorizedAdminRoutes;
