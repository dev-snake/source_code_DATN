const CakeService = require('@/services/CakeService')
const RateService = require('@/services/RateService')

const MapResponseMessage = require("@/utils/response-message/vi-VN")

class CakeController {
	constructor() {
		this.createNewCake = this.createNewCake.bind(this)
		this.updateCakeInfo = this.updateCakeInfo.bind(this)
		this.getListBranches = this.getListBranches.bind(this)
	}

	async getAllCakes(req, res, next) {
		try {
			const {
				page,
				limit,
				noPagination,
				paginatedData,
				totalPages,
				totalRecords,
			} = await CakeService.getAllCakesWithPagination(req.query)

			if (!noPagination) {
				if (page > totalPages) {
					return next({
						status: 404,
						message: MapResponseMessage.notExistPage(totalPages),
					})
				}
			}

			return res.status(200).json({
				status: 'success',
				message: paginatedData.length > 0 ?
					noPagination
						? MapResponseMessage.successGetAllWithoutPagination("Bánh")
						: MapResponseMessage.successGetAllWithPagination("Bánh", page)
					: MapResponseMessage.successWithEmptyData("Bánh"),
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
				error,
			})
		}
	}

	async getCakeInfo(req, res, next) {
		try {
			const { cakeId } = req.params

			const cakeData = await CakeService.getCakeInfoById(
				cakeId,
				['__v', 'creatorId', 'createdAt', 'updatedAt'],
				[
					{
						path: 'cakeRecipe',
					},
				]
			)

			if (!cakeData) {
				return next({
					status: 404,
					message: MapResponseMessage.notFound("Bánh"),
				})
			}

			const {
				rates,
				cakeProperties,
				cakeVariants,
				cakeMedias,
				cakeRecipe,
				...cakeInfo
			} = cakeData

			const cakeRates = rates
				? rates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
				: []

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successGetOne("Bánh"),
				metadata: {
					cakeId,
					cakeName: cakeData.cakeName,
				},
				results: {
					cakeInfo,
					cakeVariants,
					cakeProperties,
					cakeMedias,
					cakeRecipe,
					cakeRates: cakeRates,
				},
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async createNewCake(req, res, next) {
		try {
			const newCakeInfo = await CakeService.createCake(req.body, req.staffCode)

			return res.status(201).json({
				status: 'success',
				message: MapResponseMessage.successCreate("Bánh"),
				metadata: {
					cakeId: newCakeInfo._id,
					cakeName: newCakeInfo.cakeName,
				},
				results: newCakeInfo,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async updateCakeInfo(req, res, next) {
		try {
			const { cakeId } = req.params

			const newCakeInfo = await CakeService.updateCake(cakeId, req.body)

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successUpdate("Bánh"),
				metadata: {
					cakeId: cakeId,
					cakeName: newCakeInfo.cakeName,
				},
				results: newCakeInfo,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async increaseView(req, res, next) {
		try {
			const { cakeId } = req.params

			await CakeService.increaseView(cakeId)

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successUpdate("lượt xem bánh"),
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async deleteCake(req, res, next) {
		try {
			const { cakeId } = req.params

			await CakeService.deleteCake(cakeId)

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successDeleted("Bánh"),
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getListBranches(req, res, next) {
		try {
			const { cakeId } = req.params

			const listBranches = await CakeService.getListBranches(cakeId)

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successGetAllWithoutPagination("Chi nhánh kinh doanh bánh"),
				metadata: {
					cakeId,
					totalBranches: listBranches.length,
				},
				results: listBranches,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async createNewRate(req, res, next) {
		try {
			const { cakeId } = req.params

			console.log(await RateService.createNewRate(cakeId, req._id, req.body))

			return res.status(201).json({
				status: 'success',
				message: MapResponseMessage.successCreate("Đánh giá bánh"),
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async hideRate(req, res, next) {
		try {
			const { cakeId } = req.params
			const { rateId, isHide } = req.body

			await RateService.hideRate(cakeId, rateId, isHide)

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successUpdate(`${isHide ? "Ẩn" : "Hiện"} đánh giá`),
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async softDeletedRate(req, res, next) {
		try {
			const { cakeId } = req.params
			const { rateId, isDeleted } = req.body

			await RateService.softDeleteRate(cakeId, rateId, isDeleted)

			return res.status(200).json({
				status: 'success',
				message: isDeleted
					? MapResponseMessage.successDeleted("Đánh giá")
					: MapResponseMessage.successRecoverAccount("Đánh giá"),
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async forceDeletedRate(req, res, next) {
		try {
			const { cakeId, rateId } = req.params

			await RateService.forceDeleteRate(cakeId, rateId)

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successDeleted("Đánh giá"),
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getCakeRecipe(req, res, next) {
		try {
			const { cakeId } = req.params

			const cakeRecipe = await CakeService.getCakeRecipe(cakeId)

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successGetOne("Công thức bánh"),
				results: cakeRecipe,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async softDeleteCake(req, res, next) {
		try {
			const { cakeId } = req.params;

			const { isSuccess, message } = await CakeService.softDeletionCake(cakeId);

			if (!isSuccess) {
				return res.status(404).json({
					status: "failure",
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

	async recoverCake(req, res, next) {
		try {

			const { cakeId } = req.params;

			const { isSuccess, message } = await CakeService.recoverCake(cakeId);

			if (!isSuccess) {
				return res.status(404).json({
					status: "failure",
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

	async hardDeleteCake(req, res, next) {
		try {
			const { cakeId } = req.params;

			const { isSuccess, message } = await CakeService.hardDeletionCake(cakeId);

			if (!isSuccess) {
				return res.status(404).json({
					status: "failure",
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

module.exports = new CakeController()
