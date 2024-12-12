import { IStaff } from "@/types/staff";

const useRole = () => {
  return localStorage?.getItem("staffRole") ? Number(localStorage?.getItem("staffRole")) : null;
};

export default useRole;
