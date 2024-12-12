import { IBranch } from "./branch";

export type TVoucherType = "fixed" | "percentage" | "shipFee";

export interface IVoucherConfig {
  _id: string;
  discountValue: number;
  maxValue: number | null;
  maxTotalUsage: number | null;
  maxUserUsage: number | null;
  validFrom: string;
  validTo: string;
  minimumOrderValues: number | null;
  type: TVoucherType;
  isWhiteList: boolean;
}

export interface IVoucher {
  _id: string;
  voucherCode: string;
  voucherDescription: string;
  branchId: IBranch | null;
  voucherConfig: IVoucherConfig;
  usedCount: number;
  userUsed: [];
  whiteListUsers: [];
  creatorId: string;
  isDeleted: boolean;
}

export interface IVoucherForm {
  voucherCode: string;
  voucherDescription: string;
  branchId: string | null;
  discountValue: number;
  maxValue: number | null;
  maxTotalUsage: number | null;
  maxUserUsage: number | null;
  validFrom: string;
  validTo: string;
  minimumOrderValues: number | null;
  type: TVoucherType;
  isWhiteList: boolean;
  whiteListUsers: string[];
}
interface IVoucherCodeBranch {
  branchId: string;
  voucherCode: string;
  voucherId: string;
}
interface IVoucherCodeSystem {
  voucherCodeSystem: string;
  voucherId: string;
}
interface IVoucherCodeBranchApplied {
  [key: string]: {
    voucherCode: string;
    branchId: string;
    reducedFee: number;
    type: TVoucherType;
  };
}
interface IDecodedUrlParams extends IVoucherCodeBranchApplied {}

interface IVoucherCodeSystemApplied {
  voucherCode: string;
  reducedFee: number;
  type?: TVoucherType;
}
