const Product=require("../../models/productModel")
const ProductVariant=require("../../models/productVariantModel")
const Category=require("../../models/categoryModel")
const { max } = require("../../validations/productVariantValidation")



const loadShop=async(req,res)=>{
    try {
        const search =req.query.search ? req.query.search.trim():""
        const category=req.query.category||""
        const minPrice=parseInt(req.query.minPrice)||0
        const maxPrice=parseInt(req.query.maxPrice)||0
        const sort =req.query.sort||"latest"
        const page=parseInt(req.query.page)||1
        const limit=6
        const skip=(page-1)*limit


        const data={isListed:true}

        if(search){
            data.name={$regex:search,$options:"i"}
        }
        if(category){
            data.category=category
        }

        const priceFilter={}
        if(minPrice){
            priceFilter.$gte=minPrice
        }
        if(maxPrice){
            priceFilter.$lte=maxPrice
        }

        let products=await Product.find(data).lean()

         for(let product of products){
            let variants=await ProductVariant.find({product:product._id,isListed:true,...(minPrice||maxPrice?{price:priceFilter}:{})}).lean()
        
           product.variants=variants
        }

        products =products.filter(p=>p.variants.length>0)

        switch(sort){
            case "price_asc": products.sort((a,b)=>a.variants[0].price - b.variants[0].price)
            break;

            case "price_desc":products.sort((a,b)=>b.variants[0].price - a.variants[0].price)
            break

            case "a-z":products.sort((a,b)=>a.name.localeCompare(b.name))
            break;

            case "z-a":products.sort((a,b)=>b.name.localeCompare(a.name))
            break

            default:products.sort((a,b)=>b.createdAt-a.createdAt)
        }


         
        const totalProducts=products.length
        const totalPages=Math.ceil(totalProducts/limit)
        const paginationProducts=products.slice(skip,skip+limit)

        res.render("user/shop",{
            user:req.session.user||null,
            products:paginationProducts,
            currentPage:page,
            totalPages,
            search,
            category,
            minPrice,
            maxPrice,
            sort
        })

    } catch (error) {
        console.error(error)
        
        res.render("user/shop",{
            user:req.session.user||null,
            products:[],
            currentPage:1,
            totalPages:1,
            search:"",
             category:"",
            minPrice:0,
            maxPrice:0,
            sort:"latest"
        })
        
    }
}

module.exports={
     loadShop
}