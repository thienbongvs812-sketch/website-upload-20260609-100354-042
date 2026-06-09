(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function initBackTop() {
        var button = document.querySelector('[data-back-top]');
        if (!button) {
            return;
        }
        window.addEventListener('scroll', function () {
            if (window.scrollY > 360) {
                button.classList.add('show');
            } else {
                button.classList.remove('show');
            }
        });
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function initHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', carousel);
        var dots = selectAll('[data-hero-dot]', carousel);
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initPageFilters() {
        var scope = document.querySelector('[data-filter-scope]');
        var list = document.querySelector('[data-card-list]');
        if (!scope || !list) {
            return;
        }
        var input = scope.querySelector('[data-page-search]');
        var year = scope.querySelector('[data-year-filter]');
        var type = scope.querySelector('[data-type-filter]');
        var count = scope.querySelector('[data-filter-count]');
        var cards = selectAll('[data-movie-card]', list);

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function apply() {
            var query = normalize(input && input.value);
            var selectedYear = year ? year.value : '';
            var selectedType = type ? type.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-text'));
                var cardYear = card.getAttribute('data-year') || '';
                var cardType = card.getAttribute('data-type') || '';
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesYear = !selectedYear || cardYear === selectedYear;
                var matchesType = !selectedType || cardType === selectedType;
                var shouldShow = matchesQuery && matchesYear && matchesType;
                card.classList.toggle('is-hidden', !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + ' 部';
            }
        }

        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    function initPlayers() {
        selectAll('[data-video-src]').forEach(function (card) {
            var button = card.querySelector('[data-play-button]');
            var video = card.querySelector('video');
            var source = card.getAttribute('data-video-src');
            if (!button || !video || !source) {
                return;
            }

            button.addEventListener('click', function () {
                card.classList.add('is-playing');
                video.controls = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.play().catch(function () {});
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    return;
                }

                video.src = source;
                video.play().catch(function () {});
            });
        });
    }

    function createSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '' +
            '<article class="movie-card movie-card-compact">' +
                '<a class="poster-wrap" href="./' + escapeHtml(movie.file) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy">' +
                    '<span class="play-chip">播放</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                    '<div class="movie-meta-line">' +
                        '<span>' + escapeHtml(movie.yearText || movie.year || '') + '</span>' +
                        '<span>' + escapeHtml(movie.region || '') + '</span>' +
                        '<span>' + escapeHtml(movie.type || '') + '</span>' +
                    '</div>' +
                    '<h3><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
                    '<div class="tag-list">' + tags + '</div>' +
                '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initGlobalSearch() {
        var app = document.querySelector('[data-search-app]');
        var output = document.querySelector('[data-search-results]');
        var summary = document.querySelector('[data-search-summary]');
        if (!app || !output || !window.MOVIE_SEARCH_INDEX) {
            return;
        }
        var input = app.querySelector('[data-global-search]');
        var year = app.querySelector('[data-global-year]');
        var type = app.querySelector('[data-global-type]');
        var button = app.querySelector('[data-run-global-search]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function render() {
            var query = normalize(input && input.value);
            var selectedYear = year ? year.value : '';
            var selectedType = type ? type.value : '';
            var results = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
                var text = normalize(movie.searchText);
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesYear = !selectedYear || String(movie.year) === selectedYear;
                var matchesType = !selectedType || movie.type === selectedType;
                return matchesQuery && matchesYear && matchesType;
            });

            var limited = results.slice(0, 120);
            output.innerHTML = limited.map(createSearchCard).join('');
            if (summary) {
                var extra = results.length > limited.length ? '，当前显示前 ' + limited.length + ' 条' : '';
                summary.textContent = '找到 ' + results.length + ' 条结果' + extra + '。';
            }
        }

        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', render);
                control.addEventListener('change', render);
            }
        });
        if (button) {
            button.addEventListener('click', render);
        }
        render();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initBackTop();
        initHero();
        initPageFilters();
        initPlayers();
        initGlobalSearch();
    });
})();
