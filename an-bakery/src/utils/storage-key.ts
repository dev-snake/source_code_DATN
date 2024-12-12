import { ICustomer } from "@/types/customer";
import { IStaff } from "@/types/staff";

const getStaffLocalStorage = () => {
  const staffInfo =
    (localStorage && (JSON.parse(localStorage.getItem("staffInfo") as string) as IStaff)) ?? null;
  const staffRole = localStorage && (localStorage.getItem("staffInfo") as unknown as number);
  return { staffInfo, staffRole };
};
const clearStaffLocalStorage = () => {
  localStorage?.removeItem("staffInfo");
  localStorage?.removeItem("staffRole");
};
const getCustomerLocalStorage = () => {
  const customerInfo =
    (localStorage && (JSON.parse(localStorage.getItem("customerInfo") as string) as ICustomer)) ?? null;
  return customerInfo;
};
const setVipointsLocalStorage = (vipoints: number) => {
  const customerInfo =
    (localStorage && (JSON.parse(localStorage.getItem("customerInfo") as string) as ICustomer)) ?? null;
  if (customerInfo) {
    customerInfo.vipPoints.currentPoint = vipoints;
    localStorage?.setItem("customerInfo", JSON.stringify(customerInfo));
  }
};
const clearCustomerLocalStorage = () => {
  localStorage?.removeItem("customerInfo");
};
const getRedirectPathSignIn = () => {
  return localStorage?.getItem("redirectPath") || null;
};
const saveRedirectPathSignIn = (pathname: string) => {
  return localStorage?.setItem("redirectPath", pathname);
};
const clearRedirectPathSignIn = () => {
  return localStorage?.removeItem("redirectPath");
};

export const LocalStorage = {
  getStaffLocalStorage,
  setVipointsLocalStorage,
  clearStaffLocalStorage,
  getCustomerLocalStorage,
  clearCustomerLocalStorage,
  saveRedirectPathSignIn,
  getRedirectPathSignIn,
  clearRedirectPathSignIn,
};
