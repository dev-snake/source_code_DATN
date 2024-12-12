import { IUserCart } from "./cart";

export type TProvider = "google" | "facebook" | "credentials";

export interface IFeedback {
  customerId: string;
  rateContent: string;
  rateStars: number;
  isHide: boolean;
  isDeleted: boolean;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IFeedbackHistory {
  cakeInfo: {
    cakeName: string;
    cakeThumbnail: string;
    cakeId: string;
  };
  feedbacks: Feedback;
}

export interface IHistoryPoint {
  amount: number;
  title: string;
  time: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IVipPoints {
  currentPoint: number;
  historyPoints: IHistoryPoint[];
}

export interface IBlockHistory {
  blockTime: string;
  blockReason: string;
}

export interface IUserAddresses {
  fullName: string;
  email: string;
  phoneNumber: string;
  fullAddress: string;
  provinceId?: string;
  districtId?: string;
  wardId?: string;
  _id?: string;
}

export interface ICustomer {
  _id: string;
  userName: string;
  email: string;
  password: string;
  isActive: boolean;
  provider: string;
  refreshToken: string;
  userAddresses: IUserAddresses[];
  blockHistory: IBlockHistory[];
  userCart: IUserCart[];
  vipPoints: IVipPoints;
  createdAt: string;
  updatedAt: string;
}

export interface IChangePasswordForm {
  otpCode: string;
  newPassword: string;
  retypeNewPassword: string;
  oldPassword: string;
}
