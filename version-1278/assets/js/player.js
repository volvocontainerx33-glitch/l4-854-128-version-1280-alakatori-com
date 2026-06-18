(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setMessage(root, text) {
    var message = root.querySelector('.player-message');
    if (message) {
      message.textContent = text || '';
    }
  }

  function attachSource(root, video, source) {
    if (video.dataset.ready === 'true') {
      return Promise.resolve();
    }

    video.controls = true;
    video.dataset.ready = 'true';

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setMessage(root, '播放源加载异常，请稍后重试');
          }
        });
        window.setTimeout(resolve, 1200);
      });
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    video.src = source;
    return Promise.resolve();
  }

  function setupPlayer(root) {
    var video = root.querySelector('video');
    var cover = root.querySelector('.player-cover');
    var source = root.getAttribute('data-source');

    if (!video || !cover || !source) {
      return;
    }

    function play() {
      setMessage(root, '正在加载播放源');
      attachSource(root, video, source).then(function () {
        cover.classList.add('is-hidden');
        setMessage(root, '');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            setMessage(root, '请点击视频播放按钮开始播放');
          });
        }
      });
    }

    cover.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });
  }

  ready(function () {
    document.querySelectorAll('.js-player').forEach(setupPlayer);
  });
})();
