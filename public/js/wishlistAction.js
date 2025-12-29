axios.defaults.withCredentials = true;

document.addEventListener('DOMContentLoaded', () => {
  const wishlistCountEl = document.getElementById('wishlistCount');
  const cartCountEl = document.getElementById('cartCount'); 
  const populatedSection = document.querySelector('.populated-wishlist');

  // Helper: Remove item with smooth fade animation
  const removeItemFromUI = (itemElement, newWishlistCount) => {
    itemElement.style.transition = 'opacity 0.5s ease';
    itemElement.style.opacity = '0';

    setTimeout(() => {
      itemElement.remove();

      // Update wishlist count
      if (wishlistCountEl) {
        wishlistCountEl.textContent = newWishlistCount;
        wishlistCountEl.style.display = newWishlistCount > 0 ? 'flex' : 'none';
      }

      // Show empty state if no items left
      if (document.querySelectorAll('.wishlist-item').length === 0) {
        populatedSection.innerHTML = `
          <section class="empty-state" style="margin-top: 60px; padding: 60px 20px; text-align: center;">
            <svg class="heart-icon" width="100" height="100" viewBox="0 0 100 100">
              <path d="M50 85 C50 85 20 65 20 40 Q20 25 30 20 Q40 15 50 25 Q60 15 70 20 Q80 25 80 40 C80 65 50 85 50 85 Z"
                    stroke="#a50101" stroke-width="3" fill="none" />
            </svg>
            <h2>Your wishlist is empty</h2>
            <p>Save your favorite jewelry pieces here for later!</p>
            <a href="/user/shop" class="btn btn-secondary">Start Shopping</a>
          </section>
        `;
      }
    }, 500);
  };

  // ========= MOVE TO CART =========
  document.querySelectorAll('.btn-move-to-cart').forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      if (button.classList.contains('disabled')) {
        Toastify({
          text: "This item is unavailable",
          backgroundColor: "#e74c3c",
          duration: 3000,
          gravity: "top",
          position: "right",
          offset: { x: 20, y: 80 }
        }).showToast();
        return;
      }

      const productId = button.dataset.productId;
      const variantId = button.dataset.variantId;
      const itemElement = button.closest('.wishlist-item');

      try {
        const response = await axios.post('/user/wishlist/moveToCart', {
          productId,
          productVariantId: variantId
        });

        const result = response.data;

        if (result.success) {
          // Calculate new wishlist count
          const currentWishlistCount = parseInt(wishlistCountEl?.textContent || '1');
          const newWishlistCount = result.wishlistCount !== undefined 
            ? result.wishlistCount 
            : currentWishlistCount - 1;

          // Update cart count instantly
          if (cartCountEl && result.cartCount !== undefined) {
            cartCountEl.textContent = result.cartCount;
            cartCountEl.style.display = result.cartCount > 0 ? 'flex' : 'none';
          }

          // Remove from UI
          removeItemFromUI(itemElement, newWishlistCount);

          Toastify({
            text: "Moved to cart successfully! 🛒",
            backgroundColor: "#28a745",
            duration: 3000,
            gravity: "top",
            position: "right",
            offset: { x: 20, y: 80 }
          }).showToast();
        }
      } catch (error) {
        console.error("Move to cart error:", error);
        Toastify({
          text: error.response?.data?.message || "Failed to move to cart",
          backgroundColor: "#e74c3c",
          duration: 4000,
          gravity: "top",
          position: "right",
          offset: { x: 20, y: 80 }
        }).showToast();
      }
    });
  });

  // ========= REMOVE FROM WISHLIST =========
  document.querySelectorAll('.btn-remove').forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();

      const productId = button.dataset.productId;
      const variantId = button.dataset.variantId;
      const itemElement = button.closest('.wishlist-item');

      try {
        const response = await axios.post('/user/wishlist/remove', {
          productId,
          productVariantId: variantId
        });

        const result = response.data;

        if (result.success) {
          const currentCount = parseInt(wishlistCountEl?.textContent || '1');
          const newCount = result.wishlistCount !== undefined 
            ? result.wishlistCount 
            : currentCount - 1;

          removeItemFromUI(itemElement, newCount);

          Toastify({
            text: "Removed from wishlist",
            backgroundColor: "#6c757d",
            duration: 3000,
            gravity: "top",
            position: "right",
            offset: { x: 20, y: 80 }
          }).showToast();
        }
      } catch (error) {
        Toastify({
          text: "Failed to remove item",
          backgroundColor: "#e74c3c",
          duration: 4000,
          gravity: "top",
          position: "right",
          offset: { x: 20, y: 80 }
        }).showToast();
      }
    });
  });
});