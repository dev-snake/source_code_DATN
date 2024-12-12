import imageAn from "@/assets/images/OnlyNameColorful.png";
import logoAnbakery from "@/assets/images/WithSloganColorful.png";
import EyeFilledIcon from "@/components/common/eye-filled-icon/eye-filled-icon";
import EyeSlashFilledIcon from "@/components/common/eye-slash-filled-icon";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useAxios from "@/hooks/useAxios";
import { IAPIResponse } from "@/types/api-response";
import { IStaffSignInResponse } from "@/types/staff";
import { Button, Image, Input } from "@nextui-org/react";
import { AxiosError } from "axios";
import { FormEvent, useState } from "react";
import { useCookies } from "react-cookie";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
interface ISignIn {
  staffCode: string;
  password: string;
}

const SignInStaff = () => {
  const [signInForm, setSignInForm] = useState<ISignIn>({ staffCode: "", password: "" });
  const [_, setCookies] = useCookies(["staffAccessToken", "staffRefreshToken"]);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const axiosClient = useAxios();

  const handleSignIn = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    const { staffCode, password } = signInForm;
    if ([staffCode, password].includes("")) {
      toast.warning("Vui lòng nhập đầy đủ thông tin !");
      return;
    }

    axiosClient
      .post<IAPIResponse<IStaffSignInResponse>>(apiRoutes.staffAuth.signIn, signInForm)
      .then((response) => response.data)
      .then((response) => {
        setCookies("staffAccessToken", response.results.accessToken, { path: "/", maxAge: 6000 });
        setCookies("staffRefreshToken", response.results.refreshToken, { path: "/", maxAge: 6000 });
        localStorage.setItem("staffInfo", JSON.stringify(response.results.staffInfo));
        localStorage.setItem("staffRole", JSON.stringify(response.results?.staffInfo?.role));
      })
      .catch((error) => {
        const { data } = error.response;

        toast.error(data.message);
      });
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
            <form className="flex w-full flex-col gap-y-4 max-[1450px]:px-4" onSubmit={handleSignIn}>
              <h2 className="truncate">Đăng nhập</h2>
              <Input
                className="w-full"
                variant="bordered"
                label="Mã đăng nhập"
                labelPlacement={"outside"}
                placeholder="Mã nhân viên"
                size={"lg"}
                onValueChange={(value) => setSignInForm({ ...signInForm, staffCode: value })}
              />
              <Input
                type={isVisible ? "text" : "password"}
                className="w-full"
                variant="bordered"
                label="Mật khẩu"
                labelPlacement={"outside"}
                size={"lg"}
                placeholder="Nhập mật khẩu"
                onValueChange={(value) => setSignInForm({ ...signInForm, password: value })}
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
              <Button color="primary" type="submit" fullWidth={true} size="lg">
                Đăng nhập
              </Button>
            </form>
          </div>
        </div>

        <div className="flex w-full items-center justify-center">
          <Image src={logoAnbakery} className="max-[1450px]:px-8 max-lg:hidden" />
        </div>
      </section>
    </>
  );
};

export default SignInStaff;
