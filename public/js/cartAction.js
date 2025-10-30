document.addEventListener("DOMContentLoaded", () => {
  const cartButtons = document.querySelectorAll(".add-to-cart-btn");
  const shopNowButtons = document.querySelectorAll(".shop-now-btn");

  // ✅ Check cart items only for Add-to-Cart buttons
  checkCartItems();

  // 🛒 Handle Add to Cart buttons (main product)
  cartButtons.forEach((btn) => {
    // Skip if it's a "Shop Now" button
    if (btn.classList.contains("shop-now-btn")) return;

    btn.addEventListener("click", async () => {
      const productId = btn.dataset.productId;
      const variantId = btn.dataset.variantId;

      if (btn.classList.contains("go-to-cart")) {
        window.location.href = "/user/cart";
        return;
      }

      btn.disabled = true;
      const originalText = btn.innerHTML;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Adding...`;

      try {
        const response = await axios.post("/user/cart/add", {
          productId,
          variantId,
          quantity: 1,
        });

        if (response.data.success) {
          btn.innerHTML = `<i class="fas fa-shopping-cart"></i> Go to Cart`;
          btn.classList.add("go-to-cart");

          Toastify({
            text: "Added to cart successfully!",
            duration: 2000,
            gravity: "top",
            position: "right",
            backgroundColor: "#4BB543",
          }).showToast();

          setTimeout(() => {
            window.location.href = "/user/cart";
          }, 800);
        } else {
          btn.innerHTML = originalText;
          Toastify({
            text: response.data.message || "Please login to continue!",
            duration: 1500,
            gravity: "top",
            position: "right",
            backgroundColor: "#ff4b4b",
          }).showToast();

          setTimeout(() => {
            window.location.href = "/user/login";
          }, 1000);
        }
      } catch (error) {
        console.error("Add to cart error:", error);

        Toastify({
          text: "Please login to continue!",
          duration: 1500,
          gravity: "top",
          position: "right",
          backgroundColor: "#ff4b4b",
        }).showToast();

        setTimeout(() => {
          window.location.href = "/user/login";
        }, 1000);
      } finally {
        btn.disabled = false;
      }
    });
  });

  // 🏬 Handle "Shop Now" buttons (related products)
  shopNowButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = "/user/shop";
    });
  });
});

// ✅ Check items already in the cart
async function checkCartItems() {
  try {
    const res = await axios.get("/user/cart/items");
    if (res.data.success && res.data.items.length) {
      const cartItems = res.data.items;
      document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
        const productId = btn.dataset.productId;
        const variantId = btn.dataset.variantId;
        const isInCart = cartItems.some(
          (item) =>
            item.productId === productId &&
            (!variantId || item.productVariantId === variantId)
        );
        if (isInCart) {
          btn.innerHTML = `<i class="fas fa-shopping-cart"></i> Go to Cart`;
          btn.classList.add("go-to-cart");
        }
      });
    }
  } catch (err) {
    console.log("User not logged in — skipping cart item check.");
  }
}
