const Product = require("../../models/productModel")
const Review = require("../../models/reviewModel")




const addReview = async (req, res) => {
  try{

        const userId = req.session.user._id || req.session.user.id 
        const { productId, rating, comment } = req.body

        if (!productId || !rating || !comment) {
            return res.status(400).json({ success: false, message: "Please provide product ID, rating, and comment." })
        }

        const existingReview = await Review.findOne({ user: userId, product: productId })
        if (existingReview) {
            return res.status(400).json({ success: false, message: "You have already reviewed this product." })
        }

        const review = await Review.create({
            user: userId,
            product: productId,
            rating,
            comment,
            isApproved: true
        })
        console.log(review)

           await Product.findByIdAndUpdate(productId, { $push: { reviews: review._id } })
            res.json({ success: true, message: "Review added successfully!" })
   
   
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: "Server error" })
      }
}


module.exports = { addReview }