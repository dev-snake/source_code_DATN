import { ICake } from "@/types/cake";
import { displayImage } from "@/utils/display-image";
import { formatCurrencyVND } from "@/utils/money-format";
import { slugify } from "@/utils/slugify";
import { Image } from "@nextui-org/react";

interface CakeItemProps {
  cakeData: ICake;
}

const CakeItem = ({ cakeData }: CakeItemProps) => (
  <div className="flex h-full cursor-pointer items-center justify-between rounded-xl border px-4 py-2">
    <div className="flex w-full items-center gap-4">
      <Image
        src={
          cakeData.cakeThumbnail
            ? displayImage(cakeData.cakeThumbnail, cakeData._id)
            : "https://placehold.co/400"
        }
        width={60}
        height={60}
        alt={slugify(cakeData.cakeName)}
        className="size-[110px] object-contain"
      />
      <div className={"flex w-full items-center justify-between"}>
        <h5 className={"italic text-dark"}>{cakeData.cakeName}</h5>
        <h5 className={"italic text-primary"}>{formatCurrencyVND(cakeData.cakeDefaultPrice)}</h5>
      </div>
    </div>
  </div>
);

export default CakeItem;
