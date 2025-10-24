const Product=require("../../models/productModel")
const {addProductValidation,updateProductValidation}=require("../../validations/productValidation")
const ProductVariant=require("../../models/productVariantModel")
const  {addVariantValidation, editVariantValidation}=require("../../validations/productVariantValidation")
const Category=require("../../models/categoryModel")
const cloudinary=require("../../config/cloudinary")
const { cleanupTempFiles } = require("../../utils/cleanUpTemp")
const{comprehensiveCleanup}=require("../../utils/cleanUpHelper")



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
    .populate('category', 'name')
    .populate("variants")

products.forEach(product => {
  if (product.variants?.length > 0 && product.variants[0].images?.length > 0) {
    product.previewImage = product.variants[0].images[0]
  }
})

    for(let product of products){
        if(product.variants &&product.variants.length>0){
            let totalStock=0
            for(let variant of product.variants){
                totalStock+=Number(variant.stock)||0
            }
            product.totalStock=totalStock
        }else{
            product.totalStock=0
        }
    }
      

     res.render("admin/products",{
         products,
        totalProducts,
        currentPage:page,
        totalPages,
        search,
        perPage:limit,
        pageJs:"variantStatus.js",
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
        const categories = await Category.find({ isListed: true })
        res.render("admin/addProducts",{
            message:null,
            messageType:null,
            formData:null,
            categories,
              pageJs:"addProductsVar.js"

        })
    } catch (error) {
         console.error(error)
    res.status(500).send("Server error")
    }
}


const addProduct = async (req, res) => {
    const allFiles = req.files || []
    const allTempFilePaths = allFiles.map(file => file.path)
    let uploadedImages = []
    let savedVariantIds = []

    try {
        const { name, category, description } = req.body
        const highlightsArray = JSON.parse(req.body.highlights || "[]")
        const rawVariantDetails = req.body.variantDetails

        const parsedVariantDetails = (Array.isArray(rawVariantDetails)
            ? rawVariantDetails
            : rawVariantDetails ? [rawVariantDetails] : []
        ).map(jsonStr => JSON.parse(jsonStr))

        
        if (!name || !category || !description || parsedVariantDetails.length === 0) {
            await cleanupTempFiles(allTempFilePaths)
            return res.status(400).json({
                success: false,
                message: "Missing products fields "
            })
        }
        if(allFiles.length===0){
             await cleanupTempFiles(allTempFilePaths)
              return res.status(400).json({
                success: false,
                message: "missing images"
            })

        }

        if (allFiles.length !== parsedVariantDetails.length * 3) {
            await cleanupTempFiles(allTempFilePaths)
            return res.status(400).json({
                success: false,
                message: "Each variant must have exactly 3 images."
            })
        }

    
        const productData = {
            name,
            category,
            description,
            highlights: highlightsArray,
            variants: parsedVariantDetails.map(v => ({
                color: v.color,
                stock: Number(v.stockLimit),
                price: Number(v.price),
                discountedPrice: v.discountedPrice !== "" ? Number(v.discountedPrice) : undefined
            }))
        }

        const { error: productError } = addProductValidation.validate(productData)
        if (productError) {
            await cleanupTempFiles(allTempFilePaths)
            return res.status(400).json({
                // success: false,
                message: productError.details[0].message,
                messageType:"warning"
            })
        }


        const existingProduct = await Product.findOne({name: name.trim(),category: category })
    
        if (existingProduct) {
        await cleanupTempFiles(allTempFilePaths)
        return res.status(400).json({
            success: false,
            message: "A product with the same name already exists in this category.",
            messageType:"warning"
        })
    }

       
        for (const file of allFiles) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "products",
                resource_type: "auto"
            })
            uploadedImages.push({
                url: result.secure_url,
                public_id: result.public_id
            })
        }

        let fileIndex = 0
        for (const details of parsedVariantDetails) {
            const imagesForVariant = uploadedImages.slice(fileIndex, fileIndex + 3)
            const imageUrls = imagesForVariant.map(img => img.url)

           
            const variantData = {
                color: details.color,
                stock: Number(details.stockLimit),
                price: Number(details.price),
                discountedPrice: details.discountedPrice ? Number(details.discountedPrice) : undefined,
                images: imageUrls
            }

            const { error: variantError } =addVariantValidation.validate(variantData)
            if (variantError) {
                await comprehensiveCleanup(allTempFilePaths, uploadedImages, savedVariantIds, ProductVariant)
                return res.status(400).json({
                    success: false,
                    message: variantError.details[0].message,
                    messageType:"warning"
    
                })
            }

            const newVariant = new ProductVariant(variantData)
            const savedVariant = await newVariant.save()
            savedVariantIds.push(savedVariant._id)
            fileIndex +=3
        }

     
        const newProduct = new Product({
            name,
            category,
            description,
            highlights: highlightsArray,
            variants: savedVariantIds
        })

        const savedProduct = await newProduct.save()
        await ProductVariant.updateMany(
            { _id: { $in: savedVariantIds } },
            { $set: { product: savedProduct._id } }
        )

        await cleanupTempFiles(allTempFilePaths)

        return res.json({
            success: true,
            message: "Product added successfully!",
            productId: savedProduct._id
        })

    } catch (error) {
        console.error("Error in addProduct:", error)
           await comprehensiveCleanup(allTempFilePaths, uploadedImages, savedVariantIds, ProductVariant)

        return res.status(500).json({
            success: false,
            message: "Something went wrong while adding the product. Please try again."

        })
    }
}


