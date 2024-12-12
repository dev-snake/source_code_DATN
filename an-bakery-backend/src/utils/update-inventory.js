const ImportRequestModel = require('@/models/ImportRequestModel')
const SupplierService = require('@/services/SupplierService')
const { produce } = require('immer')

function filterUniqueItems(requestItems, requestItemsSnapshot) {
  const uniqueItems = requestItems.filter((snapshotItem) => {
    const requestItem = requestItemsSnapshot.find(
      (item) =>
        item.materialId.toString() === snapshotItem.materialId.toString() &&
        item.packageType.toString() === snapshotItem.packageType.toString() &&
        item.importStatus !== snapshotItem.importStatus
    )
    return requestItem
  })
  return uniqueItems
}
function isArray(array) {
  return Array.isArray(array) && array.length > 0
}
function updatePrevStateRequests(prevStateRequests, validRequestItems) {
  prevStateRequests.forEach((snapshotItem) => {
    const existingMaterial = validRequestItems.find(
      (item) =>
        item.materialId.toString() === snapshotItem.materialId.toString() &&
        item.packageType.toString() === snapshotItem.packageType.toString()
    )
    if (existingMaterial) {
      snapshotItem.importStatus = existingMaterial.importStatus
      snapshotItem.isSingle = existingMaterial.isSingle
    }
  })
  return prevStateRequests
}

exports.updateMaterialVolume = async (importRequest, branch) => {
  let materialsInventory = [...(branch?.branchInventory?.materials ?? [])]
  const prevState = !isArray(importRequest?.requestItemsSnapshot)
    ? importRequest.requestItems
    : importRequest.requestItemsSnapshot
  const prevStateRequests = JSON.parse(JSON.stringify(prevState))
  let validRequestItems
  if (isArray(importRequest?.requestItemsSnapshot)) {
    validRequestItems = filterUniqueItems(
      importRequest?.requestItems,
      prevStateRequests
    )
  } else {
    validRequestItems = importRequest.requestItems
  }
  for (const item of validRequestItems) {
    const { materialId, packageType, importQuantity, importStatus, isSingle } =
      item
    const supplier = await SupplierService.getByIdWithCondition(
      importRequest.supplierId,
      {
        select: 'supplyItems',
      }
    )
    const { materialSpecs } = supplier.supplyItems.find(
      (supplyItem) =>
        supplyItem.materialSpecs._id.toString() === packageType.toString()
    )
    if (!importStatus) continue
    const convertionQuantity = Number(
      materialSpecs.quantityPerPack *
        materialSpecs.packsPerUnit *
        importQuantity
    )
    materialsInventory = produce(materialsInventory, (draftState) => {
      const existingMaterial = draftState.find(
        (item) => item.materialId.toString() === materialId.toString()
      )
      if (existingMaterial) {
        if (!isSingle) {
          existingMaterial.inventoryVolume += convertionQuantity
        }
        existingMaterial.historyChange.push({
          weightChange: convertionQuantity,
          type: 'newImport',
        })
      } else {
        draftState.push({
          materialId,
          inventoryVolume: convertionQuantity,
          historyChange: [
            {
              weightChange: convertionQuantity,
              type: 'newImport',
            },
          ],
        })
      }
    })
  }
  const updatedPrevStateRequests = updatePrevStateRequests(
    prevStateRequests,
    validRequestItems
  )
  await ImportRequestModel.findByIdAndUpdate(
    importRequest._id,
    {
      requestItemsSnapshot: updatedPrevStateRequests,
    },
    { new: true }
  )
  return { success: true, materialsInventory }
}
exports.updateCakeQuantity = (orderItems, branch) => {
  let cakesInventory = [...(branch?.branchInventory?.cakes ?? [])]

  for (const item of orderItems) {
    const { cakeId, selectedVariants, quantity } = item
    cakesInventory = produce(cakesInventory, (draftState) => {
      const selectedVariantsKeys = selectedVariants.map(
        (variant) =>
          `${variant.variantKey.toString()}-${variant.itemKey.toString()}`
      )
      const existingCake = draftState.find((cake) => {
        if (cake.cakeId.toString() !== cakeId.toString()) return false
        if (cake.selectedVariants.length !== selectedVariants.length)
          return false
        return cake.selectedVariants.every(
          (cakeVariant, index) =>
            `${cakeVariant.variantKey.toString()}-${cakeVariant.itemKey.toString()}` ===
            selectedVariantsKeys[index]
        )
      })
      if (existingCake) {
        existingCake.inventoryVolume += quantity
        existingCake.historyChange.push({
          quantityChange: quantity,
          type: 'newImport',
        })
      } else {
        draftState.push({
          cakeId,
          inventoryVolume: quantity,
          selectedVariants,
          historyChange: [
            {
              quantityChange: quantity,
              type: 'newImport',
            },
          ],
        })
      }
    })
  }

  return cakesInventory
}
