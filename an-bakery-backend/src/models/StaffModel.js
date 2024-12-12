const mongoose = require('mongoose')

const Schema = mongoose.Schema

const WorkTimeSchema = new Schema({
	joinDate: { type: Date, default: Date.now() },
	outDate: { type: Date, default: null },
})

const StaffModel = new Schema(
	{
		staffCode: { type: String, required: true, maxLength: 12 },
		password: { type: String, required: true },
		staffName: { type: String, required: true },
		workTime: {
			type: WorkTimeSchema,
			default: {
				joinDate: Date.now(),
			},
		},
		branchRef: { type: Schema.ObjectId, ref: "Branch", default: null },
		role: { type: Number, enum: [0, 1, 2], required: true },
		isActive: { type: Boolean, default: true },
		refreshToken: { type: String, default: null },
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('staffs', StaffModel)
