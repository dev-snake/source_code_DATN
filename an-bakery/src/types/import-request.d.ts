import { IBranch, IBranchConfig } from "./branch";
import { IMaterial } from "./material";
import { ISupplier, TMaterialSpecs } from "./supplier";

export interface IRequestItem {
  materialId: IMaterial;
  packageType: TMaterialSpecs;
  importQuantity: number;
  importPrice: number;
  importStatus: boolean;
}

export interface IRequestItemForm {
  materialId: string;
  packageType: string;
  importQuantity: number;
  importPrice: number;
  importStatus: boolean;
}

export type TRequestStatus = "pending" | "confirmed" | "waiting" | "completed";

export interface IImportRequest {
  _id: string;
  importDate: string;
  supplierId: ISupplier;
  branchId: Pick<IBranch, "_id"> & { branchConfig: IBranchConfig };
  requestItems: IRequestItem[];
  requestTotalPrice: number;
  requestStatus: TRequestStatus;
  isCancelled: boolean;
  cancelledReason: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IImportRequestForm {
  supplierId: string;
  branchId: string;
  requestItems: IRequestItemForm[];
  requestTotalPrice: number;
}

export interface IRemapRequestItem {}
