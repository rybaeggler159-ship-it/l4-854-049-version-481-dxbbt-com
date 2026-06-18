(() => {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const navMenu = document.querySelector('[data-nav-menu]');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('is-open');
        });
    }

    const slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        let activeIndex = 0;

        const activate = (nextIndex) => {
            activeIndex = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, index) => {
                slide.classList.toggle('is-active', index === activeIndex);
            });
            dots.forEach((dot, index) => {
                dot.classList.toggle('is-active', index === activeIndex);
            });
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => activate(index));
        });

        if (slides.length > 1) {
            window.setInterval(() => activate(activeIndex + 1), 5200);
        }
    }

    const searchInputs = Array.from(document.querySelectorAll('[data-search-input]'));

    searchInputs.forEach((input) => {
        const scope = input.closest('[data-search-scope]') || document;
        const cards = Array.from(scope.querySelectorAll('.searchable-card'));
        const empty = scope.querySelector('[data-filter-empty]');
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q') || '';

        if (query) {
            input.value = query;
        }

        const applyFilter = () => {
            const keyword = input.value.trim().toLowerCase();
            let visibleCount = 0;

            cards.forEach((card) => {
                const haystack = (card.dataset.search || card.textContent || '').toLowerCase();
                const visible = !keyword || haystack.includes(keyword);
                card.classList.toggle('hidden-by-search', !visible);
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visibleCount === 0);
            }
        };

        input.addEventListener('input', applyFilter);
        applyFilter();
    });

    const jumpForms = Array.from(document.querySelectorAll('[data-search-jump]'));

    jumpForms.forEach((form) => {
        form.addEventListener('submit', (event) => {
            const input = form.querySelector('input[name="q"]');
            const value = input ? input.value.trim() : '';

            if (!value) {
                return;
            }

            event.preventDefault();
            const action = form.getAttribute('action') || 'all-movies.html';
            window.location.href = `${action}?q=${encodeURIComponent(value)}`;
        });
    });
})();
