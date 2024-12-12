import { Image, Button, Input } from "@nextui-org/react";
import imageAn from "@/assets/images/OnlyNameColorful.png";
import logoAnbakery from "@/assets/images/WithSloganColorful.png";
import { BiMessageDots } from "react-icons/bi";

import { Link } from "react-router-dom";
import React from "react";
const AuthenticationOtp: React.FC = () => {
  return (
    <section className="flex h-screen">
      <div className="basis-[550px] rounded-r-[32px] shadow-xl">
        <div className="mt-16 flex justify-center">
          <Link to={"/"}>
            <Image src={imageAn} />
          </Link>
        </div>
        <div className="mx-auto mt-40 max-w-[486px]">
          {/* <div>

            <h2>Còn một bước nữa ,...</h2>
            <div className="my-10 flex justify-between">
              <input
                className={`size-14 rounded-2xl border-2 border-primary p-2 text-center text-3xl font-bold`}
                maxLength={1}
              />
              <input
                className={`size-14 rounded-2xl border-2 border-primary p-2 text-center text-3xl font-bold`}
                maxLength={1}
              />
              <input
                className={`size-14 rounded-2xl border-2 border-primary p-2 text-center text-3xl font-bold`}
                maxLength={1}
              />
              <input
                className={`size-14 rounded-2xl border-2 border-primary p-2 text-center text-3xl font-bold`}
                maxLength={1}
              />
              <input
                className={`size-14 rounded-2xl border-2 border-primary p-2 text-center text-3xl font-bold`}
                maxLength={1}
              />
              <input
                className={`size-14 rounded-2xl border-2 border-primary p-2 text-center text-3xl font-bold`}
                maxLength={1}
              />
            </div>
          </div> */}
          <div className="flex flex-col gap-y-6">
            <Input variant="underlined" placeholder="Nhập OTP" />
            <Input variant="underlined" placeholder="Nhập mật khẩu cũ" />
            <Input variant="underlined" placeholder="Nhập mật khẩu mới" />
          </div>
          <Button color="primary" radius="full" size="lg" className="mt-6 w-full">
            Thay đổi mật khẩu
          </Button>
        </div>
      </div>
      <div className="flex grow-[1] items-center justify-center">
        <Link to={"/"}>
          <Image src={logoAnbakery} />
        </Link>
      </div>
    </section>
  );
};

export default AuthenticationOtp;
