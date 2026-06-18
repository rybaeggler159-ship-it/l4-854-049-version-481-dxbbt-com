(function () {
  function initMoviePlayer(source) {
    var video = document.getElementById("movieVideo");
    var veil = document.getElementById("movieVeil");
    var start = document.getElementById("movieStart");
    var hls = null;
    var attached = false;
    if (!video || !source) {
      return;
    }
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }
      video.src = source;
    }
    function play() {
      attach();
      if (veil) {
        veil.classList.add("is-hidden");
      }
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {});
      }
    }
    if (start) {
      start.addEventListener("click", play);
    }
    if (veil) {
      veil.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (veil) {
        veil.classList.add("is-hidden");
      }
    });
  }
  window.initMoviePlayer = initMoviePlayer;
})();
