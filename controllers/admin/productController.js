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
    let limit=4
    
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
const loadAddProduct = async (req, res) => {
    try {
        const categories = await Category.find({ isListed: true }).sort({ name: 1 });

        res.render("admin/addProducts", {
            pageJs: "addProductsVar.js",    
            categories,
            message: null,
            messageType: null
        });

    } catch (error) {
        console.error("Error loading add product page:", error);
        res.redirect("/admin/products?message=Server error loading page&messageType=error");
    }
};
const addProduct = async (req, res) => {
    const allFiles = req.files || [];
    const allTempFilePaths = allFiles.map(file => file.path);
    let uploadedImages = [];
    let savedVariantIds = [];

    try {
        const { name, category, description } = req.body;

        // === FIX: Handle highlights[] correctly (now an array) ===
        let highlightsArray = [];
        if (req.body.highlights) {
            highlightsArray = Array.isArray(req.body.highlights)
                ? req.body.highlights.map(h => h.trim()).filter(h => h !== "")
                : req.body.highlights.trim() !== "" ? [req.body.highlights.trim()] : [];
        }

        // Parse variantDetails (hidden inputs with JSON strings)
        const rawVariantDetails = req.body.variantDetails || [];
        const parsedVariantDetails = Array.isArray(rawVariantDetails)
            ? rawVariantDetails.map(str => JSON.parse(str))
            : rawVariantDetails ? [JSON.parse(rawVariantDetails)] : [];

        // Basic checks
        if (!name?.trim() || !category || !description?.trim() || parsedVariantDetails.length === 0) {
            await cleanupTempFiles(allTempFilePaths);
            return res.status(400).json({
                success: false,
                message: "All required fields and at least one variant are needed."
            });
        }

        if (allFiles.length === 0 || allFiles.length !== parsedVariantDetails.length * 3) {
            await cleanupTempFiles(allTempFilePaths);
            return res.status(400).json({
                success: false,
                message: "Each variant must have exactly 3 images."
            });
        }

        // Product validation
        const productData = {
            name: name.trim(),
            category,
            description: description.trim(),
            highlights: highlightsArray,
            variants: parsedVariantDetails.map(v => ({
                color: v.color?.trim()?.toLowerCase(),
                price: Number(v.price),
                discountedPrice: v.discountedPrice ? Number(v.discountedPrice) : undefined,
                stock: Number(v.stockLimit)
            }))
        };

        const { error: productError } = addProductValidation.validate(productData, { abortEarly: false });
        if (productError) {
            await cleanupTempFiles(allTempFilePaths);
            return res.status(400).json({
                success: false,
                message: productError.details[0].message
            });
        }

        // Check duplicate product name in category
        const existingProduct = await Product.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
            category
        });

        if (existingProduct) {
            await cleanupTempFiles(allTempFilePaths);
            return res.status(400).json({
                success: false,
                message: "A product with this name already exists in this category."
            });
        }

        // Upload images
        for (const file of allFiles) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "products",
                resource_type: "image"
            });
            uploadedImages.push({
                url: result.secure_url,
                public_id: result.public_id
            });
        }

        // Process variants
        let fileIndex = 0;
        for (const details of parsedVariantDetails) {
            const variantImages = uploadedImages.slice(fileIndex, fileIndex + 3).map(img => img.url);

            const variantData = {
                color: details.color.trim().toLowerCase(),
                price: Number(details.price),
                discountedPrice: details.discountedPrice ? Number(details.discountedPrice) : undefined,
                stock: Number(details.stockLimit),
                images: variantImages
            };

            const { error: variantError } = addVariantValidation.validate(variantData);
            if (variantError) {
                await comprehensiveCleanup(allTempFilePaths, uploadedImages, savedVariantIds, ProductVariant);
                return res.status(400).json({
                    success: false,
                    message: variantError.details[0].message
                });
            }

            const newVariant = new ProductVariant(variantData);
            const savedVariant = await newVariant.save();
            savedVariantIds.push(savedVariant._id);

            fileIndex += 3;
        }

        // Create product
        const newProduct = new Product({
            name: name.trim(),
            category,
            description: description.trim(),
            highlights: highlightsArray,
            variants: savedVariantIds
        });

        const savedProduct = await newProduct.save();
        console.log("saved pr:",savedProduct)

        // Link product to variants
        await ProductVariant.updateMany(
            { _id: { $in: savedVariantIds } },
            { $set: { product: savedProduct._id } }
        );

        await cleanupTempFiles(allTempFilePaths);

        return res.json({
            success: true,
            message: "Product added successfully!",
            productId: savedProduct._id
        });

    } catch (error) {
        console.error("Error in addProduct:", error);
        await comprehensiveCleanup(allTempFilePaths, uploadedImages, savedVariantIds, ProductVariant);
        return res.status(500).json({
            success: false,
            message: "Server error. Please try again."
        });
    }
};


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
        const productId = req.params.productId;
        const product = await Product.findById(productId);

        if (!product) {
            return res.redirect('/admin/products?message=Product not found&messageType=warning');
        }

        res.render('admin/addVariant', { 
            product, 
            productId: product._id,
            pageJs: "addVariant.js",
            message: req.query.message || null, 
            messageType: req.query.messageType || null,
            previousData: req.session.previousVariantData || null
        });

        delete req.session.previousVariantData;

    } catch (error) {
        console.error(error);
        res.redirect('/admin/products?message=Error loading page&messageType=error');
    }
};

