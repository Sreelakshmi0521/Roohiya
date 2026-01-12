// /public/js/wishlist.js - SIMPLIFIED WORKING VERSION

// Make showToast function globally available
window.showToast = function(title, message, type = 'info') {
  console.log('showToast called:', { title, message, type });
  
  // Remove existing toasts
  const existingToasts = document.querySelectorAll('.custom-toast-container');
  existingToasts.forEach(toast => toast.remove());
  
  // Colors based on type
  const colors = {
    success: { bg: '#d1fae5', text: '#065f46', border: '#10b981', icon: 'bi-check-circle-fill' },
    error: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444', icon: 'bi-exclamation-circle-fill' },
    warning: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b', icon: 'bi-exclamation-triangle-fill' },
    info: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6', icon: 'bi-info-circle-fill' }
  };
  
  const colorSet = colors[type] || colors.success;
  
  // Create toast container
  const toastContainer = document.createElement('div');
  toastContainer.className = 'custom-toast-container';
  toastContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 99999;
    min-width: 350px;
    max-width: 400px;
    animation: slideInRight 0.3s ease;
  `;
  
  // Create toast HTML
  toastContainer.innerHTML = `
    <div class="custom-toast" style="
      background: white;
      border-left: 4px solid ${colorSet.border};
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 12px;
    ">
      <i class="bi ${colorSet.icon}" style="color: ${colorSet.border}; font-size: 1.25rem;"></i>
      <div style="flex: 1;">
        <strong style="display: block; color: ${colorSet.text}; font-weight: 600;">${title}</strong>
        <div style="color: #6b7280; font-size: 0.875rem; margin-top: 4px;">${message}</div>
      </div>
      <button type="button" class="toast-close" style="
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        color: #9ca3af;
        opacity: 0.7;
        padding: 0;
        line-height: 1;
      ">&times;</button>
    </div>
  `;
  
  document.body.appendChild(toastContainer);
  
  // Add close functionality
  const closeBtn = toastContainer.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    toastContainer.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      if (toastContainer.parentNode) toastContainer.remove();
    }, 300);
  });
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (toastContainer.parentNode) {
      toastContainer.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (toastContainer.parentNode) toastContainer.remove();
      }, 300);
    }
  }, 3000);
  
  // Add animation CSS if not present
  if (!document.querySelector('#toast-animation')) {
    const style = document.createElement('style');
    style.id = 'toast-animation';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// Initialize Axios
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Prevent duplicate event listeners
if (window.wishlistListenerAttached) {
  console.log("Wishlist script already loaded — skipping");
} else {
  window.wishlistListenerAttached = true;

  // Event delegation for wishlist buttons
  document.addEventListener('click', async function (e) {
    const btn = e.target.closest('.wishlist-btn');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    // Check if user is logged in
    const isLoggedIn = btn.getAttribute('data-logged-in') === 'true';

    if (!isLoggedIn) {
      // SweetAlert2 for login prompt
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to manage your wishlist ❤️',
        confirmButtonText: 'Login Now',
        confirmButtonColor: '#d4af37',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        allowOutsideClick: false,
        allowEscapeKey: false,
        focusConfirm: true
      });

      if (result.isConfirmed) {
        window.location.href = '/user/login';
      }
      return;
    }

    // Get product details
    const productId = btn.getAttribute('data-product-id');
    const variantId = btn.getAttribute('data-variant-id');
    const productName = btn.getAttribute('data-product-name') || 'Product';
    const icon = btn.querySelector('i');

    // Validate variant
    if (!variantId || variantId === '') {
      showToast('Warning', 'No variant available for this product', 'warning');
      return;
    }

    try {
      // Send request to server
      const response = await axios.post('/user/wishlist/add', {
        productId,
        productVariantId: variantId
      });

      const result = response.data;

      if (result.success) {
        const isNowAdded = result.added;

        // Update button appearance
        if (isNowAdded) {
          btn.classList.add('added');
          icon.classList.remove('far');
          icon.classList.add('fas');
          icon.style.color = '#ef4444'; // Red for filled heart
          
          // Add animation
          icon.style.transform = 'scale(1.3)';
          setTimeout(() => {
            icon.style.transform = 'scale(1)';
          }, 300);
        } else {
          btn.classList.remove('added');
          icon.classList.remove('fas');
          icon.classList.add('far');
          icon.style.color = '#6b7280'; // Gray for empty heart
        }

        // Show success message
        const message = isNowAdded 
          ? `${productName} added to wishlist ❤️`
          : `${productName} removed from wishlist`;
        
        showToast('Success', message, 'success');

        // Update wishlist count in navbar
        const countEl = document.getElementById('wishlistCount');
        if (countEl && result.wishlistCount !== undefined) {
          countEl.textContent = result.wishlistCount;
          countEl.style.display = result.wishlistCount > 0 ? 'flex' : 'none';
        }
      } else {
        // Backend returned error
        showToast('Error', result.message || 'Failed to update wishlist', 'error');
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      const errorMsg = error.response?.data?.message || 'Network error. Please try again.';
      showToast('Error', errorMsg, 'error');
    }
  });
  
  console.log('Wishlist script initialized successfully');
}