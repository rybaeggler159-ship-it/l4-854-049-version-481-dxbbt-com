(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle("is-active", pos === current);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle("is-active", pos === current);
      });
    }

    function move(step) {
      show(current + step);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        move(1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        move(1);
        restart();
      });
    }
    dots.forEach(function (dot, pos) {
      dot.addEventListener("click", function () {
        show(pos);
        restart();
      });
    });
    restart();
  }

  function initCardFilter() {
    var scope = document.querySelector("[data-card-filter]");
    if (!scope) {
      return;
    }
    var input = scope.querySelector("[data-filter-keyword]");
    var year = scope.querySelector("[data-filter-year]");
    var region = scope.querySelector("[data-filter-region]");
    var genre = scope.querySelector("[data-filter-genre]");
    var count = scope.querySelector("[data-filter-count]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : "";
    }

    function apply() {
      var keyword = valueOf(input);
      var yearValue = valueOf(year);
      var regionValue = valueOf(region);
      var genreValue = valueOf(genre);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.year,
          card.textContent
        ].join(" ").toLowerCase();
        var matched = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (yearValue && String(card.dataset.year || "").toLowerCase() !== yearValue) {
          matched = false;
        }
        if (regionValue && String(card.dataset.region || "").toLowerCase() !== regionValue) {
          matched = false;
        }
        if (genreValue && String(card.dataset.genre || "").toLowerCase().indexOf(genreValue) === -1) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = String(visible);
      }
    }

    [input, year, region, genre].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });
  }

  function createText(tag, className, text) {
    var element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    element.textContent = text || "";
    return element;
  }

  function createSearchCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card movie-card-medium";

    var link = document.createElement("a");
    link.href = movie.file;
    link.setAttribute("aria-label", "观看 " + movie.title);

    var poster = document.createElement("div");
    poster.className = "movie-poster";

    var img = document.createElement("img");
    img.src = movie.cover;
    img.alt = movie.title;
    img.loading = "lazy";

    var year = createText("span", "movie-year", movie.year);
    var play = createText("span", "movie-play", "▶");

    poster.appendChild(img);
    poster.appendChild(year);
    poster.appendChild(play);

    var body = document.createElement("div");
    body.className = "movie-card-body";
    body.appendChild(createText("h3", "", movie.title));
    body.appendChild(createText("p", "", movie.oneLine));

    var tags = document.createElement("div");
    tags.className = "movie-card-tags";
    [movie.region, movie.type, movie.genre].filter(Boolean).slice(0, 4).forEach(function (item) {
      tags.appendChild(createText("span", "", item));
    });
    body.appendChild(tags);

    link.appendChild(poster);
    link.appendChild(body);
    article.appendChild(link);
    return article;
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !Array.isArray(window.MOVIE_SEARCH_DATA)) {
      return;
    }
    var form = page.querySelector("[data-search-form]");
    var input = page.querySelector("[data-search-input]");
    var results = page.querySelector("[data-search-results]");
    var count = page.querySelector("[data-search-count]");
    var quick = page.querySelector("[data-search-quick]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    function render(term) {
      var keyword = term.trim().toLowerCase();
      var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        if (!keyword) {
          return true;
        }
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine]
          .join(" ")
          .toLowerCase()
          .indexOf(keyword) !== -1;
      });
      results.innerHTML = "";
      var fragment = document.createDocumentFragment();
      matched.forEach(function (movie) {
        fragment.appendChild(createSearchCard(movie));
      });
      results.appendChild(fragment);
      count.textContent = String(matched.length);
    }

    if (input) {
      input.value = initial;
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        render(input.value);
      });
    }
    if (quick) {
      quick.addEventListener("click", function (event) {
        var button = event.target.closest("button[data-term]");
        if (!button) {
          return;
        }
        input.value = button.dataset.term || "";
        render(input.value);
      });
    }
    render(initial);
  }

  window.initMoviePlayer = function (source) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-play]");
    if (!video || !source) {
      return;
    }
    var hls = null;
    var started = false;

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function attachSource() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        return;
      }
      video.src = source;
      playVideo();
    }

    function start() {
      if (started) {
        playVideo();
        return;
      }
      started = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      attachSource();
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMobileNav();
    initHeroCarousel();
    initCardFilter();
    initSearchPage();
  });
})();
