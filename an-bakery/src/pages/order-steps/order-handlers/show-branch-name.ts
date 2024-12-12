import { IBranch } from "@/types/branch";

const showBranchName = (branchId: string, listBranches: IBranch[]): string => {
  const branch = listBranches.find((branch) => branch._id === branchId);
  return branch?.branchConfig.branchDisplayName || "Unknown Branch";
};
export default showBranchName;
