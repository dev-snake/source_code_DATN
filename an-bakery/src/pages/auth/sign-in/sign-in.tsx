import imageAn from "@/assets/images/OnlyNameColorful.png";
import logoAnbakery from "@/assets/images/WithSloganColorful.png";
import EyeFilledIcon from "@/components/common/eye-filled-icon/eye-filled-icon";
import EyeSlashFilledIcon from "@/components/common/eye-slash-filled-icon";
import { signInWithFacebookPopup, signInWithGooglePopup } from "@/config/firebase/firebase.config";
import iconConfig, { iconSize } from "@/config/icons/icon-config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import clientRoutes from "@/config/routes/client-routes.config";
import useAxios from "@/hooks/useAxios";
import { IAPIResponse } from "@/types/api-response";
import { ISignInForm, ITokenResponse } from "@/types/auth";
import { ICustomer } from "@/types/customer";
import validateEmail from "@/utils/validate-email";
import { Button, Divider, Image, Input } from "@nextui-org/react";
import { FormEvent, useMemo, useState } from "react";
import { useCookies } from "react-cookie";
import { FaFacebook } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SignIn = () => {
  const axiosClient = useAxios();
  const navigate = useNavigate();

  const [emailFocused, setEmailFocused] = useState<boolean>(false);
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false);

  const [cookies, setCookie] = useCookies(["accessToken", "refreshToken"]);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const [formLogin, setFormLogin] = useState<ISignInForm>({
    email: "",
    password: "",
    provider: "credentials",
  });
  const isEmailInvalid = useMemo(() => {
    if (!emailFocused || formLogin.email === "") return false;
    return !validateEmail(formLogin.email);
  }, [formLogin.email, emailFocused]);
  const isPasswordInvalid = useMemo(() => {
    if (!passwordFocused || formLogin.password === "") return false;
    return formLogin.password.length < 6;
  }, [formLogin.password, passwordFocused]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const { email, password } = formLogin;

    if ([email, password].includes("")) {
      toast.error("Vui lòng điền đúng thông tin");
      return;
    }
    axiosClient
      .post<IAPIResponse<ITokenResponse>>(apiRoutes.auth.signIn, formLogin)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          handleSetAuthDataAfterSignUp(
            response.results.accessToken,
            response.results.refreshToken,
            response.results.customerInfo,
          );
          toast.success("Đăng nhập thành công");
        }
      })
      .catch((error) => {
        const { data } = error.response;
        toast.error(data.message);
      });
  };

  const handleLoginWithProvider = (provider: string) => {
    console.log(provider);

    const signInMethod = provider === "google" ? signInWithGooglePopup : signInWithFacebookPopup;

    signInMethod().then((response) => {
      const { user } = response;
      if (user) {
        const signInForm = {
          email: user.email!,
          password: "",
          provider,
        };

        axiosClient
          .post<IAPIResponse<ITokenResponse>>(apiRoutes.auth.signIn, signInForm)
          .then((response) => response.data)
          .then((response) => {
            if (response.status === "success") {
              handleSetAuthDataAfterSignUp(
                response.results.accessToken,
                response.results.refreshToken,
                response.results.customerInfo,
              );
              toast.success("Đăng nhập thành công");
            }
          })
          .catch((error) => {
            const { data } = error.response;
            toast.error(data.message);
          });
      }
    });
  };

  const handleSetAuthDataAfterSignUp = (
    accessToken: string,
    refreshToken: string,
    customerInfo: ICustomer,
  ) => {
    setCookie("accessToken", accessToken, { path: "/", maxAge: 60 });
    setCookie("refreshToken", refreshToken, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    localStorage.setItem("customerInfo", JSON.stringify(customerInfo));
  };

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <>
      <section className="flex h-screen w-screen items-center">
        <div className="relative flex h-full min-w-[480px] flex-col items-center justify-center rounded-r-xl px-8 shadow-xl">
          <div className={"absolute z-0 h-full"}>
            <div className={"mt-12 flex w-full justify-center"}>
              <Link to={"/"}>
                <Image src={imageAn} />
              </Link>
            </div>
          </div>

          <div className="z-10 flex w-full flex-col items-center justify-center gap-4">
            <form className="flex w-full flex-col gap-4 max-[1450px]:px-4" onSubmit={handleLogin}>
              <h2 className="truncate">Đăng nhập</h2>
              <Input
                className="w-full"
                variant={"bordered"}
                label={"Email"}
                labelPlacement={"outside"}
                size={"lg"}
                isRequired
                placeholder="Nhập email"
                isInvalid={isEmailInvalid}
                color={isEmailInvalid ? "danger" : "default"}
                errorMessage="Vui lòng nhập đúng định dạng email .@gmail.com"
                onValueChange={(value) => setFormLogin({ ...formLogin, email: value })}
                onFocus={() => setEmailFocused(true)}
              />

              <Input
                type={isVisible ? "text" : "password"}
                className={"w-full"}
                label={"Mật khẩu"}
                labelPlacement={"outside"}
                placeholder={"Nhập mật khẩu"}
                variant={"bordered"}
                size={"lg"}
                isRequired
                isInvalid={isPasswordInvalid}
                color={isPasswordInvalid ? "danger" : "default"}
                onFocus={() => setPasswordFocused(true)}
                errorMessage={"Mật khẩu phải chứa ít nhất 6 kí tự"}
                onValueChange={(value) => setFormLogin({ ...formLogin, password: value })}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                    aria-label="toggle password visibility"
                  >
                    {isVisible ? (
                      <EyeSlashFilledIcon className="pointer-events-none text-2xl text-default-400" />
                    ) : (
                      <EyeFilledIcon className="pointer-events-none text-2xl text-default-400" />
                    )}
                  </button>
                }
              />
              <Button color={"primary"} type={"submit"} fullWidth={true} size={"lg"}>
                Đăng nhập
              </Button>
              <div className={"flex w-full items-center justify-between gap-8"}>
                <Link
                  to={clientRoutes.auth.signUp}
                  className={"transition-all duration-300 hover:text-primary"}
                >
                  <p>Chưa có tài khoản? Đăng kí ngay</p>
                </Link>
                <Link
                  to={clientRoutes.auth.forgotPassword}
                  className={"transition-allduration-300 hover:text-primary"}
                >
                  <p>Quên mật khẩu</p>
                </Link>
              </div>
            </form>

            <Divider />
            <div className="flex justify-center gap-2">
              <Button
                isIconOnly
                size="lg"
                variant={"flat"}
                onClick={() => handleLoginWithProvider("facebook")}
              >
                {iconConfig.facebookColor.medium}
              </Button>
              <Button isIconOnly size="lg" variant={"flat"} onClick={() => handleLoginWithProvider("google")}>
                {iconConfig.googleColor.medium}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center">
          <Image src={logoAnbakery} className="max-[1450px]:px-8 max-lg:hidden" />
        </div>
      </section>
    </>
  );
};

export default SignIn;
