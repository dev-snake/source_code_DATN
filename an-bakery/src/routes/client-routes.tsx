import RootLayout from "@/layouts/root-layout";
import BranchesList from "@/pages/branches-list";
import CakeMenu from "@/pages/cake-menu";
import CakeDetailsClient from "@/pages/cake-menu/cake-details";
import Cart from "@/pages/cart";
import ErrorPage from "@/pages/common/error";
import FaQs from "@/pages/faqs";
import HomePage from "@/pages/home-page";
import OrderSteps from "@/pages/order-steps";
import OrderSuccess from "@/pages/order-success";
import Pay from "@/pages/pay";
import Policy from "@/pages/policy";
import Profile from "@/pages/profile";
import AddAddress from "@/pages/profile/add-address";
import EditAddress from "@/pages/profile/edit-address";
import OrderDetail from "@/pages/profile/order-history/order-detail";
import VnpayReturn from "@/pages/vnpay-return";
import Vouchers from "@/pages/vouchers";
import { RouteObject } from "react-router-dom";

const clientRoutes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "branch-list",
        element: <BranchesList />,
      },
      {
        path: "cakes",
        element: <CakeMenu />,
      },
      {
        path: "cakes/:cakeId",
        element: <CakeDetailsClient />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "/profile/add-address",
        element: <AddAddress />,
      },
      {
        path: "/profile/:addressId/edit-address",
        element: <EditAddress />,
      },
      {
        path: "/profile/order/:orderId",
        element: <OrderDetail />,
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "order-steps",
        element: <OrderSteps />,
      },
      {
        path: "order-steps/order-success",
        element: <OrderSuccess />,
      },
      {
        path: "faqs",
        element: <FaQs />,
      },
      {
        path: "pay",
        element: <Pay />,
      },
      {
        path: "policy",
        element: <Policy />,
      },
      {
        path: "vouchers",
        element: <Vouchers />,
      },
      {
        path: "/order/vnpay_return",
        element: <VnpayReturn />,
      },
    ],
  },
];
export default clientRoutes;
