(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(i);
                play();
            });
        });

        show(0);
        play();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var section = panel.parentElement;
            var list = section ? section.querySelector("[data-movie-list]") : null;
            var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card")) : [];
            var search = panel.querySelector("[data-filter-search]");
            var year = panel.querySelector("[data-filter-year]");
            var type = panel.querySelector("[data-filter-type]");
            var empty = section ? section.querySelector("[data-filter-empty]") : null;

            function normalize(value) {
                return String(value || "").toLowerCase().trim();
            }

            function apply() {
                var keyword = normalize(search && search.value);
                var selectedYear = normalize(year && year.value);
                var selectedType = normalize(type && type.value);
                var any = false;
                cards.forEach(function (card) {
                    var content = normalize(card.getAttribute("data-search") || card.textContent);
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var visible = true;
                    if (keyword && content.indexOf(keyword) === -1) {
                        visible = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        visible = false;
                    }
                    if (selectedType && cardType !== selectedType) {
                        visible = false;
                    }
                    card.hidden = !visible;
                    if (visible) {
                        any = true;
                    }
                });
                if (empty) {
                    empty.hidden = any;
                }
            }

            [search, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    window.initVideoPlayer = function (streamUrl) {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var overlay = player.querySelector("[data-play-overlay]");
        var button = player.querySelector("[data-play-button]");
        if (!video || !streamUrl) {
            return;
        }
        var hls = null;
        var attached = false;
        var pendingPlay = false;

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        function playVideo() {
            hideOverlay();
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        function attach() {
            if (attached) {
                return true;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                attached = true;
                return true;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls();
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (pendingPlay) {
                        playVideo();
                    }
                });
                attached = true;
                return false;
            }
            video.src = streamUrl;
            attached = true;
            return true;
        }

        function start() {
            pendingPlay = true;
            var readyToPlay = attach();
            if (readyToPlay) {
                playVideo();
            } else {
                hideOverlay();
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }
        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                start();
            });
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", hideOverlay);
        video.addEventListener("pause", function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove("is-hidden");
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
