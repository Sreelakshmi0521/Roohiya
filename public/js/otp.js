document.addEventListener('DOMContentLoaded', () => {
    const timerElement = document.getElementById('timer');
    const verifyBtn = document.querySelector("#otpForm button");
    const resendLink = document.getElementById("resendOtp");
    const otpForm = document.getElementById("otpForm");

    let timeLeft = 60;
    let canResend = false;
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

    function startTimer() {
        clearInterval(countdown);
        timeLeft = 60;
        verifyBtn.disabled = false;
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
                verifyBtn.disabled = true;

                // Toastify toast for time expired (error style)
                Toastify({
                    text: "Time Expired: Your OTP has expired. Please resend OTP.",
                    duration: 5000,
                    gravity: "top",
                    position: "center",
                    style: { background: "#e74c3c" }, // red for error
                    stopOnFocus: true
                }).showToast();

                enableResend();
            }
        }, 1000);
    }

    // otpForm submit
    otpForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const otp = document.getElementById("otp").value.trim();

        if (!otp) {
            Toastify({
                text: "Please enter the OTP.",
                duration: 4000,
                gravity: "top",
                position: "center",
                style: { background: "#f39c12" } // orange for warning
            }).showToast();
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            Toastify({
                text: "OTP must be 6 digits",
                duration: 4000,
                gravity: "top",
                position: "center",
                style: { background: "#f39c12" }
            }).showToast();
            return;
        }

        try {
            const res = await axios.post("/user/verifyOtp", { otp });

            if (res.data.success) {
                // Success toast (auto-redirect after ~2s delay)
                Toastify({
                    text: res.data.message || "Verified successfully!",
                    duration: 2000,
                    gravity: "top",
                    position: "center",
                    style: { background: "#27ae60" } // green for success
                }).showToast();

                setTimeout(() => {
                    window.location.href = "/user/homepage";
                }, 2000);
            } else {
                Toastify({
                    text: res.data.message || "Verification failed!",
                    duration: 5000,
                    gravity: "top",
                    position: "center",
                    style: { background: "#e74c3c" }
                }).showToast();
            }
        } catch (error) {
            Toastify({
                text: "Something went wrong, please try again later.",
                duration: 5000,
                gravity: "top",
                position: "center",
                style: { background: "#e74c3c" }
            }).showToast();
        }
    });

    // resendOtp click
    resendLink.addEventListener("click", async (e) => {
        e.preventDefault();
        if (!canResend) return;

        disableResend();

        try {
            const res = await axios.post("/user/resendOtp");
            if (res.data.success) {
                Toastify({
                    text: res.data.message || "OTP sent successfully!",
                    duration: 4000,
                    gravity: "top",
                    position: "center",
                    style: { background: "#27ae60" }
                }).showToast();

                startTimer();
            } else {
                Toastify({
                    text: res.data.message || "Failed to resend OTP.",
                    duration: 5000,
                    gravity: "top",
                    position: "center",
                    style: { background: "#e74c3c" }
                }).showToast();

                enableResend();
            }
        } catch (error) {
            Toastify({
                text: "Could not resend OTP. Try again later.",
                duration: 5000,
                gravity: "top",
                position: "center",
                style: { background: "#e74c3c" }
            }).showToast();

            enableResend();
        }
    });

    startTimer();
});