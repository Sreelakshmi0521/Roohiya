const { required } = require("joi")
const mongoose=require("mongoose")
const CategorySchema= new mongoose.Schema({

    name:{
        type:String,
        required:true,
        unique:true,
        trim:true,
       lowercase: true
    },
    
     description:{
        type:String,
        required:true,
        maxlength:100,
        trim:true,
     },

    isListed:{
        type:Boolean,
        default:true
    }

},{timestamps:true})

const Category= mongoose.model("Category",CategorySchema)

module.exports=Category