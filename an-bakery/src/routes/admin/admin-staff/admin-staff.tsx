import StaffManagement from "@/pages/admin/staff-management";
import StaffDetails from "@/pages/admin/staff-management/staff-details";
import CreateStaff from "@/pages/admin/staff-management/create-staff";
import EditStaff from "@/pages/admin/staff-management/edit-staff";
import { RouteObject } from "react-router-dom";
const adminStaff: RouteObject[] = [
  { path: "staff-management", element: <StaffManagement /> },
  { path: "staff-management/:staffId", element: <StaffDetails /> },
  { path: "staff-management/create", element: <CreateStaff /> },
  { path: "staff-management/:staffId/edit", element: <EditStaff /> },
];
export default adminStaff;
