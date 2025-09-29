const Category=require("../../models/categoryModel")
const {addCategoryValidation,editCategoryValidation}=require("../../validations/categoryValidation")

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

    let categoryData={}

    if(search){
        categoryData.name={$regex:search.trim(),$options:"i"}
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
        message:req.query.message ||null,
        messageType:req.query.messageType||null
    })

    } catch (error) {
        console.error(error)
        res.status(500).send("server error")
    }
}

const loadAddCategory=(req,res)=>{
    res.render("admin/addCategory",{
        message:null,
        messageType:null,
        formData:null

    })
}
const addCategory=async(req,res)=>{
    try {
        const{error,value}=addCategoryValidation.validate(req.body)
       
        if(error){
              return res.render("admin/addCategory",{
                message:error.details[0].message,
                messageType:"warning",
                formData:req.body,
              })
        }



       const name=value.name.trim().toLowerCase()
        description=value.description.trim()

        const existingCate=await Category.findOne({name})
        if(existingCate){
            return res.render("admin/addCategory",{
                message:"category already existing",
                messageType:"warning",
                formData:req.body
            })
        }
        const newCategory=new Category({
            name,description,isListed:value.isListed
        })
        await newCategory.save()
         res.redirect("/admin/categories?message=Category added Successfully&messageType=success")
     

    } catch (error) {
        console.error(error)
        return res.render("admin/addCategory",{
            message:"something went wrong",
            messageType:"warning",
            formData:req.body
        })
        
    }
      

}
 
const loadEditCategory=async(req,res)=>{
try {
    
    const category= await Category.findById(req.params.id)
    if(!category){
       return res.redirect("/admin/categories?message=Category not found&messageType=warning")
    }

    res.render("admin/editCategory",{
        category,
        message:null,
        messageType:null,
         formData: null
    })

} catch (error) {
    console.error(error)
    res.redirect("/admin/categories?message=Something went wrong&messageType=warning");
}
}

 const editCategory=async(req,res)=>{
    try {
       const {error,value}=editCategoryValidation.validate(req.body)

       if(error){
        return res.render("admin/editCategory",{
            category:{_id:req.params.id},
            formData:req.body,
            message:error.details[0].message,
            messageType:"warning"
        })
       }

    const category= await Category.findById(req.params.id)
     if(!category){
        return res.redirect("/admin/categories?message=Category not found&messageType=warning")
     }

     const existingCate=await Category.findOne({
        name:value.name.trim().toLowerCase(),
        _id:{$ne:req.params.id},
        
     })
      
     if(existingCate){
        return res.render("admin/editCategory",{
            category:{_id:req.params.id},
            formData:req.body,
            message:"category already existing",
            messageType:"warning"
        })
     }
     const name=value.name.trim().replace(/\s+/g, " ").toLowerCase()
     const description=value.description.trim().replace(/\s+/g, " ")
     
      

     category.name=name,
      category.description=description
      

     await category.save()
     console.log(category)
     res.redirect("/admin/categories?message=Category updated successfully&messageType=success")


    } catch (error) {
        console.error(error)
        return res.redirect("/admin/categories?message=Something went wrong&messageType=warning")
    }
 }
    const categoryStatus=async(req,res)=>{
            try {
                const category=await Category.findById(req.params.id)
                if(!category){
                    return res.status(404).json({success:false,message:"Category not found"})
                }
                category.isListed=!category.isListed
                await category.save()
                console.log(category)

                res.json({success:true,message:`Category ${category.isListed ? "listed" : "unlisted"} successfully`,isListed:category.isListed})
            
            } catch (error) {
                  console.error(error);
               res.status(500).json({ success: false, message: "Something went wrong" });
            }
    }


module.exports={
    loadCategory,
    loadAddCategory,
     addCategory,
     loadEditCategory,
      editCategory,
      categoryStatus
     
     
}