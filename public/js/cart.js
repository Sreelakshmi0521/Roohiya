document.addEventListener("DOMContentLoaded", () => {
  const removeButtons = document.querySelectorAll(".remove-btn");
  const deleteModal = document.getElementById("deleteModal");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

  let selectedProductId = null;
  let selectedVariantId = null;
  let selectedButton = null;

  // Function to open modal
  function openDeleteModal(productId, variantId, btn) {
    selectedProductId = productId;
    selectedVariantId = variantId;
    selectedButton = btn;
    deleteModal.classList.add("show");
  }

  // Function to close modal
  window.closeDeleteModal = function () {
    deleteModal.classList.remove("show");
    selectedProductId = null;
    selectedVariantId = null;
    selectedButton = null;
  };

  // When user clicks any remove button
  removeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = btn.dataset.productId;
      const variantId = btn.dataset.variantId;
      openDeleteModal(productId, variantId, btn);
    });
  });

  // Confirm delete
  confirmDeleteBtn.addEventListener("click", async () => {
    if (!selectedProductId || !selectedVariantId) return;

    const btn = selectedButton;
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;

    try {
      const response = await axios.delete("/user/cart/remove", {
        data: { productId: selectedProductId, variantId: selectedVariantId },
      });

      if (response.data.success) {
        Toastify({
          text: response.data.message,
          duration: 2000,
          gravity: "top",
          position: "right",
          backgroundColor: "#4BB543",
        }).showToast();

        const itemRow = btn.closest(".cart-item");
        itemRow.classList.add("fade-out");
        setTimeout(() => itemRow.remove(), 300);
        setTimeout(() => window.location.reload(), 500);
      } else {
        Toastify({
          text: response.data.message || "Unable to remove item",
          duration: 2000,
          gravity: "top",
          position: "right",
          backgroundColor: "#ff4b4b",
        }).showToast();
      }
    } catch (error) {
      console.error("Remove from cart error:", error);
      Toastify({
        text: "Something went wrong!",
        duration: 2000,
        gravity: "top",
        position: "right",
        backgroundColor: "#ff4b4b",
      }).showToast();
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-trash"></i>`;
      closeDeleteModal();
    }
  });
});
