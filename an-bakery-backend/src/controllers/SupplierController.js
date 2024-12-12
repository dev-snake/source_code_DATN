const SupplierService = require('@/services/SupplierService')
const MapResponseMessage = require("@/utils/response-message/vi-VN");

class SupplierController {
	getAll = async (req, res, next) => {
		try {
			const {
				page,
				limit,
				noPagination,
				paginatedData,
				totalPages,
				totalRecords,
			} = await SupplierService.getAll(req.query, [
				'supplierName',
				'supplierPriority',
				'supplierDescription',
			])

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
						? MapResponseMessage.successGetAllWithoutPagination("Nhà cung cấp")
						: MapResponseMessage.successGetAllWithPagination("Nhà cung cấp")
					: MapResponseMessage.successWithEmptyData("Nhà cung cấp"),
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
				error,
			})
		}
	}
	getImportRequests = async (req, res, next) => {
		try {
			const { id: supplierId } = req.params

			const importRequest = await SupplierService.getImportRequests(supplierId)

			return res.status(200).json({
				status: statusResponse.status,
				message: importRequest.length > 0
					? MapResponseMessage.successGetAllWithoutPagination("Yêu cầu nhập hàng của chi nhánh")
					: MapResponseMessage.successWithEmptyData("Yêu cầu nhập hàng"),
				metadata: {
					supplierId,
				},
				results: importRequest,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}
	getListMaterialProvided = async (req, res, next) => {
		try {
			const { id: supplierId } = req.params
			const freshSupplier = await SupplierService.getById(supplierId)
			if (!freshSupplier) {
				return next({
					status: 404,
					message: MapResponseMessage.notFound("Nhà cung cấp"),
				})
			}
			const listMaterialProvided =
				await SupplierService.getListMaterialProvided(supplierId)

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successGetAllWithoutPagination("Mặt hàng cung cấp của Nhà cung cấp"),
				metadata: {
					supplierId,
					supplierName: freshSupplier?.supplierName,
				},
				results: listMaterialProvided,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}
	getOne = async (req, res, next) => {
		try {
			const freshSupplier = await SupplierService.getById(req.params.id)
			if (!freshSupplier) {
				return next({
					status: 404,
					message: MapResponseMessage.notFound("Nhà cung cấp"),
				})
			}
			res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successGetOne("Nhà cung cấp"),
				metadata: {
					supplierId: freshSupplier._id,
					supplierName: freshSupplier.supplierName,
				},
				results: freshSupplier,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}
	createSupplier = async (req, res, next) => {
		try {
			const newSupplier = await SupplierService.create({
				...req.body,
				creatorId: req.staffCode,
			})
			return res.status(201).json({
				status: 'success',
				message: MapResponseMessage.successCreate("Nhà cung cấp"),
				metadata: {
					newSupplierId: newSupplier._id,
				},
				results: newSupplier,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}
	updateSupplier = async (req, res, next) => {
		try {
			const freshSupplier = await SupplierService.getById(req.params.id)
			if (!freshSupplier) {
				return next({
					status: 404,
					message: MapResponseMessage.notFound("Nhà cung cấp"),
				})
			}
			const updatedSupplier = await SupplierService.update(req.params.id, {
				...req.body,
				creatorId: req.staffCode,
			})
			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successUpdate("Nhà cung cấp"),
				results: updatedSupplier,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}
	deleteSupplier = async (req, res, next) => {
		try {
			const freshSupplier = await SupplierService.getById(req.params.id)
			if (!freshSupplier) {
				return next({
					status: 404,
					message: MapResponseMessage.notFound("Nhà cung cấp"),
				})
			}
			await SupplierService.delete(req.params.id)
			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successDeleted("Nhà cung cấp"),
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	softDeleteSupplier = async (req, res, next) => {
		try {
			const { supplierId } = req.params;
			const { isSuccess, message } = await SupplierService.softDeletionSupplier(supplierId)

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
	recoverSupplier = async (req, res, next) => {
		try {
			const { supplierId } = req.params;
			const { isSuccess, message } = await SupplierService.recoverSupplier(supplierId)

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
	hardDeleteSupplier = async (req, res, next) => {
		try {
			const { id: supplierId } = req.params;
			const { isSuccess, message } = await SupplierService.hardDeletionSupplier(supplierId)

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

}

module.exports = new SupplierController()
