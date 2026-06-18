(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHeaderSearch() {
        var forms = document.querySelectorAll("[data-header-search]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var url = "./search.html";
                if (query) {
                    url += "?q=" + encodeURIComponent(query);
                }
                window.location.href = url;
            });
        });
    }

    function setupHero() {
        var carousel = document.querySelector("[data-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-dot]"));
        var prev = carousel.querySelector("[data-prev]");
        var next = carousel.querySelector("[data-next]");
        var current = 0;
        var timer;

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

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        show(0);
        start();
    }

    function setupFilters() {
        var area = document.querySelector("[data-filter-area]");
        if (!area) {
            return;
        }
        var input = area.querySelector("[data-search-input]");
        var year = area.querySelector("[data-year-filter]");
        var type = area.querySelector("[data-type-filter]");
        var category = area.querySelector("[data-category-filter]");
        var cards = Array.prototype.slice.call(area.querySelectorAll("[data-card]"));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (input && initial) {
            input.value = initial;
        }

        function matches(card) {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var yearValue = year ? year.value : "";
            var typeValue = type ? type.value : "";
            var categoryValue = category ? category.value : "";
            var text = (card.getAttribute("data-title") || "").toLowerCase();
            var okKeyword = !keyword || text.indexOf(keyword) !== -1;
            var okYear = !yearValue || card.getAttribute("data-year") === yearValue;
            var okType = !typeValue || card.getAttribute("data-type") === typeValue;
            var okCategory = !categoryValue || card.getAttribute("data-category") === categoryValue;
            return okKeyword && okYear && okType && okCategory;
        }

        function apply() {
            cards.forEach(function (card) {
                card.classList.toggle("is-hidden-card", !matches(card));
            });
        }

        [input, year, type, category].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    window.initPlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var cover = document.getElementById(options.coverId);
        if (!video || !cover || !options.url) {
            return;
        }
        var started = false;
        var hlsInstance = null;

        function attach() {
            if (started) {
                return Promise.resolve();
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = options.url;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(options.url);
                hlsInstance.attachMedia(video);
                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                    window.setTimeout(resolve, 1200);
                });
            }
            video.src = options.url;
            return Promise.resolve();
        }

        function play() {
            cover.classList.add("is-hidden");
            attach().then(function () {
                video.controls = true;
                var result = video.play();
                if (result && result.catch) {
                    result.catch(function () {});
                }
            });
        }

        cover.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!started) {
                play();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupMobileMenu();
        setupHeaderSearch();
        setupHero();
        setupFilters();
    });
})();
