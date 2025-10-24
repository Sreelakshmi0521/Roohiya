document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("editProfileForm")
  const submitBtn = form.querySelector("button[type='submit']")
  const imageInput = document.getElementById("profileImage")
  const previewImg = document.getElementById("currentProfileImg")
  
  let isProcessing = false

  submitBtn.disabled = false


  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (!file) return

    const validTypes = ["image/jpeg", "image/png", "image/gif"]
    if (!validTypes.includes(file.type)) {
      Toastify({
        text: "Invalid image type! Please upload JPG, PNG, or GIF.",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#FF0000",
      }).showToast()
      imageInput.value = ""
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      Toastify({
        text: "File too large! Max size is 2MB.",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#FF0000",
      }).showToast()
      imageInput.value = ""
      return
    }

    const reader = new FileReader()
    reader.onload = function (e) {
      previewImg.src = e.target.result
    }
    reader.readAsDataURL(file)

    Toastify({
      text: "Image selected successfully!",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "#4CAF50",
    }).showToast()
  })

  // --- FORM SUBMIT ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    if (isProcessing) return
    isProcessing = true
    submitBtn.disabled = true
    const originalText = submitBtn.textContent
    submitBtn.textContent = "Saving..." 

    Toastify({
      text: "Uploading your changes...",
      duration: 2000,
      gravity: "top",
      position: "right",
      backgroundColor: "#2196F3",
    }).showToast()

    const formData = new FormData(form)

    try {
      const response = await axios.post("/user/editProfile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (response.data.success) {
        if (response.data.redirectOtp) {
          Toastify({
            text: "OTP sent to your new email. Please verify to update your email.",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#4CAF50",
          }).showToast()

          setTimeout(() => {
            window.location.href = `/user/verifyEmailOtp?email=${encodeURIComponent(
              response.data.email
            )}`
          }, 1500)
        } else {
          Toastify({
            text: "Profile updated successfully!",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#4CAF50",
          }).showToast()

          setTimeout(() => {
            window.location.href = "/user/profile"
          }, 1500)
        }
      } else {
        Toastify({
          text:
            "Something went wrong: " + (response.data.message || "Try again"),
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#FF0000",
        }).showToast()
        submitBtn.disabled = false
        submitBtn.textContent = originalText
        isProcessing = false
      }
    } catch (err) {
      console.error("Axios error:", err.response?.data || err.message)
      Toastify({
        text:
          err.response?.data?.message ||
          "Server error. Please try again later!",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#FF0000",
      }).showToast()
      submitBtn.disabled = false
      submitBtn.textContent = originalText
      isProcessing = false
    }
  })


  const cancelBtn = document.getElementById("cancelBtn")
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      window.location.href = "/user/profile"
    })
  }
})
