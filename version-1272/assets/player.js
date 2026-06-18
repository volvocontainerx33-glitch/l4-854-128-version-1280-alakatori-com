(function () {
  function attach(video, src) {
    if (video.dataset.ready === "1") {
      return;
    }
    video.dataset.ready = "1";
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      return;
    }
    video.src = src;
  }

  window.initMoviePlayer = function (videoId, buttonId, src) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !src) {
      return;
    }
    function start() {
      attach(video, src);
      button.classList.add("is-hidden");
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {});
      }
    }
    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });
  };
})();
