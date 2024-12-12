const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategoryModel = new Schema({
	categoryName: { type: String, required: true },
	categoryDescription: { type: String, default: "" },
	categoryKey: { type: String, required: true },
	isActive: { type: Boolean, default: true },
	isDeleted: { type: Boolean, default: false },
	creatorId: { type: String, required: true }
}, {
	timestamps: true
});
module.exports = mongoose.model("categories", CategoryModel);