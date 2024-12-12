export interface IPackagingType {
  _id: string;
  packageLabel: string;
  itemPerPackage: number;
  volumePerItem: number;
  unitPrice: number;
}
export type TMaterialType = "baking-ingredient" | "accessory";

export interface IMaterial {
  _id: string;
  materialName: string;
  materialType: TMaterialType;
  calUnit: string;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  isDeleted: boolean;
}

export interface IMaterialForm {
  materialName: string;
  materialType: TMaterialType;
  calUnit: string;
  _id?: string;
  creatorId?: string;
  createdAt?: string;
}

export interface IMaterialStats {
  totalWeight: number;
  year: number;
  month: number;
  materialId: string;
  type: string;
}

export interface ICakeRecipe {
  materialId: string;
  weight: number;
}
