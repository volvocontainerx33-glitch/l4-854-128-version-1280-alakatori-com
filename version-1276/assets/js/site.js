(function() {
    const navButton = document.querySelector('[data-nav-toggle]');
    const mainNav = document.querySelector('[data-main-nav]');
    const topSearch = document.querySelector('.top-search');

    if (navButton && mainNav) {
        navButton.addEventListener('click', function() {
            mainNav.classList.toggle('is-open');
            if (topSearch) {
                topSearch.classList.toggle('is-open');
            }
        });
    }

    const slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-target]'));
        let current = 0;
        let timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                const target = Number(dot.getAttribute('data-hero-target'));
                show(target);
                play();
            });
        });

        if (slides.length > 1) {
            play();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function uniqueValues(cards, attr) {
        const values = [];
        cards.forEach(function(card) {
            const value = card.getAttribute(attr);
            if (value && values.indexOf(value) === -1) {
                values.push(value);
            }
        });
        return values.sort(function(a, b) {
            return String(b).localeCompare(String(a), 'zh-CN');
        });
    }

    function fillSelect(select, values) {
        if (!select || select.children.length > 1) {
            return;
        }
        values.forEach(function(value) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function initFilters(panel) {
        const input = panel.querySelector('[data-filter-input]');
        const root = panel.parentElement || document;
        const cards = Array.from(root.querySelectorAll('.searchable-card'));
        const empty = panel.querySelector('[data-empty-state]');
        const yearSelect = panel.querySelector('[data-filter-select="year"]');
        const typeSelect = panel.querySelector('[data-filter-select="type"]');
        const regionSelect = panel.querySelector('[data-filter-select="region"]');

        fillSelect(yearSelect, uniqueValues(cards, 'data-year'));
        fillSelect(typeSelect, uniqueValues(cards, 'data-type'));
        fillSelect(regionSelect, uniqueValues(cards, 'data-region'));

        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        if (query && input) {
            input.value = query;
        }

        function apply() {
            const keyword = normalize(input ? input.value : '');
            const year = yearSelect ? yearSelect.value : '';
            const type = typeSelect ? typeSelect.value : '';
            const region = regionSelect ? regionSelect.value : '';
            let visible = 0;

            cards.forEach(function(card) {
                const text = normalize(card.getAttribute('data-search-text'));
                const okKeyword = !keyword || text.indexOf(keyword) !== -1;
                const okYear = !year || card.getAttribute('data-year') === year;
                const okType = !type || card.getAttribute('data-type') === type;
                const okRegion = !region || card.getAttribute('data-region') === region;
                const matched = okKeyword && okYear && okType && okRegion;
                card.classList.toggle('is-hidden-card', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, yearSelect, typeSelect, regionSelect].forEach(function(control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    }

    document.querySelectorAll('[data-filter-form]').forEach(initFilters);
})();
