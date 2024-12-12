import vippoint from "@/assets/images/vippoint.png";
import { iconSize } from "@/config/icons/icon-config";
import textSizes from "@/config/styles/text-size";
import { IVipPoints } from "@/types/customer";
import { formatDate } from "@/utils/format-date";
import { sliceText } from "@/utils/slice-text";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Pagination,
  ScrollShadow,
} from "@nextui-org/react";
import { useState } from "react";
import { BiFilter } from "react-icons/bi";
import { FaAlignLeft } from "react-icons/fa";

interface VipPointsProps {
  customerPoints: IVipPoints;
}
const VipPoints: React.FC<VipPointsProps> = ({ customerPoints }) => {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set(["old"]));

  console.log(customerPoints, "customerPoints");
  const handleSortItem = (key: string) => {
    setSelectedKeys(new Set([key]));
    customerPoints.historyPoints.sort((a, b) => {
      const dateA = new Date(a.createdAt ?? "").getTime();
      const dateB = new Date(b.createdAt ?? "").getTime();
      return key === "new" ? dateB - dateA : dateA - dateB;
    });
  };
  return (
    <div className="flex flex-col gap-2">
      <ScrollShadow
        hideScrollBar={true}
        className="w-scrollbar scrollbar-track flex h-[650px] max-h-[650px] flex-col gap-2 rounded-2xl border p-4"
      >
        <div className="flex justify-between">
          <div className="flex items-center gap-x-2">
            <h5 className="text-warning">{customerPoints.currentPoint ?? 0}</h5>
            <Image src={vippoint} alt="Điểm tích luỹ" />
          </div>
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered" size="md" startContent={<FaAlignLeft size={iconSize.base} />}>
                Bộ Lọc
              </Button>
              {/* <Button variant="bordered">Open Menu</Button> */}
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Dynamic Actions"
              onAction={(key) => handleSortItem(key as string)}
              selectedKeys={selectedKeys}
              selectionMode="single"
            >
              <DropdownItem key="new">Gần Nhất</DropdownItem>
              <DropdownItem key="old">Lâu nhất</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        {customerPoints?.historyPoints?.length > 0 ? (
          customerPoints.historyPoints.map((_, index) => (
            <div className="rounded-lg border px-4 py-2" key={index}>
              <div className="flex justify-between">
                <span className={textSizes.base}>
                  {_.title.split("-")[0] + sliceText(_.title.split("-")[1]?.toString())}
                </span>
                <div>
                  <span className="text-default-300">Điểm tích lũy: </span>
                  <h6 className="inline-block text-warning">
                    ({_.amount > 0 && "+"}
                    {customerPoints.historyPoints[index].amount})
                  </h6>
                </div>
              </div>
              <span className="mt-2 text-default-300">
                {formatDate(customerPoints.historyPoints[index].createdAt as string, "fullDate")}
              </span>
            </div>
          ))
        ) : (
          <p className="text-center italic text-dark">Lịch sử cộng điểm trống</p>
        )}
      </ScrollShadow>
      <div className="full flex justify-center">
        <Pagination total={1} initialPage={1} showShadow />
      </div>
    </div>
  );
};
export default VipPoints;
