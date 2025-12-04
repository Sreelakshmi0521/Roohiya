const ProductVariant=require("../models/productVariantModel")

const reduceProductStock=async(variantId,quantity)=>{
    try {
     const variant = await ProductVariant.findById(variantId);
    if (!variant) {
            throw new Error('Product variant not found');
        }
  if (variant.stock < quantity) {
            throw new Error(`Insufficient stock. Available: ${variant.stock}, Requested: ${quantity}`)
  }
           variant.stock -= quantity;

 if (variant.stock === 0) {
            variant.isListed = false;
        }
                await variant.save();

 console.log(`✅ Reduced ${quantity} units from variant ${variantId}`);
        
       
    
    } catch (error) {
         console.error( error);
        throw error;
    }
}

const restoreProductStock = async (variantId, quantity) => {
    try {
        const variant = await ProductVariant.findById(variantId);
        
        if (!variant) {
            console.error(`Variant ${variantId} not found`);
            throw new Error('Product variant not found');
        }

        variant.stock += quantity;
        
        if (variant.stock > 0 && !variant.isListed) {
            variant.isListed = true;
        }
        
        await variant.save();
        
console.log(`✅ Restored ${quantity} units to variant ${variantId}`);
              
        return variant;

    } catch (error) {
        console.error( error);
        throw error;
    }
};


const checkStockAvailability=async(variantId,quantity)=>{
    try {
     const variant = await ProductVariant.findById(variantId);
if (!variant) {
            return { available: false, message: 'Product not found' };
        }
  if (!variant.isListed) {
            return { available: false, message: 'Product is not available' };
        }

   if (variant.stock < quantity) {
            return { 
                available: false, 
                message: `Only ${variant.stock} items available` 
            };
        }

          return { available: true, variant };

    } catch (error) {
         console.error('Error checking stock:', error);
        return { available: false, message: 'Error checking stock' };
    }
}

module.exports = {reduceProductStock,restoreProductStock,checkStockAvailability};