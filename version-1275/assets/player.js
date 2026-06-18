(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    window.initMoviePlayer = function (streamUrl) {
        onReady(function () {
            var video = document.querySelector("[data-player]");
            var layer = document.querySelector("[data-player-layer]");
            var start = document.querySelector("[data-player-start]");
            var prepared = false;
            var hls = null;

            if (!video || !streamUrl) {
                return;
            }

            function prepare() {
                if (prepared) {
                    return;
                }
                prepared = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    return;
                }

                video.src = streamUrl;
            }

            function play() {
                prepare();
                if (layer) {
                    layer.classList.add("is-hidden");
                }
                var request = video.play();
                if (request && typeof request.catch === "function") {
                    request.catch(function () {
                        if (layer) {
                            layer.classList.remove("is-hidden");
                        }
                    });
                }
            }

            if (start) {
                start.addEventListener("click", play);
            }

            if (layer) {
                layer.addEventListener("click", function (event) {
                    if (event.target === layer) {
                        play();
                    }
                });
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });

            video.addEventListener("play", function () {
                if (layer) {
                    layer.classList.add("is-hidden");
                }
            });

            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    };
})();
