const express = require('express')
const router = express.Router()

const { validateRequiredParams } = require('@/middlewares/required-params')
const { validateOptionalParams } = require('@/middlewares/optional-params')

const RecipeController = require('@/controllers/RecipeController')
const { staffTokenMiddleware } = require('@/middlewares/token-middlewares')
const { requiredRole } = require('@/middlewares/role-validate')

router
	.route('/')
	.get(RecipeController.getAll)
	.post(
		staffTokenMiddleware,
		requiredRole(2),
		validateRequiredParams([
			'recipeName',
			'recipeIngredients',
			'recipeInstructions',
			'recipeServings',
			'cookTime',
		]),
		RecipeController.createRecipe
	)


router.patch("/:recipeId/delete", staffTokenMiddleware, requiredRole(2), RecipeController.softDeleteRecipe)
router.patch("/:recipeId/recover", staffTokenMiddleware, requiredRole(2), RecipeController.recoverRecipe)
router
	.route('/:id')
	.get(RecipeController.getOne)
	.patch(
		staffTokenMiddleware,
		requiredRole(2),
		validateOptionalParams([
			'recipeName',
			'recipeIngredients',
			'recipeVariants',
			'recipeInstructions',
			'recipeServings',
			'cookTime',
		]),
		RecipeController.updateRecipe
	)
	.delete(staffTokenMiddleware, requiredRole(2), RecipeController.hardDeleteRecipe)

router
	.route('/:id/cakes')
	.get(
		staffTokenMiddleware,
		requiredRole(2),
		RecipeController.getListCakeUseRecipe
	)

module.exports = router
