const mongoose = require('mongoose')
const { Schema } = mongoose

const MaterialModel = new Schema(
	{
		materialName: {
			type: String,
			unique: true,
			trim: true,
			required: [true, 'Material must have a name'],
		},
		materialType: {
			type: String,
			required: [true, 'Material must have a type'],
			enum: {
				values: ['accessory', 'baking-ingredient'],
				message: 'Material type is either: accessory, baking-ingredient',
			},
		},
		calUnit: {
			type: String,
			required: [true, 'Material must have a calculate unit'],
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

module.exports = mongoose.model('Material', MaterialModel)
