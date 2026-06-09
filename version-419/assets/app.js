function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

function initMenu() {
    const button = document.querySelector(".mobile-toggle");
    const panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
        return;
    }
    button.addEventListener("click", function () {
        const open = panel.classList.toggle("is-open");
        button.setAttribute("aria-expanded", String(open));
    });
}

function initHero() {
    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
        return;
    }
    let index = 0;
    function show(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === index);
        });
    }
    dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
            show(i);
        });
    });
    window.setInterval(function () {
        show(index + 1);
    }, 5200);
}

function initSearch() {
    const area = document.querySelector("[data-search-area]");
    if (!area) {
        return;
    }
    const input = area.querySelector("[data-search-input]");
    const category = area.querySelector("[data-category-filter]");
    const region = area.querySelector("[data-region-filter]");
    const cards = Array.from(document.querySelectorAll(".searchable-card"));
    function text(value) {
        return String(value || "").trim().toLowerCase();
    }
    function apply() {
        const keyword = text(input && input.value);
        const categoryValue = text(category && category.value);
        const regionValue = text(region && region.value);
        cards.forEach(function (card) {
            const haystack = text(card.getAttribute("data-keywords"));
            const cardCategory = text(card.getAttribute("data-category"));
            const cardRegion = text(card.getAttribute("data-region"));
            const matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            const matchedCategory = !categoryValue || cardCategory === categoryValue;
            const matchedRegion = !regionValue || cardRegion === regionValue;
            card.hidden = !(matchedKeyword && matchedCategory && matchedRegion);
        });
    }
    [input, category, region].forEach(function (control) {
        if (control) {
            control.addEventListener("input", apply);
            control.addEventListener("change", apply);
        }
    });
}

function initBackTop() {
    const button = document.querySelector(".back-top");
    if (!button) {
        return;
    }
    function toggle() {
        button.hidden = window.scrollY < 360;
    }
    button.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
}

function initPlayers() {
    const shells = Array.from(document.querySelectorAll(".video-shell"));
    shells.forEach(function (shell) {
        const video = shell.querySelector("video.movie-video");
        const overlay = shell.querySelector(".play-overlay");
        if (!video || !overlay) {
            return;
        }
        let attached = false;
        function attach() {
            if (attached) {
                return;
            }
            const src = video.getAttribute("data-stream");
            if (!src) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(src);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            } else {
                video.src = src;
            }
            attached = true;
        }
        function start() {
            attach();
            overlay.hidden = true;
            video.controls = true;
            const result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    overlay.hidden = false;
                });
            }
        }
        overlay.addEventListener("click", start);
        video.addEventListener("play", function () {
            overlay.hidden = true;
        });
        video.addEventListener("ended", function () {
            overlay.hidden = false;
        });
    });
}

ready(function () {
    initMenu();
    initHero();
    initSearch();
    initBackTop();
    initPlayers();
});
