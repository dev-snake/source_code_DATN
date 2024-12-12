const MaterialModel = require('@/models/MaterialModel')
const SupplierModel = require('@/models/SupplierModel')
const BranchModel = require('@/models/BranchModel')
const RecipeModel = require('@/models/RecipeModel')
const ImportRequestModel = require('@/models/ImportRequestModel')
const pagination = require('@/utils/pagination')
const mongoose = require('mongoose')

const MapResponseMessage = require('@/utils/response-message/vi-VN')

class MaterialService {
  getAll = async (queryParams, advancedFields) => {
    try {
      const {
        page,
        limit,
        noPagination,
        paginatedData,
        totalPages,
        totalRecords,
      } = await pagination(MaterialModel, queryParams, advancedFields)

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
  getAnalyticsForMaterials = async (materialId) => {
    try {
      const stats = await BranchModel.aggregate([
        { $unwind: '$branchInventory.materials' },
        { $unwind: '$branchInventory.materials.historyChange' },
        {
          $match: {
            'branchInventory.materials.materialId': new mongoose.Types.ObjectId(
              materialId
            ),
          },
        },
        {
          $group: {
            _id: {
              year: {
                $year: '$branchInventory.materials.historyChange.createdAt',
              },
              month: {
                $month: '$branchInventory.materials.historyChange.createdAt',
              },
              materialId: '$branchInventory.materials.materialId',
              type: '$branchInventory.materials.historyChange.type',
            },
            totalWeight: {
              $sum: '$branchInventory.materials.historyChange.weightChange',
            },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.materialId': 1 },
        },
        {
          $project: {
            year: '$_id.year',
            month: '$_id.month',
            materialId: '$_id.materialId',
            type: '$_id.type',
            totalWeight: 1,
            _id: 0,
          },
        },
      ])
      return stats
    } catch (error) {
      throw new Error(error)
    }
  }
  getSuppliers = async (materialId) => {
    try {
      const suppliers = await SupplierModel.find({
        'supplyItems.materialId': materialId,
      }).populate('supplyItems.materialId', 'materialName')
      return suppliers
    } catch (error) {
      throw new Error(error)
    }
  }

  getRecipeUsingMaterial = async (materialId) => {
    return RecipeModel.find({
      'recipeIngredients.materialId': materialId,
    }).lean()
  }

  getById = async (materialId) => {
    try {
      const freshMaterial = await MaterialModel.findById(materialId).select(
        '-__v'
      )
      return freshMaterial
    } catch (error) {
      throw new Error(error)
    }
  }
  create = async (materialObj) => {
    try {
      const material = await MaterialModel.create(materialObj)
      return material
    } catch (error) {
      throw new Error(error)
    }
  }
  update = async (materialId, materialObj) => {
    try {
      const updateMaterial = await MaterialModel.findByIdAndUpdate(
        materialId,
        materialObj,
        {
          new: true,
          runValidators: true,
        }
      )
      return updateMaterial
    } catch (error) {
      throw new Error(error)
    }
  }
  delete = async (materialId) => {
    try {
      /**
       * TODO:
       * Check material id in branch, supply, import, cake
       */
      const isDeleted = await MaterialModel.deleteOne({ _id: materialId })
      return isDeleted ? true : false
    } catch (error) {
      throw new Error(error)
    }
  }

  getCurrentWeightOfMaterial = async (branchId, materialId) => {
    const branchData = await BranchModel.findById(branchId).lean()

    if (!branchData) {
      throw new Error(MapResponseMessage.notFound('Chi nhánh'))
    }

    return branchData.branchInventory.materials.find(
      (item) => item.materialId.toString() === materialId.toString()
    ).inventoryVolume
  }

  updateWeightOfMaterial = async (
    branchId,
    materialId,
    numsOfChange,
    newWeight,
    type
  ) => {
    const validType = ['forOrder', 'removeExpired', 'newImport']

    if (!validType.includes(type)) {
      throw new Error(
        'Material change type is either: forOrder, removeExpired, newImport'
      )
    }

    await BranchModel.updateOne(
      {
        _id: branchId,
        'branchInventory.materials.materialId': materialId,
      },
      {
        $set: { 'branchInventory.materials.$.inventoryVolume': newWeight },
        $push: {
          'branchInventory.materials.$.historyChange': {
            weightChange: numsOfChange,
            type: 'removeExpired',
          },
        },
      }
    )

    return true
  }

  softDelete = async (materialId) => {
    const materialData = await MaterialModel.findById(materialId)

    if (!materialData) {
      return {
        isSuccess: false,
        message: MapResponseMessage.notFound('Nguyên/vật liệu'),
      }
    }

    if (materialData.isDeleted) {
      return {
        isSuccess: false,
        message: MapResponseMessage.alreadyDeleted('Nguyên/vật liệu'),
      }
    }

    const listRecipeHasMaterial = await this.getRecipeUsingMaterial(materialId)

    if (listRecipeHasMaterial.length > 0) {
      return {
        isSuccess: false,
        message: MapResponseMessage.hasRecipeUsingMaterial,
      }
    }

    const listImportRequestHasMaterial = await ImportRequestModel.find({
      'requestItems.materialId': materialId,
      requestStatus: { $ne: 'completed' },
    })
      .select('_id')
      .lean()

    if (listImportRequestHasMaterial.length > 0) {
      return {
        isSuccess: false,
        message: MapResponseMessage.hasUnFinishedImportRequestRelated,
      }
    }

    const listBranchHasMaterial = (
      await BranchModel.find({
        'branchInventory.materials.materialId': materialId,
      })
        .select('_id')
        .lean()
    ).map((branch) => branch._id.toString())

    await Promise.all(
      listBranchHasMaterial.map(async (branch) => {
        const currentWeightOfMaterialInInventory =
          await this.getCurrentWeightOfMaterial(branch, materialId)
        if (currentWeightOfMaterialInInventory > 0) {
          await this.updateWeightOfMaterial(
            branch,
            materialId,
            -currentWeightOfMaterialInInventory,
            0,
            'removeExpired'
          )
          return true
        }
      })
    )

    await MaterialModel.findByIdAndUpdate(materialId, { isDeleted: true })

    return {
      isSuccess: true,
      message: MapResponseMessage.successDeleted('Nguyên/vật liệu'),
    }
  }

  recoverMaterial = async (materialId) => {
    const materialData = await MaterialModel.findById(materialId).lean()

    if (!materialData) {
      return {
        isSuccess: false,
        message: MapResponseMessage.notFound('Nguyên/vật liệu'),
      }
    }
    if (!materialData.isDeleted) {
      return {
        isSuccess: false,
        message: MapResponseMessage.notInSoftDeletionState('Nguyên/vật liệu'),
      }
    }

    await MaterialModel.findByIdAndUpdate(materialId, { isDeleted: false })

    return {
      isSuccess: true,
      message: MapResponseMessage.successRecover('Nguyên/vật liệu'),
    }
  }

  hardDelete = async (materialId) => {
    const materialData = await MaterialModel.findById(materialId)

    if (!materialData) {
      return {
        isSuccess: false,
        message: MapResponseMessage.notFound('Nguyên/vật liệu'),
      }
    }

    if (!materialData.isDeleted) {
      return {
        isSuccess: false,
        message: MapResponseMessage.notInSoftDeletionState('delete'),
      }
    }

    return Promise.all([
      BranchModel.find({
        'branchInventory.materials.materialId': materialId,
      }).lean(),
      ImportRequestModel.find({
        'requestItems.materialId': materialId,
      }).lean(),
      SupplierModel.find({
        'supplyItems.materialId': materialId,
      }).lean(),
    ]).then(([listBranches, listImportRequests, listSuppliers]) => {
      if (
        listBranches.length > 0 ||
        listImportRequests.length > 0 ||
        listSuppliers.length > 0
      ) {
        return {
          isSuccess: false,
          message: MapResponseMessage.hasRelatedData('Nguyên liệu'),
        }
      }

      return MaterialModel.findByIdAndDelete(materialId).then(() => {
        return {
          isSuccess: true,
          message: MapResponseMessage.successDeleted('Nguyên liệu'),
        }
      })
    })
  }
}

module.exports = new MaterialService()
