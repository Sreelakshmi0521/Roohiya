const User=require("../../models/userModel")


const loadCustomer=async(req,res)=>{
    try {
        let search=""
        if(req.query.search){
            search=req.query.search;
        }



        let page=1
        if(req.query.page){
            page=parseInt(req.query.page)
        }
        let  limit=3

        let userData={ isDeleted:false}

    
        if(search){
          userData.$or=[
                {name:{$regex:search,$options:"i"}},
                {email:{$regex:search,$options:"i"}},
            ]
        }
      
    // console.log("data", userData)


        const totalCustomers=await User.countDocuments( userData)
        const customers=await User.find( userData)
             .sort({createdAt:-1})
             .skip((page-1)*limit)
             .limit(limit)

          res.render("admin/customers",{
            customers,
            totalCustomers,
            currentPage:page,
            totalPages:Math.ceil(totalCustomers/limit),
             search,
              pageJs: "block.unblock.js"
         })

    } catch (error) {
         console.error(error)
         res.status(500).send("server error")
    }
}

const blockUser=async(req,res)=>{
    try {
        const userId=req.params.id
        await User.findByIdAndUpdate(userId,{isBlocked:true})
        return res.json({success:true,message:"User blocked successfully"})
    } catch (error) {
        console.error(error)
        return res.json({success:false,message:"failed to block"})
    }
}

const unblockUser=async(req,res)=>{
    try {
        const userId=req.params.id
        await User.findByIdAndUpdate(userId,{isBlocked:false})
         return res.json({success:true,message:"User unblocked "})
    } catch (error) {
        console.error(error)
        return res.json({success:false,message:"failed to unblock"})
    }
}

module.exports={
    loadCustomer,
    blockUser,
    unblockUser
}