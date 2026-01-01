const addVariantBtn = document.getElementById('addVariantBtn');
const variantModal = document.getElementById('variantModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const variantForm = document.getElementById('variantForm');
const closeSpan = document.querySelector('.close');

let cropper = null;
let currentInput = null;

const cropModal = document.getElementById('cropModal');
const cropImage = document.getElementById('cropImage');
const closeCropModal = document.getElementById('closeCropModal');
const cancelCropBtn = document.getElementById('cancelCropBtn');
const applyCropBtn = document.getElementById('applyCropBtn');

const variants = [];

// ==================== MAIN FORM ELEMENTS & ERRORS ====================

const productNameInput = document.getElementById('productName');
const productNameError = document.getElementById('productNameError');
const categorySelect = document.getElementById('category');
const categoryError = document.getElementById('categoryError');
const descriptionInput = document.getElementById('description');
const descriptionError = document.getElementById('descriptionError');

// ==================== VARIANT MODAL ELEMENTS & ERRORS ====================

const colorError = document.getElementById('colorError');
const priceError = document.getElementById('priceError');
const discountedPriceError = document.getElementById('discountedPriceError');
const stockLimitError = document.getElementById('stockLimitError');
const imagesError = document.getElementById('imagesError');

const colorInput = document.getElementById('color');
const priceInput = document.getElementById('price');
const discountedPriceInput = document.getElementById('discountedPrice');
const stockLimitInput = document.getElementById('stockLimit');

// ==================== MODAL CONTROLS ====================

addVariantBtn.addEventListener('click', () => {
    variantModal.classList.add('show');
    resetVariantForm();
    clearAllErrors();
});

closeModalBtn.addEventListener('click', () => {
    variantModal.classList.remove('show');
    resetVariantForm();
});

closeSpan.addEventListener('click', () => {
    variantModal.classList.remove('show');
    resetVariantForm();
});

window.addEventListener('click', (event) => {
    if (event.target === variantModal) {
        variantModal.classList.remove('show');
        resetVariantForm();
    }
});

function resetVariantForm() {
    variantForm.reset();
    document.querySelectorAll('.preview-img').forEach(img => img.remove());
    clearAllErrors();
}

function clearAllErrors() {
    // Variant modal errors
    colorError.textContent = '';
    priceError.textContent = '';
    discountedPriceError.textContent = '';
    stockLimitError.textContent = '';
    imagesError.textContent = '';

    colorInput.classList.remove('invalid');
    priceInput.classList.remove('invalid');
    discountedPriceInput.classList.remove('invalid');
    stockLimitInput.classList.remove('invalid');

    // Main form errors
    productNameError.textContent = '';
    categoryError.textContent = '';
    descriptionError.textContent = '';

    productNameInput.classList.remove('invalid');
    categorySelect.classList.remove('invalid');
    descriptionInput.classList.remove('invalid');
}

// ==================== MAIN FORM REAL-TIME VALIDATION ====================

productNameInput.addEventListener('input', () => {
    const value = productNameInput.value.trim();

    productNameError.textContent = '';
    productNameInput.classList.remove('invalid');

    if (value === '') {
        productNameError.textContent = 'Product name is required';
        productNameInput.classList.add('invalid');
    } else if (value.length < 2) {
        productNameError.textContent = 'Product name must be at least 2 characters';
        productNameInput.classList.add('invalid');
    } else if (/^\s*\d+\s*$/.test(value)) {
        productNameError.textContent = 'Product name cannot be only numbers (e.g., 12345)';
        productNameInput.classList.add('invalid');
    } else if (!/[A-Za-z]/.test(value)) {
        productNameError.textContent = 'Product name must contain at least one letter';
        productNameInput.classList.add('invalid');
    } else if (!/^[A-Za-z0-9\s\-&.,()]+$/.test(value)) {
        productNameError.textContent = 'Only letters, numbers, spaces, and symbols (- & . , ( )) allowed';
        productNameInput.classList.add('invalid');
    }
});

categorySelect.addEventListener('change', () => {
    if (categorySelect.value === '') {
        categoryError.textContent = 'Please select a category';
        categorySelect.classList.add('invalid');
    } else {
        categoryError.textContent = '';
        categorySelect.classList.remove('invalid');
    }
});

descriptionInput.addEventListener('input', () => {
    const value = descriptionInput.value.trim();
    if (value === '') {
        descriptionError.textContent = 'Description is required';
        descriptionInput.classList.add('invalid');
    } else {
        descriptionError.textContent = '';
        descriptionInput.classList.remove('invalid');
    }
});

// ==================== VARIANT MODAL REAL-TIME VALIDATION ====================

colorInput.addEventListener('input', () => {
    if (colorInput.value.trim() === '') {
        colorError.textContent = 'Color is required';
        colorInput.classList.add('invalid');
    } else {
        colorError.textContent = '';
        colorInput.classList.remove('invalid');
    }
});

priceInput.addEventListener('input', () => {
    const val = priceInput.value;
    if (val === '' || isNaN(val) || parseFloat(val) <= 0) {
        priceError.textContent = 'Price must be greater than 0';
        priceInput.classList.add('invalid');
    } else {
        priceError.textContent = '';
        priceInput.classList.remove('invalid');
        discountedPriceInput.dispatchEvent(new Event('input'));
    }
});

discountedPriceInput.addEventListener('input', () => {
    const disc = discountedPriceInput.value;
    const price = priceInput.value;

    if (disc === '') {
        discountedPriceError.textContent = '';
        discountedPriceInput.classList.remove('invalid');
        return;
    }

    if (isNaN(disc) || parseFloat(disc) < 0) {
        discountedPriceError.textContent = 'Discount price cannot be negative';
        discountedPriceInput.classList.add('invalid');
    } else if (parseFloat(disc) >= parseFloat(price)) {
        discountedPriceError.textContent = 'Discount must be less than regular price';
        discountedPriceInput.classList.add('invalid');
    } else {
        discountedPriceError.textContent = '';
        discountedPriceInput.classList.remove('invalid');
    }
});

stockLimitInput.addEventListener('input', () => {
    const val = stockLimitInput.value;
    if (val === '' || isNaN(val) || parseInt(val) < 0) {
        stockLimitError.textContent = 'Stock must be 0 or greater';
        stockLimitInput.classList.add('invalid');
    } else {
        stockLimitError.textContent = '';
        stockLimitInput.classList.remove('invalid');
    }
});

// Images count validation
function validateImagesCount() {
    const img1 = document.getElementById('image1').files[0];
    const img2 = document.getElementById('image2').files[0];
    const img3 = document.getElementById('image3').files[0];

    if (!img1 || !img2 || !img3) {
        imagesError.textContent = 'Please upload exactly 3 images';
    } else {
        imagesError.textContent = '';
    }
}

['image1', 'image2', 'image3'].forEach(id => {
    document.getElementById(id).addEventListener('change', validateImagesCount);
});

// ==================== IMAGE CROPPING ====================

['image1', 'image2', 'image3'].forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        currentInput = input;

        const reader = new FileReader();
        reader.onload = function(evt) {
            cropImage.src = evt.target.result;

            if (cropper) cropper.destroy();

            cropper = new Cropper(cropImage, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 1,
                responsive: true,
                movable: true,
                zoomable: true,
                rotatable: false
            });

            cropModal.classList.add('show');
        };
        reader.readAsDataURL(file);
    });
});

