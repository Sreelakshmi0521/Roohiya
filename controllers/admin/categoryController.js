const Category=require("../../models/categoryModel")


const loadCategory=async(req,res)=>{
    try {
      
    let search=""
    if(req.query.search){
        search=req.query.search
    }

   let page=1
   if(req.query.page){
    page=parseInt(req.query.page)
   }
    let limit=3

    let categoryData={isDeleted:false}

    if(search){
        categoryData.name={$regex:search,$options:"i"}
    }

    let totalCategories=await Category.countDocuments(categoryData)
    let totalPages=Math.ceil(totalCategories/limit)
    let categories=await Category.find(categoryData)
    .sort({createdAt:-1})
    .skip((page-1)*limit)
    .limit(limit)
      

    res.render("admin/categories",{
        categories,
        totalCategories,
        currentPage:page,
        totalPages,
        search,
         pageJs:"categoryAction.js",
        message:null,
        messageType:null
    })

    } catch (error) {
        console.error(error)
        res.status(500).send("server error")
    }
}

const loadAddCategory=(req,res)=>{
    res.render("admin/addCategory",{
        message:null,
        messageType:null
    })
}
const addCategory=async(req,res)=>{
    try {
        const {name, description}=req.body


        if(!name||name.trim()===""){
            return res.render("admin/addCategory",{
                message:"Category name is required",
                messageType:"warning"
            })
        }
        
        const existingCate=await Category.findOne({name:name,isDeleted:false})
        if(existingCate){
            return res.render("admin/addCategory",{
                message:"category already existing",
                messageType:"warning"
            })
        }
        const newCategory=new Category({
            name:name.trim(),
            description:description ?description.trim():""

        })
        await newCategory.save()
        return res.redirect("/admin/categories")

    } catch (error) {
        console.error(error)
        return res.render("admin/addCategory",{
            message:"something went wrong",
            messageType:"warning"
        })
        
    }
      

}
 
const loadEditCategory=async(req,res)=>{
try {
    
    const category= await Category.findById(req.params.id)
    if(!category||category.isDeleted){
        return res.render("admin/categories",{
            categories:[],
            totalCategories:0,
            currentPage:1,
            totalPages:0,
            message:"category not found",
            messageType:"warning"
        })
    }

    res.render("admin/editCategory",{
        category,
        message:null,
        messageType:null
    })

} catch (error) {
    console.error(error)
    res.redirect("/admin/categories")
}
}
 const editCategory=async(req,res)=>{
    try {
        const {name,description,isListed}=req.body

    const category= await Category.findById(req.params.id)
     if(!category||category.isDeleted){
        return res.render("admin/categories",{
            message:"category not found",
            messageType:"warning"
        })
     }

     const existingCate=await Category.findOne({
        name:name,
        _id:{$ne:req.params.id},
        isDeleted:false
     })
      
     if(existingCate){
        return res.render("admin/editCategory",{
            message:"category already existing",
            messageType:"warning"
        })
     }
     category.name=name
     category.description=description
     category.isListed=isListed==="true"
      
     await category.save()
     console.log(category)

     res.redirect("/admin/categories")


    } catch (error) {
        console.error(error)
        return res.redirect("/admin/categories")
    }
 }

const softDelete=async(req,res)=>{
   try {
       await Category.findByIdAndUpdate(req.params.id,{isDeleted:true})
       res.json({success:true,message:"category deleted successfully"})
   } catch (error) {
    console.error(error)
    res.json({success:false,message:"something wrong"})
   }
}


module.exports={
    loadCategory,
    loadAddCategory,
     addCategory,
     loadEditCategory,
      editCategory,
      softDelete,
     
}