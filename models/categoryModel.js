const mongoose=require("mongoose")
const CategorySchema= new mongoose.Schema({

    name:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    
     description:{
        type:String
     },

    isListed:{
        type:Boolean,
        default:true
    },
    isDeleted:{
        type:Boolean,
        default:false

    }
},{timestamps:true})

const Category= mongoose.model("Category",CategorySchema)

module.exports=Category