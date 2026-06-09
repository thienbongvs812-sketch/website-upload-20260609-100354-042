function ready(fn) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fn);
    } else {
        fn();
    }
}

function setupMobileMenu() {
    const button = document.getElementById("mobile-menu-button");
    const panel = document.getElementById("mobile-menu");
    if (!button || !panel) {
        return;
    }
    button.addEventListener("click", () => {
        panel.classList.toggle("open");
    });
}

function setupHero() {
    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dots button"));
    const prev = document.querySelector("[data-hero-prev]");
    const next = document.querySelector("[data-hero-next]");
    if (!slides.length) {
        return;
    }
    let current = 0;
    let timer;
    const show = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === current);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === current);
        });
    };
    const move = (step) => {
        show(current + step);
    };
    const start = () => {
        clearInterval(timer);
        timer = setInterval(() => move(1), 5200);
    };
    if (prev) {
        prev.addEventListener("click", () => {
            move(-1);
            start();
        });
    }
    if (next) {
        next.addEventListener("click", () => {
            move(1);
            start();
        });
    }
    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            show(index);
            start();
        });
    });
    show(0);
    start();
}

function setupFilters() {
    const input = document.querySelector("[data-search-input]");
    const region = document.querySelector("[data-region-filter]");
    const type = document.querySelector("[data-type-filter]");
    const year = document.querySelector("[data-year-filter]");
    const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
    const result = document.querySelector("[data-result-count]");
    const empty = document.querySelector("[data-empty-state]");
    if (!cards.length || (!input && !region && !type && !year)) {
        return;
    }
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");
    if (initialQuery && input) {
        input.value = initialQuery;
    }
    const matchText = (card, keyword) => {
        if (!keyword) {
            return true;
        }
        const haystack = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags,
            card.dataset.category
        ].join(" ").toLowerCase();
        return haystack.includes(keyword.toLowerCase());
    };
    const apply = () => {
        const keyword = input ? input.value.trim() : "";
        const regionValue = region ? region.value : "";
        const typeValue = type ? type.value : "";
        const yearValue = year ? year.value : "";
        let shown = 0;
        cards.forEach((card) => {
            const ok = matchText(card, keyword)
                && (!regionValue || card.dataset.region === regionValue)
                && (!typeValue || card.dataset.type === typeValue)
                && (!yearValue || card.dataset.year === yearValue);
            card.style.display = ok ? "" : "none";
            if (ok) {
                shown += 1;
            }
        });
        if (result) {
            result.textContent = `当前显示 ${shown} 部影片`;
        }
        if (empty) {
            empty.classList.toggle("show", shown === 0);
        }
    };
    [input, region, type, year].forEach((node) => {
        if (node) {
            node.addEventListener("input", apply);
            node.addEventListener("change", apply);
        }
    });
    apply();
}

ready(() => {
    setupMobileMenu();
    setupHero();
    setupFilters();
});
