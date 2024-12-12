const CartService = require("@/services/CartService");
const VoucherService = require("@/services/VoucherService");

const MapResponseMessage = require("@/utils/response-message/vi-VN");

class CartController {
	constructor() {
	}


	async addCakeToCart(req, res, next) {
		try {

			const { userCart } = await CartService.addCakeToCart(req._id, req.body);

			const { numOfBranches, numOfProducts } = CartService.getCartMetadata(userCart);
			
			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.addNewItemToCart,
				metadata: {
					customerId: req._id,
					numOfBranches,
					numOfProducts
				},
				results: userCart
			});

		} catch (error) {
			return next({
				status: 500,
				error
			});
		}
	}

	async changeCakeQuantity(req, res, next) {
		try {

			const newCart = await CartService.setCakeQuantity(req._id, req.body);

			if (!newCart) {
				return next({
					status: 400,
					message: MapResponseMessage.notFound("Bánh trong giỏ hàng")
				});
			}

			const { userCart } = newCart;

			const { numOfBranches, numOfProducts } = CartService.getCartMetadata(userCart);

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successUpdate("Số lượng của bánh"),
				metadata: {
					customerId: req._id,
					numOfBranches,
					numOfProducts
				},
				results: userCart
			});

		} catch (error) {
			return next({
				status: 500,
				error
			});
		}
	}

	async deleteCake(req, res, next) {
		try {
			let { userCart } = await CartService.deleteCakeFromCart(req._id, req.body);

			const { numOfBranches, numOfProducts } = CartService.getCartMetadata(userCart);

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successDeleted("Bánh khỏi giỏ hàng"),
				metadata: {
					customerId: req._id,
					numOfBranches,
					numOfProducts
				},
				results: userCart
			});
		} catch (error) {
			return next({
				status: 500,
				error
			});
		}
	}

	async resetCart(req, res, next) {
		try {
			const { userCart } = await CartService.resetCustomerCart(req._id);

			const { numOfBranches, numOfProducts } = CartService.getCartMetadata(userCart);

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.resetCart,
				metadata: {
					customerId: req._id,
					numOfBranches,
					numOfProducts
				},
				results: userCart
			});
		} catch (error) {
			return next({
				status: 500,
				error
			});
		}
	}

	async setVoucherCode(req, res, next) {
		try {
			const { voucherCode, orderData } = req.body;

			const checkUsability = await VoucherService.checkVoucherUsability(req._id, voucherCode, orderData, orderData.branchId);

			if (!checkUsability.isOk) {
				return next({
					status: 400,
					message: checkUsability.message
				});
			}

			await CartService.setVoucherForBranchInCart(req._id, voucherCode, orderData.branchId);

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successUpdate("Mã giảm giá"),
				results: checkUsability.voucherData
			});

		} catch (error) {
			return next({
				status: 500,
				error
			});
		}
	}
}

module.exports = new CartController();