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

// Place Order Function
function placeOrder() {
    const selectedAddress = document.querySelector('input[name="selectedAddress"]:checked');
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    
    if (!selectedAddress) {
        Toastify({
            text: "Please select a shipping address",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "var(--warning-color)",
        }).showToast();
        return;
    }
    
    if (!paymentMethod) {
        Toastify({
            text: "Please select a payment method",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "var(--warning-color)",
        }).showToast();
        return;
    }
    
    const orderData = {
        addressId: selectedAddress.value,
        paymentMethod: paymentMethod.value
    };
    
    // Show loading state
    const placeOrderBtn = document.querySelector('.btn-place-order');
    if (!placeOrderBtn) return;

    const originalText = placeOrderBtn.innerHTML;
    placeOrderBtn.innerHTML = '<div class="btn-spinner"></div> Placing Order...';
    placeOrderBtn.disabled = true;

    axios.post('/api/orders', orderData)
        .then(response => {
            window.location.href = `/order-success/${response.data.orderId}`;
        })
        .catch(error => {
            console.error('Error placing order:', error);
            const errorMessage = error.response?.data?.message || "There was an error placing your order. Please try again.";
            Toastify({
                text: errorMessage,
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: "var(--error-color)",
            }).showToast();
        })
        .finally(() => {
            placeOrderBtn.innerHTML = originalText;
            placeOrderBtn.disabled = false;
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


document.addEventListener("DOMContentLoaded", () => {
    const pincodeInput = document.getElementById('pincode');
    const cityInput = document.getElementById('city');
    const stateInput = document.getElementById('state');
    const countryInput = document.getElementById('country');
    const pincodeWrapper = document.querySelector('.pincode-wrapper');
    const pincodeError = document.getElementById('pincodeError');

    // If elements don't exist (modal not open), return early
    if (!pincodeInput || !cityInput || !stateInput || !pincodeWrapper) {
        return;
    }

    let lastFetchedPincode = "";

    pincodeInput.addEventListener("input", async () => {
        const pincode = pincodeInput.value.trim();
        if (pincodeError) pincodeError.textContent = '';

        if (/^[1-9][0-9]{5}$/.test(pincode) && pincode !== lastFetchedPincode) {
            lastFetchedPincode = pincode;
            
            // Show CSS spinner
            pincodeWrapper.classList.add('loading');

            try {
                const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
                const data = await response.json();

                // Hide CSS spinner
                pincodeWrapper.classList.remove('loading');

                if (data[0].Status === "Success") {
                    const info = data[0].PostOffice[0];
                    cityInput.value = info.District || "";
                    stateInput.value = info.State || "";
                    if (countryInput) countryInput.value = "India";

                    Toastify({
                        text: `Address auto-filled successfully!`,
                        duration: 3000,
                        gravity: "top",
                        position: "right",
                        backgroundColor: "#4CAF50",
                    }).showToast();
                } else {
                    if (pincodeError) pincodeError.textContent = "Invalid pincode! Please check and try again.";
                    Toastify({
                        text: "Invalid Pincode!",
                        duration: 3000,
                        gravity: "top",
                        position: "right",
                        backgroundColor: "#ff5f6d",
                    }).showToast();

                    cityInput.value = "";
                    stateInput.value = "";
                    if (countryInput) countryInput.value = "India";
                }
            } catch (error) {
                // Hide CSS spinner
                pincodeWrapper.classList.remove('loading');
                console.error(error);
                if (pincodeError) pincodeError.textContent = "Error fetching pincode information. Please try again.";
                Toastify({
                    text: "Error fetching pincode info!",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    backgroundColor: "#ff5f6d",
                }).showToast();
            }
        }

        // Reset if user clears or edits pincode
        if (pincode.length < 6) {
            pincodeWrapper.classList.remove('loading');
            cityInput.value = "";
            stateInput.value = "";
            if (countryInput) countryInput.value = "India";
        }
    });
});