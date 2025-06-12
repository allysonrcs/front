import * as React from "react";
import { styled, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Grid, useMediaQuery, useTheme } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { useGlobal } from "../../contexts/GlobalContext";
import { ListItemOptionsLink } from "./ListItemOptionsLink";
import { ListItemLink } from "./ListItemLink";
import { DarkMode, LightMode } from "@mui/icons-material";
import { Link } from "react-router-dom";
import logoNavSingColorida from "../../assets/images/sing-nav-logo-colorida.png";
import logoNavSingBranca from "../../assets/images/sing-nav-logo-branca.png";
import favIconSingColor from "../../assets/images/sing-icone-colorido.ico";
import favIconSingWhite from "../../assets/images/sing-icone-branco.ico";

const drawerWidth = 275;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: `calc(${theme.spacing(7)} + 0px)`,
    [theme.breakpoints.up("sm")]: {
        width: `calc(${theme.spacing(7.5)} + 0px)`,
    },
});

const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
    }),
}));

type MiniSidebarProps = {
    children: React.ReactNode;
};

export default function MiniSideBar({ children }: MiniSidebarProps) {
    const { routes } = useAuth();
    const themeUi = useTheme();
    const lgDown = useMediaQuery(themeUi.breakpoints.down("lg"));
    const { isSidebarOpen, theme, colorBackgroundSystem, toggleStatusSidebar, toggleStatusTheme, redBlur, cyanBlur } =
        useGlobal();

    React.useEffect(() => {
        if (lgDown && isSidebarOpen) {
            toggleStatusSidebar();
        }
    }, [lgDown]);

    return (
        <>
            {lgDown ? (
                <MuiDrawer
                    anchor={"left"}
                    open={isSidebarOpen}
                    onClose={toggleStatusSidebar}
                    sx={{
                        "& .MuiDrawer-paper": {
                            background: colorBackgroundSystem,
                            borderRight: theme === "light" ? `1px solid #E0E0E0` : `1px solid #243232`,
                            backdropFilter: "blur(25px)",
                            backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                            backgroundRepeat: "no-repeat, no-repeat",
                            backgroundSize: "50%, 50%",
                            backgroundPosition: "right top, left bottom",
                            width: drawerWidth,
                        },
                    }}>
                    <IconButton
                        sx={{
                            ":hover": {
                                background: "none",
                            },
                        }}
                        onClick={toggleStatusSidebar}>
                        <img
                            style={{ width: "41.5%" }}
                            src={theme === "light" ? logoNavSingColorida : logoNavSingBranca}
                            alt='Logo SING'
                        />
                    </IconButton>

                    <Box flex={1} overflow={"auto"}>
                        <Divider />
                        <List>
                            {routes.map((drawerOption, index) => (
                                <ListItem key={index} disablePadding sx={{ display: "block" }}>
                                    {drawerOption.routes && !drawerOption.component && drawerOption.isMenu ? (
                                        <ListItemOptionsLink
                                            to={drawerOption.route}
                                            key={drawerOption.route}
                                            icon={drawerOption.icon}
                                            label={drawerOption.label}
                                            routes={drawerOption.routes.map(function (value) {
                                                return { to: value.route, label: value.label };
                                            })}
                                            onClick={lgDown ? toggleStatusSidebar : undefined}
                                            isSidebarOpen={isSidebarOpen}
                                        />
                                    ) : (
                                        <ListItemLink
                                            to={drawerOption.route}
                                            key={drawerOption.route}
                                            icon={drawerOption.icon}
                                            label={drawerOption.label}
                                            onClick={lgDown ? toggleStatusSidebar : undefined}
                                            isSidebarOpen={isSidebarOpen}
                                        />
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    <Divider />

                    <Box>
                        <List component='nav'>
                            <ListItemButton onClick={toggleStatusTheme} style={{ height: 34 }}>
                                <ListItemIcon sx={{ minWidth: 32, mr: 1 }}>
                                    {theme === "light" ? <DarkMode /> : <LightMode />}
                                </ListItemIcon>
                                <ListItemText
                                    primary='Alternar tema'
                                    primaryTypographyProps={{
                                        style: { whiteSpace: "normal", fontSize: 14 },
                                    }}
                                />
                            </ListItemButton>
                        </List>
                    </Box>
                </MuiDrawer>
            ) : (
                <Drawer
                    anchor='left'
                    open={isSidebarOpen}
                    variant={lgDown && !isSidebarOpen ? "temporary" : "permanent"}
                    onClose={toggleStatusSidebar}>
                    <DrawerHeader>
                        <IconButton
                            sx={{
                                ":hover": {
                                    background: "none",
                                },
                            }}
                            onClick={toggleStatusSidebar}>
                            {!isSidebarOpen ? (
                                <img
                                    style={{ width: "93%", marginLeft: -10, marginTop: -2 }}
                                    src={theme === "light" ? favIconSingColor : favIconSingWhite}
                                    alt='favIcon SING'
                                />
                            ) : (
                                <MenuIcon />
                            )}
                        </IconButton>
                        {isSidebarOpen && (
                            <Grid
                                item
                                container
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    ml: -4.5,
                                    mt: 0.25,
                                }}>
                                <Link
                                    style={{
                                        width: "38%",
                                    }}
                                    to='/bem-vindo'>
                                    <img
                                        style={{ width: "92%" }}
                                        src={theme === "light" ? logoNavSingColorida : logoNavSingBranca}
                                        alt='Logo SING'
                                    />
                                </Link>
                            </Grid>
                        )}
                    </DrawerHeader>
                    <Divider sx={{ mt: -0.35 }} />
                    <Box flex={1} overflow={"auto"}>
                        <List>
                            {routes.map((drawerOption, index) => (
                                <ListItem key={index} disablePadding sx={{ display: "block" }}>
                                    {drawerOption.routes && !drawerOption.component && drawerOption.isMenu ? (
                                        <ListItemOptionsLink
                                            to={drawerOption.route}
                                            key={drawerOption.route}
                                            icon={drawerOption.icon}
                                            label={drawerOption.label}
                                            routes={drawerOption.routes.map(function (value) {
                                                return { to: value.route, label: value.label };
                                            })}
                                            onClick={lgDown ? toggleStatusSidebar : undefined}
                                            isSidebarOpen={isSidebarOpen}
                                        />
                                    ) : (
                                        <ListItemLink
                                            to={drawerOption.route}
                                            key={drawerOption.route}
                                            icon={drawerOption.icon}
                                            label={drawerOption.label}
                                            onClick={lgDown ? toggleStatusSidebar : undefined}
                                            isSidebarOpen={isSidebarOpen}
                                        />
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    <Divider />

                    <Box>
                        <List component='nav'>
                            <ListItemButton onClick={toggleStatusTheme} style={{ height: 34 }}>
                                <ListItemIcon sx={{ minWidth: 32, mr: 1 }}>
                                    {theme === "light" ? <DarkMode /> : <LightMode />}
                                </ListItemIcon>
                                <ListItemText
                                    primary={isSidebarOpen ? "Alternar tema" : ""}
                                    primaryTypographyProps={{
                                        style: { whiteSpace: "normal", fontSize: 14 },
                                    }}
                                />
                            </ListItemButton>
                        </List>
                    </Box>
                </Drawer>
            )}
            <Box
                height='100vh'
                display={"flex"}
                flexDirection={"column"}
                sx={{
                    transition: "all 0.25s ease",
                }}
                marginLeft={lgDown ? 0 : themeUi.spacing(isSidebarOpen ? 34.4 : 7.5)}>
                {children}
            </Box>
        </>
    );
}
