(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var header = document.querySelector("[data-header]");
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");

        function setHeaderState() {
            if (!header) {
                return;
            }
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        }

        setHeaderState();
        window.addEventListener("scroll", setHeaderState, { passive: true });

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function play() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    play();
                });
            });

            show(0);
            play();
        });

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-key]"));
            var empty = scope.querySelector("[data-filter-empty]");
            var active = {};

            buttons.forEach(function (button) {
                var key = button.getAttribute("data-filter-key");
                if (!active[key]) {
                    active[key] = "all";
                }
                button.addEventListener("click", function () {
                    var value = button.getAttribute("data-filter-value") || "all";
                    active[key] = value;
                    buttons.filter(function (item) {
                        return item.getAttribute("data-filter-key") === key;
                    }).forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    applyFilter();
                });
            });

            function applyFilter() {
                var term = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var matched = true;
                    var searchText = (card.getAttribute("data-search") || "").toLowerCase();

                    if (term && searchText.indexOf(term) === -1) {
                        matched = false;
                    }

                    Object.keys(active).forEach(function (key) {
                        var value = active[key];
                        if (value && value !== "all") {
                            var cardValue = card.getAttribute("data-" + key) || "";
                            if (cardValue !== value) {
                                matched = false;
                            }
                        }
                    });

                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }

            applyFilter();
        });
    });
})();

(function () {
    function run() {
        if (!/search\.html$/.test(window.location.pathname) && window.location.pathname.split("/").pop() !== "search.html") {
            return;
        }
        var query = new URLSearchParams(window.location.search).get("q");
        if (!query) {
            return;
        }
        var input = document.querySelector("[data-filter-input]");
        if (input) {
            input.value = query;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run);
    } else {
        run();
    }
})();
