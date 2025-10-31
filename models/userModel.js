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
    isGoogleUser: {
    type: Boolean,
    default: false
  },
  profileImage: {
  type: String,
    default: "https://res.cloudinary.com/dqcd6e4ux/image/upload/v1761935135/free-user-icon-3296-thumb_rsdnow.png"
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
    },
    pendingEmail:{
        type:String,
         default: null
    },
      emailOtp:{ 
        type: String,
         default: null
     },
    emailOtpExpires:{ 
        type: Date, 
        default: null 
    },

    resetPasswordOtp:{ 
        type: String, 
        default: null 
    },
  resetPasswordOtpExpires:{
    type: Date, 
    default: null
 },




},{timestamps:true})


userSchema.virtual("status").get(function(){
    return this.isBlocked ? "Blocked" : "Active"
})

userSchema.set("toJSON",{virtuals:true})
userSchema.set("toObject",{virtuals:true})



const User=mongoose.model("User",userSchema)
module.exports=User;
