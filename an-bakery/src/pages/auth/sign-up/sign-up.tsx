import { Image, Input, Button, Divider } from "@nextui-org/react";
import imageAn from "@/assets/images/OnlyNameColorful.png";
import logoAnbakery from "@/assets/images/WithSloganColorful.png";
import { Link } from "react-router-dom";
import { useState, useMemo, FormEvent } from "react";
import { toast } from "react-toastify";
import useAxios from "@/hooks/useAxios";
import { apiRoutes } from "@/config/routes/api-routes.config";
import { useNavigate } from "react-router-dom";
import clientRoutes from "@/config/routes/client-routes.config";
import { IAPIResponse } from "@/types/api-response";
import { ISignUpForm, ITokenResponse } from "@/types/auth";
import validateEmail from "@/utils/validate-email";
import { signInWithFacebookPopup, signInWithGooglePopup } from "@/config/firebase/firebase.config";
import { useCookies } from "react-cookie";
import { ICustomer } from "@/types/customer";
import iconConfig from "@/config/icons/icon-config";

const SignUp = () => {
  const axiosClient = useAxios();

  const [cookies, setCookie] = useCookies(["accessToken", "refreshToken"]);
  const [emailFocused, setEmailFocused] = useState<boolean>(false);
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState<boolean>(false);
  const navigate = useNavigate();

  const [signUpForm, setSignUpForm] = useState<ISignUpForm>({
    email: "",
    password: "",
    confirmPassword: "",
    provider: "credentials",
  });

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

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    const { email, password, confirmPassword } = signUpForm;
    if ([email, password, confirmPassword].includes("")) {
      return toast.error("Vui lòng điền đầy đủ thông tin");
    }

    if (!validateEmail(email)) {
      return toast.error("Email không hợp lệ");
    }

    if (password !== confirmPassword) {
      return toast.error("Mật khẩu không khớp");
    }

    axiosClient
      .post<IAPIResponse<ITokenResponse>>(apiRoutes.auth.signUp, signUpForm)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success("Đăng kí thành công");
          navigate(clientRoutes.auth.signIn);
        } else {
          toast.error(response.message);
        }
      })
      .catch((error) => {
        const { data } = error.response;
        toast.error(data.message);
      });
  };

  const handleQuickSignUp = (provider: "google" | "facebook") => {
    const signInProvider = provider === "google" ? signInWithGooglePopup : signInWithFacebookPopup;

    signInProvider().then((response) => {
      const { user } = response;

      if (user) {
        const signUpFormGoogle: ISignUpForm = {
          email: user.email!,
          password: "",
          confirmPassword: "",
          provider,
        };
        axiosClient
          .post<IAPIResponse<ITokenResponse>>(apiRoutes.auth.signIn, signUpFormGoogle)
          .then((response) => response.data)
          .then((response) => {
            if (response.status === "success") {
              const { accessToken, refreshToken, customerInfo } = response.results;
              handleSetAuthDataAfterSignUp(accessToken, refreshToken, customerInfo);
              toast.success("Đăng kí thành công");
            } else {
              toast.error(response.message);
            }
          })
          .catch((error) => {
            const { data } = error.response;
            toast.error(data.message);
          });
      }
    });
  };

  const isEmailInvalid = useMemo(() => {
    if (!emailFocused || signUpForm.email === "") return false;
    return !validateEmail(signUpForm.email);
  }, [signUpForm.email, emailFocused]);

  const isPasswordInvalid = useMemo(() => {
    if (!passwordFocused || signUpForm.password === "") return false;
    return signUpForm.password === "";
  }, [signUpForm.password, passwordFocused]);

  const isConfirmPasswordInvalid = useMemo(() => {
    if (!confirmPasswordFocused || signUpForm.confirmPassword === "") return false;
    return signUpForm.password !== signUpForm.confirmPassword;
  }, [signUpForm.confirmPassword, signUpForm.password, confirmPasswordFocused]);

  return (
    <section className="flex h-screen w-screen">
      <div className="relative flex h-full min-w-[480px] flex-col items-center justify-center rounded-r-xl px-8 shadow-xl">
        <div className={"absolute z-0 h-full"}>
          <div className={"mt-12 flex w-full justify-center"}>
            <Link to={"/"}>
              <Image src={imageAn} />
            </Link>
          </div>
        </div>
        <div className="z-10 flex w-full flex-col items-center justify-center gap-4">
          <form className="flex w-full flex-col gap-y-4 max-2xl:px-4" onSubmit={handleSignUp}>
            <h2 className="truncate">Đăng ký</h2>
            <Input
              className="w-full"
              type="email"
              isRequired
              variant={"bordered"}
              size={"lg"}
              label="Email"
              labelPlacement={"outside"}
              isInvalid={isEmailInvalid}
              color={isEmailInvalid ? "danger" : "default"}
              errorMessage="Vui lòng nhập đúng định dạng email .@gmail.com"
              placeholder="Nhập email"
              onValueChange={(value) => setSignUpForm({ ...signUpForm, email: value })}
              onFocus={() => setEmailFocused(true)}
            />
            <Input
              className="w-full"
              type="password"
              isRequired
              variant={"bordered"}
              size={"lg"}
              label="Mật khẩu"
              labelPlacement={"outside"}
              placeholder="Nhập mật khẩu"
              isInvalid={isPasswordInvalid}
              errorMessage="Vui lòng nhập mật khẩu"
              onValueChange={(value) => setSignUpForm({ ...signUpForm, password: value })}
              onFocus={() => setPasswordFocused(true)}
            />
            <Input
              className="w-full"
              type="password"
              isRequired
              variant={"bordered"}
              size={"lg"}
              label="Nhập lại mật khẩu"
              labelPlacement={"outside"}
              placeholder="Nhập lại mật khẩu"
              isInvalid={isConfirmPasswordInvalid}
              errorMessage="Mật khẩu không khớp"
              onValueChange={(value) => setSignUpForm({ ...signUpForm, confirmPassword: value })}
              onFocus={() => setConfirmPasswordFocused(true)}
            />
            <div className="flex">
              <Button color="primary" className="w-full" size="lg" type="submit">
                Đăng Kí
              </Button>
              <div className="mx-2 border"></div>
              <div className="flex gap-x-2">
                <Button isIconOnly size="lg" variant={"flat"} onClick={() => handleQuickSignUp("facebook")}>
                  {iconConfig.facebookColor.medium}
                </Button>
                <Button isIconOnly size="lg" variant={"flat"} onClick={() => handleQuickSignUp("google")}>
                  {iconConfig.googleColor.medium}
                </Button>
              </div>
            </div>
            <Divider />
            <Link
              to={clientRoutes.auth.signIn}
              className={"text-center transition-all duration-300 hover:text-primary"}
            >
              <p>Đã có tài khoản? Đăng nhập ngay</p>
            </Link>
          </form>
        </div>
      </div>
      <div className="flex grow-[1] items-center justify-center">
        <Image src={logoAnbakery} className="max-[1450px]:px-8 max-lg:hidden" />
      </div>
    </section>
  );
};

export default SignUp;
