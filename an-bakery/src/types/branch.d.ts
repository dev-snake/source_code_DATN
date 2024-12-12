import { ICake } from "./cake";
import { IMaterial } from "./material";

export type TMaterialHistoryChange = {
  weightChange: number;
  type: "forOrder" | "removeExpired" | "newImport" | "forTest";
  createdAt: string;
};

export type TMaterialInventory = {
  materialId: IMaterial;
  inventoryVolume: number;
  historyChange: TMaterialHistoryChange[];
};
export interface TMaterialPlanOrder extends TMaterialInventory {
  quantity?: number;
  empty?: boolean;
}

export type TCakeSelectedVariant = {
  variantKey: string;
  itemKey: string;
};

export type TCakeHistoryChange = {
  quantityChange: number;
  type: "forOrder" | "removeExpired" | "sell";
  createdAt: string;
};

export type TCakeInventory = {
  cakeId: ICake;
  selectedVariants: TCakeSelectedVariant[];
  inventoryVolume: number;
  historyChange: TCakeHistoryChange[];
};

export interface IBranchInventory {
  materials: TMaterialInventory[];
  cakes: TCakeInventory[];
}

export type TBranchActiveTime = {
  open: string;
  close: string;
};

export type TBranchType = "direct" | "online";
export type TBranchContact = {
  branchOwnerName: string;
  branchPhoneNumber: string;
};

export interface IBranchConfig {
  branchDisplayName: string;
  activeTime: TBranchActiveTime;
  branchType: TBranchType;
  branchAddress: string;
  branchContact: TBranchContact;
  mapLink: string;
}

export interface IBranch {
  _id: string;
  branchInventory: null | IBranchInventory;
  branchConfig: IBranchConfig;
  businessProducts: string[];
  isActive: boolean;
  isDeleted: boolean;
}

export interface IBranchUpdateForm {
  branchDisplayName: string;
  activeTime: TBranchActiveTime;
  branchType: TBranchType;
  branchAddress: string;
  branchContact: TBranchContact;
  mapLink: string;
  isActive?: boolean;
}
