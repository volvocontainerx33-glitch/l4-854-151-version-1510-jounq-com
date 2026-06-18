(function () {
    const menuButton = document.querySelector('[data-mobile-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
        const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
        const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
        const prev = carousel.querySelector('[data-hero-prev]');
        const next = carousel.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                schedule();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                schedule();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                schedule();
            });
        }

        show(0);
        schedule();
    });

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        const input = root.querySelector('[data-filter-input]');
        const type = root.querySelector('[data-filter-type]');
        const region = root.querySelector('[data-filter-region]');
        const year = root.querySelector('[data-filter-year]');
        const cards = Array.from(root.querySelectorAll('[data-card]'));
        const empty = root.querySelector('[data-empty]');

        function valueOf(control) {
            return control ? control.value.trim().toLowerCase() : '';
        }

        function matches(card) {
            const query = valueOf(input);
            const wantedType = valueOf(type);
            const wantedRegion = valueOf(region);
            const wantedYear = valueOf(year);
            const haystack = [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags
            ].join(' ').toLowerCase();

            if (query && haystack.indexOf(query) === -1) {
                return false;
            }
            if (wantedType && (card.dataset.type || '').toLowerCase() !== wantedType) {
                return false;
            }
            if (wantedRegion && (card.dataset.region || '').toLowerCase() !== wantedRegion) {
                return false;
            }
            if (wantedYear && (card.dataset.year || '').toLowerCase() !== wantedYear) {
                return false;
            }
            return true;
        }

        function apply() {
            let visible = 0;
            cards.forEach(function (card) {
                const ok = matches(card);
                card.classList.toggle('hidden-by-filter', !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, type, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    });
})();
