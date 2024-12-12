const express = require('express')
const router = express.Router()

const { validateRequiredParams } = require('@/middlewares/required-params')
const { validateOptionalParams } = require('@/middlewares/optional-params')

const SupplierController = require('@/controllers/SupplierController')
const { staffTokenMiddleware } = require('@/middlewares/token-middlewares')
const { requiredRole } = require('@/middlewares/role-validate')

router
	.route('/')
	.get(staffTokenMiddleware, requiredRole(1), SupplierController.getAll)
	.post(
		staffTokenMiddleware,
		requiredRole(1),
		validateRequiredParams([
			'supplierName',
			'supplierContact',
			'supplierContactPerson',
			'supplierPriority',
			'supplyItems',
			'supplierDescription',
			'branchId',
		]),
		SupplierController.createSupplier
	)

router
	.route('/:id')
	.get(SupplierController.getOne)
	.patch(
		staffTokenMiddleware,
		requiredRole(1),
		validateOptionalParams([
			'supplierName',
			'supplierContact',
			'supplierContactPerson',
			'supplierPriority',
			'supplyItems',
			'supplierDescription',
			'branchId',
		]),
		SupplierController.updateSupplier
	)
	.delete(
		staffTokenMiddleware,
		requiredRole(2),
		SupplierController.hardDeleteSupplier
	)

router.get(
	'/:id/import-request',
	staffTokenMiddleware,
	requiredRole(1),
	SupplierController.getImportRequests
)
router.get(
	'/:id/materials',
	staffTokenMiddleware,
	requiredRole(1),
	SupplierController.getListMaterialProvided
)

router.patch(
	"/:supplierId/delete",
	staffTokenMiddleware,
	requiredRole(2),
	SupplierController.softDeleteSupplier
)

router.patch(
	"/:supplierId/recover",
	staffTokenMiddleware,
	requiredRole(2),
	SupplierController.recoverSupplier
)

module.exports = router
