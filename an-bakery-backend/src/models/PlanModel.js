const mongoose = require('mongoose')
const { Schema } = mongoose

const planMaterialSchema = new Schema(
  {
    materialId: {
      type: Schema.ObjectId,
      ref: 'Material',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
)

const planProductionSchema = new Schema(
  {
    cakeId: {
      type: Schema.ObjectId,
      ref: 'cake',
      required: true,
    },
    selectedVariants: [
      {
        variantKey: {
          type: Schema.ObjectId,
          ref: 'cake',
        },
        itemKey: {
          type: Schema.ObjectId,
          ref: 'cake',
        },
      },
    ],
    orderCount: {
      type: Number,
      required: true,
      min: 1,
    },
    orderAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    currentInventory: {
      type: Number,
      required: true,
      min: 0,
    },
    plannedProduction: {
      type: Number,
      required: true,
      min: 0,
    },
    totalMaterials: {
      type: [planMaterialSchema],
    },
  },
  {
    _id: false,
  }
)

const planSchema = new Schema(
  {
    branchId: {
      type: Schema.ObjectId,
      ref: 'Branch',
      required: true,
    },
    orderId: [
      {
        type: Schema.ObjectId,
        ref: 'Order',
      },
    ],
    planName: { type: String, required: true },
    planDescription: { type: String, required: false },
    planType: {
      type: String,
      enum: {
        values: ['day', 'week', 'month'],
        message: 'Plan type is either day, week or month',
      },
      required: true,
    },
    planStatus: {
      type: String,
      enum: ['open', 'closed', 'pending', 'in_progress', 'completed'],
      default: 'open',
    },
    planActivated: {
      startDate: { type: Date, required: true, default: Date.now },
      endDate: { type: Date, required: true, default: Date.now },
    },
    planDetails: {
      type: [planProductionSchema],
      required: false,
    },
    creatorId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Plan', planSchema)
