const pagination = async (model, queryString, advancedFields, options) => {
  try {
    const noPagination = queryString.noPagination === 'true'

    // Filtering
    const queryObj = { ...queryString }
    const excludeFields = ['page', 'sort', 'limit', 'noPagination']
    excludeFields.forEach((field) => delete queryObj[field])

    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|eq|ne)\b/g,
      (match) => `$${match}`
    )
    let parsedQuery = JSON.parse(queryStr)
    parsedQuery = Object.fromEntries(
      Object.entries(parsedQuery).map(([key, value]) => [
        key,
        value === 'null' ? null : value,
      ])
    )

    // Sorting
    let sortBy = '-createdAt'
    if (queryString.sort) {
      sortBy = queryString.sort.split(',').join(' ')
    }

    // Pagination
    const page = parseInt(queryString.page, 10) || 1
    const limit = parseInt(queryString.limit, 10) || 10
    const skip = (page - 1) * limit
    const totalRecords = await model.countDocuments(parsedQuery)
    const totalPages =
      Math.ceil(totalRecords / limit) > 0 ? Math.ceil(totalRecords / limit) : 1

    let query = noPagination
      ? model.find(parsedQuery).sort(sortBy)
      : model.find(parsedQuery).sort(sortBy).skip(skip).limit(limit)

    if (options && Object.keys(options).length > 0) {
      Object.keys(options).forEach((key) => {
        if (typeof query[key] === 'function') {
          query = query[key](options[key])
        }
      })
    }

    const paginatedData = await query

    return {
      page,
      limit,
      skip,
      noPagination,
      paginatedData,
      totalPages,
      totalRecords,
    }
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = pagination
