const express = require('express')
const router = express.Router()

const { validateRequiredParams } = require('@/middlewares/required-params')
const { validateOptionalParams } = require('@/middlewares/optional-params')

const PlanController = require('@/controllers/PlanController')
const { staffTokenMiddleware } = require('@/middlewares/token-middlewares')
const { requiredRole } = require('@/middlewares/role-validate')

router
  .route('/')
  .get(PlanController.getAll)
  .post(
    staffTokenMiddleware,
    requiredRole(1),
    validateRequiredParams([
      'planName',
      'planType',
      'planActivated',
      'branchId',
    ]),
    PlanController.createPlan
  )

router
  .route('/:id/queue-production')
  .patch(
    staffTokenMiddleware,
    requiredRole(1),
    validateRequiredParams(['orderId', 'orderItems', 'branchId']),
    PlanController.createOrderQueueProduction
  )

router
  .route('/:id')
  .get(PlanController.getOne)
  .patch(
    staffTokenMiddleware,
    requiredRole(1),
    validateOptionalParams([
      'planName',
      'planType',
      'planActivated',
      'planActivated',
    ]),
    PlanController.updatePlan
  )
  .delete(staffTokenMiddleware, requiredRole(1), PlanController.deletePlan)

router
  .route('/:id/status')
  .patch(
    staffTokenMiddleware,
    requiredRole(1),
    validateOptionalParams(['planStatus', 'totalMaterials']),
    PlanController.updatePlanStatus
  )

module.exports = router
