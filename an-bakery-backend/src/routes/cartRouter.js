const express = require("express");
const { customerTokenMiddleware } = require("@/middlewares/token-middlewares");
const router = express.Router();

const CartController = require("@/controllers/CartController");
const { validateRequiredParams } = require("@/middlewares/required-params");

router.get("/",
	customerTokenMiddleware
);

router.post("/",
	customerTokenMiddleware,
	validateRequiredParams([
		"branchId",
		"cakeId",
		"selectedVariants",
		"quantity"
	]),
	CartController.addCakeToCart);

router.patch("/",
	customerTokenMiddleware,
	validateRequiredParams([
		"branchId",
		"cakeId",
		"selectedVariants",
		"newQuantity"
	]),
	CartController.changeCakeQuantity)

router.post("/delete",
	customerTokenMiddleware,
	validateRequiredParams([
		"branchId",
		"cakeId",
		"selectedVariants"
	]),
	CartController.deleteCake);

router.post("/voucher",
	customerTokenMiddleware,
	validateRequiredParams([
		"voucherCode",
		"orderData"
	]),
	CartController.setVoucherCode);

router.delete("/",
	customerTokenMiddleware,
	CartController.resetCart);

module.exports = router;