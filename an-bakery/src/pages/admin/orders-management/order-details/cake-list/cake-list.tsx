import { ICake, ICakeVariant } from "@/types/cake";
import { TSelectedVariant } from "@/types/cart";
import { IOrderItem } from "@/types/order";
import { displayImage } from "@/utils/display-image";
import { formatCurrencyVND } from "@/utils/money-format";
import { slugify } from "@/utils/slugify";
import { Chip, Image } from "@nextui-org/react";

interface CakeListProps {
  orderItems: IOrderItem[];
  orderType: "customerOrder" | "selfOrder";
  isCustomerOrder: boolean;
}

const getCakeFromOrderItem = (item: IOrderItem): ICake => item.cakeId as ICake;

const CakeList: React.FC<CakeListProps> = ({ orderItems, orderType, isCustomerOrder }) => {
  const handleShowSelectedVariant = (selectedVariants: TSelectedVariant[], cakeVariants: ICakeVariant[]) => {
    const nameOfVariants: string[] = [];
    selectedVariants.map((variant) => {
      return cakeVariants.map((cakeVariant) => {
        if (cakeVariant._id === variant.variantKey) {
          return cakeVariant.variantItems.map((variantItem) => {
            if (variantItem._id === variant.itemKey) {
              nameOfVariants.push(variantItem.itemLabel);
            }
          });
        }
      });
    });
    return nameOfVariants.join(" - ");
  };
  return (
    <div className="w-full rounded-2xl border p-4 shadow-custom">
      <div className="flex w-full flex-col gap-4">
        <div className="mb-4 flex items-center justify-between">
          <h5 className="max-lg:text-xl">
            Chi tiết <span className="font-semibold text-primary">{orderItems.length}</span> sản phẩm trong
            đơn hàng
          </h5>
          <Chip variant="solid" color="primary" size={"lg"}>
            {!isCustomerOrder && orderType === "customerOrder"
              ? "Đơn hệ thống - khách hàng"
              : orderType === "selfOrder"
                ? "Đơn hệ thống - chi nhánh"
                : "Đơn khách hàng"}
          </Chip>
        </div>
        <div className="grid grid-cols-12 gap-4 rounded-lg bg-dark/10 px-4 py-2">
          <h6 className="col-span-9 font-bold uppercase max-lg:text-xl">Thông tin bánh</h6>
          <h6 className="col-span-1 text-center font-bold uppercase max-lg:text-xl">Đơn</h6>
          <h6 className="col-span-1 text-center font-bold uppercase max-lg:text-xl">Kho</h6>
          <h6 className="col-span-1 text-center font-bold uppercase max-lg:text-xl">Làm</h6>
        </div>

        {orderItems.map((item: IOrderItem, index) => {
          const cake = getCakeFromOrderItem(item);
          return (
            <div className="grid grid-cols-12 items-center gap-4 lg:px-4 lg:py-2" key={cake._id + index}>
              <div className="col-span-9 flex w-full items-center max-lg:px-2 lg:gap-x-4">
                <Image
                  src={displayImage(cake.cakeThumbnail, cake._id)}
                  className="object-contain max-lg:hidden"
                  alt={slugify(cake.cakeName)}
                  width={100}
                  height={100}
                />
                <div className="flex flex-grow basis-4/12 flex-col items-center overflow-hidden lg:gap-y-2">
                  <h4 className="font-bold text-primary">{cake.cakeName}</h4>
                  {item.selectedVariants.length !== 0 && (
                    <p className="truncate text-sm font-semibold">
                      {handleShowSelectedVariant(item.selectedVariants, (item?.cakeId as ICake).cakeVariants)}
                    </p>
                  )}
                  {/* <h4 className="text-primary">{formatCurrencyVND(item.priceAtBuy)}</h4> */}
                </div>
              </div>

              <h1 className="col-span-1 text-center text-danger max-2xl:text-4xl max-md:text-3xl">
                x{item.quantity}
              </h1>
              <h1 className="col-span-1 text-center text-danger max-2xl:text-4xl max-md:text-3xl">
                x{item.currentInventory as unknown as number}
              </h1>
              <h1 className="col-span-1 text-center text-danger max-2xl:text-4xl max-md:text-3xl">
                x
                {(item.currentInventory as unknown as number) > item.quantity
                  ? 0
                  : item.quantity - (item.currentInventory as unknown as number)}
              </h1>
            </div>
          );
        })}
      </div>
      {/* <div className="flex flex-col gap-2 py-1"> */}

      {/* </div> */}
    </div>
  );
};

export default CakeList;
