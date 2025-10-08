
const addVariantBtn = document.getElementById('addVariantBtn')
const variantModal = document.getElementById('variantModal')
const closeModalBtn = document.getElementById('closeModalBtn')
const variantForm = document.getElementById('variantForm')
const closeSpan = document.querySelector('.close')

const variants = []

addVariantBtn.addEventListener('click', () => {
    variantModal.style.display = 'block';
})

closeModalBtn.addEventListener('click', () => {
    variantModal.style.display = 'none';
    resetVariantForm();
})

closeSpan.addEventListener('click', () => {
    variantModal.style.display = 'none';
    resetVariantForm();
});

window.addEventListener('click', (event) => {
    if (event.target === variantModal) {
        variantModal.style.display = 'none';
        resetVariantForm();
    }
});

function resetVariantForm() {
    variantForm.reset();
    document.querySelectorAll('.preview-img').forEach(img => img.remove());
}


['image1', 'image2', 'image3'].forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const parent = input.parentElement;
        const existingPreview = parent.querySelector('.preview-img');
        if (existingPreview) {
            existingPreview.remove();
        }

        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.className = 'preview-img';
        img.style.width = '60px';
        img.style.height = '60px';
        img.style.marginLeft = '10px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '4px';
        parent.appendChild(img);
    });
});


document.getElementById('saveVariantBtn').addEventListener('click', () => {
    const color = document.getElementById('color').value.trim()
    const price = document.getElementById('price').value
    const discountedPrice = document.getElementById('discountedPrice').value
    const stockLimit = document.getElementById('stockLimit').value
    const image1 = document.getElementById('image1').files[0]
    const image2 = document.getElementById('image2').files[0]
    const image3 = document.getElementById('image3').files[0]

    if (!color || !price || !stockLimit) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Fields',
            text: 'Please fill all fields '
        });
        return;
    }
    if(!image1 || !image2 || !image3){
        Swal.fire({
            icon: 'error',
            title: 'Missing Fields',
            text: 'Please add images '
        });
        return;
    }

    if (parseFloat(price) <= 0) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Price',
            text: 'Price must be greater than 0.'
        });
        return;
    }
     if (discountedPrice && parseFloat(discountedPrice) < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Discount',
            text: 'Discount price cannot be negative.'
        });
        return;
    }

    if (discountedPrice && parseFloat(discountedPrice) > parseFloat(price)) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Discount',
            text: 'Discount price cannot be greater than regular price.'
        });
        return;
    }
     if (parseInt(stockLimit) < 0) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Stock',
            text: 'Stock limit cannot be negative.'
        });
        return;
    }

    const variant = {
        color,
        price: parseFloat(price),
        discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
        stockLimit: parseInt(stockLimit),
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
            <div>Price: $${variant.price}</div>
            <div>Discount: $${variant.discountedPrice || 'N/A'}</div>
            <div>Stock: ${variant.stockLimit}</div>
        </div>
        <div class="variant-preview-images"></div>
    `;

    const previewContainer = div.querySelector('.variant-preview-images');
    variant.images.forEach(file => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.width = '50px';
        img.style.height = '50px';
        img.style.marginRight = '5px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '4px';
        previewContainer.appendChild(img);
    });

    container.appendChild(div);

    resetVariantForm();
    variantModal.style.display = 'none';

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

// Highlight
const highlightsContainer = document.getElementById('highlightsContainer');
const addHighlightBtn = document.getElementById('addHighlightBtn');


function createHighlightInput(value = '', isMain = false) {
    const wrapper = document.createElement('div');
    wrapper.className = 'highlight-wrapper';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.marginBottom = '5px';

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
        removeBtn.style.marginLeft = '5px';
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
    highlightsContainer.appendChild(createHighlightInput())
});


document.getElementById('productForm').addEventListener('submit', async function (e) {
    e.preventDefault();

  
    const saveBtn = document.querySelector('.save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

  
    const productName = document.getElementById('productName').value.trim();
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value.trim();
    const highlightInputs = document.querySelectorAll('.highlight-input');
    const highlights = Array.from(highlightInputs).map(input => input.value.trim()).filter(h => h);


    if (!productName || !category || !description) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Fields',
            text: 'Please fill all required product fields.'
        });
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
        return;
    }

    if (variants.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'No Variants',
            text: 'Please add at least one product variant.'
        });
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
        return;
    }

    const formData = new FormData();

    // Append basic fields
    formData.append('name', productName);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('highlights', JSON.stringify(highlights));

    // Append variants data
    variants.forEach((variant) => {
        const variantData = {
            color: variant.color,
            price: variant.price,
            discountedPrice: variant.discountedPrice,
            stockLimit: variant.stockLimit,
        };
        formData.append('variantDetails', JSON.stringify(variantData));

        // Append all images
        variant.images.forEach(img => {
            formData.append('variantImages', img);
        });
    });

    try {
        const response = await axios.post('/admin/products/add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            timeout: 30000
        });

        if (response.data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.data.message,
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                window.location.href = '/admin/products';
            });
        } else {
             Swal.fire('Oops!', data.message, 'warning')
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


document.querySelector('.cancel-btn').addEventListener('click', () => {
    if (variants.length > 0) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'All unsaved changes will be lost.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
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