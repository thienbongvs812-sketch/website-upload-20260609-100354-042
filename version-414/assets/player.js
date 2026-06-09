import { H as Hls } from "./hls-vendor-dru42stk.js";

export function initMoviePlayer(options) {
    const video = document.getElementById(options.videoId);
    const button = document.getElementById(options.triggerId);
    const cover = document.getElementById(options.coverId);
    const source = options.source;
    if (!video || !source) {
        return;
    }
    let mounted = false;
    let hls = null;
    const hideCover = () => {
        if (cover) {
            cover.classList.add("is-hidden");
        }
    };
    const showCover = () => {
        if (cover) {
            cover.classList.remove("is-hidden");
        }
    };
    const play = () => {
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(() => {
                showCover();
            });
        }
    };
    const mount = () => {
        if (mounted) {
            play();
            return;
        }
        mounted = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            play();
            return;
        }
        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                play();
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data && data.fatal) {
                    if (hls) {
                        hls.destroy();
                        hls = null;
                    }
                    video.src = source;
                }
            });
            return;
        }
        video.src = source;
        play();
    };
    const start = () => {
        hideCover();
        mount();
    };
    if (button) {
        button.addEventListener("click", start);
    }
    if (cover) {
        cover.addEventListener("click", start);
    }
    video.addEventListener("play", hideCover);
    video.addEventListener("pause", () => {
        if (!video.currentTime) {
            showCover();
        }
    });
}
