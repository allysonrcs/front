import { useEffect, useRef, useCallback } from "react";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { Grid, Badge, Box, IconButton, Tooltip, useTheme, useMediaQuery } from "@mui/material";
import { useGlobal } from "@/contexts/GlobalContext";
import { TemporaryDrawer } from "../TemporaryDrawer/TemporaryDrawer";
import { OpenNotification } from "./NotificationDrawer/OpenNotification";
import { NotificationContextProvider, useNotification } from "../../contexts/NotificationContext";
import { toast } from "react-toastify";
import notification_sound_3 from "@/assets/songs/notification-3.mp3";

export default function NotificationMenu() {
    return (
        <NotificationContextProvider>
            <NotificationMenuInner />
        </NotificationContextProvider>
    );
}

function NotificationMenuInner() {
    const { getInfoError, triggerSound, theme } = useGlobal();
    const { unreadCount, refreshUnreadCountBadge, toggleDrawer, isDrawerOpen, clearContent } = useNotification();
    const prevCountRef = useRef<number>(0);

    const themeUI = useTheme();
    const smDown = useMediaQuery(themeUI.breakpoints.down("sm"));

    const fetchBadge = useCallback(async () => {
        try {
            await refreshUnreadCountBadge();

            if (prevCountRef.current < unreadCount) {
                triggerSound(notification_sound_3);
                document.title = "🔔 Novas notificações | " + import.meta.env.VITE_APP_TITLE_NAME;
            }
            prevCountRef.current = unreadCount;
        } catch (err) {
            const info = await getInfoError(err);
            toast.error(info.message);
        }
    }, []);

    const closeContent = () => {
        toggleDrawer();
        clearContent();
    };

    useEffect(() => {
        fetchBadge();
        const id = setInterval(fetchBadge, 300_000);
        return () => clearInterval(id);
    }, [fetchBadge]);

    return (
        <Grid item sx={{ display: "flex" }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    textAlign: "center",
                }}>
                <Tooltip title='Notificações'>
                    <IconButton onClick={toggleDrawer} size='small' color='inherit'>
                        <Badge
                            badgeContent={unreadCount}
                            color='default'
                            max={9}
                            sx={{
                                "& .MuiBadge-badge": {
                                    backgroundColor: "#f92f60",
                                    color: "white",
                                },
                            }}>
                            <NotificationsNoneOutlinedIcon
                                sx={{
                                    color: theme === "light" ? "#1F3E45" : "#fff",
                                }}
                            />
                        </Badge>
                    </IconButton>
                </Tooltip>
            </Box>

            <TemporaryDrawer
                open={isDrawerOpen}
                disableEscapeKeyDown={true}
                onClose={closeContent}
                sx={{
                    width: "100%",
                    "& .MuiDrawer-paperAnchorRight": {
                        maxWidth: smDown ? "94%" : "60%",
                        minWidth: smDown ? "94%" : 500,
                        justifyContent: "center",
                        marginRight: "1rem",
                    },
                    "& .MuiModal-backdrop": {
                        backgroundColor: "rgb(0 0 0 / 0%)",
                    },
                    "& .MuiDrawer-paper": {
                        background: "#1b1b1b00",
                        boxShadow: "none",
                        overflow: "hidden",
                    },
                }}>
                <OpenNotification />
            </TemporaryDrawer>
        </Grid>
    );
}
