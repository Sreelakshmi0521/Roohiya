// Apply Coupon Function
async function applyCoupon() {
    const couponInput = document.getElementById('couponCode');
    const couponCode = couponInput ? couponInput.value.trim() : '';
    const applyBtn = document.getElementById('applyCouponBtn');
    
    if (!couponCode) {
        showToast('Please enter a coupon code', 'error');
        return;
    }
    
    // Show loading
    if (applyBtn) {
        applyBtn.disabled = true;
        applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> APPLYING...';
    }
    
    try {
        console.log('Applying coupon:', couponCode);
        const response = await axios.post('/user/coupon/apply-coupon', {
            couponCode: couponCode
        });
        
        console.log('Coupon response:', response.data);
        
        if (response.data.success) {
            showToast(response.data.message, 'success');
            
            // Update the UI with new data
            updateCheckoutSummary(response.data);
            
        } else {
            showToast(response.data.message, 'error');
        }
    } catch (error) {
        console.error('Error applying coupon:', error);
        
        // Handle validation errors
        if (error.response?.status === 400) {
            if (error.response.data.errors) {
                const errors = error.response.data.errors;
                const firstError = Object.values(errors)[0];
                showToast(firstError, 'error');
            } else if (error.response.data.message) {
                showToast(error.response.data.message, 'error');
            } else {
                showToast('Invalid coupon code', 'error');
            }
        } else {
            showToast('Failed to apply coupon. Please try again.', 'error');
        }
    } finally {
        // Reset button
        if (applyBtn) {
            applyBtn.disabled = false;
            applyBtn.innerHTML = 'APPLY';
        }
    }
}

// Remove Coupon Function
async function removeCoupon() {
    const removeBtn = document.getElementById('removeCouponBtn');
    
    if (!removeBtn) return;
    
    // Show loading
    removeBtn.disabled = true;
    removeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> REMOVING...';
    
    try {
        const response = await axios.post('/user/coupon/remove-coupon');
        
        if (response.data.success) {
            showToast(response.data.message, 'success');
            
            // Update the UI
            updateCheckoutSummary(response.data);
            
        } else {
            showToast(response.data.message, 'error');
        }
    } catch (error) {
        console.error('Error removing coupon:', error);
        showToast('Failed to remove coupon. Please try again.', 'error');
    } finally {
        // Reset button
        removeBtn.disabled = false;
        removeBtn.innerHTML = 'REMOVE';
    }
}

// Update Checkout Summary
function updateCheckoutSummary(data) {
    console.log('Updating checkout summary with:', data);
    
    // Update coupon section in UI
    updateCouponUI(data);
    
    // Update price breakdown
    updatePriceBreakdown(data);
    
    // ✅ REMOVED: Automatic page reload - let UI updates handle it
    // If you really need to reload, do it conditionally:
    // if (data.needsFullRefresh) {
    //     setTimeout(() => {
    //         window.location.reload();
    //     }, 1000);
    // }
}

