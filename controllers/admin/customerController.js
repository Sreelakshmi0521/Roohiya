const User=require("../../models/userModel")


const loadCustomer=async(req,res)=>{
    try {
        let search=""
        if(req.query.search){
            search=req.query.search;
        }

        let filter=""
        if(req.query.filter){
            filter=req.query.filter
        }

        let page=1
        if(req.query.page){
            page=parseInt(req.query.page)
        }
        const limit=3
      
        let userData={
            isDeleted:false,
            $or:[
                {name:{$regex:search,$options:"i"}},
                {email:{$regex:search,$options:"i"}},
            ]
        }
      
        if(filter){
            userData.isBlocked= filter==="blocked" ? true:false
        }
        const totalCustomers=await User.countDocuments(userData)
        const customers=await User.find(userData)
             .sort({createdAt:-1})
             .skip((page-1)*limit)
             .limit(limit)

          res.render("admin/customers",{
            customers,
            totalCustomers,
            currentPage:page,
            totalPages:Math.ceil(totalCustomers/limit),
             search,
             filter
         })

    } catch (error) {
         console.error(error)
         res.status(500).send("server error")
    }
}



module.exports={
    loadCustomer
}