(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var links = document.querySelector("[data-nav-links]");
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener("click", function () {
      links.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
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
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var box = document.querySelector("[data-filter-box]");
    var list = document.querySelector("[data-card-list]");
    if (!box || !list) {
      return;
    }
    var input = box.querySelector("[data-filter-input]");
    var year = box.querySelector("[data-filter-year]");
    var region = box.querySelector("[data-filter-region]");
    var type = box.querySelector("[data-filter-type]");
    var reset = box.querySelector("[data-filter-reset]");
    var empty = document.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

    function apply() {
      var query = normalize(input && input.value);
      var yearValue = normalize(year && year.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute("data-search"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardType = normalize(card.getAttribute("data-type"));
        var matched = true;

        if (query && searchText.indexOf(query) === -1) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }
        if (regionValue && cardRegion !== regionValue) {
          matched = false;
        }
        if (typeValue && cardType !== typeValue) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, year, region, type].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (year) {
          year.value = "";
        }
        if (region) {
          region.value = "";
        }
        if (type) {
          type.value = "";
        }
        apply();
      });
    }
  }

  function loadPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-player-button]");
    var src = player.getAttribute("data-hls");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !src) {
      return;
    }

    function attachSource() {
      if (loaded) {
        return Promise.resolve();
      }
      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        return new Promise(function (resolve) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
          hlsInstance.on(window.Hls.Events.ERROR, function () {
            resolve();
          });
        });
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      }

      return Promise.resolve();
    }

    function playVideo() {
      attachSource().then(function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      });
    }

    function toggleVideo() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        toggleVideo();
      });
    }

    video.addEventListener("click", toggleVideo);
    video.addEventListener("play", function () {
      player.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      player.classList.remove("is-playing");
    });
    video.addEventListener("ended", function () {
      player.classList.remove("is-playing");
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function initPlayers() {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(loadPlayer);
  }

  function movieCardHtml(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\" data-card>",
      "  <a class=\"poster-link\" href=\"" + escapeHtml(movie.href) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
      "    <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "    <span class=\"poster-badge\">" + escapeHtml(movie.type) + "</span>",
      "    <span class=\"play-hover\">▶</span>",
      "  </a>",
      "  <div class=\"movie-card-body\">",
      "    <h3><a href=\"" + escapeHtml(movie.href) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p class=\"movie-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.year) + " · " + escapeHtml(movie.genre) + "</p>",
      "    <p class=\"movie-desc\">" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class=\"tag-list\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("\n");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    var input = document.querySelector("[data-search-page-input]");

    if (!results || !summary || !window.SITE_MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) {
      input.value = query;
    }

    var normalizedQuery = normalize(query);
    if (!normalizedQuery) {
      summary.textContent = "请输入关键词开始搜索。";
      return;
    }

    var matches = window.SITE_MOVIES.filter(function (movie) {
      return normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.genre,
        movie.year,
        movie.tags && movie.tags.join(" "),
        movie.oneLine
      ].join(" ")).indexOf(normalizedQuery) !== -1;
    }).slice(0, 240);

    summary.textContent = "“" + query + "” 找到 " + matches.length + " 个相关结果";
    results.innerHTML = matches.map(movieCardHtml).join("\n");
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
    initSearchPage();
  });
})();
