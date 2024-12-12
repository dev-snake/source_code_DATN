const VoucherModel = require('@/models/VoucherModel')
const OrderModel = require('@/models/OrderModel')
const OrderGroupModel = require('@/models/OrderGroupModel')

const pagination = require('@/utils/pagination')
const MapResponseMessage = require("@/utils/response-message/vi-VN");

class VoucherService {
	constructor() {
		this.checkVoucherUsability = this.checkVoucherUsability.bind(this)
	}

	async getAllVoucherWithPagination(queryParams) {
		return pagination(VoucherModel, queryParams, null, {
			populate: ["branchId"]
		})
	}

	async getVoucherByVoucherId(voucherId) {
		return VoucherModel.findById(voucherId)
			.populate([{
				path: 'branchId',
				select: 'branchConfig.branchDisplayName'
			}, {
				path: "whiteListUsers"
			}])
			.lean()
	}

	async getVoucherByVoucherCode(voucherCode, branchId = null) {
		return VoucherModel.findOne({ voucherCode, branchId }).lean()
	}

	async checkVoucherCodeExist(voucherCode, branchId = null) {
		return !!(await VoucherModel.findOne({
			voucherCode,
			branchId,
		}))
	}

	async checkVoucherIdExist(voucherId) {
		return !!(await VoucherModel.findById(voucherId))
	}

	checkValidTime(from, to) {
		return new Date(from) < new Date(to)
	}

	checkValidUsage(maxTotalUsage, maxUserUsage) {
		return maxTotalUsage ? maxTotalUsage >= maxUserUsage : true
	}

	checkExpiryDate(voucherConfig) {
		const now = new Date()

		return !(voucherConfig.validFrom <= now && now <= voucherConfig.validTo)
	}

	checkValidMinimumOrderValue(voucherConfig, orderInfo) {
		return voucherConfig.minimumOrderValues
			? voucherConfig.minimumOrderValues < orderInfo.subTotalPrice
			: true
	}

	checkTotalUsageLimit(voucherConfig, usedCount) {
		return voucherConfig.maxTotalUsage
			? usedCount < voucherConfig.maxTotalUsage
			: true
	}

	checkUserUsageLimit(voucherConfig, userUsed, customerId) {
		return voucherConfig.maxUserUsage
			? userUsed.filter((u) => u === customerId).length <
			voucherConfig.maxUserUsage
			: true
	}

	checkWhitelist(voucherConfig, whiteListUsers, customerId) {
		return voucherConfig.isWhiteList
			? whiteListUsers.includes(customerId)
			: true
	}

	async getListVouchersOfCustomer(customerId) {
		function checkUserUsage(userUsedArr, customerId, voucherConfig) {
			if (!voucherConfig.maxUserUsage) {
				return true
			}

			return (
				userUsedArr.filter((_u) => _u === customerId).length <
				voucherConfig.maxUserUsage
			)
		}

		const listVouchers = await VoucherModel.find({}).lean()

		return listVouchers.filter((_v) => {
			const { voucherConfig, whiteListUsers, usedCount } = _v

			if (
				!voucherConfig.maxTotalUsage ||
				usedCount < voucherConfig.maxTotalUsage
			) {
				if (checkUserUsage(_v.userUsed, customerId, voucherConfig)) {
					if (!voucherConfig.isWhiteList) {
						return _v
					} else {
						if (whiteListUsers.includes(customerId)) {
							return _v
						}
					}
				}
			}
		})
	}

	async checkVoucherUsability(
		customerId,
		voucherCode,
		orderData,
		branchId = null
	) {
		try {
			if (!(await this.checkVoucherCodeExist(voucherCode, branchId))) {
				return {
					isOk: false,
					message: MapResponseMessage.invalidBranchVoucher,
				}
			}

			const { whiteListUsers, userUsed, usedCount, voucherConfig, _id } =
				await this.getVoucherByVoucherCode(voucherCode, branchId)

			if (this.checkExpiryDate(voucherConfig)) {
				return {
					isOk: false,
					message: MapResponseMessage.invalidVoucherUsageTime,
				}
			}

			if (!this.checkValidMinimumOrderValue(voucherConfig, orderData)) {
				return {
					isOk: false,
					message: MapResponseMessage.invalidMinimumOrderValue
				}
			}

			if (!this.checkTotalUsageLimit(voucherConfig, usedCount)) {
				return {
					isOk: false,
					message: MapResponseMessage.outOfTotalUses,
				}
			}

			if (!this.checkUserUsageLimit(voucherConfig, userUsed, customerId)) {
				return {
					isOk: false,
					message: MapResponseMessage.outOfCustomerUses,
				}
			}

			if (!this.checkWhitelist(voucherConfig, whiteListUsers, customerId)) {
				return {
					isOk: false,
					message: MapResponseMessage.notInWhitelist,
				}
			}

			return {
				isOk: true,
				message: MapResponseMessage.successUseVoucher,
				voucherData: {
					_id,
					voucherCode,
					discountValue: voucherConfig.discountValue,
					maxValue: voucherConfig.maxValue,
					type: voucherConfig.type,
				},
			}
		} catch (error) {
			throw error
		}
	}

	parseBranchID(branchId, branchRef) {
		if (!branchId) {
			return branchRef
		}

		return branchId === 'all' ? null : branchId
	}

