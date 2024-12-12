import { Input, Button, Image } from "@nextui-org/react";
import qrCode from "@/assets/images/qrcode.png";
import iconConfig from "@/config/icons/icon-config";
import textSizes from "@/config/styles/text-size";
const Pay = () => (
  <section>
    <div className="mx-auto grid w-full max-w-6xl grid-cols-8 gap-x-4 px-20 py-8">
      <div className="col-span-3">
        <div className="rounded-lg border p-4 shadow-sm">
          <h5 className="mb-4">Thông tin đơn hàng</h5>
          <div className="flex flex-col gap-y-4">
            <Input variant="underlined" label="Nhà cung cấp" size="lg" value={"MoMo"} isDisabled />
            <Input variant="underlined" label="Mã đơn hàng" size="lg" value={"#hauvippro"} isDisabled />
            <Input variant="underlined" label="Mô tả" size="lg" value={"@anbakery.com"} isDisabled />
            <div>
              <span>Số tiền</span>
              <h3 className="font-medium">199.000 đ</h3>
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-[#fff0f6] p-4">
          <h5 className="text-momo text-center text-medium font-medium">Đơn hàng hết hạn sau</h5>
          <div className="mt-2 flex justify-center gap-2">
            <div className="rounded-lg bg-[#f3d4e6] p-2">
              <span className="text-momo font-semibold">35 phút</span>
            </div>
            <div className="rounded-lg bg-[#f3d4e6] p-2">
              <span className="text-momo">
                <div className="p">
                  <span className="text-momo font-semibold">11 giây</span>
                </div>
              </span>
            </div>
          </div>
        </div>
        <Button variant="light" className="text-momo mt-2 w-full" radius="sm" size="lg">
          Quay về
        </Button>
      </div>

      <div className={`bg-momo col-span-5 rounded-lg border p-4 shadow-sm`}>
        <h5 className="mt-4 text-center text-white">Quét mã QR để thanh toán</h5>
        <div className="mt-10 flex justify-center">
          <div className="inline-block rounded-2xl bg-white p-6">
            <Image src={qrCode} radius="none" className="size-56" />
          </div>
        </div>
        <div className="mx-auto mt-4 flex max-w-96 items-start justify-center gap-2 text-white">
          {iconConfig.qrCode.medium}{" "}
          <span className={`${textSizes.base} text-center`}>
            Sử dụng App Momo để quét mã thanh toán của đơn hàng trên
          </span>
        </div>
      </div>
    </div>
  </section>
);

export default Pay;
