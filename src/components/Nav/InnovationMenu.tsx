import { useGlobal } from "@/contexts/GlobalContext";
import { Box, Grid, IconButton, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";

export default function InnovationMenu() {
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
                <Tooltip title='Programa de Ideias - i9 4071'>
                    <IconButton
                        size='small'
                        type='button'
                        onClick={() => {
                            window.open(
                                "https://sicoobaccredi.aevoinnovate.net/#/dashboard/ideias",
                                "_blank",
                                "noopener,noreferrer",
                            );
                        }}>
                        <TipsAndUpdatesOutlinedIcon
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
