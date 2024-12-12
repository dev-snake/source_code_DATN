const CakeModel = require('@/models/CakeModel')
const RecipeModel = require('@/models/RecipeModel')
const MaterialService = require('@/services/MaterialService')
const pagination = require('@/utils/pagination')

const MapResponseMessage = require("@/utils/response-message/vi-VN")

class RecipeService {
	getListCakeUseRecipe = async (recipeId, queryParams) => {
		try {
			const listCakes = await pagination(
				CakeModel,
				{ ...queryParams, cakeRecipe: { $in: [recipeId] } },
				null,
				{
					populate: [
						{
							path: 'cakeRecipe',
						},
					],
				}
			)
			return listCakes
		} catch (error) {
			throw new Error(error)
		}
	}
	getAll = async (queryParams, advancedFields) => {
		try {
			const {
				page,
				limit,
				noPagination,
				paginatedData,
				totalPages,
				totalRecords,
			} = await pagination(RecipeModel, queryParams, advancedFields)

			return {
				page,
				limit,
				noPagination,
				paginatedData,
				totalPages,
				totalRecords,
			}
		} catch (error) {
			throw new Error(error)
		}
	}
	getById = async (recipeId) => {
		try {
			const freshRecipe = await RecipeModel.findById(recipeId).select('-__v')
			return freshRecipe
		} catch (error) {
			throw new Error(error)
		}
	}
	getByIdWithCondition = async (recipeId, options) => {
		try {
			let query = RecipeModel.findById(recipeId).select('-__v')

			Object.keys(options).forEach((key) => {
				if (typeof query[key] === 'function') {
					query = query[key](options[key])
				}
			})

			const freshRecipe = await query
			return freshRecipe
		} catch (error) {
			throw new Error(error)
		}
	}
	create = async (recipeObj) => {
		try {
			const recipe = await RecipeModel.create(recipeObj)
			return recipe
		} catch (error) {
			throw new Error(error)
		}
	}
	update = async (recipeId, recipeObj) => {
		try {
			const updatedRecipe = await RecipeModel.findByIdAndUpdate(
				recipeId,
				recipeObj,
				{
					new: true,
					runValidators: true,
				}
			)
			return updatedRecipe
		} catch (error) {
			throw new Error(error)
		}
	}
	delete = async (recipeId) => {
		try {
			const isDeleted = await RecipeModel.deleteOne({ _id: recipeId })
			return isDeleted ? true : false
		} catch (error) {
			throw new Error(error)
		}
	}

	softDeletionRecipe = async (recipeId) => {
		const recipeData = await RecipeModel.findById(recipeId).lean();

		if (!recipeData) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notFound("Công thức")
			}
		}

		if (recipeData.isDeleted) {
			return {
				isSuccess: false,
				message: MapResponseMessage.alreadyDeleted("Công thức")
			}
		}

		return Promise.all([
			CakeModel.updateMany({ cakeRecipe: recipeId }, { cakeRecipe: null, isHide: true }),
			RecipeModel.findByIdAndUpdate(recipeId, { isDeleted: true })
		]).then(() => {
			return {
				isSuccess: true,
				message: MapResponseMessage.successDeleted("Công thức")
			}
		})
	}

	recoverRecipe = async (recipeId) => {
		const recipeData = await RecipeModel.findById(recipeId).lean();

		if (!recipeData) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notFound("Công thức")
			}
		}

		if (!recipeData.isDeleted) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notInSoftDeletionState("recover")
			}
		}

		await RecipeModel.findByIdAndUpdate(recipeId, { isDeleted: false })

		return {
			isSuccess: true,
			message: MapResponseMessage.successRecover("Công thức")
		}
	}


	hardDeletionRecipe = async (recipeId) => {
		const recipeData = await RecipeModel.findById(recipeId).lean();

		if (!recipeData) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notFound("Công thức")
			}
		}

		if (!recipeData.isDeleted) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notInSoftDeletionState("delete")
			}
		}

		const listCakesUseRecipe = await CakeModel.find({
			cakeRecipe: recipeId
		}).lean();

		if (listCakesUseRecipe.length > 0) {
			return {
				isSuccess: false,
				message: MapResponseMessage.hasRelatedData("Công thức")
			}
		}

		await RecipeModel.findByIdAndDelete(recipeId);

		return {
			isSuccess: true,
			message: MapResponseMessage.successDeleted("Công thức")
		}
	}
}

module.exports = new RecipeService()
