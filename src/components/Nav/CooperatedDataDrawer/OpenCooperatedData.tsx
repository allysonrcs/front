import { useEffect, useState } from "react";
import { Box, Grid, Paper, SxProps, useMediaQuery, useTheme } from "@mui/material";
import { useGlobal } from "@/contexts/GlobalContext";
import { useCooperatedData } from "@/contexts/CooperatedDataContext";
import { toast } from "react-toastify";
import { Loader } from "../../Loader/Loader";
import { AsideCooperatedData } from "./AsideCooperatedData";
import { ContentCooperatedData } from "./ContentCooperatedData";

export function OpenCooperatedData() {
    const { getInfoError, theme, redBlur, cyanBlur, colorBorderSystem } = useGlobal();
    const { cooperatedList, cooperatedContent } = useCooperatedData();
    const [loading, setLoading] = useState<boolean>(false);

    const themeUI = useTheme();
    const smDown = useMediaQuery(themeUI.breakpoints.down("xl"));

    // const searchNotifications = async () => {
    //     try {
    //         setLoading((prev) => !prev);

    //         await refreshListAsideNotifications();
    //     } catch (error) {
    //         const info = await getInfoError(error);
    //         toast.error(info.message);
    //     } finally {
    //         setLoading((prev) => !prev);
    //     }
    // };

    // useEffect(() => {
    //     async function execute() {
    //         searchNotifications();
    //     }
    //     execute();
    // }, []);

    const sxAsideProps: SxProps = {
        height: "97vh",
        maxWidth: !smDown ? "40vw" : "none",
        minWidth: !smDown && cooperatedContent ? "46vw" : "none",
        borderRadius: "16px",
        border: theme === "light" ? "1px solid #e0e0e0" : "1px solid #1F3E45",
        background: theme === "light" ? "#ffffffae" : "linear-gradient(135deg, #051b1f, #0c2e33)",
        borderLeft: `1px solid ${colorBorderSystem}`,
        backdropFilter: theme === "light" ? "blur(30px)" : "blur(40px)",
        backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
        backgroundRepeat: "no-repeat, no-repeat",
        backgroundSize: "50%, 50%",
        backgroundPosition: "right top, left bottom",
    };

    const sxContentProps: SxProps = {};

    return (
        <Grid component={"div"} sx={!!cooperatedContent ? sxContentProps : sxAsideProps}>
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
                <>{!cooperatedContent && <AsideCooperatedData />}</>
            )}

            {cooperatedContent && <ContentCooperatedData idExtClient={2163942} p={3} />}
        </Grid>
    );
}
