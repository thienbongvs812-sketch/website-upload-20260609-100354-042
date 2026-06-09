(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
        restart();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupSearch() {
    var input = document.querySelector('[data-card-search]');
    var filters = document.querySelector('[data-quick-filters]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-item'));
    var activeValue = '';

    if (!input || cards.length === 0) {
      return;
    }

    function applySearch() {
      var term = (input.value || '').trim().toLowerCase();
      var query = [term, activeValue.toLowerCase()].filter(Boolean);
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        var matched = query.every(function (item) {
          return text.indexOf(item) !== -1;
        });
        card.classList.toggle('is-hidden', !matched);
      });
    }

    input.addEventListener('input', applySearch);

    if (filters) {
      var buttons = Array.prototype.slice.call(filters.querySelectorAll('button'));
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeValue = button.getAttribute('data-filter-value') || '';
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          applySearch();
        });
      });
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (wrap) {
      var video = wrap.querySelector('video');
      var button = wrap.querySelector('[data-player-start]');

      if (!video || !button) {
        return;
      }

      function start() {
        var stream = video.getAttribute('data-stream');

        if (stream && !video.getAttribute('src')) {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
          }
        }

        wrap.classList.add('is-playing');
        var playRequest = video.play();
        if (playRequest && typeof playRequest.catch === 'function') {
          playRequest.catch(function () {});
        }
      }

      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
