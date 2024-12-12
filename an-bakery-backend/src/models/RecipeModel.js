const mongoose = require('mongoose')
const { Schema } = mongoose

const ingredientSchema = new Schema(
	{
		materialId: {
			type: Schema.ObjectId,
			ref: 'Material',
		},
		quantity: {
			type: Number,
			required: true,
		},
	},
	{
		_id: false,
	}
)
const instructionSchema = new Schema(
	{
		step: {
			type: Number,
			required: true,
		},
		value: {
			type: String,
			required: true,
		},
	},
	{ _id: false }
)
const recipeVariantItemSchema = new Schema({
	itemLabel: {
		type: String,
		trim: true,
		required: true,
	},
	materialId: {
		type: Schema.ObjectId,
		ref: 'Material',
	},
	quantity: {
		type: Number,
		required: true,
	},
})
const recipeVariantSchema = new Schema({
	variantLabel: {
		type: String,
		trim: true,
		required: true,
	},
	variantItems: {
		type: [recipeVariantItemSchema],
		required: true,
	},
})

const RecipeModel = new Schema(
	{
		recipeName: {
			type: String,
			unique: true,
			trim: true,
			required: [true, 'Recipe must have a name'],
		},
		recipeDescription: {
			type: String,
			trim: true,
			required: false,
		},
		recipeIngredients: {
			type: [ingredientSchema],
			required: true,
		},
		recipeInstructions: {
			type: [instructionSchema],
			required: true,
		},
		recipeVariants: {
			type: [recipeVariantSchema],
			required: false,
		},
		recipeServings: {
			type: Number,
			required: [true, 'Recipe must specify the number of servings'],
			min: 1,
		},
		cookTime: {
			type: Number,
			required: true,
			min: 0,
		},
		creatorId: {
			type: String,
			required: true,
		},
		isDeleted: { type: Boolean, default: false }
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Recipe', RecipeModel)
