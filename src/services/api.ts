import axios from "axios";
import { TOKEN } from "@/constants/local-storage";
import { getBaseURL } from "@/functions/getBaseURL";

const api = () => {
    const axiosInstance = axios.create({
        baseURL: getBaseURL(),
    });

    axiosInstance.interceptors.request.use(function (config: any) {
        const token = sessionStorage.getItem(window.btoa(TOKEN));
        config.headers.authorization = token ? `Bearer ${token}` : "";
        return config;
    });

    axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 403) {
                console.error("Acesso proibido: CORS ou outro problema de autorização.");
            }
            return Promise.reject(error);
        },
    );

    return axiosInstance;
};

export default api;
