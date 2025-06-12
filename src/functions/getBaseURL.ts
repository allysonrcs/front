export const getBaseURL = (): string => {
    const currentURL = window.location.href;

    const url = new URL(currentURL);
    const baseURL = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ""}`;

    if (
        baseURL.includes(import.meta.env.VITE_APP_URL_FRONT_IP) ||
        baseURL.includes(import.meta.env.VITE_APP_URL_FRONT_LOCALHOST)
    ) {
        return import.meta.env.VITE_APP_URL_API_IP;
    } else {
        return import.meta.env.VITE_APP_URL_API_DOMAIN;
    }
};
