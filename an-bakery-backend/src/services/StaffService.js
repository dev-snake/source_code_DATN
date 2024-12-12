const StaffModel = require("@/models/StaffModel");

const AuthService = require("@/services/AuthService");

const pagination = require("@/utils/pagination");
const { generateRefreshToken, generateCustomerAccessToken, generateStaffAccessToken } = require("@/utils/jwt-token");
const CustomerModel = require("@/models/CustomerModel");
const BranchModel = require("@/models/BranchModel");

class StaffService {

	constructor() {
		this.checkIsLoggedIn = this.checkIsLoggedIn.bind(this);
	}

	async getAllStaffWithPagination(queryParams) {
		return pagination(StaffModel, queryParams, null, {
			populate: ["branchRef"]
		});
	}

	async getStaffInfoById(staffId, populate = []) {
		return StaffModel.findById(staffId).populate(populate).lean();
	}

	async getStaffInfoByStaffCode(staffCode) {
		return StaffModel.findOne({
			staffCode: staffCode.toUpperCase(),
		}).lean();
	}


	async checkExistStaffCode(staffCode) {
		return !!await StaffModel.findOne({ staffCode: staffCode.toUpperCase() });
	}

	async generateToken(staffInfo) {
		const accessToken = generateStaffAccessToken(staffInfo);
		const refreshToken = generateRefreshToken(staffInfo);

		await StaffModel.findOneAndUpdate({
			staffCode: staffInfo.staffCode.toUpperCase()
		}, {
			refreshToken
		});

		return { refreshToken, accessToken };
	}

	async checkIsLoggedIn(staffId) {
		const staffInfo = await this.getStaffInfoById(staffId);

		return !!staffInfo?.refreshToken;
	}

	async removeToken(staffId) {
		return StaffModel.findByIdAndUpdate(staffId, {
			refreshToken: null,
		});
	}

	async createNewStaff(staffData) {
		const { staffCode, password, staffName, branchRef, role } = staffData;

		const hashedPassword = await AuthService.generateHashedPassword(password);

		return await StaffModel.create({
			staffCode: staffCode.toUpperCase(),
			password: hashedPassword,
			staffName,
			branchRef: branchRef ?? null,
			role
		});
	}

	async jobQuit(staffId) {
		return StaffModel.findByIdAndUpdate(staffId, {
			isActive: false,
			"workTime.outDate": Date.now()
		})
	}

	async changeRole(staffId, newRole) {
		return StaffModel.findByIdAndUpdate(staffId, {
			role: newRole
		}, { new: true });
	}

	async activeAccount(staffId) {
		return StaffModel.findByIdAndUpdate(staffId, {
			isActive: true,
			"workTime.outDate": null,
		}, { new: true });
	}

	async changeBranch(staffId, branchRef) {
		return StaffModel.findByIdAndUpdate(staffId, {
			branchRef: branchRef !== "" ? branchRef : null
		}, { new: true });
	}

	async getStaffOfBranch(branchId) {
		return await pagination(StaffModel, { branchRef: branchId }, null, {
			populate: ["branchRef"],
			lean: true,
		})
	}
}

module.exports = new StaffService();