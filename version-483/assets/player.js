(() => {
    const shell = document.querySelector('[data-player]');

    if (!shell) {
        return;
    }

    const video = shell.querySelector('video');
    const cover = shell.querySelector('[data-player-cover]');
    const sourceUrl = shell.dataset.src;
    let started = false;
    let libraryPromise = null;

    const loadLibrary = () => {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (libraryPromise) {
            return libraryPromise;
        }

        libraryPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
            script.async = true;
            script.onload = () => resolve(window.Hls);
            script.onerror = reject;
            document.head.appendChild(script);
        });

        return libraryPromise;
    };

    const attachSource = async () => {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            return;
        }

        const Hls = await loadLibrary();

        if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            return;
        }

        video.src = sourceUrl;
    };

    const startPlayback = async () => {
        if (started) {
            return;
        }

        started = true;
        video.controls = true;

        if (cover) {
            cover.classList.add('is-hidden');
        }

        try {
            await attachSource();
            await video.play();
        } catch (error) {
            started = false;
            video.controls = true;

            if (cover) {
                cover.classList.remove('is-hidden');
            }
        }
    };

    if (cover) {
        cover.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', () => {
        if (!started) {
            startPlayback();
        }
    });
})();
