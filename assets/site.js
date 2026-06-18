(function () {
  "use strict";

  var hlsLoadingPromise = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function loadHlsScript() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoadingPromise) {
      return hlsLoadingPromise;
    }

    hlsLoadingPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error("hls.js 加载失败"));
      };
      document.head.appendChild(script);
    });

    return hlsLoadingPromise;
  }

  function setupNavigation() {
    var button = document.querySelector(".mobile-menu-button");
    var panel = document.querySelector(".mobile-panel");

    if (button && panel) {
      button.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    document.querySelectorAll(".nav-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var keyword = input ? input.value.trim() : "";

        if (!keyword) {
          event.preventDefault();
          return;
        }
      });
    });
  }

  function setupHero() {
    var slider = document.querySelector(".hero-slider");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupFilters() {
    var pages = document.querySelectorAll("[data-filter-page]");

    pages.forEach(function (page) {
      var input = page.querySelector(".filter-input");
      var region = page.querySelector(".filter-region");
      var type = page.querySelector(".filter-type");
      var year = page.querySelector(".filter-year");
      var empty = page.querySelector(".empty-message");
      var cards = Array.prototype.slice.call(page.querySelectorAll(".filterable-card"));
      var params = new URLSearchParams(window.location.search);
      var queryFromUrl = params.get("q") || "";

      if (input && queryFromUrl) {
        input.value = queryFromUrl;
      }

      function valueOf(select) {
        return select ? select.value.trim() : "";
      }

      function normalize(value) {
        return String(value || "").toLowerCase();
      }

      function apply() {
        var keyword = normalize(input ? input.value.trim() : "");
        var regionValue = valueOf(region);
        var typeValue = valueOf(type);
        var yearValue = valueOf(year);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(" "));

          var matched = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }

          if (regionValue && card.dataset.region !== regionValue) {
            matched = false;
          }

          if (typeValue && card.dataset.type !== typeValue) {
            matched = false;
          }

          if (yearValue && card.dataset.year !== yearValue) {
            matched = false;
          }

          card.classList.toggle("hidden-by-filter", !matched);

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function attachPlayer(container) {
    var video = container.querySelector("video");
    var overlay = container.querySelector(".player-overlay");
    var status = container.querySelector(".player-status");
    var source = container.getAttribute("data-src");
    var started = false;
    var hlsInstance = null;

    if (!video || !source) {
      if (status) {
        status.textContent = "暂无可用播放源";
      }
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function playVideo() {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          setStatus("点击视频继续播放");
        });
      }
    }

    function start() {
      if (started) {
        playVideo();
        return;
      }

      started = true;
      setStatus("正在加载播放源");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        container.classList.add("playing");
        playVideo();
        return;
      }

      loadHlsScript().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            container.classList.add("playing");
            playVideo();
          });
          hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放源加载失败，请稍后重试");
            }
          });
        } else {
          video.src = source;
          container.classList.add("playing");
          playVideo();
        }
      }).catch(function () {
        video.src = source;
        container.classList.add("playing");
        playVideo();
      });
    }

    if (overlay) {
      overlay.addEventListener("click", function (event) {
        event.preventDefault();
        start();
      });
    }

    container.addEventListener("click", function (event) {
      if (event.target === video) {
        return;
      }

      if (event.target.closest(".player-overlay")) {
        return;
      }

      start();
    });

    video.addEventListener("play", function () {
      container.classList.add("playing");
    });

    video.addEventListener("pause", function () {
      if (video.currentTime > 0 && !video.ended) {
        setStatus("已暂停，点击继续播放");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function setupPlayers() {
    document.querySelectorAll(".js-player").forEach(attachPlayer);
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