const addVariant = async (req, res) => {
    const productId = req.params.productId;
    const files = req.files || [];
    const tempFilePaths = files.map(f => f.path);
    let uploadedImages = [];


    try {
        const product = await Product.findById(productId);
        if (!product) {

            await cleanupTempFiles(tempFilePaths);
            return res.redirect(`/admin/products/variants/${productId}/add?message=Product not found&messageType=warning`);
        }

        const { color, price, discountedPrice, stock } = req.body;

        if (!color || !price || !stock || files.length !== 3) {
            req.session.previousVariantData = req.body;
            await cleanupTempFiles(tempFilePaths);
            return res.redirect(`/admin/products/variants/${productId}/add?message=Please fill all required fields and upload exactly 3 images&messageType=warning`);
        }

        const existVariant = await ProductVariant.findOne({
            product: productId,
            color: color.trim().toLowerCase()
        });

        if (existVariant) {
            req.session.previousVariantData = req.body;
            await cleanupTempFiles(tempFilePaths);
            return res.redirect(`/admin/products/variants/${productId}/add?message=A variant with this color already exists&messageType=warning`);
        }

        // Upload images
        for (const file of files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "products",
                resource_type: "image"
            });
            uploadedImages.push({
                url: result.secure_url,
                public_id: result.public_id
            });
        }

        const imageUrls = uploadedImages.map(img => img.url);

        const variantData = {
            product: productId,
            color: color.trim().toLowerCase(),
            price: Number(price),
            discountedPrice: discountedPrice ? Number(discountedPrice) : undefined,
            stock: Number(stock),
            images: imageUrls,
            isListed: true
        };

        const { error } = addVariantValidation.validate(variantData);
        if (error) {

            for (const img of uploadedImages) {
                await cloudinary.uploader.destroy(img.public_id).catch(() => {});
            }
            req.session.previousVariantData = req.body;
            await cleanupTempFiles(tempFilePaths);
            return res.redirect(`/admin/products/variants/${productId}/add?message=${encodeURIComponent(error.details[0].message)}&messageType=warning`);
        }

        const newVariant = new ProductVariant(variantData);
        const savedVariant = await newVariant.save();

        await Product.findByIdAndUpdate(productId, {
            $push: { variants: savedVariant._id }
        });

