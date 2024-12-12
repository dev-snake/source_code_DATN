import { TVoucherType } from "./voucher";

type ResponseStatus = "success" | "failure" | "error";

export interface IPaginationMetadata {
  currentPage: number;
  limitPerPage: number;
  totalPages: number;
  totalRecords: number;
  countRecords: number;
  [key: string]: string;
}

export interface IAPIResponse<R = unknown, M = IPaginationMetadata> {
  status: ResponseStatus;
  message: string;
  metadata?: M;
  results: R;
}
export interface IVoucherResult {
  _id: string;
  discountValue: number;
  type: TVoucherType;
  voucherCode: string;
  maxValue: number;
}

export interface IAPIResponseVoucher {
  status: ResponseStatus;
  message: string;
  results: IVoucherResult;
}
