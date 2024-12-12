import { IOrder } from "./order";

export type ReMapOrderData = Exclude<IOrder, "branchId"> & {
  branchId: {
    _id: string;
    branchConfig: {
      branchDisplayName: string;
    };
  };
};
