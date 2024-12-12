const mongoose = require('mongoose')

const Schema = mongoose.Schema

const CakeVariantItemSchema = new Schema({
	itemLabel: { type: String, required: true },
	itemPrice: { type: Number, required: true },
	itemRecipe: { type: Schema.ObjectId, ref: 'Recipe', required: true },
})

const CakeVariantSchema = new Schema({
	variantLabel: { type: String, required: true },
	variantItems: { type: [CakeVariantItemSchema], required: true },
})

const CakePropertySchema = new Schema({
	propertyKey: { type: String, required: true },
	propertyValue: { type: String, required: true },
})

const CakeRateSchema = new Schema(
	{
		customerId: { type: String, required: true },
		rateContent: { type: String, default: '' },
		rateStars: { type: Number, min: 1, max: 5, required: true },
		isHide: { type: Boolean, default: false },
		isDeleted: { type: Boolean, default: false },
	},
	{
		timestamps: true,
	}
)

const CakeModel = new Schema(
	{
		cakeName: { type: String, required: true },
		cakeCategory: { type: String, required: false },
		cakeDescription: { type: String, required: true },
		cakeThumbnail: { type: String, required: true },
		cakeMedias: { type: [String], required: true },
		cakeDefaultPrice: { type: Number, min: 0, required: true },
		cakeVariants: { type: [CakeVariantSchema], required: false },
		cakeProperties: { type: [CakePropertySchema], default: [] },
		cakeRecipe: { type: Schema.ObjectId, ref: 'Recipe', required: true },
		discountPercents: { type: Number, default: 0 },
		views: { type: Number, default: 0 },
		soldCount: { type: Number, default: 0 },
		rates: { type: [CakeRateSchema], default: [] },
		isHide: { type: Boolean, default: true },
		creatorId: { type: String, required: true },
		isDeleted: { type: Boolean, default: false },
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('cake', CakeModel)
