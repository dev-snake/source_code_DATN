const express = require('express')
const router = express.Router()

const { validateRequiredParams } = require('@/middlewares/required-params')

const OrderController = require('@/controllers/OrderController')
const {
  staffTokenMiddleware,
  customerTokenMiddleware,
} = require('@/middlewares/token-middlewares')
const { requiredRole } = require('@/middlewares/role-validate')

router
  .route('/group')
  .post(
    customerTokenMiddleware,
    validateRequiredParams([
      'subTotalPrice',
      'totalPrice',
      'shippingFee',
      'customerInfo',
      'customerId',
      'paymentStatus',
      'orderType',
      'orderData',
    ]),
    OrderController.createOrderGroup
  )

router
  .route('/self')
  .post(
    staffTokenMiddleware,
    validateRequiredParams([
      'subTotalPrice',
      'totalPrice',
      'shippingFee',
      'paymentStatus',
      'orderType',
      'orderData',
    ]),
    OrderController.createSelfOrder
  )

router
  .route('/group/:id/payment')
  .patch(
    validateRequiredParams(['paymentStatus']),
    OrderController.updatePaymentStatusGroup
  )

router
  .route('/')
  .get(staffTokenMiddleware, requiredRole(2), OrderController.getAll)

router.get(
  '/analytics',
  staffTokenMiddleware,
  requiredRole(2),
  OrderController.getAnalytics
)

router.route('/:id').get(OrderController.getOne)
router.route('/group/:id').get(OrderController.getOrderByGroupId)
router
  .route('/:id/destroy')
  .patch(
    validateRequiredParams(['orderStatus', 'explainReason']),
    OrderController.destroyOrder
  )
router
  .route('/:id/status')
  .patch(
    staffTokenMiddleware,
    requiredRole(0),
    validateRequiredParams(['orderStatus']),
    OrderController.updateOrderStatus
  )

router.post(
  '/:orderId/rates',
  customerTokenMiddleware,
  validateRequiredParams(['cakePayload', 'rateContent', 'rateStars']),
  OrderController.rateCakeInOrder
)

module.exports = router
