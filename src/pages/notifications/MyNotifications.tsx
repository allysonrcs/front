import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    DataGrid,
    GridColDef,
    GridToolbarColumnsButton,
    GridToolbarDensitySelector,
    GridToolbarFilterButton,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
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
import { LoadingButton } from "@mui/lab";
import { useConfirm } from "material-ui-confirm";
import { BoxMain } from "../../components/Box/BoxMain";
import { formatDate } from "../../functions/date";
import { useGlobal } from "../../contexts/GlobalContext";
import { getBaseURL } from "@/functions/getBaseURL";
import FormAutocomplete from "../../components/FormComponents/FormAutocomplete";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import BadgeAvatars from "@/components/AvatarWithBadge/AvatarWithBadge";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";
import NotificationImportantOutlinedIcon from "@mui/icons-material/NotificationImportantOutlined";
import PreviewOutlinedIcon from "@mui/icons-material/PreviewOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import favIconSingColor from "@/assets/images/sing-icone-colorido.ico";
import favIconSingWhite from "@/assets/images/sing-icone-branco.ico";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { CSATAverageRating } from "@/components/CSATAssessments/CSATAverageRating";
import { NotificationContextProvider, useNotification } from "@/contexts/NotificationContext";
import { INotificationAsideProps, INotificationContent, listUserNotifications } from "@/services/notifications";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { OpenNotification } from "@/components/Nav/NotificationDrawer/OpenNotification";

export function MyNotifications() {
    return (
        <NotificationContextProvider>
            <MyNotificationsInner />
        </NotificationContextProvider>
    );
}

export function MyNotificationsInner() {
    const [listNotification, setListNotification] = useState<INotificationAsideProps[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();
    const { getInfoError, toggleStatusBackdrop, theme, colorBorderSystem, colorScrollSystem } = useGlobal();
    const { selectNotificationContent, toggleDrawer, isDrawerOpen, clearContent } = useNotification();

    const confirm = useConfirm();

    const isThemeLight = theme === "light";

    const themeUI = useTheme();
    const smDown = useMediaQuery(themeUI.breakpoints.down("sm"));

    const onSubmit = async (params: any) => {
        try {
            toggleStatusBackdrop();
            const listMyNotifications = await listUserNotifications({});

            setListNotification(listMyNotifications);
            toast.success("Lista atualizada com sucesso!");
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    const handleRemove = async (id: number) => {
        confirm({
            title: `Deseja realmente remover a Notificação?`,
            description: "O registro de notificação será removida.",
        })
            .then(async () => {
                try {
                    setLoading((prev) => !prev);

                    // await removeNotification(id);

                    let newList = listNotification.filter((value) => value.id !== id);
                    setListNotification(newList);

                    toast.success("Notificação removida com sucesso!");
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                } finally {
                    setLoading(false);
                }
            })
            .catch(() => {});
    };

    const searchNotifications = async () => {
        try {
            setLoading((prev) => !prev);

            const data = await listUserNotifications({});

            setListNotification(data);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading((prev) => !prev);
        }
    };

    const closeContent = () => {
        toggleDrawer();
        clearContent();
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

    const QuickSearchToolbar = () => {
        return (
            <Grid sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
                <Grid
                    item
                    sx={{
                        display: smDown ? "none" : "flex",
                        justifyContent: "start",
                        alignItems: "center",
                    }}>
                    <GridToolbarColumnsButton />
                    <GridToolbarFilterButton />
                    <GridToolbarDensitySelector />
                </Grid>
                <GridToolbarQuickFilter placeholder='Digite para pesquisar' />
            </Grid>
        );
    };

    const columns: GridColDef[] = [
        {
            field: "Opções",
            width: 95,
            align: "center",
            headerAlign: "center",
            renderCell: (cellValues) => {
                return (
                    <Stack direction='row' spacing={0.25}>
                        <IconButton
                            color='success'
                            title='Visualizar'
                            aria-label='Visualizar registro'
                            onClick={() => {
                                openContentNotification(cellValues.row.id);
                            }}>
                            <PreviewOutlinedIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => handleRemove(cellValues.row.id)}
                            color='error'
                            title='Excluir'
                            aria-label='Excluir registro'>
                            <DeleteIcon />
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
                                        url_image_profile: row.url_image_profile,
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
                                <NotificationsNoneOutlinedIcon
                                    sx={{ color: theme === "light" ? "#5e5e5e" : "#FFFFFF", mr: 0.5 }}
                                />
                                Notificações
                            </Typography>
                            <Typography color='text.secondary'>Minhas Notificações</Typography>
                        </Breadcrumbs>

                        <CSATAverageRating
                            module={"Produtividade Diária"}
                            routePath={"/notificacoes"}
                            isClickable
                            formProps={{
                                module: "Notificações",
                                routePath: "/notificacoes",
                            }}
                        />
                    </Box>
                </Grid>
            </Grid>

            <Box
                sx={{
                    marginInline: {
                        xs: "0.5rem",
                        sm: "1.5rem",
                        md: "3rem",
                        lg: "8rem",
                        xl: "10rem",
                    },
                }}>
                <BoxMain isDivider={false} mt={0}>
                    <Grid
                        container
                        component={"form"}
                        direction='row'
                        spacing={2}
                        sx={{ paddingBottom: 2 }}
                        mb={1}
                        onSubmit={handleSubmit(onSubmit)}>
                        <Grid item xs={12} md={4}>
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

                        <Grid item xs={12} md={3}>
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

                        <Grid item xs={12} md={3}>
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
            </Box>
        </>
    );
}
