
const  mongoose=require("mongoose")


const addressSchema=new mongoose.Schema({
userId:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User",
  required:true,
},
name:{
    type:String,
    required:true,
    trim:true,
},
phone:{
    type:String,
    required:true,
    match: /^[6-9]\d{9}$/,
},
houseName:{
    type:String,
    required:true,
    trim:true,
},
  locality: {
    type: String,
    required: true,
    trim: true,
  },
   city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
    country: {
    type: String,
    required: true,
    trim: true,
  },
   pincode: {
    type: String,
    required: true,
    match: /^[1-9][0-9]{5}$/, 
  },
    landmark: {
    type: String,
    trim: true,
  },
    addressType: {
    type: String,
    enum: ["Home", "Work", "Other"],
    default: "Home",
  },
    isDefault: {
    type: Boolean,
    default: false,
  },

}, { timestamps: true })

const Address=mongoose.model("Address",addressSchema)
module.exports=Address;
