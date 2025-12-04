document.addEventListener('DOMContentLoaded', function() {
   
    document.querySelectorAll('.status-update').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            const newStatus = this.dataset.status;
            
            updateOrderStatus(orderId, newStatus);
        });
    });

   
    document.getElementById('refreshOrders')?.addEventListener('click', function() {
        location.reload();
    });

    document.querySelectorAll('.dropdown-item.status-update').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const orderId = this.dataset.orderId;
            const newStatus = this.dataset.status;
            
            updateOrderStatus(orderId, newStatus);
        });
    });

    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
        const filterInputs = filterForm.querySelectorAll('select');
        filterInputs.forEach(input => {
            input.addEventListener('change', function() {
                filterForm.submit();
            });
        });
    }
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