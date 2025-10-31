document.addEventListener("DOMContentLoaded", () => {
  const quantityButtons = document.querySelectorAll(".quantity-btn")

  quantityButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const productId = btn.dataset.productId
      const variantId = btn.dataset.variantId
      const isIncrement = btn.classList.contains("plus")
      const action = isIncrement ? "increment" : "decrement"

      const parentRow = btn.closest(".cart-item")
      const input = parentRow.querySelector(".quantity-input")
      const itemTotalEl = parentRow.querySelector(".item-total")
      const priceEl = parentRow.querySelector(".discounted-price, .current-price")
      const price = parseFloat((priceEl?.textContent || "0").replace(/[^0-9.-]+/g, "")) || 0
      const subtotalEl = document.querySelector(".subtotal")
      const taxEl = document.querySelector(".tax")
      const totalEl = document.querySelector(".total-amount")

      const currentQuantity = parseInt(input.value, 10)
      const stock = parseInt(input.dataset.stock || "0", 10)

      // small client guard to avoid useless calls
      if (isIncrement && currentQuantity >= 10) {
        Toastify({ text: "Max 10 items allowed", duration: 2000, gravity: "top", position: "right", backgroundColor: "#ff4b4b" }).showToast()
        return
      }
      if (isIncrement && currentQuantity >= stock) {
        Toastify({ text: `Only ${stock} items available`, duration: 2000, gravity: "top", position: "right", backgroundColor: "#ff4b4b" }).showToast()
        return
      }
      if (!isIncrement && currentQuantity <= 1) {
        Toastify({ text: "Minimum quantity is 1", duration: 1200, gravity: "top", position: "right", backgroundColor: "#ff4b4b" }).showToast()
        return
      }

      btn.disabled = true
      try {
        const res = await axios.patch("/user/cart/updateQuantity", { productId, variantId, action })
        if (res.data.success) {
          const { quantity, subtotal, tax, total, remainingStock } = res.data

          // update UI
          input.value = quantity
          itemTotalEl.textContent = `₹${(price * quantity).toFixed(2)}`

          // update stock dataset & text if present
          input.dataset.stock = remainingStock
          const stockTextEl = parentRow.querySelector(".product-stock .in-stock")
          if (stockTextEl) {
            stockTextEl.textContent = `In Stock ${remainingStock} `
            // optionally if remainingStock == 0 mark out of stock
            if (remainingStock <= 0) {
              parentRow.classList.add("out-of-stock")
            } else {
              parentRow.classList.remove("out-of-stock")
            }
          }

          // update page totals
          if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`
          if (taxEl) taxEl.textContent = `₹${tax.toFixed(2)}`
          if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`

          // enable/disable buttons according to new values (good UX)
          const minusBtn = parentRow.querySelector(".quantity-btn.minus")
          const plusBtn = parentRow.querySelector(".quantity-btn.plus")

          minusBtn.disabled = quantity <= 1
          plusBtn.disabled = quantity >= 10 || quantity >= remainingStock

          Toastify({ text: "Quantity updated", duration: 1200, gravity: "top", position: "right", backgroundColor: "#4BB543" }).showToast()
        } else {
          Toastify({ text: res.data.message || "Update failed", duration: 2000, gravity: "top", position: "right", backgroundColor: "#ff4b4b" }).showToast()
        }
      } catch (err) {
        console.error("Quantity update error:", err)
        Toastify({ text: err.response?.data?.message || "Something went wrong", duration: 2000, gravity: "top", position: "right", backgroundColor: "#ff4b4b" }).showToast()
      } finally {
        btn.disabled = false
      }
    })
  })
})
