import SideBar from "@/components/partials/side-bar";
import adminRoutes from "@/config/routes/admin-routes.config";
import useWindowSize from "@/hooks/useWindowSize";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
const AdminLayout = () => {
  const { pathname } = useLocation();

  const { width } = useWindowSize();

  const [cookies] = useCookies(["staffRefreshToken", "staffAccessToken"]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!cookies.staffRefreshToken && !cookies.staffAccessToken && pathname.startsWith("/admin")) {
      navigate(adminRoutes.authStaff.signIn);
    }
    if (!pathname.split("/")[2]) {
      navigate(adminRoutes.cakes.root);
    }
  }, [pathname, cookies.staffRefreshToken, cookies.staffAccessToken, navigate]);

  if (width < 900) {
    return (
      <div className={"flex h-screen w-screen items-center justify-center"}>
        <h1>Vui lòng sử dụng màn hình lớn hơn 900px để truy cập trang web này</h1>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-12">
      <SideBar />
      <Outlet />
    </section>
  );
};

export default AdminLayout;
