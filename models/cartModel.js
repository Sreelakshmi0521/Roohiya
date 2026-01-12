
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productVariantId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductVariant",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
            validate: {
                validator: function (value) {
                return value <= 10
                },
           message: "You can't add more than 10 items of this product"
       }
        },
        priceAtTime: {
          type: Number,
          required: true,
        },
        discountedPriceAtTime: {
          type: Number,
        },
      },
    ],
    coupon: {  // New field for storing applied coupon details (temporary until order placement)
      code: {
        type: String,
      },
      couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
      },
      discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
      },
      discountValue: {
        type: Number,
      },
      discountAmount: {
        type: Number,
      },
    },
    discount: {  // Total discount from coupon
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {  // Computed total after discounts (update on apply/remove)
      type: Number,
      default: 0,
      min: 0,
    },

  },{ timestamps: true })


const Cart =mongoose.model("Cart",cartSchema)
module.exports=Cart

