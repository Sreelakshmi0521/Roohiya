// Modal Elements
const addVariantBtn = document.getElementById('addVariantBtn');
const variantModal = document.getElementById('variantModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const variantForm = document.getElementById('variantForm');

const variants = []; // Store variants temporarily

// Open modal
addVariantBtn.addEventListener('click', () => {
    variantModal.style.display = 'block';
});

// Close modal
closeModalBtn.addEventListener('click', () => {
    variantModal.style.display = 'none';
});

// Close modal when clicking outside content
window.addEventListener('click', (event) => {
    if (event.target === variantModal) {
        variantModal.style.display = 'none';
    }
});

// Image preview logic
['image1','image2','image3'].forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Remove existing preview if any
        const existingPreview = input.nextElementSibling;
        if (existingPreview && existingPreview.classList.contains('preview-img')) {
            existingPreview.remove();
        }

        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.className = 'preview-img';
        img.style.width = '60px';
        img.style.height = '60px';
        img.style.marginLeft = '10px';
        img.style.objectFit = 'cover';
        input.parentElement.appendChild(img);
    });
});

// Add variant
document.getElementById('saveVariantBtn').addEventListener('click', () => {
    const color = document.getElementById('color').value.trim();
    const price = document.getElementById('price').value;
    const discountPrice = document.getElementById('discountPrice').value;
    const stockLimit = document.getElementById('stockLimit').value;
    const image1 = document.getElementById('image1').files[0];
    const image2 = document.getElementById('image2').files[0];
    const image3 = document.getElementById('image3').files[0];

    if (!color || !price || !stockLimit || !image1 || !image2 || !image3) {
        alert('Please fill all fields and select all images.');
        return;
    }

    const variant = { color, price, discountPrice, stockLimit, images: [image1, image2, image3] };
    variants.push(variant);

    // Add to DOM
    const container = document.getElementById('variantsContainer');
    const div = document.createElement('div');
    div.className = 'variant-card';
    div.innerHTML = `
        <h4>${color}</h4>
        <div>Price: $${price} | Discount: $${discountPrice || 'N/A'} | Stock: ${stockLimit}</div>
        <div class="variant-preview-images"></div>
        <button type="button" onclick="removeVariant(this)">Remove</button>
    `;
    
    const previewContainer = div.querySelector('.variant-preview-images');
    variant.images.forEach(file => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.width = '60px';
        img.style.height = '60px';
        img.style.marginRight = '5px';
        img.style.objectFit = 'cover';
        previewContainer.appendChild(img);
    });

    container.appendChild(div);

    // Reset & close modal
    variantForm.reset();
    variantModal.style.display = 'none';
});

// Remove variant
function removeVariant(button) {
    const index = Array.from(button.parentElement.parentElement.children).indexOf(button.parentElement);
    variants.splice(index, 1);
    button.parentElement.remove();
}
document.getElementById('productForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Get simple product fields
    const productName = document.getElementById('productName').value.trim();
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value.trim();
    const highlightInputs = document.querySelectorAll('.highlight-input');
    const highlights = Array.from(highlightInputs).map(input => input.value.trim()).filter(h => h);

    if (!productName || !category || !description || variants.length === 0) {
        alert('Please fill all required product fields and add at least one variant.');
        return;
    }

    const formData = new FormData();
    // Append simple fields
    formData.append('name', productName);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('highlights', JSON.stringify(highlights));

    // Append flattened variants data
    variants.forEach((variant) => {
        // 1. Append text data as a JSON string
        const variantData = {
            color: variant.color,
            price: variant.price,
            discountPrice: variant.discountPrice,
            stockLimit: variant.stockLimit,
        };
        // Multer will place these JSON strings into req.body.variantDetails array
        formData.append('variantDetails', JSON.stringify(variantData)); 

        // 2. Append image files using a simple array name
        variant.images.forEach(img => {
            // Multer will place ALL images into req.files array
            formData.append('variantImages', img); 
        });
    });

    try {
        // --- Client-side Logging (For debugging client data) ---
        console.log("--- Data being sent to server: ---");
        for (let [key, value] of formData.entries()) {
             if (value instanceof File) {
                 console.log(`${key}:`, value.name, `(${value.size} bytes)`);
             } else {
                 console.log(`${key}:`, value);
             }
         }
         console.log("----------------------------------");
         
        // Ensure you have a global axios object available
        const response = await axios.post('/admin/products/add', formData, {
            // Note: Setting 'Content-Type': 'multipart/form-data' explicitly in headers is 
            // generally NOT needed for FormData/Axios, but it doesn't hurt.
        });

        if (response.data.success) {
            alert('Product added successfully!');
            // window.location.reload();
        } else {
            alert('Failed to add product.');
        }
    } catch (err) {
        console.error('API Error:', err);
        alert('Error adding product. Check server console for details.');
    }
});