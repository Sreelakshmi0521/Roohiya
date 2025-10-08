document.addEventListener('DOMContentLoaded', function() {
    const tables = document.querySelectorAll('.products-table, .variants-table')
    tables.forEach(table => {
        table.addEventListener('click', async function(e) {
            const btn = e.target.closest('.toggle-btn')
            if (!btn) return

            const id = btn.dataset.id
            const type = btn.dataset.type
            const currentStatus = btn.dataset.status === 'true'

         
            const { isConfirmed } = await Swal.fire({
                title: `Do you want to ${currentStatus ? 'unlist' : 'list'} this ${type}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: currentStatus ? 'Yes, Unlist' : 'Yes, List',
                cancelButtonText: 'Cancel'
            })
            if (!isConfirmed) return

            const url = type === 'variant'
                 ? `/admin/products/variants/toggle/${id}`
                : `/admin/products/toggle/${id}`

            try {
                const response = await axios.patch(url)

                if (response.data.success) {
                    btn.dataset.status = (!currentStatus).toString()
                     btn.textContent = !currentStatus ? 'Unlist' : 'List'

                    const statusCell = btn.closest('tr').querySelector('.status')
                    statusCell.textContent = !currentStatus ? 'Listed' : 'Unlisted'
                    statusCell.className = `status ${!currentStatus ? 'listed' : 'unlisted'}`

                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: response.data.message,
                        showConfirmButton: false,
                        timer: 1500
                    })
                }
            } catch (error) {
                console.error(error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: `Failed to update ${type} status`
                })
            }
        })
    })
})
