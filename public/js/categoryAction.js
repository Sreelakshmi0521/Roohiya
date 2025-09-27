

document.addEventListener("DOMContentLoaded",()=>{

    const toggleBtn=document.querySelectorAll('.toggle-btn')

   toggleBtn.forEach(button=>{
        button.addEventListener("click",async function(e){
            e.preventDefault()

            const categoryId=this.dataset.id;
            const btn=this
            const isListed=this.dataset.status==="true"
             const action=isListed ? "Unlist": "List"
            
           const result=await Swal.fire({
                title:`Do you want to  ${action} the category`,
                icon:"question",
                showCancelButton:true,
                confirmButtonText:"Yes",
                 cancelButtonText:"Cancel"
            })
            if(result.isConfirmed){
                try {
                    const res=await axios.post(`/admin/categories/toggle/${categoryId}`)
                    const data=res.data

                    if(data.success){
                        btn.textContent=data.isListed ? "Unlist":"List"
                        btn.dataset.status=data.isListed
                        btn.classList.toggle('btn-list')
                        btn.classList.toggle('btn-unlist')

                        const statusCell = btn.closest('tr').querySelector('td:nth-child(4)')
                         statusCell.textContent = data.isListed ? 'Listed' : 'Unlisted'
                    
                    
                         Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: data.message,
                        timer: 2000,
                        showConfirmButton: false
                        });
                                
                     }else{
                        Swal.fire('Oops!', data.message, 'warning')
                     }


                } catch (error) {
                     Swal.fire('Error!', 'Something went wrong', 'error');
                    console.error(error);
                }
            }

            
        })
    })

})