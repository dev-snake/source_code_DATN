const express = require("express");
const router = express.Router();

const CategoryController = require("@/controllers/CategoryController");
const { validateRequiredParams } = require("@/middlewares/required-params");
const { staffTokenMiddleware } = require("@/middlewares/token-middlewares");
const { validateOptionalParams } = require("@/middlewares/optional-params");
const { validateForbiddenParams } = require("@/middlewares/forbidden-params");
const { requiredRole } = require("@/middlewares/role-validate");

router.get("/", CategoryController.getAllCategories);
router.get("/:categoryId", CategoryController.getCategoryInfo);
router.get("/:categoryId/cakes", CategoryController.getCategoryCakes);
router.post(
	"/",
	validateRequiredParams(["categoryName", "categoryKey"]),
	staffTokenMiddleware,
	requiredRole(2),
	CategoryController.createNewCategory
);
router.patch(
	"/:categoryId",
	validateOptionalParams(["categoryName", "categoryKey", "isActive", "categoryDescription"]),
	staffTokenMiddleware,
	requiredRole(2),
	validateForbiddenParams(["creatorId"]),
	CategoryController.updateCategory
);

router.patch(
	"/:categoryId/recover",
	staffTokenMiddleware,
	requiredRole(2),
	CategoryController.recoverCategory
);

router.patch(
	"/:categoryId/delete",
	staffTokenMiddleware,
	requiredRole(2),
	CategoryController.softDeleteCategory
)

router.delete("/:categoryId", staffTokenMiddleware, requiredRole(2), CategoryController.hardDeleteCategory);

module.exports = router;
