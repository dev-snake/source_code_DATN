const AuthService = require("@/services/AuthService");
const CustomerService = require("@/services/CustomerService");

const EmailService = require("@/services/EmailService");
const OTPService = require("@/services/OTPService");

const { generateRefreshToken, generateCustomerAccessToken } = require("@/utils/jwt-token");
const { randomString } = require("@/utils/random-string");
const MapResponseMessage = require("@/utils/response-message/vi-VN");


class AuthController {
	constructor() {
		this.signUp = this.signUp.bind(this);
		this.signIn = this.signIn.bind(this);
		this.signOut = this.signOut.bind(this);
		this.refreshToken = this.refreshToken.bind(this);
		this.recoverAccount = this.recoverAccount.bind(this);
		this.requestRecoverAccount = this.requestRecoverAccount.bind(this);
	}

	async signIn(req, res, next) {
		try {
			const { email, password, provider } = req.body;

			if (!await CustomerService.checkExistEmail(email)) {
				if (provider === "credentials") {
					return next({
						status: 404,
						message: MapResponseMessage.notFoundEmail,
					});
				} else {
					await CustomerService.createNewAccount(req.body);

					const {
						password: serverPassword,
						provider: serverProvider,
						isActive,
						...customerInfo
					} = await CustomerService.getCustomerInfoByEmail(email);

					const { refreshToken, accessToken } = await CustomerService.generateToken(customerInfo);

					return res.status(200).json({
						status: "success",
						message: MapResponseMessage.successSignIn,
						results: {
							accessToken,
							refreshToken,
							customerInfo
						},
					});
				}
			}

			const {
				password: serverPassword,
				provider: serverProvider,
				isActive,
				...customerInfo
			} = await CustomerService.getCustomerInfoByEmail(email);

			if (!isActive) {
				return next({
					status: 403,
					message: MapResponseMessage.accountBlocked,
				});
			}

			if (!AuthService.compareProvider(provider, serverProvider)) {
				return next({
					status: 404,
					message: MapResponseMessage.wrongProvider,
				});
			}

			if (provider === "credentials") {
				if (!(await AuthService.comparePassword(password, serverPassword))) {
					return next({
						status: 404,
						message: MapResponseMessage.wrongPassword
					});
				}
			}

			const { refreshToken, accessToken } = await CustomerService.generateToken(customerInfo);

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successSignIn,
				results: {
					accessToken,
					refreshToken,
					customerInfo
				},
			});
		} catch (error) {
			return next({
				status: 500,
				error,
			});
		}
	}

	async signUp(req, res, next) {
		try {
			const { email } = req.body;


			if (await CustomerService.checkExistEmail(email)) {
				return next({
					status: 404,
					message: MapResponseMessage.emailUsed,
				});
			}


			await CustomerService.createNewAccount(req.body);
			const {
				password: serverPassword,
				provider: serverProvider,
				isActive,
				...customerInfo
			} = await CustomerService.getCustomerInfoByEmail(email);

			const { refreshToken, accessToken } = await CustomerService.generateToken(customerInfo);

			return res.status(201).json({
				status: "success",
				message: MapResponseMessage.successSignUp,
				results: {
					accessToken,
					refreshToken,
					customerInfo
				},
			});
		} catch (error) {
			return next({
				status: 500,
				error,
			});
		}
	}

	async signOut(req, res, next) {
		try {
			if (!(await CustomerService.checkIsLoggedIn(req._id))) {
				return next({
					status: 404,
					message: MapResponseMessage.notSignIn,
				});
			}

			await CustomerService.removeToken(req._id);

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successSignOut,
			});
		} catch (error) {
			return next({
				status: 500,
				error,
			});
		}
	}

	async refreshToken(req, res, next) {
		try {
			const customerInfo = await CustomerService.getCustomerInfoById(req._id);

			if (!AuthService.compareRefreshToken(req.refreshToken, customerInfo.refreshToken)) {
				return next({
					status: 400,
					message: MapResponseMessage.invalidRefreshToken,
				});
			}

			const newAccessToken = generateCustomerAccessToken(customerInfo);

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successGetNewAccessToken,
				results: newAccessToken,
			});
		} catch (error) {
			return next({
				status: 500,
				error,
			});
		}
	}

	async requestRecoverAccount(req, res, next) {
		try {
			const { email } = req.body;

			if (!await CustomerService.checkExistEmail(email)) {
				return next({
					status: 404,
					message: MapResponseMessage.notFoundEmail,
				});
			}

			const { _id } = await CustomerService.getCustomerInfoByEmail(email);

			await EmailService.sendMailRecoverAccount(_id, email);

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.sentRecoverCode,
			});
		} catch (error) {
			return next({
				status: 500,
				error,
			});
		}
	}

	async recoverAccount(req, res, next) {
		try {
			const { email, otpCode } = req.body;

			if (!await CustomerService.checkExistEmail(email)) {
				return next({
					status: 404,
					message: MapResponseMessage.notFoundEmail,
				});
			}

			const { _id: customerId } = await CustomerService.getCustomerInfoByEmail(email);

			if (!await OTPService.checkValidOTP(otpCode, customerId, "recover")) {
				return next({
					status: 404,
					message: MapResponseMessage.wrongOTP,
				});
			}

			const newPassword = await AuthService.generateNewPassword();

			await Promise.all([
				EmailService.sendNewPassword(email, newPassword),
				CustomerService.setNewPassword(customerId, newPassword),
				OTPService.setUsedOTP(otpCode, customerId),
			]);

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successRecoverAccount,
			});
		} catch (error) {
			return next({
				status: 500,
				error,
			});
		}
	}

}

module.exports = new AuthController();
