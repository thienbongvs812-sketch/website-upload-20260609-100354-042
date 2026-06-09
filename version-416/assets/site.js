(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function textOf(value) {
    return (value || "").toString().toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function initBackTop() {
    var button = document.querySelector(".back-top");
    if (!button) {
      return;
    }
    window.addEventListener("scroll", function () {
      if (window.scrollY > 360) {
        button.classList.add("show");
      } else {
        button.classList.remove("show");
      }
    });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-slide") || "0"));
        start();
      });
    });
    start();
  }

  function initFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll(".filter-list"));
    lists.forEach(function (list) {
      var section = list.closest("section") || document;
      var input = section.querySelector(".filter-input");
      var year = section.querySelector(".filter-year");
      var type = section.querySelector(".filter-type");
      var message = section.querySelector(".filter-message");
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      function apply() {
        var keyword = textOf(input && input.value);
        var selectedYear = year && year.value;
        var selectedType = type && type.value;
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = textOf([
            card.getAttribute("data-title"),
            card.getAttribute("data-category"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year")
          ].join(" "));
          var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
          var matchedType = !selectedType || card.getAttribute("data-type") === selectedType;
          var matched = matchedKeyword && matchedYear && matchedType;
          card.classList.toggle("hidden-card", !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (message) {
          message.textContent = visible ? "已显示匹配影片" : "未找到匹配影片";
        }
      }
      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function initSearch() {
    var input = document.getElementById("site-search-input");
    var year = document.getElementById("site-search-year");
    var button = document.getElementById("site-search-button");
    var results = document.getElementById("site-search-results");
    var status = document.getElementById("site-search-status");
    var items = window.searchableItems || [];
    if (!input || !year || !button || !results || !items.length) {
      return;
    }
    var years = Array.from(new Set(items.map(function (item) { return item.year; }))).sort(function (a, b) { return Number(b) - Number(a); });
    years.forEach(function (itemYear) {
      var option = document.createElement("option");
      option.value = itemYear;
      option.textContent = itemYear;
      year.appendChild(option);
    });
    function render(list) {
      results.innerHTML = list.slice(0, 80).map(function (item) {
        return [
          '<article class="movie-card">',
          '<a class="poster-wrap" href="' + item.url + '">',
          '<img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">',
          '<span class="year-badge">' + item.year + '</span>',
          '<span class="play-dot">▶</span>',
          '</a>',
          '<div class="card-body">',
          '<h3><a href="' + item.url + '">' + item.title + '</a></h3>',
          '<p>' + item.description + '</p>',
          '<div class="card-meta"><span>' + item.region + '</span><span>' + item.type + '</span><a href="' + item.categoryUrl + '">' + item.category + '</a></div>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');
      if (status) {
        status.textContent = list.length ? "已显示匹配影片" : "未找到匹配影片";
      }
    }
    function apply() {
      var keyword = textOf(input.value);
      var selectedYear = year.value;
      var matched = items.filter(function (item) {
        var haystack = textOf(item.title + " " + item.description + " " + item.region + " " + item.type + " " + item.category + " " + item.tags);
        var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        var yearOk = !selectedYear || item.year === selectedYear;
        return keywordOk && yearOk;
      });
      render(matched);
    }
    button.addEventListener("click", apply);
    input.addEventListener("input", apply);
    year.addEventListener("change", apply);
    render(items.slice(0, 24));
  }

  function initPlayer() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll(".player-box"));
    boxes.forEach(function (box) {
      var video = box.querySelector("video");
      var overlay = box.querySelector(".player-overlay");
      var stream = box.getAttribute("data-stream");
      var started = false;
      function play() {
        if (!video || !stream) {
          return;
        }
        box.classList.add("playing");
        if (!started) {
          started = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            video.play().catch(function () {});
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.src = stream;
            video.play().catch(function () {});
          }
        } else {
          video.play().catch(function () {});
        }
      }
      if (overlay) {
        overlay.addEventListener("click", play);
      }
      box.addEventListener("click", function (event) {
        if (event.target === video && started) {
          return;
        }
        if (!started) {
          play();
        }
      });
      if (video) {
        video.addEventListener("play", function () {
          box.classList.add("playing");
        });
        video.addEventListener("pause", function () {
          if (!video.ended) {
            box.classList.remove("playing");
          }
        });
      }
    });
  }

  ready(function () {
    initMenu();
    initBackTop();
    initHero();
    initFilters();
    initSearch();
    initPlayer();
  });
})();
