// Jahr im Footer setzen
document.getElementById("year").textContent = new Date().getFullYear();

// Simple Reveal-Animation für Cards
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".card, .showcase-grid img, .about-image-wrapper").forEach(el => {
  el.classList.add("reveal");
  observer.observe(el);
});
