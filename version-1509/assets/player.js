(function () {
  var panel = document.querySelector('[data-player]');

  if (!panel) {
    return;
  }

  var video = panel.querySelector('video');
  var button = panel.querySelector('[data-play-button]');
  var status = panel.querySelector('[data-player-status]');
  var stream = panel.getAttribute('data-stream');
  var started = false;
  var hlsInstance = null;

  var setStatus = function (message) {
    if (status) {
      status.textContent = message || '';
    }
  };

  var start = function () {
    if (started || !video || !stream) {
      return;
    }

    started = true;
    panel.classList.add('is-playing');
    video.setAttribute('controls', 'controls');
    setStatus('正在打开播放...');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.play().catch(function () {
        setStatus('点击视频继续播放');
      });
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {
          setStatus('点击视频继续播放');
        });
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('播放初始化失败，请稍后重试。');
          if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
          }
        }
      });
      return;
    }

    video.src = stream;
    video.play().catch(function () {
      setStatus('播放初始化失败，请稍后重试。');
    });
  };

  if (button) {
    button.addEventListener('click', start);
  }

  panel.addEventListener('click', function (event) {
    if (!started && event.target !== button) {
      start();
    }
  });
})();
