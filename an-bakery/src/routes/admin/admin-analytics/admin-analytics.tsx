import Analytics from "@/pages/admin/analytics";
import { RouteObject } from "react-router-dom";

const adminAnalyticsRoutes: RouteObject[] = [
  {
    path: "analytics",
    element: <Analytics />,
  },
];
export default adminAnalyticsRoutes;
