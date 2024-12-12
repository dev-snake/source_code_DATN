import { ICustomer } from "@/types/customer";
import { IRecipe } from "@/types/recipe";

export interface ICakeProperty {
  propertyKey: string;
  propertyValue: string;
}

export interface ICakeChildVariant {
  _id?: string;
  itemLabel: string;
  itemPrice: number;
  itemRecipe?: string;
}
export interface ICakeVariant {
  _id?: string;
  variantLabel: string;
  variantItems: ICakeChildVariant[];
}

export interface ICakeVariantForm {
  variantLabel: string;
  variantItems: ICakeChildVariant[];
}

export interface ICakeBaseInfor {
  cakeName: string;
  cakeCategory: string;
  cakeDescription: string;
  discountPercents: number;
  cakeDefaultPrice: number;
}

export interface ICakeRate {
  // [x: string]: number;
  userId?: string | ICustomer;
  rateContent: string;
  rateStars: number;
  isHide?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICakeRecipe {
  materialId: string;
  quantity: number;
  materialName?: string;
  calUnit?: string;
  _id?: string;
}

export interface ICake {
  _id: string;
  cakeDefaultPrice: number;
  cakeDescription: string;
  cakeMedias: string[];
  cakeName: string;
  cakeProperties: ICakeProperty[];
  cakeThumbnail: string;
  cakeVariants: ICakeVariant[];
  cakeSlug: string;
  rates: ICakeRate[];
  soldCount: number;
  creatorId: string;
  discountPercents: number;
  isHide: boolean;
  isDeleted: boolean;
  views: number;
  cakeRecipe: IRecipe;
  cakeCategory: string;
  createdAt: string;
  updatedAt: string;
}
export interface ICakeDetail {
  cakeInfo: ICake;
  cakeVariants: ICakeVariant[];
  cakeMedias: string[];
  cakeProperties: ICakeProperty[];
  cakeRecipe: IRecipe;
  cakeRates: ICakeRate[];
  soldCount: number;
  views: number;
  creatorId: string;
  isHide: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface ICakeUpdate {
  cakeInfo: ICakeBaseInfor;
  cakeVariants: ICakeVariant[];
  cakeMedias: string[];
  cakeProperties: ICakeProperty[];
  cakeRecipe: ICakeRecipe[];
  cakeThumbnail: string;
}
