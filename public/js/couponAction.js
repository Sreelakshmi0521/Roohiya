// Coupon Management JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const btnAddCoupon = document.getElementById('btnAddCoupon');
    const addCouponModal = new bootstrap.Modal(document.getElementById('addCouponModal'));
    const editCouponModal = new bootstrap.Modal(document.getElementById('editCouponModal'));
    const deleteCouponModal = new bootstrap.Modal(document.getElementById('deleteCouponModal'));
    const addCouponForm = document.getElementById('addCouponForm');
    const editCouponForm = document.getElementById('editCouponForm');
    const searchCoupon = document.getElementById('searchCoupon');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const deleteCouponCodeSpan = document.getElementById('deleteCouponCode');
    
    // Variables
    let currentCouponToDelete = null;
    let debounceTimer;
    let isTogglingStatus = false; // To prevent double toggling
        let clearSearchBtn = null; // ADD THIS LINE - Missing variable declaration!


    // Initialize Axios defaults (optional)
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    // Initialize
    init();

    function init() {
        console.log('Coupon Action JS initialized');
        
        // Event Listeners
if (btnAddCoupon) {
    btnAddCoupon.addEventListener('click', openAddCouponModal);
}        addCouponForm.addEventListener('submit', handleAddCoupon);
        editCouponForm.addEventListener('submit', handleUpdateCoupon);
        searchCoupon.addEventListener('input', handleSearch);
        confirmDeleteBtn.addEventListener('click', handleDeleteCoupon);
        

                initializeClearSearchButton();

        // Discount type change handlers
        document.querySelectorAll('select[name="discountType"]').forEach(select => {
            select.addEventListener('change', handleDiscountTypeChange);
            // Trigger change on initialization
            select.dispatchEvent(new Event('change'));
        });

        // Real-time validation listeners for add modal
        addCouponForm.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('input', handleRealTimeValidation);
            field.addEventListener('change', handleRealTimeValidation);
            field.addEventListener('blur', handleRealTimeValidation);
        });

        // Initialize modals with today's date
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 7);
        const nextWeek = tomorrow.toISOString().split('T')[0];
        
        addCouponForm.querySelector('input[name="startDate"]').value = today;
        addCouponForm.querySelector('input[name="endDate"]').value = nextWeek;
        
        // Event delegation for table actions
        document.addEventListener('click', handleTableActions);
        
        // Initialize all toggle switches with proper event listeners
        initializeToggleSwitches();
    }
 function initializeClearSearchButton() {
        // Get initial clear button if it exists (from EJS template)
        clearSearchBtn = document.getElementById('clearSearch');
        
        // Function to update clear button visibility
        function updateClearButton() {
            if (searchCoupon.value.trim() !== '') {
                if (!clearSearchBtn) {
                    // Create clear button if it doesn't exist
                    clearSearchBtn = document.createElement('button');
                    clearSearchBtn.className = 'btn btn-outline-secondary border-start-0 clear-search';
                    clearSearchBtn.type = 'button';
                    clearSearchBtn.id = 'clearSearch';
                    clearSearchBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
                    clearSearchBtn.title = 'Clear search';
                    
                    clearSearchBtn.addEventListener('click', function() {
                        searchCoupon.value = '';
                        searchCoupon.focus();
                        clearSearchBtn.remove();
                        clearSearchBtn = null;
                        // Trigger search to refresh results
                        handleClearSearch();
                    });
                    
                    searchCoupon.parentNode.appendChild(clearSearchBtn);
                }
            } else if (clearSearchBtn) {
                clearSearchBtn.remove();
                clearSearchBtn = null;
            }
        }
        
        // Show/hide clear button based on input
        searchCoupon.addEventListener('input', updateClearButton);
        
        // Initialize clear button if search has value on page load
        updateClearButton();
        
        // Clear button functionality if it exists on page load
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', function() {
                searchCoupon.value = '';
                searchCoupon.focus();
                this.remove();
                clearSearchBtn = null;
                // Trigger search to refresh results
                handleClearSearch();
            });
        }
        
        // Add keyboard shortcut for clearing search (Escape key)
        searchCoupon.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && this.value) {
                this.value = '';
                this.focus();
                if (clearSearchBtn) {
                    clearSearchBtn.remove();
                    clearSearchBtn = null;
                }
                // Trigger search to refresh results
                handleClearSearch();
            }
        });
    }
    
    // Handle clear search
    function handleClearSearch() {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('search');
        currentUrl.searchParams.set('page', '1');
        window.location.href = currentUrl.toString();
    }
    // Real-time validation handler
    function handleRealTimeValidation(e) {
        const field = e.target;
        const form = field.closest('form');
        const fieldName = field.name;
        
        // Skip validation for non-required fields when empty
        if (!field.required && !field.value.trim()) {
            clearFieldError(field);
            return;
        }
        
        // Validate based on field type
        let isValid = true;
        let errorMessage = '';
        
        switch(fieldName) {
            case 'code':
                isValid = validateCouponCode(field.value);
                if (!isValid) {
                    errorMessage = 'Coupon code must be 4-20 characters, uppercase letters, numbers, dash or underscore only';
                }
                break;
                
            case 'description':
                isValid = field.value.trim().length > 0;
                if (!isValid) {
                    errorMessage = 'Description is required';
                }
                break;
                
            case 'discountValue':
                isValid = validateDiscountValue(field.value, form);
                if (!isValid) {
                    const discountType = form.querySelector('select[name="discountType"]').value;
                    if (discountType === 'percentage') {
                        errorMessage = 'Percentage must be between 0.01 and 100';
                    } else {
                        errorMessage = 'Fixed amount must be at least ₹1';
                    }
                }
                break;
                
            case 'maxDiscountAmount':
                isValid = validateMaxDiscount(field.value, form);
                if (!isValid) {
                    errorMessage = 'Max discount amount must be reasonable';
                }
                break;
                
            case 'startDate':
            case 'endDate':
                isValid = validateDates(form);
               if (!isValid) {
                const todayStr = new Date().toISOString().split('T')[0];

                if (fieldName === 'startDate') {
                    if (field.value < todayStr) {
                        errorMessage = 'Start date cannot be in the past';
                    }
                } else {
                    const startDate = form.querySelector('input[name="startDate"]').value;
                    if (field.value <= startDate) {
                        errorMessage = 'End date must be after start date';
                    }
                }
            }
             break;
                
            case 'usageLimit':
            case 'perUserLimit':
                isValid = validateLimit(field.value, fieldName, form);
                if (!isValid) {
                    if (fieldName === 'usageLimit') {
                        errorMessage = 'Usage limit must be at least 1';
                    } else {
                        errorMessage = 'Per user limit must be at least 1';
                    }
                }
                break;
                
            case 'minPurchaseAmount':
                isValid = validateMinPurchase(field.value);
                if (!isValid) {
                    errorMessage = 'Minimum purchase amount cannot be negative';
                }
                break;
        }
        
        // Update field error state
        if (!isValid && errorMessage) {
            showFieldError(field, errorMessage);
        } else {
            clearFieldError(field);
        }
        
        // Check if all fields are valid for submit button
        updateSubmitButtonState(form);
    }

    // Show field-specific error
    function showFieldError(field, message) {
        // Remove existing error
        clearFieldError(field);
        
        // Add error class to field
        field.classList.add('is-invalid');
        
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback d-block';
        errorDiv.textContent = message;
        errorDiv.id = `${field.name}-error`;
        
        // Insert after field
        field.parentNode.appendChild(errorDiv);
        
        // If field is in a row with other fields, add error class to parent
        const parentCol = field.closest('.col-md-6, .col-12');
        if (parentCol) {
            parentCol.classList.add('has-error');
        }
    }

    // Clear field error
    function clearFieldError(field) {
        field.classList.remove('is-invalid');
        
        // Remove error message
        const errorDiv = field.parentNode.querySelector(`#${field.name}-error`);
        if (errorDiv) {
            errorDiv.remove();
        }
        
        // Remove error class from parent
        const parentCol = field.closest('.col-md-6, .col-12');
        if (parentCol) {
            parentCol.classList.remove('has-error');
        }
    }

    // Update submit button state
    function updateSubmitButtonState(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const invalidFields = form.querySelectorAll('.is-invalid');
        const requiredFields = form.querySelectorAll('[required]');
        
        let allRequiredFilled = true;
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                allRequiredFilled = false;
            }
        });
        
        submitBtn.disabled = invalidFields.length > 0 || !allRequiredFilled;
    }

    // Individual validation functions
    function validateCouponCode(code) {
        if (!code.trim()) return false;
        const couponCodeRegex = /^[A-Z0-9_-]{4,20}$/;
        return couponCodeRegex.test(code.toUpperCase());
    }

    function validateDiscountValue(value, form) {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) return false;
        
        const discountType = form.querySelector('select[name="discountType"]').value;
        if (discountType === 'percentage') {
            return numValue <= 100;
        }
        return numValue >= 1;
    }

    function validateMaxDiscount(value, form) {
        if (!value.trim()) return true; // Optional field
        
        const maxDiscount = parseFloat(value);
        if (isNaN(maxDiscount) || maxDiscount <= 0) return false;
        
        const discountValue = parseFloat(form.querySelector('input[name="discountValue"]').value);
        const discountType = form.querySelector('select[name="discountType"]').value;
        
        if (discountType === 'percentage' && discountValue) {
            return maxDiscount >= discountValue;
        }
        return true;
    }