const loadProductVariants= async(req,res)=>{
    try {
        const productId=req.params.id
        const product=await Product.findOne({_id:productId,isListed:true}).populate("category")
        
        if(!product){
        return res.redirect("/admin/products?message=Product not found&messageType=warning")
        }

        const variants=await ProductVariant.find({product:productId}).sort({createdAt:-1})
        res.render("admin/productvariants",{
            product,
            variants,
            pageJs:"variantStatus.js",
            message:req.query.message||null,
            messageType:req.query.messageType||null

        })
   
   
   
    } catch (error) {
        console.error(error)
        res.redirect("/admin/products?message=Server error&messageType=error")
        
    }
}
const loadAddVariant = async (req, res) => {
    try {
        const productId = req.params.id
        const product = await Product.findById(productId)
        
        if (!product) {
            return res.redirect('/admin/products?message=Product not found&messageType=warning')
        }
        
        res.render('admin/addVariant', { 
            product, 
            productId: product._id,
            pageJs:"addVariant.js",
            message:req.query.message|| null, 
            messageType: req.query.messageType||null ,
             previousData: null
        })
    } catch (error) {
        console.error( error)
        res.redirect('/admin/products?message=Error loading page&messageType=error')
    }
}


const addVariant=async(req,res)=>{
      const productId=req.params.id
      const files=req.files||[]
      const tempFilePaths=files.map(f=>f.path)

      try {
        const {color,price,discountedPrice,stock}=req.body
     if (!color || !price || !stock) {
            await cleanupTempFiles(tempFilePaths)
            return res.render('admin/addVariant', {
                productId,
                product: await Product.findById(productId),
                message: 'Please fill all required fields',
                messageType: 'warning',
                previousData: { color, price, discountedPrice, stock }
            })
        }
     if (files.length !==3) {
            await cleanupTempFiles(tempFilePaths)
            return res.render('admin/addVariant', {
                productId,
                product: await Product.findById(productId),
                message: "Please upload exactly 3 images",
                messageType: 'warning',
                previousData: { color, price, discountedPrice, stock }
            })
        }

     const existVariant=await ProductVariant.findOne({product:productId,color:color.trim().toLowerCase()})
      if (existVariant) {
            await cleanupTempFiles(tempFilePaths)
            return res.render('admin/addVariant', {
                productId,
                product: await Product.findById(productId),
                message: 'Variant with this color already exists',
                messageType: 'warning',
                previousData: { color, price, discountedPrice, stock }
            })
        }
      
     const uploadedImages=[]
     for(const file of files){
        const result=await cloudinary.uploader.upload(file.path,{
             folder: "products",
              resource_type: "auto",
        })
        uploadedImages.push(result.secure_url)
     }


     const variantData={
        product:productId,
        color:color.trim().toLowerCase(),
        price:Number(price),
        discountedPrice:discountedPrice ? Number(discountedPrice):undefined,
        stock:Number(stock),
        images:uploadedImages,
        isListed:true
     }
    //  console.log("images:", uploadedImages)

     const {error:variantError}=addVariantValidation.validate(variantData)

      if (variantError) {
            await cleanupTempFiles(tempFilePaths)
            return res.render('admin/addVariant', {
                productId,
                product: await Product.findById(productId),
                message: variantError.details[0].message,
                messageType: 'warning',
                previousData: { color, price, discountedPrice, stock }
            })
        }
     const newVariant=new ProductVariant(variantData)
     const savedVariant=await newVariant.save()
     console.log(savedVariant)

     await Product.findByIdAndUpdate(productId,{
        $push:{variants:savedVariant._id}
     })

     await cleanupTempFiles(tempFilePaths)
     res.redirect(`/admin/products/variants/${productId}?message=Variant added successfully&messageType=success`)


      } catch (error) {
        console.error(error)
        await cleanupTempFiles(tempFilePaths)
        
       res.render("admin/addVariant", {
      productId,
      product: await Product.findById(productId),
      message: "Error adding variant",
      messageType: "error",
      previousData: req.body,
      })
      }
}

