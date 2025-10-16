document.addEventListener('DOMContentLoaded', function() {
    const reviewForm = document.getElementById('review-form');
    const stars = document.querySelectorAll('.star-rating .fa-star');
    const ratingInput = document.getElementById('rating-value');
    let currentRating = 0;

 
    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = parseInt(star.getAttribute('data-rating'));
            ratingInput.value = currentRating;
            updateStars(currentRating);
        });
        star.addEventListener('mouseover', () => updateStars(parseInt(star.getAttribute('data-rating'))));
        star.addEventListener('mouseout', () => updateStars(currentRating));
    });

    function updateStars(rating) {
        stars.forEach(star => {
            star.style.color = parseInt(star.getAttribute('data-rating')) <= rating ? '#ffc107' : '#e0e0e0';
        });
    }

    reviewForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const rating = ratingInput.value;
        const comment = document.getElementById('review-comment').value.trim();
        const productId = document.getElementById('product-id').value;
        const userName = document.getElementById('review-form').dataset.username || 'You';

        if (!rating || rating === '0') {
            Swal.fire({
                title: 'Error',
                text: 'Please select a rating!',
                icon: 'error',
                confirmButtonColor: '#d4af37'
            });
            return;
        }

        if (!comment) {
            Swal.fire({
                title: 'Error',
                text: 'Please write a review comment!',
                icon: 'error',
                confirmButtonColor: '#d4af37'
            });
            return;
        }

        const submitBtn = reviewForm.querySelector('.submit-review-btn');
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            const { data } = await axios.post('/user/review/add', {
                productId,
                rating: parseInt(rating),
                comment
            });

            if (data.success) {
                Swal.fire({
                    title: 'Success!',
                    text: data.message,
                    icon: 'success',
                    confirmButtonColor: '#d4af37'
                });


                let reviewsGrid = document.querySelector('.reviews-grid');
                if (!reviewsGrid) {
                    reviewsGrid = document.createElement('div');
                    reviewsGrid.classList.add('reviews-grid');
                    document.querySelector('.reviews-section').appendChild(reviewsGrid);
                    const noReviews = document.querySelector('.no-reviews');
                    if (noReviews) noReviews.remove();
                }

                const newReviewCard = document.createElement('div');
                newReviewCard.classList.add('review-card');
                newReviewCard.innerHTML = `
                    <div class="review-header">
                        <div class="reviewer-info">
                            <span class="reviewer-name">${userName}</span>
                            <div class="review-rating">
                                ${'<i class="fas fa-star active"></i>'.repeat(rating)}
                                ${'<i class="fas fa-star"></i>'.repeat(5 - rating)}
                            </div>
                        </div>
                        <span class="review-date">${new Date().toLocaleDateString()}</span>
                    </div>
                    <p class="review-content">${comment}</p>
                `;
                reviewsGrid.prepend(newReviewCard);

                reviewForm.reset();
                updateStars(0);
                currentRating = 0;

            } else {
                Swal.fire({
                    title: 'Error',
                    text: data.message,
                    icon: 'error',
                    confirmButtonColor: '#d4af37'
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: "Something went wrong. Please try again.",
                icon: 'error',
                confirmButtonColor: '#d4af37'
            });
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Review';
        }
    });
});
