(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initMenu() {
        var header = document.querySelector(".site-header");
        var toggle = document.querySelector(".menu-toggle");
        if (!header || !toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            header.classList.toggle("menu-open");
            var expanded = header.classList.contains("menu-open");
            toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
                dot.setAttribute("aria-pressed", i === current ? "true" : "false");
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        Array.prototype.slice.call(document.querySelectorAll("[data-filter-box]")).forEach(function (box) {
            var input = box.querySelector("[data-search]");
            var region = box.querySelector("[data-region-filter]");
            var type = box.querySelector("[data-type-filter]");
            var year = box.querySelector("[data-year-filter]");
            var targetId = box.getAttribute("data-filter-box");
            var target = document.getElementById(targetId);
            var empty = document.querySelector('[data-empty-for="' + targetId + '"]');
            if (!target) {
                return;
            }
            var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));

            function norm(value) {
                return String(value || "").toLowerCase().trim();
            }

            function apply() {
                var q = norm(input && input.value);
                var r = region ? region.value : "";
                var t = type ? type.value : "";
                var y = year ? year.value : "";
                var shown = 0;

                cards.forEach(function (card) {
                    var hay = norm([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var ok = true;
                    if (q && hay.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (r && card.getAttribute("data-region") !== r) {
                        ok = false;
                    }
                    if (t && card.getAttribute("data-type") !== t) {
                        ok = false;
                    }
                    if (y && card.getAttribute("data-year") !== y) {
                        ok = false;
                    }
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        shown += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", shown === 0);
                }
            }

            [input, region, type, year].forEach(function (el) {
                if (el) {
                    el.addEventListener("input", apply);
                    el.addEventListener("change", apply);
                }
            });
        });
    }

    function initPlayers() {
        Array.prototype.slice.call(document.querySelectorAll(".video-box")).forEach(function (box) {
            var video = box.querySelector("video");
            var trigger = box.querySelector(".player-trigger");
            if (!video || !trigger) {
                return;
            }
            var stream = video.getAttribute("src");
            var started = false;
            var hls = null;

            function prepare() {
                if (started) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.setAttribute("src", stream);
                } else if (window.Hls && window.Hls.isSupported()) {
                    video.removeAttribute("src");
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.setAttribute("src", stream);
                }
                box.hlsInstance = hls;
                started = true;
            }

            function play() {
                prepare();
                box.classList.add("is-playing");
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {});
                }
            }

            trigger.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                box.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    box.classList.remove("is-playing");
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
