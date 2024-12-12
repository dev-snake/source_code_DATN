const OTPModel = require("@/models/OTPModel");

class OTPService {
	constructor() {
	}

	async checkValidOTP(otpCode, customerId, type) {
		try {
			const otpData = await OTPModel.findOne({
				otpCode,
				customerId,
				type,
			});
			console.log("🚀 ~ OTPService ~ checkValidOTP ~ otpData:", otpData);

			if (!otpData || otpData.isUsed) {
				return false;
			}

			const currentTime = new Date();
			console.log(otpData, currentTime < otpData.expiredAt);
			return currentTime < otpData.expiredAt;
		} catch (err) {
			throw new Error("Invalid OTP");
		}
	}

	async createNewOTP(customerId, type) {
		function generateCode() {
			return (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000).toString().padStart(6, "0");
		}

		const expiredAt = new Date(Date.now() + 10 * 60 * 1000);

		const otpCode = generateCode();

		await new OTPModel({
			otpCode,
			customerId,
			expiredAt,
			type,
		}).save();

		return otpCode;
	}

	async setUsedOTP(otpCode, customerId) {
		try {
			return OTPModel.findOneAndUpdate(
				{
					otpCode,
					customerId,
				},
				{
					isUsed: true,
				}
			);
		} catch (err) {
			throw new Error("Invalid OTP");
		}
	}
}

module.exports = new OTPService();
