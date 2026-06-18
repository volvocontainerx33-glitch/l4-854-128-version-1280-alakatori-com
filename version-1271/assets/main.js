(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(text) {
        return (text || "").toString().trim().toLowerCase();
    }

    function setupMenu() {
        document.querySelectorAll("[data-menu-toggle]").forEach(function (button) {
            var target = document.getElementById(button.getAttribute("data-menu-toggle"));
            if (!target) {
                return;
            }
            button.addEventListener("click", function () {
                target.classList.toggle("is-open");
            });
        });
    }

    function setupHero() {
        document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
            if (slides.length <= 1) {
                return;
            }
            var index = 0;
            var timer = null;

            function show(next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(parseInt(dot.getAttribute("data-slide"), 10) || 0);
                    start();
                });
            });

            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
            start();
        });
    }

    function setupFiltering() {
        document.querySelectorAll("[data-filter-list]").forEach(function (list) {
            var input = document.querySelector("[data-filter-input]");
            var empty = document.querySelector("[data-empty-state]");
            var clear = document.querySelector("[data-clear-search]");
            var sort = document.querySelector("[data-sort-select]");
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";

            if (input && query) {
                input.value = query;
            }

            function applyFilter() {
                var value = normalize(input ? input.value : "");
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var visible = !value || haystack.indexOf(value) !== -1;
                    card.classList.toggle("is-filter-hidden", !visible);
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.hidden = shown !== 0;
                }
            }

            function applySort() {
                if (!sort) {
                    return;
                }
                var mode = sort.value;
                var sorted = cards.slice();
                sorted.sort(function (a, b) {
                    if (mode === "year-desc") {
                        return (parseInt(b.getAttribute("data-year"), 10) || 0) - (parseInt(a.getAttribute("data-year"), 10) || 0);
                    }
                    if (mode === "title-asc") {
                        return normalize(a.querySelector("h3") ? a.querySelector("h3").textContent : "").localeCompare(normalize(b.querySelector("h3") ? b.querySelector("h3").textContent : ""), "zh-Hans-CN");
                    }
                    return cards.indexOf(a) - cards.indexOf(b);
                });
                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }
            if (clear && input) {
                clear.addEventListener("click", function () {
                    input.value = "";
                    applyFilter();
                    input.focus();
                });
            }
            if (sort) {
                sort.addEventListener("change", function () {
                    applySort();
                    applyFilter();
                });
            }
            applySort();
            applyFilter();
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFiltering();
    });
})();
