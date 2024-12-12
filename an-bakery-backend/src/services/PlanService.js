const BranchModel = require('@/models/BranchModel')
const CakeModel = require('@/models/CakeModel')
const OrderModel = require('@/models/OrderModel')
const PlanModel = require('@/models/PlanModel')
const RecipeModel = require('@/models/RecipeModel')
const pagination = require('@/utils/pagination')

class PlanService {
  processItemWithVariants = async (item, branchCake, planDetails) => {
    const cakeId = item.cakeId._id.toString()
    const freshCake = await CakeModel.findById(cakeId)
      .lean()
      .populate('cakeRecipe')
    let totalMaterials = [...freshCake?.cakeRecipe.recipeIngredients]
    let currentInventory = branchCake?.inventoryVolume || 0

    const variantItems = item.selectedVariants.flatMap((selectedVariant) => {
      const matchingVariant = freshCake.cakeVariants.find(
        (variant) =>
          selectedVariant.variantKey.toString() === variant._id.toString()
      )
      return matchingVariant.variantItems
        .filter(
          (variantItem) =>
            variantItem._id.toString() === selectedVariant.itemKey.toString()
        )
        .map((variantItem) => variantItem.itemRecipe.toString())
    })
    const matchingRecipes = await RecipeModel.find({
      'recipeVariants.variantItems._id': { $in: variantItems },
    })
      .select('recipeIngredients recipeVariants')
      .lean()
    for (const recipe of matchingRecipes) {
      const variantMaterials = recipe.recipeVariants.flatMap((variant) =>
        variant.variantItems
          .filter((variantItem) =>
            variantItems.includes(variantItem._id.toString())
          )
          .map((filteredItem) => ({
            materialId: filteredItem.materialId,
            quantity: filteredItem.quantity,
          }))
      )
      totalMaterials.push(...variantMaterials)
    }

    const existingPlanDetail = planDetails.find(
      (plan) =>
        plan.cakeId.toString() === cakeId &&
        item.selectedVariants.length === plan.selectedVariants.length &&
        item.selectedVariants.every((variant) =>
          plan.selectedVariants.some(
            (planVariant) =>
              planVariant.variantKey.toString() ===
                variant.variantKey.toString() &&
              planVariant.itemKey.toString() === variant.itemKey.toString()
          )
        )
    )
    if (existingPlanDetail) {
      existingPlanDetail.orderCount++
      existingPlanDetail.orderAmount += item.quantity
      existingPlanDetail.plannedProduction =
        existingPlanDetail.orderAmount > currentInventory
          ? existingPlanDetail.orderAmount - currentInventory
          : item.quantity
      existingPlanDetail.plannedProduction !== 0 &&
        totalMaterials.forEach((material) => {
          const existingMaterial = existingPlanDetail.totalMaterials.find(
            (m) => m.materialId.toString() === material.materialId.toString()
          )
          if (existingMaterial) {
            existingMaterial.quantity =
              material.quantity *
              (existingPlanDetail.orderAmount - currentInventory)
          } else {
            existingPlanDetail.totalMaterials.push({
              ...material,
              quantity:
                material.quantity *
                (existingPlanDetail.orderAmount - currentInventory),
            })
          }
        })
    } else {
      totalMaterials =
        item.quantity <= currentInventory
          ? []
          : totalMaterials.map((x) => ({
              ...x,
              quantity:
                item.quantity <= currentInventory
                  ? 0
                  : (item.quantity - currentInventory) * x.quantity,
            }))
      planDetails.push({
        cakeId: branchCake ? branchCake.cakeId : cakeId,
        orderCount: 1,
        orderAmount: item.quantity,
        currentInventory,
        plannedProduction:
          item.quantity <= currentInventory
            ? 0
            : item.quantity - currentInventory,
        totalMaterials,
        selectedVariants: item.selectedVariants,
      })
    }
  }
  processItemNonVariants = async (item, branchCake, planDetails) => {
    const cakeId = item.cakeId._id.toString()
    const freshCake = await CakeModel.findById(cakeId)
      .lean()
      .populate('cakeRecipe')
    let totalMaterials = [...freshCake?.cakeRecipe.recipeIngredients]
    let currentInventory = branchCake?.inventoryVolume || 0

    const existingPlanDetail = planDetails.find(
      (plan) =>
        plan.cakeId.toString() === cakeId && plan.selectedVariants.length === 0
    )
    if (existingPlanDetail) {
      existingPlanDetail.orderCount++
      existingPlanDetail.orderAmount += item.quantity
      existingPlanDetail.plannedProduction =
        existingPlanDetail.orderAmount > currentInventory
          ? existingPlanDetail.orderAmount - currentInventory
          : 0
      existingPlanDetail.plannedProduction !== 0 &&
        totalMaterials.forEach((material) => {
          const existingMaterial = existingPlanDetail.totalMaterials.find(
            (m) => m.materialId.toString() === material.materialId.toString()
          )
          if (existingMaterial) {
            existingMaterial.quantity =
              material.quantity *
              (existingPlanDetail.orderAmount - currentInventory)
          } else {
            existingPlanDetail.totalMaterials.push({
              ...material,
              quantity:
                material.quantity *
                (existingPlanDetail.orderAmount - currentInventory),
            })
          }
        })
    } else {
      totalMaterials =
        item.quantity <= currentInventory
          ? []
          : totalMaterials.map((x) => ({
              ...x,
              quantity:
                item.quantity <= currentInventory
                  ? 0
                  : (item.quantity - currentInventory) * x.quantity,
            }))
      planDetails.push({
        cakeId: branchCake ? branchCake.cakeId : cakeId,
        orderCount: 1,
        orderAmount: item.quantity,
        currentInventory,
        plannedProduction:
          item.quantity <= currentInventory
            ? 0
            : item.quantity - currentInventory,
        totalMaterials,
      })
    }
  }
  handleNoCakeWithVariants = async (item, planDetails) => {
    const cakeId = item.cakeId._id.toString()
    const freshCake = await CakeModel.findById(cakeId)
      .lean()
      .populate('cakeRecipe')
    let totalMaterials = [...freshCake?.cakeRecipe.recipeIngredients]

    const variantItems = item.selectedVariants.flatMap((selectedVariant) => {
      const matchingVariant = freshCake.cakeVariants.find(
        (variant) =>
          selectedVariant.variantKey.toString() === variant._id.toString()
      )
      return matchingVariant.variantItems
        .filter(
          (variantItem) =>
            variantItem._id.toString() === selectedVariant.itemKey.toString()
        )
        .map((variantItem) => variantItem.itemRecipe.toString())
    })

    const matchingRecipes = await RecipeModel.find({
      'recipeVariants.variantItems._id': { $in: variantItems },
    })
      .select('recipeIngredients recipeVariants')
      .lean()

    for (const recipe of matchingRecipes) {
      const variantMaterials = recipe.recipeVariants.flatMap((variant) =>
        variant.variantItems
          .filter((variantItem) =>
            variantItems.includes(variantItem._id.toString())
          )
          .map((filteredItem) => ({
            materialId: filteredItem.materialId,
            quantity: filteredItem.quantity,
          }))
      )
      totalMaterials.push(...variantMaterials)
    }

    const currentInventory = 0
    const existingPlanDetail = planDetails.find(
      (plan) =>
        plan.cakeId.toString() === cakeId &&
        item.selectedVariants.length === plan.selectedVariants.length &&
        item.selectedVariants.every((variant) =>
          plan.selectedVariants.some(
            (planVariant) =>
              planVariant.variantKey.toString() ===
                variant.variantKey.toString() &&
              planVariant.itemKey.toString() === variant.itemKey.toString()
          )
        )
    )

    if (existingPlanDetail) {
      existingPlanDetail.orderCount++
      existingPlanDetail.orderAmount += item.quantity
      existingPlanDetail.plannedProduction =
        existingPlanDetail.orderAmount > currentInventory
          ? existingPlanDetail.orderAmount - currentInventory
          : item.quantity
      existingPlanDetail.plannedProduction !== 0 &&
        totalMaterials.forEach((material) => {
          const existingMaterial = existingPlanDetail.totalMaterials.find(
            (m) => m.materialId.toString() === material.materialId.toString()
          )
          if (existingMaterial) {
            existingMaterial.quantity =
              material.quantity *
              (existingPlanDetail.orderAmount - currentInventory)
          } else {
            existingPlanDetail.totalMaterials.push({
              ...material,
              quantity:
                material.quantity *
                (existingPlanDetail.orderAmount - currentInventory),
            })
          }
        })
    } else {
      totalMaterials =
        item.quantity <= currentInventory
          ? []
          : totalMaterials.map((x) => ({
              ...x,
              quantity:
                item.quantity <= currentInventory
                  ? 0
                  : (item.quantity - currentInventory) * x.quantity,
            }))
      planDetails.push({
        cakeId: cakeId,
        orderCount: 1,
        orderAmount: item.quantity,
        currentInventory,
        plannedProduction:
          item.quantity <= currentInventory
            ? 0
            : item.quantity - currentInventory,
        totalMaterials,
        selectedVariants: item.selectedVariants,
      })
    }
  }
  handleNoCakeWithoutVariants = async (item, planDetails) => {
    const cakeId = item.cakeId._id.toString()
    const freshCake = await CakeModel.findById(cakeId)
      .lean()
      .populate('cakeRecipe')
    let totalMaterials = [...freshCake?.cakeRecipe.recipeIngredients]

    const currentInventory = 0

    const existingPlanDetail = planDetails.find(
      (plan) =>
        plan.cakeId.toString() === cakeId && plan.selectedVariants.length === 0
    )

    if (existingPlanDetail) {
      existingPlanDetail.orderCount++
      existingPlanDetail.orderAmount += item.quantity
      existingPlanDetail.plannedProduction =
        existingPlanDetail.orderAmount > currentInventory
          ? existingPlanDetail.orderAmount - currentInventory
          : 0
      existingPlanDetail.plannedProduction !== 0 &&
        totalMaterials.forEach((material) => {
          const existingMaterial = existingPlanDetail.totalMaterials.find(
            (m) => m.materialId.toString() === material.materialId.toString()
          )
          if (existingMaterial) {
            existingMaterial.quantity =
              material.quantity *
              (existingPlanDetail.orderAmount - currentInventory)
          } else {
            existingPlanDetail.totalMaterials.push({
              ...material,
              quantity:
                material.quantity *
                (existingPlanDetail.orderAmount - currentInventory),
            })
          }
        })
    } else {
      totalMaterials =
        item.quantity <= currentInventory
          ? []
          : totalMaterials.map((x) => ({
              ...x,
              quantity:
                item.quantity <= currentInventory
                  ? 0
                  : (item.quantity - currentInventory) * x.quantity,
            }))
      planDetails.push({
        cakeId: cakeId,
        orderCount: 1,
        orderAmount: item.quantity,
        currentInventory,
        plannedProduction:
          item.quantity <= currentInventory
            ? 0
            : item.quantity - currentInventory,
        totalMaterials,
      })
    }
  }
  getUpdatedPlanDetails = async (branchId, orderItems, planDetails) => {
    try {
      const branchInventory = await BranchModel.findById(branchId).lean()
      const branchInventoryCakes =
        branchInventory?.branchInventory['cakes'] || []

      const nonVariantItems = orderItems.filter(
        (item) => item.selectedVariants.length === 0
      )
      const variantItems = orderItems.filter(
        (item) => item.selectedVariants.length > 0
      )

      if (branchInventoryCakes.length !== 0) {
        for (let item of nonVariantItems) {
          for (let branchCake of branchInventoryCakes) {
            if (
              branchCake.cakeId.toString() === item.cakeId._id.toString() &&
              branchCake.selectedVariants.length === 0
            ) {
              await this.processItemNonVariants(item, branchCake, planDetails)
            }
          }
        }
        for (let item of variantItems) {
          const branchCake = branchInventoryCakes.find(
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
          if (branchCake) {
            await this.processItemWithVariants(item, branchCake, planDetails)
          }
        }
      } else {
        for (let item of nonVariantItems) {
          await this.handleNoCakeWithoutVariants(item, planDetails)
        }
        for (let item of variantItems) {
          await this.handleNoCakeWithVariants(item, planDetails)
        }
      }

      return planDetails
    } catch (error) {
      throw new Error(error)
    }
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

  getAll = async (queryParams) => {
    try {
      const {
        page,
        limit,
        noPagination,
        paginatedData,
        totalPages,
        totalRecords,
      } = await pagination(PlanModel, queryParams)

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
  getById = async (planId) => {
    try {
      const freshPlan = await PlanModel.findById(planId).select('-__v')
      return freshPlan
    } catch (error) {
      throw new Error(error)
    }
  }
  getByIdWithCondition = async (planId, options) => {
    try {
      let query = PlanModel.findById(planId).select('-__v')

      Object.keys(options).forEach((key) => {
        if (typeof query[key] === 'function') {
          query = query[key](options[key])
        }
      })

      const freshPlan = await query
      return freshPlan
    } catch (error) {
      throw new Error(error)
    }
  }
  create = async (planPayload) => {
    try {
      const plan = await PlanModel.create(planPayload)
      return plan
    } catch (error) {
      throw new Error(error)
    }
  }
  createOrderQueueProduction = async (payload, planId, planDetails) => {
    try {
      const { orderId, orderItems, branchId } = payload
      const orderQueuePlan = await this.getUpdatedPlanDetails(
        branchId,
        orderItems,
        planDetails
      )
      return await PlanModel.findByIdAndUpdate(
        planId,
        {
          planDetails: orderQueuePlan,
          $push: {
            orderId,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )
    } catch (error) {
      throw new Error(error)
    }
  }
  updatePlanStatus = async (freshPlan, planPayload) => {
    try {
      const { _id: planId, orderId: listOrderIds, branchId } = freshPlan
      const { planStatus, totalMaterials } = planPayload
      const freshBranch = await BranchModel.findById(branchId)
      const validStatus = ['closed', 'pending', 'in_progress', 'completed']
      if (!validStatus.includes(planStatus)) {
        throw new Error(`Plan status is invalid: ${planStatus}`)
      }
      if (totalMaterials && totalMaterials.length !== 0) {
        const materialMap = new Map(
          totalMaterials.map((material) => [
            material.materialId._id.toString(),
            material,
          ])
        )
        const updatedMaterials =
          freshBranch?.branchInventory?.materials?.map((branchMaterial) => {
            const recipeMaterial = materialMap.get(
              branchMaterial.materialId.toString()
            )
            if (recipeMaterial) {
              return this.updateMaterialInventory(
                branchMaterial,
                recipeMaterial
              )
            }
            return branchMaterial
          }) ?? []
        const updateOrderPromises = listOrderIds.map((orderId) =>
          OrderModel.findByIdAndUpdate(
            orderId,
            { orderStatus: 'ready' },
            { new: true, runValidators: true }
          )
        )
        await Promise.all(updateOrderPromises)
        freshBranch.branchInventory.materials = updatedMaterials
        await freshBranch.save()
      }
      return await PlanModel.findByIdAndUpdate(
        planId,
        {
          planStatus,
        },
        { new: true, runValidators: true }
      )
    } catch (error) {
      throw new Error(error)
    }
  }
  update = async (planId, planPayload) => {
    try {
      const updatedPlan = await PlanModel.findByIdAndUpdate(
        planId,
        planPayload,
        {
          new: true,
          runValidators: true,
        }
      )
      return updatedPlan
    } catch (error) {
      throw new Error(error)
    }
  }
  delete = async (planId) => {
    try {
      const isDeleted = await PlanModel.deleteOne({ _id: planId })
      return isDeleted ? true : false
    } catch (error) {
      throw new Error(error)
    }
  }
}

module.exports = new PlanService()
