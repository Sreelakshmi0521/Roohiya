document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.status-update').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            const newStatus = this.dataset.status;
            
            updateOrderStatus(orderId, newStatus);
        });
    });

  
    document.querySelectorAll('.update-item-status').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            const productIndex = this.dataset.productIndex;
            const status = this.dataset.status;
            
            updateItemStatus(orderId, productIndex, status);
        });
    });
});

function updateOrderStatus(orderId, newStatus) {
    Swal.fire({
        title: 'Update Order Status',
        text: `Are you sure you want to change the order status to "${newStatus}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            axios.post('/admin/orders/update-status', {
                orderId: orderId,
                status: newStatus
            })
            .then(response => {
                if (response.data.success) {
                    Swal.fire(
                        'Updated!',
                        response.data.message,
                        'success'
                    ).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire(
                        'Error!',
                        response.data.message,
                        'error'
                    );
                }
            })
            .catch(error => {
                console.error('Error updating order status:', error);
                Swal.fire(
                    'Error!',
                    'Failed to update order status',
                    'error'
                );
            });
        }
    });
}

function updateItemStatus(orderId, productIndex, status) {
    Swal.fire({
        title: `Mark as ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        input: 'text',
        inputLabel: 'Reason (optional)',
        inputPlaceholder: 'Enter reason...',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            axios.post('/admin/orders/update-product-status', {
                orderId: orderId,
                productIndex: productIndex,
                status: status,
                reason: result.value || ''
            })
            .then(response => {
                if (response.data.success) {
                    Swal.fire(
                        'Updated!',
                        response.data.message,
                        'success'
                    ).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire(
                        'Error!',
                        response.data.message,
                        'error'
                    );
                }
            })
            .catch(error => {
                console.error('Error updating item status:', error);
                Swal.fire(
                    'Error!',
                    'Failed to update item status',
                    'error'
                );
            });
        }
    });
}