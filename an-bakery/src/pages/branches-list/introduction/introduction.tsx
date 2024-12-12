import logoAnBakery from "@/assets/images/WithSloganColorful.png";
import logoAn2 from "@/assets/images/OnlyNameColorful.png";
import { Image } from "@nextui-org/react";
import textSizes from "@/config/styles/text-size";
const Introduction = () => (
  <div className="flex gap-x-16 rounded-2xl border px-6 py-8">
    <div className="flex w-full basis-[400px] items-center">
      <Image src={logoAnBakery} className="w-[350px]" />
    </div>
    <div className="w-full grow-[1]">
      <div className="flex gap-8">
        <div className="flex flex-col justify-center gap-y-2">
          <img src={logoAn2} className="mx-auto h-8 w-[50px]" />
          <span className="text-primary">10 Cửa hàng</span>
        </div>
        <div className="flex flex-col justify-center gap-y-2">
          <img src={logoAn2} className="mx-auto h-8 w-[50px]" />
          <span className="text-primary">10k người dùng</span>
        </div>
      </div>
      <p className={`${textSizes.base} mt-8 max-w-[820px]`}>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sapiente, omnis pariatur? Suscipit mollitia
        omnis neque consequuntur repellat sit laboriosam eos quaerat, dignissimos fuga unde perspiciatis
        consequatur animi libero, quae modi illum delectus? Expedita modi, ex quis earum adipisci ipsa
        laudantium perspiciatis, minus est aliquid nostrum. Fugit doloremque earum asperiores, recusandae sit
        accusantium reprehenderit totam re
      </p>
    </div>
  </div>
);

export default Introduction;
