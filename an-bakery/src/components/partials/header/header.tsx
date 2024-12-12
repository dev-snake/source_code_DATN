import logo from "@/assets/images/logo.png";
import iconConfig from "@/config/icons/icon-config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import clientRoutes from "@/config/routes/client-routes.config";
import useAxios from "@/hooks/useAxios";
import useCart from "@/hooks/useCart";
import useCustomerAxios from "@/hooks/useCustomerAxios";
import useWindowSize from "@/hooks/useWindowSize";
import { IAPIResponse } from "@/types/api-response";
import { IAPIResponseError } from "@/types/api-response-error";
import { ICake } from "@/types/cake";
import { displayImage } from "@/utils/display-image";
import { formatCurrencyVND } from "@/utils/money-format";
import { LocalStorage } from "@/utils/storage-key";
import { Badge, Button, cn, Image, Input, Spinner } from "@nextui-org/react";
import { AxiosError } from "axios";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { BiSolidCart } from "react-icons/bi";
import { FaRightToBracket } from "react-icons/fa6";
import { Link, matchPath, NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Header = () => {
  const axiosCustomer = useCustomerAxios();
  const axiosClient = useAxios();
  const { cartCustomer } = useCart();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchResult, setSearchResult] = useState<ICake[]>([]);
  const [isShowSearch, setIsShowSearch] = useState<boolean>(false);
  const isLoadingRef = useRef<boolean | null>(null);
  const { pathname } = useLocation();
  const [cookies, setCookie, removeCookie] = useCookies([
    "accessToken",
    "refreshToken",
    "isLogin",
    "totalQuantity",
  ]);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const paths: string[] = ["/cart", "/order-steps", "/profile/order/:orderId"];
  const isMatchPath: boolean = paths.some((path) => matchPath(path, pathname));
  const { width, height } = useWindowSize();

  const handleSearch = () => {
    if (searchInput === "") {
      return setSearchResult([]);
    }
    isLoadingRef.current = true;
    axiosClient
      .get<IAPIResponse<ICake[]>>(apiRoutes.cakes.getAll + "?noPagination=true")
      .then((res) => res.data)
      .then((res) => {
        const filtered = res.results.filter((cake) =>
          cake.cakeName.toLowerCase().includes(searchInput.toLowerCase()),
        );
        setSearchResult(filtered);
      })
      .catch((error) => console.log(error))
      .finally(() => {
        isLoadingRef.current = false;
      });
  };

  useEffect(() => {
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#popup-search")) {
        if (searchInput.length === 0) {
          return setIsShowSearch(false);
        }
      } else {
        return setIsShowSearch(true);
      }
    };
    document.body.addEventListener("click", handleClick);
    return () => {
      document.body.removeEventListener("click", handleClick);
    };
  }, [searchInput]);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      setIsShowSearch(false);
    });
    setIsShowSearch(false);
  }, [pathname]);
  useEffect(() => {
    if (cookies.refreshToken && typeof cookies.refreshToken === "string") {
      const totalQuantity = cartCustomer.reduce(
        (total, item) => total + item.cartItems.reduce((total, item) => total + item.quantity, 0),
        0,
      );
      setCookie("totalQuantity", totalQuantity, { path: "/", domain: "localhost" });
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  }, [cookies.refreshToken, cookies.isLogin]);
  const handleLogout = async () => {
    try {
      const { data } = await axiosCustomer.get<IAPIResponse>(apiRoutes.auth.signOut);
      if (data.status === "success") {
        removeCookie("accessToken", { path: "/", domain: "localhost" });
        removeCookie("refreshToken", { path: "/", domain: "localhost" });
        removeCookie("isLogin", { path: "/", domain: "localhost" });
        removeCookie("totalQuantity", { path: "/", domain: "localhost" });
        LocalStorage.clearCustomerLocalStorage();
        LocalStorage.clearRedirectPathSignIn();
        setIsLogin(false);
        navigate(clientRoutes.auth.signIn);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignIn = () => {
    LocalStorage.saveRedirectPathSignIn(pathname);
    navigate(clientRoutes.auth.signIn);
  };
  const handleRedirectToCart = () => {
    console.log("redirect to cart !");
    // navigate(clientRoutes.cart.root)
    axiosCustomer
      .get<IAPIResponse>(apiRoutes.customers.me.cart)
      .then((resposne) => resposne.data)
      .then((response) => navigate(clientRoutes.cart.root))
      .catch((error) => {
        if (error instanceof AxiosError) {
          const responseError = error.response?.data as IAPIResponseError;
          if (responseError && responseError.status === "error") {
            toast.error("Vui lòng đăng nhập để xem giỏ hàng", { autoClose: 2000 });
            navigate(clientRoutes.auth.signIn);
          } else {
            toast.error("Đã có lỗi xảy ra", { autoClose: 2000 });
          }
        } else {
          toast.error("Đã có lỗi xảy ra", { autoClose: 2000 });
        }
      });
  };
  return (
    <header className={clsx("w-full", { "shadow-sm": width >= 1300 })}>
      <nav
        className={clsx(
          "relative mx-auto flex items-center justify-between py-4 max-xl:px-2 max-lg:px-6 max-sm:px-2",
          {
            "w-[1280px] shadow-sm": isMatchPath && width < 1300,
            "max-w-7xl": width >= 1300,
          },
        )}
      >
        <div>
          <NavLink
            to="cakes"
            className={({ isActive }) =>
              cn("mr-8 w-full truncate text-lg leading-7", isActive ? "text-primary" : "text-inherit")
            }
          >
            Menu bánh
          </NavLink>
          <NavLink
            to="vouchers"
            className={({ isActive }) =>
              cn(
                "mr-8 w-full truncate text-lg leading-7 max-md:hidden",
                isActive ? "text-primary" : "text-inherit",
              )
            }
          >
            Khuyến mãi
          </NavLink>
        </div>
        <Link to={"/"}>
          <Image
            alt="logo"
            src={logo}
            className={clsx("w-[250px]", { "max-lg:max-w-56 max-sm:hidden": !paths.includes(pathname) })}
          />
        </Link>
        <div className="flex gap-x-2">
          {isLogin ? (
            <>
              <Button
                variant="light"
                size="md"
                radius="full"
                color="danger"
                startContent={<FaRightToBracket />}
                onClick={handleLogout}
                isIconOnly={width < 900}
              >
                <span className="max-[900px]:hidden">Đăng xuất</span>
              </Button>
              <Button
                variant="flat"
                size="md"
                radius="full"
                color="primary"
                startContent={iconConfig.user.small}
                onClick={() => navigate(clientRoutes.profile.root)}
              >
                Hồ sơ
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="light"
                size="md"
                radius="full"
                color="primary"
                onClick={() => navigate(clientRoutes.auth.signUp)}
              >
                Đăng kí
              </Button>
              <Button
                radius="full"
                variant="flat"
                color="primary"
                size="md"
                startContent={<FaRightToBracket />}
                onClick={handleSignIn}
              >
                Đăng Nhập
              </Button>
            </>
          )}
          <Button
            size="md"
            radius="full"
            color={isShowSearch ? "danger" : "primary"}
            isIconOnly
            variant="flat"
            startContent={isShowSearch ? iconConfig.xMark.base : iconConfig.search.base}
            onClick={() => {
              if (!isShowSearch) {
                setSearchInput("");
                isLoadingRef.current = null;
                setSearchResult([]);
              }
              return setIsShowSearch(!isShowSearch);
            }}
          />
          <Badge
            content={cookies.totalQuantity || 0}
            color="primary"
            size="md"
            shape="circle"
            placement="top-right"
          >
            <Button
              variant="flat"
              size="md"
              radius="full"
              color="primary"
              startContent={<BiSolidCart size={16} />}
              onClick={() => handleRedirectToCart()}
              isIconOnly
            />
          </Badge>
        </div>
      </nav>
      <div className="relative z-[1000] mx-auto w-full max-w-[1280px] bg-black">
        {isShowSearch && (
          <div
            className="absolute right-0 z-50 w-full max-w-[500px] animate-appearance-in rounded-lg border bg-white p-4 shadow-custom"
            id="popup-search"
          >
            <Input
              id="input-search"
              value={searchInput}
              onValueChange={(value) => {
                setSearchInput(value);
                if (value.trim() === "") {
                  return setSearchResult([]);
                }
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              color="primary"
              variant="underlined"
              radius="sm"
              size="lg"
              placeholder="Nhập tên sản phẩm muốn tìm"
              endContent={
                <Button isIconOnly color="primary" size="sm" radius="lg" onClick={handleSearch}>
                  {iconConfig.search.base}
                </Button>
              }
            />
            <div>
              <p className="mt-4 text-lg font-semibold">Gợi ý tìm kiếm</p>
              <div className="w-scrollbar mt-4 flex max-h-96 w-full flex-col overflow-y-auto">
                {isLoadingRef.current === null ? (
                  <p className="text-center italic text-default-300">Nhập tên sản phẩm muốn tìm kiếm</p>
                ) : isLoadingRef.current ? (
                  <Spinner color="primary" />
                ) : searchResult.length > 0 ? (
                  searchResult.map((_, index) => (
                    <div className="flex items-center justify-between gap-x-4 px-2" key={index}>
                      <div className="flex items-center gap-x-4">
                        <Image src={displayImage(_.cakeThumbnail, _._id)} className="size-20" />
                        <div>
                          <p className="text-xs">{_.cakeName}</p>
                          <p className="text-2xl text-primary">
                            {formatCurrencyVND(_.cakeDefaultPrice, _.discountPercents)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        color="primary"
                        onClick={() => {
                          setIsShowSearch(false);
                          return navigate(clientRoutes.cakes.details(_._id));
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center italic text-default-300">
                    Không tìm được sản phẩm nào khớp với nội dung tìm kiếm
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