function validateDates(form) {
    const startDateInput = form.querySelector('input[name="startDate"]');
    const endDateInput = form.querySelector('input[name="endDate"]');

    if (!startDateInput.value || !endDateInput.value) return true;

    // ✅ FIX: Compare as STRING instead of Date (avoids timezone issue)
    const todayStr = new Date().toISOString().split('T')[0];

    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    // Start date cannot be past
    if (startDate < todayStr) return false;

    // End date must be after start date
    if (endDate <= startDate) return false;

    return true;
}

    function validateLimit(value, fieldName, form) {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 1) return false;
        
        // Check perUserLimit doesn't exceed usageLimit
        if (fieldName === 'perUserLimit') {
            const usageLimit = parseInt(form.querySelector('input[name="usageLimit"]').value);
            if (!isNaN(usageLimit) && numValue > usageLimit) return false;
        }
        
        return true;
    }

    function validateMinPurchase(value) {
        if (!value.trim()) return true;
        const numValue = parseFloat(value);
        return !isNaN(numValue) && numValue >= 0;
    }

    // Initialize toggle switches
    function initializeToggleSwitches() {
        document.querySelectorAll('.toggle-status').forEach(switchElement => {
            // Remove any existing listeners to prevent duplicates
            switchElement.removeEventListener('change', handleStatusToggle);
            // Add new listener
            switchElement.addEventListener('change', handleStatusToggle);
        });
    }

    // Handle toggle switch change
    function handleStatusToggle(e) {
        const switchElement = e.target;
        const couponId = switchElement.dataset.id;
        const isActive = switchElement.checked;
        
        console.log('Toggle switch changed:', { couponId, isActive });
        
        // Prevent multiple rapid toggles
        if (isTogglingStatus) {
            console.log('Toggle already in progress, ignoring...');
            return;
        }
        
        toggleCouponStatus(couponId, isActive, switchElement);
    }

    // Open Add Coupon Modal
    function openAddCouponModal() {
        // Reset form
        addCouponForm.reset();
        
        // Clear all errors
        addCouponForm.querySelectorAll('.is-invalid').forEach(field => {
            clearFieldError(field);
        });
        
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 7);
        const nextWeek = tomorrow.toISOString().split('T')[0];
        
        addCouponForm.querySelector('input[name="startDate"]').value = today;
        addCouponForm.querySelector('input[name="endDate"]').value = nextWeek;
        
        // Set today as min date for startDate
        addCouponForm.querySelector('input[name="startDate"]').min = today;
        addCouponForm.querySelector('input[name="endDate"]').min = today;
        
        // Reset max discount container
        const maxDiscountContainer = document.getElementById('maxDiscountAmountContainer');
        maxDiscountContainer.style.display = 'none';
        
        // Enable submit button
        updateSubmitButtonState(addCouponForm);
        
        addCouponModal.show();
    }

    // Handle Add Coupon with Axios
    async function handleAddCoupon(e) {
        e.preventDefault();
        
        // Validate all fields before submission
        const isValid = validateAllFields(addCouponForm);
        if (!isValid) {
            showToast('Validation Error', 'Please fix all errors before submitting', 'error');
            return;
        }
        
        const formData = new FormData(addCouponForm);
        const data = Object.fromEntries(formData.entries());

        // Prepare data for API
        const couponData = {
            code: data.code.trim().toUpperCase(),
            description: data.description.trim(),
            discountType: data.discountType,
            discountValue: parseFloat(data.discountValue),
            maxDiscountAmount: data.maxDiscountAmount ? parseFloat(data.maxDiscountAmount) : null,
            minPurchaseAmount: parseFloat(data.minPurchaseAmount) || 0,
            usageLimit: parseInt(data.usageLimit),
            perUserLimit: parseInt(data.perUserLimit),
            startDate: data.startDate,
            endDate: data.endDate,
            isActive: document.getElementById('addIsActive').checked
        };

        try {
            const submitBtn = addCouponForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Adding...';

            const response = await axios.post('/admin/coupons', couponData);
            
            if (response.data.success) {
                showToast('Success', response.data.message, 'success');
                addCouponModal.hide();
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                showToast('Error', response.data.message, 'error');
            }
        } catch (error) {
            console.error('Error adding coupon:', error);
            
            if (error.response) {
                // Server responded with error
                if (error.response.data && error.response.data.errors) {
                    // Joi validation errors
                    const errors = Object.values(error.response.data.errors).join(', ');
                    showToast('Validation Error', errors, 'error');
                } else if (error.response.data && error.response.data.message) {
                    showToast('Error', error.response.data.message, 'error');
                } else {
                    showToast('Error', 'Failed to create coupon', 'error');
                }
            } else {
                showToast('Error', 'Network error. Please try again.', 'error');
            }
        } finally {
            const submitBtn = addCouponForm.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'ADD COUPON';
        }
    }

    // Handle table actions (edit, delete)
    function handleTableActions(e) {
        // Edit button click
        if (e.target.closest('.btn-edit')) {
            const btn = e.target.closest('.btn-edit');
            const couponId = btn.dataset.id;
            openEditCouponModal(couponId);
            return;
        }

        // Delete button click
        if (e.target.closest('.btn-delete')) {
            const btn = e.target.closest('.btn-delete');
            const couponId = btn.dataset.id;
            
            // Get coupon code from the FIRST td in the row
            const tr = btn.closest('tr');
            const couponCodeCell = tr.querySelector('td:first-child');
            const couponCode = couponCodeCell ? couponCodeCell.textContent.trim() : 'Unknown';
            
            openDeleteCouponModal(couponId, couponCode);
            return;
        }
    }

    // Open Edit Coupon Modal with Axios
    async function openEditCouponModal(couponId) {
        try {
            const response = await axios.get(`/admin/coupons/${couponId}`);
            
            if (response.data.success) {
                const coupon = response.data.coupon;
                
                // Clear all errors first
                editCouponForm.querySelectorAll('.is-invalid').forEach(field => {
                    clearFieldError(field);
                });
                
                // Populate form
                document.getElementById('edit_couponId').value = coupon._id;
                document.getElementById('edit_code').value = coupon.code;
                document.getElementById('edit_description').value = coupon.description;
                document.getElementById('edit_minPurchaseAmount').value = coupon.minPurchaseAmount;
                document.getElementById('edit_discountType').value = coupon.discountType;
                document.getElementById('edit_discountValue').value = coupon.discountValue;
                document.getElementById('edit_maxDiscountAmount').value = coupon.maxDiscountAmount || '';
                document.getElementById('edit_startDate').value = new Date(coupon.startDate).toISOString().split('T')[0];
                document.getElementById('edit_endDate').value = new Date(coupon.endDate).toISOString().split('T')[0];
                document.getElementById('edit_usageLimit').value = coupon.usageLimit;
                document.getElementById('edit_perUserLimit').value = coupon.perUserLimit;
                document.getElementById('edit_isActive').checked = coupon.isActive;
                
                // Show/hide max discount container
                const maxDiscountContainer = document.getElementById('edit_maxDiscountAmountContainer');
                const discountTypeSelect = document.getElementById('edit_discountType');
                
                if (coupon.discountType === 'percentage') {
                    maxDiscountContainer.style.display = 'block';
                } else {
                    maxDiscountContainer.style.display = 'none';
                }
                
                // Set min dates for date inputs
                const startDateInput = document.getElementById('edit_startDate');
                const endDateInput = document.getElementById('edit_endDate');
                const today = new Date().toISOString().split('T')[0];
                startDateInput.min = today;
                endDateInput.min = today;
                
                // Add real-time validation listeners for edit modal
                editCouponForm.querySelectorAll('input, textarea, select').forEach(field => {
                    field.removeEventListener('input', handleRealTimeValidation);
                    field.removeEventListener('change', handleRealTimeValidation);
                    field.removeEventListener('blur', handleRealTimeValidation);
                    field.addEventListener('input', handleRealTimeValidation);
                    field.addEventListener('change', handleRealTimeValidation);
                    field.addEventListener('blur', handleRealTimeValidation);
                });
                
                // Trigger change event to update validation
                discountTypeSelect.dispatchEvent(new Event('change'));
                
                // Update submit button state
                updateSubmitButtonState(editCouponForm);
                
                editCouponModal.show();
            } else {
                showToast('Error', response.data.message, 'error');
            }
        } catch (error) {
            console.error('Error fetching coupon:', error);
            
            if (error.response && error.response.data && error.response.data.message) {
                showToast('Error', error.response.data.message, 'error');
            } else {
                showToast('Error', 'Failed to load coupon details', 'error');
            }
        }
    }

    // Handle Update Coupon with Axios
    async function handleUpdateCoupon(e) {
        e.preventDefault();
        
        // Validate all fields before submission
        const isValid = validateAllFields(editCouponForm);
        if (!isValid) {
            showToast('Validation Error', 'Please fix all errors before submitting', 'error');
            return;
        }
        
        const formData = new FormData(editCouponForm);
        const data = Object.fromEntries(formData.entries());
        const couponId = data.couponId;

        const couponData = {
            code: data.code.trim().toUpperCase(),
            description: data.description.trim(),
            discountType: data.discountType,
            discountValue: parseFloat(data.discountValue),
            maxDiscountAmount: data.maxDiscountAmount ? parseFloat(data.maxDiscountAmount) : null,
            minPurchaseAmount: parseFloat(data.minPurchaseAmount) || 0,
            usageLimit: parseInt(data.usageLimit),
            perUserLimit: parseInt(data.perUserLimit),
            startDate: data.startDate,
            endDate: data.endDate,
            isActive: document.getElementById('edit_isActive').checked
        };

        try {
            const submitBtn = editCouponForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Updating...';

            const response = await axios.put(`/admin/coupons/${couponId}`, couponData);

            if (response.data.success) {
                showToast('Success', response.data.message, 'success');
                editCouponModal.hide();
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                showToast('Error', response.data.message, 'error');
            }
        } catch (error) {
            console.error('Error updating coupon:', error);
            
            if (error.response) {
                if (error.response.data && error.response.data.errors) {
                    const errors = Object.values(error.response.data.errors).join(', ');
                    showToast('Validation Error', errors, 'error');
                } else if (error.response.data && error.response.data.message) {
                    showToast('Error', error.response.data.message, 'error');
                } else {
                    showToast('Error', 'Failed to update coupon', 'error');
                }
            } else {
                showToast('Error', 'Network error. Please try again.', 'error');
            }
        } finally {
            const submitBtn = editCouponForm.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'UPDATE COUPON';
        }
    }

    // Open Delete Coupon Modal
    function openDeleteCouponModal(couponId, couponCode) {
        if (!couponId) {
            console.error('No coupon ID provided');
            showToast('Error', 'Cannot delete: No coupon ID found', 'error');
            return;
        }
        
        currentCouponToDelete = couponId;
        
        if (deleteCouponCodeSpan) {
            deleteCouponCodeSpan.textContent = couponCode || 'Unknown Coupon';
        }
        
        if (deleteCouponModal) {
            deleteCouponModal.show();
        }
    }

    // Handle Delete Coupon with Axios
    async function handleDeleteCoupon() {
        if (!currentCouponToDelete) {
            showToast('Error', 'No coupon selected for deletion', 'error');
            return;
        }

        try {
            const response = await axios.delete(`/admin/coupons/${currentCouponToDelete}`);

            if (response.data.success) {
                showToast('Success', response.data.message, 'success');
                deleteCouponModal.hide();
                
                // Remove row from table
                const row = document.querySelector(`tr[data-coupon-id="${currentCouponToDelete}"]`);
                if (row) {
                    row.remove();
                }
                
                // If table is empty, show message
                const tableBody = document.getElementById('couponTableBody');
                if (tableBody && tableBody.children.length === 0) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="9" class="text-center py-5">
                                <div class="text-muted">
                                    <i class="bi bi-tag fs-4 d-block mb-2"></i>
                                    No coupons found
                                </div>
                            </td>
                        </tr>
                    `;
                }
            } else {
                showToast('Error', response.data.message, 'error');
            }
        } catch (error) {
            console.error('Error deleting coupon:', error);
            
            if (error.response && error.response.data && error.response.data.message) {
                showToast('Error', error.response.data.message, 'error');
            } else {
                showToast('Error', 'Failed to delete coupon', 'error');
            }
        } finally {
            currentCouponToDelete = null;
        }
    }

    // Toggle Coupon Status with Axios
    async function toggleCouponStatus(couponId, isActive, switchElement) {
        isTogglingStatus = true;
        
        // Visual feedback - disable switch temporarily
        switchElement.disabled = true;
        
        try {
            const response = await axios.patch(`/admin/coupons/${couponId}/toggle-status`, {
                isActive: isActive
            });

            if (response.data.success) {
                showToast('Success', response.data.message, 'success');
                
                // Update status label if it exists
                const row = switchElement.closest('tr');
                if (row) {
                    const statusLabel = row.querySelector('.status-label');
                    if (statusLabel) {
                        statusLabel.textContent = isActive ? 'Active' : 'Inactive';
                        statusLabel.className = `status-label ${isActive ? 'status-active' : 'status-inactive'}`;
                    }
                }
            } else {
                // Revert the toggle if failed
                switchElement.checked = !isActive;
                showToast('Error', response.data.message, 'error');
            }
        } catch (error) {
            console.error('Error toggling coupon status:', error);
            
            // Revert the toggle on error
            switchElement.checked = !isActive;
            
            if (error.response && error.response.data && error.response.data.message) {
                showToast('Error', error.response.data.message, 'error');
            } else {
                showToast('Error', 'Failed to update coupon status', 'error');
            }
        } finally {
            // Re-enable the switch
            setTimeout(() => {
                switchElement.disabled = false;
                isTogglingStatus = false;
            }, 500);
        }
    }

    // Handle Discount Type Change
    function handleDiscountTypeChange(e) {
        const form = e.target.closest('form');
        const maxDiscountContainer = form.querySelector('[id$="maxDiscountAmountContainer"]');
        const discountValueInput = form.querySelector('input[name="discountValue"]');
        const maxDiscountInput = maxDiscountContainer ? maxDiscountContainer.querySelector('input[name="maxDiscountAmount"]') : null;
        
        if (e.target.value === 'percentage') {
            if (maxDiscountContainer) {
                maxDiscountContainer.style.display = 'block';
                if (maxDiscountInput) {
                    maxDiscountInput.required = false; // Optional
                }
            }
            discountValueInput.max = '100';
            discountValueInput.min = '0.01';
            discountValueInput.placeholder = 'Enter percentage (0.01-100)';
            
            // Validate max discount if it has value
            if (maxDiscountInput && maxDiscountInput.value) {
                handleRealTimeValidation({ target: maxDiscountInput });
            }
        } else {
            if (maxDiscountContainer) {
                maxDiscountContainer.style.display = 'none';
                if (maxDiscountInput) {
                    maxDiscountInput.value = '';
                    clearFieldError(maxDiscountInput);
                }
            }
            discountValueInput.max = '';
            discountValueInput.min = '1';
            discountValueInput.placeholder = 'Enter amount in ₹';
        }
        
        // Validate discount value after type change
        handleRealTimeValidation({ target: discountValueInput });
    }

    // Handle Search with Debounce
    function handleSearch(e) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const searchTerm = e.target.value.trim();
            const currentUrl = new URL(window.location.href);
            
            if (searchTerm) {
                currentUrl.searchParams.set('search', searchTerm);
            } else {
                currentUrl.searchParams.delete('search');
            }
            
            // Reset to page 1 when searching
            currentUrl.searchParams.set('page', '1');
            window.location.href = currentUrl.toString();
        }, 500);
    }

    // Validate all fields in form
    function validateAllFields(form) {
        let isValid = true;
        
        form.querySelectorAll('input, textarea, select').forEach(field => {
            const event = new Event('blur');
            field.dispatchEvent(event);
            
            if (field.classList.contains('is-invalid')) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    // Show Validation Errors (for backward compatibility)
    function showValidationErrors(errors) {
        // Remove existing error containers
        document.querySelectorAll('.alert-container').forEach(container => {
            container.remove();
        });

        // Create error container
        const errorContainer = document.createElement('div');
        errorContainer.className = 'alert-container mb-3';
        
        errors.forEach(error => {
            const alert = document.createElement('div');
            alert.className = 'alert alert-danger alert-dismissible fade show mb-2';
            alert.innerHTML = `
                <i class="bi bi-exclamation-triangle me-2"></i>${error}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            errorContainer.appendChild(alert);
        });

        // Insert at the beginning of the form
        const form = document.activeElement.closest('form');
        form.insertBefore(errorContainer, form.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            errorContainer.remove();
        }, 5000);
    }

    // Show Toast Notification
    function showToast(title, message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelector('.toast-container');
        if (existingToasts) {
            existingToasts.remove();
        }

        // Create toast container
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';

        // Determine icon and color based on type
        const icons = {
            success: 'bi-check-circle-fill text-success',
            error: 'bi-exclamation-circle-fill text-danger',
            warning: 'bi-exclamation-triangle-fill text-warning',
            info: 'bi-info-circle-fill text-primary'
        };

        // Create toast HTML
        toastContainer.innerHTML = `
            <div class="toast align-items-center border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <div class="d-flex align-items-center">
                            <i class="bi ${icons[type] || icons.info} fs-5 me-3"></i>
                            <div>
                                <strong class="me-auto">${title}</strong>
                                <div class="text-muted">${message}</div>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;

        document.body.appendChild(toastContainer);

        // Show toast
        const toastElement = toastContainer.querySelector('.toast');
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 3000
        });
        toast.show();

        // Remove toast after it hides
        toastElement.addEventListener('hidden.bs.toast', function() {
            toastContainer.remove();
        });
    }

    // Old validateCouponData function (kept for backward compatibility)
    function validateCouponData(data) {
        const errors = [];

        // Check coupon code
        const couponCodeRegex = /^[A-Z0-9_-]{4,20}$/;
        if (!couponCodeRegex.test(data.code)) {
            errors.push('Coupon code must be 4-20 characters, uppercase letters, numbers, dash or underscore only');
        }

        // Check description
        if (!data.description || data.description.trim().length === 0) {
            errors.push('Description is required');
        }

        // Check discount value
        const discountValue = parseFloat(data.discountValue);
        if (isNaN(discountValue) || discountValue <= 0) {
            errors.push('Discount value must be greater than 0');
        }

        // For percentage discount
        if (data.discountType === 'percentage') {
            if (discountValue > 100) {
                errors.push('Percentage discount cannot exceed 100%');
            }
            
            // Check max discount amount if provided
            if (data.maxDiscountAmount) {
                const maxDiscount = parseFloat(data.maxDiscountAmount);
                if (isNaN(maxDiscount) || maxDiscount <= 0) {
                    errors.push('Maximum discount amount must be greater than 0');
                }
                if (maxDiscount < discountValue) {
                    errors.push('Maximum discount amount should be reasonable');
                }
            }
        } else {
            if (discountValue < 1) {
                errors.push('Fixed discount must be at least ₹1');
            }
        }

        // Check dates
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (startDate < today) {
            errors.push('Start date cannot be in the past');
        }
        
        if (endDate <= startDate) {
            errors.push('End date must be after start date');
        }

        // Check usage limits
        const usageLimit = parseInt(data.usageLimit);
        if (isNaN(usageLimit) || usageLimit < 1) {
            errors.push('Usage limit must be at least 1');
        }

        const perUserLimit = parseInt(data.perUserLimit);
        if (isNaN(perUserLimit) || perUserLimit < 1) {
            errors.push('Per user limit must be at least 1');
        }

        if (perUserLimit > usageLimit) {
            errors.push('Per user limit cannot exceed total usage limit');
        }

        // Check min purchase amount
        const minPurchase = parseFloat(data.minPurchaseAmount || 0);
        if (isNaN(minPurchase) || minPurchase < 0) {
            errors.push('Minimum purchase amount cannot be negative');
        }

        if (errors.length > 0) {
            showValidationErrors(errors);
            return false;
        }

        return true;
    }
});