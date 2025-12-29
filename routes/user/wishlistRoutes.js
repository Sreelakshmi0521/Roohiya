// routes/user/wishlistRoutes.js
const express = require("express");
const router = express.Router();
const { requireLogin } = require("../../middlewares/userAuth");
const setPagetitle = require("../../middlewares/setpagetitle");
const wishlistController = require("../../controllers/user/wishlistController");
const nocache=require("../../middlewares/nocache")


router.get("/wishlist",requireLogin,setPagetitle("My Wishlist", "wishlist.css"),wishlistController.loadWishlistPage)
router.post("/wishlist/add",nocache, requireLogin, wishlistController.addToWishlist);
router.post("/wishlist/remove",nocache,requireLogin,wishlistController.removeFromWishlist)
router.post("/wishlist/moveToCart",nocache,requireLogin,wishlistController.moveToCart)

module.exports = router;