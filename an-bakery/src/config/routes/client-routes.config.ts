const BASE_CLIENT_URL: string = "";

const clientRoutes = {
  home: "/",
  cakes: {
    root: "/cakes",
    details: (cakeId: string) => `${BASE_CLIENT_URL}/cakes/${cakeId}`,
  },
  auth: {
    root: "/",
    signIn: "/sign-in",
    signUp: "/sign-up",
    forgotPassword: "/forgot-password",
  },
  profile: {
    root: "/profile",
    addAddress: "/profile/add-address",
    orderDetail: (orderId: string) => `/profile/order/${orderId}`,
    editAddress: (addressId: string) => `/profile/${addressId}/edit-address`,
  },
  cart: {
    root: "/cart",
  },
  orderSteps: {
    root: "/order-steps",
    success: "/order-steps/order-success",
  },
  faqs: {
    root: "/faqs",
  },
  policy: {
    root: "/policy",
  },
};
export default clientRoutes;
