import { useGlobal } from "@/contexts/GlobalContext";
import { formatDate } from "@/functions/date";
import { Box, Divider, Grid, GridProps, Typography } from "@mui/material";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";
import NotificationImportantOutlinedIcon from "@mui/icons-material/NotificationImportantOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import OpenInBrowserOutlinedIcon from "@mui/icons-material/OpenInBrowserOutlined";
import TripOriginOutlinedIcon from "@mui/icons-material/TripOriginOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import WorkspacesOutlinedIcon from "@mui/icons-material/WorkspacesOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import NoAccountsOutlinedIcon from "@mui/icons-material/NoAccountsOutlined";
import DoNotDisturbOffOutlinedIcon from "@mui/icons-material/DoNotDisturbOffOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import { useNotification } from "@/contexts/NotificationContext";

type SummaryProps = {
    idNotification?: number;
} & GridProps;

export function DrawerSummaryNotification({ idNotification }: SummaryProps) {
    const {
        theme: themeContext,
        isSidebarOpen,
        colorBoxShadowSystem,
        colorBorderSystem,
        colorBackgroundSystem,
        getInfoError,
    } = useGlobal();

    const { notificationContent } = useNotification();

    const isThemeLight = themeContext === "light";

    return (
        <Box mt={4} margin={2} flexDirection='column' gap={1}>
            <Grid
                item
                xs={12}
                p={3}
                mt={2}
                sx={{
                    borderRadius: "16px",
                    border: `1px solid ${colorBorderSystem}`,
                    background: colorBackgroundSystem,
                    boxShadow: colorBoxShadowSystem,
                }}>
                <Typography variant='h5' fontWeight='bold' gutterBottom>
                    Sumário
                </Typography>

                <Box sx={{ mt: 1.5 }}>
                    <Typography variant='subtitle2' color='text.secondary'>
                        Status
                    </Typography>
                    <Typography variant='body1' mb={1}>
                        <Box display='inline-flex' alignItems='center' gap={0.5}>
                            {true ? (
                                <>
                                    <TaskAltOutlinedIcon
                                        sx={{ fontSize: 18, color: isThemeLight ? "#1ab96a" : "#66E4A6" }}
                                    />
                                    Pronto para enviar
                                </>
                            ) : (
                                <>
                                    <DoNotDisturbOffOutlinedIcon
                                        sx={{ fontSize: 18, color: isThemeLight ? "#e00e0e" : "#FB8382" }}
                                    />
                                    Não preparado
                                </>
                            )}
                        </Box>
                    </Typography>

                    <Divider />

                    <Typography variant='subtitle2' color='text.secondary' mt={1.5}>
                        Anexos
                    </Typography>
                    <Typography variant='body1' mb={1}>
                        <Box display='inline-flex' alignItems='center' gap={0.5}>
                            <AttachFileOutlinedIcon
                                color={
                                    notificationContent?.notification_attachment &&
                                    notificationContent.notification_attachment.length > 0
                                        ? "inherit"
                                        : "disabled"
                                }
                                sx={{ fontSize: 18 }}
                            />
                            {notificationContent?.notification_attachment &&
                            notificationContent.notification_attachment.length > 0 ? (
                                <Typography>
                                    {`${
                                        notificationContent.notification_attachment.length === 1
                                            ? `1 anexo carregado`
                                            : `${notificationContent.notification_attachment.length} anexos carregados`
                                    }`}
                                </Typography>
                            ) : (
                                <Typography color='text.secondary'>Nenhum anexo adicionado</Typography>
                            )}
                        </Box>
                    </Typography>

                    <Divider />

                    <Typography variant='subtitle2' color='text.secondary' mt={1.5}>
                        Prioridade
                    </Typography>
                    <Typography variant='body1' mb={1}>
                        <Box display='inline-flex' alignItems='center' gap={0.5}>
                            {notificationContent?.priority_level.includes("Alta") ? (
                                <>
                                    <NewReleasesOutlinedIcon
                                        sx={{ fontSize: 18, color: isThemeLight ? "#e00e0e" : "#FB8382" }}
                                    />
                                    Alta
                                </>
                            ) : notificationContent?.priority_level.includes("Média") ? (
                                <>
                                    <NotificationImportantOutlinedIcon
                                        sx={{ fontSize: 18, color: isThemeLight ? "#f5ce33" : "#FDE68C" }}
                                    />
                                    Média
                                </>
                            ) : (
                                <>
                                    <InfoOutlinedIcon
                                        sx={{ fontSize: 18, color: isThemeLight ? "#13B0EF" : "#66ACD6" }}
                                    />
                                    Baixa
                                </>
                            )}
                        </Box>
                    </Typography>

                    <Divider />

                    <Typography variant='subtitle2' color='text.secondary' mt={1.5}>
                        Origem
                    </Typography>
                    <Typography variant='body1' mb={1}>
                        <Box display='inline-flex' alignItems='center' gap={0.5}>
                            <TripOriginOutlinedIcon sx={{ fontSize: 18, color: "disabled" }} />
                            {notificationContent?.source || "Origem não definida"}
                        </Box>
                    </Typography>

                    <Divider />

                    <Typography variant='subtitle2' color='text.secondary' mt={1.5}>
                        Destinatários (173 usuários)
                    </Typography>

                    <Typography variant='body1' mb={1}>
                        <Box display='flex' alignItems='center' gap={0.5} flexWrap='wrap'>
                            <>
                                <GroupsOutlinedIcon color='action' sx={{ fontSize: 18 }} />
                                Todos
                            </>
                            {/* {switchIsAllWatch ? (
                                    <>
                                        <GroupsOutlinedIcon color='action' sx={{ fontSize: 18 }} />
                                        Todos
                                    </>
                                ) : isValidCheckBox ? (
                                    <>
                                        <NoAccountsOutlinedIcon color='error' sx={{ fontSize: 18 }} />
                                        Nenhum destinatário selecionado
                                    </>
                                ) : (
                                    <>
                                        {switchIsAgenciesWatch && (
                                            <>
                                                <ApartmentOutlinedIcon color='action' sx={{ fontSize: 18 }} />
                                                Agências
                                            </>
                                        )}
                                        {switchIsPortfoliosWatch && (
                                            <>
                                                <AccountBalanceWalletOutlinedIcon
                                                    color='action'
                                                    sx={{ fontSize: 18 }}
                                                />
                                                Carteiras
                                            </>
                                        )}
                                        {switchIsSectorsWatch && (
                                            <>
                                                <WorkspacesOutlinedIcon color='action' sx={{ fontSize: 18 }} />
                                                Setores
                                            </>
                                        )}
                                        {switchIsUsersWatch && (
                                            <>
                                                <GroupOutlinedIcon color='action' sx={{ fontSize: 18 }} />
                                                Usuários
                                            </>
                                        )}
                                    </>
                                )} */}
                        </Box>
                    </Typography>

                    <Divider />

                    <Typography variant='subtitle2' color='text.secondary' mt={1.5}>
                        Link
                    </Typography>
                    <Typography variant='body1' mb={1}>
                        <Box display='inline-flex' alignItems='center' gap={0.5}>
                            {!notificationContent?.link_url ? (
                                <>
                                    <LinkOffIcon color='action' sx={{ fontSize: 18 }} />
                                    Sem link/redirecionamento configurado
                                </>
                            ) : !notificationContent?.is_external_link ? (
                                <>
                                    <ErrorOutlineOutlinedIcon color='error' sx={{ fontSize: 18 }} />
                                    Link inválido ou mal formatado
                                </>
                            ) : notificationContent?.is_external_link ? (
                                <>
                                    <OpenInNewOutlinedIcon color='success' sx={{ fontSize: 18 }} />
                                    Link externo válido e ativo
                                </>
                            ) : (
                                <>
                                    <OpenInBrowserOutlinedIcon color='success' sx={{ fontSize: 18 }} />
                                    Link interno válido e ativo
                                </>
                            )}
                        </Box>
                    </Typography>

                    <Divider />

                    <Typography variant='subtitle2' color='text.secondary' mt={1.5}>
                        Agendamento
                    </Typography>
                    <Typography variant='body1' mb={1}>
                        <Box display='inline-flex' alignItems='center' gap={0.5}>
                            <>
                                <SendOutlinedIcon sx={{ fontSize: 18, color: "#13B0EF" }} />
                                Envio Imediato
                            </>
                            {/* {isScheduledWatch ? (
                                    <>
                                        <CalendarMonthOutlinedIcon color='info' sx={{ fontSize: 18 }} />
                                        {`Agendado para ${formatDate(dateScheduledAtWatch || "", "DD/MM/YYYY HH:mm:ss") || "--/--/---- --:--:--"} ${dateExpiresAtWatch ? formatDate(dateExpiresAtWatch || "", "[às] DD/MM/YYYY HH:mm:ss") : ""}  `}
                                    </>
                                ) : (
                                    <>
                                        <SendOutlinedIcon sx={{ fontSize: 18, color: "#13B0EF" }} />
                                        Envio Imediato
                                    </>
                                )} */}
                        </Box>
                    </Typography>

                    <Divider />

                    <Typography variant='subtitle2' color='text.secondary' mt={1.5}>
                        Situação
                    </Typography>

                    <Typography variant='body1'>
                        <Box display='inline-flex' alignItems='center' gap={0.5}>
                            {notificationContent?.is_active ? (
                                <>
                                    <CheckCircleIcon color='success' sx={{ fontSize: 18 }} />
                                    Ativo
                                </>
                            ) : (
                                <>
                                    <CancelIcon color='error' sx={{ fontSize: 18 }} />
                                    Inativo
                                </>
                            )}
                        </Box>
                    </Typography>
                </Box>
            </Grid>
        </Box>
    );
}
