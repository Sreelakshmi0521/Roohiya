const Product=require("../../models/productModel")
const productValidation=require("../../validations/productValidation")
const ProductVariant=require("../../models/productVariantModel")
const  productVariantValidation=require("../../validations/productVariantValidation")
const Category=require("../../models/categoryModel")
const cloudinary=require("../../config/cloudinary")
const { cleanupTempFiles } = require("../../utils/cleanUpTemp")
const{comprehensiveCleanup}=require("../../utils/cleanUpHelper")
const IMAGES_PER_VARIANT = 3


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
        perPage:limit,
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
        const categories = await Category.find({ isListed: true });
        res.render("admin/addProducts",{
            message:null,
            messageType:null,
            formData:null,
            categories,
              pageJs:"addProductsVar.js"

        })
    } catch (error) {
         console.error(error);
    res.status(500).send("Server error");
    }
}


const addProduct = async (req, res) => {
    const allFiles = req.files || [];
    const allTempFilePaths = allFiles.map(file => file.path);
    let uploadedImages = [];
    let savedVariantIds = [];

    try {
        const { name, category, description } = req.body;
        const highlightsArray = JSON.parse(req.body.highlights || "[]")
        const rawVariantDetails = req.body.variantDetails

        const parsedVariantDetails = (Array.isArray(rawVariantDetails)
            ? rawVariantDetails
            : rawVariantDetails ? [rawVariantDetails] : []
        ).map(jsonStr => JSON.parse(jsonStr))

        
        if (!name || !category || !description || parsedVariantDetails.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Missing products fields "
            });
        }
        if(allFiles.length===0){
              return res.status(400).json({
                success: false,
                message: "missing images"
            });

        }

        if (allFiles.length !== parsedVariantDetails.length * IMAGES_PER_VARIANT) {
            return res.status(400).json({
                success: false,
                message: `Each variant must have exactly ${IMAGES_PER_VARIANT} images.`
            });
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

        const { error: productError } = productValidation.validate(productData);
        if (productError) {
            return res.status(400).json({
                // success: false,
                message: productError.details[0].message,
                messageType:"warning"
            })
        }


        const existingProduct = await Product.findOne({name: name.trim(),category: category })
    
        if (existingProduct) {
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
            });
            uploadedImages.push({
                url: result.secure_url,
                public_id: result.public_id
            });
        }

        let fileIndex = 0;
        for (const details of parsedVariantDetails) {
            const imagesForVariant = uploadedImages.slice(fileIndex, fileIndex + IMAGES_PER_VARIANT);
            const imageUrls = imagesForVariant.map(img => img.url);

           
            const variantData = {
                color: details.color,
                stock: Number(details.stockLimit),
                price: Number(details.price),
                discountedPrice: details.discountedPrice ? Number(details.discountedPrice) : undefined,
                images: imageUrls
            };

            const { error: variantError } = productVariantValidation.validate(variantData);
            if (variantError) {
                await comprehensiveCleanup(allTempFilePaths, uploadedImages, savedVariantIds, ProductVariant)
                return res.status(400).json({
                    success: false,
                    message: variantError.details[0].message,
                    messageType:"warning"
    
                });
            }

            const newVariant = new ProductVariant(variantData);
            const savedVariant = await newVariant.save();
            savedVariantIds.push(savedVariant._id);
            fileIndex += IMAGES_PER_VARIANT;
        }

     
        const newProduct = new Product({
            name,
            category,
            description,
            highlights: highlightsArray,
            variants: savedVariantIds
        });

        const savedProduct = await newProduct.save();
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
           await comprehensiveCleanup(allTempFilePaths, uploadedImages, savedVariantIds, ProductVariant)

        return res.status(500).json({
            success: false,
            message: "Something went wrong while adding the product. Please try again."

        });
    }
}



module.exports={
    loadProduct,
    loadAddProduct,
    addProduct

}