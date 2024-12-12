const mongoose = require('mongoose')
const { Schema } = mongoose

// [CHILD]
const supplierContactSchema = new Schema(
	{
		email: {
			type: String,
			trim: true,
			required: [true, 'Email is required'],
			validate: {
				validator: (value) => {
					return /^[\w.%+-]+@gmail\.com$/.test(value)
				},
				message:
					'Email must be a valid Gmail address (e.g., example@gmail.com)',
			},
		},
		phone: {
			type: String,
			trim: true,
			required: [true, 'Phone number is required'],
			validate: {
				validator: (value) => {
					return /(84|0[3|5|7|8|9])+([0-9]{8})\b/g.test(value)
				},
				message: 'Phone number must be a valid phone in Vietnam',
			},
		},
		address: {
			type: String,
			unique: true,
			required: [true, 'Address is required'],
		},
	},
	{
		_id: false,
	}
)
// [CHILD]
const supplierContactPersonSchema = new Schema(
	{
		name: {
			type: String,
			trim: true,
			required: [true, 'Contact person must have a name'],
		},
		email: {
			type: String,
			trim: true,
			required: [true, "Contact person's email is required"],
			validate: {
				validator: (value) => {
					return /^[\w.%+-]+@gmail\.com$/.test(value)
				},
				message:
					'Email must be a valid Gmail address (e.g., example@gmail.com)',
			},
		},
		phone: {
			type: String,
			trim: true,
			required: [true, "Contact person's phone number is required"],
			validate: {
				validator: (value) => {
					return /(84|0[3|5|7|8|9])+([0-9]{8})\b/g.test(value)
				},
				message: 'Phone number must be a valid phone in Vietnam',
			},
		},
	},
	{
		_id: false,
	}
)
// [CHILD]
const materialSpecsSchema = new Schema({
	baseUnit: {
		type: String,
		required: true,
	},
	pricePerUnit: {
		type: Number,
		required: true,
	},
	packsPerUnit: {
		type: Number,
		required: true,
	},
	quantityPerPack: {
		type: Number,
		required: true,
	},
})
// [CHILD]
const supplierItemSchema = new Schema(
	{
		materialId: {
			type: Schema.ObjectId,
			ref: 'Material',
		},
		materialSpecs: {
			type: materialSpecsSchema,
			required: true,
		},
	},
	{
		_id: false,
	}
)
// [PARENT]
const SupplierModel = new Schema(
	{
		supplierName: {
			type: String,
			trim: true,
			required: [true, 'Supplier must have a name'],
			unique: true,
		},
		supplierContact: {
			type: supplierContactSchema,
			required: true,
		},
		supplierContactPerson: {
			type: supplierContactPersonSchema,
			required: [true, 'Contact person is required'],
		},
		supplierPriority: {
			type: Number,
			required: [true, 'Supplier must have a priority'],
			enum: {
				values: [1, 2, 3],
				message: 'Supplier priority is either: 1, 2, 3',
			},
		},
		supplyItems: {
			type: [supplierItemSchema],
			required: [true, 'Supply items are required'],
			validate: {
				validator: (value) => {
					return Array.isArray(value) && value.length > 0
				},
				message: 'Supply items must have at least one item.',
			},
		},
		supplierDescription: {
			type: String,
			required: false,
		},
		creatorId: {
			type: String,
			required: true,
		},
		branchId: {
			type: [Schema.ObjectId],
			ref: 'Branch',
		},
		isDeleted: { type: Boolean, default: false }
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Supplier', SupplierModel)
