import { useEffect, useState } from "react";
import {
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Checkbox,
    Chip,
    Collapse,
    Divider,
    FormControlLabel,
    Grid,
    Icon,
    IconButton,
    InputAdornment,
    Link,
    Modal,
    Rating,
    Skeleton,
    Switch,
    SxProps,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { filterSearch } from "../../../functions/filterSearch";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import StackedBarChartOutlinedIcon from "@mui/icons-material/StackedBarChartOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useGlobal } from "@/contexts/GlobalContext";
import { searchAllAccessPermissionGroup } from "@/services/access-groups";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { deleteReportsCatalog, ISearchAllReportsCatalog, searchAllReportsCatalogRecords } from "@/services/reports";
import { toast } from "react-toastify";
import { CatalogFields } from "./CatalogFields";
import { useConfirm } from "material-ui-confirm";
import { formatDate } from "@/functions/date";
import { CSATAverageRating } from "@/components/CSATAssessments/CSATAverageRating";
import backGroundImageCard from "@/assets//images/report/report-bg-dashboard.jpg";

export type ListReportProps = {
    route: string;
    label: string;
    component: string;
};

type PermissionProps = {
    group: string;
};

export function ListRecordsCatalog() {
    const [filterReport, setFilterReport] = useState("");
    const [loading, setLoading] = useState(false);
    const [listCatalogPanel, setListCatalogPanel] = useState<ISearchAllReportsCatalog[]>([]);
    const [listCatalogDashboardsBI, setListCatalogDashboardsBI] = useState<ISearchAllReportsCatalog[]>([]);
    const [listCatalogExternLinks, setListCatalogExternLinks] = useState<ISearchAllReportsCatalog[]>([]);
    const [listCatalogInternalLinks, setListCatalogInternalLinks] = useState<ISearchAllReportsCatalog[]>([]);
    const [accessPermission, setAccessPermission] = useState<PermissionProps[]>([]);
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);
    const [idReportCatalog, setIdReportCatalog] = useState<number>();
    const [openDrawerReportCatalog, setOpenDrawerReportCatalog] = useState(false);
    const [inputValueDelete, setInputValueDelete] = useState<string>("");
    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState<boolean>(false);
    const [changeStatesSwitch, setChangeStatesSwitch] = useState({
        isSwitchCardsInactiveEnabled: false,
        isEditSwitchChecked: false,
        isPanelEnabled: true,
        isDashboardBIEnabled: true,
        isExternalLinksEnabled: true,
        isInternalLinksEnabled: true,
    });

    const { routes } = useAuth();
    const {
        getInfoError,
        isSidebarOpen,
        theme: themeContext,
        colorBorderSystem,
        colorBackgroundSystem,
        colorBoxShadowSystem,
        redBlur,
        cyanBlur,
    } = useGlobal();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const isThemeLight = themeContext === "light";

    const confirm = useConfirm();

    const gridArchiveProps: SxProps = {
        transition: "0.3s",
        "&:hover": {
            transform: "translateY(-08px)",
        },
        paddingBottom: isMobile ? "5px" : "0",
    };

    const handleReportCatalog = () => {
        setOpenDrawerReportCatalog((oldValue) => !oldValue);
        setSpeedDialOpen(true);
    };

    const handleClickReport = (url: string) => {
        navigate(url);
    };

    function handleRemoveReportsCatalog(id: number) {
        setIdReportCatalog(id);
        setIsModalDeleteOpen(true);
    }

    const handleSwitchChange =
        (key: keyof typeof changeStatesSwitch) => (event: React.ChangeEvent<HTMLInputElement>) => {
            setChangeStatesSwitch((prev) => ({
                ...prev,
                [key]: event.target.checked,
            }));
        };

    async function handleConfirmDelete() {
        if (inputValueDelete.trim().toUpperCase() !== "DELETAR") {
            toast.error("Palavra passe incorreta! Digite 'DELETAR' para confirmar.");
            return;
        }

        if (!idReportCatalog) {
            toast.error("Nenhum card selecionado para exclusão.");
            return;
        }

        try {
            await deleteReportsCatalog(idReportCatalog);
            await fetchDataCatalog();

            toast.success("Card removido com sucesso");
            setIsModalDeleteOpen(false);
            setInputValueDelete("");
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    }

    function handleCancelDelete() {
        setIsModalDeleteOpen(false);
        setInputValueDelete("");
    }

    const fetchDataCatalog = async () => {
        try {
            setLoading(true);

            const dataUserPermission = await searchAllAccessPermissionGroup();
            setAccessPermission(dataUserPermission);

            const reportPermission = routes.find((value) => value.route === "/relatorios");
            const userPermissions = reportPermission?.routes || [];

            if (userPermissions.length > 0) {
                const dataAllCatalogRecords = await searchAllReportsCatalogRecords({});

                const permittedReportsPanel = dataAllCatalogRecords
                    .filter((report) =>
                        userPermissions.some(
                            (permission) =>
                                (report.card_type === "PAINEL" && permission.route === report.route) ||
                                permission.routes?.some((subRoute) => subRoute.route === report.route),
                        ),
                    )
                    .sort((a, b) => (a.card_order || 0) - (b.card_order || 0));

                const permittedReportsDashboards = dataAllCatalogRecords
                    .filter((report) => report.card_type === "DASHBOARD")
                    .sort((a, b) => (a.card_order || 0) - (b.card_order || 0));

                const permittedReportsExternalLinks = dataAllCatalogRecords
                    .filter((report) => report.card_type === "LINK_EXTERNO")
                    .sort((a, b) => (a.card_order || 0) - (b.card_order || 0));

                const permittedReportsInternalLinks = dataAllCatalogRecords
                    .filter((report) =>
                        routes.some(
                            (permission) =>
                                (report.card_type === "LINK_INTERNO" && permission.route === report.route) ||
                                permission.routes?.some((subRoute) => subRoute.route === report.route),
                        ),
                    )
                    .sort((a, b) => (a.card_order || 0) - (b.card_order || 0));

                setListCatalogPanel(permittedReportsPanel);
                setListCatalogDashboardsBI(permittedReportsDashboards);
                setListCatalogExternLinks(permittedReportsExternalLinks);
                setListCatalogInternalLinks(permittedReportsInternalLinks);
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataCatalog();
    }, [routes]);

    const filteredReportsPanels = listCatalogPanel.filter(
        (value) =>
            filterSearch(value, ["title"], filterReport) &&
            (changeStatesSwitch.isSwitchCardsInactiveEnabled || value.is_active),
    );
    const filteredReportsDashboards = listCatalogDashboardsBI.filter(
        (value) =>
            filterSearch(value, ["title"], filterReport) &&
            (changeStatesSwitch.isSwitchCardsInactiveEnabled || value.is_active),
    );
    const filteredReportsExternLinks = listCatalogExternLinks.filter(
        (value) =>
            filterSearch(value, ["title"], filterReport) &&
            (changeStatesSwitch.isSwitchCardsInactiveEnabled || value.is_active),
    );
    const filteredReportsInternalLinks = listCatalogInternalLinks.filter(
        (value) =>
            filterSearch(value, ["title"], filterReport) &&
            (changeStatesSwitch.isSwitchCardsInactiveEnabled || value.is_active),
    );

    return (
        <>
            <Grid container justifyContent='center' mt={-1} padding={2}>
                <Grid item xs={12} md={12} mt={0.5}>
                    <Box display='flex' justifyContent='space-between' alignItems='center' width='100%'>
                        <Breadcrumbs aria-label='breadcrumb' separator='›'>
                            <Link
                                color='text.primary'
                                sx={{ display: "inline-flex", alignItems: "center" }}
                                underline='none'>
                                <StackedBarChartOutlinedIcon
                                    sx={{ color: isThemeLight ? "#5e5e5e" : "#FFFFFF", mr: 0.5 }}
                                />
                                <Typography color='text.primary' sx={{ mt: 0.5 }}>
                                    Relatórios
                                </Typography>
                            </Link>
                            <Typography sx={{ color: "text.secondary" }}>Catálogo</Typography>
                        </Breadcrumbs>

                        <CSATAverageRating
                            module='Catálogo'
                            routePath='/relatorios/catalogo'
                            isClickable
                            formProps={{
                                module: "Catálogo",
                                routePath: "/relatorios/catalogo",
                                context: "Interação na Avaliação",
                            }}
                        />
                    </Box>
                </Grid>

                <Divider
                    sx={{
                        borderColor: colorBorderSystem,
                        borderStyle: "dashed",
                        width: "100%",
                        ml: 0.75,
                        mr: 0.75,
                        mb: 1,
                    }}
                />

                <Box display='flex' flex={1} flexDirection='column' padding={1} mb={3}>
                    <Grid container display='flex' flex={1} flexDirection='row' mb={2}>
                        <Grid display='flex' item xs={12} sm justifyContent={"center"}>
                            <TextField
                                fullWidth
                                variant='outlined'
                                className='input'
                                size='small'
                                placeholder='Pesquisar por'
                                onChange={(e) => setFilterReport(e.target.value)}
                                sx={{ "& fieldset": { borderRadius: "8px !important" } }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <SearchIcon fontSize='small' />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Grid item xs={12} md={12} mb={2}>
                        {accessPermission.some((value) => value.group === "GROUP_ADMIN") && (
                            <>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={changeStatesSwitch.isSwitchCardsInactiveEnabled}
                                            onChange={handleSwitchChange("isSwitchCardsInactiveEnabled")}
                                            inputProps={{ "aria-label": "Cards Inativos" }}
                                        />
                                    }
                                    label='Cards Inativos'
                                    title='Exibir Cards com Status Inativo'
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={changeStatesSwitch.isEditSwitchChecked}
                                            onChange={handleSwitchChange("isEditSwitchChecked")}
                                            inputProps={{ "aria-label": "Habilitar Opções" }}
                                        />
                                    }
                                    label='Habilitar Opções'
                                    title='Habilitar botões de opções dos Cards'
                                />
                            </>
                        )}

                        <FormControlLabel
                            control={
                                <Checkbox
                                    defaultChecked={changeStatesSwitch.isPanelEnabled}
                                    onChange={handleSwitchChange("isPanelEnabled")}
                                />
                            }
                            label='Painéis'
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    defaultChecked={changeStatesSwitch.isDashboardBIEnabled}
                                    onChange={handleSwitchChange("isDashboardBIEnabled")}
                                />
                            }
                            label='Dashboards'
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    defaultChecked={changeStatesSwitch.isExternalLinksEnabled}
                                    onChange={handleSwitchChange("isExternalLinksEnabled")}
                                />
                            }
                            label='Links Externos'
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    defaultChecked={changeStatesSwitch.isInternalLinksEnabled}
                                    onChange={handleSwitchChange("isInternalLinksEnabled")}
                                />
                            }
                            label='Links Internos'
                        />
                    </Grid>

                    {changeStatesSwitch.isPanelEnabled && (
                        <>
                            <Grid item xs={12} md={12} mb={3}>
                                <Typography fontSize={18} fontWeight={700}>
                                    {`Painéis | ${filteredReportsPanels.length}`}
                                </Typography>
                            </Grid>

                            <Grid container spacing={2} justifyContent='flex-start' alignItems='stretch'>
                                {loading ? (
                                    <>
                                        {[...Array(6)].map((_, index) => (
                                            <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={index}>
                                                <Skeleton
                                                    variant='rectangular'
                                                    animation='wave'
                                                    height={160}
                                                    sx={{ borderRadius: 2 }}
                                                />
                                            </Grid>
                                        ))}
                                    </>
                                ) : filteredReportsPanels && filteredReportsPanels.length > 0 ? (
                                    filteredReportsPanels.map((data) => (
                                        <Grid
                                            item
                                            sx={!changeStatesSwitch.isEditSwitchChecked ? gridArchiveProps : {}}
                                            xs={12}
                                            sm={6}
                                            md={4}
                                            lg={3}
                                            xl={2}
                                            key={data.id}>
                                            <Tooltip title={data.description}>
                                                <Card
                                                    sx={{
                                                        height: "100%",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        borderRadius: "8px",
                                                        border: data.is_active
                                                            ? `1px solid ${colorBorderSystem}`
                                                            : `1px dashed #dc2626`,
                                                        background: colorBackgroundSystem,
                                                        boxShadow: data.is_active
                                                            ? colorBoxShadowSystem
                                                            : "0px 0px 20px -6px rgba(220,38,38,1)",
                                                    }}>
                                                    <CardActionArea
                                                        onClick={() => {
                                                            if (data.route) {
                                                                handleClickReport(data.route);
                                                            }
                                                        }}
                                                        title={data.title}>
                                                        <Box position='relative'>
                                                            {data.use_card_image ? (
                                                                <CardMedia
                                                                    component='img'
                                                                    height={data.card_height || "70px"}
                                                                    image={backGroundImageCard}
                                                                    alt='Imagem de Capa'
                                                                />
                                                            ) : (
                                                                <Box
                                                                    height={data.card_height || "70px"}
                                                                    sx={{
                                                                        backgroundImage: data.background_color,
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        color: "white",
                                                                        fontSize: "1.5rem",
                                                                        fontWeight: "bold",
                                                                        position: "relative",
                                                                    }}
                                                                />
                                                            )}
                                                            <>
                                                                {data.label_bignumber && (
                                                                    <Box
                                                                        position='absolute'
                                                                        bottom={8}
                                                                        right={8}
                                                                        bgcolor='rgba(0, 0, 0, 0.6)'
                                                                        color='white'
                                                                        padding='4px 8px'
                                                                        borderRadius='4px'
                                                                        fontSize='1rem'>
                                                                        {data.label_bignumber}
                                                                    </Box>
                                                                )}
                                                                {data.label_icon && (
                                                                    <Box
                                                                        position='absolute'
                                                                        top={2}
                                                                        left={2}
                                                                        color='white'
                                                                        padding='4px 8px'
                                                                        borderRadius='4px'
                                                                        fontSize='1rem'>
                                                                        <Icon>{data.label_icon}</Icon>
                                                                    </Box>
                                                                )}

                                                                {changeStatesSwitch.isEditSwitchChecked &&
                                                                    accessPermission.some(
                                                                        (value) => value.group === "GROUP_ADMIN",
                                                                    ) && (
                                                                        <Box
                                                                            position='absolute'
                                                                            top={2}
                                                                            right={2}
                                                                            color='white'
                                                                            padding='4px 8px'
                                                                            borderRadius='4px'
                                                                            fontSize='1rem'>
                                                                            {data.is_public ? (
                                                                                <Icon
                                                                                    title='Este card é público e visível para todos os usuários.'
                                                                                    className='material-icons-outlined'
                                                                                    color={
                                                                                        data.use_card_image
                                                                                            ? "success"
                                                                                            : "inherit"
                                                                                    }>
                                                                                    public
                                                                                </Icon>
                                                                            ) : (
                                                                                <Icon
                                                                                    title='Este card é privado e visível apenas para grupos autorizados.'
                                                                                    className='material-icons-outlined'
                                                                                    color={
                                                                                        data.use_card_image
                                                                                            ? "primary"
                                                                                            : "inherit"
                                                                                    }>
                                                                                    security
                                                                                </Icon>
                                                                            )}
                                                                        </Box>
                                                                    )}
                                                            </>
                                                        </Box>
                                                        <CardContent
                                                            sx={{
                                                                background: colorBackgroundSystem,
                                                                backdropFilter: "blur(25px)",
                                                                backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                                                                backgroundRepeat: "no-repeat, no-repeat",
                                                                backgroundSize: "50%, 50%",
                                                                backgroundPosition: "right top, left bottom",
                                                            }}>
                                                            <Box>
                                                                <Typography
                                                                    variant='body2'
                                                                    fontSize='0.90rem'
                                                                    color='text.primary'
                                                                    textOverflow='ellipses'
                                                                    noWrap>
                                                                    {data.is_active ? (
                                                                        data.is_new && (
                                                                            <Chip
                                                                                label={
                                                                                    <Typography
                                                                                        color='success.main'
                                                                                        fontSize={10}>
                                                                                        Novo
                                                                                    </Typography>
                                                                                }
                                                                                color='success'
                                                                                variant='outlined'
                                                                                component={"span"}
                                                                                size='small'
                                                                                sx={{
                                                                                    mr: 1,
                                                                                    height: "14px",
                                                                                    mb: 0.5,
                                                                                }}
                                                                            />
                                                                        )
                                                                    ) : (
                                                                        <Chip
                                                                            label={
                                                                                <Typography
                                                                                    color='error.main'
                                                                                    fontSize={10}>
                                                                                    Inativo
                                                                                </Typography>
                                                                            }
                                                                            color='error'
                                                                            variant='outlined'
                                                                            component={"span"}
                                                                            size='small'
                                                                            sx={{
                                                                                mr: 1,
                                                                                height: "14px",
                                                                                mb: 0.5,
                                                                            }}
                                                                        />
                                                                    )}
                                                                    {data.title}
                                                                </Typography>
                                                                <Typography
                                                                    width='100%'
                                                                    maxWidth='400px'
                                                                    minWidth='150px'
                                                                    variant='body2'
                                                                    fontSize='0.8rem'
                                                                    color='text.secondary'
                                                                    textOverflow='ellipses'
                                                                    noWrap>
                                                                    {data.description || "  "}
                                                                </Typography>
                                                                <Box width='100%' mt={0.25} ml={-0.25}>
                                                                    <Box display='flex' alignItems='center' gap={0.25}>
                                                                        <Rating
                                                                            max={5}
                                                                            value={data.media_rating_report || 0}
                                                                            precision={0.5}
                                                                            size='small'
                                                                            readOnly
                                                                        />
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        </CardContent>
                                                    </CardActionArea>
                                                    <Collapse
                                                        in={
                                                            changeStatesSwitch.isEditSwitchChecked &&
                                                            accessPermission.some(
                                                                (value) => value.group === "GROUP_ADMIN",
                                                            )
                                                        }>
                                                        <>
                                                            <Divider
                                                                sx={{
                                                                    width: "100%",
                                                                    borderColor: colorBorderSystem,
                                                                    borderStyle: "dashed",
                                                                    mt: 0.07,
                                                                }}
                                                            />
                                                            <Box
                                                                padding={1}
                                                                display='flex'
                                                                justifyContent='space-between'
                                                                alignItems='center'
                                                                title={`Data Atualização: ${data.updated_at ? formatDate(data.updated_at, "DD/MM/YYYY HH:mm:ss") : "Sem Atualização"}`}>
                                                                <Box display='flex'>
                                                                    <IconButton
                                                                        title='Editar Card'
                                                                        size='small'
                                                                        disabled={loading}
                                                                        onClick={() => {
                                                                            setIdReportCatalog(data.id);
                                                                            handleReportCatalog();
                                                                        }}>
                                                                        <EditNoteOutlinedIcon color='success' />
                                                                    </IconButton>
                                                                    {/* <IconButton
                                                                            title='Registros de log do Card'
                                                                            size='small'
                                                                            disabled={loading}
                                                                            onClick={() => alert("Abrir Modal de Log")}>
                                                                            <ReceiptLongOutlinedIcon height={10} color='primary' />
                                                                        </IconButton> */}
                                                                </Box>

                                                                <Box
                                                                    sx={{
                                                                        cursor: "default",
                                                                        mr: 0.5,
                                                                    }}>
                                                                    <Typography
                                                                        component={"span"}
                                                                        color='text.secondary'
                                                                        fontSize={9}
                                                                        title='Data Criação'>
                                                                        {formatDate(
                                                                            data.created_at,
                                                                            "DD/MM/YYYY HH:mm",
                                                                        ) || ""}
                                                                    </Typography>
                                                                    <Typography
                                                                        component={"span"}
                                                                        color='text.secondary'
                                                                        ml={1}
                                                                        title='Posição do Card'>
                                                                        {data.card_order || "0"}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </>
                                                    </Collapse>
                                                </Card>
                                            </Tooltip>
                                        </Grid>
                                    ))
                                ) : (
                                    <Grid
                                        item
                                        xs={12}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: "8px",
                                            padding: "10px",
                                            height: "58px",
                                            width: "100%",
                                            ml: 2,
                                            mt: 2,
                                        }}>
                                        <Typography
                                            color='text.secondary'
                                            sx={{ display: "inline-flex", alignItems: "center" }}>
                                            <SearchOffOutlinedIcon color='disabled' sx={{ mr: 0.5 }} />
                                            Nenhum painel encontrado
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>

                            <Divider
                                sx={{
                                    borderColor: colorBorderSystem,
                                    borderStyle: "dashed",
                                    width: "100%",
                                    mb: 1,
                                    mt: 3.5,
                                }}
                            />
                        </>
                    )}

                    {changeStatesSwitch.isDashboardBIEnabled && (
                        <>
                            <Grid item xs={12} md={12} mb={3} mt={1}>
                                <Typography fontSize={18} fontWeight={700}>
                                    {`Dashboards | ${filteredReportsDashboards.length}`}
                                </Typography>
                            </Grid>

                            <Grid container spacing={2} justifyContent='flex-start' alignItems='stretch'>
                                {loading ? (
                                    <>
                                        {[...Array(6)].map((_, index) => (
                                            <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={index}>
                                                <Skeleton
                                                    variant='rectangular'
                                                    animation='wave'
                                                    height={160}
                                                    sx={{ borderRadius: 2 }}
                                                />
                                            </Grid>
                                        ))}
                                    </>
                                ) : filteredReportsDashboards && filteredReportsDashboards.length > 0 ? (
                                    filteredReportsDashboards.map((data) => (
                                        <Grid
                                            item
                                            sx={!changeStatesSwitch.isEditSwitchChecked ? gridArchiveProps : {}}
                                            xs={12}
                                            sm={6}
                                            md={4}
                                            lg={3}
                                            xl={2}
                                            key={data.id}>
                                            <Tooltip title={data.description}>
                                                <Card
                                                    sx={{
                                                        height: "100%",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        borderRadius: "8px",
                                                        border: data.is_active
                                                            ? `1px solid ${colorBorderSystem}`
                                                            : `1px dashed #dc2626`,
                                                        background: colorBackgroundSystem,
                                                        boxShadow: data.is_active
                                                            ? colorBoxShadowSystem
                                                            : "0px 0px 20px -6px rgba(220,38,38,1)",
                                                    }}>
                                                    <CardActionArea
                                                        onClick={() => {
                                                            navigate(`/relatorios/catalogo/dashboard/${data.id}`);
                                                        }}
                                                        title={data.title}>
                                                        <Box position='relative'>
                                                            {data.use_card_image ? (
                                                                <CardMedia
                                                                    component='img'
                                                                    height={data.card_height || "160px"}
                                                                    image={backGroundImageCard}
                                                                    alt='Imagem de Capa'
                                                                />
                                                            ) : (
                                                                <Box
                                                                    height={data.card_height || "160px"}
                                                                    sx={{
                                                                        backgroundImage: data.background_color,
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        color: "white",
                                                                        fontSize: "1.5rem",
                                                                        fontWeight: "bold",
                                                                        position: "relative",
                                                                    }}
                                                                />
                                                            )}
                                                            <>
                                                                <Box
                                                                    position='absolute'
                                                                    top={2}
                                                                    left={2}
                                                                    color='white'
                                                                    padding='4px 8px'
                                                                    borderRadius='4px'
                                                                    fontSize='1rem'>
                                                                    <Icon className='material-icons-outlined'>
                                                                        poll
                                                                    </Icon>
                                                                </Box>

                                                                {changeStatesSwitch.isEditSwitchChecked &&
                                                                    accessPermission.some(
                                                                        (value) => value.group === "GROUP_ADMIN",
                                                                    ) && (
                                                                        <Box
                                                                            position='absolute'
                                                                            top={2}
                                                                            right={2}
                                                                            color='white'
                                                                            padding='4px 8px'
                                                                            borderRadius='4px'
                                                                            fontSize='1rem'>
                                                                            {data.is_public ? (
                                                                                <Icon
                                                                                    title='Este card é público e visível para todos os usuários.'
                                                                                    className='material-icons-outlined'
                                                                                    color={
                                                                                        data.use_card_image
                                                                                            ? "success"
                                                                                            : "inherit"
                                                                                    }>
                                                                                    public
                                                                                </Icon>
                                                                            ) : (
                                                                                <Icon
                                                                                    title='Este card é privado e visível apenas para grupos autorizados.'
                                                                                    className='material-icons-outlined'
                                                                                    color={
                                                                                        data.use_card_image
                                                                                            ? "primary"
                                                                                            : "inherit"
                                                                                    }>
                                                                                    security
                                                                                </Icon>
                                                                            )}
                                                                        </Box>
                                                                    )}

                                                                <Box
                                                                    position='absolute'
                                                                    top={20}
                                                                    left={25}
                                                                    right={25}
                                                                    height={"120px"}
                                                                    color='white'
                                                                    padding='4px 8px'
                                                                    borderRadius='4px'
                                                                    display='flex'
                                                                    alignItems='center'
                                                                    justifyContent='center'
                                                                    textAlign='center'>
                                                                    <Typography
                                                                        fontSize='1.45rem'
                                                                        fontWeight='bold'
                                                                        fontStyle='italic'
                                                                        textTransform='uppercase'
                                                                        sx={{
                                                                            textShadow:
                                                                                "2px 4px 8px rgba(0, 0, 0, 0.70)",
                                                                        }}>
                                                                        {data.label_card}
                                                                    </Typography>
                                                                </Box>
                                                            </>
                                                        </Box>
                                                        <CardContent
                                                            sx={{
                                                                background: colorBackgroundSystem,
                                                                backdropFilter: "blur(25px)",
                                                                backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                                                                backgroundRepeat: "no-repeat, no-repeat",
                                                                backgroundSize: "50%, 50%",
                                                                backgroundPosition: "right top, left bottom",
                                                            }}>
                                                            <Box>
                                                                <Typography
                                                                    variant='body2'
                                                                    fontSize='0.90rem'
                                                                    color='text.primary'
                                                                    textOverflow='ellipses'
                                                                    noWrap>
                                                                    {data.is_active ? (
                                                                        data.is_new && (
                                                                            <Chip
                                                                                label={
                                                                                    <Typography
                                                                                        color='success.main'
                                                                                        fontSize={10}>
                                                                                        Novo
                                                                                    </Typography>
                                                                                }
                                                                                color='success'
                                                                                variant='outlined'
                                                                                component={"span"}
                                                                                size='small'
                                                                                sx={{
                                                                                    mr: 1,
                                                                                    height: "14px",
                                                                                    mb: 0.5,
                                                                                }}
                                                                            />
                                                                        )
                                                                    ) : (
                                                                        <Chip
                                                                            label={
                                                                                <Typography
                                                                                    color='error.main'
                                                                                    fontSize={10}>
                                                                                    Inativo
                                                                                </Typography>
                                                                            }
                                                                            color='error'
                                                                            variant='outlined'
                                                                            component={"span"}
                                                                            size='small'
                                                                            sx={{
                                                                                mr: 1,
                                                                                height: "14px",
                                                                                mb: 0.5,
                                                                            }}
                                                                        />
                                                                    )}
                                                                    {data.title}
                                                                </Typography>
                                                                <Typography
                                                                    width='100%'
                                                                    maxWidth='400px'
                                                                    minWidth='150px'
                                                                    variant='body2'
                                                                    fontSize='0.8rem'
                                                                    color='text.secondary'
                                                                    textOverflow='ellipses'
                                                                    noWrap>
                                                                    {data.description || "  "}
                                                                </Typography>
                                                                <Box width='100%' mt={0.25} ml={-0.25}>
                                                                    <Box display='flex' alignItems='center' gap={0.25}>
                                                                        <Rating
                                                                            max={5}
                                                                            value={data.media_rating_report || 0}
                                                                            precision={0.5}
                                                                            size='small'
                                                                            readOnly
                                                                        />
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        </CardContent>
                                                    </CardActionArea>
                                                    <Collapse
                                                        in={
                                                            changeStatesSwitch.isEditSwitchChecked &&
                                                            accessPermission.some(
                                                                (value) => value.group === "GROUP_ADMIN",
                                                            )
                                                        }>
                                                        <>
                                                            <Divider
                                                                sx={{
                                                                    width: "100%",
                                                                    borderColor: colorBorderSystem,
                                                                    borderStyle: "dashed",
                                                                    mt: 0.07,
                                                                }}
                                                            />
                                                            <Box
                                                                padding={1}
                                                                display='flex'
                                                                justifyContent='space-between'
                                                                alignItems='center'
                                                                title={`Data Atualização: ${data.updated_at ? formatDate(data.updated_at, "DD/MM/YYYY HH:mm:ss") : "Sem Atualização"}`}>
                                                                <Box display='flex'>
                                                                    <IconButton
                                                                        title='Editar Card'
                                                                        size='small'
                                                                        disabled={loading}
                                                                        onClick={() => {
                                                                            setIdReportCatalog(data.id);
                                                                            handleReportCatalog();
                                                                        }}>
                                                                        <EditNoteOutlinedIcon color='success' />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        title='Deletar Card'
                                                                        size='small'
                                                                        disabled={loading}
                                                                        onClick={() =>
                                                                            handleRemoveReportsCatalog(data.id)
                                                                        }>
                                                                        <DeleteOutlineOutlinedIcon
                                                                            height={10}
                                                                            color='error'
                                                                        />
                                                                    </IconButton>
                                                                    {/* <IconButton
                                                                            title='Registros de log do Card'
                                                                            size='small'
                                                                            disabled={loading}
                                                                            onClick={() => alert("Abrir Modal de Log")}>
                                                                            <ReceiptLongOutlinedIcon height={10} color='primary' />
                                                                        </IconButton> */}
                                                                </Box>

                                                                <Box
                                                                    sx={{
                                                                        cursor: "default",
                                                                        mr: 0.5,
                                                                    }}>
                                                                    <Typography
                                                                        component={"span"}
                                                                        color='text.secondary'
                                                                        fontSize={9}
                                                                        title='Data Criação'>
                                                                        {isSidebarOpen
                                                                            ? formatDate(
                                                                                  data.created_at,
                                                                                  "DD/MM/YYYY",
                                                                              ) || ""
                                                                            : formatDate(
                                                                                  data.created_at,
                                                                                  "DD/MM/YYYY HH:mm",
                                                                              ) || ""}
                                                                    </Typography>
                                                                    <Typography
                                                                        component={"span"}
                                                                        color='text.secondary'
                                                                        ml={1}
                                                                        title='Posição do Card'>
                                                                        {data.card_order || "0"}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </>
                                                    </Collapse>
                                                </Card>
                                            </Tooltip>
                                        </Grid>
                                    ))
                                ) : (
                                    <Grid
                                        item
                                        xs={12}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: "8px",
                                            padding: "10px",
                                            height: "58px",
                                            width: "100%",
                                            ml: 2,
                                            mt: 2,
                                        }}>
                                        <Typography
                                            color='text.secondary'
                                            sx={{ display: "inline-flex", alignItems: "center" }}>
                                            <SearchOffOutlinedIcon color='disabled' sx={{ mr: 0.5 }} />
                                            Nenhum dashboard encontrado
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>

                            <Divider
                                sx={{
                                    borderColor: colorBorderSystem,
                                    borderStyle: "dashed",
                                    width: "100%",
                                    mb: 1,
                                    mt: 3.5,
                                }}
                            />
                        </>
                    )}

                    {changeStatesSwitch.isExternalLinksEnabled && (
                        <>
                            <Grid item xs={12} md={12} mb={3} mt={1}>
                                <Typography fontSize={18} fontWeight={700}>
                                    {`Links Externos | ${filteredReportsExternLinks.length}`}
                                </Typography>
                            </Grid>

                            <Grid container spacing={2} justifyContent='flex-start' alignItems='stretch'>
                                {loading ? (
                                    <>
                                        {[...Array(6)].map((_, index) => (
                                            <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={index}>
                                                <Skeleton
                                                    variant='rectangular'
                                                    animation='wave'
                                                    height={160}
                                                    sx={{ borderRadius: 2 }}
                                                />
                                            </Grid>
                                        ))}
                                    </>
                                ) : filteredReportsExternLinks && filteredReportsExternLinks.length > 0 ? (
                                    filteredReportsExternLinks.map((data) => (
                                        <Grid
                                            item
                                            sx={!changeStatesSwitch.isEditSwitchChecked ? gridArchiveProps : {}}
                                            xs={12}
                                            sm={6}
                                            md={4}
                                            lg={3}
                                            xl={2}
                                            key={data.id}>
                                            <Tooltip title={data.description}>
                                                <Card
                                                    sx={{
                                                        height: "100%",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        borderRadius: "8px",
                                                        border: data.is_active
                                                            ? `1px solid ${colorBorderSystem}`
                                                            : `1px dashed #dc2626`,
                                                        background: colorBackgroundSystem,
                                                        boxShadow: data.is_active
                                                            ? colorBoxShadowSystem
                                                            : "0px 0px 20px -6px rgba(220,38,38,1)",
                                                    }}>
                                                    <CardActionArea
                                                        onClick={() => {
                                                            if (data.external_link) {
                                                                window.open(
                                                                    data.external_link,
                                                                    "_blank",
                                                                    "noopener,noreferrer",
                                                                );
                                                            }
                                                        }}
                                                        title={data.title}>
                                                        <Box position='relative'>
                                                            {data.use_card_image ? (
                                                                <CardMedia
                                                                    component='img'
                                                                    height={data.card_height || "38px"}
                                                                    image={backGroundImageCard}
                                                                    alt='Imagem de Capa'
                                                                />
                                                            ) : (
                                                                <Box
                                                                    height={data.card_height || "38px"}
                                                                    sx={{
                                                                        backgroundImage: data.background_color,
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        color: "white",
                                                                        fontSize: "1.5rem",
                                                                        fontWeight: "bold",
                                                                        position: "relative",
                                                                    }}
                                                                />
                                                            )}
                                                            <Box
                                                                position='absolute'
                                                                top={2}
                                                                left={2}
                                                                color='white'
                                                                padding='4px 8px'
                                                                borderRadius='4px'
                                                                fontSize='1rem'>
                                                                <Icon>output</Icon>
                                                            </Box>
                                                            {changeStatesSwitch.isEditSwitchChecked &&
                                                                accessPermission.some(
                                                                    (value) => value.group === "GROUP_ADMIN",
                                                                ) && (
                                                                    <Box
                                                                        position='absolute'
                                                                        top={2}
                                                                        right={2}
                                                                        color='white'
                                                                        padding='4px 8px'
                                                                        borderRadius='4px'
                                                                        fontSize='1rem'>
                                                                        {data.is_public ? (
                                                                            <Icon
                                                                                title='Este card é público e visível para todos os usuários.'
                                                                                className='material-icons-outlined'
                                                                                color={
                                                                                    data.use_card_image
                                                                                        ? "success"
                                                                                        : "inherit"
                                                                                }>
                                                                                public
                                                                            </Icon>
                                                                        ) : (
                                                                            <Icon
                                                                                title='Este card é privado e visível apenas para grupos autorizados.'
                                                                                className='material-icons-outlined'
                                                                                color={
                                                                                    data.use_card_image
                                                                                        ? "primary"
                                                                                        : "inherit"
                                                                                }>
                                                                                security
                                                                            </Icon>
                                                                        )}
                                                                    </Box>
                                                                )}
                                                        </Box>
                                                        <CardContent
                                                            sx={{
                                                                background: colorBackgroundSystem,
                                                                backdropFilter: "blur(25px)",
                                                                backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                                                                backgroundRepeat: "no-repeat, no-repeat",
                                                                backgroundSize: "50%, 50%",
                                                                backgroundPosition: "right top, left bottom",
                                                            }}>
                                                            <Box>
                                                                <Typography
                                                                    variant='body2'
                                                                    fontSize='0.90rem'
                                                                    color='text.primary'
                                                                    textOverflow='ellipses'
                                                                    noWrap>
                                                                    {data.is_active ? (
                                                                        data.is_new && (
                                                                            <Chip
                                                                                label={
                                                                                    <Typography
                                                                                        color='success.main'
                                                                                        fontSize={10}>
                                                                                        Novo
                                                                                    </Typography>
                                                                                }
                                                                                color='success'
                                                                                variant='outlined'
                                                                                component={"span"}
                                                                                size='small'
                                                                                sx={{
                                                                                    mr: 1,
                                                                                    height: "14px",
                                                                                    mb: 0.5,
                                                                                }}
                                                                            />
                                                                        )
                                                                    ) : (
                                                                        <Chip
                                                                            label={
                                                                                <Typography
                                                                                    color='error.main'
                                                                                    fontSize={10}>
                                                                                    Inativo
                                                                                </Typography>
                                                                            }
                                                                            color='error'
                                                                            variant='outlined'
                                                                            component={"span"}
                                                                            size='small'
                                                                            sx={{
                                                                                mr: 1,
                                                                                height: "14px",
                                                                                mb: 0.5,
                                                                            }}
                                                                        />
                                                                    )}
                                                                    {data.title}
                                                                </Typography>
                                                            </Box>
                                                        </CardContent>
                                                    </CardActionArea>
                                                    <Collapse
                                                        in={
                                                            changeStatesSwitch.isEditSwitchChecked &&
                                                            accessPermission.some(
                                                                (value) => value.group === "GROUP_ADMIN",
                                                            )
                                                        }>
                                                        <>
                                                            <Divider
                                                                sx={{
                                                                    width: "100%",
                                                                    borderColor: colorBorderSystem,
                                                                    borderStyle: "dashed",
                                                                    mt: 0.07,
                                                                }}
                                                            />
                                                            <Box
                                                                padding={1}
                                                                display='flex'
                                                                justifyContent='space-between'
                                                                alignItems='center'
                                                                title={`Data Atualização: ${data.updated_at ? formatDate(data.updated_at, "DD/MM/YYYY HH:mm:ss") : "Sem Atualização"}`}>
                                                                <Box display='flex'>
                                                                    <IconButton
                                                                        title='Editar Card'
                                                                        size='small'
                                                                        disabled={loading}
                                                                        onClick={() => {
                                                                            setIdReportCatalog(data.id);
                                                                            handleReportCatalog();
                                                                        }}>
                                                                        <EditNoteOutlinedIcon color='success' />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        title='Deletar Card'
                                                                        size='small'
                                                                        disabled={loading}
                                                                        onClick={() =>
                                                                            handleRemoveReportsCatalog(data.id)
                                                                        }>
                                                                        <DeleteOutlineOutlinedIcon
                                                                            height={10}
                                                                            color='error'
                                                                        />
                                                                    </IconButton>
                                                                </Box>

                                                                <Box
                                                                    sx={{
                                                                        cursor: "default",
                                                                        mr: 0.5,
                                                                    }}>
                                                                    <Typography
                                                                        component={"span"}
                                                                        color='text.secondary'
                                                                        fontSize={9}
                                                                        title='Data Criação'>
                                                                        {isSidebarOpen
                                                                            ? formatDate(
                                                                                  data.created_at,
                                                                                  "DD/MM/YYYY",
                                                                              ) || ""
                                                                            : formatDate(
                                                                                  data.created_at,
                                                                                  "DD/MM/YYYY HH:mm",
                                                                              ) || ""}
                                                                    </Typography>
                                                                    <Typography
                                                                        component={"span"}
                                                                        color='text.secondary'
                                                                        ml={1}
                                                                        title='Posição do Card'>
                                                                        {data.card_order || "0"}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </>
                                                    </Collapse>
                                                </Card>
                                            </Tooltip>
                                        </Grid>
                                    ))
                                ) : (
                                    <Grid
                                        item
                                        xs={12}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: "8px",
                                            padding: "10px",
                                            height: "58px",
                                            width: "100%",
                                            ml: 2,
                                            mt: 2,
                                        }}>
                                        <Typography
                                            color='text.secondary'
                                            sx={{ display: "inline-flex", alignItems: "center" }}>
                                            <SearchOffOutlinedIcon color='disabled' sx={{ mr: 0.5 }} />
                                            Nenhum link encontrado
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>

                            <Divider
                                sx={{
                                    borderColor: colorBorderSystem,
                                    borderStyle: "dashed",
                                    width: "100%",
                                    mb: 1,
                                    mt: 3.5,
                                }}
                            />
                        </>
                    )}

                    {changeStatesSwitch.isInternalLinksEnabled && (
                        <>
                            <Grid item xs={12} md={12} mb={3} mt={1}>
                                <Typography fontSize={18} fontWeight={700}>
                                    {`Links Internos | ${filteredReportsInternalLinks.length}`}
                                </Typography>
                            </Grid>

                            <Grid container spacing={2} justifyContent='flex-start' alignItems='stretch'>
                                {loading ? (
                                    <>
                                        {[...Array(6)].map((_, index) => (
                                            <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={index}>
                                                <Skeleton
                                                    variant='rectangular'
                                                    animation='wave'
                                                    height={160}
                                                    sx={{ borderRadius: 2 }}
                                                />
                                            </Grid>
                                        ))}
                                    </>
                                ) : filteredReportsInternalLinks && filteredReportsInternalLinks.length > 0 ? (
                                    filteredReportsInternalLinks.map((data) => (
                                        <Grid
                                            item
                                            sx={!changeStatesSwitch.isEditSwitchChecked ? gridArchiveProps : {}}
                                            xs={12}
                                            sm={6}
                                            md={4}
                                            lg={3}
                                            xl={2}
                                            key={data.id}>
                                            <Tooltip title={data.description}>
                                                <Card
                                                    sx={{
                                                        height: "100%",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        borderRadius: "8px",
                                                        border: data.is_active
                                                            ? `1px solid ${colorBorderSystem}`
                                                            : `1px dashed #dc2626`,
                                                        background: colorBackgroundSystem,
                                                        boxShadow: data.is_active
                                                            ? colorBoxShadowSystem
                                                            : "0px 0px 20px -6px rgba(220,38,38,1)",
                                                    }}>
                                                    <CardActionArea
                                                        onClick={() => {
                                                            if (data.route) {
                                                                handleClickReport(data.route);
                                                            }
                                                        }}
                                                        title={data.title}>
                                                        <Box position='relative'>
                                                            {data.use_card_image ? (
                                                                <CardMedia
                                                                    component='img'
                                                                    height={data.card_height || "38px"}
                                                                    image={backGroundImageCard}
                                                                    alt='Imagem de Capa'
                                                                />
                                                            ) : (
                                                                <Box
                                                                    height={data.card_height || "38px"}
                                                                    sx={{
                                                                        backgroundImage: data.background_color,
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        color: "white",
                                                                        fontSize: "1.5rem",
                                                                        fontWeight: "bold",
                                                                        position: "relative",
                                                                    }}
                                                                />
                                                            )}
                                                            <Box
                                                                position='absolute'
                                                                top={2}
                                                                left={2}
                                                                color='white'
                                                                padding='4px 8px'
                                                                borderRadius='4px'
                                                                fontSize='1rem'>
                                                                <Icon>{data.label_icon || "output"}</Icon>
                                                            </Box>

                                                            {changeStatesSwitch.isEditSwitchChecked &&
                                                                accessPermission.some(
                                                                    (value) => value.group === "GROUP_ADMIN",
                                                                ) && (
                                                                    <Box
                                                                        position='absolute'
                                                                        top={2}
                                                                        right={2}
                                                                        color='white'
                                                                        padding='4px 8px'
                                                                        borderRadius='4px'
                                                                        fontSize='1rem'>
                                                                        {data.is_public ? (
                                                                            <Icon
                                                                                title='Este card é público e visível para todos os usuários.'
                                                                                className='material-icons-outlined'
                                                                                color={
                                                                                    data.use_card_image
                                                                                        ? "success"
                                                                                        : "inherit"
                                                                                }>
                                                                                public
                                                                            </Icon>
                                                                        ) : (
                                                                            <Icon
                                                                                title='Este card é privado e visível apenas para grupos autorizados.'
                                                                                className='material-icons-outlined'
                                                                                color={
                                                                                    data.use_card_image
                                                                                        ? "primary"
                                                                                        : "inherit"
                                                                                }>
                                                                                security
                                                                            </Icon>
                                                                        )}
                                                                    </Box>
                                                                )}
                                                        </Box>
                                                        <CardContent
                                                            sx={{
                                                                background: colorBackgroundSystem,
                                                                backdropFilter: "blur(25px)",
                                                                backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                                                                backgroundRepeat: "no-repeat, no-repeat",
                                                                backgroundSize: "50%, 50%",
                                                                backgroundPosition: "right top, left bottom",
                                                            }}>
                                                            <Box>
                                                                <Typography
                                                                    variant='body2'
                                                                    fontSize='0.90rem'
                                                                    color='text.primary'
                                                                    textOverflow='ellipses'
                                                                    noWrap>
                                                                    {data.is_active ? (
                                                                        data.is_new && (
                                                                            <Chip
                                                                                label={
                                                                                    <Typography
                                                                                        color='success.main'
                                                                                        fontSize={10}>
                                                                                        Novo
                                                                                    </Typography>
                                                                                }
                                                                                color='success'
                                                                                variant='outlined'
                                                                                component={"span"}
                                                                                size='small'
                                                                                sx={{
                                                                                    mr: 1,
                                                                                    height: "14px",
                                                                                    mb: 0.5,
                                                                                }}
                                                                            />
                                                                        )
                                                                    ) : (
                                                                        <Chip
                                                                            label={
                                                                                <Typography
                                                                                    color='error.main'
                                                                                    fontSize={10}>
                                                                                    Inativo
                                                                                </Typography>
                                                                            }
                                                                            color='error'
                                                                            variant='outlined'
                                                                            component={"span"}
                                                                            size='small'
                                                                            sx={{
                                                                                mr: 1,
                                                                                height: "14px",
                                                                                mb: 0.5,
                                                                            }}
                                                                        />
                                                                    )}
                                                                    {data.title}
                                                                </Typography>
                                                                <Box width='100%' mt={0.25} ml={-0.25}>
                                                                    <Box display='flex' alignItems='center' gap={0.25}>
                                                                        <Rating
                                                                            max={5}
                                                                            value={data.media_rating_report || 0}
                                                                            precision={0.5}
                                                                            size='small'
                                                                            readOnly
                                                                        />
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        </CardContent>
                                                    </CardActionArea>
                                                    <Collapse
                                                        in={
                                                            changeStatesSwitch.isEditSwitchChecked &&
                                                            accessPermission.some(
                                                                (value) => value.group === "GROUP_ADMIN",
                                                            )
                                                        }>
                                                        <>
                                                            <Divider
                                                                sx={{
                                                                    width: "100%",
                                                                    borderColor: colorBorderSystem,
                                                                    borderStyle: "dashed",
                                                                    mt: 0.07,
                                                                }}
                                                            />
                                                            <Box
                                                                padding={1}
                                                                display='flex'
                                                                justifyContent='space-between'
                                                                alignItems='center'
                                                                title={`Data Atualização: ${data.updated_at ? formatDate(data.updated_at, "DD/MM/YYYY HH:mm:ss") : "Sem Atualização"}`}>
                                                                <Box display='flex'>
                                                                    <IconButton
                                                                        title='Editar Card'
                                                                        size='small'
                                                                        disabled={loading}
                                                                        onClick={() => {
                                                                            setIdReportCatalog(data.id);
                                                                            handleReportCatalog();
                                                                        }}>
                                                                        <EditNoteOutlinedIcon color='success' />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        title='Deletar Card'
                                                                        size='small'
                                                                        disabled={loading}
                                                                        onClick={() =>
                                                                            handleRemoveReportsCatalog(data.id)
                                                                        }>
                                                                        <DeleteOutlineOutlinedIcon
                                                                            height={10}
                                                                            color='error'
                                                                        />
                                                                    </IconButton>
                                                                </Box>

                                                                <Box
                                                                    sx={{
                                                                        cursor: "default",
                                                                        mr: 0.5,
                                                                    }}>
                                                                    <Typography
                                                                        component={"span"}
                                                                        color='text.secondary'
                                                                        fontSize={9}
                                                                        title='Data Criação'>
                                                                        {isSidebarOpen
                                                                            ? formatDate(
                                                                                  data.created_at,
                                                                                  "DD/MM/YYYY",
                                                                              ) || ""
                                                                            : formatDate(
                                                                                  data.created_at,
                                                                                  "DD/MM/YYYY HH:mm",
                                                                              ) || ""}
                                                                    </Typography>
                                                                    <Typography
                                                                        component={"span"}
                                                                        color='text.secondary'
                                                                        ml={1}
                                                                        title='Posição do Card'>
                                                                        {data.card_order || "0"}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </>
                                                    </Collapse>
                                                </Card>
                                            </Tooltip>
                                        </Grid>
                                    ))
                                ) : (
                                    <Grid
                                        item
                                        xs={12}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: "8px",
                                            padding: "10px",
                                            height: "58px",
                                            width: "100%",
                                            ml: 2,
                                            mt: 2,
                                        }}>
                                        <Typography
                                            color='text.secondary'
                                            sx={{ display: "inline-flex", alignItems: "center" }}>
                                            <SearchOffOutlinedIcon color='disabled' sx={{ mr: 0.5 }} />
                                            Nenhum link encontrado
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </>
                    )}

                    {!changeStatesSwitch.isPanelEnabled &&
                        !changeStatesSwitch.isDashboardBIEnabled &&
                        !changeStatesSwitch.isExternalLinksEnabled &&
                        !changeStatesSwitch.isInternalLinksEnabled && (
                            <Grid
                                item
                                xs={12}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "8px",
                                    padding: "16px",
                                    height: "100px",
                                    backgroundColor: "background.default",
                                    mt: 3,
                                    mb: 2,
                                }}>
                                <VisibilityOffOutlinedIcon color='primary' sx={{ fontSize: 40, mb: 1 }} />
                                <Typography color='text.secondary' sx={{ textAlign: "center" }}>
                                    Nenhuma seção está selecionada para exibição. Por favor, ative uma das opções acima
                                    para visualizar os cards.
                                </Typography>
                            </Grid>
                        )}
                </Box>

                <TemporaryDrawer
                    sx={{
                        "& .MuiDrawer-paperAnchorRight": {
                            width: isMobile ? "100%" : "42%",
                        },
                        "& .MuiModal-backdrop": {
                            backgroundColor: "rgb(0 0 0 / 30%)",
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
                    open={openDrawerReportCatalog}
                    title='Catálogo'
                    closeButton={async () => {
                        await confirm({
                            title: "Confirmação de Fechamento de Janela",
                            description: (
                                <>
                                    <Typography>
                                        Você tem certeza de que deseja fechar esta janela? Todas as informações
                                        preenchidas serão perdidas e não poderão ser recuperadas.
                                    </Typography>
                                </>
                            ),
                        })
                            .then(() => {
                                if (idReportCatalog) {
                                    setIdReportCatalog(undefined);
                                }

                                handleReportCatalog();
                            })
                            .catch(() => {});
                    }}>
                    <CatalogFields idReport={idReportCatalog} updateColumn={fetchDataCatalog} />
                </TemporaryDrawer>

                <BasicSpeedDial
                    ariaLabel='Opções'
                    title='Opções'
                    open={speedDialOpen}
                    onClick={() => setSpeedDialOpen((oldValue) => !oldValue)}
                    actions={[
                        ...(accessPermission.some((value) => value.group === "GROUP_ADMIN")
                            ? [
                                  {
                                      icon: <AddCircleOutlineOutlinedIcon color='action' />,
                                      name: "Criar Card",
                                      click_event: () => {
                                          setIdReportCatalog(undefined);
                                          handleReportCatalog();
                                      },
                                  },
                              ]
                            : []),
                        {
                            icon: <RefreshIcon color='action' />,
                            name: "Atualizar Catálogo",
                            click_event: () => {
                                fetchDataCatalog();
                                setSpeedDialOpen(false);
                                toast.success("O catálogo foi atualizado com sucesso!");
                            },
                        },
                    ]}
                    sx={{
                        position: "absolute",
                        bottom: 17,
                        right: 8,
                        "& .MuiSpeedDial-fab": {
                            width: "40px",
                            height: "40px",
                            boxShadow: "0 0 12px 1px #0096876f",
                        },
                    }}
                />
            </Grid>

            <Modal open={isModalDeleteOpen}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                    }}>
                    <Typography variant='h6' component='h2' mb={2}>
                        Deseja realmente apagar o Card?
                    </Typography>

                    {idReportCatalog && (
                        <Typography variant='body2' color='text.primary' fontWeight='bold' mb={2}>
                            {`Card: ${
                                [
                                    ...listCatalogDashboardsBI,
                                    ...listCatalogExternLinks,
                                    ...listCatalogInternalLinks,
                                ].find((card) => card.id === idReportCatalog)?.title || "Desconhecido"
                            }`}
                        </Typography>
                    )}

                    <Typography variant='body2' color='text.secondary' mb={2}>
                        O registro do card será excluído permanentemente! Para confirmar, digite{" "}
                        <strong>'DELETAR'</strong> no campo abaixo.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Digite 'DELETAR' para confirmar"
                        variant='outlined'
                        value={inputValueDelete}
                        onChange={(e) => setInputValueDelete(e.target.value)}
                        autoFocus
                        inputProps={{
                            style: { textTransform: "uppercase" },
                        }}
                        sx={{ "& fieldset": { borderRadius: "8px !important" }, mb: 2 }}
                    />
                    <Box display='flex' justifyContent='flex-end' gap={2}>
                        <Button onClick={handleCancelDelete} color='inherit'>
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirmDelete} color='error' variant='contained'>
                            Confirmar
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* <CSATFloatingButton
                title='Avalie este módulo'
                position='right-center'
                bgColor={isThemeLight ? "#c9d200" : "#49479d"}
                textColor={isThemeLight ? "#424601" : "#ffffff"}
                hasAlreadyRated={true}
                formProps={{
                    module: "Catálogo",
                    routePath: "/relatorios/catalogo",
                    context: "Botão Flutuante",
                }}
            /> */}
        </>
    );
}
