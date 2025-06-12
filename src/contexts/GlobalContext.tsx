import React, { createContext, useState, useContext } from "react";
import axios, { AxiosError } from "axios";
import api from "../services/api";
import { STATUS_SIDEBAR, THEME, THEME_COLOR_PORTAL } from "../constants/local-storage";
import { TOKEN, INFO_USER } from "../constants/local-storage";
import notification_sound_3 from "../assets/songs/notification-3.mp3";
import redBlur from "@/assets//images/red-blur.png";
import cyanBlur from "@/assets//images/cyan-blur.png";

type Props = {
    children: React.ReactNode;
};

type TypeAlertProps = "error" | "info" | "unnotarized";
interface InfoError {
    type: TypeAlertProps;
    message: string;
}

export type ThemeProps = "light" | "dark";

type NotificationListItem = {
    chat: number;
    customer_service: number;
    forum: number;
};

type Callback = (data: any) => void;

type GlobalContextType = {
    isSidebarOpen: boolean;
    isBackdropOpen: boolean;
    showModalLogin: boolean;
    showModalTowFactor: boolean;
    theme: ThemeProps;
    colorBorderSystem: string;
    colorScrollSystem: string;
    colorBackgroundSystem: string;
    colorBoxShadowSystem: string;
    redBlur: string;
    cyanBlur: string;
    toggleStatusSidebar: () => Promise<void>;
    toggleStatusBackdrop: () => Promise<void>;
    toggleStatusTheme: () => Promise<void>;
    toggleStatusModalLogin: (status?: boolean) => Promise<void>;
    toggleStatusModalTowFactor: () => Promise<void>;
    clearConfig: () => Promise<void>;
    getInfoError: (error: any) => Promise<InfoError>;
    existUserConnected: () => Promise<boolean>;
    triggerSound: (sound: any) => void;
    getAudioStream(options?: MediaStreamConstraints): Promise<MediaStream>;
    recordAudio(mediaStream: MediaStream): MediaRecorder;
    notificationListItem: NotificationListItem;
    setNotificationListItem: React.Dispatch<React.SetStateAction<NotificationListItem>>;
    notification: (
        params: {
            title: string;
            body?: string;
            href?: string;
            audio?: any;
            playSound?: boolean;
            data?: any;
        },
        callback?: Callback,
    ) => void;
    isSupportedNotification: () => boolean;
};

const GlobalContext = createContext<GlobalContextType>({} as GlobalContextType);

