const express = require('express')
const router = express.Router()

const BranchController = require('@/controllers/BranchController')
const { validateOptionalParams } = require('@/middlewares/optional-params')
const { validateRequiredParams } = require('@/middlewares/required-params')
const { validateForbiddenParams } = require('@/middlewares/forbidden-params')
const { staffTokenMiddleware } = require('@/middlewares/token-middlewares')
const { requiredRole } = require('@/middlewares/role-validate')

router
	.route('/')
	.get(BranchController.getAll)
	.post(
		validateRequiredParams(['branchConfig', 'businessProducts']),
		BranchController.createBranch
	)

router.get('/inventory/materials', BranchController.getBranchHasMaterial)

router.get('/:id/business-products', BranchController.getBusinessProducts)
router.get(
	'/:id/suppliers',
	staffTokenMiddleware,
	BranchController.getListSupplier
)
router.patch(
	'/:id/business-products',
	validateOptionalParams(['businessProducts']),
	BranchController.updateBusinessProducts
)

router.get(
	'/:branchId/staffs',
	staffTokenMiddleware,
	requiredRole(1),
	BranchController.getStaffOfBranch
)

router.get(
	'/:id/vouchers',
	// staffTokenMiddleware,
	BranchController.getListVouchersOfBranch
)

router.get('/:id/inventory', BranchController.getBranchInventory)
router.patch(
	'/:id/inventory/materials',
	validateOptionalParams(['requestId']),
	BranchController.updateBranchMaterialsInventory
)

router.patch(
	'/:id/inventory/cakes',
	validateOptionalParams(['orderId']),
	BranchController.updateBranchCakesInventory
)
router.get(
	'/:id/orders',
	staffTokenMiddleware,
	BranchController.getBranchOrders
)
router.patch('/:id/visibility', BranchController.toggleVisibility)

router
	.route('/:id/import-requests')
	.get(staffTokenMiddleware, BranchController.getImportRequests)
	.post(
		staffTokenMiddleware,
		validateRequiredParams([
			'supplierId',
			'branchId',
			'requestItems',
			'requestTotalPrice',
		]),
		BranchController.createImportRequests
	)
router
	.route('/:id/import-requests/:requestId')
	.patch(
		staffTokenMiddleware,
		requiredRole(0),
		validateOptionalParams(['requestItems', 'requestTotalPrice']),
		validateForbiddenParams([
			'importDate',
			'supplierId',
			'branchId',
			'isCancelled',
			'cancelledReason',
		]),
		BranchController.updateImportRequests
	)
router
	.route('/:id/import-requests/:requestId/cancel')
	.patch(
		staffTokenMiddleware,
		requiredRole(1),
		validateRequiredParams(['isCancelled', 'cancelledReason']),
		BranchController.cancelImportRequests
	)

router.patch(
	'/:branchId/delete',
	staffTokenMiddleware,
	requiredRole(2),
	BranchController.softDeleteBranch
)
router.patch(
	'/:branchId/recover',
	staffTokenMiddleware,
	requiredRole(2),
	BranchController.recoverBranch
)

router.patch(
	'/:branchId/remove-materials',
	validateRequiredParams(['materialId', 'removeWeight']),
	staffTokenMiddleware,
	requiredRole(1),
	BranchController.removeExpiredMaterial
)

router
	.route('/:id')
	.get(BranchController.getOne)
	.patch(
		validateOptionalParams([
			'branchDisplayName',
			'activeTime',
			'branchType',
			'branchAddress',
			'branchContact',
			'mapLink',
		]),
		validateForbiddenParams(['isActive']),
		BranchController.updateInfomationBranch
	)
	.delete(BranchController.hardDeleteBranch)

module.exports = router
