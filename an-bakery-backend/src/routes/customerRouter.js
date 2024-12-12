const express = require('express')
const router = express.Router()

const CustomerController = require('@/controllers/CustomerController')
const CartController = require('@/controllers/CartController')

const {
  customerTokenMiddleware,
  staffTokenMiddleware,
} = require('@/middlewares/token-middlewares')
const { validateRequiredParams } = require('@/middlewares/required-params')
const { requiredRole } = require('@/middlewares/role-validate')
const { validateOptionalParams } = require('@/middlewares/optional-params')

router.get('/', CustomerController.getAllCustomers)
router.get('/me', customerTokenMiddleware, CustomerController.getMyInfo)
router.patch(
  '/me',
  customerTokenMiddleware,
  validateRequiredParams(['userName']),
  CustomerController.updateCustomerInfo
)

router.get(
  '/me/cart',
  customerTokenMiddleware,
  CustomerController.getCurrentCart
)
router.get(
  '/me/orders',
  customerTokenMiddleware,
  CustomerController.getMyOrders
)
router.get(
  '/me/addresses',
  customerTokenMiddleware,
  CustomerController.getCustomerAddresses
)
router.post(
  '/me/addresses',
  validateRequiredParams(['fullName', 'email', 'phoneNumber', 'fullAddress']),
  customerTokenMiddleware,
  CustomerController.createNewAddress
)
router.get(
  '/me/feedbacks',
  customerTokenMiddleware,
  CustomerController.getListFeedbacks
)
router.get(
  '/me/addresses/:addressId',
  customerTokenMiddleware,
  CustomerController.getAddressInfo
)
router.patch(
  '/me/addresses/:addressId',
  validateOptionalParams(['fullName', 'email', 'phoneNumber', 'fullAddress']),
  customerTokenMiddleware,
  CustomerController.updateCustomerAddress
)
router.delete(
  '/me/addresses/:addressId',
  customerTokenMiddleware,
  CustomerController.deleteCustomerAddress
)

router.get('/:customerId', CustomerController.getCustomerInfoById)

router.post(
  '/change-pwd',
  customerTokenMiddleware,
  validateRequiredParams(['otpCode', 'newPassword', 'oldPassword']),
  CustomerController.changePassword
)

router.get(
  '/:customerId/cart',
  staffTokenMiddleware,
  CustomerController.getCustomerCart
)
router.get(
  '/:customerId/orders',
  customerTokenMiddleware,
  CustomerController.getCustomerOrders
)
router.get(
  '/:customerId/vouchers',
  customerTokenMiddleware,
  CustomerController.getListVouchers
)
router.post(
  '/:customerId/block',
  validateRequiredParams(['blockReason']),
  staffTokenMiddleware,
  requiredRole(2),
  CustomerController.blockCustomer
)
router.post(
  '/:customerId/unblock',
  staffTokenMiddleware,
  requiredRole(2),
  CustomerController.unblockCustomer
)

module.exports = router