const loadEditVariant=async(req,res)=>{
    try {
        
        const variantId=req.params.id
        const variant=await ProductVariant.findById(variantId)

        if(!variant){
         return res.redirect('/admin/products?message=Variant not found&messageType=warning')

        }

        res.render("admin/editVariant",{
            variant,
             productId: variant.product,
            message:req.query.message||null,
            messageType:req.query.messageType ||null
        })
    
    } catch (error) {
        console.error(error)
    res.redirect('/admin/products?message=Server error&messageType=warning')
 
    }
}

const updateVariant=async(req,res)=>{
    const variantId=req.params.id
    const files=req.files||[]
    const tempFilePaths = files.map(f => f.path)

console.log("jhhjhjhj")

    try {
        
    const variant=await ProductVariant.findById(variantId)
    if(!variant){
     return res.redirect('/admin/products?message=Variant not found&messageType=warning')

    }

    const {color,price,discountedPrice,stock}=req.body
     if (!color || !price || !stock) {
         return res.redirect(`/admin/products/variants/edit/${variantId}?message=Missing product variant fields&messageType=warning`)
        }
       
        let imagesToSave = variant.images
      if(files.length>0){
        if(files.length!==3){
            await cleanupTempFiles(tempFilePaths)
         return res.redirect(`/admin/products/variants/edit/${variantId}?message=Please upload exactly 3 images&messageType=warning`)

        }
      
        
      if(variant.images && variant.images.length>0){
        for(const url of variant.images){
            const publicId=url.split("/").slice(-2).join("/").split(".")[0]
        try {
            await cloudinary.uploader.destroy(publicId)
        } catch (error) {
            console.log(error)
        }
      }
    }

    const uploadedImages=[]
    for(const file of files){
        const result=await cloudinary.uploader.upload(file.path,{
             folder: 'products',
            resource_type: 'auto'
        })
         uploadedImages.push(result.secure_url)

    }
     imagesToSave=uploadedImages
    await cleanupTempFiles(tempFilePaths)
}
         const variantData = {
     
            color: color.trim().toLowerCase(),
            price: Number(price),
            discountedPrice: discountedPrice ? Number(discountedPrice) : undefined,
            stock: Number(stock),
            images: imagesToSave
        }

        const { error: variantError } = editVariantValidation.validate(variantData)
        if (variantError) {
            return res.redirect(`/admin/products/variants/edit/${variantId}?message=${encodeURIComponent(variantError.details[0].message)}&messageType=warning`)
        }
      variant.set(variantData)
      await variant.save()
  console.log("updated varaint:",variant)

res.redirect(`/admin/products/variants/${variant.product}?message=Variant updated successfully&messageType=success`)

    } catch (error) {
        console.log(error)
        await cleanupTempFiles(tempFilePaths)
        res.redirect(`/admin/products/variants/edit/${variantId}?message=Server error&messageType=error`)


    }
}


