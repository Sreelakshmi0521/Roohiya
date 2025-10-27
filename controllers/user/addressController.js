const User = require("../../models/userModel");
const Address=require("../../models/addressModel")

const loadAddressesPage = async (req, res) => {
  try {
       const userId = req.session.user.id;
    // console.log("Session:", req.session.user)

    const user = await User.findById(userId)

    if (!user) {
      return res.redirect("/user/login")
    }

    res.render("user/addresses", {  
      addresses: user.addresses || [],
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error")
  }
};

module.exports = {
   loadAddressesPage
   }
