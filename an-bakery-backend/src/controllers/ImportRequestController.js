const ImportRequestService = require('@/services/ImportRequestService')

const MapResponseMessage = require('@/utils/response-message/vi-VN')

class ImportRequestController {
  getAll = async (req, res, next) => {
    try {
      const {
        page,
        limit,
        noPagination,
        paginatedData,
        totalPages,
        totalRecords,
      } = await ImportRequestService.getAll(req.query)

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
  getOne = async (req, res, next) => {
    try {
      const importRequest = await ImportRequestService.getOne(req.params.id)
      if (!importRequest) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Yêu cầu nhập hàng'),
        })
      }
      return res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successGetOne('Yêu cầu nhập hàng'),
        results: importRequest,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
  updateRequestStatus = async (req, res, next) => {
    try {
      const importRequest = await ImportRequestService.getById(req.params.id)
      if (!importRequest) {
        return next({
          status: 404,
          message: MapResponseMessage.notFound('Yêu cầu nhập hàng'),
        })
      }
      if (importRequest.requestItems.every((item) => item.importStatus)) {
        const updatedImportRequest = await ImportRequestService.update(
          req.params.id,
          { requestStatus: 'completed' }
        )
        return res.status(200).json({
          status: 'success',
          message: MapResponseMessage.successUpdate(
            'Trạng thái của Yêu cầu nhập hàng'
          ),
          metadata: {
            importRequestId: req.params.id,
          },
          results: updatedImportRequest,
        })
      }
      const updatedImportRequest =
        await ImportRequestService.updateRequestStatus(
          req.params.id,
          importRequest?.branchId,
          req.body
        )
      return res.status(200).json({
        status: 'success',
        message: MapResponseMessage.successUpdate(
          'Trạng thái của Yêu cầu nhập hàng'
        ),
        metadata: {
          importRequestId: req.params.id,
        },
        results: updatedImportRequest,
      })
    } catch (error) {
      return next({
        status: 500,
        error,
      })
    }
  }
}

module.exports = new ImportRequestController()
