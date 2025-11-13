// Checkout Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeCheckout();
});

console.log("hai")

function initializeCheckout() {
    // Set up event listeners when DOM is ready
    const addressForm = document.getElementById('addressForm');
    const addressModal = document.getElementById('addressModal');
    
    if (addressForm) {
        addressForm.addEventListener('submit', handleAddressFormSubmit);
    }
    
    if (addressModal) {
        addressModal.addEventListener('click', handleModalOutsideClick);
    }
    
    initializeErrorClearOnInput();

}

// Address Management Functions
function showAddressForm(addressId = null) {
    const modal = document.getElementById('addressModal');
    const modalTitle = document.getElementById('modalTitleText');
    const form = document.getElementById('addressForm');
    
    if (addressId) {
        modalTitle.textContent = 'Edit Address';
        fetchAddressData(addressId);
    } else {
        modalTitle.textContent = 'Add New Address';
        resetAddressForm();
    }
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeAddressForm() {
    const modal = document.getElementById('addressModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

function resetAddressForm() {
    const form = document.getElementById('addressForm');
    if (form) {
        form.reset();
        document.getElementById('addressId').value = '';
        document.getElementById('country').value = 'India';
        clearErrorMessages();
    }
}

function clearErrorMessages() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
}

function fetchAddressData(addressId) {
    const saveBtn = document.getElementById('saveAddressBtn');
    if (!saveBtn) return;

    // Show loading state
    saveBtn.innerHTML = '<div class="btn-spinner"></div> Loading...';
    saveBtn.disabled = true;

    axios.get(`/user/checkout/address/${addressId}`)
        .then(response => {
            const address = response.data;
            populateAddressForm(address);
        })
        .catch(error => {
            console.error('Error fetching address:', error);
            Toastify({
                text: "Failed to load address details",
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: "var(--error-color)",
            }).showToast();
        })
        .finally(() => {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Address';
            saveBtn.disabled = false;
        });
}

function populateAddressForm(address) {
    document.getElementById('addressId').value = address._id;
    document.getElementById('name').value = address.name || '';
    document.getElementById('phone').value = address.phone || '';
    document.getElementById('houseName').value = address.houseName || '';
    document.getElementById('locality').value = address.locality || '';
    document.getElementById('city').value = address.city || '';
    document.getElementById('state').value = address.state || '';
    document.getElementById('pincode').value = address.pincode || '';
    document.getElementById('country').value = address.country || 'India';
    document.getElementById('landmark').value = address.landmark || '';
    
    // Set address type
    const addressType = document.querySelector(`input[name="addressType"][value="${address.addressType}"]`);
    if (addressType) addressType.checked = true;
    
    // Set default address
    document.getElementById('isDefault').checked = address.isDefault || false;
}

function editAddress(addressId) {
    showAddressForm(addressId);
}

function handleAddressFormSubmit(e) {
    e.preventDefault();
    saveAddress();
}

function saveAddress() {
    const form = document.getElementById('addressForm');
    const saveBtn = document.getElementById('saveAddressBtn');
    
    if (!form || !saveBtn) return;

    const formData = new FormData(form);
    const addressData = Object.fromEntries(formData);
    console.log("Address Data being sent:", addressData);

    
    // Convert isDefault to boolean
    addressData.isDefault = addressData.isDefault === 'on';
    
    // Show loading state
    saveBtn.innerHTML = '<div class="btn-spinner"></div> Saving...';
    saveBtn.disabled = true;

    const addressId = document.getElementById('addressId').value;
    const url = addressId ? `/user/checkout/address/edit/${addressId}` : '/user/checkout/address/add';
    const method = addressId ? 'PUT' : 'POST';

    axios({
        method: method,
        url: url,
        data: addressData,
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        Toastify({
            text: addressId ? "Address updated successfully!" : "Address added successfully!",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "var(--success-color)",
        }).showToast();
        
        closeAddressForm();
        // Reload the page to reflect changes
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    })
   .catch(error => {
    console.error('Error saving address:', error);
    clearErrorMessages();

    const errors = error.response?.data?.errors;

    if (errors && typeof errors === 'object') {
        // Loop through object keys and show messages below inputs
        Object.keys(errors).forEach(key => {
            const errorElement = document.getElementById(`${key}Error`);
            if (errorElement) {
                errorElement.textContent = errors[key];
            }
        });

        Toastify({
            text: "Please correct the highlighted errors.",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "var(--warning-color)",
        }).showToast();
    } else {
        const errorMessage = error.response?.data?.message || "Failed to save address";
        Toastify({
            text: errorMessage,
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "var(--error-color)",
        }).showToast();
    }
})

    .finally(() => {
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Address';
        saveBtn.disabled = false;
    });
}

function handleModalOutsideClick(e) {
    if (e.target === this) {
        closeAddressForm();
    }
}

// Make functions globally available for onclick attributes
window.showAddressForm = showAddressForm;
window.closeAddressForm = closeAddressForm;
window.editAddress = editAddress;
window.placeOrder = placeOrder;

function initializeErrorClearOnInput() {
    const inputs = document.querySelectorAll('#addressForm input, #addressForm select, #addressForm textarea');

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const errorElement = document.getElementById(`${input.name}Error`);
            if (errorElement) {
                errorElement.textContent = '';
            }
        });
    });
}
