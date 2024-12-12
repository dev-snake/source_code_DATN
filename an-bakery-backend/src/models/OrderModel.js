const mongoose = require('mongoose')
const { Schema } = mongoose

// [CHILD]
const orderSummarySchema = new Schema(
  {
    subTotalPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    reducedFee: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
)
const orderItemSchema = new Schema(
  {
    cakeId: {
      type: Schema.ObjectId,
      ref: 'cake',
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
    quantity: {
      type: Number,
      required: true,
    },
    priceAtBuy: {
      type: Number,
      required: true,
    },
    isRated: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
)
// [PARENT]
const orderSchema = new Schema(
  {
    orderGroupId: {
      type: Schema.ObjectId,
      ref: 'OrdersGroup',
      required: false,
    },
    customerId: {
      type: Schema.ObjectId,
      ref: 'customers',
      required: false,
    },
    branchId: {
      type: Schema.ObjectId,
      ref: 'Branch',
    },
    staffHandlerId: {
      type: Schema.ObjectId,
      ref: 'staffs',
      required: false,
    },
    orderItems: {
      type: [orderItemSchema],
    },
    orderSummary: {
      type: orderSummarySchema,
    },
    voucherCode: {
      type: Schema.ObjectId,
      ref: 'voucher',
      default: null,
    },
    explainReason: {
      type: String,
      default: null,
    },
    orderStatus: {
      type: String,
      enum: {
        values: [
          'pending',
          'queue',
          'processing',
          'ready',
          'shipping',
          'rejected',
          'completed',
          'cancelled',
          'returned',
        ],
        message:
          'Order type is either: pending, queue, processing, ready, shipping, rejected, completed, cancelled, returned',
      },
      default: 'pending',
    },
    orderType: {
      type: String,
      required: true,
    },
    orderNote: {
      type: String,
      default: null,
    },
    orderPoint: {
      type: Number,
      default: 0,
    },
    orderOptions: {
      deliveryTime: {
        type: Date,
      },
      deliveryMethod: {
        type: String,
        required: true,
      },
    },
    orderUrgent: {
      isUrgent: {
        type: Boolean,
        required: false,
      },
      orderExpectedTime: {
        type: String,
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema)
