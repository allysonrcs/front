import { Box, Breadcrumbs, Grid, Link, Typography } from "@mui/material";
import { NotificationsFields } from "./NotificationsFields";
import { useGlobal } from "@/contexts/GlobalContext";
import { useNavigate } from "react-router-dom";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

export function Notifications() {
    const { theme } = useGlobal();

    const navigate = useNavigate();

    const isThemeLight = theme === "light";

    return (
        <>
            <Grid container spacing={1} justifyContent='center' paddingInline={2} mt={0} mb={0.75} wrap='wrap'>
                <Grid item xs={12} md={12}>
                    <Box display='flex' justifyContent='space-between' alignItems='center' width='100%'>
                        <Breadcrumbs aria-label='breadcrumb' separator='›'>
                            <Typography
                                color='text.primary'
                                sx={{ display: "inline-flex", alignItems: "center" }}
                                pt={1}>
                                <SettingsOutlinedIcon sx={{ color: isThemeLight ? "#5e5e5e" : "#FFFFFF", mr: 0.5 }} />
                                Funções Administrativas
                            </Typography>
                            <Link
                                color='text.primary'
                                sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    "&:hover": {
                                        color: "primary.main",
                                    },
                                }}
                                underline='none'
                                onClick={() => {
                                    navigate("/funcoes-administrativas/notificacoes");
                                }}>
                                Notificações
                            </Link>
                            <Typography color='text.secondary'>Criar Notificação</Typography>
                        </Breadcrumbs>
                    </Box>
                </Grid>
            </Grid>
            <Box mb={2}>
                <NotificationsFields />
            </Box>
        </>
    );
}
