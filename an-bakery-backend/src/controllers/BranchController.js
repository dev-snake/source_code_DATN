const BranchService = require('@/services/BranchService')
const ImportRequestService = require('@/services/ImportRequestService')
const OrderService = require('@/services/OrderService')
const SupplierService = require('@/services/SupplierService')
const StaffService = require('@/services/StaffService')
const MapResponseMessage = require('@/utils/response-message/vi-VN')
const BranchModel = require('@/models/BranchModel')

class BranchController {
  /* [GET] */
  getAll = async (req, res, next) => {
    try {
      const {
        page,
        limit,
        noPagination,
        paginatedData,
        totalPages,
        totalRecords,
      } = await BranchService.getAll(req.query, [])

      if (!noPagination) {
        if (req.query.page && page > totalPages) {
          return next({
            status: 404,
            message: MapResponseMessage.notExistPage(totalPages),
          })
        }
      }

      res.status(200).json({
        status: 'success',
        message:
          paginatedData.length > 0
            ? noPagination
              ? MapResponseMessage.successGetAllWithoutPagination('Chi nhánh')
              : MapResponseMessage.successGetAllWithPagination(
                  'Chi nhánh',
                  page
                )
            : MapResponseMessage.successWithEmptyData('Chi nhánh'),
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
  getBranchHasMaterial = async (req, res, next) => {
    try {
      const {
        page,
        limit,
        noPagination,
        paginatedData,
        totalPages,
        totalRecords,
      } = await BranchService.getAllWithCondition(req.query, {
        populate: [
          {
            path: 'branchInventory.materials.materialId',
            select: 'materialName materialType calUnit',
          },
        ],
        lean: true,
      })
      if (!noPagination) {
        if (req.query.page && page > totalPages) {
          return next({
            status: 404,
            message: MapResponseMessage.notExistPage(totalPages),
          })
        }
      }

      res.status(200).json({
        status: 'success',
        message:
          paginatedData.length > 0
            ? noPagination
              ? MapResponseMessage.successGetAllWithoutPagination('Chi nhánh')
              : MapResponseMessage.successGetAllWithPagination(
                  'Chi nhánh',
                  page
                )
            : MapResponseMessage.successWithEmptyData('Chi nhánh'),
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
  getOne = async (req, res, next) => {
    try {
      const freshBranch = await BranchService.getById(req.params.id)
      if (!freshBranch) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Chi nhánh'),
        })
      }
      res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successGetOne('Chi nhánh'),
        metadata: {
          branchId: freshBranch._id,
          branchName: freshBranch.branchConfig.branchDisplayName,
        },
        results: freshBranch,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  getBusinessProducts = async (req, res, next) => {
    try {
      const { id: branchId } = req.params

      const freshBranch = await BranchService.getByIdAndAggregate(branchId)
      if (!freshBranch) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Chi nhánh'),
        })
      }

      const businessProducts = await BranchService.getBusinessProducts(branchId)

      res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successGetAllWithoutPagination(
          'Sản phẩm kinh doanh của chi nhánh'
        ),
        metadata: {
          branchId: branchId,
        },
        results: businessProducts,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  getListSupplier = async (req, res, next) => {
    try {
      const { id: branchId } = req.params
      const { supplierPriority } = req.query

      const freshBranch = await BranchService.getByIdAndAggregate(branchId)
      if (!freshBranch) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Chi nhánh'),
        })
      }

      const listSupplier = await SupplierService.getListSupplierForBranch(
        branchId,
        supplierPriority
      )

      res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successGetAllWithoutPagination(
          'Nhà cung cấp của chi nhánh'
        ),
        metadata: {
          branchId: branchId,
        },
        results: listSupplier,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  getBranchInventory = async (req, res, next) => {
    try {
      const { id: branchId } = req.params

      const freshBranch = await BranchService.getById(branchId)
      if (!freshBranch) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Chi nhánh'),
        })
      }

      const { selectedType, branchInventoryType, branchInventory } =
        await BranchService.getBranchInventory(branchId, req.query.type)

      res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successGetAllWithoutPagination(
          selectedType
            ? selectedType === 'materials'
              ? 'Nguyên liệu và Phụ kiện  của chi nhánh'
              : 'Bánh của chi nhánh'
            : 'Tất cả Nguyên/vật liệu và Bánh của chi nhánh'
        ),
        metadata: {
          branchId: branchId,
        },
        results: selectedType ? branchInventoryType || [] : branchInventory,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  getBranchOrders = async (req, res, next) => {
    try {
      const { id: branchId } = req.params

      const freshBranch = await BranchService.getById(branchId)
      if (!freshBranch) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Chi nhánh'),
        })
      }

      const {
        page,
        limit,
        noPagination,
        paginatedData,
        totalPages,
        totalRecords,
      } = await BranchService.getBranchOrders(branchId, req.query)

      if (!noPagination) {
        if (req.query.page && page > totalPages) {
          return next({
            status: 400,
            message: MapResponseMessage.notExistPage(totalPages),
          })
        }
      }

      res.status(200).json({
        status: 'success',
        message:
          paginatedData.length > 0
            ? noPagination
              ? MapResponseMessage.successGetAllWithoutPagination('Đơn hàng')
              : MapResponseMessage.successGetAllWithPagination('Đơn hàng', page)
            : MapResponseMessage.successWithEmptyData('Đơn hàng'),
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
  getImportRequests = async (req, res, next) => {
    try {
      const { id: branchId } = req.params

      const freshBranch = await BranchService.getById(branchId)
      if (!freshBranch) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Chi nhánh'),
        })
      }

      const {
        page,
        limit,
        noPagination,
        paginatedData,
        totalPages,
        totalRecords,
      } = await BranchService.getImportRequests(branchId, req.query)

      if (!noPagination) {
        if (req.query.page && page > totalPages) {
          return next({
            status: 400,
            message: MapResponseMessage.notExistPage(totalPages),
          })
        }
      }

      res.status(200).json({
        status: 'success',
        message:
          paginatedData.length > 0
            ? noPagination
              ? MapResponseMessage.successGetAllWithoutPagination(
                  'Yêu cầu nhập hàng'
                )
              : MapResponseMessage.successGetAllWithPagination(
                  'Yêu cầu nhập hàng',
                  page
                )
            : MapResponseMessage.successWithEmptyData('Yêu cầu nhập hàng'),
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
  getListVouchersOfBranch = async (req, res, next) => {
    try {
      const { id: branchId } = req.params

      const freshBranch = await BranchService.getById(branchId)
      if (!freshBranch) {
        return next({ status: 404, message: 'Branch does not exist' })
      }

      const {
        page,
        limit,
        noPagination,
        paginatedData,
        totalPages,
        totalRecords,
      } = await BranchService.getListVouchersOfBranch(req.query, branchId)
      if (!noPagination) {
        if (req.query.page && page > totalPages) {
          return next({
            status: 404,
            message: MapResponseMessage.notExistPage(totalPages),
          })
        }
      }

      res.status(200).json({
        status: 'success',
        message:
          paginatedData.length > 0
            ? noPagination
              ? MapResponseMessage.successGetAllWithoutPagination('Mã giảm giá')
              : MapResponseMessage.successGetAllWithPagination(
                  'Mã giảm giá',
                  page
                )
            : MapResponseMessage.successWithEmptyData('Mã giảm giá'),
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

  /* [CREATE] */
  createBranch = async (req, res, next) => {
    try {
      const newBranch = await BranchService.create(req.body)
      res.status(201).json({
        status: 'success',
        message: MapResponseMessage.successCreate('Chi nhánh mới'),
        results: newBranch,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  createImportRequests = async (req, res, next) => {
    try {
      const freshBranch = await BranchService.getById(req.params.id)
      if (!freshBranch) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Chi nhánh'),
        })
      }
      const freshSupplier = await SupplierService.getByIdWithCondition(
        req.body.supplierId,
        {
          lean: true,
        }
      )
      if (!freshSupplier) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Nhà cung cấp'),
        })
      }

      const { newRequest, message } = await BranchService.createImportRequests(
        { ...req.body, creatorId: req.staffCode },
        freshSupplier
      )
      if (message) {
        return next({
          status: 400,
          message,
        })
      }
      res.status(201).json({
        status: 'success',
        message: MapResponseMessage.successCreate('Yêu cầu nhập hàng mới'),
        results: newRequest,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }

  /* [UPDATE] */
  updateBusinessProducts = async (req, res, next) => {
    try {
      const freshBranch = await BranchService.getById(req.params.id)
      if (!freshBranch) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Chi nhánh'),
        })
      }

      const updatedBranch = await BranchService.updateBusinessProducts(
        req.params.id,
        req.body.businessProducts
      )
      res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successUpdate(
          'Sản phẩm kinh doanh của chi nhánh'
        ),
        results: updatedBranch,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  updateInfomationBranch = async (req, res, next) => {
    try {
      const freshBranch = await BranchService.getByIdWithCondition(
        req.params.id,
        {
          lean: true,
        }
      )
      if (!freshBranch) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Chi nhánh'),
        })
      }

      const updatedBranchConfig = {
        ...freshBranch.branchConfig,
        ...req.body,
        creatorId: req.staffCode,
      }
      const updatedBranch = await BranchService.update(
        req.params.id,
        updatedBranchConfig
      )

      res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successUpdate('Thông tin chi nhánh'),
        results: updatedBranch,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  updateImportRequests = async (req, res, next) => {
    try {
      const { id: branchId, requestId } = req.params

      const freshBranch = await BranchService.getById(branchId)
      if (!freshBranch) {
        return next({ status: 404, message: MapResponseMessage('Chi nhánh') })
      }
      const freshImportRequestBranch = await ImportRequestService.getById(
        requestId
      )
      if (!freshImportRequestBranch) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound(
            'Yêu cầu nhập hàng mà bạn muốn cập nhật'
          ),
        })
      }
      const { updatedImportRequestBranch, success } =
        await BranchService.updateImportRequests(
          requestId,
          freshImportRequestBranch,
          req.body
        )
      if (success) {
        res.status(200).json({
          status: 'success',
          message: MapResponseMessage.successUpdate(
            'Yêu cầu nhập hàng của chi nhánh'
          ),
          results: updatedImportRequestBranch,
        })
      }
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  cancelImportRequests = async (req, res, next) => {
    try {
      const { id: branchId, requestId } = req.params

      const freshBranch = await BranchService.getById(branchId)
      if (!freshBranch) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Chi nhánh'),
        })
      }
      const freshImportRequestBranch = await ImportRequestService.getById(
        requestId
      )
      if (!freshImportRequestBranch) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound(
            'Yêu cầu nhập hàng mà bạn muốn hủy'
          ),
        })
      }
      const updatedImportRequest = await BranchService.cancelImportRequest(
        freshImportRequestBranch,
        req.body
      )
      res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successCancel('Yêu cầu nhập hàng'),
        results: updatedImportRequest,
      })
    } catch (error) {
      // run?
      // freshImportRequestBranch.isCancelled = false
      // freshImportRequestBranch.cancelledReason = null
      return next({
        status: 500,
        error,
      })
    }
  }
  updateBranchMaterialsInventory = async (req, res, next) => {
    try {
      const { id: branchId } = req.params

      const freshBranch = await BranchService.getByIdWithCondition(branchId, {
        lean: true,
      })
      if (!freshBranch) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Chi nhánh'),
        })
      }

      const freshImportRequestBranch =
        await ImportRequestService.getByIdWithCondition(req.body.requestId, {
          lean: true,
        })
      if (!freshImportRequestBranch) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound(
            'Yêu cầu nhập hàng mà bạn muốn cập nhật'
          ),
        })
      }
      if (freshImportRequestBranch.isCancelled) {
        return next({
          status: 404,
          message: MapResponseMessage.hasCancelled('Yêu cầu nhập hàng này'),
        })
      }
      if (
        freshImportRequestBranch.requestStatus === 'pending' ||
        freshImportRequestBranch.requestStatus === 'confirmed'
      ) {
        return next({
          status: 400,
          message: MapResponseMessage.invalidRequestStatus,
        })
      }

      const { updatedInventoryBranch } =
        await BranchService.updateBranchMaterialsInventory(
          freshImportRequestBranch,
          freshBranch
        )

      return res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successUpdate(
          'Nguyên/vật liệu vào kho của chi nhánh'
        ),
        metadata: {
          branchId: branchId,
        },
        results: updatedInventoryBranch,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  updateBranchCakesInventory = async (req, res, next) => {
    try {
      const { id: branchId } = req.params
      const freshBranch = await BranchService.getByIdWithCondition(branchId, {
        lean: true,
      })
      if (!freshBranch) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Chi nhánh'),
        })
      }

      const { orderId } = req.body
      const freshOrder = await OrderService.getByIdWithCondition(orderId, {
        lean: true,
      })
      if (!freshOrder) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Đơn hàng'),
        })
      }

      if (freshOrder.orderStatus !== 'completed' && !req.body.isUrgent) {
        return next({
          status: 404,
          message: MapResponseMessage.orderNotCompleted,
        })
      }

      const updatedInventoryBranch =
        await BranchService.updateBranchCakesInventory(freshOrder, freshBranch)

      return res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successUpdate('Bánh vào kho của chi nhánh'),
        metadata: {
          branchId: branchId,
        },
        results: updatedInventoryBranch,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }

  /* [DELETE] */
  deleteBranch = async (req, res, next) => {
    try {
      const freshBranch = await BranchService.getById(req.params.id)
      if (!freshBranch) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Chi nhánh'),
        })
      }
      await BranchService.delete(req.params.id)

      return res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successDeleted('Chi nhánh'),
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }

  /* [SIDE] */
  toggleVisibility = async (req, res, next) => {
    try {
      const freshBranch = await BranchService.getById(req.params.id)
      if (!freshBranch) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Chi nhánh'),
        })
      }

      await BranchService.toggleVisibility(
        freshBranch._id,
        freshBranch.isActive
      )

      return res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successUpdate(
          'Trạng thái hoạt động của chi nhánh'
        ),
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }

  getStaffOfBranch = async (req, res, next) => {
    try {
      const {
        page,
        limit,
        noPagination,
        paginatedData,
        totalPages,
        totalRecords,
      } = await StaffService.getStaffOfBranch(req.params.branchId)

      if (!noPagination) {
        if (req.query.page && page > totalPages) {
          return next({
            status: 400,
            message: MapResponseMessage.notFound('Chi nhánh'),
          })
        }
      }

      return res.status(200).json({
        status: 'success',
        message:
          paginatedData.length > 0
            ? noPagination
              ? MapResponseMessage.successGetAllWithoutPagination(
                  'Nhân viên của chi nhánh'
                )
              : MapResponseMessage.successGetAllWithPagination(
                  'Nhân viên của chi nhánh',
                  page
                )
            : MapResponseMessage.successWithEmptyData(
                'Nhân viên của chi nhánh'
              ),
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

  softDeleteBranch = async (req, res, next) => {
    try {
      const { branchId } = req.params

      const { isSuccess, message } = await BranchService.softDeletionBranch(
        branchId
      )

      if (!isSuccess) {
        return next({
          status: 500,
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

  recoverBranch = async (req, res, next) => {
    try {
      const { branchId } = req.params

      const { isSuccess, message } = await BranchService.recoverBranch(branchId)

      if (!isSuccess) {
        return next({
          status: 500,
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

  hardDeleteBranch = async (req, res, next) => {
    try {
      const { id: branchId } = req.params

      const { isSuccess, message } = await BranchService.hardDeletionBranch(
        branchId
      )

      if (!isSuccess) {
        return next({
          status: 500,
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

  removeExpiredMaterial = async (req, res, next) => {
    try {
      const { branchId } = req.params
      const { materialId, removeWeight } = req.body

      const { isSuccess, message } = await BranchService.removeExpiredMaterial(
        branchId,
        materialId,
        removeWeight
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
}

module.exports = new BranchController()
