(function () {
    var hlsPromise = null;

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsPromise) {
            return hlsPromise;
        }
        hlsPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return hlsPromise;
    }

    function bind(shell) {
        var video = shell.querySelector('[data-player]');
        var button = shell.querySelector('[data-play-button]');
        if (!video || !button) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached) {
                return Promise.resolve();
            }
            if (!stream) {
                attached = true;
                return Promise.resolve();
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                attached = true;
                return Promise.resolve();
            }
            return loadHls().then(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    window.__hlsPlayers = window.__hlsPlayers || [];
                    window.__hlsPlayers.push(hlsInstance);
                } else {
                    video.src = stream;
                }
                attached = true;
            }).catch(function () {
                video.src = stream;
                attached = true;
            });
        }

        function start() {
            attach().then(function () {
                button.classList.add('is-hidden');
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        button.classList.remove('is-hidden');
                    });
                }
            });
        }

        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                button.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player-shell]').forEach(bind);
})();
