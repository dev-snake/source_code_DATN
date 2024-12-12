const express = require('express')
const router = express.Router()

const ImportRequestController = require('@/controllers/ImportRequestController')
const { staffTokenMiddleware } = require('@/middlewares/token-middlewares')
const { requiredRole } = require('@/middlewares/role-validate')
const { validateForbiddenParams } = require('@/middlewares/forbidden-params')
const { validateOptionalParams } = require('@/middlewares/optional-params')

router
	.route('/')
	.get(staffTokenMiddleware, ImportRequestController.getAll)

router.route('/:id').get(ImportRequestController.getOne)
router
	.route('/:id/status')
	.patch(
		staffTokenMiddleware,
		requiredRole(1),
		validateOptionalParams(['requestStatus', 'requestItems']),
		validateForbiddenParams([
			'supplierId',
			'branchId',
			'requestTotalPrice',
			'isCancelled',
			'cancelledReason',
			'importDate',
		]),
		ImportRequestController.updateRequestStatus
	)

module.exports = router
