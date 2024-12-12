const mongoose = require('mongoose')
const { Schema } = mongoose

// [CHILD]
const branchContactSchema = new Schema(
  {
    branchOwnerName: {
      type: String,
      required: [true, 'Branch contact must be have name.'],
    },
    branchPhoneNumber: {
      type: String,
      required: [true, 'Branch contact must be have phone number.'],
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
const branchConfigSchema = new Schema(
  {
    branchDisplayName: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'Branch must be have display name.'],
    },
    activeTime: {
      open: {
        type: String,
        required: [true, 'Branch must be have open time.'],
      },
      close: {
        type: String,
        required: [true, 'Branch must be have close time.'],
      },
    },
    branchType: {
      type: String,
      required: [true, 'Branch must be have one type.'],
      enum: {
        values: ['direct', 'online'],
        message: 'Branch type is either: direct or online',
      },
    },
    branchAddress: {
      type: String,
      required: [true, 'Branch must be have address.'],
    },
    branchContact: {
      type: branchContactSchema,
      required: true,
    },
    mapLink: {
      type: String,
      default: null,
    },
  },
  {
    _id: false,
  }
)
// [SUB-CHILD]
const branchInventoryMaterialsSchema = new Schema(
  {
    materialId: {
      type: Schema.ObjectId,
      ref: 'Material',
    },
    inventoryVolume: {
      type: Number,
      required: true,
    },
    historyChange: [
      {
        weightChange: {
          type: Number,
          required: true,
        },
        type: {
          type: String,
          enum: {
            values: ['forOrder', 'removeExpired', 'newImport'],
            message:
              'Material type is either: forOrder, removeExpired, newImport',
          },
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    _id: false,
  }
)
const branchInventoryCakesSchema = new Schema(
  {
    cakeId: {
      type: Schema.ObjectId,
      ref: 'cake',
    },
    inventoryVolume: {
      type: Number,
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
    historyChange: [
      {
        quantityChange: {
          type: Number,
          required: true,
        },
        type: {
          type: String,
          enum: {
            values: ['removeExpired', 'forTest', 'forOrder', 'newImport'],
            message:
              'Material type is either: newImport, removeExpired, forOrder, forTest',
          },
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    _id: false,
  }
)
// [CHILD]
const branchInventorySchema = new Schema(
  {
    materials: {
      type: [branchInventoryMaterialsSchema],
    },
    cakes: {
      type: [branchInventoryCakesSchema],
    },
  },
  {
    _id: false,
  }
)
// [PARENT]
const BranchModel = new Schema(
  {
    branchInventory: {
      type: branchInventorySchema,
      default: {
        materials: [],
        cakes: [],
      },
    },
    branchConfig: {
      type: branchConfigSchema,
    },
    businessProducts: [
      {
        type: Schema.ObjectId,
        ref: 'cake',
      },
    ],
    isActive: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Branch', BranchModel)
