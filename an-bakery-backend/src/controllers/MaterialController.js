const MaterialService = require('@/services/MaterialService')
const BranchService = require('@/services/BranchService')

const MapResponseMessage = require('@/utils/response-message/vi-VN')

class MaterialController {
  getAll = async (req, res, next) => {
    try {
      const {
        page,
        limit,
        noPagination,
        paginatedData,
        totalPages,
        totalRecords,
      } = await MaterialService.getAll(req.query, [
        'materialName',
        'materialType',
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
        status: 'success',
        message:
          paginatedData.length > 0
            ? noPagination
              ? MapResponseMessage.successGetAllWithoutPagination(
                  'Nguyên/vật liệu'
                )
              : MapResponseMessage.successGetAllWithPagination(
                  'Nguyên/vật liệu',
                  page
                )
            : MapResponseMessage.successWithEmptyData('Nguyên/vật liệu'),
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
  getSuppliers = async (req, res, next) => {
    try {
      const { id: materialId } = req.params

      const suppliers = await MaterialService.getSuppliers(materialId)

      return res.status(200).json({
        status: 'success',
        message:
          suppliers.length > 0
            ? MapResponseMessage.successGetAllWithoutPagination(
                'Nhà cung cấp có cung cấp nguyên liệu này'
              )
            : MapResponseMessage.successWithEmptyData('Nhà cung cấp'),
        metadata: {
          materialId,
        },
        results: suppliers,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  getAnalyticsForMaterials = async (req, res, next) => {
    try {
      const freshMaterial = await MaterialService.getById(req.params.id)
      if (!freshMaterial) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Nguyên/vật liệu'),
        })
      }

      const stats = await MaterialService.getAnalyticsForMaterials(
        req.params.id
      )
      if (stats.length === 0) {
        return next({
          status: 404,
          message: 'Không tìm thấy dữ liệu thống kê cho nguyên liệu này.',
        })
      }

      return res.status(200).json({
        status: 'success',
        message: 'Lấy dữ liệu thống kê thành công!',
        results: stats,
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
      const freshMaterial = await MaterialService.getById(req.params.id)
      if (!freshMaterial) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Nguyên/vật liệu'),
        })
      }
      return res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successGetOne('Nguyên/vật liệu'),
        metadata: {
          materialId: freshMaterial._id,
          materialName: freshMaterial.materialName,
        },
        results: freshMaterial,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  createMaterial = async (req, res, next) => {
    try {
      const material = await MaterialService.create({
        ...req.body,
        creatorId: req.staffCode,
      })
      return res.status(201).json({
        status: 'success',
        message: MapResponseMessage.successCreate('Nguyên/vật liệu'),
        results: material,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  updateMaterial = async (req, res, next) => {
    try {
      const freshMaterial = await MaterialService.getById(req.params.id)
      if (!freshMaterial) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Nguyên/vật liệu'),
        })
      }
      const updateMaterial = await MaterialService.update(req.params.id, {
        ...req.body,
        creatorId: req.staffCode,
      })
      return res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successUpdate('Nguyên/vật liệu'),
        results: updateMaterial,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  deleteMaterial = async (req, res, next) => {
    try {
      const freshMaterial = await MaterialService.getById(req.params.id)
      if (!freshMaterial) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Nguyên/vật liệu'),
        })
      }
      await MaterialService.delete(req.params.id)
      return res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successDeleted('Nguyên/vật liệu'),
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  getListBranches = async (req, res, next) => {
    try {
      const { materialId } = req.params
      const freshMaterial = await MaterialService.getById(materialId)
      if (!freshMaterial) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Nguyên/vật liệu'),
        })
      }
      const listBranches = await BranchService.getBranchesContainMaterial(
        materialId
      )
      return res.status(200).json({
        status: 'success',
        message:
          listBranches.length > 0
            ? MapResponseMessage.successGetAllWithoutPagination('Chi nhánh')
            : MapResponseMessage.successWithEmptyData('Chi nhánh'),
        results: listBranches,
      })
    } catch (error) {
      return next({ status: 500, error })
    }
  }

  softDeleteMaterial = async (req, res, next) => {
    try {
      const { materialId } = req.params

      const { isSuccess, message } = await MaterialService.softDelete(
        materialId
      )

      if (!isSuccess) {
        return next({
          status: 404,
          message,
        })
      }

      return res.status(200).json({
        status: 'success',
        message,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  recoverMaterial = async (req, res, next) => {
    try {
      const { materialId } = req.params

      const { isSuccess, message } = await MaterialService.recoverMaterial(
        materialId
      )

      if (!isSuccess) {
        return next({
          status: 404,
          message,
        })
      }

      return res.status(200).json({
        status: 'success',
        message,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }

  hardDeleteMaterial = async (req, res, next) => {
    try {
      const { id: materialId } = req.params

      const { isSuccess, message } = await MaterialService.hardDelete(
        materialId
      )
      console.log()

      if (!isSuccess) {
        return next({
          status: 404,
          message,
        })
      }

      return res.status(200).json({
        status: 'success',
        message,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }

  getListRecipesUsingMaterial = async (req, res, next) => {
    try {
      const { materialId } = req.params

      const listRecipes = await MaterialService.getRecipeUsingMaterial(
        materialId
      )

      return res.status(200).json({
        status: 'success',
        message:
          listRecipes.length > 0
            ? MapResponseMessage.successGetAllWithoutPagination(
                'Các công thức sử dụng nguyên liệu'
              )
            : MapResponseMessage.successWithEmptyData('Công thức'),
        results: listRecipes,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
}

module.exports = new MaterialController()
