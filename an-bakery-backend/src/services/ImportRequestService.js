const ImportRequestModel = require('@/models/ImportRequestModel')
const SupplierModel = require('@/models/SupplierModel')
const pagination = require('@/utils/pagination')

class ImportRequestService {
  findMaterialSpecsByPackageType = async (packageTypeId) => {
    const suppliers = await SupplierModel.find({
      'supplyItems.materialSpecs._id': packageTypeId,
    }).populate('supplyItems.materialSpecs')
    const materialSpecs = suppliers.flatMap((supplier) =>
      supplier.supplyItems
        .filter((item) => item.materialSpecs._id.equals(packageTypeId))
        .map((item) => item.materialSpecs)
    )
    return materialSpecs
  }
  populateData = async (data) => {
    const populated = await Promise.all(
      data.map(async (item) => {
        const populatedRequestItems = await Promise.all(
          item.requestItems.map(async (requestItem) => {
            const materialSpecs = await this.findMaterialSpecsByPackageType(
              requestItem.packageType
            )
            return {
              ...requestItem,
              packageType: materialSpecs.length > 0 ? materialSpecs[0] : null,
            }
          })
        )
        return {
          ...item,
          requestItems: populatedRequestItems,
        }
      })
    )
    return populated
  }
  getAll = async (queryParams) => {
    try {
      const {
        page,
        limit,
        noPagination,
        paginatedData,
        totalPages,
        totalRecords,
      } = await pagination(ImportRequestModel, queryParams, null, {
        populate: [
          {
            path: 'branchId',
            select: 'branchConfig',
          },
          {
            path: 'supplierId',
            select: 'supplierName supplierContact supplierContactPerson',
          },
          {
            path: 'requestItems.materialId',
            select: 'materialName calUnit',
          },
        ],
        lean: true,
      })
      const populatedItems = await this.populateData(paginatedData)
      return {
        page,
        limit,
        noPagination,
        paginatedData: populatedItems,
        totalPages,
        totalRecords,
      }
    } catch (error) {
      throw new Error(error)
    }
  }
  getOne = async (requestId) => {
    try {
      const item = await this.getByIdWithCondition(requestId, {
        populate: [
          {
            path: 'branchId',
            select: 'branchConfig',
          },
          {
            path: 'supplierId',
            select: 'supplierName supplierContact supplierContactPerson',
          },
          {
            path: 'requestItems.materialId',
            select: 'materialName calUnit',
          },
        ],
        lean: true,
      })
      const populatedRequestItems = await Promise.all(
        item.requestItems.map(async (requestItem) => {
          const materialSpecs = await this.findMaterialSpecsByPackageType(
            requestItem.packageType
          )
          return {
            ...requestItem,
            packageType: materialSpecs.length > 0 ? materialSpecs[0] : null,
          }
        })
      )
      return {
        ...item,
        requestItems: populatedRequestItems,
      }
    } catch (error) {
      throw new Error(error)
    }
  }
  getById = async (requestId) => {
    try {
      const importRequest =
        ImportRequestModel.findById(requestId).select('-__v')
      return importRequest
    } catch (error) {
      throw new Error(error)
    }
  }
  getByIdWithCondition = async (requestId, options) => {
    try {
      let query = ImportRequestModel.findById(requestId).select('-__v')

      Object.keys(options).forEach((key) => {
        if (typeof query[key] === 'function') {
          query = query[key](options[key])
        }
      })

      const importRequest = await query
      return importRequest
    } catch (error) {
      throw new Error(error)
    }
  }
  getImportRequestOfBranch = async (branchId, queryParams) => {
    try {
      return await pagination(
        ImportRequestModel,
        { ...queryParams, branchId },
        null,
        {
          populate: [
            {
              path: 'branchId',
            },
            {
              path: 'supplierId',
            },
          ],
        }
      )
    } catch (error) {
      throw new Error(error)
    }
  }
  update = async (requestId, requestObj) => {
    try {
      const updatedImportRequest = await ImportRequestModel.findByIdAndUpdate(
        requestId,
        {
          ...requestObj,
        },
        {
          new: true,
          runValidators: true,
        }
      )
      return updatedImportRequest
    } catch (error) {
      throw new Error(error)
    }
  }
  updateRequestStatus = async (requestId, branchId, requestObj) => {
    try {
      const updatedImportRequestPromise = ImportRequestModel.findByIdAndUpdate(
        requestId,
        {
          $set: {
            'requestItems.$[item].importStatus': true,
            'requestItems.$[item].isSingle': requestObj?.isSingle,
            requestStatus: requestObj?.requestStatus,
          },
        },
        {
          arrayFilters: [
            { 'item.materialId': { $in: requestObj?.requestItems } },
          ],
          new: true,
        }
      )
      const fetchPromise = fetch(
        `http://localhost:3000/api/branches/${branchId}/inventory/materials`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId,
          }),
        }
      )

      const [updatedImportRequest, fetchResponse] = await Promise.all([
        updatedImportRequestPromise,
        fetchPromise,
      ])
      await fetchResponse.json()

      return updatedImportRequest
    } catch (error) {
      throw new Error(error)
    }
  }
}

module.exports = new ImportRequestService()
