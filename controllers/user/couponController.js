const Cart =require("../../models/cartModel")
const Coupon=require("../../models/couponModel")
const getUserId=(req)=>req.session.user?._id||req.session.user?.id

exports.applyCoupon=async(req,res)=>{
    try {
            

        const {couponCode}=req.body
        const userId=getUserId(req)

        if (!userId) {
      return res.status(401).json({ success: false, message: "User not logged in" })
    }
        const coupon=await Coupon.findOne({
            code:couponCode.toUpperCase().trim(),
            isActive:true,
            startDate:{$lte:new Date()},
            endDate:{$gte: new Date()}
        })

         if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' })
    }

           if (coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' })
    }
        
          const userUsage = coupon.usedBy.find(usage => 
            usage.userId && usage.userId.toString() === userId.toString()
        )

        if (userUsage && userUsage.usageCount >= coupon.perUserLimit) {
            return res.status(400).json({ 
                success: false, 
                message: 'You have reached the maximum usage limit for this coupon' 
            })
        }


            const cart = await Cart.findOne({ userId: userId }).populate('items.productId')  .populate('items.productVariantId')



              if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }
if (cart.coupon && cart.coupon.code) {
      return res.status(400).json({ success: false, message: 'A coupon is already applied. Remove it first to apply a new one.' });
    }

  const subtotal = cart.items.reduce((total, item) => {
      const price = item.discountedPriceAtTime || item.priceAtTime;
      return total + (price * item.quantity);
    }, 0);

    if (subtotal < coupon.minPurchaseAmount) {
      return res.status(400).json({ success: false, message: `Minimum purchase amount of ₹${coupon.minPurchaseAmount} required` });
    }

             
let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
         discountAmount = Math.min(coupon.discountValue, subtotal);
    }
             // discount is not negative checking
          discountAmount = Math.max(0, discountAmount);
           discountAmount = Math.round(discountAmount * 100) / 100; 


            cart.coupon = {
                code: coupon.code,
                couponId: coupon._id,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discountAmount,
            };

            cart.discount = discountAmount;
    cart.totalAmount = subtotal - discountAmount;

                        await cart.save()

              res.json({
                success: true,
                message: 'Coupon applied successfully!',
                discountAmount,
               cartTotal: cart.totalAmount,
                coupon: {
                code: coupon.code,
                discountAmount: discountAmount,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue
            },
            subtotal: subtotal
            });
            

    } catch (error) {
        
        console.error('Error applying coupon:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while applying coupon'
            });
    }
}


exports.removeCoupon=async(req,res)=>{
    try {
                const userId=getUserId(req)

                  if (!userId) {
      return res.status(401).json({  success: false,message: "User not logged in" })
    }

        const cart = await Cart.findOne({ userId: userId });
        if (!cart) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cart not found' 
            });
        }


if (!cart.coupon || !cart.coupon.code) {
                return res.status(400).json({
                    success: false,
                    message: 'No coupon applied'
                });
            }
                   
      const removedCouponCode = cart.coupon.code;
    cart.coupon=undefined;
    cart.discount=0

    const subtotal=cart.items.reduce((total,item)=>{
      const price=item.discountedPriceAtTime||item.priceAtTime
      return total+(price * item.quantity)
    },0)

    cart.totalAmount=subtotal

    await cart.save()

    
        res.json({
            success: true,
            message: `Coupon "${removedCouponCode}" removed successfully`,
            cartTotal: cart.totalAmount,
            discountAmount: 0,
            subtotal: subtotal
        });

    } catch (error) {
         console.error(' Error removing coupon:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while removing coupon'
        });
    }
}

exports.getAvailableCoupons=async(req,res)=>{
  try {
    const userId = getUserId(req)
  if (!userId) {
      return res.status(401).json({  success: false,message: "User not logged in" })
    }


    const now=new Date()

    const coupons = await Coupon.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    usageCount: { $lt: "$usageLimit" }  // Remove $expr, use direct field comparison
}).sort({ createdAt: -1 })


    const cart = await Cart.findOne({ userId: userId });

        let cartSubtotal = 0;

if(cart && cart.items.length>0){
   cartSubtotal=cart.items.reduce((total,item)=>{
    const price=item.discountedPriceAtTime||item.priceAtTime
    return total+ (price * item.quantity) 

   },0)
}
const availableCoupons = coupons.map(coupon => {
            const userUsage = coupon.usedBy.find(usage => 
                usage.userId && usage.userId.toString() === userId.toString()
            );
            const userUsageCount = userUsage ? userUsage.usageCount : 0;
            const isEligible = cartSubtotal >= coupon.minPurchaseAmount && 
                              userUsageCount < coupon.perUserLimit;

  return {
                _id: coupon._id,
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                maxDiscountAmount: coupon.maxDiscountAmount,
                minPurchaseAmount: coupon.minPurchaseAmount,
                startDate: coupon.startDate,
                endDate: coupon.endDate,
                isEligible: isEligible,
                remainingUses: coupon.perUserLimit - userUsageCount
            };
        }).filter(coupon => coupon.isEligible);


res.json({
            success: true,
            coupons: availableCoupons,
            cartSubtotal: cartSubtotal
        });




  } catch (error) {
    console.error('❌ Error fetching coupons:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching coupons'
        });
  }
}

exports.validateCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body;
        const userId = getUserId(req);
        
        if (!couponCode) {
            return res.json({
                isValid: false,
                message: 'Please enter a coupon code'
            });
        }

        const coupon = await Coupon.findOne({
            code: couponCode.toUpperCase().trim(),
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        if (!coupon) {
            return res.json({
                isValid: false,
                message: 'Invalid coupon code'
            });
        }

        // Get cart subtotal
        const cart = await Cart.findOne({ userId: userId });
        let cartSubtotal = 0;
        
        if (cart && cart.items.length > 0) {
            cartSubtotal = cart.items.reduce((total, item) => {
                const price = item.discountedPriceAtTime || item.priceAtTime;
                return total + (price * item.quantity);
            }, 0);
        }

        // Check eligibility
        const userUsage = coupon.usedBy.find(usage => 
            usage.userId && usage.userId.toString() === userId.toString()
        );
        
        const userUsageCount = userUsage ? userUsage.usageCount : 0;
        
        if (userUsageCount >= coupon.perUserLimit) {
            return res.json({
                isValid: false,
                message: 'You have reached the usage limit for this coupon'
            });
        }

        if (cartSubtotal < coupon.minPurchaseAmount) {
            return res.json({
                isValid: false,
                message: `Add ₹${(coupon.minPurchaseAmount - cartSubtotal).toFixed(2)} more to use this coupon`
            });
        }

        // Calculate potential discount
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (cartSubtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
            }
        } else {
            discountAmount = Math.min(coupon.discountValue, cartSubtotal);
        }

        return res.json({
            isValid: true,
            message: 'Coupon is valid',
            coupon: {
                code: coupon.code,
                discountAmount: discountAmount,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue
            }
        });

    } catch (error) {
        console.error('❌ Error validating coupon:', error);
        return res.json({
            isValid: false,
            message: 'Error validating coupon'
        });
    }
};