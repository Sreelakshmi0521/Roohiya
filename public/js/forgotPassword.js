
 document.addEventListener('DOMContentLoaded', () => {
            const timerElement = document.getElementById('timer');
            const otpForm=document.getElementById("otpForm")
            const resetForm=document.getElementById("resetForm")
            const verifyBtn = otpForm?otpForm.querySelector("button"):null
            const  resendLink=document.getElementById("resendOtp")
            const newForpasswordForm=document.getElementById("newForpasswordForm")
          
            let timeLeft = 60;
            let canResend=false;
            let countdown;

     function enableResend() {
        canResend = true;
        resendLink.style.pointerEvents = "auto";
        resendLink.style.opacity = "1";
    }

      function disableResend() {
        canResend = false;
        if(resendLink){
        resendLink.style.pointerEvents = "none";
        resendLink.style.opacity = "0.5";
        }
    }

               function startTimer(){
                clearInterval(countdown)
                timeLeft=60
               if(verifyBtn) verifyBtn.disabled=false
                 disableResend()
               
            countdown = setInterval(() => {
                if (timeLeft >= 0) {
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    timerElement.textContent = `Remaining: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    timeLeft--;
                } else {
                    clearInterval(countdown);
                    timerElement.textContent = 'Time expired';
                     if (verifyBtn) verifyBtn.disabled = true;
                    Swal.fire({
                        icon: "error",
                        title: "Time Expired",
                        text: "Your OTP has expired. Please resend OTP."
                    });
                     enableResend()
                }
            }, 1000);
        }
    


    if(resetForm){
        resetForm.addEventListener("submit",async(e)=>{
            e.preventDefault()
            const email = document.getElementById("email").value.trim() 
            const submitButton=resetForm.querySelector("button[type='submit']")
            submitButton.disabled=true;
            
            if(!email){
                 Swal.fire({
                    icon: "warning",
                    title: "Empty Field",
                    text: "Please enter your  email ."
                });
                submitButton.disabled = false;
                return;
            }
            const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailValid.test(email)) {
               Swal.fire({
                icon: "error",
                title: "Invalid Email",
                text: "Please enter a valid email address."
             })
             submitButton.disabled = false;
                 return
               }
            try {
                      
                 Swal.fire({
                    title:"Sending..",
                    text:"Please Wait",
                    allowOutsideClick:false,
                    position:"center",
                    customClass: {
                    popup: 'swal-custom'
                     },
                    didOpen:()=>{
                        Swal.showLoading()
                    }
                 })

                const res= await axios.post("/user/forgotPassword",{email})
                if(res.data.success){
                    Swal.fire({
                        icon:"success",
                        title:"verified",
                        text:res.data.message,
                        timer: 2000,
                        showConfirmButton: false
                    }).then(()=>{
                        window.location.href="/user/recoveryOtp"
                    })
                }else{
                    Swal.fire({ 
                        icon: "error",
                         title: "Wrong", 
                        text: res.data.message 
                    });
                }
            } catch (error) {
                  Swal.fire({
                    icon: "error",
                    title: "Server Error",
                    text: "Something went wrong, please try again later."
            })

            }finally{
                submitButton.disabled = false;
            }
        })
    }

     
   if(otpForm){
    otpForm.addEventListener("submit",async(e)=>{
        e.preventDefault()

        const otp=document.getElementById("otp").value.trim()
        if(!otp){
                Swal.fire({
                 icon: "warning",
                 title: "Empty Field",
                 text: "Please enter the OTP."
                });
                return;
            }  

            if (!/^\d{6}$/.test(otp)){
            Swal.fire({
                icon: "warning",
                title: "Invalid Input",
                text: "OTP must be 6 digits"
            });
            return;
            }
            try {

         
                const res= await axios.post("/user/recoveryOtp",{otp})
                if(res.data.success){
                    Swal.fire({
                        icon:"success",
                        title:"verified",
                        text:res.data.message,
                        timer:2000,
                        showConfirmButton:false
                    }).then(()=>{
                        window.location.href="/user/newForpassword"
                    })
                }else{
                    Swal.fire({
                         icon:"error",
                        title:"Wrong!",
                        text:res.data.message
                    })
                }

                
            } catch (error) {
             Swal.fire({
            icon: "error",
            title: "Server Error",
            text: "Something went wrong, please try again later."
            });

            }
           
        

    })
       startTimer();
   }

   if(resendLink){
   resendLink.addEventListener("click",async(e)=>{

    e.preventDefault()
    if(!canResend)return 

    disableResend()
    try {
        const res=await axios.post("/user/resendRecoveryOtp")
        if(res.data.success){
              Swal.fire({
                        icon:"success",
                        title:"OTP send",
                        text:res.data.message
                    })
                    startTimer()
        }else{
                 Swal.fire({
                        icon:"error",
                        title:"error",
                        text:res.data.message
                    })
                    enableResend()
       
                }

    } catch (error) {
         Swal.fire({ icon: "error",
                  title: "Server Error", 
                  text: "Could not resend OTP. Try again later."
                 })
                 enableResend()
  
                }
   })
    


}


// new password setting
if(newForpasswordForm){
    newForpasswordForm.addEventListener("submit",async(e)=>{
        e.preventDefault()

        const newPassword=document.getElementById("newPassword").value.trim()
       const confirmPassword=document.getElementById("confirmPassword").value.trim()
       
       if(!newPassword||!confirmPassword){
        Swal.fire({
             icon: "warning",
              title: "warning",
             text: "All fields are required"
        })
        return 
      }
      if(newPassword!==confirmPassword){
          Swal.fire({
             icon: "warning",
              title: "warning",
             text: "Incorrect password"
        })
        return 
      }
      if(!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/.test(newPassword)){
        Swal.fire({
            icon:"warning",
            title:"Invalid Input",
            text: "Password must be at least 6 characters and include letters, numbers, and symbols"
        })
         return
      }

      try {
        const res= await axios.post("/user/newForpassword",{newPassword,confirmPassword})
        if(res.data.success){
            Swal.fire({
                icon:"success",
                title:"Success",
                text:res.data.message,
                timer:2000,
                showConfirmButton:false
            }).then(()=>{
                window.location.href="/user/login"
            })
        }else{
            Swal.fire({
            icon:"error",
           title:"error",
           text:res.data.message
        })
             
        }
      } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Server Error",
            text: "Something went wrong, please try again later."
            });
      }

   
    })

    
}

})


