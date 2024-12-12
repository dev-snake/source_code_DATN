const RecipeService = require('@/services/RecipeService')
const MapResponseMessage = require("@/utils/response-message/vi-VN");

class RecipeController {
	getAll = async (req, res, next) => {
		try {
			const {
				page,
				limit,
				noPagination,
				paginatedData,
				totalPages,
				totalRecords,
			} = await RecipeService.getAll(req.query, ['recipeName'])

			if (!noPagination) {
				if (req.query.page && page > totalPages) {
					return next({
						status: 400,
						message: MapResponseMessage.notExistPage(totalPages),
					})
				}
			}


			return res.status(200).json({
				status: "success",
				message: paginatedData.length > 0
					? noPagination
						? MapResponseMessage.successGetAllWithoutPagination("Công thức")
						: MapResponseMessage.successGetAllWithPagination("Công thức", page)
					: MapResponseMessage.successWithEmptyData("Công thức"),

				metadata: {
					currentPage: noPagination ? 1 : page,
					limitPerPage: noPagination ? null : limit,
					totalPages: noPagination ? 1 : totalPages,
					totalRecords,
					countRecords: paginatedData.length,
				},
				results: paginatedData,
			})
		} catch (error) {
			return next({
				status: 500,
				error
			})
		}
	}
	getListCakeUseRecipe = async (req, res, next) => {
		try {
			const freshRecipe = await RecipeService.getById(req.params.id)
			if (!freshRecipe) {
				return next({
					status: 404,
					message: MapResponseMessage.notFound("Công thức"),
				})
			}
			const {
				page,
				limit,
				noPagination,
				paginatedData,
				totalPages,
				totalRecords,
			} = await RecipeService.getListCakeUseRecipe(req.params.id, req.query)

			if (!noPagination) {
				if (req.query.page && page > totalPages) {
					return next({
						status: 404,
						message: MapResponseMessage.notExistPage(totalPages),
					})
				}
			}

			return res.status(200).json({
				status: "success",
				message: paginatedData.length > 0
					? noPagination
						? MapResponseMessage.successGetAllWithoutPagination("Bánh sử dụng Công thức này")
						: MapResponseMessage.successGetAllWithPagination("Bánh sử dụng Công thức này", page)
					: MapResponseMessage.successWithEmptyData("Bánh nào"),
				results: paginatedData,
				metadata: {
					currentPage: noPagination ? 1 : page,
					limitPerPage: noPagination ? null : limit,
					totalPages: noPagination ? 1 : totalPages,
					totalRecords,
					countRecords: paginatedData.length,
				},
			})
		} catch (error) {
			return next({
				status: 500,
				error
			})
		}
	}
	getOne = async (req, res, next) => {
		try {
			const freshRecipe = await RecipeService.getByIdWithCondition(
				req.params.id,
				{
					populate: [
						{
							path: 'recipeIngredients.materialId',
							model: 'Material',
						},
						{
							path: 'recipeVariants.variantItems.materialId',
							model: 'Material',
						},
					],
				}
			)
			if (!freshRecipe) {
				return next({
					status: 404,
					message: MapResponseMessage.notFound("Công thức"),
				})
			}
			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successGetOne("Công thức"),
				metadata: {
					recipeId: freshRecipe._id,
					recipeName: freshRecipe.recipeName,
				},
				results: freshRecipe,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}
	createRecipe = async (req, res, next) => {
		try {
			const recipe = await RecipeService.create({
				...req.body,
				creatorId: req.staffCode,
			})
			return res.status(201).json({
				status: 'success',
				message: MapResponseMessage.successCreate("Công thức"),
				results: recipe,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}
	updateRecipe = async (req, res, next) => {
		try {
			const freshRecipe = await RecipeService.getById(req.params.id)
			if (!freshRecipe) {
				return next({
					status: 404,
					message: MapResponseMessage.notFound("Công thức"),
				})
			}
			const updatedRecipe = await RecipeService.update(req.params.id, {
				...req.body,
				creatorId: req.staffCode,
			})
			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successUpdate("Công thức"),
				results: updatedRecipe,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}
	deleteRecipe = async (req, res, next) => {
		try {
			const freshRecipe = await RecipeService.getById(req.params.id)
			if (!freshRecipe) {
				return next({
					status: 404,
					message: MapResponseMessage.notFound("Công thức"),
				})
			}
			await RecipeService.delete(req.params.id)
			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successDeleted("Công thức"),
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}
	softDeleteRecipe = async (req, res, next) => {
		try {
			const { recipeId } = req.params;

			const { isSuccess, message } = await RecipeService.softDeletionRecipe(recipeId);

			if (!isSuccess) {
				return next({
					status: 404,
					message,
				})
			}

			return res.status(200).json({
				status: "success",
				message,
			})

		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}
	recoverRecipe = async (req, res, next) => {
		try {
			const { recipeId } = req.params;

			const { isSuccess, message } = await RecipeService.recoverRecipe(recipeId)

			if (!isSuccess) {
				return next({
					status: 404,
					message,
				})
			}

			return res.status(200).json({
				status: "success",
				message,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	hardDeleteRecipe = async (req, res, next) => {
		try {
			const { id: recipeId } = req.params;
			const { isSuccess, message } = await RecipeService.hardDeletionRecipe(recipeId);

			if (!isSuccess) {
				return next({
					status: 404,
					message,
				})
			}

			return res.status(200).json({
				status: "success",
				message,
			})

		} catch (error) {
			return next({
				status: 500,
				error
			})
		}
	}
}

module.exports = new RecipeController()