const toggleVariantStatus=async(req,res)=>{
    try {
        const variantId=req.params.id
        const variant=await ProductVariant.findById(variantId)
        if(!variant){
            return res.status(404).json({success:false,message:"variant not found"})
        }
          variant.isListed=!variant.isListed
          await variant.save()
            res.json({success:true,message:`Variant ${variant.isListed ? 'listed' : 'unlisted'} successfully`})

    } catch (error) {
        console.error(error)
      return  res.status(500).json({success:false,message:"server error"})
    }
}


const loadEditProduct=async(req,res)=>{
    try {
        
   const productId=req.params.id

   const product=await Product.findById(productId).populate("category").populate("variants")
   if(!product){
    return res.redirect("/admin/products?message=Product not found&messageType=warning")
   }
     const categories = await Category.find({ isListed: true })

     res.render("admin/editProduct",{
        product,
        categories,
        message:req.query.message||null,
        messageType:req.query.messageType||null
     })

    } catch (error) {
        console.error(error)
        res.redirect("/admin/products?message=Server error&messageType=error")

    }
}

const updateProduct=async(req,res)=>{
    try {
         const productId=req.params.id
    const highlightsArray=JSON.parse(req.body.highlights||"[]")

     const productData={
        name:req.body.name,
        category:req.body.category,
        description:req.body.description,
        highlights:highlightsArray,
        
     }

     const {error:productError}=updateProductValidation.validate(productData)
     if(productError){
         return res.redirect(`/admin/products/edit/${productId}?message=${encodeURIComponent(productError.details[0].message)}&messageType=warning`)
     }
     
     const product=await Product.findById(productId)
     if(!product){
    return res.redirect(`/admin/products?message=Product not found&messageType=warning`)
     }

    const existingProduct = await Product.findOne({_id: { $ne: productId },name: req.body.name.trim(),category: req.body.category })
   
    if (existingProduct) {
      return res.redirect(`/admin/products/edit/${productId}?message=Product name already exists in this category&messageType=warning`)
    }

    product.name=req.body.name.trim()
    product.category=req.body.category
    product.description=req.body.description
    product.highlights=highlightsArray

    await product.save()
     res.redirect(`/admin/products?message=Product updated successfully&messageType=success`)


    } catch (error) {
            console.error(error)
    }
    
}

const toggleProductStatus=async(req,res)=>{
    try {
        const productId=req.params.id
         const product=await Product.findById(productId)

         if(!product){
            return res.status(404).json({ success: false, message: "Product not found" })
         }
         product.isListed=!product.isListed
         await product.save()
          res.json({ success: true, message: `Product ${product.isListed ? "listed" : "unlisted"} successfully`, isListed: product.isListed })
// console.log("Button clicked:", id, type, currentStatus)

    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: "Server error" })

    }
}

module.exports={
    loadProduct,
    loadAddProduct,
    addProduct,
    loadProductVariants,
    loadAddVariant,
    addVariant,
    loadEditVariant,
    updateVariant,
     toggleVariantStatus,
     loadEditProduct,
     updateProduct,
     toggleProductStatus

}