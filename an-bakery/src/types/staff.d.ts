import { IBranch } from "./branch";

export type TStaffWorkTime = {
  joinDate: string;
  outDate: string;
};

export interface IStaff {
  _id: string;
  password: string;
  staffName: string;
  staffCode: string;
  workTime: TStaffWorkTime;
  branchRef: null | IBranch;
  role: 0 | 1 | 2;
  isActive: boolean;
  refreshToken: null | string;
}

export interface INewStaff {
  staffCode: string;
  password: string;
  staffName: string;
  role: number;
  branchRef?: string | null;
}

export interface IStaffSignInResponse {
  refreshToken: string;
  accessToken: string;
  staffInfo: IStaff;
}
