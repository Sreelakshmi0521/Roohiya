const Cart = require("../models/cartModel")

const cartCount = async (req, res, next) => {
  try {
    if (req.session.user) {
      const userId = req.session.user?._id||req.session.user?.id
      const cart = await Cart.findOne({ userId })

    
      res.locals.cartCount = cart ? cart.items.length : 0
    } else {
      res.locals.cartCount = 0
    }
  } catch (error) {
    console.error(error)
    res.locals.cartCount = 0
  }

  next()
}

module.exports = cartCount