console.log("saved variant:",savedVariant)

        await cleanupTempFiles(tempFilePaths);

        return res.redirect(`/admin/products/variants/${productId}?message=Variant added successfully&messageType=success`);

    } catch (error) {
        console.error("Error adding variant:", error);

        if (uploadedImages.length > 0) {
            for (const img of uploadedImages) {
                await cloudinary.uploader.destroy(img.public_id).catch(() => {});
            }
        }
        await cleanupTempFiles(tempFilePaths);

        return res.redirect(`/admin/products/variants/${productId}/add?message=Server error while adding variant&messageType=error`);
    }
};

const loadEditVariant = async (req, res) => {
    try {
        const variantId = req.params.id;
        const variant = await ProductVariant.findById(variantId).populate('product');

        if (!variant) {
            return res.redirect('/admin/products?message=Variant not found&messageType=warning');
        }

        res.render("admin/editVariant", {
            variant,
            productId: variant.product._id,
            pageJs: "editVariant.js",      
            pageCss: "editVariant.css",   
            message: req.query.message || null,
            messageType: req.query.messageType || null
        });

    } catch (error) {
        console.error("Error loading edit variant:", error);
        res.redirect('/admin/products?message=Server error&messageType=error');
    }
};

const updateVariant = async (req, res) => {
    const variantId = req.params.id;
    const files = req.files || {}; 
    const tempFilePaths = Object.values(files).flat().map(f => f.path);
    let newImageUrls = {};

    try {
        const variant = await ProductVariant.findById(variantId);
        if (!variant) {
            await cleanupTempFiles(tempFilePaths);
            return res.redirect('/admin/products?message=Variant not found&messageType=warning');
        }

        const { color, price, discountedPrice, stock } = req.body;

        if (!color || !price || !stock) {
            await cleanupTempFiles(tempFilePaths);
            return res.redirect(`/admin/products/variants/edit/${variantId}?message=Missing required fields&messageType=warning`);
        }

        const existingVariant = await ProductVariant.findOne({
            product: variant.product,
            color: color.trim().toLowerCase(),
            _id: { $ne: variantId }
        });

        if (existingVariant) {
            await cleanupTempFiles(tempFilePaths);
            return res.redirect(`/admin/products/variants/edit/${variantId}?message=A variant with this color already exists&messageType=warning`);
        }

        let imagesToSave = [...variant.images];

        if (Object.keys(files).length > 0) {
            for (const fieldName in files) {
                const file = files[fieldName][0];
                const index = parseInt(fieldName.match(/\[(\d+)\]/)[1]);

                if (variant.images[index]) {
                    const oldPublicId = variant.images[index].split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(oldPublicId).catch(() => {});
                }

                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "products",
                    resource_type: "image"
                });
                newImageUrls[index] = result.secure_url;
            }

            Object.entries(newImageUrls).forEach(([index, url]) => {
                imagesToSave[index] = url;
            });
        }

        await cleanupTempFiles(tempFilePaths);

        const variantData = {
            color: color.trim().toLowerCase(),
            price: Number(price),
            discountedPrice: discountedPrice ? Number(discountedPrice) : null,
            stock: Number(stock),
            images: imagesToSave
        };

        const { error } = editVariantValidation.validate(variantData);
        if (error) {
            return res.redirect(`/admin/products/variants/edit/${variantId}?message=${encodeURIComponent(error.details[0].message)}&messageType=warning`);
        }

        variant.set(variantData);
        await variant.save();
        console.log("updated variant:",variant)

        return res.redirect(`/admin/products/variants/${variant.product}?message=Variant updated successfully&messageType=success`);

    } catch (error) {
        console.error("Error updating variant:", error);
        await cleanupTempFiles(tempFilePaths);
        return res.redirect(`/admin/products/variants/edit/${variantId}?message=Server error&messageType=error`);
    }
};



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
 let highlightsArray = [];
    if (req.body.highlights && typeof req.body.highlights === "string") {
      highlightsArray = req.body.highlights
        .split(",")
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
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