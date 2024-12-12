const BranchModel = require('@/models/BranchModel')
const CakeModel = require('@/models/CakeModel')
const ImportRequestModel = require('@/models/ImportRequestModel')
const OrderModel = require('@/models/OrderModel')
const ImportRequestService = require('@/services/ImportRequestService')
const MaterialService = require('@/services/MaterialService')

const VoucherService = require('@/services/VoucherService')
const VoucherModel = require('@/models/VoucherModel')
const StaffModel = require('@/models/StaffModel')
const pagination = require('@/utils/pagination')

const {
  updateMaterialVolume,
  updateCakeQuantity,
} = require('@/utils/update-inventory')
const { Types } = require('mongoose')
const MapResponseMessage = require('@/utils/response-message/vi-VN')

class BranchService {
  validateTime = (timeString) => {
    return /^\d{2}:\d{2}$/.test(timeString)
  }
  validateRequestItems = async (supplier, requestItems) => {
    const validatedRequestItems = [...requestItems]

    for (const item of requestItems) {
      const material = await MaterialService.getById(item.materialId)
      if (!material)
        return {
          success: false,
          name: `INVALID_MATERIAL`,
          id: item.materialId,
          validatedRequestItems: null,
        }
      const isProvidedWithSupplier = supplier.supplyItems.some(
        (supplyItem) =>
          supplyItem.materialId.toString() === item.materialId.toString()
      )
      if (!isProvidedWithSupplier)
        return {
          success: false,
          name: 'INVALID_SUPPLY_ITEM',
          id: item.materialId,
          validatedRequestItems: null,
        }
    }

    return { success: true, validatedRequestItems }
  }
  updateRequestItems = async (requestOfBranch, newItems) => {
    const requestSumPrice =
      requestOfBranch.requestTotalPrice + newItems.requestTotalPrice
    const existItems = [...requestOfBranch.requestItems]
    const requestItemsMap = new Map(
      existItems.map((item) => [item.materialId.toString(), item])
    )

    for (const newItem of newItems?.requestItems) {
      const validMaterial = await MaterialService.getById(newItem.materialId)
      if (!validMaterial) return { success: false, updatedRequestItems: null }
      if (requestItemsMap.has(newItem.materialId.toString())) {
        const existingItem = requestItemsMap.get(newItem.materialId)
        existingItem.importQuantity += newItem.importQuantity
        existingItem.unitPrice += newItem.unitPrice
      } else {
        requestItemsMap.set(newItem.materialId.toString(), { ...newItem })
      }
    }

    const updatedRequestItems = Array.from(requestItemsMap.values())

    return { success: true, updatedRequestItems, requestSumPrice }
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
      } = await pagination(BranchModel, queryParams, advancedFields)

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
  getAllWithCondition = async (queryParams, queryOptions = {}) => {
    try {
      const {
        page,
        limit,
        noPagination,
        paginatedData,
        totalPages,
        totalRecords,
      } = await pagination(BranchModel, queryParams, null, queryOptions)
      const data = paginatedData.filter((x) => x?.branchInventory?.materials)
      return {
        page,
        limit,
        noPagination,
        paginatedData: data,
        totalPages,
        totalRecords,
      }
    } catch (error) {
      throw new Error(error)
    }
  }
  getById = async (branchId) => {
    try {
      const freshBranch = await BranchModel.findById(branchId).select('-__v')
      return freshBranch
    } catch (error) {
      throw new Error(error)
    }
  }
  getByIdAndAggregate = async (branchId) => {
    try {
      const freshBranch = await this.getById(branchId)
      const validIds = freshBranch.businessProducts
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id))
      const productApplied = await CakeModel.find({
        _id: { $in: validIds },
      })
      freshBranch.businessProducts =
        productApplied.length > 0 ? productApplied : null
      return freshBranch
    } catch (error) {
      throw new Error(error)
    }
  }
  getByIdWithCondition = async (branchId, options) => {
    try {
      let query = BranchModel.findById(branchId).select('-__v')

      Object.keys(options).forEach((key) => {
        if (typeof query[key] === 'function') {
          query = query[key](options[key])
        }
      })
      const freshBranch = await query
      return freshBranch
    } catch (error) {
      throw new Error(error)
    }
  }
  getBusinessProducts = async (branchId) => {
    try {
      const businessProducts = await BranchModel.aggregate([
        {
          $match: { _id: new Types.ObjectId(branchId) },
        },
        {
          $lookup: {
            from: 'cakes',
            localField: 'businessProducts',
            foreignField: '_id',
            as: 'products',
          },
        },
        {
          $unwind: '$products',
        },
        {
          $replaceRoot: { newRoot: '$products' },
        },
      ])
      return businessProducts
    } catch (error) {
      throw new Error(error)
    }
  }
  getBranchInventory = async (branchId, inventoryType) => {
    try {
      let selectedType
      if (inventoryType && !['materials', 'cakes'].includes(inventoryType)) {
        throw new Error('Branch inventory type is invalid')
      } else {
        selectedType = inventoryType
      }
      const { branchInventory } = await this.getByIdWithCondition(branchId, {
        select: 'branchInventory -_id',
        populate: [
          {
            path: 'branchInventory.materials.materialId',
          },
          {
            path: 'branchInventory.cakes.cakeId',
          },
        ],
        lean: true,
      })
      const branchInventoryType =
        selectedType !== '' && branchInventory?.[selectedType]
      return { selectedType, branchInventoryType, branchInventory }
    } catch (error) {
      throw new Error(error)
    }
  }
  getBranchOrders = async (branchId, queryParams = null) => {
    try {
      const {
        page,
        limit,
        noPagination,
        paginatedData,
        totalPages,
        totalRecords,
      } = await pagination(OrderModel, { ...queryParams, branchId }, null, {
        populate: [
          {
            path: 'orderGroupId',
          },
          {
            path: 'customerId',
          },
          {
            path: 'voucherCode',
          },
          {
            path: 'branchId',
            select: 'branchConfig',
          },
          {
            path: 'orderItems.cakeId',
          },
        ],
      })

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
  getImportRequests = async (branchId, queryParams) => {
    try {
      const importRequest = await ImportRequestService.getImportRequestOfBranch(
        branchId,
        queryParams
      )
      return importRequest
    } catch (error) {
      throw new Error(error)
    }
  }
  create = async (branchObj) => {
    try {
      const { open, close } = branchObj?.branchConfig.activeTime
      if (!this.validateTime(open) || !this.validateTime(close)) {
        throw new Error('Invalid time format')
      }
      const newBranch = await BranchModel.create(branchObj)
      return newBranch
    } catch (error) {
      throw new Error(error)
    }
  }
  createImportRequests = async (branchObj, freshSupplier) => {
    try {
      let message
      const { success, name, id, validatedRequestItems } =
        await this.validateRequestItems(freshSupplier, branchObj.requestItems)
      if (success) {
        branchObj.requestItems = validatedRequestItems
      } else {
        if (name.includes('INVALID_MATERIAL')) {
          message = `Material with ID ${id} not found!`
        } else if (name.includes('INVALID_SUPPLY_ITEM')) {
          message = `Material with ID ${id} is not provided by this supplier!`
        }
      }
      const newRequest = await ImportRequestModel.create(branchObj)
      return { newRequest, message }
    } catch (error) {
      throw new Error(error)
    }
  }
  update = async (branchId, branchObj) => {
    try {
      const updatedBranch = await BranchModel.findByIdAndUpdate(
        branchId,
        { branchConfig: branchObj },
        {
          new: true,
          runValidators: false,
          select: 'branchConfig',
        }
      )
      return updatedBranch
    } catch (error) {
      throw new Error(error)
    }
  }
  updateBusinessProducts = async (branchId, branchObj) => {
    try {
      for (const item of branchObj) {
        await CakeModel.findByIdAndUpdate(
          item,
          { isHide: false },
          {
            new: true,
            runValidators: false,
          }
        )
      }
      const updatedBranch = await BranchModel.findByIdAndUpdate(
        branchId,
        { businessProducts: branchObj },
        {
          new: true,
          runValidators: false,
          select: 'businessProducts',
        }
      )
      return updatedBranch
    } catch (error) {
      throw new Error(error)
    }
  }
  updateInventory = async (branchId, type, data) => {
    try {
      const selectedField = `branchInventory.${type}`
      const updatedBranch = await BranchModel.findOneAndUpdate(
        {
          _id: branchId,
        },
        {
          [selectedField]: data,
        },
        {
          new: true,
          runValidators: true,
        }
      )
      return updatedBranch
    } catch (error) {
      throw new Error(error)
    }
  }
  updateImportRequests = async (requestId, requestOfBranch, newRequestItem) => {
    try {
      const { success, updatedRequestItems, requestSumPrice } =
        await this.updateRequestItems(requestOfBranch, newRequestItem)
      const requestItems = {
        requestItems: updatedRequestItems,
        requestTotalPrice: requestSumPrice,
      }
      if (success) {
        const updatedImportRequestBranch = await ImportRequestService.update(
          requestId,
          requestItems
        )
        return { success, updatedImportRequestBranch }
      } else {
        return { success, updatedImportRequestBranch: null }
      }
    } catch (error) {
      throw new Error(error)
    }
  }
  updateBranchMaterialsInventory = async (
    freshImportRequestBranch,
    freshBranch
  ) => {
    try {
      const { materialsInventory, success } = await updateMaterialVolume(
        freshImportRequestBranch,
        freshBranch
      )
      if (success) {
        const updatedInventoryBranch = await this.updateInventory(
          freshBranch._id,
          'materials',
          materialsInventory
        )
        return { success, updatedInventoryBranch }
      } else {
        return { success, updatedInventoryBranch: [] }
      }
    } catch (error) {
      throw new Error(error)
    }
  }
  updateBranchCakesInventory = async (freshOrder, freshBranch) => {
    try {
      const cakesInventory = updateCakeQuantity(
        freshOrder.orderItems,
        freshBranch
      )
      const updatedCakeBranch = await this.updateInventory(
        freshBranch._id,
        'cakes',
        cakesInventory
      )
      return updatedCakeBranch
    } catch (error) {
      throw new Error(error)
    }
  }
  cancelImportRequest = async (importRequest, data) => {
    try {
      importRequest.isCancelled = Boolean(data.isCancelled)
      importRequest.cancelledReason = data.cancelledReason
      return await importRequest.save()
    } catch (error) {
      throw new Error(error)
    }
  }
  delete = async (branchId) => {
    try {
      const isDeleted = await BranchModel.deleteOne({ _id: branchId })
      return isDeleted ? true : false
    } catch (error) {
      throw new Error(error)
    }
  }
  toggleVisibility = async (branchId, currentStatus) => {
    try {
      return BranchModel.findByIdAndUpdate(
        branchId,
        {
          isActive: !currentStatus,
        },
        {
          new: true,
        }
      )
    } catch (error) {
      throw new Error(error)
    }
  }

  getBranchDisplayName = async (branchId) => {
    if (!branchId) {
      return null
    }
    const freshBranch = await this.getById(branchId)
    return freshBranch?.branchConfig.branchDisplayName ?? null
  }
  getListVouchersOfBranch = async (queryParams, branchId) => {
    return VoucherService.getListVouchersOfBranch(queryParams, branchId)
  }
  getBranchesContainMaterial = async (materialId) => {
    try {
      const branches = await BranchModel.find({
        'branchInventory.materials.materialId': materialId,
      })
        .populate('branchInventory.materials.materialId')
        .select([
          '_id',
          'branchConfig.branchDisplayName',
          'branchInventory.materials.materialId',
          'branchInventory.materials.inventoryVolume',
        ])
      return branches
    } catch (error) {
      throw new Error(error)
    }
  }

  softDeletionBranch = async (branchId) => {
    const branchData = await BranchModel.findById(branchId).lean()

    if (branchData.isDeleted) {
      return {
        isSuccess: false,
        message: MapResponseMessage.alreadyDeleted('Chi nhánh'),
      }
    }

    const currentListImportRequests = await ImportRequestModel.find({
      branchId,
      requestStatus: { $ne: 'completed' },
    })

    if (currentListImportRequests.length > 0) {
      return {
        isSuccess: false,
        message: MapResponseMessage.hasNotCompletedRequest('Chi nhánh'),
      }
    }

    await Promise.all([
      VoucherModel.updateMany(
        {
          branchId,
        },
        {
          isDeleted: true,
        }
      ),
      BranchModel.findByIdAndUpdate(branchId, {
        isDeleted: true,
        isActive: false,
      }),
    ])

    return {
      isSuccess: true,
      message: MapResponseMessage.successDeleted('Chi nhánh'),
    }
  }

  recoverBranch = async (branchId) => {
    const branchData = await BranchModel.findById(branchId).lean()

    if (!branchData.isDeleted) {
      return {
        isSuccess: false,
        message: MapResponseMessage.notInSoftDeletionState('recover'),
      }
    }

    await BranchModel.findByIdAndUpdate(branchId, {
      isDeleted: false,
    })

    return {
      isSuccess: true,
      message: MapResponseMessage.successRecover('Chi nhánh'),
    }
  }

  hardDeletionBranch = async (branchId) => {
    const branchData = await BranchModel.findById(branchId).lean()
    console.log(branchData)
    if (!branchData.isDeleted) {
      return {
        isSuccess: false,
        message: MapResponseMessage.notInSoftDeletionState('delete'),
      }
    }

    return Promise.all([
      StaffModel.find({
        branchRef: branchId,
      }).lean(),
      ImportRequestModel.find({
        branchId,
      }).lean(),
      VoucherModel.find({
        branchId,
      }).lean(),
    ]).then(([listStaffs, listImportRequests, listVouchers]) => {
      if (
        listStaffs.length > 0 ||
        listImportRequests.length > 0 ||
        listVouchers.length > 0
      ) {
        return {
          isSuccess: false,
          message: MapResponseMessage.hasRelatedData('Chi nhánh'),
        }
      }

      return BranchModel.findByIdAndDelete(branchId).then(() => {
        return {
          isSuccess: true,
          message: MapResponseMessage.successDeleted('Chi nhánh'),
        }
      })
    })
  }

  createNewCakeHistoryChange = async (cakeId) => {}

  removeExpiredMaterial = async (branchId, materialId, removeWeight) => {
    const currentWeight = await MaterialService.getCurrentWeightOfMaterial(
      branchId,
      materialId
    )

    if (!currentWeight) {
      return {
        isSuccess: false,
        message: MapResponseMessage.notFound('Material'),
      }
    }

    if (currentWeight < removeWeight) {
      return {
        isSuccess: false,
        message: MapResponseMessage.notEnoughWeight,
      }
    }

    try {
      await MaterialService.updateWeightOfMaterial(
        branchId,
        materialId,
        -removeWeight,
        currentWeight - removeWeight,
        'removeExpired'
      )

      return {
        isSuccess: true,
        message: MapResponseMessage.successRemoveExpired('Nguyên liệu'),
      }
    } catch (error) {
      return {
        isSuccess: false,
        message: error,
      }
    }
  }
}

module.exports = new BranchService()