export const GlobalContextProvider: React.FC<Props> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [isBackdropOpen, setBackdropOpen] = useState<boolean>(false);
    const [showModalLogin, setShowModalLogin] = useState<boolean>(false);
    const [showModalTowFactor, setShowModalTowFactor] = useState<boolean>(false);
    const [notificationListItem, setNotificationListItem] = useState<NotificationListItem>({
        chat: 0,
        customer_service: 0,
        forum: 0,
    });

    const [theme, setTheme] = useState<ThemeProps>(
        (window.localStorage.getItem(THEME_COLOR_PORTAL) as ThemeProps) ?? "light",
    );

    async function toggleStatusTheme() {
        window.localStorage.setItem(THEME_COLOR_PORTAL, theme === "dark" ? "light" : "dark");
        setTheme(theme === "dark" ? "light" : "dark");
    }

    async function toggleStatusSidebar() {
        setIsSidebarOpen((isSidebarOpen) => !isSidebarOpen);
    }

    async function toggleStatusBackdrop() {
        setBackdropOpen((isBackdropOpen) => !isBackdropOpen);
    }

    async function toggleStatusModalLogin(status?: boolean) {
        if (status) {
            setShowModalLogin(status);
        } else {
            setShowModalLogin((showModalLogin) => !showModalLogin);
        }
    }

    async function toggleStatusModalTowFactor() {
        setShowModalTowFactor((showModalTowFactor) => !showModalTowFactor);
    }

    async function clearConfig() {
        localStorage.removeItem(window.btoa(THEME));
        localStorage.removeItem(window.btoa(STATUS_SIDEBAR));

        setTheme("light");
        setIsSidebarOpen(true);

        delete api().defaults.headers.common["authorization"];
    }

    async function existUserConnected() {
        const token = sessionStorage.getItem(window.btoa(TOKEN));
        const user = sessionStorage.getItem(window.btoa(INFO_USER));

        return user && token ? true : false;
    }

    const colorBorderSystem = theme === "light" ? "#E0E0E0" : "#1F3E45";
    const colorScrollSystem = theme === "light" ? "#e2e0e0" : "#296a79";
    const colorBackgroundSystem = theme === "light" ? "#ffffff" : "linear-gradient(135deg, #051b1f, #0c2e33)";
    const colorBoxShadowSystem =
        theme === "light"
            ? "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 8px 10px -4px"
            : "none";

    async function getInfoError(err: any): Promise<InfoError> {
        let type: TypeAlertProps = "error";
        let msg =
            "Desculpe-nos, mas ocorreu algum erro internamente. Se o problema persistir, entre em contato com o time do MIND.";

        console.error(err);

        if (axios.isAxiosError(err)) {
            const error = err as AxiosError;

            if (error.response) {
                let responseData = error.response.data;

                if (responseData instanceof ArrayBuffer) {
                    try {
                        responseData = JSON.parse(new TextDecoder().decode(responseData as ArrayBuffer));
                    } catch (e) {
                        console.error("Erro ao fazer o parsing do ArrayBuffer do Arquivo de download", e);
                    }
                }

                const { message, statusCode }: any = responseData;

                if (statusCode) {
                    switch (statusCode) {
                        case 412:
                            type = "info";
                            break;
                        case 401:
                            type = "unnotarized";
                            const existUser = await existUserConnected();
                            if (existUser) {
                                toggleStatusModalLogin(true);
                            }
                            break;
                        case 403:
                            msg = "Acesso negado. Você não tem permissão para acessar este recurso.";
                            break;
                        case 404:
                            msg = "Recurso não encontrado.";
                            break;
                        case 500:
                            msg = "Erro interno do servidor. Tente novamente mais tarde.";
                            break;
                        default:
                            msg = `Erro inesperado: ${statusCode}`;
                            break;
                    }
                }

                if (message) {
                    msg = message;
                }
            } else if (error.request) {
                type = "error";
                msg =
                    "A solicitação foi feita, mas nenhuma resposta foi recebida. Se o problema persistir, entre em contato com o time do MIND.";
            }
        } else {
            type = "error";
            msg =
                "Desculpe-nos, mas ocorreu algo inesperado no APP que não tratamos. Se o problema persistir, entre em contato com o time do MIND.";
        }

        return {
            type,
            message: msg,
        };
    }

    function triggerSound(sound: any): void {
        const audio = new Audio(sound);
        audio.volume = 1;
        audio.autoplay = true;
    }

    function enumerateDevices(): Promise<MediaDeviceInfo[]> {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.enumerateDevices().then(resolve).catch(reject);
        });
    }

    function getAudioStream(options?: MediaStreamConstraints): Promise<MediaStream> {
        return new Promise(async (resolve, reject) => {
            try {
                const devices = await enumerateDevices();
                const hasDevice = devices.find((device) => device.kind === "audioinput");

                if (!hasDevice) {
                    throw new Error("Você não possui dispositivo para captar audio");
                }

                const mediaStream = navigator.mediaDevices.getUserMedia(options ?? { audio: true, video: false });
                resolve(mediaStream);
            } catch (error) {
                reject(error);
            }
        });
    }

    function recordAudio(mediaStream: MediaStream): MediaRecorder {
        const recorded = new MediaRecorder(mediaStream);
        recorded.start();
        return recorded;
    }

    function notification(
        params: {
            title: string;
            body?: string;
            href?: string;
            audio?: any;
            playSound?: boolean;
            data?: any;
        },
        callback?: Callback,
    ) {
        if (!isSupportedNotification()) {
            console.log("Este navegador não suporta notificações.");
            return false;
        }

        function showNotification() {
            if (params.playSound === undefined || params.playSound) {
                triggerSound(params.audio ?? notification_sound_3);
            }

            const notification = new Notification(params.title, {
                body: params.body,
                data: params.data,
            });

            if (params.href) {
                const href = params.href;

                notification.onclick = (e: Event) => {
                    e.preventDefault();
                    if (window.location.pathname === href) {
                        window.parent.parent.focus();

                        const { data }: any = e.currentTarget;
                        if (data) {
                            callback?.(data);
                        }
                    } else {
                        window.location.href = href;
                    }
                };
            }
        }

        if (Notification.permission === "granted") {
            showNotification();
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    showNotification();
                }
            });
        }
    }

    const isSupportedNotification = () =>
        "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;

    return (
        <GlobalContext.Provider
            value={{
                isSidebarOpen,
                isBackdropOpen,
                showModalLogin,
                showModalTowFactor,
                theme,
                colorBorderSystem,
                colorScrollSystem,
                colorBackgroundSystem,
                colorBoxShadowSystem,
                redBlur,
                cyanBlur,
                toggleStatusTheme,
                toggleStatusBackdrop,
                toggleStatusSidebar,
                toggleStatusModalLogin,
                toggleStatusModalTowFactor,
                clearConfig,
                getInfoError,
                existUserConnected,
                triggerSound,
                getAudioStream,
                recordAudio,
                notificationListItem,
                setNotificationListItem,
                notification,
                isSupportedNotification,
            }}>
            {children}
        </GlobalContext.Provider>
    );
};

export function useGlobal() {
    const context = useContext(GlobalContext);
    return context;
}
