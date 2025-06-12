import { NotificationContextProvider, useNotification } from "@/contexts/NotificationContext";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { DataGrid, GridColDef, GridToolbar, GridToolbarQuickFilter } from "@mui/x-data-grid";
import {
    Avatar,
    Badge,
    Box,
    Breadcrumbs,
    Chip,
    Grid,
    Icon,
    IconButton,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { LoadingButton } from "@mui/lab";
import { useConfirm } from "material-ui-confirm";
import { BoxMain } from "@/components/Box/BoxMain";
import { formatDate } from "@/functions/date";
import { useGlobal } from "@/contexts/GlobalContext";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import {
    findAllAdminNotifications,
    INotificationAsideProps,
    updateNotificationStatusById,
} from "@/services/notifications";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { OpenNotification } from "@/components/Nav/NotificationDrawer/OpenNotification";
import { getBaseURL } from "@/functions/getBaseURL";
import BadgeAvatars from "@/components/AvatarWithBadge/AvatarWithBadge";
import SearchIcon from "@mui/icons-material/Search";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import PreviewOutlinedIcon from "@mui/icons-material/PreviewOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";
import NotificationImportantOutlinedIcon from "@mui/icons-material/NotificationImportantOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import favIconSingColor from "@/assets/images/sing-icone-colorido.ico";
import favIconSingWhite from "@/assets/images/sing-icone-branco.ico";
import { DrawerSummaryNotification } from "./drawer/DrawerSummaryNotification";

export function ListRecordsNotifications() {
    return (
        <NotificationContextProvider>
            <ListRecordsNotificationsInner />
        </NotificationContextProvider>
    );
}

export function ListRecordsNotificationsInner() {
    const [listNotification, setListNotification] = useState<INotificationAsideProps[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);
    const [isDrawerSummaryOpen, setIsDrawerSummaryOpen] = useState<boolean>(false);
    const [idNotification, setIdNotification] = useState<number>();

    const {
        getInfoError,
        toggleStatusBackdrop,
        theme,
        colorBorderSystem,
        colorScrollSystem,
        colorBackgroundSystem,
        cyanBlur,
        redBlur,
    } = useGlobal();

    const { selectNotificationContent, toggleDrawer, isDrawerOpen, clearContent } = useNotification();

    const themeUI = useTheme();
    const smDown = useMediaQuery(themeUI.breakpoints.down("sm"));

    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();

    const confirm = useConfirm();

    const isThemeLight = theme === "light";

    const handleNewRegister = () => {
        navigate("/funcoes-administrativas/notificacoes/cadastrar");
    };

    const handleDrawerSummary = () => {
        setIsDrawerSummaryOpen((prev) => !prev);
    };

    const closeContent = () => {
        toggleDrawer();
        clearContent();
    };

    const QuickSearchToolbar = () => {
        return (
            <Grid sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
                <GridToolbar />
                <GridToolbarQuickFilter placeholder='Digite para pesquisar' />
            </Grid>
        );
    };

    const handleChangeStatus = async (id: number, status: boolean) => {
        confirm({
            title: `Deseja realmente alterar a situação desta Notificação?`,
            description: `A situação da notificação será alterado para (${!status ? "🟢 Ativo" : "🔴 Inativo"})`,
        })
            .then(async () => {
                try {
                    setLoading((prev) => !prev);

                    await updateNotificationStatusById(id, !status);

                    setListNotification((prev) => {
                        return prev.map((value) => {
                            if (value.id === id) {
                                value.is_active = !status;
                            }
                            return value;
                        });
                    });

                    toast.success("Situação da Notificação alterada com sucesso!");
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                } finally {
                    setLoading(false);
                }
            })
            .catch(() => {});
    };

    const onSubmit = async (params: any) => {
        try {
            toggleStatusBackdrop();

            const data = await findAllAdminNotifications(params);

            setListNotification(data);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    const searchNotifications = async () => {
        try {
            setLoading((prev) => !prev);

            const data = await findAllAdminNotifications({});

            setListNotification(data);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading((prev) => !prev);
        }
    };

    const openContentNotification = (id: number) => {
        selectNotificationContent(id);

        setTimeout(() => {
            toggleDrawer();
        }, 150);
    };

    useEffect(() => {
        async function execute() {
            searchNotifications();
        }
        execute();
    }, []);

    const columns: GridColDef[] = [
        {
            field: "Opções",
            width: 125,
            align: "center",
            headerAlign: "center",
            renderCell: (cellValues) => {
                return (
                    <Stack direction='row' spacing={0.25}>
                        <IconButton
                            color='success'
                            title='Visualizar'
                            aria-label='Visualizar notificação'
                            onClick={() => {
                                openContentNotification(cellValues.row.id);
                            }}>
                            <PreviewOutlinedIcon />
                        </IconButton>
                        <IconButton
                            color='primary'
                            title='Sumário'
                            arial-label='Sumário da notificação'
                            onClick={() => {
                                setIdNotification(cellValues.row.id);
                                handleDrawerSummary();
                            }}>
                            <SummarizeOutlinedIcon />
                        </IconButton>
                        <IconButton
                            color='info'
                            title='Alterar Situação'
                            aria-label='Alterar situação da notificação'
                            onClick={() => handleChangeStatus(cellValues.row.id, cellValues.row.is_active)}>
                            <AutorenewOutlinedIcon />
                        </IconButton>
                    </Stack>
                );
            },
        },
        {
            field: "source",
            headerName: "Origem",
            width: 70,
            align: "center",
            headerAlign: "center",
            disableExport: true,
            renderCell: ({ value, row }) => {
                return (
                    <Grid container justifyContent={"center"}>
                        <Box mt={1} mb={1}>
                            {row.source === "usuario" ? (
                                <BadgeAvatars
                                    type='default'
                                    user={{
                                        name: row.people_name || "",
                                        url_image_profile: getBaseURL() + row.url_image_profile,
                                    }}
                                    badgeContent={
                                        row.priority_level === "Alta" ? (
                                            <NewReleasesOutlinedIcon
                                                sx={{
                                                    fontSize: 18,
                                                    color: isThemeLight ? "#e00e0e" : "#FB8382",
                                                    borderRadius: 50,
                                                    background: isThemeLight ? "#f4f6f8" : "#00232B",
                                                    boxShadow: "0px 2px 4px 0px rgba(125, 132, 139, 0.16)",
                                                }}
                                            />
                                        ) : row.priority_level === "Média" ? (
                                            <NotificationImportantOutlinedIcon
                                                sx={{
                                                    fontSize: 18,
                                                    borderRadius: 50,
                                                    color: isThemeLight ? "#f5ce33" : "#FDE68C",
                                                    background: isThemeLight ? "#f4f6f8" : "#00232B",
                                                    boxShadow: "0px 2px 4px 0px rgba(125, 132, 139, 0.16)",
                                                }}
                                            />
                                        ) : (
                                            <InfoOutlinedIcon
                                                sx={{
                                                    fontSize: 18,
                                                    borderRadius: 50,
                                                    color: isThemeLight ? "#13B0EF" : "#66ACD6",
                                                    background: isThemeLight ? "#f4f6f8" : "#00232B",
                                                    boxShadow: "0px 2px 4px 0px rgba(125, 132, 139, 0.16)",
                                                }}
                                            />
                                        )
                                    }>
                                    <Typography fontSize={"1.5rem"}>
                                        {row?.people_name ? row.people_name.charAt(0) : ""}
                                    </Typography>
                                </BadgeAvatars>
                            ) : (
                                <Badge
                                    overlap='circular'
                                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                    badgeContent={
                                        row.priority_level === "Alta" ? (
                                            <NewReleasesOutlinedIcon
                                                sx={{
                                                    fontSize: 18,
                                                    color: isThemeLight ? "#e00e0e" : "#FB8382",
                                                    borderRadius: 50,
                                                    background: isThemeLight ? "#f4f6f8" : "#00232B",
                                                    boxShadow: "0px 2px 4px 0px rgba(125, 132, 139, 0.16)",
                                                }}
                                            />
                                        ) : row.priority_level === "Média" ? (
                                            <NotificationImportantOutlinedIcon
                                                sx={{
                                                    fontSize: 18,
                                                    borderRadius: 50,
                                                    color: isThemeLight ? "#f5ce33" : "#FDE68C",
                                                    background: isThemeLight ? "#f4f6f8" : "#00232B",
                                                    boxShadow: "0px 2px 4px 0px rgba(125, 132, 139, 0.16)",
                                                }}
                                            />
                                        ) : (
                                            <InfoOutlinedIcon
                                                sx={{
                                                    fontSize: 18,
                                                    borderRadius: 50,
                                                    color: isThemeLight ? "#13B0EF" : "#66ACD6",
                                                    background: isThemeLight ? "#f4f6f8" : "#00232B",
                                                    boxShadow: "0px 2px 4px 0px rgba(125, 132, 139, 0.16)",
                                                }}
                                            />
                                        )
                                    }>
                                    <Avatar
                                        sx={{
                                            textTransform: "uppercase",
                                            backgroundColor: row.moduleIcon
                                                ? row.priority_level === "Alta"
                                                    ? isThemeLight
                                                        ? "#e00e0e2f"
                                                        : "#FB83822f"
                                                    : row.priority_level === "Média"
                                                      ? isThemeLight
                                                          ? "#f5ce332f"
                                                          : "#FDE68C2f"
                                                      : isThemeLight
                                                        ? "#13B0EF2f"
                                                        : "#66abd62f"
                                                : isThemeLight
                                                  ? "#00364122"
                                                  : "#00AF9E22",
                                            color: "#ffffff",
                                            border: "1px solid",
                                            borderColor: row.moduleIcon
                                                ? row.priority_level === "Alta"
                                                    ? isThemeLight
                                                        ? "#b40808"
                                                        : "#FB8382"
                                                    : row.priority_level === "Média"
                                                      ? isThemeLight
                                                          ? "#cea609"
                                                          : "#FDE68C"
                                                      : isThemeLight
                                                        ? "#0788bb"
                                                        : "#66ACD6"
                                                : isThemeLight
                                                  ? "#025e7094"
                                                  : "#07d3be5a",
                                        }}>
                                        <Icon
                                            className='material-icons-outlined'
                                            sx={{
                                                color:
                                                    row.priority_level === "Alta"
                                                        ? isThemeLight
                                                            ? "#b40808"
                                                            : "#FB8382"
                                                        : row.priority_level === "Média"
                                                          ? isThemeLight
                                                              ? "#cea609"
                                                              : "#FDE68C"
                                                          : isThemeLight
                                                            ? "#0788bb"
                                                            : "#66ACD6",
                                            }}>
                                            {row.moduleIcon ? (
                                                row.moduleIcon
                                            ) : (
                                                <img
                                                    style={{ width: "93%" }}
                                                    src={isThemeLight ? favIconSingColor : favIconSingWhite}
                                                    alt='favIcon SING'
                                                />
                                            )}
                                        </Icon>
                                    </Avatar>
                                </Badge>
                            )}
                        </Box>
                    </Grid>
                );
            },
        },
        {
            field: "title",
            headerName: "Título",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "subtitle",
            headerName: "Subtítulo",
            minWidth: 200,
        },
        {
            field: "module",
            headerName: "Módulo",
            minWidth: 180,
        },
        {
            field: "priority_level",
            headerName: "Prioridade",
            align: "center",
            headerAlign: "center",
            width: 85,
            renderCell: ({ value, row }) => {
                return (
                    <Grid container justifyContent={"center"}>
                        <Chip
                            label={
                                <Typography
                                    color={
                                        row.priority_level
                                            ? row.priority_level === "Alta"
                                                ? isThemeLight
                                                    ? "#b40808"
                                                    : "#FB8382"
                                                : row.priority_level === "Média"
                                                  ? isThemeLight
                                                      ? "#cea609"
                                                      : "#FDE68C"
                                                  : isThemeLight
                                                    ? "#0788bb"
                                                    : "#66ACD6"
                                            : isThemeLight
                                              ? "#025e7094"
                                              : "#07d3be5a"
                                    }
                                    fontSize={12}>
                                    {row.priority_level === "Alta"
                                        ? "Alta"
                                        : row.priority_level === "Média"
                                          ? "Média"
                                          : "Baixa"}
                                </Typography>
                            }
                            variant='outlined'
                            component={"span"}
                            size='medium'
                            sx={{
                                cursor: "default",
                                mr: 0.5,
                                height: "22px",
                                borderColor: row.priority_level
                                    ? row.priority_level === "Alta"
                                        ? isThemeLight
                                            ? "#b40808"
                                            : "#FB8382"
                                        : row.priority_level === "Média"
                                          ? isThemeLight
                                              ? "#cea609"
                                              : "#FDE68C"
                                          : isThemeLight
                                            ? "#0788bb"
                                            : "#66ACD6"
                                    : isThemeLight
                                      ? "#025e7094"
                                      : "#07d3be5a",
                                backgroundColor: row.priority_level
                                    ? row.priority_level === "Alta"
                                        ? isThemeLight
                                            ? "#e00e0e1c"
                                            : "#FB83822f"
                                        : row.priority_level === "Média"
                                          ? isThemeLight
                                              ? "#f5ce331c"
                                              : "#FDE68C2f"
                                          : isThemeLight
                                            ? "#13B0EF1c"
                                            : "#66abd62f"
                                    : isThemeLight
                                      ? "#00364122"
                                      : "#00AF9E22",
                                "& .MuiChip-label": {
                                    fontWeight: "bold",
                                },
                            }}
                        />
                    </Grid>
                );
            },
        },
        {
            field: "type",
            headerName: "Tipo",
            minWidth: 95,
            align: "center",
            headerAlign: "center",
        },
        {
            field: "is_active",
            headerName: "Situação",
            minWidth: 90,
            align: "center",
            headerAlign: "center",
            renderCell: ({ value }) => {
                return <Typography>{value ? "🟢 Ativo" : "🔴 Inativo"}</Typography>;
            },
        },
        {
            field: "created_at",
            headerName: "Data da notificação",
            minWidth: 180,
            align: "center",
            headerAlign: "center",
            renderCell: ({ value }) => {
                return <Typography>{formatDate(value, "DD/MM/YYYY HH:mm:ss")}</Typography>;
            },
        },
    ];

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
                            <Typography color='text.secondary'>Notificações</Typography>
                        </Breadcrumbs>
                    </Box>
                </Grid>
            </Grid>
            <BoxMain isDivider={false} mt={0}>
                <Grid
                    container
                    component={"form"}
                    direction='row'
                    spacing={2}
                    sx={{ paddingBottom: 2 }}
                    mb={1}
                    onSubmit={handleSubmit(onSubmit)}>
                    <Grid item xs={12} md={2.5}>
                        <FormAutocomplete
                            fullWidth
                            name='filter_type'
                            label='Tipo'
                            variant='outlined'
                            size='medium'
                            control={control}
                            errors={errors}
                            options={[
                                { id: "automático", label: "Automático" },
                                { id: "manual", label: "Manual" },
                            ]}
                        />
                    </Grid>

                    <Grid item xs={12} md={2.5}>
                        <FormAutocomplete
                            fullWidth
                            name='filter_origin'
                            label='Origem'
                            variant='outlined'
                            size='medium'
                            control={control}
                            errors={errors}
                            options={[
                                { id: "sistema", label: "Sistema" },
                                { id: "usuario", label: "Usuário" },
                            ]}
                        />
                    </Grid>

                    <Grid item xs={12} md={2.5}>
                        <FormAutocomplete
                            fullWidth
                            name='filter_priority_level'
                            label='Prioridade'
                            variant='outlined'
                            size='medium'
                            control={control}
                            errors={errors}
                            options={[
                                { id: "Alta", label: "🔴 Alta" },
                                { id: "Média", label: "🟡 Média" },
                                { id: "Baixa", label: "🔵 Baixa" },
                            ]}
                        />
                    </Grid>

                    <Grid item xs={6} md={2.5}>
                        <FormAutocomplete
                            fullWidth
                            name='filter_is_active'
                            label='Situação'
                            variant='outlined'
                            size='medium'
                            control={control}
                            errors={errors}
                            options={[
                                { id: true, label: "🟢 Ativo" },
                                { id: false, label: "🔴 Inativo" },
                            ]}
                        />
                    </Grid>

                    <Grid item xs={6} md={2}>
                        <LoadingButton
                            fullWidth
                            type='submit'
                            color='success'
                            loadingPosition='start'
                            size='large'
                            variant='contained'
                            startIcon={<SearchIcon />}
                            loading={loading}
                            sx={{ height: 55, boxShadow: "none" }}>
                            Pesquisar
                        </LoadingButton>
                    </Grid>
                </Grid>

                <Box sx={{ position: "relative" }}>
                    <DataGrid
                        disableRowSelectionOnClick
                        disableColumnMenu
                        autoHeight
                        rows={listNotification}
                        columns={columns}
                        localeText={dataGridLocaleTextTranslateFull}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 10,
                                },
                            },
                        }}
                        slots={{
                            toolbar: QuickSearchToolbar,
                        }}
                        slotProps={{
                            toolbar: {
                                quickFilterProps: { debounceMs: 300 },
                            },
                            columnMenu: {
                                style: {
                                    maxHeight: "300px",
                                    overflowY: "auto",
                                },
                            },
                            columnsPanel: {
                                style: {
                                    maxHeight: "360px",
                                    position: "absolute",
                                    top: "auto",
                                    bottom: 0,
                                    transform: "translate(48%, 35%)",
                                    zIndex: 1300,
                                    borderRadius: "8px",
                                    boxShadow:
                                        "0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)",
                                    backgroundColor: theme === "light" ? "#ffffff" : "#1F3D44",
                                },
                            },
                        }}
                        pageSizeOptions={[10, 20, 30, 50, 100]}
                        sx={getDataGridStyles(colorBorderSystem, colorScrollSystem)}
                    />
                </Box>
            </BoxMain>

            <TemporaryDrawer
                sx={{
                    width: "100%",
                    "& .MuiDrawer-paperAnchorRight": {
                        maxWidth: smDown ? "94%" : "60%",
                        minWidth: smDown ? "94%" : 500,
                        justifyContent: "center",
                        marginRight: "1rem",
                    },
                    "& .MuiModal-backdrop": {
                        backgroundColor: "rgb(0 0 0 / 0%)",
                    },
                    "& .MuiDrawer-paper": {
                        background: "#1b1b1b00",
                        boxShadow: "none",
                        overflow: "hidden",
                    },
                }}
                open={isDrawerOpen}
                disableEscapeKeyDown={true}
                onClose={closeContent}>
                <OpenNotification />
            </TemporaryDrawer>

            <TemporaryDrawer
                sx={{
                    "& .MuiDrawer-paperAnchorRight": {
                        width: smDown ? "100%" : 500,
                    },
                    "& .MuiModal-backdrop": {
                        backgroundColor: "rgb(0 0 0 / 0%)",
                    },
                    "& .MuiDrawer-paper": {
                        background: colorBackgroundSystem,
                        borderLeft: `1px solid ${colorBorderSystem}`,
                        backdropFilter: "blur(30px)",
                        backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                        backgroundRepeat: "no-repeat, no-repeat",
                        backgroundSize: "50%, 50%",
                        backgroundPosition: "right top, left bottom",
                    },
                }}
                open={isDrawerSummaryOpen}
                disableEscapeKeyDown={false}
                onClose={handleDrawerSummary}>
                <DrawerSummaryNotification idNotification={idNotification} />
            </TemporaryDrawer>

            <BasicSpeedDial
                ariaLabel='Opções'
                title='Opções'
                open={speedDialOpen}
                onClick={() => setSpeedDialOpen((oldValue) => !oldValue)}
                actions={[
                    {
                        icon: <AddCircleOutlineOutlinedIcon color='action' />,
                        name: "Nova Notificação",
                        click_event: () => {
                            handleNewRegister();
                        },
                    },
                ]}
                sx={{
                    position: "absolute",
                    bottom: 14,
                    right: 5,
                    "& .MuiSpeedDial-fab": {
                        width: "40px",
                        height: "40px",
                        boxShadow: "0 0 12px 1px #0096876f",
                    },
                }}
            />
        </>
    );
}
