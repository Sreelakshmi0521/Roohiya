
 document.addEventListener('DOMContentLoaded', () => {
            const timerElement = document.getElementById('timer');
            const verifyBtn = document.querySelector("#otpForm button");
            const  resendLink=document.getElementById("resendOtp")
            const otpForm = document.getElementById("otpForm");

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
    
        
        // otpForm submit
        otpForm.addEventListener("submit",async(e)=>{
            e.preventDefault();

            const otp=document.getElementById("otp").value.trim();

            if (!otp) {
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

            try{
                const res=await axios.post("/user/verifyOtp",{otp})

                if(res.data.success){
                    Swal.fire({
                        icon:"success",
                        title:"verified",
                        text:res.data.message,
                        timer:2000,
                        showConfirmButton:false
                    }).then(()=>{
                        window.location.href="/user/homepage"
                    })
                }else{
                    Swal.fire({
                        icon:"error",
                        title:"Wrong!",
                        text:res.data.message,

                })
               }
            }catch(error){
             Swal.fire({
            icon: "error",
            title: "Server Error",
            text: "Something went wrong, please try again later."
        });

         }
        });
        
        // resendOtp submit
        resendLink.addEventListener("click",async(e)=>{
            e.preventDefault()
            if(!canResend)return;

           disableResend()

            try {
                const res=await axios.post("/user/resendOtp")
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
                 });

                  enableResend()
            }
        })
        startTimer()
        
    })

