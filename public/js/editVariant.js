document.addEventListener("DOMContentLoaded", function () {
    const imageUploads = document.querySelectorAll(".image-upload");
    const fileInputs = document.querySelectorAll(".file-input");
    const modal = document.getElementById("cropModal");
    const cropImage = document.getElementById("cropImage");
    const closeModal = document.querySelector(".close");
    const cancelCrop = document.getElementById("cancelCrop");
    const applyCrop = document.getElementById("applyCrop");
    const form = document.getElementById("editVariantForm");
    const saveBtn = document.getElementById("saveVariantBtn");
    const btnText = saveBtn?.querySelector(".btn-text");
    const btnSpinner = saveBtn?.querySelector(".btn-spinner");

    let currentUploadElement = null;
    let cropper = null;
    let currentFile = null;

    // ========================
    // Image Cropping & Replacement Logic
    // ========================
    imageUploads.forEach((upload, index) => {
        const fileInput = fileInputs[index];
        const placeholder = upload.querySelector(".upload-placeholder");
        const previewContainer = upload.querySelector(".image-preview-container");
        const previewImg = upload.querySelector(".image-preview");
        const deleteBtn = upload.querySelector(".delete-image-btn");
        const browseBtn = upload.querySelector(".upload-btn");

        // Click on preview container (but not delete button) to replace image
        previewContainer.addEventListener("click", (e) => {
            if (e.target.closest(".delete-image-btn")) return; // Ignore if clicking delete
            fileInput.click();
        });

        // Click on placeholder browse button
        if (browseBtn) {
            browseBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                fileInput.click();
            });
        }

        // When file is selected → open cropper
        fileInput.addEventListener("change", function (e) {
            const file = e.target.files[0];
            if (!file) return;

            currentFile = file;
            currentUploadElement = upload;

            const reader = new FileReader();
            reader.onload = function (ev) {
                cropImage.src = ev.target.result;
                modal.classList.add("show");

                if (cropper) cropper.destroy();

                cropper = new Cropper(cropImage, {
                    aspectRatio: 1,
                    viewMode: 1,
                    autoCropArea: 0.8,
                    responsive: true
                });
            };
            reader.readAsDataURL(file);
        });

        // === DELETE BUTTON: Remove new image, show placeholder ===
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent triggering preview click

            // Clear file input
            fileInput.value = "";

            // Hide preview, show placeholder
            previewContainer.classList.add("hidden");
            placeholder.classList.remove("hidden");

            // Optional: Reset preview src to original (if you want to show original again)
            // previewImg.src = variant.images[index]; // You can store original in data-attr if needed
        });
    });

    // Modal Controls
    closeModal.onclick = cancelCrop.onclick = () => {
        modal.classList.remove("show");
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    };

    applyCrop.onclick = () => {
        if (!cropper || !currentUploadElement) return;

        cropper.getCroppedCanvas({ width: 800 }).toBlob((blob) => {
            const previewImg = currentUploadElement.querySelector(".image-preview");
            const placeholder = currentUploadElement.querySelector(".upload-placeholder");
            const previewContainer = currentUploadElement.querySelector(".image-preview-container");

            previewImg.src = URL.createObjectURL(blob);
            previewContainer.classList.remove("hidden");
            placeholder.classList.add("hidden");

            const fileInput = currentUploadElement.querySelector(".file-input");
            const croppedFile = new File([blob], currentFile.name, { type: currentFile.type || "image/jpeg" });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(croppedFile);
            fileInput.files = dataTransfer.files;

            modal.classList.remove("show");
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
        }, "image/jpeg", 0.95);
    };

    window.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove("show");
            if (cropper) cropper.destroy();
        }
    };

    // ========================
    // Validation Functions (same as before)
    // ========================
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + "-error");
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = "block";
        }
        if (field) field.classList.add("is-invalid");
    }

    function clearError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + "-error");
        if (errorElement) {
            errorElement.textContent = "";
            errorElement.style.display = "none";
        }
        if (field) field.classList.remove("is-invalid");
    }

    function validateDiscountedPrice() {
        const discountedInput = document.getElementById("discountedPrice");
        const priceInput = document.getElementById("price");
        const discounted = parseFloat(discountedInput.value);
        const price = parseFloat(priceInput.value);

        clearError("discountedPrice");

        if (discountedInput.value !== "" && !isNaN(discounted)) {
            if (discounted >= price || isNaN(price)) {
                showError("discountedPrice", "Discounted price must be less than original price");
            } else if (discounted < 0) {
                showError("discountedPrice", "Discounted price cannot be negative");
            }
        }
    }

    // Real-time validation (same as addVariant)
    document.getElementById("color").addEventListener("input", function () {
        const value = this.value.trim();
        const hasLetter = /[a-zA-Z]/.test(value);
        const isOnlyNumbers = /^\d+$/.test(value);
        const startsAndEndsWithLetter = /^[a-z].*[a-z]$/i.test(value);

        if (value === "") {
            showError("color", "Color is required");
        } else if (isOnlyNumbers) {
            showError("color", "Color cannot be just numbers. Use names like 'Red', 'Black'");
        } else if (!hasLetter) {
            showError("color", "Color must contain at least one letter");
        } else if (!startsAndEndsWithLetter && value.length > 1) {
            showError("color", "Invalid color name. Use words like 'Red', 'Dark Blue'");
        } else {
            clearError("color");
        }
    });

    document.getElementById("price").addEventListener("input", function () {
        const value = parseFloat(this.value);
        if (this.value === "" || isNaN(value)) {
            showError("price", "Price is required");
        } else if (value < 0) {
            showError("price", "Price cannot be negative");
        } else {
            clearError("price");
            validateDiscountedPrice();
        }
    });

    document.getElementById("stock").addEventListener("input", function () {
        const value = parseInt(this.value);
        if (this.value === "" || isNaN(value)) {
            showError("stock", "Stock is required");
        } else if (value < 0) {
            showError("stock", "Stock cannot be negative");
        } else {
            clearError("stock");
        }
    });

    document.getElementById("discountedPrice").addEventListener("input", validateDiscountedPrice);

    ["color", "price", "stock", "discountedPrice"].forEach(id => {
        document.getElementById(id).addEventListener("blur", function () {
            if (id === "discountedPrice") validateDiscountedPrice();
            else this.dispatchEvent(new Event("input"));
        });
    });

    // ========================
    // Submit Handler
    // ========================
    form.addEventListener("submit", function (e) {
        let hasError = false;

        if (document.getElementById("color").value.trim() === "") {
            showError("color", "Color is required");
            hasError = true;
        }
        const priceVal = parseFloat(document.getElementById("price").value);
        if (isNaN(priceVal) || priceVal < 0) {
            showError("price", "Valid price is required");
            hasError = true;
        }
        const stockVal = parseInt(document.getElementById("stock").value);
        if (isNaN(stockVal) || stockVal < 0) {
            showError("stock", "Valid stock is required");
            hasError = true;
        }

        validateDiscountedPrice();

        if (hasError) {
            e.preventDefault();
            return;
        }

        if (saveBtn) {
            saveBtn.disabled = true;
            if (btnText) btnText.classList.add("hidden");
            if (btnSpinner) btnSpinner.classList.remove("hidden");
        }
    });
});