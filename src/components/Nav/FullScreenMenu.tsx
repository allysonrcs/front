import { Grid, Box, IconButton, Tooltip, useTheme, useMediaQuery } from "@mui/material";
import { useGlobal } from "../../contexts/GlobalContext";
import { toggleFullScreen } from "@/functions/fullScreen";
import FullscreenIcon from "@mui/icons-material/Fullscreen";

export default function FullScreenMenu() {
    const { theme: themContext } = useGlobal();

    const theme = useTheme();
    const smDown = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Grid item sx={{ display: smDown ? "none" : "flex" }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    textAlign: "center",
                }}>
                <Tooltip title='Tela Cheia'>
                    <IconButton onClick={toggleFullScreen} size='small' color='inherit'>
                        <FullscreenIcon
                            sx={{
                                color: themContext === "light" ? " #1F3E45" : "#fff",
                            }}
                        />
                    </IconButton>
                </Tooltip>
            </Box>
        </Grid>
    );
}
