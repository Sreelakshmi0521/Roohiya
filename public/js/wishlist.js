// /public/js/wishlist.js

axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Prevent duplicate event listeners if script is loaded multiple times
if (window.wishlistListenerAttached) {
  console.log("Wishlist script already loaded — skipping");
} else {
  window.wishlistListenerAttached = true;

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
        confirmButtonColor: '#d4af37', // Gold theme
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        allowOutsideClick: false,
        allowEscapeKey: false,
        focusConfirm: true
      });

      if (result.isConfirmed) {
        window.location.href = '/user/login'; // Change to /user/signup if needed
      }

      return;
    }

    // ========== LOGGED-IN USER LOGIC ==========

    const productId = btn.getAttribute('data-product-id');
    const variantId = btn.getAttribute('data-variant-id');
    const productName = btn.getAttribute('data-product-name') || 'Product';
    const icon = btn.querySelector('i');

    // No variant selected
    if (!variantId || variantId === '') {
      Toastify({
        text: "No variant available for this product",
        backgroundColor: "#e74c3c",
        duration: 3000,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        offset: {
          x: 20,  // distance from right edge
          y: 80   // distance from top — clears navbar counts
        }
      }).showToast();
      return;
    }

    try {
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
        } else {
          btn.classList.remove('added');
        }

        icon.classList.toggle('far', !isNowAdded);
        icon.classList.toggle('fas', isNowAdded);

        // Success message with Toastify (now below navbar)
        Toastify({
          text: isNowAdded
            ? `${productName} added to wishlist ❤️`
            : `${productName} removed from wishlist`,
          backgroundColor: isNowAdded ? "rgba(254, 110, 110, 1)" : "#95a5a6",
          duration: 3000,
          gravity: "top",
          position: "right",
          stopOnFocus: true,
          offset: {
            x: 20,
            y: 80
          }
        }).showToast();

        // Update wishlist count in navbar
        const countEl = document.getElementById('wishlistCount');
        if (countEl && result.wishlistCount !== undefined) {
          countEl.textContent = result.wishlistCount;
          countEl.style.display = result.wishlistCount > 0 ? 'flex' : 'none';
        }
      } else {
        // Backend returned error
        Toastify({
          text: result.message || "Failed to update wishlist",
          backgroundColor: "#e74c3c",
          duration: 4000,
          gravity: "top",
          position: "right",
          stopOnFocus: true,
          offset: {
            x: 20,
            y: 80
          }
        }).showToast();
      }
    } catch (error) {
      console.error("Wishlist error:", error);

      Toastify({
        text: error.response?.data?.message || "Network error. Please try again.",
        backgroundColor: "#e74c3c",
        duration: 4000,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        offset: {
          x: 20,
          y: 80
        }
      }).showToast();
    }
  });
}