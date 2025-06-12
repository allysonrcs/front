import {
    Avatar,
    Badge,
    Box,
    Button,
    Grid,
    Icon,
    IconButton,
    InputBase,
    Menu,
    Paper,
    Stack,
    SxProps,
    Typography,
    useTheme,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";
import { VariableSizeList, ListChildComponentProps } from "react-window";
import { useNotification } from "@/contexts/NotificationContext";
import { INotificationAsideProps } from "@/services/notifications";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import { getBaseURL } from "@/functions/getBaseURL";
import { useNavigate } from "react-router-dom";
import { formatTimeAgo } from "@/functions/date";
import { ThereIsImage } from "./ThereIsImage";
import AutoSizer from "react-virtualized-auto-sizer";
import FormDateTimePicker from "../../FormComponents/FormDateTimePicker";
import moment from "moment";
import BadgeAvatars from "@/components/AvatarWithBadge/AvatarWithBadge";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";
import NotificationImportantOutlinedIcon from "@mui/icons-material/NotificationImportantOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import favIconSingColor from "@/assets/images/sing-icone-colorido.ico";
import favIconSingWhite from "@/assets/images/sing-icone-branco.ico";

interface OnSubmitFilter {
    date_start: string | Date | null;
    date_end: string | Date | null;
}

export function AsideNotification() {
    const [search, setSearch] = useState<string>("");
    const [searchDate, setSearchDate] = useState<OnSubmitFilter>();
    const [openEl, setOpenEl] = useState<null | HTMLElement>(null);

    const {
        filterMode,
        notificationList,
        setFilterMode,
        selectNotificationContent,
        refreshListAsideNotifications,
        toggleDrawer,
        closeDrawer,
    } = useNotification();

    const {
        getInfoError,
        toggleStatusBackdrop,
        theme: themeContext,
        cyanBlur,
        redBlur,
        colorBackgroundSystem,
    } = useGlobal();
    const theme = useTheme();
    const navigate = useNavigate();

    const isThemeLight = themeContext === "light";

    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<OnSubmitFilter>({
        defaultValues: {
            date_start: moment().subtract(1, "months").format("YYYY-MM-DD"),
            date_end: moment().format("YYYY-MM-DD 23:59"),
        },
    });

    const sxSearchSectionProps: SxProps = {
        padding: "0.45rem 0.45rem",
        display: "flex",
        borderRadius: 1.5,
        bgcolor: isThemeLight ? "transparent" : "background.default",
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                toggleDrawer();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    function RenderList(props: ListChildComponentProps) {
        const { index, style } = props;
        const {
            id,
            title,
            subtitle,
            content,
            priority_level,
            source,
            people_name,
            url_image_profile,
            moduleIcon,
            is_read,
            created_at,
        } = props.data[index];

        const openContent = (id: number) => {
            toggleDrawer?.();

            setTimeout(() => {
                selectNotificationContent(id);
                toggleDrawer?.();
            }, 200);
        };

        const handleClick = async () => {
            try {
                toggleStatusBackdrop();

                openContent(id);
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                toggleStatusBackdrop();
            }
        };

        return (
            <Paper
                variant='outlined'
                style={style}
                onClick={handleClick}
                sx={{
                    bgcolor: isThemeLight
                        ? is_read
                            ? "transparent"
                            : "background.default"
                        : is_read
                          ? "transparent"
                          : "background.paper",
                    borderBlock: "none",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    borderRadius: 0,
                    overflow: "hidden",
                    "&:first-of-type": {
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        borderTop: `1px solid ${theme.palette.divider}`,
                    },
                    "&:last-of-type": {
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        borderBottomLeftRadius: 8,
                        borderBottomRightRadius: 8,
                    },
                    "&:hover": {
                        backgroundColor: isThemeLight ? "#00af9d14" : "action.hover",
                        cursor: "pointer",
                    },
                }}>
                <Box sx={{ padding: 2 }}>
                    <Stack direction='row' spacing={1.5} alignItems='center'>
                        <Box display='flex' alignItems='center' minWidth={43} height={50}>
                            {source === "usuario" ? (
                                <BadgeAvatars
                                    type='default'
                                    user={{ name: people_name, url_image_profile: getBaseURL() + url_image_profile }}
                                    badgeContent={
                                        priority_level === "Alta" ? (
                                            <NewReleasesOutlinedIcon
                                                sx={{
                                                    fontSize: 18,
                                                    color: isThemeLight ? "#e00e0e" : "#FB8382",
                                                    borderRadius: 50,
                                                    background: isThemeLight ? "#f4f6f8" : "#00232B",
                                                    boxShadow: "0px 2px 4px 0px rgba(125, 132, 139, 0.16)",
                                                }}
                                            />
                                        ) : priority_level === "Média" ? (
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
                                    <Typography fontSize={"1.5rem"}>{people_name.charAt(0)}</Typography>
                                </BadgeAvatars>
                            ) : (
                                <Badge
                                    overlap='circular'
                                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                    badgeContent={
                                        priority_level === "Alta" ? (
                                            <NewReleasesOutlinedIcon
                                                sx={{
                                                    fontSize: 18,
                                                    color: isThemeLight ? "#e00e0e" : "#FB8382",
                                                    borderRadius: 50,
                                                    background: isThemeLight ? "#f4f6f8" : "#00232B",
                                                    boxShadow: "0px 2px 4px 0px rgba(125, 132, 139, 0.16)",
                                                }}
                                            />
                                        ) : priority_level === "Média" ? (
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
                                            backgroundColor: moduleIcon
                                                ? priority_level === "Alta"
                                                    ? isThemeLight
                                                        ? "#e00e0e2f"
                                                        : "#FB83822f"
                                                    : priority_level === "Média"
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
                                            borderColor: moduleIcon
                                                ? priority_level === "Alta"
                                                    ? isThemeLight
                                                        ? "#b40808"
                                                        : "#FB8382"
                                                    : priority_level === "Média"
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
                                                    priority_level === "Alta"
                                                        ? isThemeLight
                                                            ? "#b40808"
                                                            : "#FB8382"
                                                        : priority_level === "Média"
                                                          ? isThemeLight
                                                              ? "#cea609"
                                                              : "#FDE68C"
                                                          : isThemeLight
                                                            ? "#0788bb"
                                                            : "#66ACD6",
                                            }}>
                                            {moduleIcon ? (
                                                moduleIcon
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

                        <Box flexGrow={1} minWidth={0}>
                            <Typography
                                fontWeight='bold'
                                fontSize={14}
                                color={is_read ? "text.secondary" : "text.primary"}
                                noWrap
                                overflow='hidden'
                                textOverflow='ellipsis'
                                whiteSpace='nowrap'>
                                {title || "Título da notificação..."}
                            </Typography>
                            {subtitle ? (
                                <Typography
                                    variant='body2'
                                    color={
                                        priority_level === "Alta"
                                            ? isThemeLight
                                                ? "#e00e0e"
                                                : "#FB8382"
                                            : priority_level === "Média"
                                              ? isThemeLight
                                                  ? "#cea609"
                                                  : "#FDE68C"
                                              : isThemeLight
                                                ? "#13B0EF"
                                                : "#66ACD6"
                                    }
                                    fontSize='0.67rem'
                                    lineHeight={1.2}
                                    noWrap
                                    overflow='hidden'
                                    textOverflow='ellipsis'
                                    whiteSpace='nowrap'>
                                    {subtitle}
                                </Typography>
                            ) : null}
                            <Typography
                                variant='body2'
                                color='text.secondary'
                                fontSize='0.8rem'
                                noWrap
                                overflow='hidden'
                                textOverflow='ellipsis'
                                whiteSpace='nowrap'>
                                {content}
                            </Typography>
                        </Box>

                        {/* <Box flex={1} display={"flex"} gap={0.75}>
                            <Button
                                variant='contained'
                                color='success'
                                size='small'
                                sx={{
                                    height: 25,
                                    boxShadow: "none",
                                    backgroundColor: "#18da79",
                                    "&:hover": {
                                        backgroundColor: "#08b35d",
                                        boxShadow: "none",
                                    },
                                    fontSize: 12,
                                    fontWeight: "bold",
                                    borderRadius: 1,
                                    textTransform: "inherit",
                                }}>
                                Sim
                            </Button>
                            <Button
                                variant='contained'
                                color='error'
                                size='small'
                                sx={{
                                    height: 25,
                                    boxShadow: "none",
                                    backgroundColor: "#f92f60",
                                    "&:hover": {
                                        backgroundColor: "#d61a49",
                                        boxShadow: "none",
                                    },
                                    fontSize: 12,
                                    fontWeight: "bold",
                                    borderRadius: 1,
                                    textTransform: "inherit",
                                }}>
                                Não
                            </Button>
                        </Box> */}

                        <Box
                            textAlign='right'
                            sx={{
                                minWidth: "auto",
                                flexShrink: 0,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                            }}>
                            <Typography variant='caption' fontSize={12} color='text.secondary'>
                                {formatTimeAgo(created_at)}
                            </Typography>
                            <Box
                                visibility={is_read ? "hidden" : "visible"}
                                width={8}
                                height={8}
                                borderRadius='50%'
                                bgcolor={
                                    priority_level === "Alta"
                                        ? isThemeLight
                                            ? "#e00e0e"
                                            : "#FB8382"
                                        : priority_level === "Média"
                                          ? isThemeLight
                                              ? "#f5ce33"
                                              : "#FDE68C"
                                          : isThemeLight
                                            ? "#13B0EF"
                                            : "#66ACD6"
                                }
                                mt={0.5}
                                ml='auto'
                            />
                        </Box>
                    </Stack>
                </Box>
            </Paper>
        );
    }

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setOpenEl(event.currentTarget);
    };

    const handleCloseFilterMenu = () => setOpenEl(null);

    const onSubmitFilter = async (data: OnSubmitFilter) => {
        const params = {
            date_end: data.date_end ? moment(data.date_end).format("YYYY-MM-DDTHH:mm") : null,
            date_start: data.date_start ? moment(data.date_start).format("YYYY-MM-DDTHH:mm") : null,
        };

        setSearchDate(params);
    };

    const notificationFilter = (str: string, data: INotificationAsideProps[], date?: OnSubmitFilter) => {
        let filtered = data.filter((value) => value.title.toLowerCase().includes(str.toLowerCase()));

        if (date && date.date_end && date.date_start) {
            filtered = filtered.filter((value) => {
                return moment(value.created_at, "YYYY-MM-DD").isBetween(date.date_start, date.date_end);
            });
        }
        return filtered;
    };

    const baseList = notificationList;

    const filteredBySearchAndDate = notificationFilter(search, baseList, searchDate);
    const finalList = filteredBySearchAndDate.filter((item) => {
        if (filterMode === "read") return item.is_read;
        if (filterMode === "unread") return !item.is_read;
        return true;
    });

    const readCount = notificationList.filter((n) => n.is_read).length;
    const unreadCount = notificationList.length - readCount;

    return (
        <Grid container height='100%' p='1rem' gap={1}>
            <Grid item width='100%'>
                <Grid
                    container
                    mt={-1.5}
                    mb={0.5}
                    sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "nowrap",
                    }}>
                    <Typography
                        sx={{
                            fontSize: "18px",
                            fontWeight: "bold",
                        }}>
                        🔔 Notificações
                    </Typography>
                    <Stack direction='row' gap={1}>
                        <IconButton
                            sx={{ mr: -1 }}
                            onClick={() => refreshListAsideNotifications()}
                            title='Atualizar lista'
                            color='primary'>
                            <AutorenewOutlinedIcon />
                        </IconButton>
                        <IconButton sx={{ mr: -1 }} onClick={() => closeDrawer()} title='Fechar'>
                            <HighlightOffIcon />
                        </IconButton>
                    </Stack>
                </Grid>

                <Paper variant='outlined' sx={sxSearchSectionProps}>
                    <IconButton size={"small"}>
                        <SearchIcon />
                    </IconButton>

                    <InputBase
                        fullWidth
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                        placeholder='Pesquisar por notificação'
                        sx={{ fontSize: "0.93rem" }}
                        size={"small"}
                        inputProps={{ "aria-label": "Pesquisar por notificação" }}
                    />
                    <IconButton title='Filtrar por' size={"small"} onClick={handleClick}>
                        <FilterAltOutlinedIcon color={"inherit"} />
                    </IconButton>

                    <Menu
                        anchorEl={openEl}
                        open={Boolean(openEl)}
                        onClose={handleCloseFilterMenu}
                        slotProps={{
                            paper: {
                                elevation: 0,
                                sx: {
                                    position: "relative",
                                    mt: 1.5,
                                    ml: -2,
                                    minWidth: "15rem",
                                    maxWidth: "29.2rem",
                                    p: 2,
                                    overflow: "visible",
                                    border: `1px solid ${theme.palette.divider}`,
                                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                                    background: colorBackgroundSystem,
                                    backdropFilter: "blur(25px)",
                                    backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                                    backgroundRepeat: "no-repeat, no-repeat",
                                    backgroundSize: "50%, 50%",
                                    backgroundPosition: "right top, left bottom",
                                    "&:before": {
                                        content: '""',
                                        position: "absolute",
                                        top: -1,
                                        left: 433,
                                        transform: "translateY(-50%) rotate(45deg)",
                                        width: 14,
                                        height: 14,
                                        borderTop: `1px solid ${theme.palette.divider}`,
                                        borderLeft: `1px solid ${theme.palette.divider}`,
                                        zIndex: 0,
                                        bgcolor: isThemeLight ? "#f4fcfd" : "#05252cea",
                                        backdropFilter: "blur(100px)",
                                    },
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: "left", vertical: "top" }}
                        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}>
                        <Grid component='form' container spacing={1} onSubmit={handleSubmit(onSubmitFilter)}>
                            <Grid item xs={12} mb={1}>
                                <Typography fontSize={"0.9rem"} color='text.secondary'>
                                    Período
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormDateTimePicker
                                    fullWidth
                                    name='date_start'
                                    label='Inicial'
                                    variant='outlined'
                                    size='small'
                                    control={control}
                                    errors={errors}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormDateTimePicker
                                    fullWidth
                                    name='date_end'
                                    label='Final'
                                    variant='outlined'
                                    size='small'
                                    control={control}
                                    errors={errors}
                                />
                            </Grid>

                            <Grid container display='flex' justifyContent='center' mt={2}>
                                <LoadingButton
                                    type='submit'
                                    size='small'
                                    color='inherit'
                                    variant='contained'
                                    title='Filtrar registros'
                                    startIcon={<Icon>filter_list</Icon>}
                                    sx={{
                                        boxShadow: "none",
                                        backgroundColor: "transparent",
                                        fontSize: 13,
                                        border: `1px solid ${theme.palette.divider}`,
                                        "&:hover": { boxShadow: "none", backgroundColor: "action.hover" },
                                    }}>
                                    Aplicar filtro
                                </LoadingButton>
                            </Grid>
                        </Grid>
                    </Menu>
                </Paper>

                <Box mt={1} mb={0}>
                    <ToggleButtonGroup
                        fullWidth
                        value={filterMode}
                        exclusive
                        size='small'
                        onChange={(_, mode) => mode && setFilterMode(mode)}>
                        <ToggleButton value='all'>{`Todos (${notificationList.length})`}</ToggleButton>
                        <ToggleButton value='read'>{`Lidos (${readCount})`}</ToggleButton>
                        <ToggleButton value='unread'>{`Não Lidos (${unreadCount})`}</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Grid
                    mt={1}
                    item
                    sx={{
                        width: "100%",
                        minWidth: "300px",
                        height: "calc(100% - 185px)",
                    }}>
                    {notificationList.length === 0 ? (
                        <ThereIsImage />
                    ) : finalList.length === 0 ? (
                        <Box
                            sx={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                p: 2,
                            }}>
                            <Typography color='text.secondary' sx={{ display: "inline-flex", alignItems: "center" }}>
                                <SearchOffOutlinedIcon color='primary' sx={{ mr: 0.5 }} />
                                Nenhuma notificação encontrada.
                            </Typography>
                        </Box>
                    ) : (
                        <AutoSizer>
                            {({ height, width }) => (
                                <VariableSizeList
                                    height={height}
                                    width={width}
                                    itemData={finalList}
                                    itemCount={finalList.length}
                                    itemSize={() => 85}
                                    overscanCount={5}>
                                    {RenderList}
                                </VariableSizeList>
                            )}
                        </AutoSizer>
                    )}
                </Grid>

                <Grid item xs={12} mt={1}>
                    <Button
                        fullWidth
                        variant='contained'
                        color='inherit'
                        sx={{
                            boxShadow: "none",
                            backgroundColor: "transparent",
                            fontSize: 13,
                            border: `1px solid ${theme.palette.divider}`,
                            "&:hover": { boxShadow: "none", backgroundColor: "action.hover" },
                        }}
                        onClick={() => {
                            navigate("/notificacoes");
                            toggleDrawer();
                        }}>
                        Ver todas as notificações
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );
}
