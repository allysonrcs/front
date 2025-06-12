import { useState } from "react";
import {
    Grid,
    Box,
    IconButton,
    Tooltip,
    useTheme,
    useMediaQuery,
    Typography,
    Divider,
    MenuItem,
    ListItemIcon,
    Menu,
    Modal,
} from "@mui/material";
import { useGlobal } from "../../contexts/GlobalContext";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import { BoxModal } from "../BoxModal/BoxModal";

export default function UtilitiesMenu() {
    const [openMenuUtilities, setOpenMenuUtilities] = useState<null | HTMLElement>(null);
    const [openModalCalculator, setOpenModalCalculator] = useState<boolean>(false);

    const { theme: themeContext, cyanBlur, redBlur, colorBackgroundSystem } = useGlobal();

    const theme = useTheme();
    const smDown = useMediaQuery(theme.breakpoints.down("sm"));

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setOpenMenuUtilities(event.currentTarget);
    };

    const handleCloseMenuUtilities = () => setOpenMenuUtilities(null);

    const handleCloseModalCalculator = () => {
        setOpenModalCalculator((oldValue) => !oldValue);
    };

    return (
        <>
            <Grid item sx={{ display: smDown ? "none" : "flex" }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        textAlign: "center",
                    }}>
                    <Tooltip title='Utilitários'>
                        <IconButton onClick={handleClick} size='small' color='inherit'>
                            <WidgetsOutlinedIcon
                                sx={{
                                    color: themeContext === "light" ? " #1F3E45" : "#fff",
                                }}
                            />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Menu
                    anchorEl={openMenuUtilities}
                    id='account-menu'
                    open={Boolean(openMenuUtilities)}
                    onClose={handleCloseMenuUtilities}
                    onClick={handleCloseMenuUtilities}
                    slotProps={{
                        paper: {
                            elevation: 0,
                            sx: {
                                position: "relative",
                                mt: 1.5,
                                minWidth: "15rem",
                                maxWidth: "20rem",
                                overflow: "visible",
                                border: `1px solid ${theme.palette.divider}`,
                                filter: "drop-shadow(0px 2px 6px rgba(0,0,0,0.20))",
                                background: "background.paper",
                                backdropFilter: "blur(25px)",
                                backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                                backgroundRepeat: "no-repeat, no-repeat",
                                backgroundSize: "50%, 50%",
                                backgroundPosition: "right top, left bottom",
                                "& .MuiAvatar-root": {
                                    width: 70,
                                    height: 70,
                                    ml: -0.5,
                                    mr: 1,
                                },
                                "&:before": {
                                    content: '""',
                                    position: "absolute",
                                    top: -1,
                                    left: 295,
                                    transform: "translateY(-50%) rotate(45deg)",
                                    width: 14,
                                    height: 14,
                                    borderTop: `1px solid ${theme.palette.divider}`,
                                    borderLeft: `1px solid ${theme.palette.divider}`,
                                    zIndex: 0,
                                    bgcolor: themeContext === "light" ? "#f4fcfd" : "#012b34",
                                    backdropFilter: "blur(100px)",
                                },
                            },
                        },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                    <Typography
                        color='primary'
                        fontSize={18}
                        fontWeight='bold'
                        sx={{ padding: "2px 1rem", mt: "10px" }}
                        noWrap>
                        Utilitários
                    </Typography>

                    <Divider sx={{ mt: 1 }} />

                    <MenuItem onClick={() => setOpenModalCalculator(true)}>
                        <ListItemIcon>
                            <CalculateOutlinedIcon fontSize='small' />
                        </ListItemIcon>
                        Calculadora HP 12c
                    </MenuItem>
                </Menu>
            </Grid>

            <Modal open={openModalCalculator} onClose={handleCloseModalCalculator} disableEscapeKeyDown={false}>
                <BoxModal title={"Calculadora HP 12c"} handleClose={handleCloseModalCalculator}>
                    <Grid container direction='row' justifyContent={"center"} mt={-2}>
                        <iframe
                            src='/html/calculadora/calculadora.html'
                            width='465'
                            height='298'
                            loading='lazy'
                            style={{ border: "none" }}>
                            Seu navegador não suporta iframes.
                        </iframe>
                    </Grid>
                </BoxModal>
            </Modal>
        </>
    );
}
