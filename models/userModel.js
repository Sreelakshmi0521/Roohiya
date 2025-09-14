const mongoose=require("mongoose")
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:String,
        required:false,
        unique:true,
        sparse:true,
        default:null

    },
    password:{
        type:String,
        required:false
    },
      googleId:{
        type:String,
        unique:true,
        sparse:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    isDeleted:{
       type:Boolean,
        default:false
    },
      isVerified: { 
        type: Boolean,
        default: false
    }

},{timestamps:true})



const User=mongoose.model("User",userSchema)
module.exports=User;
