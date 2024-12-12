import ImportRequestManagement from "@/pages/admin/import-request-management";
import NewRequest from "@/pages/admin/import-request-management/new-request";
import RequestDetails from "@/pages/admin/import-request-management/request-details";
import { RouteObject } from "react-router-dom";

const adminImportRequests: RouteObject[] = [
  {
    path: "import-requests-management",
    element: <ImportRequestManagement />,
  },
  {
    path: "import-requests-management/new",
    element: <NewRequest />,
  },
  {
    path: "import-requests-management/:requestId",
    element: <RequestDetails />,
  },
];
export default adminImportRequests;
