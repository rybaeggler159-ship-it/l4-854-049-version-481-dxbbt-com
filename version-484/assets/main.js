(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          restart();
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }
      show(0);
      restart();
    }

    var initialQuery = "";
    try {
      initialQuery = new URLSearchParams(window.location.search).get("q") || "";
    } catch (error) {
      initialQuery = "";
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]")).forEach(function (scope, scopeIndex) {
      var searchInputs = Array.prototype.slice.call(scope.querySelectorAll("[data-search-input]"));
      var filters = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var empty = scope.querySelector("[data-empty]");
      if (initialQuery && scopeIndex === 0 && searchInputs[0]) {
        searchInputs[0].value = initialQuery;
      }

      function applyFilters() {
        var query = normalize(searchInputs.map(function (input) {
          return input.value;
        }).join(" "));
        var values = {};
        filters.forEach(function (filter) {
          values[filter.getAttribute("data-filter")] = normalize(filter.value);
        });
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-keywords") || card.textContent);
          var matched = !query || text.indexOf(query) !== -1;
          Object.keys(values).forEach(function (key) {
            var value = values[key];
            if (value && normalize(card.getAttribute("data-" + key)) !== value) {
              matched = false;
            }
          });
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }

      searchInputs.forEach(function (input) {
        input.addEventListener("input", applyFilters);
      });
      filters.forEach(function (filter) {
        filter.addEventListener("change", applyFilters);
      });
      applyFilters();
    });
  });
})();
