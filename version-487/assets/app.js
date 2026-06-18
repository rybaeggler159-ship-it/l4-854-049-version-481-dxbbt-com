(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupNavigation() {
    var toggle = document.getElementById("navToggle");
    var mobileNav = document.getElementById("mobileNav");
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener("click", function () {
      mobileNav.hidden = !mobileNav.hidden;
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function applyUrlParams(form) {
    var params = new URLSearchParams(window.location.search);
    var q = form.querySelector("[data-filter-input]");
    var type = form.querySelector("[data-type-filter]");
    var year = form.querySelector("[data-year-filter]");
    if (q && params.has("q")) {
      q.value = params.get("q") || "";
    }
    if (type && params.has("type")) {
      type.value = params.get("type") || "";
    }
    if (year && params.has("year")) {
      year.value = params.get("year") || "";
    }
  }

  function setupFilters() {
    Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]")).forEach(function (panel) {
      var scope = panel.closest("[data-filter-scope]") || document;
      var grid = scope.querySelector("[data-card-grid]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
      var form = panel.querySelector("form") || panel;
      var input = panel.querySelector("[data-filter-input]");
      var type = panel.querySelector("[data-type-filter]");
      var year = panel.querySelector("[data-year-filter]");
      var sort = panel.querySelector("[data-sort]");
      var viewButtons = Array.prototype.slice.call(panel.querySelectorAll("[data-view]"));
      applyUrlParams(panel);
      function cardText(card) {
        return normalize(card.getAttribute("data-search") || card.textContent);
      }
      function apply() {
        var q = normalize(input && input.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);
        cards.forEach(function (card) {
          var matchText = !q || cardText(card).indexOf(q) !== -1;
          var matchType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
          var matchYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
          card.hidden = !(matchText && matchType && matchYear);
        });
        var visibleCards = cards.filter(function (card) {
          return !card.hidden;
        });
        var sortValue = sort ? sort.value : "default";
        visibleCards.sort(function (a, b) {
          if (sortValue === "newest") {
            return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
          }
          if (sortValue === "oldest") {
            return Number(a.getAttribute("data-year") || 0) - Number(b.getAttribute("data-year") || 0);
          }
          if (sortValue === "title") {
            return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
          }
          return Number(a.getAttribute("data-index") || 0) - Number(b.getAttribute("data-index") || 0);
        });
        visibleCards.forEach(function (card) {
          grid.appendChild(card);
        });
      }
      [input, type, year, sort].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
      if (form && form.addEventListener) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          apply();
        });
      }
      viewButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          var view = button.getAttribute("data-view");
          grid.classList.toggle("is-list", view === "list");
          viewButtons.forEach(function (other) {
            other.classList.toggle("is-active", other === button);
          });
        });
      });
      apply();
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
