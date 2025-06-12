import { useState, useEffect } from "react";
import { Chip, Icon, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useMatch, useNavigate, useResolvedPath } from "react-router-dom";
import { useGlobal } from "@/contexts/GlobalContext";

interface IListItemLinkProps {
    to: string;
    icon: string;
    label: string;
    onClick: (() => void) | undefined;
    isSidebarOpen?: boolean;
}

export function ListItemLink({ to, icon, label, onClick, isSidebarOpen }: IListItemLinkProps) {
    const { notificationListItem, setNotificationListItem } = useGlobal();
    const navigate = useNavigate();
    const [notification, setNotification] = useState(0);

    const resolvedPath = useResolvedPath(to);
    const match = useMatch({ path: resolvedPath.pathname, end: false });

    const handleClick = () => {
        if (notification) {
            setNotification(0);

            if (to === "/conversa") {
                setNotificationListItem((prev) => {
                    const data = { ...prev, chat: 0 };
                    return data;
                });
            } else if (to === "/chats-atendimento") {
                setNotificationListItem((prev) => {
                    const data = { ...prev, customer_service: 0 };
                    return data;
                });
            } else if (to === "/forum") {
                setNotificationListItem((prev) => {
                    const data = { ...prev, forum: 0 };
                    return data;
                });
            }
        }

        navigate(to);
        onClick?.();
    };

    useEffect(() => {
        if (to === "/conversa") {
            setNotification(notificationListItem.chat);
        } else if (to === "/chats-atendimento") {
            setNotification(notificationListItem.customer_service);
        } else if (to === "/forum") {
            setNotification(notificationListItem.forum);
        }
    }, [notificationListItem]);

    return (
        <ListItemButton selected={!!match} onClick={handleClick} style={{ height: 42 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
                <Icon className='material-icons-outlined'>{icon}</Icon>
            </ListItemIcon>
            {isSidebarOpen && (
                <ListItemText
                    primary={label}
                    primaryTypographyProps={{ style: { whiteSpace: "normal", fontSize: 14 } }}
                />
            )}
            {notification > 0 && <Chip color='primary' size='small' label={notification} />}
        </ListItemButton>
    );
}
