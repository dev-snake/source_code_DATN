const CategoryService = require("@/services/CategoryService");
const CakeService = require("@/services/CakeService");
const CategoryModel = require("@/models/CategoryModel");
const pagination = require("@/utils/pagination");

const MapResponseMessage = require("@/utils/response-message/vi-VN")

class CategoryController {
	constructor() {
		this.getAllCategories = this.getAllCategories.bind(this);
		this.getCategoryInfo = this.getCategoryInfo.bind(this);
		this.createNewCategory = this.createNewCategory.bind(this);
		this.deleteCategory = this.deleteCategory.bind(this);
		this.updateCategory = this.updateCategory.bind(this);
	}


	async getAllCategories(req, res, next) {
		try {
			const {
				page,
				limit,
				noPagination,
				paginatedData,
				totalPages,
				totalRecords
			} = await CategoryService.getAllCategoriesWithPagination(req.query);

			if (!noPagination) {
				if (page > totalPages) {
					return next({
						status: 400,
						message: MapResponseMessage.notExistPage(totalPages),
					});
				}
			}

			return res.status(200).json({
				status: "success",
				message: paginatedData.length > 0
					? noPagination
						? MapResponseMessage.successGetAllWithoutPagination("Danh mục")
						: MapResponseMessage.successGetAllWithPagination("Danh mục", page)
					: MapResponseMessage.successWithEmptyData("Danh mục"),
				metadata: {
					currentPage: noPagination ? 1 : page,
					limitPerPage: noPagination ? null : limit,
					totalPages: noPagination ? 1 : totalPages,
					totalRecords,
					countRecords: paginatedData.length,
				},
				results: paginatedData,
			});
		} catch (error) {
			return next({
				status: 500,
				error,
			});
		}
	}

	async getCategoryInfo(req, res, next) {
		try {
			const { categoryId } = req.params;

			const results = await CategoryService.getCategoryInfoById(categoryId);

			if (!results) {
				return next({
					status: 400,
					message: MapResponseMessage.notFound("Danh mục"),
				})
			}

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successGetOne("Danh mục"),
				metadata: {
					categoryKey: results.categoryKey,
					categoryName: results.categoryName,
				},
				results,
			});
		} catch (error) {
			return next({
				status: 500,
				error,
			});
		}
	}

	async createNewCategory(req, res, next) {
		try {
			const { categoryKey } = req.body;

			if (!(await CategoryService.checkValidCategoryKey(categoryKey))) {
				return next({
					status: 404,
					message: MapResponseMessage.invalidCategoryKey,
				});
			}

			if (await CategoryService.checkExistCategoryKey(categoryKey)) {
				return next({
					status: 404,
					message: MapResponseMessage.exists("categoryKey"),
				});
			}

			const { _id } = await CategoryService.createCategory(req.body, req.staffCode);

			return res.status(201).json({
				status: "success",
				message: MapResponseMessage.successCreate("Danh mục"),
				results: {
					newCategoryId: _id
				}

			});
		} catch (error) {
			return next({
				status: 500,
				error,
			});
		}
	}

	async updateCategory(req, res, next) {
		try {
			const { categoryId } = req.params;

			const { categoryKey } = req.body;

			if (!(await CategoryService.checkValidCategoryId(categoryId))) {
				return next({
					status: 400,
					message: MapResponseMessage.notFound("Danh mục"),
				});
			}

			if (await CategoryService.checkExistCategoryKey(categoryKey, categoryId)) {
				return next({
					status: 400,
					message: MapResponseMessage.exists("categoryKey"),
				})
			}

			const newCategoryInfo = await CategoryService.updateCategory(categoryId, req.body);

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successUpdate("Danh mục"),
				metadata: {
					categoryKey: newCategoryInfo.categoryKey,
					categoryName: newCategoryInfo.categoryName,
				},
				results: newCategoryInfo,
			});
		} catch (error) {
			return next({
				status: 500,
				error,
			});
		}
	}

	async deleteCategory(req, res, next) {
		try {
			const { categoryId } = req.params;

			if (!(await CategoryService.checkValidCategoryId(categoryId))) {
				return next({
					status: 404,
					message: MapResponseMessage.notFound("Danh mục"),
				});
			}

			await CategoryService.deleteCategory(categoryId);

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successDeleted("Danh mục"),
			});
		} catch (error) {
			return next({
				status: 500,
				error,
			});
		}
	}

	async getCategoryCakes(req, res, next) {
		try {

			const { categoryId } = req.params;

			const listCakes = await CakeService.getCakeByCategory(categoryId);


			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successGetAllWithoutPagination("Bánh trong danh mục"),
				results: listCakes,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async recoverCategory(req, res, next) {
		try {
			const { categoryId } = req.params;

			const { isSuccess, message } = await CategoryService.recoverCategory(categoryId);

			if (!isSuccess) {
				return next({
					status: 404,
					message,
				})
			}

			return res.status(200).json({
				status: "success",
				message,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async softDeleteCategory(req, res, next) {
		try {
			const { categoryId } = req.params;

			const { isSuccess, message } = await CategoryService.softDeletionCategory(categoryId);

			if (!isSuccess) {
				return next({
					status: 404,
					message,
				})
			}

			return res.status(200).json({
				status: "success",
				message,
			})

		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async hardDeleteCategory(req, res, next) {
		try {
			const { categoryId } = req.params;

			const { isSuccess, message } = await CategoryService.hardDeletionCategory(categoryId);

			if (!isSuccess) {
				return next({
					status: 404,
					message,
				})
			}

			return res.status(200).json({
				status: "success",
				message,
			})

		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}
}

module.exports = new CategoryController();
