import { Grid, Box, IconButton, Tooltip, useTheme, useMediaQuery, SxProps } from "@mui/material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { useGlobal } from "@/contexts/GlobalContext";
import { TemporaryDrawer } from "../TemporaryDrawer/TemporaryDrawer";
import { CooperatedDataContextProvider, useCooperatedData } from "@/contexts/CooperatedDataContext";
import { OpenCooperatedData } from "./CooperatedDataDrawer/OpenCooperatedData";

export default function CooperatedDataMenu() {
    return (
        <CooperatedDataContextProvider>
            <CooperatedDataMenuInner />
        </CooperatedDataContextProvider>
    );
}

export function CooperatedDataMenuInner() {
    const { toggleDrawer, isDrawerOpen, cooperatedContent } = useCooperatedData();
    const { theme, colorBorderSystem, cyanBlur, redBlur } = useGlobal();

    const themeUI = useTheme();
    const smDown = useMediaQuery(themeUI.breakpoints.down("sm"));

    const isThemeLight = theme === "light";

    const closeContent = () => {
        toggleDrawer();
    };

    const sxAsideProps: SxProps = {
        width: "100%",
        "& .MuiDrawer-paperAnchorRight": {
            maxWidth: smDown ? "94%" : "60%",
            minWidth: smDown ? "94%" : 500,
            justifyContent: "center",
            marginRight: "1rem",
        },
        "& .MuiDrawer-paper": {
            background: "transparent",
            boxShadow: "none",
            overflow: "hidden",
        },
    };

    const sxContentProps: SxProps = {
        "& .MuiDrawer-paperAnchorRight": {
            width: smDown ? "100%" : "70%",
        },
        "& .MuiDrawer-paper": {
            background: isThemeLight ? "#ffffffae" : "linear-gradient(135deg, #051b1f, #0c2e33)",
            borderLeft: `1px solid ${colorBorderSystem}`,
            backdropFilter: "blur(30px)",
            backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
            backgroundRepeat: "no-repeat, no-repeat",
            backgroundSize: "50%, 50%",
            backgroundPosition: "right top, left bottom",
        },
    };

    return (
        <Grid item sx={{ display: "flex" }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    textAlign: "center",
                }}>
                <Tooltip title='Consulta Cooperado'>
                    <IconButton onClick={toggleDrawer} size='small' color='inherit'>
                        <AccountCircleOutlinedIcon
                            sx={{
                                color: isThemeLight ? "#1F3E45" : "#ffffff",
                            }}
                        />
                    </IconButton>
                </Tooltip>
            </Box>

            <TemporaryDrawer
                open={isDrawerOpen}
                disableEscapeKeyDown={true}
                onClose={closeContent}
                sx={!cooperatedContent ? sxAsideProps : sxContentProps}
                ModalProps={{
                    BackdropProps: { style: { backgroundColor: "transparent" } },
                }}>
                <OpenCooperatedData />
            </TemporaryDrawer>
        </Grid>
    );
}
