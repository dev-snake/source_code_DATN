import { ICake } from "@/types/cake";
import CakeItem from "./cake-item";
import { ScrollShadow } from "@nextui-org/react";

interface BranchProductsProps {
  businessProducts: ICake[];
}

const BranchProducts = ({ businessProducts }: BranchProductsProps) => {
  return (
    <ScrollShadow hideScrollBar={true} className="flex max-h-96 flex-col gap-2 overflow-y-auto pb-4">
      {businessProducts.length > 0 ? (
        businessProducts.map((cake, index) => <CakeItem cakeData={cake} key={index} />)
      ) : (
        <p className={"italic"}>Chi nhánh chưa có sản phẩm kinh doanh nào!</p>
      )}
    </ScrollShadow>
  );
};

export default BranchProducts;
