
const mongoose=require("mongoose")


const productVariantSchema=new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required: false
    },
    color:{
    type:String,
     required: true,
      trim: true,
      lowercase: true 
    },
    stock:{
      type: Number,
      required: true,
      min:0,
      default:0
    },
    images:{
        type:[String],
        validate:{
            validator:(arr)=>arr.length===3,
            message:"3 images required"
        }
    },
     price: {
      type: Number,
      required: true,
      min: 0
    },
    discountedPrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (p) {
          return p <= this.price
        },
        message: "Discounted price must be less than or equal to the price"
      }
    },
    isListed: {
      type: Boolean,
      default: true
    },

}, { timestamps: true })


const  ProductVariant=mongoose.model("ProductVariant",productVariantSchema)
module.exports = ProductVariant