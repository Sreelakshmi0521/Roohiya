const Product=require("../../models/productModel")
const productValidation=require("../../validations/productValidation")
const ProductVariant=require("../../models/productVariantModel")
const  productVariantValidation=require("../../validations/productVariantValidation")


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


const loadAddProduct=async(req,res)=>{
    try {
        
        res.render("admin/addProducts",{
            message:null,
            messageType:null,
            formData:null
        })
    } catch (error) {
         console.error(error);
    res.status(500).send("Server error");
    }
}
const addProduct=async(req,res)=>{
    try {
        const{error:productError,value:productValue}=productValidation.validate(req.body)
        if(productError){
            return res.render("admin/addProducts",{
                message:productError.details[0].message,
                messageType:"warning",
                formData:req.body
            })
        }

        const product=new Product({
            name:req.body.name,
            category:req.body.category,
            description:req.body.description,
            highlights:req.body.highlights,
            isListed:req.body.isListed|| true
        })
        
        await product.save()
        console.log(product)


    if (!req.files || req.files.length < 3) {
      await Product.findByIdAndDelete(product._id)
      return res.render("admin/addProducts", {
        message: "Please upload at least 3 images ",
        messageType: "warning",
        formData: req.body,
      });
    }
        const images = req.files.map((f) => f.path || f.filename || f.secure_url);

        const{ error:variantError,value:productVariantValue}=productVariantValidation.validate({
            productId:product._id,
            color:req.body.color,
            stock:req.body.stock,
            price:req.body.price,
            discountedPrice:req.body.discountedPrice,
            images
        })
         if(variantError){
            await Product.findByIdAndDelete(product._id)

            return res.render("admin/addProducts",{
                message:variantError.details[0].message,
                messageType:"warning",
                formData:req.body
            })
         }

         const productVariant= new ProductVariant({
            productId:product._id,
            color:req.body.color,
            stock:req.body.stock,
            price:req.body.price,
            discountedPrice:req.body.discountedPrice,
            images
         })
         console.log(req.files)
         await  productVariant.save()
         console.log( productVariant)

         res.redirect("/admin/products?message=Product added successfully&messageType=success");


    } catch (error) {
        console.error(error);
   res.send(error.message)
    }
}



module.exports={
    loadProduct,
    loadAddProduct,
     addProduct

}