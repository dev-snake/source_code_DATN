const CakeModel = require('@/models/CakeModel')
const BranchModel = require('@/models/BranchModel')
const MaterialModel = require('@/models/MaterialModel')
const CategoryModel = require('@/models/CategoryModel')

const { writeImage } = require('@/utils/write-images')
const pagination = require('@/utils/pagination')
const RecipeModel = require('@/models/RecipeModel')
const MapResponseMessage = require("@/utils/response-message/vi-VN");

class CakeService {
	constructor() {
		this.createCake = this.createCake.bind(this)
		this.updateCake = this.updateCake.bind(this)
	}

	generateFileName(thumbnail, listImages) {
		function getExt(base64Url) {
			let parseImageExt = base64Url.split(';')[0].split('/')[1]

			return parseImageExt === 'jpeg' ? 'jpg' : parseImageExt
		}

		const thumbnailName =
			thumbnail && thumbnail.startsWith('data:')
				? `${new Date().getTime()}.${getExt(thumbnail)}`
				: thumbnail

		const imageNames =
			listImages
				?.map((_v, index) =>
					_v.startsWith('data:')
						? `${new Date().getTime()}-${index}.${getExt(_v)}`
						: _v
				)
				.filter((_v) => _v) ?? null

		if (imageNames && !imageNames.includes(thumbnailName)) {
			imageNames.push(thumbnailName)
		}

		return {
			thumbnailName,
			imageNames,
		}
	}

	async getAllCakes() {
		return CakeModel.find().lean()
	}

	async getAllCakesWithPagination(queryParams) {
		const cakeCategoryFilter = queryParams?.cakeCategory
			? { cakeCategory: { $in: queryParams.cakeCategory.split(',') } }
			: {}
		return pagination(CakeModel, {
			...queryParams,
			...cakeCategoryFilter,
		})
	}

	async getCakeInfoById(cakeId, hideFields = [], populateKey) {
		const mapHideFields = hideFields.reduce((results, field) => {
			results[field] = 0
			return results
		}, {})

		return CakeModel.findById(cakeId)
			.select(mapHideFields)
			.populate(populateKey)
			.lean()
	}

	async getListFeedbacksOfCustomer(customerId, queryParams) {
		try {
			const feedbacksQuery = {
				'rates.customerId': { $in: [customerId] },
			}
			const cakes = await pagination(CakeModel, {
				...queryParams,
				...feedbacksQuery,
			})
			return cakes
		} catch (error) {
			throw new Error(error)
		}
	}

	async createCake(cakeData, creatorId) {
		const {
			cakeName,
			cakeCategory,
			cakeDescription,
			cakeThumbnail,
			cakeMedias,
			cakeDefaultPrice,
			cakeVariants,
			cakeProperties,
			cakeRecipe,
			discountPercents,
		} = cakeData

		const { thumbnailName, imageNames } = this.generateFileName(
			cakeThumbnail,
			cakeMedias
		)

		const newCakeInfo = await new CakeModel({
			cakeName,
			cakeCategory,
			cakeDescription,
			cakeThumbnail: thumbnailName,
			cakeMedias: imageNames,
			cakeDefaultPrice,
			cakeVariants,
			cakeProperties,
			cakeRecipe,
			discountPercents,
			creatorId,
		}).save()

		await Promise.all([
			cakeMedias.map((media, index) =>
				writeImage({
					cakeId: newCakeInfo._id,
					base64Url: media,
					fileName: imageNames[index],
				})
			),
			writeImage({
				cakeId: newCakeInfo._id,
				base64Url: cakeThumbnail,
				fileName: thumbnailName,
			}),
		])

		return newCakeInfo
	}

	async getCurrentCakeMedias(cakeId) {
		return CakeModel.findById(cakeId).select('cakeMedias').lean()
	}

	async updateCake(cakeId, updateData) {
		const { cakeThumbnail, cakeMedias } = updateData

		const { cakeMedias: currentCakeMedias } = await this.getCurrentCakeMedias(
			cakeId
		)

		const newCakeMedias = cakeMedias
			? Array.from(new Set([...cakeMedias, ...currentCakeMedias]))
			: currentCakeMedias

		const { thumbnailName, imageNames } = this.generateFileName(
			cakeThumbnail,
			newCakeMedias
		)

		if (cakeThumbnail) {
			if (cakeThumbnail && cakeThumbnail.startsWith('data:')) {
				await writeImage({
					cakeId,
					base64Url: cakeThumbnail,
					fileName: thumbnailName,
				})
			}

			newCakeMedias.map((media, index) => {
				if (media.startsWith('data:')) {
					return writeImage({
						cakeId,
						base64Url: media,
						fileName: imageNames[index],
					})
				}
				return media
			})
		}

		const newCakeInfo = await CakeModel.findByIdAndUpdate(
			cakeId,
			{
				...updateData,
				cakeThumbnail: thumbnailName,
				cakeMedias: imageNames.filter((_v) => _v),
			},
			{ new: true }
		)

		return newCakeInfo
	}