// Update Coupon UI Section - FIXED VERSION
function updateCouponUI(data) {
    const couponBox = document.querySelector('.simple-coupon-box');
    if (!couponBox) return;
    
    const couponCode = data.coupon?.code || '';
    const discountAmount = data.discountAmount || 0;
    
    // Get or create elements
    const couponInputGroup = couponBox.querySelector('.coupon-input-group');
    const viewCouponsLink = couponBox.querySelector('.view-coupons-link');
    let appliedMessage = couponBox.querySelector('.applied-success');
    
    if (couponCode && discountAmount > 0) {
        // Coupon is applied - show remove option
        if (couponInputGroup) {
            couponInputGroup.innerHTML = `
                <input 
                    type="text" 
                    id="couponCode" 
                    placeholder="Enter coupon code" 
                    value="${couponCode}" 
                    readonly
                    class="coupon-code-uppercase"
                >
                <button type="button" class="btn-remove" onclick="removeCoupon()" id="removeCouponBtn">
                    REMOVE
                </button>
            `;
        }
        
        // Create or update applied message
        if (!appliedMessage) {
            appliedMessage = document.createElement('div');
            appliedMessage.className = 'applied-success';
            
            // ✅ FIXED: Insert at correct position
            if (viewCouponsLink) {
                couponBox.insertBefore(appliedMessage, viewCouponsLink);
            } else {
                // If view-coupons-link doesn't exist, append to couponBox
                couponBox.appendChild(appliedMessage);
            }
        }
        
        appliedMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            Coupon <strong>${couponCode}</strong> applied! 
            You saved ₹${discountAmount.toFixed(2)}
        `;
    } else {
        // No coupon - show apply option
        if (couponInputGroup) {
            couponInputGroup.innerHTML = `
                <input 
                    type="text" 
                    id="couponCode" 
                    placeholder="Enter coupon code"
                    class="coupon-code-uppercase"
                >
                <button type="button" class="btn-apply" onclick="applyCoupon()" id="applyCouponBtn">
                    APPLY
                </button>
            `;
        }
        
        // Remove applied message if exists
        if (appliedMessage) {
            appliedMessage.remove();
        }
    }
    
    // Re-attach event listeners after updating DOM
    attachCouponEventListeners();
}

// Update Price Breakdown - FIXED VERSION
function updatePriceBreakdown(data) {
    const priceBreakdown = document.querySelector('.price-breakdown');
    if (!priceBreakdown) return;
    
    const subtotal = data.subtotal || 0;
    const discountAmount = data.discountAmount || 0;
    const cartTotal = data.cartTotal || subtotal;
    
    // Update subtotal
    const subtotalElement = priceBreakdown.querySelector('.price-row:nth-child(1) span:last-child');
    if (subtotalElement) {
        subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    }
    
    // Find or create coupon discount row
    let discountRow = priceBreakdown.querySelector('.price-row.discount');
    
    if (discountAmount > 0) {
        // Determine where to insert the discount row
        // It should be inserted before shipping row
        const shippingRow = priceBreakdown.querySelector('.price-row:nth-last-child(3)') || 
                           priceBreakdown.querySelector('.price-row:nth-last-child(2)');
        
        if (!discountRow && shippingRow) {
            // Create new discount row
            discountRow = document.createElement('div');
            discountRow.className = 'price-row discount';
            discountRow.innerHTML = `
                <span>Coupon Discount:</span>
                <span>-₹${discountAmount.toFixed(2)}</span>
            `;
            shippingRow.parentNode.insertBefore(discountRow, shippingRow);
        } else if (discountRow) {
            // Update existing discount row
            discountRow.querySelector('span:last-child').textContent = `-₹${discountAmount.toFixed(2)}`;
        }
    } else if (discountRow) {
        // Remove discount row if no discount
        discountRow.remove();
    }
    
    // Update grand total
    const totalElement = priceBreakdown.querySelector('.price-row.total span:last-child');
    if (totalElement) {
        totalElement.textContent = `₹${cartTotal.toFixed(2)}`;
    }
    
    // Also update the "You Save" section if it exists
    const youSaveElement = priceBreakdown.querySelector('.price-row.you-save span:last-child');
    if (youSaveElement) {
        const currentYouSave = parseFloat(youSaveElement.textContent.replace('₹', '')) || 0;
        const newTotalYouSave = currentYouSave + discountAmount;
        youSaveElement.textContent = `₹${newTotalYouSave.toFixed(2)}`;
    }
}

// Open Available Coupons Modal
// Open Available Coupons Modal - SIMPLIFIED VERSION
async function openAvailableCouponsModal() {
    console.log("🔍 Button clicked: Opening coupons modal...");
    
    try {
        const viewCouponsBtn = document.getElementById('viewCouponsBtn');
        if (viewCouponsBtn) {
            viewCouponsBtn.disabled = true;
            viewCouponsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        }
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            console.log("❌ Request timed out");
            showToast('Request timeout. Please try again.', 'error');
        }, 10000);
        
        console.log("🔍 Sending request to /user/coupon/available-coupons");
        
        const response = await fetch('/user/coupon/available-coupons', {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        clearTimeout(timeoutId);
        
        console.log("🔍 Response status:", response.status);
        console.log("🔍 Response headers:", response.headers);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("🔍 Response data:", data);
        
        if (viewCouponsBtn) {
            viewCouponsBtn.disabled = false;
            viewCouponsBtn.innerHTML = '<i class="fas fa-ticket-alt"></i> View Available Coupons';
        }
        
        if (data.success) {
            console.log(`✅ Success! Found ${data.coupons.length} coupons`);
            
            if (data.coupons.length === 0) {
                showToast('No coupons available for your cart value', 'info');
            } else {
                showCouponsModal(data.coupons, data.cartSubtotal);
            }
        } else {
            console.error('❌ API returned error:', data.message);
            showToast('Failed to load coupons: ' + data.message, 'error');
        }
        
    } catch (error) {
        console.error('❌ Error loading coupons:', error);
        
        if (error.name === 'AbortError') {
            showToast('Request timeout. Please try again.', 'error');
        } else if (error.message.includes('HTTP error')) {
            showToast(`Server error: ${error.message}`, 'error');
        } else {
            showToast('Failed to load coupons. Please try again.', 'error');
        }
        
        const viewCouponsBtn = document.getElementById('viewCouponsBtn');
        if (viewCouponsBtn) {
            viewCouponsBtn.disabled = false;
            viewCouponsBtn.innerHTML = '<i class="fas fa-ticket-alt"></i> View Available Coupons';
        }
    }
}
// Show Coupons Modal - IMPROVED VERSION
function showCouponsModal(coupons, cartSubtotal) {
    // First, close any existing modal
    closeCouponModal();
    
    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };
    
    // Create modal HTML
    const modalHTML = `
        <div class="coupon-modal-overlay" id="couponModal" onclick="closeCouponModalOnOverlay(event)">
            <div class="coupon-modal" onclick="event.stopPropagation()">
                <div class="coupon-modal-header">
                    <h3><i class="fas fa-ticket-alt"></i> Available Coupons</h3>
                    <button class="close-modal" onclick="closeCouponModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="coupon-modal-body">
                    ${coupons.length > 0 ? `
                        <div class="coupon-list">
                            ${coupons.map(coupon => {
                                const maxDiscountText = coupon.discountType === 'percentage' && coupon.maxDiscountAmount 
                                    ? `<p><i class="fas fa-tag"></i> Max discount: ₹${coupon.maxDiscountAmount}</p>` 
                                    : '';
                                
                                const discountText = coupon.discountType === 'percentage' 
                                    ? `${coupon.discountValue}% OFF` 
                                    : `₹${coupon.discountValue} OFF`;
                                
                                return `
                                <div class="coupon-card">
                                    <div class="coupon-header">
                                        <div class="coupon-code">${coupon.code}</div>
                                        <div class="coupon-discount">
                                            ${discountText}
                                        </div>
                                    </div>
                                    <div class="coupon-desc">${coupon.description}</div>
                                    <div class="coupon-terms">
                                        <p><i class="fas fa-info-circle"></i> Min. purchase: ₹${coupon.minPurchaseAmount}</p>
                                        ${maxDiscountText}
                                        <p><i class="fas fa-calendar"></i> Valid until: ${formatDate(coupon.endDate)}</p>
                                        ${coupon.remainingUses > 0 ? `<p><i class="fas fa-user-check"></i> Remaining uses: ${coupon.remainingUses}</p>` : ''}
                                    </div>
                                    <div class="coupon-footer">
                                        <button class="btn-select-coupon" onclick="selectCoupon('${coupon.code}')">
                                            APPLY COUPON
                                        </button>
                                    </div>
                                </div>
                            `}).join('')}
                        </div>
                    ` : `
                        <div class="no-coupons">
                            <i class="fas fa-ticket-alt"></i>
                            <p>No coupons available at the moment</p>
                            <p class="empty-subtext">Add more items to your cart or check back later</p>
                        </div>
                    `}
                </div>
                <div class="coupon-modal-footer">
                    <p><i class="fas fa-shopping-cart"></i> Your cart total: ₹${cartSubtotal.toFixed(2)}</p>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
    
    // Add CSS for modal if not already present
    addCouponModalStyles();
}

// Add Coupon Modal Styles
function addCouponModalStyles() {
    if (!document.getElementById('coupon-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'coupon-modal-styles';
        style.textContent = `
            .coupon-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                animation: fadeIn 0.3s ease-out;
            }
            
            .coupon-modal {
                background: white;
                border-radius: 12px;
                width: 90%;
                max-width: 600px;
                max-height: 85vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: slideUp 0.3s ease-out;
            }
            
            .coupon-modal-header {
                padding: 20px 25px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: sticky;
                top: 0;
                background: white;
                z-index: 1;
            }
            
            .coupon-modal-header h3 {
                margin: 0;
                color: #333;
                font-size: 1.3rem;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .close-modal {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #666;
                padding: 5px;
                border-radius: 50%;
                transition: all 0.3s;
            }
            
            .close-modal:hover {
                background: #f5f5f5;
                color: #333;
            }
            
            .coupon-modal-body {
                padding: 25px;
            }
            
            .coupon-list {
                display: grid;
                gap: 20px;
            }
            
            .coupon-card {
                border: 2px solid #4CAF50;
                border-radius: 10px;
                padding: 20px;
                transition: all 0.3s;
                background: #f9fff9;
                position: relative;
                overflow: hidden;
            }
            
            .coupon-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 25px rgba(76, 175, 80, 0.15);
                border-color: #388e3c;
            }
            
            .coupon-card::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #4CAF50, #8BC34A);
            }
            
            .coupon-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .coupon-code {
                font-weight: 700;
                font-size: 1.3rem;
                color: #2E7D32;
                letter-spacing: 1px;
            }
            
            .coupon-discount {
                background: linear-gradient(135deg, #4CAF50, #8BC34A);
                color: white;
                padding: 8px 15px;
                border-radius: 20px;
                font-weight: 700;
                font-size: 0.9rem;
            }
            
            .coupon-desc {
                color: #555;
                margin-bottom: 15px;
                line-height: 1.5;
            }
            
            .coupon-terms {
                font-size: 0.85rem;
                color: #666;
                margin-bottom: 20px;
                background: #f8f9fa;
                padding: 12px;
                border-radius: 6px;
            }
            
            .coupon-terms p {
                margin: 6px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .coupon-terms i {
                color: #4CAF50;
                width: 16px;
            }
            
            .coupon-footer {
                display: flex;
                justify-content: flex-end;
            }
            
            .btn-select-coupon {
                background: linear-gradient(135deg, #4CAF50, #8BC34A);
                color: white;
                border: none;
                padding: 10px 25px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.9rem;
                transition: all 0.3s;
            }
            
            .btn-select-coupon:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            }
            
            .no-coupons {
                text-align: center;
                padding: 40px 20px;
                color: #666;
            }
            
            .no-coupons i {
                font-size: 3rem;
                margin-bottom: 15px;
                color: #ddd;
            }
            
            .no-coupons p {
                margin: 10px 0;
                font-size: 1.1rem;
            }
            
            .empty-subtext {
                color: #888;
                font-size: 0.9rem;
            }
            
            .coupon-modal-footer {
                padding: 15px 25px;
                border-top: 1px solid #eee;
                background: #f9f9f9;
                text-align: center;
                font-weight: 600;
                color: #4CAF50;
            }
            
            .coupon-modal-footer p {
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { 
                    opacity: 0;
                    transform: translateY(20px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .coupon-code-uppercase {
                text-transform: uppercase;
            }
        `;
        document.head.appendChild(style);
    }
}

// Close Coupon Modal
function closeCouponModal() {
    const modal = document.getElementById('couponModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// Close modal when clicking outside
function closeCouponModalOnOverlay(event) {
    if (event.target.id === 'couponModal') {
        closeCouponModal();
    }
}

// Select Coupon from Modal
function selectCoupon(couponCode) {
    const couponInput = document.getElementById('couponCode');
    if (couponInput) {
        couponInput.value = couponCode;
        closeCouponModal();
        applyCoupon();
    }
}

// Toast Notification
function showToast(message, type = 'info') {
    const backgroundColor = type === 'success' ? '#4CAF50' : 
                          type === 'error' ? '#f44336' : 
                          type === 'warning' ? '#ff9800' : '#2196F3';
    
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: backgroundColor,
        stopOnFocus: true,
        style: {
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '500'
        }
    }).showToast();
}

// Attach Event Listeners
function attachCouponEventListeners() {
    const couponInput = document.getElementById('couponCode');
    
    if (couponInput) {
        // Auto-uppercase on input
        couponInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
        
        // Also on blur (when user leaves the field)
        couponInput.addEventListener('blur', function() {
            this.value = this.value.toUpperCase();
        });
        
        // Enter key support
        couponInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (this.readOnly) {
                    removeCoupon();
                } else {
                    applyCoupon();
                }
            }
        });
    }
}

// Initialize Coupon Functions
document.addEventListener('DOMContentLoaded', function() {
    attachCouponEventListeners();
    
    // Add CSS class for coupon input
    const couponInput = document.getElementById('couponCode');
    if (couponInput) {
        couponInput.classList.add('coupon-code-uppercase');
    }
});

// Make functions globally available
window.applyCoupon = applyCoupon;
window.removeCoupon = removeCoupon;
window.openAvailableCouponsModal = openAvailableCouponsModal;
window.closeCouponModal = closeCouponModal;
window.closeCouponModalOnOverlay = closeCouponModalOnOverlay;
window.selectCoupon = selectCoupon;