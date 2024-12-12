const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OTPModel = new Schema(
	{
		otpCode: { type: String, required: true },
		customerId: { type: String, required: true },
		expiredAt: { type: Date, required: true },
		isUsed: { type: Boolean, default: false },
		type: { type: String, enum: ["password", "recover", "auth"], required: true },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("otp", OTPModel);
