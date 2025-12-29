const Category = require("../../models/categoryModel");
const Product = require("../../models/productModel");
const ProductVariant = require("../../models/productVariantModel");
const User = require("../../models/userModel");

// ========== CENTRALIZED HERO SLIDES DATA ==========
const HERO_SLIDES = [
  {
    image: "/images/hero-woman.jpg",
    title: "Adorn your soul with timeless beauty",
    description: "Discover exquisite jewelry that complements every moment.",
    shopLink: "/user/shop",
    alt: "Woman wearing elegant jewelry"
  },
  {
    image: "/images/carousel-2.jpg",
    title: "Elegance Redefined",
    description: "Premium earrings crafted with precision and passion.",
    shopLink: "/user/shop?category=earrings",
    alt: "Elegant earrings collection"
  },
  {
    image: "/images/carousel-3.jpg",
    title: "Winter Collection 2025",
    description: "Lightweight and trendy designs for the season.",
    shopLink: "/user/shop?new=true",
    alt: "Winter jewelry collection"
  }
];

// ========== REUSABLE FUNCTION FOR CATEGORIES ==========
const getCategoriesWithImages = async () => {
  try {
    const categories = await Category.find({ isListed: true }).sort({ createdAt: -1 });

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
            _id: category._id,
            name: category.name,
            isListed: category.isListed,
            createdAt: category.createdAt,
            image: categoryImage
          };
        } catch (error) {
          console.error(`Error processing category ${category.name}:`, error);
          return {
            _id: category._id,
            name: category.name,
            isListed: category.isListed,
            createdAt: category.createdAt,
            image: '/images/placeholder-category.jpg'
          };
        }
      })
    );

    return categoriesWithImages;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

// ========== LANDING PAGE CONTROLLER ==========
const loadLanding = async (req, res) => {
  try {
    const [categories, products] = await Promise.all([
      getCategoriesWithImages(),
      Product.find({ isListed: true }).sort({ createdAt: -1 }).limit(6).lean()
    ]);

    for (let product of products) {
      const variants = await ProductVariant.find({ 
        product: product._id, 
        isListed: true 
      }).lean();
      product.variants = variants;
      product.isAvailable = variants.some(v => v.isListed && v.stock > 0);
    }

    res.render("landing", {
      user: req.session.user || null,
      categories,
      products,
      heroSlides: HERO_SLIDES,
        isLoggedIn: req.session.user ? true : false
      
    });

  } catch (error) {
    console.error("Error in loadLanding:", error);
    res.render("landing", {
      user: req.session.user || null,
      pageTitle: "Roohiya - Adorn Your Soul with Timeless Beauty",
      categories: [],
      products: [],
      heroSlides: [HERO_SLIDES[0]],
 
    });
  }
};

// ========== HOMEPAGE CONTROLLER ==========
const loadHomepage = async (req, res) => {
  try {
    const [categories, products] = await Promise.all([
      getCategoriesWithImages(),
      Product.find({ isListed: true }).sort({ createdAt: -1 }).lean()
    ]);

    for (let product of products) {
      const variants = await ProductVariant.find({ 
        product: product._id, 
        isListed: true 
      }).lean();
      product.variants = variants;
      product.isAvailable = variants.some(v => v.isListed && v.stock > 0);
    }

    res.render("user/homepage", {
      user: req.session.user || null,
      categories,
      products,
      heroSlides: HERO_SLIDES
    });

  } catch (error) {
    console.error("Error in loadHomepage:", error);
    res.render("user/homepage", {
      user: req.session.user || null,
      pageTitle: "Roohiya - Adorn Your Soul with Timeless Beauty",
      categories: [],
      products: [],
      heroSlides: [HERO_SLIDES[0]]
    });
  }
};

// ========== LOGOUT CONTROLLER ==========
const logout = (req, res) => {
  try {
    req.session.user = null;
    res.redirect("/");
  } catch (error) {
    console.error("Error in logout:", error);
    res.redirect("/user/homepage");
  }
};

module.exports = {
  loadLanding,
  loadHomepage,
  logout
};