import { useEffect, useState } from "react";
import {
    Avatar,
    Box,
    Divider,
    Grid,
    Icon,
    IconButton,
    Menu,
    Modal,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SyncLockRoundedIcon from "@mui/icons-material/SyncLockRounded";
import ListItemIcon from "@mui/material/ListItemIcon";
import Logout from "@mui/icons-material/Logout";
import MenuItem from "@mui/material/MenuItem";
import ChangePassword from "../Modal/Auth/ChangePassword/ChangePassword";
import AlterPhoto from "../Modal/AlterPhoto/AlterPhoto";
import BadgeAvatars from "../AvatarWithBadge/AvatarWithBadge";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { INFO_USER } from "@/constants/local-storage";
import { useGlobal } from "@/contexts/GlobalContext";

export default function AccountMenu() {
    const [openEl, setOpenEl] = useState<null | HTMLElement>(null);
    const [open, setOpen] = useState<boolean>(false);
    const [openAlterPhoto, setOpenAlterPhoto] = useState<boolean>(false);

    const { logOut, user } = useAuth();
    const { theme: themeContext, cyanBlur, redBlur } = useGlobal();
    const theme = useTheme();
    const navigate = useNavigate();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setOpenEl(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setOpenEl(null);
        setOpen(true);
    };

    const handleCloseModal = () => setOpen(false);
    const handleModalAlterPhoto = () => setOpenAlterPhoto(!openAlterPhoto);

    const handleClose = () => setOpenEl(null);

    const handleLogout = async () => {
        await logOut();
    };

    useEffect(() => {
        const isConnected = sessionStorage.getItem(window.btoa(INFO_USER));
        if (!isConnected) {
            navigate("/auth/login");
        }
    }, [user]);

    return (
        <Grid item>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    textAlign: "center",
                }}>
                <Tooltip title={user?.name}>
                    <IconButton
                        onClick={handleClick}
                        size='small'
                        aria-controls={openEl ? "account-menu" : undefined}
                        aria-haspopup='true'
                        aria-expanded={openEl ? "true" : undefined}>
                        <Avatar
                            alt='Profile picture'
                            src={user?.url_image_profile ? user.url_image_profile : undefined}
                            sx={{ textTransform: "uppercase", backgroundColor: "#91919158", color: "#ffffff" }}>
                            {user?.name[0]}
                        </Avatar>
                    </IconButton>
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
                                left: 287,
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
                <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <BadgeAvatars
                        user={user}
                        badgeActionClick={handleModalAlterPhoto}
                        type='default'
                        sx={{ backgroundColor: "#00796d29", color: "#ffffff" }}
                    />
                </Box>

                <Typography
                    noWrap
                    title={user?.name || ""}
                    color='primary'
                    fontWeight='bold'
                    textAlign='center'
                    sx={{ padding: "2px 1rem", mt: 1 }}>
                    {user?.name}
                </Typography>

                <Divider sx={{ mb: 1, mt: 0.5 }} />

                <Typography
                    noWrap
                    title='E-mail Corporativo'
                    sx={{ display: "flex", alignItems: "center", padding: "2px 1rem", fontSize: "0.8rem" }}>
                    <Icon
                        className='material-icons-outlined'
                        fontSize='small'
                        color='action'
                        sx={{ marginRight: "1rem" }}>
                        mail
                    </Icon>
                    {user?.email}
                </Typography>

                {user?.role_name && (
                    <Typography
                        noWrap
                        title='Cargo'
                        sx={{ display: "flex", alignItems: "center", padding: "2px 1rem", fontSize: "0.8rem" }}>
                        <Icon
                            className='material-icons-outlined'
                            fontSize='small'
                            color='action'
                            sx={{ marginRight: "1rem" }}>
                            work_outlined
                        </Icon>
                        {user.role_name}
                    </Typography>
                )}

                {user?.sector_name && (
                    <Typography
                        noWrap
                        title='Setor'
                        sx={{ display: "flex", alignItems: "center", padding: "2px 1rem", fontSize: "0.8rem" }}>
                        <Icon
                            className='material-icons-outlined'
                            fontSize='small'
                            color='action'
                            sx={{ marginRight: "1rem" }}>
                            workspaces
                        </Icon>
                        {user.sector_name}
                    </Typography>
                )}

                {user?.team_name && (
                    <Typography
                        noWrap
                        title='Time'
                        sx={{ display: "flex", alignItems: "center", padding: "2px 1rem", fontSize: "0.8rem" }}>
                        <Icon
                            className='material-icons-outlined'
                            fontSize='small'
                            color='action'
                            sx={{ marginRight: "1rem" }}>
                            diversity_3_outlined
                        </Icon>
                        {user.team_name}
                    </Typography>
                )}

                <Typography
                    noWrap
                    title='Agência'
                    sx={{ display: "flex", alignItems: "center", padding: "2px 1rem", fontSize: "0.8rem" }}>
                    <Icon
                        className='material-icons-outlined'
                        fontSize='small'
                        color='action'
                        sx={{ marginRight: "1rem" }}>
                        account_balance
                    </Icon>
                    {user?.agency_name}
                </Typography>

                {user?.portfolio_name && (
                    <Typography
                        noWrap
                        title='Carteira'
                        sx={{ display: "flex", alignItems: "center", padding: "2px 1rem", fontSize: "0.8rem" }}>
                        <Icon
                            className='material-icons-outlined'
                            fontSize='small'
                            color='action'
                            sx={{ marginRight: "1rem" }}>
                            wallet
                        </Icon>
                        {user.portfolio_name}
                    </Typography>
                )}

                <Divider sx={{ mt: 1 }} />

                <MenuItem onClick={() => navigate("/meu-perfil")} sx={{ lineHeight: 1.2 }}>
                    <ListItemIcon>
                        <AccountCircleIcon fontSize='small' />
                    </ListItemIcon>
                    Meu Perfil
                </MenuItem>

                <MenuItem onClick={handleCloseUserMenu} sx={{ lineHeight: 1.2 }}>
                    <ListItemIcon>
                        <SyncLockRoundedIcon fontSize='small' />
                    </ListItemIcon>
                    Trocar senha
                </MenuItem>

                <MenuItem onClick={handleLogout} sx={{ lineHeight: 1.2, mb: -1 }}>
                    <ListItemIcon>
                        <Logout fontSize='small' />
                    </ListItemIcon>
                    Sair
                </MenuItem>

                <Divider />

                <Typography variant='body2' color='text.secondary' align='center'>
                    {import.meta.env.VITE_APP_NAME.toUpperCase() + " " + import.meta.env.VITE_APP_VERSION}
                </Typography>
            </Menu>

            <Modal open={open} onClose={handleCloseModal}>
                <Box>
                    <ChangePassword handleClose={handleCloseModal} />
                </Box>
            </Modal>

            <AlterPhoto open={openAlterPhoto} handleClose={handleModalAlterPhoto} user={user} />
        </Grid>
    );
}
