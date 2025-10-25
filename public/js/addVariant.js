

document.addEventListener('DOMContentLoaded', function() {
    let cropper = null;
    let currentImageIndex = null;
    let originalFile = null;
    let isSubmitting = false; 
      const form = document.getElementById("variantForm");
  const submitBtn = document.querySelector(".save-btn");


    const imageInputs = document.querySelectorAll('input[name="variantImages"]');
    imageInputs.forEach((input, index) => {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const previewImg = input.closest('.file-upload-group').querySelector('.preview-img');
                    previewImg.src = e.target.result;
                    previewImg.style.display = 'block';

                    const cropBtn = input.closest('.file-upload-group').querySelector('.crop-btn');
                    cropBtn.style.display = 'inline-block';

                    originalFile = file; 
                };
                reader.readAsDataURL(file);
            }
        });
    });


    const cropBtns = document.querySelectorAll('.crop-btn');
    cropBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            currentImageIndex = parseInt(this.dataset.imageIndex);
            const input = document.getElementById(`image${currentImageIndex}`);
            const file = input.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const cropImage = document.getElementById('cropImage');
                    cropImage.src = e.target.result;
                    document.getElementById('cropModal').style.display = 'block';

                    if (cropper) {
                        cropper.destroy();
                    }
                    cropper = new Cropper(cropImage, {
                        aspectRatio: 1,
                        viewMode: 1,
                        autoCropArea: 0.8,
                        dragMode: 'move',
                        preview: false 
                    });
                };
                reader.readAsDataURL(file);
            }
        });
    });

  
    document.getElementById('closeCropModal').addEventListener('click', closeCropModal);
    document.getElementById('cancelCropBtn').addEventListener('click', closeCropModal);
    document.getElementById('cropModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeCropModal();
        }
    });

    function closeCropModal() {
        document.getElementById('cropModal').style.display = 'none';
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    }

    // Apply crop
    document.getElementById('applyCropBtn').addEventListener('click', function() {
        if (cropper && currentImageIndex) {
            const canvas = cropper.getCroppedCanvas({
                width: 800, 
                height: 800,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });

            canvas.toBlob(function(blob) {
                const croppedFile = new File([blob], originalFile.name.replace(/\.[^/.]+$/, '_cropped.jpg'), {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                });

      
                const dt = new DataTransfer();
                dt.items.add(croppedFile);
                const input = document.getElementById(`image${currentImageIndex}`);
                input.files = dt.files;

             
                const reader = new FileReader();
                reader.onload = function(e) {
                    const previewImg = input.closest('.file-upload-group').querySelector('.preview-img');
                    previewImg.src = e.target.result;
                };
                reader.readAsDataURL(croppedFile);

                closeCropModal();
                originalFile = null;
            }, 'image/jpeg', 0.9); 
        }
    });

    document.getElementById('variantForm').addEventListener('submit', function(e) {
        const submitBtn = document.querySelector('.save-btn');
        
        if (isSubmitting || submitBtn.disabled) {
            e.preventDefault();
            return;
        }
        
        isSubmitting = true;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="custom-spinner"></div> Adding Variant...';

        const color = document.getElementById('color').value.trim();
        const price = document.getElementById('price').value;
        const stock = document.getElementById('stock').value;
        const files = Array.from(imageInputs).filter(input => input.files.length > 0);

        if (!color || !price || !stock) {
            e.preventDefault();
            Toastify({
                text: 'Please fill all required fields.',
                duration: 2000,
                gravity: 'top',
                position: 'right',
                backgroundColor: 'linear-gradient(to right, #ff6b6b, #ee5a24)',
                stopOnFocus: true,
                callback: () => { 
                    isSubmitting = false;
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Add Variant';
                }
            }).showToast();
            return;
        }

        if (files.length !== 3) {
            e.preventDefault();
            Toastify({
                text: 'Please upload exactly 3 images.',
                duration: 2000,
                gravity: 'top',
                position: 'right',
                backgroundColor: 'linear-gradient(to right, #ff6b6b, #ee5a24)',
                stopOnFocus: true,
                callback: () => {
                    isSubmitting = false;
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Add Variant';
                }
            }).showToast();
            return;
        }

     
    });
});