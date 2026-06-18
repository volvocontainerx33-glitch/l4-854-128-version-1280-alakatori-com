(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
      document.body.classList.toggle('menu-open', mobilePanel.classList.contains('open'));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var initLocalFilter = function (input) {
    var scope = input.closest('section');
    var cards = Array.prototype.slice.call((scope || document).querySelectorAll('.js-movie-card'));

    var filter = function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' ').toLowerCase();
        card.classList.toggle('hidden', value && text.indexOf(value) === -1);
      });
    };

    input.addEventListener('input', filter);
    filter();
  };

  Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]')).forEach(initLocalFilter);

  var searchInput = document.getElementById('search-page-input');
  var searchResults = document.querySelector('[data-search-results]');
  if (searchInput && searchResults) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    searchInput.value = query;
    var cards = Array.prototype.slice.call(searchResults.querySelectorAll('.js-movie-card'));

    var runSearch = function () {
      var value = searchInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' ').toLowerCase();
        card.classList.toggle('hidden', value && text.indexOf(value) === -1);
      });
    };

    searchInput.addEventListener('input', runSearch);
    runSearch();
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-cover]');
    var buttons = Array.prototype.slice.call(player.querySelectorAll('[data-play]'));
    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var ready = false;
    var hlsInstance = null;

    var loadVideo = function () {
      if (ready || !stream) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      video.controls = true;
    };

    var playVideo = function () {
      loadVideo();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    };

    buttons.forEach(function (button) {
      button.addEventListener('click', playVideo);
    });

    video.addEventListener('click', function () {
      if (!ready) {
        playVideo();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
