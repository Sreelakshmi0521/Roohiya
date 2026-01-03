document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("editProfileForm");
  const submitBtn = document.getElementById("saveBtn");
  const imageInput = document.getElementById("profileImage");
  const previewImg = document.getElementById("currentProfileImg");

  const cropperModal = document.getElementById("cropperModal");
  const imageToCrop = document.getElementById("imageToCrop");
  const closeCropper = document.getElementById("closeCropper");
  const cancelCrop = document.getElementById("cancelCrop");
  const applyCrop = document.getElementById("applyCrop");

  let cropper = null;
  let selectedFile = null;
  let croppedBlob = null;

  let isProcessing = false;

  // === Open crop modal ===
  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      Toastify({
        text: "Invalid image type! Only JPG or PNG allowed.",
        backgroundColor: "#FF0000",
      }).showToast();
      imageInput.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      Toastify({
        text: "File too large! Max size is 2MB.",
        backgroundColor: "#FF0000",
      }).showToast();
      imageInput.value = "";
      return;
    }

    selectedFile = file;

    const reader = new FileReader();
    reader.onload = (event) => {
      imageToCrop.src = event.target.result;

      // SHOW MODAL WITH SMOOTH ANIMATION
      cropperModal.classList.add("active");

      // Initialize Cropper
      if (cropper) cropper.destroy();

      cropper = new Cropper(imageToCrop, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1,
        responsive: true,
        cropBoxResizable: true,
        zoomable: true,
        rotatable: true,
      });
    };
    reader.readAsDataURL(file);
  });

  // === Close modal (X button & Cancel button) ===
  closeCropper.onclick = cancelCrop.onclick = () => {
    // HIDE MODAL WITH SMOOTH ANIMATION
    cropperModal.classList.remove("active");

    if (cropper) {
      cropper.destroy();
      cropper = null;
    }

    // Clear file input if user cancels
    imageInput.value = "";
    selectedFile = null;
    croppedBlob = null;
  };

  // === Apply crop ===
  applyCrop.onclick = () => {
    if (!cropper) return;

    cropper.getCroppedCanvas({
      width: 400,
      height: 400,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    }).toBlob((blob) => {
      croppedBlob = blob;

      // Show cropped preview in profile picture
      const croppedUrl = URL.createObjectURL(blob);
      previewImg.src = croppedUrl;

      // HIDE MODAL WITH SMOOTH ANIMATION
      cropperModal.classList.remove("active");

      cropper.destroy();
      cropper = null;

      Toastify({
        text: "Image cropped successfully! Ready to save.",
        backgroundColor: "#4CAF50",
      }).showToast();
    }, "image/jpeg", 0.95);
  };

  // === Zoom & Rotate controls ===
  document.querySelector(".zoom-in").onclick = () => cropper && cropper.zoom(0.1);
  document.querySelector(".zoom-out").onclick = () => cropper && cropper.zoom(-0.1);
  document.querySelector(".rotate-left").onclick = () => cropper && cropper.rotate(-45);
  document.querySelector(".rotate-right").onclick = () => cropper && cropper.rotate(45);
  document.getElementById("zoomSlider").oninput = (e) => {
    if (cropper) cropper.zoomTo(e.target.value);
  };

  // === Form Submit (unchanged) ===
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    isProcessing = true;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    const formData = new FormData(form);

    if (croppedBlob) {
      formData.delete("profileImage");
      formData.append("profileImage", croppedBlob, "profile_cropped.jpg");
    }

    try {
      const response = await axios.post("/user/editProfile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        if (response.data.redirectOtp) {
          Toastify({ text: "OTP sent to new email.", backgroundColor: "#4CAF50" }).showToast();
          setTimeout(() => {
            window.location.href = `/user/verifyEmailOtp?email=${encodeURIComponent(response.data.email)}`;
          }, 1500);
        } else {
          Toastify({ text: "Profile updated successfully!", backgroundColor: "#4CAF50" }).showToast();
          setTimeout(() => { window.location.href = "/user/profile"; }, 1500);
        }
      } else {
        throw new Error(response.data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      let msg = err.response?.data?.message || "Server error. Please try again.";
      if (err.response?.data?.errors) {
        msg = Object.values(err.response.data.errors).join("<br>");
      }
      Toastify({ text: msg, backgroundColor: "#FF0000" }).showToast();
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
      isProcessing = false;
    }
  });

  // Cancel button
  document.getElementById("cancelBtn").addEventListener("click", () => {
    window.location.href = "/user/profile";
  });
});