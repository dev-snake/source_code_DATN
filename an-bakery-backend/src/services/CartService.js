const CustomerModel = require("@/models/CustomerModel");
const CustomerService = require("@/services/CustomerService");
const CakeModel = require("@/models/CakeModel")

class CartService {


	constructor() {
		this.addCakeToCart = this.addCakeToCart.bind(this);
		this.deleteCakeFromCart = this.deleteCakeFromCart.bind(this);
	}

	checkExistBranchInCart(userCart, branchId) {
		return userCart.filter((_v) => {
			return _v.branchId === branchId;
		}).length > 0;
	}

	checkMatchVariants(selectedVariants, refSelectedVariants) {
		if (selectedVariants.length !== refSelectedVariants.length) {
			return false;
		}

		const stripId = obj => {
			const { _id, ...rest } = obj;
			return rest;
		};

		const sortedArr1 = selectedVariants
			.map(stripId)
			.sort((a, b) => (a.variantKey > b.variantKey ? 1 : -1));

		const sortedArr2 = refSelectedVariants
			.map(stripId)
			.sort((a, b) => (a.variantKey > b.variantKey ? 1 : -1));

		return sortedArr1.every((obj1, index) => {
			const obj2 = sortedArr2[index];
			return JSON.stringify(obj1) === JSON.stringify(obj2);
		});
	}

	checkCakeExistInCart(userCart, branchId, cakeId, selectedVariants) {
		let isExist = false;
		userCart.forEach((branch) => {
			if (branch.branchId === branchId) {
				if (branch.cartItems.filter((_v) =>
					cakeId === _v.cakeId && this.checkMatchVariants(selectedVariants, _v.selectedVariants)
				).length !== 0) {
					isExist = true;
				}
			}
		});

		return isExist;
	};

	handleRemoveCake(userCart, branchId, cakeId, selectedVariants) {
		let newUserCart = [...userCart];
		userCart.forEach((branch, index) => {
			if (branch.branchId === branchId) {
				newUserCart[index].cartItems = branch.cartItems.filter((_v) => {
					if (_v.cakeId !== cakeId) {
						return _v;
					}
					if (cakeId === _v.cakeId && !this.checkMatchVariants(selectedVariants, _v.selectedVariants)) {
						return _v;
					}
				});
			}
		});

		return newUserCart.filter((branch) => branch.cartItems.length > 0);
	};

	handleIncreaseQuantity(userCart, branchId, cakeId, selectedVariants, quantity) {
		userCart.forEach((branch) => {
			if (branch.branchId === branchId) {
				branch.cartItems.forEach((_v) => {
					if (cakeId === _v.cakeId && this.checkMatchVariants(selectedVariants, _v.selectedVariants)) {
						_v.quantity += quantity;
					}
				});
			}
		});

		return userCart;
	}

	handleSetQuantity(userCart, branchId, cakeId, selectedVariants, quantity) {
		userCart.forEach((branch) => {
			if (branch.branchId === branchId) {
				branch.cartItems.forEach((_v) => {
					if (cakeId === _v.cakeId && this.checkMatchVariants(selectedVariants, _v.selectedVariants)) {
						_v.quantity = quantity;
					}
				});
			}
		});

		return userCart;
	}

	handleInsertNewCake(userCart, branchId, cakeId, selectedVariants, quantity) {
		userCart.forEach((branch) => {
			if (branch.branchId === branchId) {
				branch.cartItems.push({
					cakeId,
					selectedVariants,
					quantity
				});
			}
		});

		return userCart;
	}

	getCartMetadata(userCart) {
		const numOfBranches = userCart.length;
		const numOfProducts = userCart.reduce((total, { cartItems }) => total + (cartItems?.length ?? 0), 0);
		return {
			numOfBranches,
			numOfProducts
		};
	}

	async addCakeToCart(customerId, bodyParams) {

		const { branchId, cakeId, selectedVariants, quantity } = bodyParams;

		const { userCart } = await CustomerService.getCustomerInfoById(customerId);

		let newCartData = [];
		if (this.checkExistBranchInCart(userCart, branchId)) {
			if (this.checkCakeExistInCart(userCart, branchId, cakeId, selectedVariants)) {
				newCartData = this.handleIncreaseQuantity(userCart, branchId, cakeId, selectedVariants, quantity);
			} else {
				newCartData = this.handleInsertNewCake(userCart, branchId, cakeId, selectedVariants, quantity);
			}
		} else {
			newCartData = [
				...userCart,
				{
					branchId,
					cartItems: [
						{
							cakeId,
							selectedVariants,
							quantity
						}
					]
				}
			];
		}

		return CustomerModel.findByIdAndUpdate(customerId, {
			userCart: newCartData
		}, { new: true });
	}

	async setCakeQuantity(customerId, bodyParams) {

		const { branchId, cakeId, selectedVariants, newQuantity } = bodyParams;

		const { userCart } = await CustomerService.getCustomerInfoById(customerId);

		let newCartData = [];
		if (this.checkExistBranchInCart(userCart, branchId)) {
			if (this.checkCakeExistInCart(userCart, branchId, cakeId, selectedVariants)) {
				newCartData = this.handleSetQuantity(userCart, branchId, cakeId, selectedVariants, newQuantity);
			} else {
				return false
			}
		} else {
			return false;
		}

		return CustomerModel.findByIdAndUpdate(customerId, {
			userCart: newCartData
		}, { new: true });
	}

	async deleteCakeFromCart(customerId, bodyParams) {
		const { branchId, cakeId, selectedVariants } = bodyParams;

		const { userCart } = await CustomerService.getCustomerInfoById(customerId);

		let newCartData = [
			...userCart
		];

		if (this.checkExistBranchInCart(userCart, branchId)) {
			if (this.checkCakeExistInCart(userCart, branchId, cakeId, selectedVariants)) {
				newCartData = this.handleRemoveCake(userCart, branchId, cakeId, selectedVariants);
			}
		}

		return CustomerModel.findByIdAndUpdate(customerId, {
			userCart: newCartData
		}, { new: true });
	}

	async resetCustomerCart(customerId) {
		return CustomerModel.findByIdAndUpdate(customerId, {
			userCart: []
		}, { new: true });
	}

	async setVoucherForBranchInCart(customerId, voucherCode, branchId) {
		const { userCart } = await CustomerService.getCustomerInfoById(customerId);

		const newCartData = userCart.map((branch) => {
			if (branch.branchId === branchId) {
				branch.branchVoucher = voucherCode;
			}
			return branch;
		});

		return CustomerModel.findByIdAndUpdate(customerId, {
			userCart: newCartData
		}, { new: true });
	}


	async reMapCustomerCart(customerCart) {
		const cakeIds = customerCart.flatMap(branch => branch.cartItems.map(item => item.cakeId));
		const uniqueCakeIds = [...new Set(cakeIds)];
		const cakes = await CakeModel.find({ _id: { $in: uniqueCakeIds } });

		const cakeMap = cakes.reduce((acc, cake) => {
			acc[cake._id] = cake;
			return acc;
		}, {});

		const newCustomerCart = customerCart.map(branch => {
			const newCartItems = branch.cartItems.map(item => {
				const cakeInfo = cakeMap[item.cakeId];
				return {
					...item,
					cakeInfo
				};
			});
			return {
				...branch,
				cartItems: newCartItems
			};
		});

		return newCustomerCart;
	}

}

module.exports = new CartService();