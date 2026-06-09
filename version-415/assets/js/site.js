(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function yearGroup(year) {
    var num = parseInt(year, 10) || 0;
    if (num >= 2024) return "2024+";
    if (num >= 2020) return "2020-2023";
    if (num >= 2015) return "2015-2019";
    return "2014-";
  }

  function setupHeader() {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-menu-toggle]");
    var links = document.querySelector("[data-nav-links]");

    function updateHeader() {
      if (!header) return;
      header.classList.toggle("is-scrolled", window.scrollY > 20);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (toggle && links) {
      toggle.addEventListener("click", function() {
        links.classList.toggle("is-open");
      });
    }
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) return;

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) return;

    var input = panel.querySelector("[data-search-input]");
    var region = panel.querySelector("[data-filter-region]");
    var year = panel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    function apply() {
      var query = normalize(input && input.value);
      var selectedRegion = normalize(region && region.value);
      var selectedYear = normalize(year && year.value);

      cards.forEach(function(card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardYear = yearGroup(card.getAttribute("data-year"));
        var matched = true;

        if (query && haystack.indexOf(query) === -1) matched = false;
        if (selectedRegion && cardRegion !== selectedRegion) matched = false;
        if (selectedYear && normalize(cardYear) !== selectedYear) matched = false;

        card.classList.toggle("is-hidden-card", !matched);
      });
    }

    [input, region, year].forEach(function(el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
  }

  ready(function() {
    setupHeader();
    setupHero();
    setupFilters();
  });
})();
