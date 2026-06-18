(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  function setupSearchForms() {
    document.querySelectorAll('.site-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        if (!query) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        var target = form.getAttribute('action') || 'search.html';
        window.location.href = target + '?q=' + encodeURIComponent(query);
      });
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupLists() {
    var list = document.querySelector('[data-list]');
    if (!list) {
      return;
    }

    var searchInput = document.querySelector('.js-list-search');
    var sortSelect = document.querySelector('.js-sort-select');
    var empty = document.querySelector('.list-empty');
    var cards = Array.prototype.slice.call(list.children);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function getText(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year'),
        card.getAttribute('data-category'),
        card.getAttribute('data-type')
      ].join(' ').toLowerCase();
    }

    function sortCards(items) {
      var mode = sortSelect ? sortSelect.value : 'default';
      var sorted = items.slice();
      sorted.sort(function (a, b) {
        if (mode === 'popular') {
          return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
        }
        if (mode === 'rating') {
          return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
        }
        if (mode === 'latest') {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        }
        if (mode === 'title') {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-CN');
        }
        return cards.indexOf(a) - cards.indexOf(b);
      });
      return sorted;
    }

    function render() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var visible = cards.filter(function (card) {
        return !query || getText(card).indexOf(query) !== -1;
      });
      sortCards(visible).forEach(function (card) {
        card.hidden = false;
        list.appendChild(card);
      });
      cards.forEach(function (card) {
        if (visible.indexOf(card) === -1) {
          card.hidden = true;
          list.appendChild(card);
        }
      });
      if (empty) {
        empty.hidden = visible.length > 0;
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', render);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', render);
    }
    render();
  }

  ready(function () {
    setupMobileMenu();
    setupSearchForms();
    setupHero();
    setupLists();
  });
})();
