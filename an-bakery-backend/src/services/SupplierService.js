const ImportRequestModel = require('@/models/ImportRequestModel')
const SupplierModel = require('@/models/SupplierModel')
const MaterialService = require('@/services/MaterialService')
const pagination = require('@/utils/pagination')
const mongoose = require('mongoose');
const MapResponseMessage = require("@/utils/response-message/vi-VN");

class SupplierService {
	updateSupplyItems = async (existItems, newItems) => {
		const supplyItemsMap = new Map(
			existItems.map((item) => [item.materialId.toString(), item])
		)
		for (const newItem of newItems) {
			const validMaterial = await MaterialService.getById(newItem.materialId)
			if (!validMaterial) return { success: false, updatedSupplyItems: null }
			const materialIdStr = newItem.materialId.toString()
			if (supplyItemsMap.has(materialIdStr)) {
				const existingItem = supplyItemsMap.get(materialIdStr)
				supplyItemsMap.set(materialIdStr, {
					...newItem,
					materialSpecs: {
						...existingItem.materialSpecs,
						...newItem.materialSpecs,
						_id: existingItem.materialSpecs._id,
					},
				})
			} else {
				supplyItemsMap.set(materialIdStr, { ...newItem })
			}
		}

		const updatedSupplyItems = Array.from(supplyItemsMap.values())
		return { success: true, updatedSupplyItems }
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
			} = await pagination(SupplierModel, queryParams, advancedFields)

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
	getImportRequests = async (supplierId) => {
		try {
			const importRequest = await ImportRequestModel.find({
				supplierId,
			})
			return importRequest
		} catch (error) {
			throw new Error(error)
		}
	}
	getListSupplierForBranch = async (branchId, supplierPriority = null) => {
		try {
			const listSupplier = await SupplierModel.find({
				branchId,
				supplierPriority: supplierPriority ? supplierPriority : { $gt: 0 },
			}).select('-__v')
			return listSupplier
		} catch (error) {
			throw new Error(error)
		}
	}
	getListMaterialProvided = async (supplierId) => {
		try {
			const freshSupplier = await this.getByIdWithCondition(supplierId, {
				populate: 'supplyItems.materialId',
			})
			return freshSupplier.supplyItems
		} catch (error) {
			throw new Error(error)
		}
	}
	getById = async (supplierId) => {
		try {
			const freshSupplier = await SupplierModel.findById(supplierId).select(
				'-__v'
			).populate("supplyItems.materialId")
			return freshSupplier
		} catch (error) {
			throw new Error(error)
		}
	}
	getByIdWithCondition = async (supplierId, options) => {
		try {
			let query = SupplierModel.findById(supplierId)

			Object.keys(options).forEach((key) => {
				if (typeof query[key] === 'function') {
					query = query[key](options[key])
				}
			})

			const freshSupplier = await query
			return freshSupplier
		} catch (error) {
			throw new Error(error)
		}
	}
	create = async (supplierObj) => {
		try {
			const supplier = await SupplierModel.create(supplierObj)
			return supplier
		} catch (error) {
			throw new Error(error)
		}
	}
	update = async (supplierId, supplierObj) => {
		try {
			const freshSupplier = await this.getByIdWithCondition(supplierId, {
				lean: true,
			})
			const { success, updatedSupplyItems } = await this.updateSupplyItems(
				freshSupplier.supplyItems,
				supplierObj.supplyItems
			)
			if (success) {
				supplierObj.supplyItems = updatedSupplyItems
			} else {
				throw new Error('Material is not existed')
			}
			const updatedSupplier = await SupplierModel.findByIdAndUpdate(
				supplierId,
				supplierObj,
				{
					new: true,
					runValidators: true,
				}
			)
			return updatedSupplier
		} catch (error) {
			throw new Error(error)
		}
	}
	delete = async (supplierId) => {
		try {
			/**
			 * TODO:
			 * Check material id in branch, supply, import, cake
			 */
			const isDeleted = await SupplierModel.deleteOne({ _id: supplierId })
			return isDeleted ? true : false
		} catch (error) {
			throw new Error(error)
		}
	}

	softDeletionSupplier = async (supplierId) => {
		const supplierData = await SupplierModel.findById(supplierId).lean();

		if (!supplierData) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notFound("Nhà cung cấp"),
			}
		}

		if (supplierData.isDeleted) {
			return {
				isSuccess: false,
				message: MapResponseMessage.alreadyDeleted("Nhà cung cấp"),
			}
		}

		const currentListImportRequests = await ImportRequestModel.find({
			supplierId,
			requestStatus: { $ne: 'completed' }
		})

		if (currentListImportRequests.length > 0) {
			return {
				isSuccess: false,
				message: MapResponseMessage.hasNotCompletedRequest("Nhà cung cấp")
			}
		}

		await SupplierModel.findByIdAndUpdate(supplierId, { isDeleted: true });
		return {
			isSuccess: true,
			message: MapResponseMessage.successDeleted("Nhà cung cấp"),
		}
	}

	recoverSupplier = async (supplierId) => {
		const supplierData = await SupplierModel.findById(supplierId).lean();

		if (!supplierData) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notFound("Nhà cung cấp"),
			}
		}

		if (!supplierData.isDeleted) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notInSoftDeletionState("recover"),
			}
		}

		await SupplierModel.findByIdAndUpdate(supplierId, { isDeleted: false });
		return {
			isSuccess: true,
			message: MapResponseMessage.successRecover("Nhà cung cấp"),
		}
	}

	hardDeletionSupplier = async (supplierId) => {
		const supplierData = await SupplierModel.findById(supplierId).lean();

		if (!supplierData) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notFound("Nhà cung cấp"),
			}
		}

		if (!supplierData.isDeleted) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notInSoftDeletionState("delete"),
			}
		}

		const listImportRequestOfSupplier = await ImportRequestModel.find({
			supplierId,
		}).lean();

		if (listImportRequestOfSupplier.length > 0) {
			return {
				isSuccess: false,
				message: MapResponseMessage.hasRelatedData("Nhà cung cấp")
			}
		}

		await SupplierModel.findByIdAndDelete(supplierId);

		return {
			isSuccess: true,
			message: MapResponseMessage.successDeleted("Nhà cung cấp"),
		}
	}


}

module.exports = new SupplierService()
