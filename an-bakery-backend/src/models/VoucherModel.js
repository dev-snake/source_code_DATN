const mongoose = require("mongoose");

const Schema = mongoose.Schema;


const VoucherConfigSchema = new Schema({
	discountValue: { type: Number, required: true, min: 1 },
	maxValue: { type: Number, default: null },
	maxTotalUsage: { type: Number, min: 1, default: null },
	maxUserUsage: { type: Number, min: 1, default: null },
	validFrom: { type: Date, required: true },
	validTo: { type: Date, required: true },
	minimumOrderValues: { type: Number, default: null },
	type: { type: String, enum: ["fixed", "percentage", "shipFee"], default: "percentage" },
	isWhiteList: { type: Boolean, default: false }
});

const VoucherModel = new Schema({
	voucherCode: { type: String, required: true },
	voucherDescription: { type: String, default: "" },
	branchId: { type: Schema.ObjectId, ref: 'Branch', default: null },
	voucherConfig: { type: VoucherConfigSchema, required: true },
	usedCount: { type: Number, default: 0 },
	userUsed: { type: [String], default: [] },
	whiteListUsers: { type: [Schema.ObjectId], default: [], ref: "customers" },
	creatorId: { type: String, required: true },
	isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model("voucher", VoucherModel);
