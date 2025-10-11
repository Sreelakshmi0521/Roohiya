const Product=require("../../models/productModel")
const ProductVariant=require("../../models/productVariantModel")
const Category=require("../../models/categoryModel")




const loadShop=async(req,res)=>{
    try {
        console.log("hai")
        const search =req.query.search ? req.query.search.trim():""
        const category=req.query.category||""
        const minPrice=req.query.minPrice?parseInt(req.query.minPrice):null
        const maxPrice=req.query.maxPrice?parseInt(req.query.maxPrice):null
        const sort =req.query.sort||"latest"
        const page=parseInt(req.query.page)||1
        const limit=6
        const skip=(page-1)*limit


        const prdFilter={isListed:true}

        // if(search){
        //    prdFilter.name={$regex:search,$options:"i"}
        // }
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

        let prdFromColorsearch=[]

        if(search){
         const  colorVariants=await ProductVariant.find({
              color:{$regex:search,$options:"i"},
              isListed:true
           }).distinct("product")
            prdFromColorsearch=colorVariants.map(id=>id.toString())
            
        }

        products=await Promise.all(
            products.map(async(product)=>{
                const variants=await ProductVariant.find({product:product._id,isListed:true}).lean()
           

            const filterVari=variants.filter(variant=>{
                const displayPrice=variant.discountedPrice||variant.price
                if(minPrice!==null &&displayPrice<minPrice)return false
                if(maxPrice!==null && displayPrice>maxPrice)return false
               
                if(search){
                    const searchLower=search.toLowerCase()
                    const prdnameMatch=product.name.toLowerCase().includes(searchLower)
                    const colorMatch=variant.color && variant.color.toLowerCase().includes(searchLower)
                     
                    if(!prdnameMatch &&!colorMatch)return false
                }
                return true
            })
            return {...product,variants:filterVari}
             })
        )

        if(search){
            products=products.filter(p=>p.variants.length>0|| prdFromColorsearch.includes(p._id.toString()))
        }else{
         products =products.filter(p=>p.variants.length>0)
      
        }

       
       const getDisplayPrice = (product) => {
            if(!product.variants || product.variants.length===0) return Infinity
            const variant = product.variants[0]
            return variant.discountedPrice || variant.price
        }


        switch(sort){
            case "price_asc": products.sort((a,b)=>getDisplayPrice(a) - getDisplayPrice(b))
            break;

            case "price_desc":products.sort((a,b)=>getDisplayPrice(b) - getDisplayPrice(a))
            break

            case "a-z":products.sort((a,b)=>a.name.localeCompare(b.name))
            break;

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

module.exports={
     loadShop
}