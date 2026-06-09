(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    show(0);
    restart();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var textInput = scope.querySelector('[data-filter-text]');
      var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-select]'));
      var container = document.querySelector('[data-filter-results]');
      if (!container) {
        return;
      }
      var cards = Array.prototype.slice.call(container.querySelectorAll('.filter-card'));
      function normalize(value) {
        return String(value || '').toLowerCase();
      }
      function apply() {
        var keyword = normalize(textInput && textInput.value);
        cards.forEach(function (card) {
          var textMatch = true;
          if (keyword) {
            var haystack = normalize([
              card.getAttribute('data-title'),
              card.getAttribute('data-region'),
              card.getAttribute('data-type'),
              card.getAttribute('data-year'),
              card.getAttribute('data-genre')
            ].join(' '));
            textMatch = haystack.indexOf(keyword) !== -1;
          }
          var selectMatch = selects.every(function (select) {
            var value = normalize(select.value);
            if (!value) {
              return true;
            }
            var field = select.getAttribute('data-filter-select');
            return normalize(card.getAttribute('data-' + field)).indexOf(value) !== -1;
          });
          card.classList.toggle('hidden-card', !(textMatch && selectMatch));
        });
      }
      if (textInput) {
        textInput.addEventListener('input', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
    });
  }

  function escapeHTML(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHTML(tag) + '</span>';
    }).join('');
    return '<article class="movie-card compact">'
      + '<a class="poster-link" href="./' + escapeHTML(movie.file) + '">'
      + '<img src="' + escapeHTML(movie.image) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">'
      + '<span class="poster-badge">' + escapeHTML(movie.type) + '</span>'
      + '<span class="poster-play">▶</span>'
      + '</a>'
      + '<div class="movie-body">'
      + '<h3 class="movie-title"><a href="./' + escapeHTML(movie.file) + '">' + escapeHTML(movie.title) + '</a></h3>'
      + '<p class="movie-desc">' + escapeHTML(movie.oneLine) + '</p>'
      + '<div class="movie-meta"><span>' + escapeHTML(movie.year) + '</span><span>' + escapeHTML(movie.region) + '</span></div>'
      + '<div class="tag-row">' + tags + '</div>'
      + '</div>'
      + '</article>';
  }

  function initSearchPage() {
    var form = document.getElementById('siteSearchForm');
    var input = document.getElementById('siteSearchInput');
    var region = document.getElementById('siteSearchRegion');
    var type = document.getElementById('siteSearchType');
    var results = document.getElementById('searchResults');
    var data = window.MovieData || [];
    if (!form || !input || !results || !data.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';
    function norm(value) {
      return String(value || '').toLowerCase();
    }
    function render() {
      var q = norm(input.value);
      var selectedRegion = norm(region && region.value);
      var selectedType = norm(type && type.value);
      var list = data.filter(function (movie) {
        var haystack = norm([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags.join(' '),
          movie.oneLine
        ].join(' '));
        return (!q || haystack.indexOf(q) !== -1)
          && (!selectedRegion || norm(movie.region).indexOf(selectedRegion) !== -1)
          && (!selectedType || norm(movie.type).indexOf(selectedType) !== -1);
      }).slice(0, 120);
      if (!list.length) {
        results.innerHTML = '<div class="empty-state">暂无匹配内容，可尝试更换关键词。</div>';
        return;
      }
      results.innerHTML = list.map(movieCard).join('');
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });
    input.addEventListener('input', render);
    if (region) {
      region.addEventListener('change', render);
    }
    if (type) {
      type.addEventListener('change', render);
    }
    render();
  }

  function mountPlayer(src) {
    ready(function () {
      var video = document.getElementById('movieVideo');
      var overlay = document.getElementById('playOverlay');
      if (!video || !overlay || !src) {
        return;
      }
      var loaded = false;
      var hls = null;
      function load() {
        if (loaded) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
        loaded = true;
      }
      function start() {
        load();
        overlay.classList.add('is-hidden');
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            overlay.classList.remove('is-hidden');
          });
        }
      }
      overlay.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
      });
      video.addEventListener('ended', function () {
        overlay.classList.remove('is-hidden');
      });
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  window.VideoPortal = {
    mountPlayer: mountPlayer
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
  });
}());
