document.addEventListener("DOMContentLoaded", function () {
    const variantModal = document.getElementById("variantModal");
    const addVariantBtn = document.getElementById("addVariantBtn");
    const closeBtns = document.querySelectorAll("#variantModal .close, #closeVariantModal");
    const saveVariantBtn = document.getElementById("saveVariantToList");
    const variantsContainer = document.getElementById("variantsContainer");
    const productForm = document.getElementById("productForm");
    const saveProductBtn = document.getElementById("saveProductBtn");

    const imageUploads = document.querySelectorAll("#modalVariantImages .image-upload");

    let currentUploadElement = null;
    let cropper = null;
    let currentFile = null;

    // Open/Close Modal
    addVariantBtn.onclick = () => {
        variantModal.classList.add("show");
        resetVariantModal();
    };

    closeBtns.forEach(btn => btn.onclick = () => variantModal.classList.remove("show"));
    window.onclick = (e) => {
        if (e.target === variantModal || e.target === document.getElementById("cropModal")) {
            variantModal.classList.remove("show");
            document.getElementById("cropModal").classList.remove("show");
            if (cropper) cropper.destroy();
        }
    };

    // Reset Modal
    function resetVariantModal() {
        document.getElementById("variantColor").value = "";
        document.getElementById("variantPrice").value = "";
        document.getElementById("variantDiscountedPrice").value = "";
        document.getElementById("variantStock").value = "";

        document.querySelectorAll("#variantModal .error-message").forEach(el => el.textContent = "");
        document.querySelectorAll("#variantModal .form-control").forEach(el => el.classList.remove("is-invalid"));

        imageUploads.forEach(upload => {
            const placeholder = upload.querySelector(".upload-placeholder");
            const preview = upload.querySelector(".image-preview-container");
            const input = upload.querySelector(".file-input");
            placeholder.classList.remove("hidden");
            preview.classList.add("hidden");
            input.value = "";
            upload.querySelector(".image-preview").src = "#";
        });
    }

    // Validation Functions
    function showError(id, message) {
        const el = document.getElementById(id + "-error");
        if (el) el.textContent = message;
        document.getElementById(id).classList.add("is-invalid");
    }

    function clearError(id) {
        const el = document.getElementById(id + "-error");
        if (el) el.textContent = "";
        document.getElementById(id).classList.remove("is-invalid");
    }

    // Real-time validation
    document.getElementById("variantColor").addEventListener("input", function () {
        const v = this.value.trim();
        if (!v) showError("variantColor", "Color is required");
        else if (/^\d+$/.test(v)) showError("variantColor", "Color cannot be numbers only");
        else if (!/[a-zA-Z]/.test(v)) showError("variantColor", "Color must contain letters");
        else clearError("variantColor");
    });

    document.getElementById("variantPrice").addEventListener("input", function () {
        const v = parseFloat(this.value);
        if (!this.value || v <= 0) showError("variantPrice", "Valid price required");
        else clearError("variantPrice");
    });

    document.getElementById("variantStock").addEventListener("input", function () {
        const v = parseInt(this.value);
        if (!this.value || v < 0) showError("variantStock", "Valid stock required");
        else clearError("variantStock");
    });

    document.getElementById("variantDiscountedPrice").addEventListener("input", function () {
        const discounted = parseFloat(this.value);
        const price = parseFloat(document.getElementById("variantPrice").value);
        clearError("variantDiscountedPrice");
        if (this.value && !isNaN(discounted)) {
            if (discounted <= 0) showError("variantDiscountedPrice", "Must be positive");
            else if (!isNaN(price) && discounted >= price) showError("variantDiscountedPrice", "Must be less than price");
        }
    });

    // Image Cropping
    imageUploads.forEach(upload => {
        const input = upload.querySelector(".file-input");
        const preview = upload.querySelector(".image-preview-container");
        const placeholder = upload.querySelector(".upload-placeholder");
        const deleteBtn = upload.querySelector(".delete-image-btn");

        preview.addEventListener("click", e => {
            if (e.target.closest(".delete-image-btn")) return;
            input.click();
        });
        placeholder.addEventListener("click", () => input.click());

        input.addEventListener("change", function (e) {
            const file = e.target.files[0];
            if (!file) return;
            currentFile = file;
            currentUploadElement = upload;

            const reader = new FileReader();
            reader.onload = ev => {
                document.getElementById("cropImage").src = ev.target.result;
                document.getElementById("cropModal").classList.add("show");
                if (cropper) cropper.destroy();
                cropper = new Cropper(document.getElementById("cropImage"), {
                    aspectRatio: 1,
                    viewMode: 1,
                    autoCropArea: 0.8,
                    responsive: true
                });
            };
            reader.readAsDataURL(file);
        });

        deleteBtn.addEventListener("click", e => {
            e.stopPropagation();
            input.value = "";
            preview.classList.add("hidden");
            placeholder.classList.remove("hidden");
        });
    });

    // Crop Controls
    document.querySelectorAll("#cropModal .close, #cancelCrop").forEach(el => el.onclick = () => {
        document.getElementById("cropModal").classList.remove("show");
        if (cropper) cropper.destroy();
    });

    document.getElementById("applyCrop").onclick = () => {
        if (!cropper || !currentUploadElement) return;

        cropper.getCroppedCanvas({ width: 800 }).toBlob(blob => {
            const previewImg = currentUploadElement.querySelector(".image-preview");
            const preview = currentUploadElement.querySelector(".image-preview-container");
            const placeholder = currentUploadElement.querySelector(".upload-placeholder");

            previewImg.src = URL.createObjectURL(blob);
            preview.classList.remove("hidden");
            placeholder.classList.add("hidden");

            const input = currentUploadElement.querySelector(".file-input");
            const croppedFile = new File([blob], currentFile.name, { type: currentFile.type || "image/jpeg" });
            const dt = new DataTransfer();
            dt.items.add(croppedFile);
            input.files = dt.files;

            document.getElementById("cropModal").classList.remove("show");
            if (cropper) cropper.destroy();
        }, "image/jpeg", 0.95);
    };

    // Add Variant to List (with file inputs cloned)
    saveVariantBtn.onclick = () => {
        let hasError = false;

        ["variantColor", "variantPrice", "variantStock", "variantDiscountedPrice"].forEach(id => {
            document.getElementById(id).dispatchEvent(new Event("input"));
        });
        document.querySelectorAll("#variantModal .is-invalid").forEach(() => hasError = true);

        let fileCount = 0;
        imageUploads.forEach(upload => {
            if (upload.querySelector(".file-input").files.length > 0) fileCount++;
        });

        if (fileCount !== 3) {
            Swal.fire({
                icon: "warning",
                title: "Images Required",
                text: "You must upload and crop exactly 3 images.",
                confirmButtonColor: "#2c3a4b"
            });
            hasError = true;
        }

        if (hasError) return;

        const color = document.getElementById("variantColor").value.trim();
        const price = document.getElementById("variantPrice").value;
        const discounted = document.getElementById("variantDiscountedPrice").value || "";
        const stock = document.getElementById("variantStock").value;

        const card = document.createElement("div");
        card.className = "variant-card p-4 border rounded mb-4 bg-white shadow-sm";

        // Hidden inputs for data and files
        let hiddenInputs = `<input type="hidden" name="variantDetails" value='${JSON.stringify({color, price, discountedPrice: discounted || null, stockLimit: stock})}'>`;
        imageUploads.forEach(upload => {
            const fileInput = upload.querySelector(".file-input");
            if (fileInput.files[0]) {
                const clonedInput = fileInput.cloneNode();
                clonedInput.name = "variantImages";
                hiddenInputs += clonedInput.outerHTML;
            }
        });

        card.innerHTML = `
            ${hiddenInputs}
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <strong>Color:</strong> ${color}<br>
                    <strong>Price:</strong> ₹${price} ${discounted ? `<del>₹${discounted}</del>` : ""}<br>
                    <strong>Stock:</strong> ${stock}
                </div>
                <div class="col-lg-5">
                    <div class="d-flex gap-3 flex-wrap">
                        ${Array.from(imageUploads).map(u => `
                            <img src="${u.querySelector(".image-preview").src}" class="img-thumbnail" style="width:90px;height:90px;object-fit:cover;border-radius:10px;">
                        `).join("")}
                    </div>
                </div>
                <div class="col-lg-1 text-end">
                    <button type="button" class="btn btn-danger btn-sm remove-variant">Remove</button>
                </div>
            </div>
        `;

        variantsContainer.appendChild(card);
        variantModal.classList.remove("show");
    };

    // Remove variant
    variantsContainer.addEventListener("click", e => {
        if (e.target.classList.contains("remove-variant")) {
            e.target.closest(".variant-card").remove();
        }
    });

    // Highlights add/remove
    document.getElementById("addHighlightBtn").onclick = () => {
        const item = document.createElement("div");
        item.className = "highlight-item mb-2 d-flex gap-2";
        item.innerHTML = `
            <input type="text" class="form-control highlight-input" name="highlights[]" placeholder="e.g. Handcrafted">
            <button type="button" class="btn btn-sm btn-outline-danger remove-highlight">Remove</button>
        `;
        document.getElementById("highlightsContainer").appendChild(item);
    };

    document.getElementById("highlightsContainer").addEventListener("click", e => {
        if (e.target.classList.contains("remove-highlight")) {
            e.target.closest(".highlight-item").remove();
        }
    });

    // Main form validation
    function validateMainForm() {
        let valid = true;
        if (!document.getElementById("productName").value.trim()) { showError("productName", "Required"); valid = false; }
        if (!document.getElementById("category").value) { showError("category", "Required"); valid = false; }
        if (!document.getElementById("description").value.trim()) { showError("description", "Required"); valid = false; }
        if (variantsContainer.children.length === 0) {
            document.getElementById("variants-error").textContent = "At least one variant required";
            valid = false;
        }
        return valid;
    }

    productForm.addEventListener("submit", e => {
        if (!validateMainForm()) {
            e.preventDefault();
            return;
        }
        saveProductBtn.disabled = true;
        saveProductBtn.querySelector(".btn-text").classList.add("hidden");
        saveProductBtn.querySelector(".btn-spinner").classList.remove("hidden");
    });
});