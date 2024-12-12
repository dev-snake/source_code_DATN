const VoucherModel = require("@/models/VoucherModel");
const pagination = require("@/utils/pagination");

const VoucherService = require("@/services/VoucherService");
const MapResponseMessage = require("@/utils/response-message/vi-VN");
const BranchService = require("@/services/BranchService");

class VoucherController {
	constructor() {
	}

	async checkUsabilityForOrder(req, res, next) {
		try {

			const { voucherCode, orderData } = req.body;

			const checkUsability = await VoucherService.checkVoucherUsability(req._id, voucherCode, orderData, null);

			if (!checkUsability.isOk) {
				return next({
					status: 400,
					message: checkUsability.message
				})
			}

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successUseVoucher,
				voucherData: checkUsability.voucherData
			});
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getAllVouchers(req, res, next) {
		try {
			const {
				page,
				limit,
				noPagination,
				paginatedData,
				totalPages,
				totalRecords
			} = await VoucherService.getAllVoucherWithPagination(req.query)

			return res.status(200).json({
				status: "success",
				message: paginatedData.length > 0
					? noPagination
						? MapResponseMessage.successGetAllWithoutPagination("Mã giảm giá")
						: MapResponseMessage.successGetAllWithPagination("Mã giảm giá")
					: MapResponseMessage.successWithEmptyData("Mã giảm giá"),
				metadata: {
					currentPage: noPagination ? 1 : page,
					limitPerPage: noPagination ? null : limit,
					totalPages: noPagination ? 1 : totalPages,
					totalRecords,
					countRecords: paginatedData.length
				},
				results: paginatedData
			});
		} catch (error) {
			return next({
				status: 500,
				error
			});
		}
	}

	async createNewVoucher(req, res, next) {
		try {

			const {
				voucherCode,
				branchId,
				discountValue,
				maxTotalUsage,
				maxUserUsage,
				validFrom,
				validTo,
				type,
			} = req.body;

			if (await VoucherService.checkVoucherCodeExist(voucherCode, VoucherService.parseBranchID(branchId, req.branchRef))) {
				return next({
					status: 404,
					message: branchId !== "all" ? MapResponseMessage.exists("Code", "trên chi nhánh") : MapResponseMessage.exists("Code", "trên hệ thống")
				});
			}

			if (!VoucherService.checkValidTime(validFrom, validTo)) {
				return next({
					status: 404,
					message: MapResponseMessage.invalidVoucherStartTime
				});
			}

			if (!VoucherService.checkValidUsage(maxTotalUsage, maxUserUsage)) {
				return next({
					status: 404,
					message: MapResponseMessage.invalidMaxTotalUsage
				});
			}

			const newVoucher = await VoucherService.createVoucher(req.body, req.staffCode, req.branchRef)

			return res.status(201).json({
				status: "success",
				message: MapResponseMessage.successCreate("Mã giảm giá"),
				metadata: {
					voucherCode,
					discountValue,
					type
				},
				results: newVoucher
			});
		} catch (error) {
			return next({
				status: 500,
				error
			});
		}
	}

	async getVoucherInfo(req, res, next) {
		try {
			const { voucherId } = req.params;
			if (!(await VoucherService.checkVoucherIdExist(voucherId))) {
				return next({
					status: 400,
					message: MapResponseMessage.notFound("Mã giảm giá")
				});
			}

			const voucherData = await VoucherService.getVoucherByVoucherId(voucherId);

			const { voucherCode, voucherConfig } = voucherData;

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successGetOne("Mã giảm giá"),
				metadata: {
					voucherId,
					voucherCode,
					discountValue: voucherConfig.discountValue,
					type: voucherConfig.type
				},
				results: voucherData
			});
		} catch (error) {
			return next({
				status: 500,
				error
			});
		}
	}

	async updateVoucher(req, res, next) {
		try {
			const { voucherId } = req.params;

			const updateData = req.body;

			const {
				voucherCode: currentVoucherCode,
				voucherConfig: currentConfig,
				branchId: currentBranchId
			} = await VoucherService.getVoucherByVoucherId(voucherId);

			console.log(currentBranchId)

			if (!VoucherService.checkValidRole(req.role, currentBranchId?._id.toString() ?? null, req.branchRef)) {
				return next({
					status: 403,
					message: MapResponseMessage.notEnoughPermission
				});
			}

			if (updateData?.voucherCode && updateData?.voucherCode !== currentVoucherCode) {
				if (await VoucherService.checkVoucherCodeExist(updateData?.voucherCode, VoucherService.parseBranchID(updateData.branchId, req.branchRef))) {
					return next({
						status: 400,
						message: MapResponseMessage.exists("voucherCode")
					});
				}
			}


			req.body.voucherConfig = VoucherService.generateUpdateData(updateData, currentConfig)


			const newVoucherData = await VoucherService.updateVoucher(voucherId, req.body);

			const { voucherCode: newVoucherCode, voucherConfig } = newVoucherData;

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successUpdate("Mã giảm giá"),
				metadata: {
					voucherId,
					voucherCode: newVoucherCode,
					discountValue: voucherConfig.discountValue,
					type: voucherConfig.type
				},
				results: newVoucherData
			});
		} catch (error) {
			return next({
				status: 500,
				error
			});
		}
	}

	async deleteVoucher(req, res, next) {
		try {
			const { voucherId } = req.params;

			const { branchId: voucherBranch } = await VoucherService.getVoucherByVoucherId(voucherId);

			if (!VoucherService.checkValidRole(req.role, voucherBranch, req.branchRef)) {
				return next({
					status: 403,
					message: MapResponseMessage.notEnoughPermission
				});
			}

			await VoucherService.deleteVoucher(voucherId);

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successDeleted("Mã giảm giá")
			});
		} catch (error) {
			return next({
				status: 500,
				error
			});
		}
	}

	async softDeleteVoucher(req, res, next) {
		try {
			const { voucherId } = req.params;
			const { isSuccess, message } = await VoucherService.softDeleteVoucher(voucherId);

			if (!isSuccess) {
				return next({
					status: 500,
					message
				})
			}

			return res.status(200).json({
				status: "success",
				message
			})

		} catch (error) {
			return next({
				status: 500,
				error
			})
		}
	}

	async recoverVoucher(req, res, next) {
		try {
			const { voucherId } = req.params;

			const { isSuccess, message } = await VoucherService.recoverVoucher(voucherId);

			if (!isSuccess) {
				return next({
					status: 500,
					message
				})
			}

			return res.status(200).json({
				status: "success",
				message
			})
		} catch (error) {
			return next({
				status: 500,
				error
			})
		}
	}

	async hardDeleteVoucher(req, res, next) {
		try {
			const { voucherId } = req.params;

			const { isSuccess, message } = await VoucherService.hardDeletionVoucher(voucherId);

			if (!isSuccess) {
				return next({
					status: 500,
					message
				})
			}

			return res.status(200).json({
				status: "success",
				message
			})
		} catch (error) {
			return next({
				status: 500,
				error
			})
		}
	}

	async increaseUsedCount(req, res, next) {
		try {
			const { voucherId } = req.params;

			await VoucherService.increaseUsedCount(voucherId, req._id);

			return res.status(204)

		} catch (error) {
			return next({
				status: 500,
				error
			})
		}
	}
}

module.exports = new VoucherController();
