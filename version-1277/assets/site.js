(function () {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function syncHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 18) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });

    if (toggle && mobileNav && header) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
            header.classList.toggle('menu-open', mobileNav.classList.contains('open'));
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        show(0);
        restart();
    }

    var panels = document.querySelectorAll('.filter-panel');
    panels.forEach(function (panel) {
        var scope = panel.parentElement || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.searchable-card'));
        var input = panel.querySelector('[data-search-input]');
        var type = panel.querySelector('[data-filter-type]');
        var year = panel.querySelector('[data-filter-year]');
        var category = panel.querySelector('[data-filter-category]');
        var list = scope.querySelector('[data-card-list]');
        var empty = null;

        function text(card, name) {
            return (card.getAttribute(name) || '').toLowerCase();
        }

        function ensureEmpty() {
            if (!list) {
                return null;
            }
            if (!empty) {
                empty = document.createElement('div');
                empty.className = 'no-results';
                empty.textContent = '没有匹配的影片';
                list.appendChild(empty);
            }
            return empty;
        }

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var typeValue = type ? type.value : 'all';
            var yearValue = year ? year.value : 'all';
            var categoryValue = category ? category.value : 'all';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    text(card, 'data-title'),
                    text(card, 'data-region'),
                    text(card, 'data-type'),
                    text(card, 'data-year'),
                    text(card, 'data-category'),
                    text(card, 'data-tags')
                ].join(' ');
                var ok = true;
                if (keyword && haystack.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (typeValue !== 'all' && text(card, 'data-type').indexOf(typeValue.toLowerCase()) === -1) {
                    ok = false;
                }
                if (yearValue !== 'all' && text(card, 'data-year') !== yearValue.toLowerCase()) {
                    ok = false;
                }
                if (categoryValue !== 'all' && text(card, 'data-category') !== categoryValue.toLowerCase()) {
                    ok = false;
                }
                card.classList.toggle('is-hidden', !ok);
                if (ok) {
                    visible += 1;
                }
            });

            var emptyNode = ensureEmpty();
            if (emptyNode) {
                emptyNode.style.display = visible ? 'none' : 'block';
            }
        }

        [input, type, year, category].forEach(function (element) {
            if (element) {
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            }
        });

        apply();
    });
})();
