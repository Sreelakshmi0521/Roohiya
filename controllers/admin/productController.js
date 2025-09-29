const Product=require("../../models/productModel")
const productValidation=require("../../validations/productValidation")


const loadProduct=async(req,res)=>{
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
    
      let productData={}

     if(search){
       productData.name={$regex:search.trim(),$options:"i"}
    }
    let totalProducts=await Product.countDocuments(productData)
    let totalPages=Math.ceil(totalProducts/limit)

    let products=await Product.find(productData)
    .sort({createdAt:-1})
    .skip((page-1)*limit)
    .limit(limit)
    .populate('category', 'name');
      

     res.render("admin/products",{
         products,
        totalProducts,
        currentPage:page,
        totalPages,
        search,
        // pageJs:"categoryAction.js",
        message:req.query.message ||null,
        messageType:req.query.messageType||null
    })

    } catch (error) {
        console.error(error)
        res.status(500).send("server error")
    }
} 

module.exports={
    loadProduct
}