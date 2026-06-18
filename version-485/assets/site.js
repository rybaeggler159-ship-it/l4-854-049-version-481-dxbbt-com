(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-slide]'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(parseInt(dot.getAttribute('data-slide'), 10) || 0);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5000);
    }

    var params = new URLSearchParams(window.location.search);
    var queryInput = document.getElementById('site-search');
    var yearFilter = document.getElementById('year-filter');
    var typeFilter = document.getElementById('type-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-grid] .movie-card'));

    if (queryInput && params.has('q')) {
        queryInput.value = params.get('q') || '';
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
        var query = normalize(queryInput ? queryInput.value : '');
        var year = yearFilter ? yearFilter.value : '';
        var type = typeFilter ? typeFilter.value : '';

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year')
            ].join(' '));
            var matchQuery = !query || haystack.indexOf(query) !== -1;
            var matchYear = !year || card.getAttribute('data-year') === year;
            var matchType = !type || card.getAttribute('data-type') === type;
            card.classList.toggle('hidden-card', !(matchQuery && matchYear && matchType));
        });
    }

    [queryInput, yearFilter, typeFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', filterCards);
            control.addEventListener('change', filterCards);
        }
    });

    filterCards();
})();
