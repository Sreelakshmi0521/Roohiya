document.addEventListener('DOMContentLoaded', function() {
    const toggleButtons = document.querySelectorAll('.toggle-btn');

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', async function() {
            const variantId = this.dataset.id;
            const currentStatus = this.dataset.status === 'true';

          
            const { isConfirmed } = await Swal.fire({
                title: `Do you want to ${currentStatus ? 'unlist' : 'list'} this variant?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: currentStatus ? 'Yes, Unlist' : 'Yes, List',
                cancelButtonText: 'Cancel'
            });

            if (!isConfirmed) return;

            try {
                const response = await axios.patch(`/admin/products/variants/toggle/${variantId}`);

                if (response.data.success) {
                    this.dataset.status = (!currentStatus).toString();
                    this.textContent = !currentStatus ? 'Unlist' : 'List';

                    const statusCell = this.closest('tr').querySelector('.status');
                    statusCell.textContent = !currentStatus ? 'Listed' : 'Unlisted';
                    statusCell.className = `status ${!currentStatus ? 'listed' : 'unlisted'}`;

                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: response.data.message,
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            } catch (error) {
                console.error( error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Failed to update variant status'
                })
            }
        })
    })
})
