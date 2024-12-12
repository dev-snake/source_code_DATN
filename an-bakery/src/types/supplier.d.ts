import { IMaterial } from "./material";

export interface ISupplierContact {
  email: string;
  phone: string;
  address: string;
}

export type TMaterialSpecs = {
  baseUnit: string;
  pricePerUnit: number;
  packsPerUnit: number;
  quantityPerPack: number;
  _id?: string;
};

export interface ISupplyItem {
  materialId: string;
  materialSpecs: TMaterialSpecs;
}

export type ReMapSupplyItem = {
  materialId: IMaterial;
  materialSpecs: TMaterialSpecs;
};

export interface ISupplierContactPerson {
  name: string;
  email: string;
  phone: string;
}

export interface ISupplier {
  _id: string;
  supplierName: string;
  supplierContact: ISupplierContact;
  supplierContactPerson: ISupplierContactPerson;
  supplierPriority: number;
  supplyItems: ReMapSupplyItem[];
  supplierDescription: string;
  branchId: string[];
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface ISupplierForm {
  supplierName: string;
  supplierContact: ISupplierContact;
  supplierContactPerson: ISupplierContactPerson;
  supplierPriority: number;
  supplyItems: ISupplyItem[];
  supplierDescription?: string;
  branchId: string[];
}
