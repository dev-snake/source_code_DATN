const AuthService = require('@/services/AuthService')
const CustomerService = require('@/services/CustomerService')
const CartService = require('@/services/CartService')
const VoucherService = require('@/services/VoucherService')
const OTPService = require('@/services/OTPService')
const AddressService = require('@/services/AddressService')
const OrderService = require('@/services/OrderService')
const CakeService = require('@/services/CakeService')
const MapResponseMessage = require("@/utils/response-message/vi-VN");

class CustomerController {
	constructor() {
		this.getAllCustomers = this.getAllCustomers.bind(this)
		this.changePassword = this.changePassword.bind(this)
	}

	async getAllCustomers(req, res, next) {
		try {
			const {
				page,
				limit,
				noPagination,
				paginatedData,
				totalPages,
				totalRecords,
			} = await CustomerService.getAllCustomerWithPagination(req.query)

			if (!noPagination) {
				if (page > totalPages) {
					return next({
						status: 400,
						message: MapResponseMessage.notExistPage(totalPages),
					})
				}
			}

			return res.status(200).json({
				status: "success",
				message:
					paginatedData.length > 0
						? noPagination
							? MapResponseMessage.successGetAllWithoutPagination("Khách hàng")
							: MapResponseMessage.successGetAllWithPagination("Khách hàng", page)
						: MapResponseMessage.successWithEmptyData("Khách hàng"),
				metadata: {
					currentPage: noPagination ? 1 : page,
					limitPerPage: noPagination ? null : limit,
					totalPages: noPagination ? 1 : totalPages,
					totalRecords,
					countRecords: paginatedData.length,
				},
				results: paginatedData,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getCustomerInfoById(req, res, next) {
		try {
			const { customerId } = req.params

			const customerInfo = await CustomerService.getCustomerInfoById(customerId)

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successGetOne("Khách hàng"),
				metadata: {
					customerId,
					userName: customerInfo.userName,
				},
				results: customerInfo,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async changePassword(req, res, next) {
		try {
			const { otpCode, newPassword, oldPassword } = req.body

			const { password } = await CustomerService.getCustomerInfoById(req._id)

			if (!(await AuthService.comparePassword(oldPassword, password))) {
				return next({
					status: 400,
					message: MapResponseMessage.wrongOldPassword,
				})
			}

			if (!(await OTPService.checkValidOTP(otpCode, req._id, 'password'))) {
				return next({
					status: 400,
					message: MapResponseMessage.wrongOTP,
				})
			}

			await Promise.all([
				CustomerService.setNewPassword(req._id, newPassword),
				OTPService.setUsedOTP(otpCode, req._id),
			])

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successUpdate("Mật khẩu mới"),
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getCustomerCart(req, res, next) {
		try {
			const { customerId } = req.params

			const { userCart } = await CustomerService.getCustomerInfoById(customerId)

			const reMapCart = await CartService.reMapCustomerCart(userCart)

			const { numOfBranches, numOfProducts } =
				CartService.getCartMetadata(userCart)

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successGetOne("Giỏ hàng"),
				metadata: {
					customerId,
					numOfBranches,
					numOfProducts,
				},
				results: reMapCart,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getCurrentCart(req, res, next) {
		try {
			const { userCart } = await CustomerService.getCustomerInfoById(req._id)

			const reMapCart = await CartService.reMapCustomerCart(userCart)

			const { numOfBranches, numOfProducts } =
				CartService.getCartMetadata(userCart)

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successGetOne("Giỏ hàng hiện tại"),
				metadata: {
					customerId: req._id,
					numOfBranches,
					numOfProducts,
				},
				results: reMapCart,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async blockCustomer(req, res, next) {
		try {
			const { customerId } = req.params

			if (!(await CustomerService.checkValidCustomerId(customerId))) {
				return next({
					status: 400,
					message: MapResponseMessage.notFound("Khách hàng"),
				})
			}

			const { blockReason } = req.body

			await CustomerService.handleBlockCustomer(customerId, blockReason)

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.blockCustomer,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async unblockCustomer(req, res, next) {
		try {
			const { customerId } = req.params

			if (!(await CustomerService.checkValidCustomerId(customerId))) {
				return next({
					status: 400,
					message: MapResponseMessage.notFound("Khách hàng"),
				})
			}

			await CustomerService.handleUnblock(customerId)

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.unBlockCustomer,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getListVouchers(req, res, next) {
		try {
			const { customerId } = req.params

			const customerVouchers = await VoucherService.getListVouchersOfCustomer(
				customerId
			)

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successGetAllWithoutPagination("Mã giảm giá của khách hàng"),
				metadata: {
					customerId,
					numOfVouchers: customerVouchers.length,
				},
				results: customerVouchers,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getListFeedbacks(req, res, next) {
		try {
			const customerId = req?._id

			const {
				page,
				limit,
				noPagination,
				paginatedData,
				totalPages,
				totalRecords,
			} = await CakeService.getListFeedbacksOfCustomer(customerId, req.query)

			if (!noPagination) {
				if (page > totalPages) {
					return next({
						status: 400,
						message: MapResponseMessage.notExistPage(totalPages),
					})
				}
			}

			const results = paginatedData.map((cake) => ({
				cakeInfo: {
					cakeName: cake.cakeName,
					cakeThumbnail: cake.cakeThumbnail,
					cakeId: cake._id,
				},
				feedbacks: cake.rates,
			}))

			return res.status(200).json({
				status: "success",
				message:
					paginatedData.length > 0
						? noPagination
							? MapResponseMessage.successGetAllWithoutPagination("Lịch sử đánh giá của khách hàng")
							: MapResponseMessage.successGetAllWithPagination("Lịch sử đánh giá của khách hàng", page)
						: MapResponseMessage.successWithEmptyData("Lịch sử đánh giá của khách hàng"),
				metadata: {
					currentPage: noPagination ? 1 : page,
					limitPerPage: noPagination ? null : limit,
					totalPages: noPagination ? 1 : totalPages,
					totalRecords,
					countRecords: paginatedData.length,
				},
				results: results,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getMyInfo(req, res, next) {
		try {
			const customerInfo = await CustomerService.getCustomerInfoById(req._id)

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successGetOne("Tài khoản"),
				metadata: {
					customerId: req._id,
					userName: customerInfo.userName,
				},
				results: customerInfo,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getCustomerAddresses(req, res, next) {
		try {
			const customerAddresses = await AddressService.getCustomerAddresses(
				req._id
			)
			return res.json({
				status: 'success',
				message: MapResponseMessage.successGetAllWithoutPagination("Địa chỉ của bạn"),
				results: customerAddresses,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getAddressInfo(req, res, next) {
		try {
			const { addressId } = req.params

			const addressData = await AddressService.getAddressInfo(
				req._id,
				addressId
			)

			if (!addressData) {
				return next({
					status: 400,
					message: MapResponseMessage.notFound("Địa chỉ"),
				})
			}

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successGetOne("Địa chỉ"),
				results: addressData,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async createNewAddress(req, res, next) {
		try {
			const newAddress = await AddressService.createNewAddress(
				req._id,
				req.body
			)

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successCreate("Địa chỉ"),
				results: {
					newAddressId:
					newAddress.userAddresses[newAddress.userAddresses.length - 1]._id,
				},
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async deleteCustomerAddress(req, res, next) {
		try {
			const { addressId } = req.params

			await AddressService.deleteAddress(req._id, addressId)

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successDeleted("Địa chỉ"),
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async updateCustomerAddress(req, res, next) {
		try {
			const { addressId } = req.params

			await AddressService.updateAddress(req._id, addressId, req.body)

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successUpdate("Địa chỉ"),
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getMyOrders(req, res, next) {
		try {
			const {
				page,
				limit,
				noPagination,
				paginatedData,
				totalPages,
				totalRecords,
			} = await OrderService.getListOrderByCustomerId(
				req.params.customerId ? req.params.customerId : req._id,
				req.query
			)

			if (!noPagination) {
				if (page > totalPages) {
					return next({
						status: 400,
						message: MapResponseMessage.notExistPage(totalPages),
					})
				}
			}

			return res.status(200).json({
				status: "success",
				message:
					paginatedData.length > 0 ?
						noPagination
							? MapResponseMessage.successGetAllWithoutPagination("Đơn hàng của bạn")
							: MapResponseMessage.successGetAllWithPagination("Đơn hàng của bạn", page)
						: MapResponseMessage.successWithEmptyData("Đơn hàng của bạn"),
				metadata: {
					currentPage: noPagination ? 1 : page,
					limitPerPage: noPagination ? null : limit,
					totalPages: noPagination ? 1 : totalPages,
					totalRecords,
					countRecords: paginatedData.length,
					customerId: req._id,
					numOfOrders: paginatedData.length,
				},
				results: paginatedData,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getCustomerOrders(req, res, next) {
		try {
			const {
				page,
				limit,
				noPagination,
				paginatedData,
				totalPages,
				totalRecords,
			} = await OrderService.getListOrderByCustomerId(
				req.params.customerId,
				req.query
			)
			console.log(totalPages)
			if (!noPagination) {
				if (page > totalPages) {
					return next({
						status: 400,
						message: MapResponseMessage.notExistPage(totalPages),
					})
				}
			}

			return res.status(200).json({
				status: "success",
				message:
					paginatedData.length > 0 ?
						noPagination
							? MapResponseMessage.successGetAllWithoutPagination("Đơn hàng của khách hàng")
							: MapResponseMessage.successGetAllWithPagination("Đơn hàng của khách hàng", page)
						: MapResponseMessage.successWithEmptyData("Đơn hàng của khách hàng"),
				metadata: {
					currentPage: noPagination ? 1 : page,
					limitPerPage: noPagination ? null : limit,
					totalPages: noPagination ? 1 : totalPages,
					totalRecords,
					countRecords: paginatedData.length,
					customerId: req._id,
					numOfOrders: paginatedData.length,
				},
				results: paginatedData,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async updateCustomerInfo(req, res, next) {
		try {
			const updatedCustomer = await CustomerService.updateCustomerInfo(
				req._id,
				req.body
			)

			return res.status(200).json({
				status: 'success',
				message: MapResponseMessage.successUpdate("Thông tin của khách hàng"),
				results: updatedCustomer,
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}
}

module.exports = new CustomerController()
