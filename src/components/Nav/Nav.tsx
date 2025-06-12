import { AppBar, Box, Toolbar, IconButton, Grid, useTheme, useMediaQuery, Chip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import { useGlobal } from "@/contexts/GlobalContext";

import AccountMenu from "./AccountMenu";
import NotificationMenu from "./NotificationMenu";
import ChooseStatus from "./ChooseStatus";
import FullScreenMenu from "./FullScreenMenu";
import CoopMaisMenu from "./CoopMaisMenu";

import logo_sicoob_colorido from "@/assets/images/sicoob-accredi-logo-preto.png";
import logo_sicoob_colorido2 from "@/assets/images/sicoob-accredi-logo-branco.png";

import bg_header_light from "@/assets/images/bgMenuHorizontalLight.png";
import bg_header_dark from "@/assets/images/bgMenuHorizontalDark2.png";
import icon_sicoob from "@/assets/images/sicoob-icon.png";

import { Link } from "react-router-dom";
import InnovationMenu from "./InnovationMenu";
import UtilitiesMenu from "./UtilitiesMenu";
import CooperatedDataMenu from "./CooperatedDataMenu";

export type OnForumProps = {
    id: number;
    title: string;
    created_at: string;
    phone_ramal: number;
    people_name: string;
    sector_name: string;
};

export function Nav() {
    const { toggleStatusSidebar, theme } = useGlobal();
    const { breakpoints } = useTheme();
    const smDown = useMediaQuery(breakpoints.down("md"));
    const breakpointsLG = useMediaQuery(breakpoints.down("lg"));
    const breakpoints400 = useMediaQuery(breakpoints.down(400));

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar
                position={"static"}
                sx={{
                    background: theme === "light" ? `url(${bg_header_light})` : `url(${bg_header_dark})`,
                    backgroundSize: "repeat",
                    backgroundColor: theme === "light" ? "#ffffff" : "#00232B",
                    boxShadow: "0px 0px 2px 0px rgba(145, 158, 171, 0.16) ",
                    borderBottom: theme === "light" ? "1px solid #E0E0E0" : "1px solid #1F3E45",
                    height: 62,
                }}>
                <Toolbar>
                    <Grid container justifyContent='center' height={62}>
                        {breakpointsLG && (
                            <Grid container item xs={0.8} alignItems='center' justifyContent='center'>
                                <IconButton
                                    size='large'
                                    edge='start'
                                    color='primary'
                                    aria-label='open drawer'
                                    onClick={toggleStatusSidebar}>
                                    <MenuIcon sx={{ color: theme === "light" ? " #1F3E45" : "#fff" }} />
                                </IconButton>
                            </Grid>
                        )}

                        {!breakpoints400 && (
                            <Grid
                                container
                                item
                                xs={!smDown ? 3 : 2}
                                sx={{
                                    height: "100%",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "flex-start",
                                }}>
                                {!smDown ? (
                                    <Link to='/bem-vindo' style={{ height: "45%" }}>
                                        <img
                                            style={{ height: "100%" }}
                                            src={theme === "light" ? logo_sicoob_colorido : logo_sicoob_colorido2}
                                            alt='Logo'
                                        />
                                    </Link>
                                ) : (
                                    <Link to='/bem-vindo' style={{ height: "45%" }}>
                                        <img style={{ height: "100%" }} src={icon_sicoob} alt='Logo' />
                                    </Link>
                                )}
                            </Grid>
                        )}

                        <Grid container item xs alignItems='center' justifyContent='flex-end' spacing={1}>
                            {!smDown && import.meta.env.VITE_ENV === "development" && (
                                <Grid item sx={{ display: "flex" }} mr={1.5}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            textAlign: "center",
                                        }}>
                                        <Chip
                                            label={breakpointsLG ? "Dev" : "Ambiente de Desenvolvimento"}
                                            variant='outlined'
                                            size='small'
                                            sx={{
                                                whiteSpace: "normal",
                                                lineHeight: 1,
                                                fontSize: "0.8rem",
                                                color: "white",
                                                backgroundColor: theme === "light" ? "#f15d07cf" : "#f15d0797",
                                                borderColor: "#f85509ec",
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            )}

                            <ChooseStatus />
                            <CoopMaisMenu />
                            <UtilitiesMenu />
                            <InnovationMenu />
                            <CooperatedDataMenu />
                            <NotificationMenu />
                            <FullScreenMenu />
                            <AccountMenu />
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
