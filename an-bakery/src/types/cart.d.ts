import { ICake } from "./cake";

export type TSelectedVariant = {
  variantKey: string;
  itemKey: string;
  quantity?: number;
  [key: string]: number | string;
};

export interface ICartItem {
  _id?: string;
  branchId: string;
  cakeId: ICake | string;
  cakeInfo?: ICake;
  selectedVariants: TSelectedVariant[];
  quantity: number;
}

export interface IUserCart {
  branchId: string;
  cartItems: ICartItem[];
  branchVoucher: string;
}
interface ICustomerCartForm {
  cakeId: string | null;
  branchId: string | null;
  quantity: number;
  selectedVariants: TSelectedVariant[];
}
