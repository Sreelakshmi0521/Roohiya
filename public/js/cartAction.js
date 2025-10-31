document.addEventListener("DOMContentLoaded", async () => {
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");

  // 🟢 1️⃣ Fetch user's cart items if logged in
  let userCartItems = [];
  try {
    const res = await axios.get("/user/cart/items");
    if (res.data.success && Array.isArray(res.data.items)) {
      userCartItems = res.data.items;
    }
  } catch (err) {
    // User not logged in or no cart
    userCartItems = [];
  }

  // 🟢 2️⃣ Loop through all add-to-cart buttons
  addToCartButtons.forEach((btn) => {
    const productId = btn.dataset.productId;
    const variantId = btn.dataset.variantId;

    // Check if already in cart
    const isInCart = userCartItems.some(
      (item) => item.productId === productId && item.productVariantId === variantId
    );
    if (isInCart) {
      btn.innerHTML = `<i class="fas fa-shopping-cart"></i> Go to Cart`;
      btn.classList.add("go-to-cart");
    }

    // 🟢 3️⃣ Click event
    btn.addEventListener("click", async () => {
      // If unavailable, do nothing
      if (btn.classList.contains("disabled")) return;

      // If already in cart → go to cart directly
      if (btn.classList.contains("go-to-cart")) {
        window.location.href = "/user/cart";
        return;
      }

      // Loading spinner
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Adding...`;

      try {
        const response = await axios.post("/user/cart/add", {
          productId,
          variantId,
          quantity: 1,
        });

        if (response.data.success) {
          Toastify({
            text: "Product added to cart successfully!",
            duration: 2000,
            gravity: "top",
            position: "right",
            backgroundColor: "#4BB543",
          }).showToast();

          btn.innerHTML = `<i class="fas fa-shopping-cart"></i> Go to Cart`;
          btn.classList.add("go-to-cart");

          setTimeout(() => {
            window.location.href = "/user/cart";
          }, 1200);
        } else {
          throw new Error(response.data.message || "Something went wrong");
        }
      } catch (error) {
        console.error("Add to cart error:", error);

        let message = "Something went wrong!";
        const data = error.response?.data;
        const status = error.response?.status;

        // 🚨 Case 1: Not logged in
        if (status === 401 || data?.message?.includes("login")) {
          message = "Please login first!";
          Toastify({
            text: message,
            duration: 2000,
            gravity: "top",
            position: "right",
            backgroundColor: "#ff4b4b",
          }).showToast();

          setTimeout(() => {
            window.location.href = "/user/login";
          }, 1000);
          return;
        }

        // 🚨 Case 2: Product unavailable
        if (data?.message?.includes("unavailable") || data?.message?.includes("category")) {
          message = "This product is unavailable.";
          btn.innerHTML = `<i class="fas fa-ban"></i> Unavailable`;
          btn.classList.add("disabled");
          btn.disabled = true;
        }
        // 🚨 Case 3: Out of stock
        else if (data?.message?.includes("out of stock")) {
          message = "Product is out of stock.";
          btn.innerHTML = `<i class="fas fa-ban"></i> Out of Stock`;
          btn.classList.add("disabled");
          btn.disabled = true;
        }
        // 🚨 Other errors
        else if (data?.message) {
          message = data.message;
        } else if (!error.response) {
          message = "Unable to reach server. Please try again!";
        }

        Toastify({
          text: message,
          duration: 2500,
          gravity: "top",
          position: "right",
          backgroundColor: "#ff4b4b",
        }).showToast();

        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    });
  });
});
