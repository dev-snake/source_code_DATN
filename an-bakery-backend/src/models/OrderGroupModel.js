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
  },
  {
    _id: false,
  }
)
// [CHILD]
const customerInfoSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Customer infomation must be have fullname.'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Customer infomation must be have phone number.'],
      validate: {
        validator: (value) => {
          return /(84|0[3|5|7|8|9])+([0-9]{8})\b/g.test(value)
        },
        message: 'Phone number must be a valid phone in Vietnam',
      },
    },
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
    fullAddress: {
      type: String,
      required: [true, 'Address is required'],
    },
  },
  {
    _id: false,
  }
)
const orderDataSchema = new Schema(
  {
    branchId: {
      type: Schema.ObjectId,
      ref: 'Branch',
    },
    orderItems: {
      type: [orderItemSchema],
      required: true,
    },
    orderSummary: {
      type: orderSummarySchema,
    },
    orderNote: {
      type: String,
      default: null,
    },
    branchVoucher: {
      type: Schema.ObjectId,
      ref: 'voucher',
      default: null,
    },
    orderOptions: {
      deliveryTime: {
        type: Date,
        default: Date.now,
      },
      deliveryMethod: {
        type: String,
        enum: {
          values: ['toHouse', 'atStore'],
          message: 'Order delivery method is either: toHouse or atStore',
        },
        default: 'atStore',
      },
    },
    orderUrgent: {
      isUrgent: {
        type: Boolean,
        default: false,
      },
      orderExpectedTime: {
        type: String,
        required: false,
      },
    },
  },
  {
    _id: false,
  }
)
// [PARENT]
const orderGroupSchema = new Schema(
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
      default: 0,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    voucherCode: {
      type: mongoose.ObjectId,
      ref: 'voucher',
      default: null,
    },
    customerId: {
      type: Schema.ObjectId,
      ref: 'customers',
    },
    customerInfo: {
      type: customerInfoSchema,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: {
        values: ['pending', 'success', 'failed', 'cashOnDelivery'],
        message:
          'Payment status is either: pending, success, failed, cashOnDelivery',
      },
    },
    orderData: {
      type: [orderDataSchema],
      required: true,
    },
    orderType: {
      type: String,
      enum: {
        values: ['customerOrder', 'selfOrder'],
        message: 'Order type is either: customerOrder or selfOrder',
      },
      required: true,
    },
    orderApplyPoint: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'ordersGroup',
  }
)

module.exports = mongoose.model('OrdersGroup', orderGroupSchema)
