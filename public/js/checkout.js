document.addEventListener('DOMContentLoaded', function() {
    initializeCheckout();
});

// console.log("hai")

function initializeCheckout() {
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
    
    const addressType = document.querySelector(`input[name="addressType"][value="${address.addressType}"]`);
    if (addressType) addressType.checked = true;
    
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

    
    addressData.isDefault = addressData.isDefault === 'on';
    
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
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    })
   .catch(error => {
    console.error('Error saving address:', error);
    clearErrorMessages();

    const errors = error.response?.data?.errors;

    if (errors && typeof errors === 'object') {
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
function placeOrder() {
    const selectedAddress = document.querySelector('input[name="selectedAddress"]:checked');
    const placeOrderBtn = document.querySelector('.btn-place-order');

    if (!selectedAddress) {
        Toastify({
            text: "Please select a shipping address",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#ffc107",
            style: {
                background: "#ffc107",
                color: "#000"
            }
        }).showToast();
        return;
    }

    const originalText = placeOrderBtn.innerHTML;
    placeOrderBtn.innerHTML = '<div class="btn-spinner"></div> Placing Order...';
    placeOrderBtn.disabled = true;

    const orderData = {
        selectedAddress: selectedAddress.value
    };

    axios.post('/user/checkout/placeOrder', orderData)
        .then(response => {
            if (response.data.success) {
                Toastify({
                    text: "Order placed successfully!",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    backgroundColor: "#28a745",
                }).showToast();
                
                setTimeout(() => {
                    window.location.href = `/user/order/success/${response.data.orderId}`;
                }, 1500);
            }
        })
        .catch(error => {
            console.error('Error placing order:', error);
            const errorMessage = error.response?.data?.message || "Failed to place order";
            
            Toastify({
                text: errorMessage,
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: "#dc3545",
            }).showToast();
        })
        .finally(() => {
            placeOrderBtn.innerHTML = originalText;
            placeOrderBtn.disabled = false;
        });
}

const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
    .btn-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        display: inline-block;
        margin-right: 8px;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(spinnerStyle);