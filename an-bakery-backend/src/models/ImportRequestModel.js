const mongoose = require('mongoose')
const { Schema } = mongoose

// [CHILD]
const requestItemsSchema = new Schema(
  {
    materialId: {
      type: Schema.ObjectId,
      ref: 'Material',
    },
    packageType: {
      type: Schema.ObjectId,
      ref: 'Supplier',
    },
    importPrice: {
      type: Number,
      required: true,
    },
    importQuantity: {
      type: Number,
      required: [true, 'Import request must be have quantity'],
      validate: {
        validator: function (value) {
          return value > 0
        },
        message: 'The quantity must be greater than zero',
      },
    },
    importStatus: {
      type: Boolean,
      default: false,
    },
    isSingle: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
)
// [PARENT]
const ImportRequestModel = new Schema(
  {
    supplierId: {
      type: Schema.ObjectId,
      ref: 'Supplier',
    },
    branchId: {
      type: Schema.ObjectId,
      ref: 'Branch',
    },
    importDate: {
      type: Date,
      default: Date.now,
    },
    requestItems: {
      type: [requestItemsSchema],
      validate: {
        validator: (value) => {
          return Array.isArray(value) && value.length > 0
        },
        message: 'Request items must have at least one item.',
      },
    },
    requestItemsSnapshot: {
      type: [requestItemsSchema],
      required: false,
      default: [],
    },
    requestStatus: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'waiting', 'completed'],
        message:
          'Request status is either pending, confirmed, waiting, completed',
      },
      default: 'pending',
    },
    requestTotalPrice: {
      type: Number,
      required: [true, 'Request total price must be calculate first.'],
    },
    isCancelled: {
      type: Boolean,
      default: false,
      select: false,
    },
    cancelledReason: {
      type: String,
      default: null,
    },
    creatorId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Import', ImportRequestModel)
