(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initHeader() {
        var header = document.querySelector("[data-site-header]");
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (header && header.classList.contains("header-on-hero")) {
            var syncHeader = function () {
                header.classList.toggle("is-scrolled", window.scrollY > 18);
            };

            syncHeader();
            window.addEventListener("scroll", syncHeader, { passive: true });
        }

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var hero = document.querySelector("[data-hero]");
        var current = 0;
        var timer = null;

        if (!hero || slides.length <= 1) {
            return;
        }

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startTimer();
            });
        });

        hero.addEventListener("mouseenter", stopTimer);
        hero.addEventListener("mouseleave", startTimer);
        startTimer();
    }

    function normalizeText(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initGlobalSearch() {
        var box = document.querySelector("[data-search-box]");
        var input = document.querySelector("[data-global-search]");
        var results = document.querySelector("[data-search-results]");
        var trigger = document.querySelector("[data-search-trigger]");
        var index = window.MOVIE_SEARCH_INDEX || [];

        if (!input || !results || !index.length) {
            return;
        }

        if (trigger && box) {
            trigger.addEventListener("click", function () {
                box.classList.add("is-visible");
                input.focus();
            });
        }

        function render(items) {
            if (!items.length) {
                results.innerHTML = '<div class="search-result-item"><span><strong>没有找到匹配影片</strong><em>请尝试其他关键词</em></span></div>';
                results.hidden = false;
                return;
            }

            results.innerHTML = items.slice(0, 30).map(function (item) {
                return [
                    '<a class="search-result-item" href="' + item.url + '">',
                    '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">',
                    '<span>',
                    '<strong>' + escapeHtml(item.title) + '</strong>',
                    '<span>' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.genre) + '</span>',
                    '</span>',
                    '</a>'
                ].join("");
            }).join("");
            results.hidden = false;
        }

        function search() {
            var keyword = normalizeText(input.value);
            if (!keyword) {
                results.hidden = true;
                results.innerHTML = "";
                return;
            }

            var keywords = keyword.split(/\s+/).filter(Boolean);
            var matched = index.filter(function (item) {
                var haystack = normalizeText([
                    item.title,
                    item.region,
                    item.year,
                    item.genre,
                    item.category,
                    item.tags
                ].join(" "));
                return keywords.every(function (word) {
                    return haystack.indexOf(word) !== -1;
                });
            });

            render(matched);
        }

        input.addEventListener("input", search);
        document.addEventListener("click", function (event) {
            if (!event.target.closest("[data-search-box]") && !event.target.closest("[data-search-trigger]")) {
                results.hidden = true;
                if (box && !input.value) {
                    box.classList.remove("is-visible");
                }
            }
        });
    }

    function initHeroSearch() {
        var form = document.querySelector("[data-hero-search]");
        var heroInput = document.querySelector("[data-hero-search-input]");
        var globalInput = document.querySelector("[data-global-search]");

        if (!form || !heroInput || !globalInput) {
            return;
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            globalInput.value = heroInput.value;
            globalInput.focus();
            globalInput.dispatchEvent(new Event("input", { bubbles: true }));
        });
    }

    function initCategoryFilters() {
        var controls = document.querySelector("[data-filter-controls]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

        if (!controls || !cards.length) {
            return;
        }

        var keywordInput = controls.querySelector("[data-filter-keyword]");
        var regionSelect = controls.querySelector("[data-filter-region]");
        var yearSelect = controls.querySelector("[data-filter-year]");
        var count = controls.querySelector("[data-filter-count]");

        function applyFilters() {
            var keyword = normalizeText(keywordInput ? keywordInput.value : "");
            var region = regionSelect ? regionSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = normalizeText([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.category,
                    card.textContent
                ].join(" "));
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesRegion = !region || card.dataset.region === region;
                var matchesYear = !year || card.dataset.year === year;
                var visible = matchesKeyword && matchesRegion && matchesYear;

                card.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (count) {
                count.textContent = String(visibleCount);
            }
        }

        [keywordInput, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    }

    function initPlayers() {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (player) {
            var video = player.querySelector("[data-video]");
            var button = player.querySelector("[data-play-trigger]");
            var message = player.querySelector("[data-player-message]");
            var source = player.dataset.m3u8;
            var hlsInstance = null;

            if (!video || !button || !source) {
                return;
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text || "";
                }
            }

            function attachSource() {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    return Promise.resolve();
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage("播放源加载异常，请刷新页面或稍后重试。");
                        }
                    });
                    return Promise.resolve();
                }

                return Promise.reject(new Error("当前浏览器不支持 HLS 播放"));
            }

            button.addEventListener("click", function () {
                player.classList.add("is-playing");
                video.setAttribute("controls", "controls");
                setMessage("正在加载播放源...");

                attachSource()
                    .then(function () {
                        return video.play();
                    })
                    .then(function () {
                        setMessage("");
                    })
                    .catch(function (error) {
                        player.classList.remove("is-playing");
                        setMessage(error.message || "播放初始化失败，请稍后重试。");
                    });
            }, { once: true });

            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    ready(function () {
        initHeader();
        initHero();
        initGlobalSearch();
        initHeroSearch();
        initCategoryFilters();
        initPlayers();
    });
})();
