(function () {
    var video = document.getElementById('movie-player');
    var cover = document.querySelector('.player-cover');
    var data = document.getElementById('stream-data');

    if (!video || !data) {
        return;
    }

    var stream = '';
    try {
        stream = JSON.parse(data.textContent || '{}').url || '';
    } catch (error) {
        stream = '';
    }

    var hlsInstance = null;
    var prepared = false;
    var wantsPlay = false;

    function prepare() {
        if (prepared || !stream) {
            return;
        }
        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
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
                if (wantsPlay) {
                    video.play().catch(function () {});
                }
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal || !hlsInstance) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                } else {
                    hlsInstance.destroy();
                }
            });
        }
    }

    function play() {
        wantsPlay = true;
        prepare();
        if (cover) {
            cover.classList.add('hidden');
        }
        video.play().catch(function () {});
    }

    if (cover) {
        cover.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        if (!prepared) {
            play();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
