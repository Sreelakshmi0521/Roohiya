const Category= require("../../models/categoryModel")
const Product = require("../../models/productModel")
const ProductVariant=require("../../models/productVariantModel")
const User=require("../../models/userModel")



const loadLanding=async(req,res)=>{
   
    try {
        
      const categories=await Category.find({isListed:true}).sort({createdAt:-1})


    const categoriesWithImages = await Promise.all(
      categories.map(async (category) => {
        try {
          const categoryProduct = await Product.findOne({ 
            category: category._id, 
            isListed: true 
          }).lean()
          
          let categoryImage = '/images/placeholder-category.jpg'
          
          if (categoryProduct) {
            const variants = await ProductVariant.find({ 
              product: categoryProduct._id, 
              isListed: true 
            }).lean()
            
            const variantWithImage = variants.find(v => 
              v.images && v.images.length > 0 && v.images[0]
            )
            
            if (variantWithImage && variantWithImage.images[0]) {
              categoryImage = variantWithImage.images[0]
            }
          }
          
          
           return {
                        _id: category._id,
                        name: category.name,
                        isListed: category.isListed,
                        createdAt: category.createdAt,
                        image: categoryImage
                    }
          
        } catch (error) {
         console.error(error)
             return {
                    _id: category._id,
                        name: category.name,
                        isListed: category.isListed,
                        createdAt: category.createdAt,
                        image: '/images/placeholder-category.jpg'
                  }
        }
      })
    )


      const products=await Product.find({isListed:true}).sort({createdAt:-1}).limit(6).lean()


     for (let product of products) {
      const variants = await ProductVariant.find({ product: product._id, isListed: true }).lean()
      product.variants = variants
      product.isAvailable = variants.some(v => v.isListed && v.stock > 0)
    }


  const hero = {
      image: "/images/hero-woman.jpg",
      title: "Adorn your soul with timeless beauty",
      description: "Discover exquisite jewelry that complements every moment.",
      shopLink: "/shop"
    }


      res.render("landing",{
        user:req.session.user||null,
        // pageTitle: "Roohiya - Adorn Your Soul with Timeless Beauty",
        categories:categoriesWithImages,
        products,
        hero
      })

    } catch (error) {
        console.error(error)
         res.render("landing", {
      user: req.session.user || null,
      pageTitle: "Roohiya - Adorn Your Soul with Timeless Beauty",
      categories: [],
      products: [],
      hero:null
    })
    }
}


const loadHomepage=async(req,res)=>{
try {
   const categories=await Category.find({isListed:true}).sort({createdAt:-1})



    const categoriesWithImages = await Promise.all(
      categories.map(async (category) => {
        try {
          const categoryProduct = await Product.findOne({ 
            category: category._id, 
            isListed: true 
          }).lean()
          
          let categoryImage = '/images/placeholder-category.jpg'
          
          if (categoryProduct) {
            const variants = await ProductVariant.find({ 
              product: categoryProduct._id, 
              isListed: true 
            }).lean()
            
            const variantWithImage = variants.find(v => 
              v.images && v.images.length > 0 && v.images[0]
            )
            
            if (variantWithImage && variantWithImage.images[0]) {
              categoryImage = variantWithImage.images[0]
            }
          }
          


           return {
                    _id: category._id,
                      name: category.name,
                       isListed: category.isListed,
                       createdAt: category.createdAt,
                        image: categoryImage, 
                    }
        } catch (error) {
          console.error( error)
              return {
                   _id: category._id,
                        name: category.name,
                        isListed: category.isListed,
                        createdAt: category.createdAt,
                        image: '/images/placeholder-category.jpg'
                    }
        }
      })
    )

    const products = await Product.find({ isListed: true }).sort({ createdAt: -1 }).lean()
     
    for (let product of products) {
      const variants = await ProductVariant.find({ product: product._id, isListed: true }).lean()
      product.variants = variants
      product.isAvailable = variants.some(v => v.isListed && v.stock > 0)
    }




  const hero = {
      image: "/images/hero-woman.jpg",
      title: "Adorn your soul with timeless beauty",
      description: "Discover exquisite jewelry that complements every moment.",
      shopLink: "/shop"
    }
     res.render("user/homepage",{ 
     user: req.session.user || null,
      hero,
      categories:categoriesWithImages,
      products
     })

} catch (error) {
  console.error(error)
   res.render("user/homepage", {
            user: req.session.user || null,
            categories: [],
            products: [],
            hero: null
        })
}
   
}

const logout = (req, res) => {
  try {
    req.session.user = null
    res.redirect("/")
  } catch (error) {
    console.error(error)
    res.redirect("/user/homepage")
  }
}


const loadProfile=async(req,res,next)=>{
  try {
        if (!req.session.user) {
      return res.redirect("/user/login")
    }
    const userId=req.session.user.id
   const user=await User.findById(userId).lean()
   
   if(!user) throw new Error("User not found")
    res.render("user/profile",{
      user,

   })
   
   
  } catch (error) {
    next(error)
  }
}

const loadEditProfile = async (req, res, next) => {
  try {
        if (!req.session.user) {
      return res.redirect("/user/login")
    }
    const userId=req.session.user.id
   const user=await User.findById(userId).lean()

    if (!user) {
      return res.redirect("/user/login")
    }

    res.render("user/editProfile", {
      user,
     
    })
  } catch (error) {
    next(error)
  }
}


module.exports={
    loadLanding,
    loadHomepage,
    logout,
     loadProfile,
     loadEditProfile
}