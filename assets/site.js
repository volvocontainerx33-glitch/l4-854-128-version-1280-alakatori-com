(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('.hero-dots button'));
    const previous = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  });

  document.querySelectorAll('[data-filter-form]').forEach(function (form) {
    const root = form.parentElement;
    const cards = Array.from(root.querySelectorAll('.movie-card'));
    const noResults = root.querySelector('[data-no-results]');
    const search = form.querySelector('[data-filter-search]');
    const year = form.querySelector('[data-filter-year]');
    const type = form.querySelector('[data-filter-type]');
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';

    if (query && search) {
      search.value = query;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      const q = normalize(search ? search.value : '');
      const y = normalize(year ? year.value : '');
      const t = normalize(type ? type.value : '');
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize(card.getAttribute('data-search'));
        const cardYear = normalize(card.getAttribute('data-year'));
        const cardType = normalize(card.getAttribute('data-type'));
        const matchQuery = !q || haystack.indexOf(q) !== -1;
        const matchYear = !y || cardYear.indexOf(y) !== -1;
        const matchType = !t || cardType.indexOf(t) !== -1;
        const ok = matchQuery && matchYear && matchType;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle('show', visible === 0);
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      form.addEventListener(eventName, apply);
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });

    apply();
  });

  const video = document.querySelector('[data-player-video]');
  const playButton = document.querySelector('[data-player-button]');

  if (video && playButton) {
    const url = video.getAttribute('data-video');
    let initialized = false;

    function start() {
      if (!url) {
        return;
      }

      playButton.classList.add('is-hidden');

      if (initialized) {
        video.play().catch(function () {});
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(function () {});
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          maxBufferLength: 30
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = url;
        video.play().catch(function () {});
      }
    }

    playButton.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!initialized) {
        start();
      }
    });
  }
})();
