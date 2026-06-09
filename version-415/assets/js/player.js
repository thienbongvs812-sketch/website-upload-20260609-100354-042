(function() {
  function startPlayer(url) {
    var video = document.querySelector("[data-player]");
    var overlay = document.querySelector("[data-play-overlay]");
    var hls = null;
    var attached = false;

    if (!video || !overlay || !url) return;

    function attach() {
      if (attached) return;
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        return;
      }

      video.src = url;
    }

    function play() {
      attach();
      overlay.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function() {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function() {
      if (video.paused) play();
    });
    video.addEventListener("play", function() {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("ended", function() {
      overlay.classList.remove("is-hidden");
    });
    window.addEventListener("beforeunload", function() {
      if (hls) hls.destroy();
    });
  }

  window.startPlayer = startPlayer;
})();
