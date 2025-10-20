// document.addEventListener("DOMContentLoaded", function () {
//     const variantForm = document.getElementById("variantForm");
//     const cropModal = document.getElementById("cropModal");
//     const cropImage = document.getElementById("cropImage");
//     const closeCropModal = document.getElementById("closeCropModal");
//     const applyCropBtn = document.getElementById("applyCropBtn");
//     const cancelCropBtn = document.getElementById("cancelCropBtn");

//     let cropper = null;
//     let currentFileIndex = 0;
//     const fileInputs = document.querySelectorAll('input[type="file"][name="images"]');
//     const croppedFiles = [];

//     // Initialize first image selection
//     fileInputs.forEach((input, index) => {
//         input.addEventListener("change", (e) => {
//             currentFileIndex = index;
//             handleFile(e.target.files[0]);
//         });
//     });

//     function handleFile(file) {
//         if (!file) return;

//         const reader = new FileReader();
//         reader.onload = function (e) {
//             cropImage.src = e.target.result;
//             cropModal.style.display = "block";

//             // Destroy previous cropper if exists
//             if (cropper) cropper.destroy();
//             cropper = new Cropper(cropImage, {
//                 aspectRatio: 1, // square crop
//                 viewMode: 1,
//             });
//         };
//         reader.readAsDataURL(file);
//     }

//     applyCropBtn.addEventListener("click", () => {
//         if (!cropper) return;

//         cropper.getCroppedCanvas().toBlob((blob) => {
//             // Replace the original file with cropped blob
//             const fileName = fileInputs[currentFileIndex].files[0].name;
//             const croppedFile = new File([blob], fileName, { type: "image/jpeg" });
//             croppedFiles[currentFileIndex] = croppedFile;

//             // Show preview
//             const previewContainer = fileInputs[currentFileIndex].parentElement.querySelector(".preview-container");
//             previewContainer.innerHTML = `<img src="${URL.createObjectURL(croppedFile)}" class="preview-img"/>`;

//             cropper.destroy();
//             cropModal.style.display = "none";
//         }, "image/jpeg");
//     });

//     cancelCropBtn.addEventListener("click", () => {
//         cropper.destroy();
//         cropModal.style.display = "none";
//     });

//     closeCropModal.addEventListener("click", () => {
//         cropper.destroy();
//         cropModal.style.display = "none";
//     });

//     // Form submission
//     variantForm.addEventListener("submit", async (e) => {
//         e.preventDefault();
//         const formData = new FormData();
//         formData.append("color", document.getElementById("color").value);
//         formData.append("price", document.getElementById("price").value);
//         formData.append("discountedPrice", document.getElementById("discountedPrice").value);
//         formData.append("stock", document.getElementById("stock").value);

//         // Append cropped files
//         for (let i = 0; i < fileInputs.length; i++) {
//             if (croppedFiles[i]) {
//                 formData.append("images", croppedFiles[i]);
//             }
//         }

//         try {
//             const response = await fetch(variantForm.action, {
//                 method: "POST",
//                 body: formData,
//             });
//             const data = await response.json();

//             if (data.success) {
//                 Swal.fire({
//                     icon: "success",
//                     title: "Success!",
//                     text: data.message,
//                 }).then(() => {
//                     window.location.href = `/admin/products/variants/${data.productId}`;
//                 });
//             } else {
//                 Swal.fire({
//                     icon: "warning",
//                     title: "Oops!",
//                     text: data.message || "Something went wrong",
//                 });
//             }
//         } catch (err) {
//             console.error(err);
//             Swal.fire({
//                 icon: "error",
//                 title: "Error",
//                 text: "Server error occurred. Please try again.",
//             });
//         }
//     });
// });
