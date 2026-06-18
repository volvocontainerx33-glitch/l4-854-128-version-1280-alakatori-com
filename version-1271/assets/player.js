(function () {
    function initMoviePlayer(videoId, streamUrl, overlayId) {
        var video = document.getElementById(videoId);
        var overlay = overlayId ? document.getElementById(overlayId) : null;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function loadStream() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.setAttribute("data-ready", "1");
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video.setAttribute("data-ready", "1");
                return;
            }

            video.src = streamUrl;
            video.setAttribute("data-ready", "1");
        }

        function start(event) {
            if (event) {
                event.preventDefault();
            }
            loadStream();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
