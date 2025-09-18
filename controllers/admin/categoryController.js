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
        search
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
                message:"Category name id required",
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
        return res.render("admin/categories",{
            message:"something went wrong",
            messageType:"warning"
        })
        
    }
      

}



module.exports={
    loadCategory,
    loadAddCategory,
     addCategory
}