	checkValidRole(currentRole, voucherBranch, currentBranch) {
		if (currentRole === 2) {
			return true
		}

		if (voucherBranch === null && currentRole === 2) {
			return true
		}

		return currentRole === 1 && voucherBranch === currentBranch
	}

	generateUpdateData(updateData, currentConfig) {
		if (
			updateData.discountValue ||
			updateData.maxValue ||
			updateData.maxTotalUsage ||
			updateData.maxUserUsage ||
			updateData.validFrom ||
			updateData.validTo ||
			updateData.minimumOrderValues ||
			updateData.type ||
			updateData.isWhiteList
		) {
			return {
				...currentConfig,
				discountValue: updateData.discountValue ?? currentConfig.discountValue,
				maxValue: updateData.maxValue ?? currentConfig.maxValue,
				maxTotalUsage: updateData.maxTotalUsage ?? currentConfig.maxTotalUsage,
				maxUserUsage: updateData.maxUserUsage ?? currentConfig.maxUserUsage,
				validFrom: updateData.validFrom ?? currentConfig.validFrom,
				validTo: updateData.validTo ?? currentConfig.validTo,
				minimumOrderValues:
					updateData.minimumOrderValues ?? currentConfig.minimumOrderValues,
				type: updateData.type ?? currentConfig.type,
				isWhiteList: updateData.isWhiteList ?? currentConfig.isWhiteList,
			}
		}

		return currentConfig
	}

	async createVoucher(voucherData, staffCode, branchRef) {
		const {
			voucherCode,
			voucherDescription,
			branchId,
			whiteListUsers,
			discountValue,
			maxValue,
			maxTotalUsage,
			maxUserUsage,
			validFrom,
			validTo,
			minimumOrderValues,
			type,
			isWhiteList,
		} = voucherData

		return await VoucherModel.create({
			voucherCode,
			voucherDescription,
			branchId: this.parseBranchID(branchId, branchRef),
			voucherConfig: {
				discountValue,
				maxValue,
				maxTotalUsage,
				maxUserUsage,
				validFrom,
				validTo,
				minimumOrderValues,
				type,
				isWhiteList,
			},
			whiteListUsers,
			creatorId: staffCode,
		})
	}

	async updateVoucher(voucherId, updateData) {
		return VoucherModel.findByIdAndUpdate(voucherId, updateData, { new: true })
	}

	async deleteVoucher(voucherId) {
		return VoucherModel.findByIdAndDelete(voucherId)
	}

	async getListVouchersOfBranch(queryParams, branchId) {
		return pagination(VoucherModel, { ...queryParams, $or: [{ branchId: branchId }, { branchId: null }] }, null)
	}

	async softDeleteVoucher(voucherId) {

		const voucherData = await VoucherModel.findById(voucherId);

		if (!voucherData) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notFound("Mã giảm giá")
			}
		}

		if (voucherData.isDeleted) {
			return {
				isSuccess: false,
				message: MapResponseMessage.alreadyDeleted("Mã giảm giá")
			}
		}

		await VoucherModel.findByIdAndUpdate(voucherId, {
			isDeleted: true,
		})

		return {
			isSuccess: true,
			message: MapResponseMessage.successDeleted("Mã giảm giá")
		}
	}

	async recoverVoucher(voucherId) {
		const voucherData = await VoucherModel.findById(voucherId);

		if (!voucherData) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notFound("Mã giảm giá")
			}
		}

		if (!voucherData.isDeleted) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notInSoftDeletionState("recover")
			}
		}

		await VoucherModel.findByIdAndUpdate(voucherId, {
			isDeleted: false,
		})

		return {
			isSuccess: true,
			message: MapResponseMessage.successRecover("Mã giảm giá")
		}
	}

	async hardDeletionVoucher(voucherId) {
		const voucherData = await VoucherModel.findById(voucherId);

		if (!voucherData) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notFound("Mã giảm giá")
			}
		}

		if (!voucherData.isDeleted) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notInSoftDeletionState("delete")
			}
		}

		if (voucherData.branchId === null) {
			const listOrdersUseVoucher = await OrderGroupModel.find({
				voucherCode: voucherId,
			}).lean()
			console.log("lsd", listOrdersUseVoucher)

			if (listOrdersUseVoucher.length > 0) {
				return {
					isSuccess: false,
					message: MapResponseMessage.hasRelatedData("Mã giảm giá")
				}
			}
		} else {
			const listOrdersUseVoucher = await OrderModel.find({
				voucherCode: voucherId,
			}).lean()
			console.log("lsd", listOrdersUseVoucher)
			if (listOrdersUseVoucher.length > 0) {
				return {
					isSuccess: false,
					message: MapResponseMessage.hasRelatedData("Mã giảm giá")
				}
			}
		}

		await VoucherModel.findByIdAndDelete(voucherId);

		return {
			isSuccess: true,
			message: MapResponseMessage.successDeleted("Mã giảm giá")
		}

	}

	async increaseUsedCount(voucherId, customerId) {
		return VoucherModel.findByIdAndUpdate(voucherId, {
			$inc: { usedCount: 1 },
			$push: { userUsed: customerId },
		})
	}
}

module.exports = new VoucherService()
