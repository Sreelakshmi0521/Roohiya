const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      default: () => "ORD-" + nanoid(10)
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variantId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductVariant",
          required: true,
        },
        name: String,
        color: String,
        price: Number,
        quantity: Number,
        subtotal: Number,
        status: {
      type: String,
      enum: [
        "placed",
        "shipped",
        "out for delivery",
        "delivered",
        "cancelled",
        "returned"
      ],
      default: "placed",
    },
     confirmedAt: {
      type: Date,
      default: null
    },
    shippedAt: {
      type: Date,
      default: null
    },
    outForDeliveryAt: {
      type: Date,
      default: null
    },
    deliveredAt: {
      type: Date,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    trackingNumber: {
      type: String,
      default: ""
    },
    trackingUrl: {
      type: String,
      default: ""
    },

        cancelReason: {
          type: String,
          default: "",
           trim: true,
        },
        returnReason: {
          type: String,
          default: "",
           trim: true,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    shippingAddress: {
      name: String,
      phone: String,
      houseName: String,
      locality: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "shipped",
        "out for delivery",
        "delivered",
        "cancelled",
        "returned",
          "partially cancelled", 
        "partially returned" 
      ],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE", "WALLET"],
      required: true,
    },

    expectedDelivery: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },

    invoiceUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Order= mongoose.model("Order",orderSchema)

module.exports=Order
