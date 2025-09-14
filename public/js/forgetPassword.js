
 document.addEventListener('DOMContentLoaded', () => {
            const timerElement = document.getElementById('timer');
            const verifyBtn = document.querySelector("#otpForm button");
            const  resendLink=document.getElementById("resendOtp")
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
        resendLink.style.pointerEvents = "none";
        resendLink.style.opacity = "0.5";
    }

               function startTimer(){
                clearInterval(countdown)
                timeLeft=60
                verifyBtn.disabled=false
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
                    verifyBtn.disabled = true;
                    Swal.fire({
                        icon: "error",
                        title: "Time Expired",
                        text: "Your OTP has expired. Please resend OTP."
                    });
                     enableResend()
                }
            }, 1000);
        }
    

    const resetForm=document.getElementById("resetForm")

    if(resetForm){
        resetForm.addEventListener("submit",async(e)=>{
            e.preventDefault()
            const email = document.getElementById("email").value.trim() 

            if(!email){
                 Swal.fire({
                    icon: "warning",
                    title: "Empty Field",
                    text: "Please enter your  email ."
                });
                return;
            }
            // const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            // if (!emailValid.test(email)) {
            //    swal("Error", "Please enter a valid email address", "error");
            //     return;
            //    }
            try {
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
                        text: res.data.message });
                }
            } catch (error) {
                  Swal.fire({
                    icon: "error",
                    title: "Server Error",
                    text: "Something went wrong, please try again later."
            })

            }
        })
    }

   const otpForm=document.getElementById("otpForm")
     
   if(otpForm){
    otpForm.addEventListener("submit",async(e)=>{
        e.preventDefault()

        const otp=document.getElementById("otp")
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
        
        

    })
   }
    




})


