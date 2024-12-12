const mongoose = require('mongoose')
const { randomString } = require('@/utils/random-string')

const Schema = mongoose.Schema

const HistoryPointsSchema = new Schema(
	{
		amount: { type: Number, required: true },
		title: { type: String, required: true },
	},
	{
		timestamps: true,
	}
)

const VipPointSchema = new Schema(
	{
		currentPoint: { type: Number, default: 0 },
		historyPoints: { type: [HistoryPointsSchema], default: [] },
	},
	{
		_id: false,
	}
)

const SelectedVariantSchema = new Schema({
	variantKey: { type: String, required: true },
	itemKey: { type: String, required: true },
})

const CartItemSchema = new Schema({
	cakeId: { type: String, required: true },
	selectedVariants: { type: [SelectedVariantSchema], default: [] },
	quantity: { type: Number, default: 1 },
})

const UserCartSchema = new Schema({
	branchId: { type: String, required: true },
	cartItems: { type: [CartItemSchema], default: [] },
	branchVoucher: { type: String, default: null },
})

const UserAddressSchema = new Schema({
	fullName: { type: String, required: true },
	email: { type: String, required: true },
	phoneNumber: { type: String, required: true },
	fullAddress: { type: String, required: true },
	provinceId: { type: String, required: false },
	districtId: { type: String, required: false },
	wardId: { type: String, required: false },
})

const UserBlockedHistorySchema = new Schema({
	blockTime: { type: Date, default: new Date() },
	blockReason: { type: String, required: true },
})

const CustomerModel = new Schema(
	{
		userName: { type: String, default: randomString },
		email: { type: String, required: true },
		password: { type: String, default: null },
		isActive: { type: Boolean, default: true },
		vipPoints: {
			type: VipPointSchema,
			default: {
				currentPoint: 0,
				historyPoints: [],
			},
		},
		userCart: { type: [UserCartSchema], default: [] },
		userAddresses: { type: [UserAddressSchema] },
		blockHistory: { type: [UserBlockedHistorySchema] },
		refreshToken: { type: String, default: null },
		provider: {
			type: String,
			enum: ['credentials', 'google', "facebook"],
			default: 'credentials',
		},
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('customers', CustomerModel)
