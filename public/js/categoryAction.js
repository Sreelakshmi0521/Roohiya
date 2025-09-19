

document.addEventListener("DOMContentLoaded",()=>{

    const deleteBtn=document.querySelectorAll(".btn-delete")

    deleteBtn.forEach(button=>{
        button.addEventListener("click",function(){
            const categoryId=this.dataset.categoryId;

            Swal.fire({
                title:"Do you want to delete the category",
                icon:"warning",
                showCancelButton:true,
                confirmButtonText:"Yes",
                 cancelButtonText:"Cancel"
            }).then((result)=>{
                if(result.isConfirmed){
                    axios.post(`/admin/categories/delete/${categoryId}`)
                    .then(res=>{
                         const data=res.data
                         if(data.success){
                            Swal.fire("Success",data.message,"success")
                            .then(()=>{
                                  location.reload()
                            })
                         }else{
                              Swal.fire("Error",data.message,"error")
                         }
                    }).catch(error=>{
                    Swal.fire("Error","something went wrong","error")
                })

                }
            })

            
        })
    })

})