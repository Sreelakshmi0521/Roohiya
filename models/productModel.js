
const mongoose=require("mongoose")
const ProductSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase: true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true,
    },
      description:{
        type:String,
        required:true,
        maxlength:1000,
        trim:true,
     },
     highlights:{
        type:String,
        maxlength:100,
        trim: true
     },
    variants:[{ 
        type: mongoose.Schema.Types.ObjectId,
         ref: "ProductVariant" ,
        
       
    }],
         isListed:{
        type:Boolean,
        default:true
    }

},{timestamps:true})



const Product=mongoose.model("Product",ProductSchema)

module.exports=Product