// public/js/carousel.js

document.addEventListener('DOMContentLoaded', function() {
  let slideIndex = 0;
  const slides = document.querySelectorAll('.carousel-slide');
  const overlays = document.querySelectorAll('.hero-overlay');
  const indicators = document.querySelectorAll('.indicator');

  if (slides.length === 0) return; // Safety check if no carousel on page

  function showSlide(n) {
    slideIndex = n;
    slides.forEach((s, i) => s.classList.toggle('active', i === n));
    overlays.forEach((o, i) => o.classList.toggle('active', i === n));
    indicators.forEach((ind, i) => ind.classList.toggle('active', i === n));
  }

  // Click on indicators
  indicators.forEach(ind => {
    ind.addEventListener('click', () => {
      const idx = parseInt(ind.getAttribute('data-slide-index'));
      showSlide(idx);
    });
  });

  // Auto slide
  function autoSlide() {
    slideIndex = (slideIndex + 1) % slides.length;
    showSlide(slideIndex);
  }

  setInterval(autoSlide, 7000);

  // Show first slide initially
  showSlide(0);
});