import { ReactNode, createContext, useContext, useState, useCallback } from "react";
import {
    INotificationAsideProps,
    INotificationContent,
    listUserNotifications,
    searchTotalNotificationNotViewed,
    getUserNotificationById,
    markNotificationAsRead,
} from "../services/notifications";
import { useGlobal } from "./GlobalContext";
import { toast } from "react-toastify";

export interface INotificationContext {
    unreadCount: number;
    notificationList: INotificationAsideProps[];
    notificationContent?: INotificationContent;
    filterMode: "all" | "read" | "unread";
    isDrawerOpen: boolean;
    setFilterMode: React.Dispatch<React.SetStateAction<"all" | "read" | "unread">>;
    refreshListAsideNotifications: () => Promise<void>;
    refreshUnreadCountBadge: () => Promise<void>;
    markAsReadNotification: (id: number) => Promise<void>;
    selectNotificationContent: (id: number) => Promise<void>;
    clearContent: () => void;
    toggleDrawer: () => void;
    openDrawer: () => void;
    closeDrawer: () => void;
}

export const NotificationContext = createContext<INotificationContext>({} as INotificationContext);

export function NotificationContextProvider({ children }: { children: ReactNode }) {
    const [filterMode, setFilterMode] = useState<"all" | "read" | "unread">("all");
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [notificationList, setNotificationList] = useState<INotificationAsideProps[]>([]);
    const [notificationContent, setNotificationContent] = useState<INotificationContent>();

    const { getInfoError } = useGlobal();

    const refreshListAsideNotifications = useCallback(async () => {
        try {
            const listNotifications = await listUserNotifications({});
            setNotificationList(listNotifications);

            // Reconta quantos ainda estão is_read === false
            const countUnread = listNotifications.filter((item) => !item.is_read).length;
            setUnreadCount(countUnread);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error("Erro ao buscar lista de notificações.");
            toast.error(info.message);
        }
    }, []);

    const refreshUnreadCountBadge = useCallback(async () => {
        try {
            const total = await searchTotalNotificationNotViewed();
            setUnreadCount(total);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
            console.error("Erro ao buscar total de notificações não lidas.");
        }
    }, []);

    // 3) markAsRead: chama a API, marca localmente na lista e decrementa contador
    const markAsReadNotification = useCallback(async (id: number) => {
        try {
            await markNotificationAsRead(id);
            // Atualiza localmente o campo is_read e decrementa o “badge”
            setNotificationList((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
            setUnreadCount((prev) => Math.max(prev - 1, 0));
        } catch (error) {
            const info = await getInfoError(error);
            toast.error("Erro ao marcar notificação como lida.");
            toast.error(info.message);
        }
    }, []);

    // 4) selectNotification: busca os detalhes de uma notificação, grava em notificationContent e marca como lida localmente
    const selectNotificationContent = useCallback(async (id: number) => {
        try {
            const data: INotificationContent = await getUserNotificationById(id);

            setNotificationContent({
                id: data.id,
                type: data.type,
                title: data.title,
                subtitle: data.subtitle,
                content: data.content,
                image_cover: data.image_cover,
                priority_level: data.priority_level,
                source: data.source,
                is_external_link: data.is_external_link,
                link_url: data.link_url,
                people_name: data.people_name,
                url_image_profile: data.url_image_profile,
                moduleIcon: data.moduleIcon,
                is_read: data.is_read,
                created_at: data.created_at,
                is_active: data.is_active,
                notification_attachment: [],
            });

            // Marca como lida na lista “aside” e decrementa badge:
            setNotificationList((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
            setUnreadCount((prev) => Math.max(prev - 1, 0));
        } catch (error) {
            const info = await getInfoError(error);
            toast.error("Erro ao carregar detalhes da notificação.");
            toast.error(info.message);
        }
    }, []);

    const clearContent = useCallback(() => {
        setNotificationContent(undefined);
    }, []);

    const toggleDrawer = useCallback(() => {
        setIsDrawerOpen((prev) => !prev);
    }, []);

    const openDrawer = useCallback(() => {
        setIsDrawerOpen(true);
    }, []);

    const closeDrawer = useCallback(() => {
        setIsDrawerOpen(false);
        setFilterMode("all");
    }, []);

    // 7) Ao montar o provider, queremos carregar imediatamente a lista e o badge
    // useEffect(() => {
    //     refreshList();
    //     // Caso queira polling automático do badge aqui, poderia também:
    //     // const id = setInterval(refreshUnreadCount, 120_000);
    //     // return () => clearInterval(id);
    // }, [refreshList]);

    return (
        <NotificationContext.Provider
            value={{
                notificationList,
                unreadCount,
                notificationContent,
                isDrawerOpen,
                filterMode,
                setFilterMode,
                refreshListAsideNotifications,
                refreshUnreadCountBadge,
                markAsReadNotification,
                selectNotificationContent,
                clearContent,
                toggleDrawer,
                openDrawer,
                closeDrawer,
            }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotification = () => {
    const notificationContext = useContext(NotificationContext);
    return notificationContext;
};
