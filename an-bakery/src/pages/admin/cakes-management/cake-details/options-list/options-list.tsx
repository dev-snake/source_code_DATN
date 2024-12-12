import { ICakeVariant } from "@/types/cake";
import { Button, Chip } from "@nextui-org/react";
interface IOptionsListProps {
  cakeVariants: ICakeVariant[];
}
const OptionsList = ({ cakeVariants }: IOptionsListProps) => (
  <div className="flex flex-col gap-2 pb-4">
    {cakeVariants.length > 0 ? (
      cakeVariants.map((variant, index) => (
        <div className="flex w-full items-center justify-between gap-x-2 overflow-hidden" key={index}>
          <p className="w-full truncate font-bold uppercase text-dark/50">{variant.variantLabel}</p>
          <div className="flex gap-x-2">
            {variant.variantItems.map((item, index) => (
              <Button size="sm" color="primary" variant="flat" key={index}>
                {item.itemLabel}
              </Button>
            ))}
          </div>
        </div>
      ))
    ) : (
      <p className="text-center italic">Bánh không có biến thể</p>
    )}
  </div>
);

export default OptionsList;
