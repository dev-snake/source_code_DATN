const express = require('express')
const router = express.Router()

const { validateRequiredParams } = require('@/middlewares/required-params')
const { validateOptionalParams } = require('@/middlewares/optional-params')

const MaterialController = require('@/controllers/MaterialController')
const { staffTokenMiddleware } = require('@/middlewares/token-middlewares')
const { requiredRole } = require('@/middlewares/role-validate')

router
  .route('/')
  .get(MaterialController.getAll)
  .post(
    staffTokenMiddleware,
    requiredRole(2),
    validateRequiredParams(['materialName', 'materialType', 'calUnit']),
    MaterialController.createMaterial
  )
router.route('/:id/analytics').get(MaterialController.getAnalyticsForMaterials)

router
  .route('/:id')
  .get(MaterialController.getOne)
  .patch(
    staffTokenMiddleware,
    requiredRole(2),
    validateOptionalParams(['materialName', 'materialType', 'calUnit']),
    MaterialController.updateMaterial
  )
  .delete(
    staffTokenMiddleware,
    requiredRole(2),
    MaterialController.hardDeleteMaterial
  )

router.get(
  '/:id/suppliers',
  staffTokenMiddleware,
  requiredRole(1),
  MaterialController.getSuppliers
)

router.get(
  '/:materialId/branches',
  staffTokenMiddleware,
  MaterialController.getListBranches
)

router.get(
  '/:materialId/recipes',
  staffTokenMiddleware,
  MaterialController.getListRecipesUsingMaterial
)

router.patch(
  '/:materialId/delete',
  staffTokenMiddleware,
  MaterialController.softDeleteMaterial
)
router.patch(
  '/:materialId/recover',
  staffTokenMiddleware,
  MaterialController.recoverMaterial
)

module.exports = router
