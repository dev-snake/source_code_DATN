import iconConfig from "@/config/icons/icon-config";
import CakeProperties from "@/pages/cake-menu/cake-details/cake-properties";
import { ICake, ICakeProperty } from "@/types/cake";
import { displayImage } from "@/utils/display-image";
import { formatCurrencyVND } from "@/utils/money-format";
import { slugify } from "@/utils/slugify";
import { Accordion, AccordionItem, Chip, Image, Input, Textarea } from "@nextui-org/react";

interface BaseInformationProps {
  cakeInfo: ICake;
  cakeProperties: ICakeProperty[];
  cakeMedias: string[];
}

const BaseInformation = ({ cakeInfo, cakeProperties, cakeMedias }: BaseInformationProps) => {
  console.log(cakeInfo);
  return (
    <div className={"flex flex-col gap-4"}>
      <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom">
        <h5>Thông tin cơ bản</h5>
        <div className="flex flex-col gap-4">
          <div className={"flex items-center gap-2"}>
            <Input
              label={"Tên bánh"}
              labelPlacement={"outside"}
              value={cakeInfo.cakeName}
              isReadOnly={true}
              size={"lg"}
            />
            <Input
              label={"Danh mục"}
              labelPlacement={"outside"}
              value={cakeInfo.cakeCategory}
              isReadOnly={true}
              size={"lg"}
            />
          </div>
          <div className={"flex items-center gap-2"}>
            <Input
              label={"Giá gốc"}
              labelPlacement={"outside"}
              value={formatCurrencyVND(cakeInfo.cakeDefaultPrice)}
              isReadOnly={true}
              size={"lg"}
            />
            <Input
              label={"% Giảm giá"}
              labelPlacement={"outside"}
              value={cakeInfo.discountPercents.toString()}
              isReadOnly={true}
              size={"lg"}
            />
            <Input
              label={"Giá sau giảm"}
              labelPlacement={"outside"}
              value={formatCurrencyVND(cakeInfo.cakeDefaultPrice, cakeInfo.discountPercents)}
              isReadOnly={true}
              size={"lg"}
            />
          </div>
          <div className="flex items-center gap-4">
            <Chip
              color={"warning"}
              startContent={iconConfig.soldBag.base}
              className={"px-4 py-1"}
              size={"lg"}
              classNames={{
                base: "gap-1",
              }}
            >
              {cakeInfo.soldCount} đã bán
            </Chip>

            <Chip
              color={"secondary"}
              startContent={iconConfig.view.base}
              className={"px-4 py-1"}
              size={"lg"}
              classNames={{
                base: "gap-1",
              }}
            >
              {cakeInfo.views} lượt xem
            </Chip>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom">
        <h5>Hình ảnh ảnh sản phẩm</h5>
        <div className={"flex flex-wrap items-center gap-4"}>
          {cakeMedias.map((media) => (
            <Image
              src={displayImage(media, cakeInfo._id)}
              alt={slugify(cakeInfo.cakeName)}
              className="max-w-32 object-contain"
            />
          ))}
        </div>
      </div>
      <Accordion variant={"splitted"}>
        <AccordionItem title={<h5>Mô tả nhanh của bánh</h5>}>
          <div className={"flex flex-col gap-2 pb-4"}>
            {cakeProperties.map((property, index) => (
              <div className={"flex items-center gap-2"}>
                <p>{index + 1}. </p>
                <Input
                  aria-label={`key ${property.propertyKey}`}
                  value={property.propertyKey}
                  isReadOnly={true}
                  size={"lg"}
                />
                <Input
                  aria-label={`value ${property.propertyValue}`}
                  value={property.propertyValue}
                  isReadOnly={true}
                  size={"lg"}
                />
              </div>
            ))}
          </div>
        </AccordionItem>
        <AccordionItem title={<h5>Mô tả </h5>}>
          <p className={"italic"}>{cakeInfo.cakeDescription}</p>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default BaseInformation;
