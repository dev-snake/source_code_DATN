const CategoryModel = require("@/models/CategoryModel");
const CakeModel = require("@/models/CakeModel");

const pagination = require("@/utils/pagination");
const MapResponseMessage = require("@/utils/response-message/vi-VN");

class CategoryService {

	constructor() {
	}

	async checkExistCategoryKey(categoryKey, categoryId = null) {
		if (categoryId) {
			const categoryData = await CategoryModel.findById(categoryId);

			if (categoryData.categoryKey === categoryKey) {
				return false;
			} else {
				const categoryData = await CategoryModel.findOne({
					categoryKey,
				});

				return !!categoryData;
			}
		} else {
			const categoryData = await CategoryModel.findOne({
				categoryKey,
			});

			return !!categoryData;

		}


	}

	async checkValidCategoryId(categoryId) {
		return !!(await CategoryModel.findById(categoryId));
	}

	async checkValidCategoryKey(categoryKey) {
		return categoryKey.split(" ").length === 1;
	}

	async getAllCategoriesWithPagination(queryParams) {

		const { isActive } = queryParams;

		if (isActive) {
			return pagination(CategoryModel, queryParams, null, {
				find: {
					isActive
				}
			});
		} else {
			return pagination(CategoryModel, queryParams, null);
		}

	}

	async getCategoryInfoById(categoryId) {
		return CategoryModel.findById(categoryId).lean();
	}

	async createCategory(categoryData, creatorId) {
		return CategoryModel.create({
			...categoryData,
			creatorId,
		})
	}

	async updateCategory(categoryId, updateData) {

		const { categoryKey } = updateData;

		const currentCategory = await CategoryModel.findById(categoryId).lean();

		if (currentCategory.categoryKey !== categoryKey) {
			await CakeModel.updateMany({
				cakeCategory: currentCategory.categoryKey,
			}, {
				cakeCategory: categoryKey
			})
		}

		return CategoryModel.findByIdAndUpdate(categoryId, updateData, { new: true })
	}

	async deleteCategory(categoryId) {

		const currentCategory = await CategoryModel.findById(categoryId).lean();

		await CakeModel.updateMany({
			cakeCategory: currentCategory.categoryKey,
		}, {
			isHide: true
		})

		return CategoryModel.findByIdAndDelete(categoryId);
	}

	async softDeletionCategory(categoryId) {
		const categoryData = await this.getCategoryInfoById(categoryId)

		if (!categoryData) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notFound("Danh mục")
			}
		}


		if (categoryData.isDeleted) {
			return {
				isSuccess: false,
				message: MapResponseMessage.alreadyDeleted("Danh mục")
			}
		}

		await CakeModel.updateMany({
			cakeCategory: categoryData.categoryKey,
		}, {
			isHide: true,
			cakeCategory: null,
		})

		await CategoryModel.findByIdAndUpdate(categoryId, {
			isDeleted: true
		})


		return {
			isSuccess: true,
			message: MapResponseMessage.successDeleted("Danh mục")
		}

	}

	async hardDeletionCategory(categoryId) {
		const categoryData = await this.getCategoryInfoById(categoryId)

		if (!categoryData) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notFound("Danh mục")
			}
		}

		if (!categoryData.isDeleted) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notInSoftDeletionState("delete")
			}
		} else {
			await CategoryModel.findByIdAndDelete(categoryId);
			return {
				isSuccess: true,
				message: MapResponseMessage.successDeleted("Danh mục")
			}
		}
	}

	async recoverCategory(categoryId) {
		const categoryData = await this.getCategoryInfoById(categoryId)

		if (!categoryData) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notFound("Danh mục")
			}
		}

		if (!categoryData.isDeleted) {
			return {
				isSuccess: false,
				message: MapResponseMessage.notInSoftDeletionState("recover")
			}
		} else {
			await CategoryModel.findByIdAndUpdate(categoryId, {
				isDeleted: false,
			})
			return {
				isSuccess: true,
				message: MapResponseMessage.successRecover("Danh mục")
			}
		}

	}
}

module.exports = new CategoryService();