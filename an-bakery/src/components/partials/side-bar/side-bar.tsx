import logoAnbakery from "@/assets/images/WithSloganColorful.png";
import { iconSize } from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useRole from "@/hooks/useRole";
import useStaffAxios from "@/hooks/useStaffAxios";
import { LocalStorage } from "@/utils/storage-key";
import { Image, User } from "@nextui-org/react";
import clsx from "clsx";
import { useCookies } from "react-cookie";
import { BiLogOut } from "react-icons/bi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import menuList from "./menu";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import onlyNameAnBakery from "@/assets/images/OnlyNameColorful.png";
import { MapStaffRoleText } from "@/utils/map-data/staffs";

const SideBar = () => {
  const { pathname } = useLocation();

  const axiosStaff = useStaffAxios();
  const navigate = useNavigate();
  const [cookies, _, removeCookie] = useCookies(["staffAccessToken", "staffRefreshToken"]);

  const currentStaffRole = useRole();
  const currentBranch = useCurrentBranch();
  const { staffInfo } = LocalStorage.getStaffLocalStorage();

  const handleLogOut = () => {
    removeCookie("staffAccessToken", { path: "/", domain: "localhost" });
    removeCookie("staffRefreshToken", { path: "/", domain: "localhost" });
    LocalStorage.clearStaffLocalStorage();

    axiosStaff
      .post(apiRoutes.staffAuth.signOut)
      .then((response) => response.data)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        navigate(adminRoutes.authStaff.signIn);
      });
  };

  return (
    <aside
      className={clsx("flex min-h-screen flex-col gap-y-5 pb-5 shadow-xl xl:col-span-2", {
        "h-screen": currentStaffRole === 0,
      })}
    >
      <Link to={adminRoutes.cakes.root} className="flex justify-center">
        <Image src={logoAnbakery} className="w-[275px] p-4 max-2xl:hidden" />
        <Image src={onlyNameAnBakery} className="hidden w-[125px] p-4 max-2xl:block" />
      </Link>
      <div className="mx-auto h-max min-w-full px-2">
        <div className="flex flex-col gap-2">
          {currentStaffRole !== null &&
            menuList
              .filter((_v) => _v.minRequiredRole.includes(currentStaffRole))
              .map((menu, index) => (
                <div key={index}>
                  <Link to={menu.path}>
                    <div
                      className={clsx(
                        "flex items-center justify-center gap-4 rounded-lg py-4 text-dark/25 hover:cursor-pointer",
                        {
                          "bg-danger-50 text-primary": pathname.includes(menu.path),
                        },
                      )}
                      key={index}
                    >
                      <menu.icon size={iconSize.medium} />
                      <h5 className={clsx("w-40 truncate max-xl:hidden")}>{menu.label}</h5>
                    </div>
                  </Link>
                </div>
              ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-x-4 max-xl:hidden">
        <User
          name={staffInfo?.staffName}
          description={MapStaffRoleText[staffInfo?.role.toString() ?? ""]}
          avatarProps={{
            src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
          }}
        />
        <BiLogOut
          size={iconSize.medium}
          color="red"
          onClick={handleLogOut}
          className="hover:cursor-pointer"
        />
      </div>
      <div className="hidden justify-center pr-2 pt-5 max-xl:flex">
        <BiLogOut
          size={iconSize.medium}
          color="red"
          onClick={handleLogOut}
          className="hover:cursor-pointer"
        />
      </div>
    </aside>
  );
};

export default SideBar;
