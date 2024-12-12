import { IBranch } from "./branch";

export type TDailyAnalytics = {
  day: string;
  value: number;
};

export type TDailyRevenueAnalytics = {
  day: string;
  orders: number;
  revenues: number;
};

export type TMonthRevenueAnalytics = {
  month: string;
  orders: number;
  revenues: number;
};

export type TMonthAnalytics = {
  month: string;
  value: number;
};

export interface IOrdersAnalytics<T = any, R = any> {
  allStatusData: T[];
  completeStatusData: T[];
  failureStatusData: T[];
  provisionalRevenueData: R[];
  actualRevenueData: R[];
}

export interface ICustomersAnalytics<T = any> {
  allCustomersData: T[];
}

export type TBranchOrders = {
  branch: IBranch;
  orders: number;
};

export interface IAnalytics {
  orderInYear: TMonthAnalytics[];
  revenueInYear: TMonthRevenueAnalytics[];
  customerInYear: TMonthAnalytics[];
  orderInMonth: TDailyAnalytics[];
  branchOrders: TBranchOrders[];
}

// export interface IDailyOrdersAnalytics {
//   allStatusData: TDailyOrdersAnalytics[];
//   completeStatusData: TDailyOrdersAnalytics[];
//   failureStatusData: TDailyOrdersAnalytics[];
// }