closeCropModal.addEventListener('click', () => {
    cropModal.classList.remove('show');
    if (cropper) cropper.destroy();
    cropper = null;
    currentInput = null;
});

cancelCropBtn.addEventListener('click', () => {
    cropModal.classList.remove('show');
    if (cropper) cropper.destroy();
    cropper = null;
    currentInput = null;
});

applyCropBtn.addEventListener('click', () => {
    if (!cropper || !currentInput) return;

    cropper.getCroppedCanvas().toBlob((blob) => {
        if (!blob) return;

        const croppedFile = new File([blob], `${currentInput.id}_cropped.jpg`, { type: 'image/jpeg' });

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(croppedFile);
        currentInput.files = dataTransfer.files;

        const previewContainer = currentInput.closest('.file-upload-group').querySelector('.preview-container');
        const existingPreview = previewContainer.querySelector('.preview-img');
        if (existingPreview) existingPreview.remove();

        const previewImg = document.createElement('img');
        previewImg.src = URL.createObjectURL(croppedFile);
        previewImg.className = 'preview-img';
        previewImg.style.width = '130px';
        previewImg.style.height = '130px';
        previewImg.style.objectFit = 'cover';
        previewImg.style.borderRadius = '16px';
        previewImg.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
        previewContainer.appendChild(previewImg);

        cropModal.classList.remove('show');
        cropper.destroy();
        cropper = null;
        currentInput = null;

        validateImagesCount();
    }, 'image/jpeg');
});

// ==================== SAVE VARIANT ====================