	async increaseView(cakeId) {
		const { views } = await CakeModel.findByIdAndUpdate(
			cakeId,
			{
				$inc: {
					views: 1,
				},
			},
			{
				new: true,
			}
		)

		return true
	}

	async deleteCake(cakeId) {
		return CakeModel.findByIdAndDelete(cakeId)
	}

	async getListBranches(cakeId) {
		return BranchModel.find({ businessProducts: { $in: [cakeId] } }).select(
			'_id branchConfig.branchDisplayName'
		)
	}

	async getOriginalCakeRecipe(cake) {
		return await Promise.all(
			cake.cakeRecipe.recipeIngredients.map(async (recipe) => {
				const { materialName, calUnit } = await MaterialModel.findById(
					recipe.materialId
				).lean()
				return {
					...recipe,
					materialName,
					calUnit,
				}
			})
		)
	}

	async getCakeRecipe(cakeId) {
		const currentCake = await this.getCakeInfoById(cakeId, [], 'cakeRecipe')
		let mapRecipe = []
		if (currentCake.cakeVariants.length === 0) {
			mapRecipe = await this.getOriginalCakeRecipe(currentCake)
		} else {
			const originalCakeRecipe = await this.getOriginalCakeRecipe(currentCake)
			const mapRecipeVariant = await Promise.all(
				currentCake.cakeVariants.map(async (cakeVariant) => {
					const variantPromises = cakeVariant.variantItems.map(
						async (variant) => {
							const recipe = await RecipeModel.findOne({
								'recipeVariants.variantItems._id': variant.itemRecipe,
							}).lean()
							const matchingRecipeVariants = recipe.recipeVariants.flatMap(
								(vrRecipe) =>
									vrRecipe.variantItems.filter(
										(x) => x._id.toString() === variant.itemRecipe.toString()
									)
							)
							const materialDetails = await Promise.all(
								matchingRecipeVariants.map(async (item) => {
									const material = await MaterialModel.findById(
										item.materialId
									).lean()
									return {
										...item,
										materialName: material.materialName,
										calUnit: material.calUnit,
									}
								})
							)
							return materialDetails
						}
					)
					return Promise.all(variantPromises)
				})
			)
			mapRecipe = [...mapRecipeVariant.flat(2), ...originalCakeRecipe]
		}
		return mapRecipe
	}

	async getCakeByCategory(categoryId) {
		const { categoryKey } = await CategoryModel.findById(categoryId).lean()
		return CakeModel.find({ cakeCategory: categoryKey })
	}

	async softDeletionCake(cakeId) {
		const cakeData = await this.getCakeInfoById(cakeId);

		if (cakeData.isDeleted) {
			return {
				isSuccess: false,
				message: MapResponseMessage.alreadyDeleted("Bánh")
			}
		}

		const listBranches = await BranchModel.find().lean();

		await Promise.all(listBranches.map((branch) => {
			const cakeInventory = branch.branchInventory.cakes;

			if (!cakeInventory) {
				return;
			}

			const newCakeInventory = cakeInventory.filter((cake) => cake.cakeId.toString() !== cakeId)

			return BranchModel.findByIdAndUpdate(branch._id, {
				"branchInventory.cakes": newCakeInventory
			})
		}))

		await CakeModel.findByIdAndUpdate(cakeId, {
			isDeleted: true
		})

		return {
			isSuccess: true,
			message: MapResponseMessage.successDeleted("Bánh")
		}
	}

	async recoverCake(cakeId) {
		const cakeData = await this.getCakeInfoById(cakeId);

		if (!cakeData) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notFound("Bánh")
			}
		}

		if (!cakeData.isDeleted) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notInSoftDeletionState("recover")
			}
		}

		await CakeModel.findByIdAndUpdate(cakeId, {
			isDeleted: false
		})

		return {
			isSuccess: true,
			message: MapResponseMessage.successRecover("Bánh")
		}
	}

	async hardDeletionCake(cakeId) {
		const cakeData = await this.getCakeInfoById(cakeId);

		if (!cakeData) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notFound("Bánh")
			}
		}

		const listBranches = await BranchModel.find().lean();

		await Promise.all(listBranches.map((branch) => {
			const cakeInventory = branch.branchInventory.cakes;

			if (!cakeInventory) {
				return;
			}

			const newCakeInventory = cakeInventory.filter((cake) => cake.cakeId.toString() !== cakeId)

			return BranchModel.findByIdAndUpdate(branch._id, {
				"branchInventory.cakes": newCakeInventory
			})
		}))

		await CakeModel.findByIdAndDelete(cakeId)

		return {
			isSuccess: true,
			message: MapResponseMessage.successDeleted("Bánh")
		}
	}

}

module.exports = new CakeService()
