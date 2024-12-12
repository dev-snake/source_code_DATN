const BASE_ADMIN_URL: string = "/admin";
const adminRoutes = {
  dashboard: "/admin",
  cakes: {
    root: `${BASE_ADMIN_URL}/cakes-management/`,
    details: (cakeId: string) => `${BASE_ADMIN_URL}/cakes-management/${cakeId}`,
    create: `${BASE_ADMIN_URL}/cakes-management/create`,
    edit: (cakeId: string) => `${BASE_ADMIN_URL}/cakes-management/${cakeId}/edit`,
    delete: (cakeId: string) => `${BASE_ADMIN_URL}/cakes-management/${cakeId}`,
  },
  branchCakes: {
    root: `${BASE_ADMIN_URL}/business-products/`,
    details: (cakeId: string) => `${BASE_ADMIN_URL}/business-products/${cakeId}`,
  },
  staff: {
    root: `${BASE_ADMIN_URL}/staff-management/`,
    create: `${BASE_ADMIN_URL}/staff-management/create`,
    edit: (staffId: string) => `${BASE_ADMIN_URL}/staff-management/${staffId}/edit`,
    delete: (staffId: string) => `${BASE_ADMIN_URL}/staff-management/${staffId}`,
    details: (staffId: string) => `${BASE_ADMIN_URL}/staff-management/${staffId}`,
  },
  materials: {
    root: `${BASE_ADMIN_URL}/materials-management/`,
    create: `${BASE_ADMIN_URL}/materials-management/create`,
    edit: (materialId: string) => `${BASE_ADMIN_URL}/materials-management/${materialId}/edit`,
    delete: (materialId: string) => `${BASE_ADMIN_URL}/materials-management/${materialId}`,
    details: (materialId: string) => `${BASE_ADMIN_URL}/materials-management/${materialId}`,
  },
  authStaff: {
    signIn: "/staff/sign-in",
  },
  customer: {
    root: `${BASE_ADMIN_URL}/customers-management/`,
    edit: (userId: string) => `${BASE_ADMIN_URL}/customers-management/${userId}/edit`,
    delete: (userId: string) => `${BASE_ADMIN_URL}/customers-management/${userId}`,
    details: (userId: string) => `${BASE_ADMIN_URL}/customers-management/${userId}`,
  },
  category: {
    root: `${BASE_ADMIN_URL}/categories-management/`,
    create: `${BASE_ADMIN_URL}/categories-management/create`,
    edit: (categoryId: string) => `${BASE_ADMIN_URL}/categories-management/${categoryId}/edit`,
    delete: (categoryId: string) => `${BASE_ADMIN_URL}/categories-management/${categoryId}`,
    details: (categoryId: string) => `${BASE_ADMIN_URL}/categories-management/${categoryId}`,
  },
  order: {
    root: `${BASE_ADMIN_URL}/orders-management/`,
    create: `${BASE_ADMIN_URL}/orders-management/create`,
    delete: (orderId: string) => `${BASE_ADMIN_URL}/orders-management/${orderId}`,
    details: (orderId: string) => `${BASE_ADMIN_URL}/orders-management/${orderId}`,
  },
  branchOrder: {
    root: `${BASE_ADMIN_URL}/branch-orders-management/`,
    details: (orderId: string) => `${BASE_ADMIN_URL}/branch-orders-management/${orderId}`,
  },
  voucher: {
    root: `${BASE_ADMIN_URL}/vouchers-management/`,
    create: `${BASE_ADMIN_URL}/vouchers-management/create`,
    delete: (voucherId: string) => `${BASE_ADMIN_URL}/vouchers-management/${voucherId}`,
    edit: (voucherId: string) => `${BASE_ADMIN_URL}/vouchers-management/${voucherId}/edit`,
    details: (voucherId: string) => `${BASE_ADMIN_URL}/vouchers-management/${voucherId}`,
  },
  supplier: {
    root: `${BASE_ADMIN_URL}/suppliers-management/`,
    create: `${BASE_ADMIN_URL}/suppliers-management/create`,
    edit: (supplierId: string) => `${BASE_ADMIN_URL}/suppliers-management/${supplierId}/edit`,
    delete: (supplierId: string) => `${BASE_ADMIN_URL}/suppliers-management/${supplierId}`,
    details: (supplierId: string) => `${BASE_ADMIN_URL}/suppliers-management/${supplierId}`,
  },
  branchPlan: {
    root: `${BASE_ADMIN_URL}/branch-plans-management/`,
    create: `${BASE_ADMIN_URL}/branch-plans-management/create`,
    edit: (planId: string) => `${BASE_ADMIN_URL}/branch-plans-management/${planId}/edit`,
    delete: (planId: string) => `${BASE_ADMIN_URL}/branch-plans-management/${planId}`,
    details: (planId: string) => `${BASE_ADMIN_URL}/branch-plans-management/${planId}`,
  },
  branch: {
    root: `${BASE_ADMIN_URL}/branches-management/`,
    create: `${BASE_ADMIN_URL}/branches-management/create`,
    delete: (branchId: string) => `${BASE_ADMIN_URL}/branches-management/${branchId}`,
    edit: (branchId: string) => `${BASE_ADMIN_URL}/branches-management/${branchId}/edit`,
    details: (branchId: string) => `${BASE_ADMIN_URL}/branches-management/${branchId}`,
  },
  branchConfig: {
    root: `${BASE_ADMIN_URL}/branch-config`,
    edit: `${BASE_ADMIN_URL}/branch-config/edit`,
  },
  cakeRecipe: {
    root: `${BASE_ADMIN_URL}/cake-recipe-management/`,
    create: `${BASE_ADMIN_URL}/cake-recipe-management/create`,
    delete: (cakeRecipeId: string) => `${BASE_ADMIN_URL}/cake-recipe-management/${cakeRecipeId}`,
    edit: (cakeRecipeId: string) => `${BASE_ADMIN_URL}/cake-recipe-management/${cakeRecipeId}/edit`,
    details: (cakeRecipeId: string) => `${BASE_ADMIN_URL}/cake-recipe-management/${cakeRecipeId}`,
  },
  importRequests: {
    root: `${BASE_ADMIN_URL}/import-requests-management/`,
    new: `${BASE_ADMIN_URL}/import-requests-management/new`,
    edit: (requestId: string) => `${BASE_ADMIN_URL}/import-requests-management/${requestId}`,
    details: (requestId: string) => `${BASE_ADMIN_URL}/import-requests-management/${requestId}`,
  },
};

export default adminRoutes;
