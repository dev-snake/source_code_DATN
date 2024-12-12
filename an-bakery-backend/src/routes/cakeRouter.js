const express = require('express')
const router = express.Router()

const CakeController = require('@/controllers/CakeController')
const { validateRequiredParams } = require('@/middlewares/required-params')
const {
	staffTokenMiddleware,
	customerTokenMiddleware,
} = require('@/middlewares/token-middlewares')
const { validateForbiddenParams } = require('@/middlewares/forbidden-params')
const { requiredRole } = require('@/middlewares/role-validate')

router.get('/', CakeController.getAllCakes)
router.post(
	'/',
	validateRequiredParams([
		'cakeName',
		'cakeCategory',
		'cakeDescription',
		'cakeThumbnail',
		'cakeMedias',
		'cakeDefaultPrice',
		'cakeProperties',
		'cakeRecipe',
		'discountPercents',
	]),
	staffTokenMiddleware,
	requiredRole(2),
	CakeController.createNewCake
)

router.get('/:cakeId', CakeController.getCakeInfo)
router.get('/:cakeId/branches', CakeController.getListBranches)
router.post('/:cakeId/views', CakeController.increaseView)

router.patch(
	"/:cakeId/delete",
	staffTokenMiddleware,
	requiredRole(2),
	CakeController.softDeleteCake
)

router.patch(
	"/:cakeId/recover",
	staffTokenMiddleware,
	requiredRole(2),
	CakeController.recoverCake
)

router.patch(
	'/:cakeId',
	validateForbiddenParams(['_id', 'views', 'soldCount', 'creatorId', 'rates']),
	staffTokenMiddleware,
	requiredRole(2),
	CakeController.updateCakeInfo
)


router.get('/:cakeId/recipe', CakeController.getCakeRecipe)

router.post(
	'/:cakeId/rates',
	customerTokenMiddleware,
	validateRequiredParams(['rateContent', 'rateStars']),
	CakeController.createNewRate
)

router.patch(
	'/:cakeId/rate-visibility',
	customerTokenMiddleware,
	validateRequiredParams(['rateId', 'isHide']),
	CakeController.hideRate
)

router.patch(
	'/:cakeId/delete-rate',
	customerTokenMiddleware,
	validateRequiredParams(['rateId', 'isDeleted']),
	CakeController.softDeletedRate
)


router.delete(
	'/:cakeId/delete-rate/:rateId',
	staffTokenMiddleware,
	requiredRole(2),
	CakeController.forceDeletedRate
)

router.delete(
	'/:cakeId',
	staffTokenMiddleware,
	requiredRole(2),
	CakeController.hardDeleteCake
)

module.exports = router