document.getElementById('saveVariantBtn').addEventListener('click', () => {
    // Trigger all validations
    colorInput.dispatchEvent(new Event('input'));
    priceInput.dispatchEvent(new Event('input'));
    discountedPriceInput.dispatchEvent(new Event('input'));
    stockLimitInput.dispatchEvent(new Event('input'));
    validateImagesCount();

    // If any error, stop
    if (colorError.textContent || priceError.textContent || discountedPriceError.textContent ||
        stockLimitError.textContent || imagesError.textContent) {
        return;
    }

    const color = colorInput.value.trim();
    const price = parseFloat(priceInput.value);
    const discountedPrice = discountedPriceInput.value ? parseFloat(discountedPriceInput.value) : null;
    const stockLimit = parseInt(stockLimitInput.value);

    const image1 = document.getElementById('image1').files[0];
    const image2 = document.getElementById('image2').files[0];
    const image3 = document.getElementById('image3').files[0];

    const variant = {
        color,
        price,
        discountedPrice,
        stockLimit,
        images: [image1, image2, image3]
    };

    variants.push(variant);

    const container = document.getElementById('variantsContainer');
    const div = document.createElement('div');
    div.className = 'variant-card';
    div.innerHTML = `
        <div class="variant-header">
            <h4>${color}</h4>
            <button type="button" class="remove-variant-btn" onclick="removeVariant(this)">×</button>
        </div>
        <div class="variant-details">
            <div>Price: ₹${price}</div>
            <div>Discount Price: ₹${discountedPrice || 'N/A'}</div>
            <div>Stock: ${stockLimit}</div>
        </div>
        <div class="variant-preview-images"></div>
    `;

    const previewContainer = div.querySelector('.variant-preview-images');
    variant.images.forEach(file => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.width = '90px';
        img.style.height = '90px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '14px';
        img.style.marginRight = '15px';
        img.style.border = '3px solid white';
        img.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
        previewContainer.appendChild(img);
    });

    container.appendChild(div);

    variantModal.classList.remove('show');
    resetVariantForm();

    Swal.fire({
        icon: 'success',
        title: 'Variant Added!',
        text: 'Variant has been added successfully.',
        timer: 1500,
        showConfirmButton: false
    });
});

function removeVariant(button) {
    const variantCard = button.closest('.variant-card');
    const index = Array.from(variantCard.parentElement.children).indexOf(variantCard);
    variants.splice(index, 1);
    variantCard.remove();
}

// ==================== HIGHLIGHTS ====================

const highlightsContainer = document.getElementById('highlightsContainer');
const addHighlightBtn = document.getElementById('addHighlightBtn');

function createHighlightInput(value = '', isMain = false) {
    const wrapper = document.createElement('div');
    wrapper.className = 'highlight-wrapper';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '15px';
    wrapper.style.marginBottom = '15px';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'highlight-input';
    input.name = 'highlights';
    input.placeholder = 'Add highlight';
    input.value = value;
    input.style.flex = '1';

    if (!isMain) {
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'Remove';
        removeBtn.className = 'remove-highlight-btn';
        removeBtn.addEventListener('click', () => wrapper.remove());
        wrapper.appendChild(removeBtn);
    }

    wrapper.appendChild(input);
    return wrapper;
}

document.querySelectorAll('#highlightsContainer .highlight-input').forEach((input, index) => {
    const wrapper = createHighlightInput(input.value, index === 0);
    input.replaceWith(wrapper);
});

addHighlightBtn.addEventListener('click', () => {
    highlightsContainer.appendChild(createHighlightInput());
});

// ==================== MAIN FORM SUBMIT ====================

document.getElementById('productForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Trigger client-side validation
    productNameInput.dispatchEvent(new Event('input'));
    categorySelect.dispatchEvent(new Event('change'));
    descriptionInput.dispatchEvent(new Event('input'));

    // Stop if any client-side error
    if (productNameError.textContent || categoryError.textContent || descriptionError.textContent) {
        return;
    }

    if (variants.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'No Variants',
            text: 'Please add at least one product variant.'
        });
        return;
    }

    const saveBtn = this.querySelector('.save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const productName = productNameInput.value.trim();
    const category = categorySelect.value;
    const description = descriptionInput.value.trim();
    const highlightInputs = document.querySelectorAll('.highlight-input');
    const highlights = Array.from(highlightInputs).map(input => input.value.trim()).filter(h => h);

    const formData = new FormData();

    formData.append('name', productName);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('highlights', JSON.stringify(highlights));

    variants.forEach((variant) => {
        const variantData = {
            color: variant.color,
            price: variant.price,
            discountedPrice: variant.discountedPrice,
            stockLimit: variant.stockLimit,
        };
        formData.append('variantDetails', JSON.stringify(variantData));
        variant.images.forEach(img => formData.append('variantImages', img));
    });

    try {
        const response = await axios.post('/admin/products/add', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000
        });

        if (response.data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.data.message,
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = '/admin/products';
            });
        } else {
            Swal.fire('Oops!', response.data.message || 'Something went wrong', 'warning');
        }
    } catch (error) {
        console.error('Error:', error);
        const msg = error?.response?.data?.message || 'Something went wrong. Please try again.';
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: msg
        });
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
    }
});

// Cancel button
document.querySelector('.cancel-btn').addEventListener('click', () => {
    if (variants.length > 0) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'All unsaved changes will be lost.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, cancel!',
            cancelButtonText: 'No, keep editing'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/admin/products';
            }
        });
    } else {
        window.location.href = '/admin/products';
    }
});