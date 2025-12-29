const Wishlist = require("../models/wishlistModel")

const wishlistCount = async (req, res, next) => {
  try {
    let wishlistCount = 0

  
    if (req.session.user) {
      const userId = req.session.user._id || req.session.user.id

    
      const wishlist = await Wishlist.findOne({ userId })
      wishlistCount = wishlist ? wishlist.items.length : 0
    }

    res.locals.wishlistCount = wishlistCount

    next()
  } catch (error) {
    console.error(error)
    res.locals.wishlistCount = 0
    next()
  }
}



module.exports = wishlistCount
