import AuthenticationOtp from "@/pages/auth/authentication-otp";
import ResetPassword from "@/pages/auth/reset-password";
import SignIn from "@/pages/auth/sign-in";
import SignInStaff from "@/pages/auth/sign-in-staff";
import SignUp from "@/pages/auth/sign-up";
import { RouteObject } from "react-router-dom";
import UnauthorizedAdminRoutes from "./none-auth/unauthorized-admin-routes";
import UnauthorizedClientRoutes from "./none-auth/unauthorized-client-routes";
const authRoutes: RouteObject[] = [
  {
    path: "/sign-in",
    element: (
      <UnauthorizedClientRoutes>
        <SignIn />
      </UnauthorizedClientRoutes>
    ),
  },
  {
    path: "/sign-up",
    element: (
      <UnauthorizedClientRoutes>
        <SignUp />
      </UnauthorizedClientRoutes>
    ),
  },
  {
    path: "/send-otp",
    element: (
      <UnauthorizedClientRoutes>
        <AuthenticationOtp />
      </UnauthorizedClientRoutes>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <UnauthorizedClientRoutes>
        <ResetPassword />
      </UnauthorizedClientRoutes>
    ),
  },
  {
    path: "staff/sign-in",
    element: (
      <UnauthorizedAdminRoutes>
        <SignInStaff />
      </UnauthorizedAdminRoutes>
    ),
  },
];
export default authRoutes;
