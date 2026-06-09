import { H as Hls } from './video-player.js';

const DEFAULT_HLS_SOURCE = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

function initMobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener('click', () => {
        nav.classList.toggle('is-open');
    });
}

function initBackTop() {
    const button = document.querySelector('[data-back-top]');

    if (!button) {
        return;
    }

    const sync = () => {
        button.classList.toggle('is-visible', window.scrollY > 420);
    };

    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', sync, { passive: true });
    sync();
}

function initHeroCarousel() {
    const hero = document.querySelector('[data-hero]');

    if (!hero) {
        return;
    }

    const slides = [...hero.querySelectorAll('[data-hero-slide]')];
    const dots = [...hero.querySelectorAll('[data-hero-dot]')];
    let activeIndex = 0;
    let timer = null;

    const activate = (index) => {
        activeIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    };

    const start = () => {
        timer = window.setInterval(() => activate(activeIndex + 1), 5200);
    };

    const restart = () => {
        if (timer) {
            window.clearInterval(timer);
        }
        start();
    };

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            activate(index);
            restart();
        });
    });

    if (slides.length > 1) {
        start();
    }
}

function initFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
        const input = scope.querySelector('[data-search-input]');
        const cards = [...scope.querySelectorAll('.movie-card')];
        const count = scope.querySelector('[data-result-count]');
        const grid = scope.querySelector('[data-card-grid]');
        const sortSelect = scope.querySelector('[data-sort-select]');
        const state = {
            query: '',
            year: 'all',
            type: 'all',
            category: 'all'
        };

        const setActiveButton = (button, groupSelector) => {
            scope.querySelectorAll(groupSelector).forEach((item) => item.classList.remove('is-active'));
            button.classList.add('is-active');
        };

        const matches = (card) => {
            const haystack = [
                card.dataset.title,
                card.dataset.tags,
                card.dataset.year,
                card.dataset.type,
                card.dataset.category
            ].join(' ').toLowerCase();

            const queryOk = !state.query || haystack.includes(state.query);
            const yearOk = state.year === 'all' || card.dataset.year === state.year;
            const typeOk = state.type === 'all' || card.dataset.type === state.type;
            const categoryOk = state.category === 'all' || card.dataset.category === state.category;

            return queryOk && yearOk && typeOk && categoryOk;
        };

        const sortCards = () => {
            if (!grid || !sortSelect) {
                return;
            }

            const value = sortSelect.value;
            const sorted = [...cards].sort((a, b) => {
                if (value === 'views-desc') {
                    return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                }
                if (value === 'rating-desc') {
                    return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
                }
                if (value === 'title-asc') {
                    return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
                }
                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            });

            sorted.forEach((card) => grid.appendChild(card));
        };

        const apply = () => {
            let visible = 0;

            cards.forEach((card) => {
                const ok = matches(card);
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
        };

        if (input) {
            input.addEventListener('input', () => {
                state.query = input.value.trim().toLowerCase();
                apply();
            });
        }

        scope.querySelectorAll('[data-filter-year]').forEach((button) => {
            button.addEventListener('click', () => {
                state.year = button.dataset.filterYear || 'all';
                setActiveButton(button, '[data-filter-year]');
                apply();
            });
        });

        scope.querySelectorAll('[data-filter-type]').forEach((button) => {
            button.addEventListener('click', () => {
                state.type = button.dataset.filterType || 'all';
                setActiveButton(button, '[data-filter-type]');
                apply();
            });
        });

        scope.querySelectorAll('[data-filter-category]').forEach((button) => {
            button.addEventListener('click', () => {
                state.category = button.dataset.filterCategory || 'all';
                setActiveButton(button, '[data-filter-category]');
                apply();
            });
        });

        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                sortCards();
                apply();
            });
        }

        sortCards();
        apply();
    });
}

function initVideoPlayers() {
    document.querySelectorAll('[data-player]').forEach((player) => {
        const button = player.querySelector('[data-player-start]');
        const video = player.querySelector('video');
        const message = player.querySelector('[data-player-message]');
        let hls = null;
        let started = false;

        if (!button || !video) {
            return;
        }

        const setMessage = (text) => {
            if (message) {
                message.textContent = text || '';
            }
        };

        const playVideo = () => {
            const promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(() => {
                    setMessage('浏览器阻止了自动播放，请再次点击视频控件播放。');
                });
            }
        };

        const start = () => {
            if (started) {
                playVideo();
                return;
            }

            started = true;
            button.classList.add('hidden');
            setMessage('正在初始化播放源...');

            const source = player.dataset.src || DEFAULT_HLS_SOURCE;

            if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setMessage('');
                    playVideo();
                });
                hls.on(Hls.Events.ERROR, (_, data) => {
                    if (data && data.fatal) {
                        setMessage('播放源加载失败，请检查播放地址或稍后再试。');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', () => {
                    setMessage('');
                    playVideo();
                }, { once: true });
            } else {
                setMessage('当前浏览器不支持 HLS 播放。');
            }
        };

        button.addEventListener('click', start);
        video.addEventListener('play', () => button.classList.add('hidden'));
        window.addEventListener('beforeunload', () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initBackTop();
    initHeroCarousel();
    initFilters();
    initVideoPlayers();
});
