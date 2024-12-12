const StaffModel = require("@/models/StaffModel");
const { generateRefreshToken, generateStaffAccessToken } = require("@/utils/jwt-token");

const StaffService = require("@/services/StaffService");
const AuthService = require("@/services/AuthService");
const MapResponseMessage = require("@/utils/response-message/vi-VN");

class StaffAuthController {
	constructor() {
		this.createNewStaff = this.createNewStaff.bind(this);
		this.signIn = this.signIn.bind(this);
		this.signOut = this.signOut.bind(this);
		this.refreshToken = this.refreshToken.bind(this);
	}

	async createNewStaff(req, res, next) {
		try {
			const { staffCode, role: createdRole } = req.body;

			if (await StaffService.checkExistStaffCode(staffCode)) {
				return next({
					status: 404,
					message: MapResponseMessage.exists("Mã nhân viên")
				})
			}

			if (createdRole > req.role) {
				return next({
					status: 403,
					message: MapResponseMessage.requireHigherPermission
				})
			}

			if (staffCode.length > 12) {
				return next({
					status: 404,
					message: MapResponseMessage.requireMinLength("staffCode", 12)
				})
			}

			if (!staffCode.toUpperCase().startsWith("ANB-")) {
				return next({
					status: 404,
					message: MapResponseMessage.requireStartWith("staffCode", "ANB-")
				})
			}

			const { _id } = await StaffService.createNewStaff(req.body);

			return res.status(201).json({
				status: "success",
				message: MapResponseMessage.successCreate("Nhân viên mới"),
				results: {
					newStaffId: _id,
				}
			});

		} catch (error) {
			return next({
				status: 500,
				error
			});
		}
	}

	async signIn(req, res, next) {
		try {
			const { staffCode, password } = req.body;

			if (!await StaffService.checkExistStaffCode(staffCode)) {
				return next({
					status: 400,
					message: MapResponseMessage.notFound("Mã nhân viên")
				});
			}

			const {
				password: serverPassword,
				isActive,
				...staffInfo
			} = await StaffService.getStaffInfoByStaffCode(staffCode)

			if (!await AuthService.comparePassword(password, serverPassword)) {
				return next({
					status: 400,
					message: MapResponseMessage.wrongPassword
				});
			}
			;

			if (!isActive) {
				return next({
					status: 403,
					message: MapResponseMessage.accountBlocked,
				})
			}

			const { accessToken, refreshToken } = await StaffService.generateToken(staffInfo);

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successSignIn,
				results: {
					accessToken,
					refreshToken,
					staffInfo,
				}
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
			if (!await StaffService.checkIsLoggedIn(req._id)) {
				return next({
					status: 400,
					message: MapResponseMessage.notSignIn
				});
			}

			await StaffService.removeToken(req._id);

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successSignOut
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

			const staffData = await StaffService.getStaffInfoById(req._id);

			if (!AuthService.compareRefreshToken(req.refreshToken, staffData.refreshToken)) {
				return next({
					status: 400,
					message: MapResponseMessage.invalidRefreshToken
				});
			}

			const newAccessToken = generateStaffAccessToken(staffData);

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successGetNewAccessToken,
				results: newAccessToken
			});

		} catch (error) {
			return next({
				status: 500,
				error
			});
		}
	}
}

module.exports = new StaffAuthController();