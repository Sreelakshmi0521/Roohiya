document.addEventListener('DOMContentLoaded', function() {
   
    const mainImage = document.getElementById('main-product-image');
    const zoomContainer = document.getElementById('zoom-container');
    
    if (mainImage && zoomContainer) {
        zoomContainer.addEventListener('click', function() {
            this.classList.toggle('zoomed');
        });
        
        
        document.addEventListener('click', function(e) {
            if (!zoomContainer.contains(e.target) && zoomContainer.classList.contains('zoomed')) {
                zoomContainer.classList.remove('zoomed');
            }
        });
    }
    
    
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            const newImageSrc = this.getAttribute('data-image');
            
            
            mainImage.src = newImageSrc;
    
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            if (zoomContainer) {
                zoomContainer.classList.remove('zoomed');
            }
        });
    });
    
    // Variant Selection
    const variantOptions = document.querySelectorAll('.variant-option:not(.out-of-stock)');
    variantOptions.forEach(option => {
        option.addEventListener('click', function() {
            const variantId = this.getAttribute('data-variant-id');
            if (variantId) {
                window.location.href = `${window.location.pathname}?variant=${variantId}`;
            }
        });
    });
    
    // Quantity Selector
    const minusBtn = document.querySelector('.minus-btn');
    const plusBtn = document.querySelector('.plus-btn');
    const quantityInput = document.querySelector('.quantity-input');
    
    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', function() {
            if (!this.disabled) {
                const currentValue = parseInt(quantityInput.value);
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                }
            }
        });
        
        plusBtn.addEventListener('click', function() {
            if (!this.disabled) {
                const currentValue = parseInt(quantityInput.value);
                const maxStock = parseInt(quantityInput.getAttribute('max'));
                if (currentValue < maxStock) {
                    quantityInput.value = currentValue + 1;
                }
            }
        });
        
        quantityInput.addEventListener('change', function() {
            const value = parseInt(this.value);
            const maxStock = parseInt(this.getAttribute('max'));
            const minStock = parseInt(this.getAttribute('min'));
            
            if (isNaN(value) || value < minStock) {
                this.value = minStock;
            } else if (value > maxStock) {
                this.value = maxStock;
            }
        });
    }
    
    // Out of Stock Alert
    const outOfStockBtn = document.querySelector('.add-to-cart-btn.disabled');
    if (outOfStockBtn) {
        outOfStockBtn.addEventListener('click', function(e) {
            e.preventDefault();
            Swal.fire({
                title: 'Out of Stock',
                text: 'This product is currently out of stock. Please check back later.',
                icon: 'info',
                confirmButtonText: 'OK',
                confirmButtonColor: '#6c757d'
            });
        });
    }
    
    // Image Load Error Handler
    const productImages = document.querySelectorAll('img');
    productImages.forEach(img => {
        img.addEventListener('error', function() {
            this.src = '/images/placeholder.jpg';
        });
    });

    
    
    
});

