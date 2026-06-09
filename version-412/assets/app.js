(function () {
    var menuButton = document.querySelector('.menu-button');
    var mobileNav = document.querySelector('.mobile-nav');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var carousel = document.querySelector('.hero-carousel');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var show = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
        };
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
            });
        }
        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }
    }

    var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));
    grids.forEach(function (grid) {
        var scope = grid.closest('[data-filter-scope]') || document;
        var search = scope.querySelector('[data-search-input]');
        var region = scope.querySelector('[data-region-filter]');
        var year = scope.querySelector('[data-year-filter]');
        var empty = scope.querySelector('[data-empty-state]');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var filterCards = function () {
            var query = search ? search.value.trim().toLowerCase() : '';
            var selectedRegion = region ? region.value : '';
            var selectedYear = year ? year.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-tags') || ''
                ].join(' ').toLowerCase();
                var cardRegion = card.getAttribute('data-region') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var pass = (!query || text.indexOf(query) !== -1) &&
                    (!selectedRegion || cardRegion === selectedRegion) &&
                    (!selectedYear || cardYear === selectedYear);
                card.classList.toggle('hidden-card', !pass);
                if (pass) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };
        [search, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filterCards);
                control.addEventListener('change', filterCards);
            }
        });
    });

    var player = document.querySelector('[data-player]');
    if (player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('.video-cover');
        var stream = video ? video.getAttribute('data-stream') : '';
        var started = false;
        var start = function () {
            if (!video || !stream) {
                return;
            }
            if (!started) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
                started = true;
            }
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        };
        if (cover) {
            cover.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (!started) {
                start();
            }
        });
    }
})();
