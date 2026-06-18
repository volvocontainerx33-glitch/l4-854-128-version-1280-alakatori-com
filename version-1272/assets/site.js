(function () {
  function qs(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function filterCards(input) {
    var query = normalize(input.value);
    var list = document.querySelector("[data-filter-list]") || document;
    var cards = list.querySelectorAll(".movie-card");
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search") || card.textContent);
      card.hidden = query.length > 0 && text.indexOf(query) === -1;
    });
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function initFilters() {
    var inputs = document.querySelectorAll("[data-filter-input]");
    inputs.forEach(function (input) {
      var q = qs("q");
      if (q && input.id === "search-box") {
        input.value = q;
      }
      filterCards(input);
      input.addEventListener("input", function () {
        filterCards(input);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
