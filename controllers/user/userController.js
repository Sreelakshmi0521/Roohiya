const Category= require("../../models/categoryModel")
const Product=require("../../models/productModel")
const ProductVariant=require("../../models/productVariantModel")



const loadLanding=async(req,res)=>{
   
    try {
        
      const categories=await Category.find({isListed:true}).sort({createdAt:-1})


    const categoriesWithImages = await Promise.all(
      categories.map(async (category) => {
        try {
          const categoryProduct = await Product.findOne({ 
            category: category._id, 
            isListed: true 
          }).lean();
          
          let categoryImage = '/images/placeholder-category.jpg';
          
          if (categoryProduct) {
            const variants = await ProductVariant.find({ 
              product: categoryProduct._id, 
              isListed: true 
            }).lean();
            
            const variantWithImage = variants.find(v => 
              v.images && v.images.length > 0 && v.images[0]
            );
            
            if (variantWithImage && variantWithImage.images[0]) {
              categoryImage = variantWithImage.images[0];
            }
          }
          
          return {
            ...category, // This is now a plain object, not Mongoose document
            image: categoryImage
          };
        } catch (error) {
          console.error(`Error processing category ${category.name}:`, error);
          return {
            ...category,
            image: '/images/placeholder-category.jpg'
          };
        }
      })
    );


      const products=await Product.find({isListed:true}).sort({createdAt:-1}).limit(4).lean()


      for(let product of products){
        product.variants=await ProductVariant.find({product:product._id,isListed:true}).lean()

      }

  const hero = {
      image: "/images/hero-woman.jpg",
      title: "Adorn your soul with timeless beauty",
      description: "Discover exquisite jewelry that complements every moment.",
      shopLink: "/shop"
    };


      res.render("landing",{
        user:req.session.user||null,
        pageTitle: "Roohiya - Adorn Your Soul with Timeless Beauty",
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

module.exports={
    loadLanding
}