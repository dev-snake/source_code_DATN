const BranchModel = require('@/models/BranchModel')
const CakeModel = require('@/models/CakeModel')
const OrderGroupModel = require('@/models/OrderGroupModel')
const OrderModel = require('@/models/OrderModel')
const RecipeModel = require('@/models/RecipeModel')
const CustomerService = require('@/services/CustomerService')
const RateService = require('@/services/RateService')
const pagination = require('@/utils/pagination')
const mongoose = require('mongoose')
const MapResponseMessage = require('@/utils/response-message/vi-VN')

class OrderService {
  createBranchOrders = (orderGroupId, payload) => {
    const { orderData, orderType, customerId, orderApplyPoint } = payload
    const isApplyPoint = orderApplyPoint !== 0 ? orderApplyPoint : undefined
    return orderData.map((branchOrder) => ({
      orderGroupId,
      branchId: branchOrder.branchId,
      customerId,
      orderItems: branchOrder.orderItems.map((item) => ({
        cakeId: item.cakeId,
        selectedVariants: item.selectedVariants,
        quantity: item.quantity,
        priceAtBuy: item.priceAtBuy,
      })),
      orderSummary: branchOrder.orderSummary,
      voucherCode: branchOrder.branchVoucher || null,
      orderNote: branchOrder.orderNote || null,
      orderOptions: {
        deliveryMethod: branchOrder?.orderOptions?.deliveryMethod,
        deliveryTime: branchOrder?.orderOptions?.deliveryTime,
      },
      orderUrgent: {
        isUrgent: branchOrder?.orderUrgent?.isUrgent,
        orderExpectedTime: branchOrder?.orderUrgent?.orderExpectedTime,
      },
      orderType,
      orderPoint: isApplyPoint,
    }))
  }
  updateMaterialInventory = (
    branchMaterial,
    recipeMaterial,
    isReturned = false
  ) => {
    if (!isReturned) {
      branchMaterial.inventoryVolume -= recipeMaterial.quantity
    } else {
      branchMaterial.inventoryVolume += recipeMaterial.quantity
    }
    if (!isReturned && branchMaterial.inventoryVolume < 0) {
      throw new Error('Not enough material in inventory')
    }
    branchMaterial.historyChange = [
      ...branchMaterial.historyChange,
      !isReturned
        ? {
            weightChange: Number(recipeMaterial.quantity * -1),
            type: 'forOrder',
          }
        : {
            weightChange: Number(recipeMaterial.quantity * -1),
            type: 'returnOrder',
          },
    ]
    return branchMaterial
  }
  updateCakeInventory = (branchCake, quantity, isReturned) => {
    if (!isReturned) {
      branchCake.originalInventoryVolume -= quantity
      branchCake.inventoryVolume -= quantity
    } else {
      branchCake.originalInventoryVolume += quantity
      branchCake.inventoryVolume += quantity
    }
    if (!isReturned && branchCake.inventoryVolume < 0) {
      throw new Error('Không đủ bánh trong kho')
    }
    const historyRecord = {
      quantityChange: !isReturned ? Number(-1 * quantity) : quantity,
      type: !isReturned ? 'forOrder' : 'returnOrder',
    }
    branchCake.historyChange = [...branchCake.historyChange, historyRecord]
    return branchCake
  }
  getTotalRecipes = async (cakeId, filteredVariants) => {
    let totalRecipes = []
    let variantRecipes = []

    const cake = await CakeModel.findById(cakeId).lean()
    const cakeRecipe = await RecipeModel.findById(cake.cakeRecipe).lean()

    for (let variant of filteredVariants) {
      let variantRecipeItems = await Promise.all(
        variant.variantItems.map(async (item) => {
          const recipe = await RecipeModel.findOne({
            'recipeVariants.variantItems._id': item.itemRecipe,
          }).lean()
          const matchingRecipeVariants = recipe.recipeVariants.flatMap(
            (vrRecipe) =>
              vrRecipe.variantItems
                .filter((x) => x._id.toString() === item.itemRecipe.toString())
                .map((matchedItem) => ({ ...matchedItem, itemKey: item._id }))
          )
          return matchingRecipeVariants
        })
      )
      variantRecipes.push(...variantRecipeItems.flat(2))
    }
    variantRecipes = variantRecipes.filter(Boolean).map((item) => ({
      materialId: item.materialId,
      quantity: item.quantity,
      itemKey: item.itemKey,
    }))
    totalRecipes = [...variantRecipes, ...cakeRecipe.recipeIngredients]

    return totalRecipes
  }
  findCakeWithVariant = async (cakeId, selectedVariants) => {
    const cake = await CakeModel.findById(cakeId).lean()
    if (!cake) {
      throw new Error('Cake not found')
    }

    const variantMap = {}
    selectedVariants.forEach(({ variantKey, itemKey }) => {
      const variant = cake.cakeVariants.find(
        (v) => v._id.toString() === variantKey.toString()
      )
      if (!variantMap[variantKey]) {
        variantMap[variantKey] = {
          ...variant,
          variantItems: [],
        }
      }
      const matchedItem = variant.variantItems.find(
        (item) => item._id.toString() === itemKey.toString()
      )
      if (matchedItem) {
        variantMap[variantKey].variantItems.push(matchedItem)
      }
    })

    const filteredVariants = Object.values(variantMap)

    return filteredVariants
  }
  calculateTotalRecipe = async (selectedVariants, cakeId) => {
    let totalRecipes = []

    if (selectedVariants.length === 0) {
      const cake = await CakeModel.findById(cakeId).lean()
      const cakeRecipe = await RecipeModel.findById(cake.cakeRecipe).lean()
      totalRecipes = cakeRecipe?.recipeIngredients || []
    } else {
      const filteredVariants = await this.findCakeWithVariant(
        cakeId,
        selectedVariants
      )
      totalRecipes = await this.getTotalRecipes(cakeId, filteredVariants)
    }
    totalRecipes = totalRecipes.map((recipe) => ({
      ...recipe,
      cakeId,
    }))

    return totalRecipes
  }
  calculateTotalQuantity = (results, uniqueOrderItems) => {
    const totalRecipesMap = new Map()
    const recipeItems = [...results]

    recipeItems.forEach((recipeItem) => {
      const materialId = recipeItem.materialId?.toString()
      if (!totalRecipesMap.has(materialId)) {
        totalRecipesMap.set(materialId, {
          ...recipeItem,
          quantity: 0,
        })
      }
    })

    uniqueOrderItems.forEach((item) => {
      const {
        selectedVariants,
        quantity: itemQuantity,
        cakeId: { _id },
      } = item

      recipeItems.forEach((recipeItem) => {
        const materialId = recipeItem.materialId?.toString()
        const existingRecipeItem = totalRecipesMap.get(materialId)

        if (!existingRecipeItem) return

        let totalQuantity = recipeItem.quantity * itemQuantity

        if (selectedVariants?.length === 0) {
          if (existingRecipeItem.cakeId.toString() === _id.toString()) {
            existingRecipeItem.quantity = totalQuantity
          }
        } else {
          const variantQuantity = recipeItem.quantity * itemQuantity
          if (existingRecipeItem.cakeId.toString() === _id.toString()) {
            existingRecipeItem.quantity = variantQuantity
          }
        }
      })
    })

    return Array.from(totalRecipesMap.values())
  }
  subtractMaterials = async (
    branchId,
    orderItems,
    orderType,
    session,
    next
  ) => {
    const freshBranch = await BranchModel.findById(branchId).session(session)

    let cakes = freshBranch?.branchInventory?.cakes ?? []
    let materials = freshBranch?.branchInventory?.materials ?? []
    let results = []
    let totalRecipesArray = []

    const uniqueOrderItems = orderItems.reduce((acc, item) => {
      const existingItem = acc.find((i) => {
        const cakeIdMatch =
          i.cakeId._id.toString() === item.cakeId._id.toString()
        const variantsMatch =
          i.selectedVariants.length === item.selectedVariants.length &&
          i.selectedVariants.every(
            (v, index) =>
              v.variantKey.toString() ===
                item.selectedVariants[index].variantKey.toString() &&
              v.itemKey.toString() ===
                item.selectedVariants[index].itemKey.toString()
          )
        return cakeIdMatch && variantsMatch
      })
      if (existingItem) {
        existingItem.quantity += item.quantity
      } else {
        acc.push({
          ...item,
        })
      }
      return acc
    }, [])
    const nonVariantItems = uniqueOrderItems.filter(
      (item) => item.selectedVariants.length === 0
    )
    const variantItems = uniqueOrderItems.filter(
      (item) => item.selectedVariants.length > 0
    )

    for (let item of nonVariantItems) {
      const totalRecipes = await this.calculateTotalRecipe([], item.cakeId._id)
      const totalRecipesNonVariant = this.calculateTotalQuantity(
        totalRecipes,
        nonVariantItems
      )
      results.push(totalRecipesNonVariant)
    }
    for (let item of variantItems) {
      const totalRecipes = await this.calculateTotalRecipe(
        item.selectedVariants,
        item.cakeId._id
      )
      const totalRecipesVariants = this.calculateTotalQuantity(
        totalRecipes,
        variantItems
      )
      results.push(totalRecipesVariants)
    }

    const data = results.flat(2).reduce((acc, current) => {
      if (isNaN(current.quantity)) return acc
      const key = `${current.materialId}-${current.cakeId}`
      if (acc[key]) {
        acc[key].quantity += current.quantity
      } else {
        acc[key] = { ...current }
      }
      return acc
    }, {})
    totalRecipesArray = Object.values(data)
    const missingMaterials = totalRecipesArray?.filter(
      (material) =>
        !materials.some(
          (branchMaterial) =>
            branchMaterial.materialId.toString() ===
            material.materialId.toString()
        )
    )

    if (orderType === 'customerOrder') {
      if (cakes.length !== 0) {
        for (let item of nonVariantItems) {
          cakes.forEach((branchCake, index) => {
            if (
              branchCake.cakeId.toString() === item.cakeId._id.toString() &&
              branchCake.selectedVariants.length === 0
            ) {
              cakes[index] = this.updateCakeInventory(
                branchCake,
                item.quantity,
                false
              )
            }
          })
        }
        for (let item of variantItems) {
          const branchCakeIndex = cakes.findIndex(
            (cake) =>
              cake.cakeId.toString() === item.cakeId._id.toString() &&
              cake.selectedVariants.length === item.selectedVariants.length &&
              cake.selectedVariants.every((cakeVariant) =>
                item.selectedVariants.some(
                  (variant) =>
                    variant.variantKey.toString() ===
                      cakeVariant.variantKey.toString() &&
                    variant.itemKey.toString() ===
                      cakeVariant.itemKey.toString()
                )
              )
          )
          if (branchCakeIndex !== -1) {
            cakes[branchCakeIndex] = this.updateCakeInventory(
              cakes[branchCakeIndex],
              item.quantity,
              false
            )
          }
        }
      } else {
        if (missingMaterials.length > 0) {
          const missingMaterialNames = missingMaterials
            .map((material) => material.materialId)
            .join(', ')
          return next({
            status: 400,
            message: `The branch inventory is missing the following materials required by the recipe: ${missingMaterialNames}`,
          })
        } else {
          materials = materials.map((branchMaterial) => {
            const recipeMaterial = totalRecipesArray.find(
              (material) =>
                material.materialId.toString() ===
                branchMaterial.materialId.toString()
            )
            if (recipeMaterial) {
              branchMaterial = this.updateMaterialInventory(
                branchMaterial,
                recipeMaterial
              )
            }
            return branchMaterial
          })
        }
      }
    } else {
      if (missingMaterials.length > 0) {
        const missingMaterialNames = missingMaterials
          .map((material) => material.materialId)
          .join(', ')
        return next({
          status: 400,
          message: `The branch inventory is missing the following materials required by the recipe: ${missingMaterialNames}`,
        })
      } else {
        materials = materials.map((branchMaterial) => {
          const recipeMaterial = totalRecipesArray.find(
            (material) =>
              material.materialId.toString() ===
              branchMaterial.materialId.toString()
          )
          if (recipeMaterial) {
            branchMaterial = this.updateMaterialInventory(
              branchMaterial,
              recipeMaterial
            )
          }
          return branchMaterial
        })
      }
    }

    freshBranch.branchInventory.materials = materials
    freshBranch.branchInventory.cakes = cakes
    await freshBranch.save({ session })
  }
  calculatePoints = (totalPrice, itemCount, hasPromotion) => {
    const SECRET_RATE = 0.01
    const SECRET_PROMOTION_BONUS = 50
    let basePoints = totalPrice * SECRET_RATE
    let bonusPoints = hasPromotion ? SECRET_PROMOTION_BONUS : 0
    let totalPoints = basePoints + bonusPoints
    if (itemCount > 10) totalPoints *= 1.1
    return Math.round(totalPoints)
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
      } = await pagination(OrderModel, queryParams, null, {
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
  getById = async (orderId) => {
    try {
      const freshOrder = await OrderModel.findById(orderId)
        .select('-__v')
        .populate('orderGroupId', 'customerId customerInfo')
      return freshOrder
    } catch (error) {
      throw new Error(error)
    }
  }
  getListOrderByCustomerId = async (customerId, queryParams) => {
    try {
      const listOrderOfCustomer = await pagination(
        OrderModel,
        { ...queryParams, customerId },
        null,
        {
          populate: [
            {
              path: 'branchId',
              select: 'branchConfig.branchDisplayName',
            },
            {
              path: 'orderGroupId',
            },
          ],
        }
      )
      return listOrderOfCustomer
    } catch (error) {
      throw new Error(error)
    }
  }
  getByIdWithCondition = async (orderId, options, condition = {}) => {
    try {
      const queryCondition =
        Object.keys(condition).length !== 0 ? condition : orderId

      let query =
        Object.keys(condition).length !== 0
          ? OrderModel.findOne(queryCondition).select('-__v')
          : OrderModel.findById(queryCondition).select('-__v')

      Object.keys(options).forEach((key) => {
        const selectedFn = typeof query[key] === 'function' && key !== 'session'
        selectedFn && (query = query[key](options[key]))
      })
      options.session && (query = query.session(options.session))

      const freshOrder = await query
      return freshOrder
    } catch (error) {
      throw new Error(error)
    }
  }
  createGroup = async (orderGroupObj) => {
    try {
      const orderGroup = await OrderGroupModel.create(orderGroupObj)
      if (
        orderGroup.orderApplyPoint &&
        !Number.isNaN(orderGroup.orderApplyPoint)
      ) {
        await CustomerService.calculatePoint(
          orderGroup?._id,
          'sub',
          orderGroup?.customerId,
          orderGroup?.orderApplyPoint,
          'confirmed'
        )
      }
      const orderGroupId = orderGroup?._id
      const branchOrders = this.createBranchOrders(orderGroupId, orderGroup)
      for (const order of branchOrders) {
        await this.create(order)
      }
      return orderGroup
    } catch (error) {
      throw new Error(error)
    }
  }
  create = async (order) => {
    try {
      return await OrderModel.create(order)
    } catch (error) {
      throw new Error(error)
    }
  }
  updatePaymentStatusGroup = async (orderGroupId, paymentStatus) => {
    try {
      const orderGroup = await OrderGroupModel.findById(orderGroupId)
      orderGroup.paymentStatus = paymentStatus
      await orderGroup.save()
      return orderGroup
    } catch (error) {
      throw new Error(error)
    }
  }
  updateOrderStatus = async (orderStatus, orderId, staffId, next) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
      const freshOrder = await this.getByIdWithCondition(orderId, {
        populate: [
          {
            path: 'orderItems.cakeId',
            populate: {
              path: 'cakeRecipe',
              model: 'Recipe',
            },
          },
          { path: 'orderGroupId', select: 'paymentStatus customerId' },
        ],
        lean: true,
        session,
      })

      if (freshOrder?.orderGroupId?.paymentStatus === 'pending') {
        throw new Error('The order is awaiting payment.')
      } else if (freshOrder?.orderGroupId?.paymentStatus === 'cashOnDelivery') {
        switch (orderStatus) {
          case 'ready':
          case 'shipping':
          case 'queue':
            freshOrder.orderStatus = orderStatus
            break
          case 'completed':
            if (freshOrder.orderStatus !== 'processing') {
              const { orderItems } = freshOrder
              for (let item of orderItems) {
                const updatedSoldCake = await CakeModel.findById(
                  item.cakeId?._id
                ).session(session)
                updatedSoldCake.soldCount += Number(item.quantity)
                await updatedSoldCake.save({ session })
              }
              const points = this.calculatePoints(
                freshOrder?.orderSummary.totalPrice,
                freshOrder?.orderItems.length,
                freshOrder?.voucherCode
              )
              if (freshOrder?.customerId?._id) {
                await CustomerService.calculatePoint(
                  freshOrder?.orderGroupId._id,
                  'add',
                  freshOrder.customerId._id,
                  points,
                  'order',
                  session
                )
              } else {
                freshOrder?.orderType === 'selfOrder' &&
                  (await fetch(
                    `http://localhost:3000/api/branches/${freshOrder?.branchId}/inventory/cakes`,
                    {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        orderId,
                        isUrgent: true,
                      }),
                    }
                  ))
              }
              freshOrder.orderStatus = orderStatus
            }
            break
          default:
            if (
              (freshOrder?.orderUrgent?.isUrgent &&
                freshOrder?.orderUrgent?.orderExpectedTime !== '') ||
              !freshOrder?.orderGroupId?.customerId
            ) {
              await this.subtractMaterials(
                freshOrder.branchId,
                freshOrder.orderItems,
                freshOrder?.orderType,
                session,
                next
              )
            }
            freshOrder.orderStatus = 'processing'
            break
        }
      } else if (freshOrder?.orderGroupId?.paymentStatus === 'success') {
        switch (orderStatus) {
          case 'processing':
            await this.subtractMaterials(
              freshOrder.branchId,
              freshOrder.orderItems,
              'customerOrder',
              session,
              next
            )
            freshOrder.orderStatus = orderStatus
            break
          case 'completed':
            const { orderItems } = freshOrder
            for (let item of orderItems) {
              const updatedSoldCake = await CakeModel.findById(
                item.cakeId?._id
              ).session(session)
              updatedSoldCake.soldCount += Number(item.quantity)
              await updatedSoldCake.save({ session })
            }
            const points = this.calculatePoints(
              freshOrder?.orderSummary.totalPrice,
              freshOrder?.orderItems.length,
              freshOrder?.voucherCode
            )
            await CustomerService.calculatePoint(
              freshOrder?.orderGroupId._id,
              'add',
              freshOrder.customerId._id,
              points,
              'order',
              session
            )
            freshOrder.orderStatus = orderStatus
            break
          default:
            freshOrder.orderStatus = orderStatus
            break
        }
      } else {
        freshOrder.orderStatus = 'cancelled'
      }
      freshOrder.staffHandlerId = staffId
      await OrderModel.findByIdAndUpdate(orderId, freshOrder, {
        new: true,
        session,
      })
      await session.commitTransaction()
      return freshOrder
    } catch (error) {
      await session.abortTransaction()
      throw new Error(error)
    } finally {
      session.endSession()
    }
  }
  destroy = async (orderObj, orderId) => {
    try {
      const { orderStatus, explainReason } = orderObj
      const validStatuses = {
        cancelled: { from: 'any', to: 'cancelled' },
        returned: { from: 'completed', to: 'returned' },
        rejected: { from: 'shipping', to: 'rejected' },
      }
      const validStatus = validStatuses[orderStatus]
      if (!validStatus) {
        throw new Error('Invalid action provided.')
      }
      const freshOrder = await this.getById(orderId)
      if (
        validStatus.from === 'any' ||
        (freshOrder.orderStatus === validStatus.from &&
          orderStatus === validStatus.to)
      ) {
        freshOrder.explainReason = explainReason
        freshOrder.orderStatus = orderStatus || validStatus.to
        await freshOrder.save()
        return { freshOrder, orderStatus }
      } else {
        throw new Error(
          `This route is for ${orderStatus}. Invalid status: ${orderStatus}`
        )
      }
    } catch (error) {
      throw new Error(error)
    }
  }
  rateCakeInOrder = async (
    orderId,
    customerId,
    cakePayload,
    rateContent,
    rateStars
  ) => {
    try {
      const { cakeId, selectedVariants } = cakePayload
      const freshOrder = await OrderModel.findById(orderId).lean()

      if (!freshOrder) {
        return {
          isCompleted: false,
          message: MapResponseMessage.notFound('Đơn hàng'),
        }
      }

      const { orderItems } = freshOrder

      const mapNewOrderItems = orderItems.map((item) => {
        if (
          item.cakeId.toString() === cakeId.toString() &&
          item.selectedVariants.length === selectedVariants.length
        ) {
          item.isRated = !item.isRated
        }
        return item
      })

      await Promise.all([
        OrderModel.findByIdAndUpdate(orderId, {
          orderItems: mapNewOrderItems,
        }),
        RateService.createNewRate(cakeId, customerId, {
          rateContent,
          rateStars,
        }),
      ])

      return {
        isCompleted: true,
        message: '',
      }
    } catch (error) {
      throw new Error(error)
    }
  }
  calculateOrderAnalytics = async () => {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const startOfYesterday = new Date(startOfToday)
    startOfYesterday.setDate(startOfYesterday.getDate() - 1)

    const startOfThisMonth = new Date(startOfToday)
    startOfThisMonth.setDate(1)

    const endOfThisMonth = new Date(startOfThisMonth)
    endOfThisMonth.setMonth(startOfThisMonth.getMonth() + 1)

    const startOfLastMonth = new Date(startOfThisMonth)
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)

    const endOfLastMonth = new Date(startOfThisMonth)
    endOfLastMonth.setDate(0)

    const [todayStats] = await OrderModel.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$orderSummary.totalPrice' },
        },
      },
    ])

    const [yesterdayStats] = await OrderModel.aggregate([
      { $match: { createdAt: { $gte: startOfYesterday, $lt: startOfToday } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$orderSummary.totalPrice' },
        },
      },
    ])

    const [lastMonthStats] = await OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$orderSummary.totalPrice' },
        },
      },
    ])

    const [thisMonthStats] = await OrderModel.aggregate([
      {
        $match: { createdAt: { $gte: startOfThisMonth, $lt: endOfThisMonth } },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$orderSummary.totalPrice' },
        },
      },
    ])

    const totalOrdersToday = todayStats ? todayStats.totalOrders : 0
    const totalRevenueToday = todayStats ? todayStats.totalRevenue : 0
    const totalOrdersYesterday = yesterdayStats ? yesterdayStats.totalOrders : 0
    const totalRevenueYesterday = yesterdayStats
      ? yesterdayStats.totalRevenue
      : 0
    const totalRevenueLastMonth = lastMonthStats
      ? lastMonthStats.totalRevenue
      : 0
    const totalRevenueThisMonth = thisMonthStats
      ? thisMonthStats.totalRevenue
      : 0

    const totalOrdersThisMonth = await OrderModel.countDocuments({
      createdAt: { $gte: startOfThisMonth },
    })

    const totalOrdersLastMonth = await OrderModel.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    })

    return {
      totalOrdersToday,
      totalRevenueToday,
      totalOrdersYesterday,
      totalRevenueYesterday,
      totalOrdersThisMonth,
      totalOrdersLastMonth,
      totalRevenueLastMonth,
      totalRevenueThisMonth,
    }
  }
}

module.exports = new OrderService()
