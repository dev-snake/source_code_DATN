import { createBrowserRouter } from "react-router-dom";
import adminRoutes from "./admin-routes";
import authRoutes from "./auth-routes";
import clientRoutes from "./client-routes";

const router = createBrowserRouter([...authRoutes, ...clientRoutes, ...adminRoutes]);

export default router;
