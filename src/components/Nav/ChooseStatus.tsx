import { useState } from "react";
import { Box, Grid, Icon, Menu, MenuItem, Tooltip, Typography, useTheme } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { styled } from "@mui/material/styles";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";
import { StatesProps, useAuth } from "@/contexts/AuthContext";
import { STATUS_CHAT } from "@/constants/local-storage";
import { states } from "@/constants/array-status-user";
import { updateSocketStatus } from "@/services/employees";

const IconStatus = styled(Icon)(() => ({
    borderRadius: "50%",
    width: ".7rem",
    height: ".7rem",
}));

export default function ChooseStatus() {
    const [openEl, setOpenEl] = useState<null | HTMLElement>(null);
    const { getInfoError, theme, cyanBlur, redBlur } = useGlobal();
    const { socketStatus, setSocketStatus } = useAuth();

    const themeUI = useTheme();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setOpenEl(event.currentTarget);
    };

    const handleClose = () => setOpenEl(null);

    const update = async (params: StatesProps) => {
        try {
            setSocketStatus(params);
            sessionStorage.setItem(window.btoa(STATUS_CHAT), JSON.stringify(params));
            const socket_status = params.status.charAt(0).toLocaleUpperCase() + params.status.slice(1);
            await updateSocketStatus({ socket_status });
        } catch (error) {
            const { message } = await getInfoError(error);
            toast.error(message);
        }
    };

    const allStates = states.map(({ status, id, color }) => (
        <MenuItem
            key={id.toString()}
            onClick={() => {
                update({ status, id, color });
            }}>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                <IconStatus sx={{ backgroundColor: color }} />
                <Box sx={{ width: "70%" }}>
                    <Typography variant='caption' color='text' fontFamily={"Roboto, sans-serif"}>
                        {status}
                    </Typography>
                </Box>
            </Box>
        </MenuItem>
    ));

    return (
        <Grid item>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    textAlign: "center",
                }}>
                <Tooltip title={"Status"}>
                    <Box
                        onClick={handleClick}
                        sx={{
                            width: "100%",
                            height: "30px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderRadius: "20px",
                            paddingLeft: 1,
                            cursor: "pointer",
                            border: theme === "light" ? "1px solid  #1F3E45" : "1px solid #296a79",
                            boxSizing: "border-box",
                        }}>
                        <IconStatus sx={{ backgroundColor: socketStatus.color }} />
                        <Typography
                            fontSize='.9rem'
                            fontFamily={"Roboto, sans-serif"}
                            color={theme === "light" ? " #1F3E45" : "#fff"}
                            px={1}>
                            {socketStatus.status}
                        </Typography>
                        <ArrowDropDownIcon sx={{ color: theme === "light" ? " #1F3E45" : "#fff" }} />
                    </Box>
                </Tooltip>
            </Box>
            <Menu
                anchorEl={openEl}
                id='account-menu'
                open={Boolean(openEl)}
                onClose={handleClose}
                onClick={handleClose}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            minWidth: "7rem",
                            maxWidth: "20rem",
                            overflow: "visible",
                            border: `1px solid ${themeUI.palette.divider}`,
                            mt: 1.5,
                            filter: "drop-shadow(0px 2px 6px rgba(0,0,0,0.20))",
                            background: "background.paper",
                            backdropFilter: "blur(25px)",
                            backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                            backgroundRepeat: "no-repeat, no-repeat",
                            backgroundSize: "50%, 50%",
                            backgroundPosition: "right top, left bottom",
                            "&:before": {
                                content: '""',
                                display: "block",
                                position: "absolute",
                                top: 0,
                                right: 12,
                                width: 11,
                                height: 11,
                                borderTop: `1px solid ${themeUI.palette.divider}`,
                                borderLeft: `1px solid ${themeUI.palette.divider}`,
                                transform: "translateY(-50%) rotate(45deg)",
                                bgcolor: theme === "light" ? "#f4fcfd" : "#012b34",
                                zIndex: 0,
                            },
                        },
                    },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                {allStates}
            </Menu>
        </Grid>
    );
}
