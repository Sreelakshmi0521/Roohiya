const Product=require("../../models/productModel")
const productValidation=require("../../validations/productValidation")
const ProductVariant=require("../../models/productVariantModel")
const  productVariantValidation=require("../../validations/productVariantValidation")
const Category=require("../../models/categoryModel")
const cloudinary=require("../../config/cloudinary")
const { cleanupTempFiles } = require("../../utils/cleanUpTemp")
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
        perpage:limit,
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
    console.log("--- START: Add Product Controller ---");
    
    const allTempFilePaths = (req.files || []).map(file => file.path);
    const allFiles = req.files; 
    let uploadedImages = [];
    let savedVariantIds = [];

    try {
        // Data Parsing
        const rawVariantDetails = req.body.variantDetails; 
        const productName = req.body.name;
        const categoryId = req.body.category;
        const description = req.body.description;
        const highlightsString = JSON.parse(req.body.highlights || '[]').join(', '); 
        
        const parsedVariantDetails = (Array.isArray(rawVariantDetails) 
            ? rawVariantDetails 
            : (rawVariantDetails ? [rawVariantDetails] : [])
        ).map(jsonStr => JSON.parse(jsonStr));

        // Validation Check
        if (!productName || !categoryId || !description || parsedVariantDetails.length === 0 || allFiles.length === 0) {
            throw new Error("Missing critical product fields or no variants/files added.");
        }
        if (allFiles.length !== parsedVariantDetails.length * 3) {
            throw new Error("Mismatched files and variants. Ensure every variant has exactly 3 images.");
        }
        
        console.log("✅ Validation successful. Proceeding to Cloudinary upload...");

        // Manual Cloudinary Upload
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
        const filesPerVariant = 3; 
        for (const details of parsedVariantDetails) {
            
            const imagesForVariant = uploadedImages.slice(fileIndex, fileIndex + filesPerVariant); 
            const imageUrls = imagesForVariant.map(img => img.url);
            const priceNum = parseFloat(details.price);
            const discountNum = details.discountPrice ? parseFloat(details.discountPrice) : null;            
            if (discountNum !== null && discountNum > priceNum) {
                throw new Error(`Discounted price (${discountNum}) cannot be greater than price (${priceNum}).`);
            }

            const newVariant = new ProductVariant({
                color: details.color,
                stock: details.stockLimit,
                price: priceNum,
                discountedPrice: discountNum,
                images: imageUrls,
            });
            
            const savedVariant = await newVariant.save();
            savedVariantIds.push(savedVariant._id); 
            
            fileIndex += filesPerVariant; 
        }

        console.log(`📦 Created ${savedVariantIds.length} ProductVariant records.`);

        // Create Main Product
        const newProduct = new Product({
            
            name: productName,
            category: categoryId,
            description: description,
            highlights: highlightsString,
            variants: savedVariantIds 
        });
        
        const savedProduct = await newProduct.save();

        // Final Update: Link Variants to Parent Product
        await ProductVariant.updateMany(
            { _id: { $in: savedVariantIds } },
            { $set: { product: savedProduct._id } }
        );
        
        // Cleanup and Response
        await cleanupTempFiles(allTempFilePaths); 
        
        return res.send({ 
            success: true, 
            message: "Product and variants added successfully!", 
            productId: savedProduct._id
        });

    } catch (error) {
        console.error( error.message);
        
        await cleanupTempFiles(allTempFilePaths); 
        
        if (savedVariantIds.length > 0) {
            await ProductVariant.deleteMany({ _id: { $in: savedVariantIds } });
        }
        
        return res.status(500).send({ 
            success: false, 
            message: `Failed to add product: ${error.message}` 
        });
    }
};







module.exports={
    loadProduct,
    loadAddProduct,
    addProduct

}