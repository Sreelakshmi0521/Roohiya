const Product=require("../../models/productModel")
const ProductVariant=require("../../models/productVariantModel")
const Category=require("../../models/categoryModel")
const Review = require("../../models/reviewModel")



const loadShop=async(req,res)=>{
    try {
        // console.log("hai")
        const search =req.query.search ? req.query.search.trim():""
        const category=req.query.category||""
        const minPrice=req.query.minPrice?parseInt(req.query.minPrice):null
        const maxPrice=req.query.maxPrice?parseInt(req.query.maxPrice):null
        const sort =req.query.sort||"latest"
        const page=parseInt(req.query.page)||1
        const limit=8
        const skip=(page-1)*limit


        const prdFilter={isListed:true}

        if(search){
           prdFilter.name={$regex:search,$options:"i"}
        }
        const categories = await Category.find({ isListed: true }).lean()

         let currentCate = null
        let cateName = ""

        if(category){
             if (category.match(/^[0-9a-fA-F]{24}$/)) {
             currentCate = categories.find(cat => cat._id.toString() === category)
        } else {
               
               currentCate = categories.find(cat => 
                    cat.name.toLowerCase().includes(category.toLowerCase())
                )
            }

              if(currentCate){
                prdFilter.category = currentCate._id
               cateName = currentCate.name
            }
          
        }
      

        let products=await Product.find(prdFilter).lean()

        products=await Promise.all(
            products.map(async(product)=>{
                const variants=await ProductVariant.find({product:product._id,isListed:true}).lean()
           

            const filterVari=variants.filter(variant=>{
                const displayPrice=variant.discountedPrice||variant.price
                if(minPrice!==null &&displayPrice<minPrice)return false
                if(maxPrice!==null && displayPrice>maxPrice)return false
               
                return true
            })
            return {...product,variants:filterVari}
             })
        )

        products =products.filter(p=>p.variants.length>0)
       const getDisplayPrice = (product) => {
            if(!product.variants || product.variants.length===0) return Infinity
            const variant = product.variants[0]
            return variant.discountedPrice || variant.price
        }


        switch(sort){
            case "price_asc": products.sort((a,b)=>getDisplayPrice(a) - getDisplayPrice(b))
            break

            case "price_desc":products.sort((a,b)=>getDisplayPrice(b) - getDisplayPrice(a))
            break

            case "a-z":products.sort((a,b)=>a.name.localeCompare(b.name))
            break

            case "z-a":products.sort((a,b)=>b.name.localeCompare(a.name))
            break

            default: products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        }


         
        const totalProducts=products.length
        const totalPages=Math.ceil(totalProducts/limit)
        const paginationProducts=products.slice(skip,skip+limit)
      

        res.render("user/shop",{
            user:req.session.user||null,
            products:paginationProducts,
            categories,
            currentPage:page,
            totalPages,
            search,
           category: currentCate ? currentCate._id.toString() : "",
           categoryName:  cateName,
           minPrice: minPrice||"",
           maxPrice: maxPrice||"",
            sort
        })

    } catch (error) {
        console.error(error)
        
        res.render("user/shop",{
            user:req.session.user||null,
            products:[],
            categories:[],
            currentPage:1,
            totalPages:1,
            search:"",
             category:"",
            minPrice:"",
            maxPrice:"",
            sort:"latest"
        })
        
    }
}
const loadProductDetails = async (req, res) => {
    try {
        const productId = req.params.id
        const variantId = req.query.variant || req.query.variantId || null

        const product = await Product.findById(productId).populate("category").lean()

        if (!product || !product.isListed) {
             return res.render("user/productDetails", {
                pageTitle: "Product Unavailable",
                product: {},
                variants: [],
                selectedVariant: null,
                reviews: [],
                averageRating: 0,
                totalReviews: 0,
                relatedProducts: [],
                user: req.session.user || null,
                pagecss: "productDetails.css"
            });
        }
        const variants = await ProductVariant.find({ product: productId,isListed: true }).lean()

       
            if (!variants || variants.length === 0) {
                        return res.render("user/productDetails", {
                            pageTitle: "Product Unavailable",
                            product,
                            variants: [],
                            selectedVariant: null,
                            reviews: [],
                            averageRating: 0,
                            totalReviews: 0,
                            relatedProducts: [],
                            user: req.session.user || null,
                             pagecss: "productDetails.css"
                        })
                    }

                            let selectedVariant = null
                            if (variantId) {
                                selectedVariant = variants.find(v => v._id.toString() === variantId)
                            }
                                if (!selectedVariant) {
                                    selectedVariant = variants.find(v => v.stock > 0) || variants[0];
                                }

        const reviews = await Review.find({ product: productId }).populate("user", "name").sort({ createdAt: -1 }).lean()

        let averageRating = 0
        if (reviews.length > 0) {
            averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
            averageRating = Math.round(averageRating * 10)/10
        }

        const relatedProducts = await Product.find({
           category: product.category._id,
            _id: { $ne: product._id },
            isListed: true
        }).limit(3).populate("category").lean()

        for (let relprd of relatedProducts) {
            const relreview = await Review.find({ product: relprd._id }).lean()

            if (relreview.length > 0) {
                relprd.averageRating = Math.round((relreview.reduce((acc, curr) => acc + curr.rating, 0) / relreview.length) * 10) / 10
                relprd.totalReviews = relreview.length
            } else {
                relprd.averageRating = 0
                relprd.totalReviews = 0
            }

            relprd.variants = await ProductVariant.find({ product: relprd._id, isListed: true }).lean()
        }

          return res.render("user/productDetails", {
            pageTitle: product.name,
            product,
            variants,
            selectedVariant,
            reviews,
            averageRating,
            totalReviews: reviews.length,
            relatedProducts,
            user: req.session.user || null,
            pagecss: "productDetails.css"
        })

    } catch (error) {
        console.log(error)
        res.redirect("/user/shop")
    }
}




module.exports={
     loadShop,
     loadProductDetails
}