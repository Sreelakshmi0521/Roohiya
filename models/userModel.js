const mongoose=require("mongoose")

const addressSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    phone:{ 
        type: String,
         required: true 
   },
  street:{ 
      type: String,
      required: true
  }, 
 city:{ 
     type: String,
     required: true
},
state:{
  type: String,
   required: true
 },

country:{
   type: String, 
  required: true
},

  pincode:{ 
  type: String,
   required: true 
    
 },

  landmark:{ 
  type: String 
  },
  
  addressType: {
    type: String,
    enum: ["Home", "Work", "Other"],
    default: "Home",
  },  
})


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
  required:false
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
  addresses: [addressSchema],



},{timestamps:true})


userSchema.virtual("status").get(function(){
    return this.isBlocked ? "Blocked" : "Active"
})

userSchema.set("toJSON",{virtuals:true})
userSchema.set("toObject",{virtuals:true})



const User=mongoose.model("User",userSchema)
module.exports=User;
