const OrderService = require('@/services/OrderService')
const MapResponseMessage = require('@/utils/response-message/vi-VN')

class OrderController {
  getAll = async (req, res, next) => {
    try {
      const {
        page,
        limit,
        noPagination,
        paginatedData,
        totalPages,
        totalRecords,
      } = await OrderService.getAll(req.query)

      if (!noPagination) {
        if (req.query.page && page > totalPages) {
          return next({
            status: 404,
            message: MapResponseMessage.notExistPage(totalPages),
          })
        }
      }

      return res.status(200).json({
        status: 'success',
        message:
          paginatedData.length > 0
            ? noPagination
              ? MapResponseMessage.successGetAllWithoutPagination('Đơn hàng')
              : MapResponseMessage.successGetAllWithPagination('Đơn hàng', page)
            : MapResponseMessage.successWithEmptyData('Đơn hàng'),
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
      const freshOrder = await OrderService.getByIdWithCondition(
        req.params.id,
        {
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
            },
            {
              path: 'orderItems.cakeId',
              populate: [
                {
                  path: 'cakeRecipe',
                  model: 'Recipe',
                  populate: [
                    {
                      path: 'recipeIngredients.materialId',
                      model: 'Material',
                    },
                    {
                      path: 'recipeVariants.variantItems.materialId',
                      model: 'Material',
                    },
                  ],
                },
              ],
            },
          ],
        }
      )
      if (!freshOrder) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Đơn hàng'),
        })
      }
      return res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successGetOne('Đơn hàng'),
        metadata: {
          orderId: freshOrder._id,
        },
        results: freshOrder,
      })
    } catch (error) {
      return next({
        status: 500,
        message: error,
      })
    }
  }
  getOrderByGroupId = async (req, res, next) => {
    try {
      const orderList = await OrderService.getByIdWithCondition(
        '',
        {
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
            },
            {
              path: 'orderItems.cakeId',
              populate: [
                {
                  path: 'cakeRecipe',
                  model: 'Recipe',
                  populate: [
                    {
                      path: 'recipeIngredients.materialId',
                      model: 'Material',
                    },
                    {
                      path: 'recipeVariants.variantItems.materialId',
                      model: 'Material',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          orderGroupId: req.params.id,
        }
      )
      if (!orderList) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Đơn hàng'),
        })
      }
      return res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successGetOne('Đơn hàng'),
        results: orderList,
      })
    } catch (error) {
      return next({
        status: 500,
        message: error,
      })
    }
  }
  createOrderGroup = async (req, res, next) => {
    try {
      const orderGroup = await OrderService.createGroup(req.body)
      if (!orderGroup) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Nhóm đơn'),
        })
      }
      return res.status(201).json({
        status: 'success',
        message: MapResponseMessage.successCreate('Nhóm đơn'),
        results: orderGroup,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  createSelfOrder = async (req, res, next) => {
    try {
      const orderGroup = await OrderService.createGroup(req.body)
      if (!orderGroup) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Nhóm đơn'),
        })
      }
      return res.status(201).json({
        status: 'success',
        message: MapResponseMessage.successCreate(
          'Nhóm đơn tự đặt của chi nhánh'
        ),
        results: orderGroup,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  updatePaymentStatusGroup = async (req, res, next) => {
    try {
      const orderGroup = await OrderService.updatePaymentStatusGroup(
        req.params.id,
        req.body.paymentStatus
      )
      if (!orderGroup) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Nhóm đơn'),
        })
      }
      return res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successUpdate('Trạng thái thanh toán'),
        results: orderGroup,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  destroyOrder = async (req, res, next) => {
    try {
      const { freshOrder, orderStatus } = await OrderService.destroy(
        req.body,
        req.params.id
      )
      if (!freshOrder) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Đơn hàng'),
        })
      }

      return res.status(200).json({
        status: 'success',
        message:
          orderStatus === 'cancelled'
            ? MapResponseMessage.successCancel('Đơn hàng')
            : orderStatus === 'returned'
            ? MapResponseMessage.returnedOrder
            : MapResponseMessage.rejectedOrder,

        results: freshOrder,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  updateOrderStatus = async (req, res, next) => {
    try {
      const { orderStatus } = req.body
      if (
        orderStatus === 'cancelled' ||
        orderStatus === 'returned' ||
        orderStatus === 'rejected'
      ) {
        return next({
          status: 403,
          message: MapResponseMessage.invalidProvidedOrderStatus,
        })
      }

      const freshOrder = await OrderService.updateOrderStatus(
        orderStatus,
        req.params.id,
        req._id,
        next
      )
      if (!freshOrder) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Đơn hàng'),
        })
      }

      return res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successUpdate('Trạng thái đơn hàng'),
        results: freshOrder,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  rateCakeInOrder = async (req, res, next) => {
    try {
      const { orderId } = req.params

      const { cakePayload, rateContent, rateStars } = req.body

      const { isCompleted, message } = await OrderService.rateCakeInOrder(
        orderId,
        req._id,
        cakePayload,
        rateContent,
        rateStars
      )

      return res.status(isCompleted ? 200 : 400).json({
        status: isCompleted ? 'success' : 'failure',
        message: isCompleted
          ? MapResponseMessage.successCreate('Đánh giá sản phẩm')
          : message,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  getAnalytics = async (req, res, next) => {
    try {
      return res.status(200).json({
        status: 'success',
        message:
          MapResponseMessage.successGetAllWithoutPagination(
            'Thống kê đơn hàng'
          ),
        results: await OrderService.calculateOrderAnalytics(),
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
}

module.exports = new OrderController()
