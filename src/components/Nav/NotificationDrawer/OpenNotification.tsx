import { useEffect, useState } from "react";
import { Box, Grid, Paper, SxProps, useMediaQuery, useTheme } from "@mui/material";
import { useNotification } from "@/contexts/NotificationContext";
import { useGlobal } from "@/contexts/GlobalContext";
import { Loader } from "../../Loader/Loader";
import { AsideNotification } from "./AsideNotification";
import { ContentNotification } from "./ContentNotification";
import { toast } from "react-toastify";

export function OpenNotification() {
    const { getInfoError, theme, redBlur, cyanBlur } = useGlobal();
    const { notificationContent, refreshListAsideNotifications } = useNotification();
    const [loading, setLoading] = useState<boolean>(false);

    const themeUI = useTheme();
    const smDown = useMediaQuery(themeUI.breakpoints.down("xl"));

    const searchNotifications = async () => {
        try {
            setLoading((prev) => !prev);

            await refreshListAsideNotifications();
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading((prev) => !prev);
        }
    };

    useEffect(() => {
        async function execute() {
            searchNotifications();
        }
        execute();
    }, []);

    const sxNotificationProps: SxProps = {
        height: "97vh",
        maxWidth: !smDown ? "40vw" : "none",
        minWidth: !smDown && notificationContent ? "46vw" : "none",
        borderRadius: "16px",
        backgroundColor: theme === "light" ? "#ffffff" : "background.default",
        border: theme === "light" ? "1px solid #F0F0F0" : "1px solid #1F3E45",
        backdropFilter: "blur(20px)",
        backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
        backgroundRepeat: "no-repeat, no-repeat",
        backgroundSize: "50%, 50%",
        backgroundPosition: "right top, left bottom",
    };

    return (
        <Grid component={"div"} sx={sxNotificationProps}>
            {loading ? (
                <Box
                    component={Paper}
                    sx={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                    }}>
                    <Loader />
                </Box>
            ) : (
                <>{!notificationContent && <AsideNotification />}</>
            )}

            <ContentNotification />
        </Grid>
    );
}
