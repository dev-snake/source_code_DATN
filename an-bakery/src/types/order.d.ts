import { IBranch } from "./branch";
import { ICartItem } from "./cart";
import { ICustomer } from "./customer";
import { IVoucher } from "./voucher";

export type TOrderStatus =
  | "pending"
  | "queue"
  | "processing"
  | "ready"
  | "shipping"
  | "rejected"
  | "completed"
  | "cancelled"
  | "returned";

export type TOrderType = "customerOrder" | "selfOrder";

export interface IOrderItem extends ICartItem {
  priceAtBuy: number;
  [key: string]: unknown;
}

export interface IOrderSummary {
  subTotalPrice: number;
  totalPrice: number;
  reducedFee: number;
  shippingFee: number;
}

export interface IOrder {
  _id: string;
  branchId: IBranch;
  orderGroupId: IOrderGroup;
  orderSummary: IOrderSummary;
  branchVoucher: string;
  voucherCode: IVoucher;
  orderStatus: TOrderStatus;
  orderItems: IOrderItem[];
  orderOptions: IOrderOption;
  explainReason: string;
  orderType: TOrderType;
  orderUrgent?: IOrderUrgent;
  orderPoint?: number;
  orderNote: string;
  customerId: ICustomer;
  createdAt: string;
  updatedAt: string;
}
export interface IOrderUrgent {
  isUrgent: boolean;
  orderExpectedTime: string;
}
export interface IOrderForm {
  branchId: string;
  branchVoucher: string | null;
  orderItems: IOrderItem[];
  orderNote: string;
  orderSummary: IOrderSummary;
  orderType: TOrderType;
  orderOptions: IOrderOption;
  orderUrgent?: IOrderUrgent;
}

export interface IOrderData {
  branchId: string;
  cartItems: IOrderItem[];
  orderSummary: IOrderSummary;
  branchVoucher: string;
  orderNote: string;
}

export interface ICustomerInfo {
  fullName: string;
  phoneNumber: string;
  email: string;
  fullAddress: string;
}

export type TDeliveryMethod = "toHouse" | "atStore";

export interface IOrderOption {
  deliveryMethod: TDeliveryMethod;
  deliveryTime?: string;
}

export type TPaymentStatus = "pending" | "success" | "failed" | "cashOnDelivery";

export interface IOrderGroup {
  _id: string;
  subTotalPrice: number;
  totalPrice: number;
  reducedFee: number;
  shippingFee: number;
  voucherCode?: string;
  customerId: string;
  customerInfo: ICustomerInfo;
  orderType: TOrderType;
  paymentStatus: TPaymentStatus;
  orderData: IOrderForm[];
  orderApplyPoint?: number;
}

export interface IOrderGroupForm {
  subTotalPrice: number;
  totalPrice: number;
  reducedFee: number;
  shippingFee: number;
  voucherCode?: string;
  customerId: string;
  customerInfo: ICustomerInfo;
  orderType: TOrderType;
  paymentStatus: TPaymentStatus;
  orderData: IOrderForm[];
  orderApplyPoint?: number;
}

export interface ISelfOrderForm {
  subTotalPrice: number;
  totalPrice: number;
  reducedFee: number;
  shippingFee: number;
  orderType: TOrderType;
  paymentStatus: TPaymentStatus;
  orderData: IOrderForm[];
}

export interface ITotalAnalytics {
  totalOrdersToday: number;
  totalRevenueToday: number;
  totalOrdersYesterday: number;
  totalRevenueYesterday: number;
  totalOrdersThisMonth: number;
  totalOrdersLastMonth: number;
  totalRevenueLastMonth: number;
  totalRevenueThisMonth: number;
}
