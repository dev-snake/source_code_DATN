import { IBranch } from "@/types/branch";
import { ICake } from "@/types/cake";
import { TSelectedVariant } from "@/types/cart";
import { IMaterial } from "@/types/material";
import { PlanStatus, PlanType } from "@/types/plan-map";

type TPlanType = keyof typeof PlanType;
type TPlanStatus = keyof typeof PlanStatus | undefined;
type TPlanActivated = {
  startDate: string | Date;
  endDate: string | Date;
};
type TMaterialItem = {
  materialId: string | IMaterial;
  quantity: number;
};
type TPlanDetails = {
  cakeId: string | ICake;
  selectedVariants: TSelectedVariant[];
  orderCount: number;
  orderAmount: number;
  currentInventory: number;
  plannedProduction: number;
  totalMaterials: [TMaterialItem];
};
export interface IPlan {
  _id?: string;
  branchId: string | IBranch;
  orderId: string[];
  planName: string;
  planDescription: string;
  planType: string | TPlanType;
  planStatus: TPlanStatus;
  planActivated: TPlanActivated;
  planDetails: [TPlanDetails];
  creatorId: string;
}
