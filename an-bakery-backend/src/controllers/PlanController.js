const StaffModel = require('@/models/StaffModel')
const PlanService = require('@/services/PlanService')
const MapResponseMessage = require('@/utils/response-message/vi-VN')

class PlanController {
  getAll = async (req, res, next) => {
    try {
      const {
        page,
        limit,
        noPagination,
        paginatedData,
        totalPages,
        totalRecords,
      } = await PlanService.getAll(req.query)

      if (!noPagination) {
        if (req.query.page && page > totalPages) {
          next({
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
              ? MapResponseMessage.successGetAllWithoutPagination('Kế hoạch')
              : MapResponseMessage.successGetAllWithPagination('Kế hoạch', page)
            : MapResponseMessage.successWithEmptyData('Kế hoạch'),
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
      const freshPlan = await PlanService.getByIdWithCondition(req.params.id, {
        populate: [
          {
            path: 'branchId',
          },
          {
            path: 'planDetails.cakeId',
            model: 'cake',
          },
          {
            path: 'planDetails.totalMaterials.materialId',
            model: 'Material',
          },
        ],
      })
      if (!freshPlan) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Kế hoạch'),
        })
      }
      const staffInfo = await StaffModel.findOne({
        staffCode: freshPlan.creatorId,
      })
      if (!staffInfo) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Nhân viên'),
        })
      }
      return res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successGetOne('Kế hoạch'),
        metadata: {
          planId: freshPlan._id,
          planName: freshPlan.planName,
          staffInfo,
        },
        results: freshPlan,
      })
    } catch (error) {
      return next({
        status: 500,
        message: `${error.name} - ${error.message}`,
      })
    }
  }
  createOrderQueueProduction = async (req, res, next) => {
    try {
      const { id: planId } = req.params
      const freshPlan = await PlanService.getByIdWithCondition(planId, {
        populate: [
          {
            path: 'branchId',
          },
        ],
      })
      if (!freshPlan) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Kế hoạch'),
        })
      }
      const payload = {
        orderId: req.body.orderId,
        orderItems: req.body.orderItems,
        branchId: req.body.branchId,
      }
      const addOrderToProduction = await PlanService.createOrderQueueProduction(
        payload,
        planId,
        freshPlan?.planDetails
      )
      return res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successUpdate('Hàng chờ sản xuất'),
        metadata: {
          planId: freshPlan._id,
          planName: freshPlan.planName,
        },
        results: addOrderToProduction,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  createPlan = async (req, res, next) => {
    try {
      const plan = await PlanService.create({
        ...req.body,
        creatorId: req.staffCode,
      })
      return res.status(201).json({
        status: 'success',
        message: MapResponseMessage.successCreate('Kế hoạch'),
        results: plan,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  updatePlan = async (req, res, next) => {
    try {
      const freshPlan = await PlanService.getById(req.params.id)
      if (!freshPlan) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Kế hoạch'),
        })
      }
      const updatedPlan = await PlanService.update(req.params.id, {
        ...req.body,
        creatorId: req.staffCode || 'ANB-TBH',
      })
      if (!updatedPlan) {
        return next({
          status: 400,
          message: MapResponseMessage.failureUpdate('Kế hoạch'),
        })
      }
      return res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successUpdate('Kế hoạch'),
        results: updatedPlan,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  updatePlanStatus = async (req, res, next) => {
    try {
      const freshPlan = await PlanService.getById(req.params.id)
      if (!freshPlan) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Kế hoạch'),
        })
      }
      const updatedPlan = await PlanService.updatePlanStatus(
        freshPlan,
        req.body
      )
      return res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successUpdate('Trạng thái của Kế hoạch'),
        results: updatedPlan,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  deletePlan = async (req, res, next) => {
    try {
      const freshPlan = await PlanService.getById(req.params.id)
      if (!freshPlan) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Kế hoạch'),
        })
      }
      if (freshPlan.planDetails.length !== 0) {
        return next({
          status: 409,
          message: MapResponseMessage.conflictMessage('Kế hoạch'),
        })
      }
      await PlanService.delete(req.params.id)
      return res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successDeleted('Kế hoạch'),
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
}

module.exports = new PlanController()
