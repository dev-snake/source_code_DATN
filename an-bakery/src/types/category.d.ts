export interface ICategory {
  _id: string;
  categoryName: string;
  categoryDescription: string;
  categoryKey: string;
  isActive: boolean;
  isDeleted: boolean;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}
export interface ICategoryForm {
  _id?: string;
  categoryName: string;
  categoryKey: string;
  categoryDescription: string;
  isActive: boolean;
}
