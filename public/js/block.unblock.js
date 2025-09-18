document.addEventListener("DOMContentLoaded",()=>{
    const blockUnblockbtn=document.querySelectorAll(".block-unblock-btn")

    blockUnblockbtn.forEach(button=>{
        button.addEventListener("click",function(){

        const userId=this.dataset.userId
        const isCurrentlyBlocked=this.dataset.status ==="true"
        const action =isCurrentlyBlocked ? "unblock":"block"

        Swal.fire({
            title:`Do you want to ${action} this User ?`,
            icon:"warning",
            showCancelButton:true,
            confirmButtonText:"Yes",
            cancelButtonText:"Cancel"
        }).then((result)=>{

            if(result.isConfirmed){
                axios.post(`/admin/customers/${action}/${userId}`)
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