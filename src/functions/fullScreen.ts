export const toggleFullScreen = (): void => {
    const documentElement = document.documentElement;

    if (!document.fullscreenElement) {
        if (documentElement.requestFullscreen) {
            documentElement.requestFullscreen();
        } else if ((documentElement as any).webkitRequestFullscreen) {
            (documentElement as any).webkitRequestFullscreen();
        } else if ((documentElement as any).msRequestFullscreen) {
            (documentElement as any).msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen();
        }
    }
};
