document.addEventListener('DOMContentLoaded', () => {
    const timerElement = document.getElementById('timer');
    const otpForm = document.getElementById("otpForm");
    const resetForm = document.getElementById("resetForm");
    const verifyBtn = otpForm ? otpForm.querySelector("button") : null;
    const resendLink = document.getElementById("resendOtp");
    const newForpasswordForm = document.getElementById("newForpasswordForm");

    let timeLeft = 60;
    let canResend = false;
    let countdown;

    function showToast(message, type = "info", duration = 3000) {
        Toastify({
            text: message,
            duration: duration,
            gravity: "top",
            position: "right",
            close: true,
            backgroundColor:
                type === "success" ? "green" :
                type === "error" ? "red" :
                type === "warning" ? "orange" :
                "blue"
        }).showToast();
    }

    function enableResend() {
        canResend = true;
        if(resendLink){
            resendLink.style.pointerEvents = "auto";
            resendLink.style.opacity = "1";
        }
    }

    function disableResend() {
        canResend = false;
        if(resendLink){
            resendLink.style.pointerEvents = "none";
            resendLink.style.opacity = "0.5";
        }
    }

    function startTimer(){
        clearInterval(countdown);
        timeLeft = 60;
        if(verifyBtn) verifyBtn.disabled = false;
        disableResend();

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
                showToast("Your OTP has expired. Please resend OTP.", "error");
                enableResend();
            }
        }, 1000);
    }

    // Forgot Password Form
    if(resetForm){
        resetForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const submitButton = resetForm.querySelector("button[type='submit']");
            submitButton.disabled = true;

            if(!email){
                showToast("Please enter your email.", "warning");
                submitButton.disabled = false;
                return;
            }

            const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailValid.test(email)) {
                showToast("Please enter a valid email address.", "error");
                submitButton.disabled = false;
                return;
            }

            try {
                showToast("Sending OTP, please wait...", "info", 2000);

                const res = await axios.post("/user/forgotPassword",{email});
                if(res.data.success){
                    showToast(res.data.message, "success", 2000);
                    setTimeout(() => window.location.href="/user/recoveryOtp", 2000);
                } else {
                    showToast(res.data.message, "error");
                }
            } catch (error) {
                showToast("Something went wrong, please try again later.", "error");
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    // OTP Verification Form
    if(otpForm){
        otpForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const otp = document.getElementById("otp").value.trim();
            if(!otp){
                showToast("Please enter the OTP.", "warning");
                return;
            }

            if (!/^\d{6}$/.test(otp)){
                showToast("OTP must be 6 digits.", "warning");
                return;
            }

            try {
                const res = await axios.post("/user/recoveryOtp",{otp});
                if(res.data.success){
                    showToast(res.data.message, "success", 2000);
                    setTimeout(() => window.location.href="/user/newForpassword", 2000);
                } else {
                    showToast(res.data.message, "error");
                }
            } catch (error) {
                showToast("Something went wrong, please try again later.", "error");
            }
        });
        startTimer();
    }

    // Resend OTP
    if(resendLink){
        resendLink.addEventListener("click", async (e) => {
            e.preventDefault();
            if(!canResend) return;

            disableResend();
            try {
                const res = await axios.post("/user/resendRecoveryOtp");
                if(res.data.success){
                    showToast(res.data.message, "success");
                    startTimer();
                } else {
                    showToast(res.data.message, "error");
                    enableResend();
                }
            } catch (error) {
                showToast("Could not resend OTP. Try again later.", "error");
                enableResend();
            }
        });
    }

    // New Password Form
    if(newForpasswordForm){
        newForpasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const newPassword = document.getElementById("newPassword").value.trim();
            const confirmPassword = document.getElementById("confirmPassword").value.trim();

            if(!newPassword || !confirmPassword){
                showToast("All fields are required.", "warning");
                return;
            }

            if(newPassword !== confirmPassword){
                showToast("Passwords do not match.", "warning");
                return;
            }

            if(!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/.test(newPassword)){
                showToast("Password must be at least 6 characters and include letters, numbers, and symbols.", "warning");
                return;
            }

            try {
                const res = await axios.post("/user/newForpassword",{newPassword,confirmPassword});
                if(res.data.success){
                    showToast(res.data.message, "success", 2000);
                    setTimeout(() => window.location.href="/user/login", 2000);
                } else {
                    showToast(res.data.message, "error");
                }
            } catch (error) {
                showToast("Something went wrong, please try again later.", "error");
            }
        });
    }
});
