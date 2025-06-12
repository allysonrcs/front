import { useEffect, useMemo, useState } from "react";
import {
    Badge,
    Box,
    Breadcrumbs,
    Chip,
    Collapse,
    Grid,
    IconButton,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    DataGrid,
    GridColDef,
    GridToolbarColumnsButton,
    GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { BoxMain } from "@/components/Box/BoxMain";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";
import { useConfirm } from "material-ui-confirm";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { formatDate } from "@/functions/date";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { LoadingButton } from "@mui/lab";
import { ArrayTypesStatus } from "@/constants/array-status";
import {
    deleteCsatAssessmentsByID,
    ISearchCsatAssessments,
    searchAllCsatAssessments,
} from "@/services/csat-assessments";
import Rating from "@/components/Rating/Rating";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import BadgeAvatars from "@/components/AvatarWithBadge/AvatarWithBadge";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import moment from "moment";
import FormDatePicker from "@/components/FormComponents/FormDatePicker";
import { getBaseURL } from "@/functions/getBaseURL";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";
import { CSATAssessmentsFields } from "./CSATAssessmentsFields";
import { ECBasicOption } from "echarts/types/dist/shared";
import { Chart } from "@/components/Charts/ECharts/chart";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";
import { ChartsCSATAssessmentsRating } from "./charts/ChartsCSATAssessmentsRating";
import { searchAllAccessPermissionGroup } from "@/services/access-groups";
import { ChartsCSATAssessmentsTagsDistribution } from "./charts/ChartsCSATAssessmentsTagsDistribution";
import { searchAutoCompleteEmployees } from "@/services/employees";

type AutoCompleteString = {
    id: number;
    label: string;
};

type AutoCompleteNumber = {
    id: number;
    label: string;
};

type AutoCompleteEmployeeNumber = {
    id: number;
    label: string;
    id_user: number;
};

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

type CsatAssessmentsProps = {
    rating?: AutoCompleteNumber;
    is_active: AutoCompleteBoolean;
    module?: AutoCompleteString;
    route_path?: AutoCompleteString;
    date_start?: Date | null;
    date_end?: Date | null;
    collaborators?: AutoCompleteEmployeeNumber;
};

export type UpdateColumnCSATAssessments = {
    id: number;
    is_active: boolean;
};

type PermissionProps = {
    group: string;
};

const validationSchema = Yup.object().shape(
    {
        rating: Yup.object()
            .shape({
                id: Yup.number().nullable(),
                label: Yup.string().nullable(),
                id_user: Yup.number().nullable(),
            })
            .nullable(),
        is_active: Yup.object()
            .shape({
                id: Yup.boolean().nullable(),
                label: Yup.string().nullable(),
            })
            .nullable(),
        module: Yup.object()
            .shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            })
            .nullable(),
        route_path: Yup.object()
            .shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            })
            .nullable(),
        date_start: Yup.date()
            .nullable()
            .typeError("Digite uma data válida")
            .when(["date_end"], ([date_start], schema) =>
                moment(date_start).isValid() ? schema.required("Obrigatório") : schema,
            ),
        date_end: Yup.date()
            .nullable()
            .when("date_start", ([date_start], schema) =>
                moment(date_start).isValid()
                    ? schema.min(date_start, "Data Final deve ser maior que Data Inicial.")
                    : schema,
            )
            .typeError("Digite uma data válida")
            .when(["date_start"], ([date_start], schema) =>
                moment(date_start).isValid() ? schema.required("Obrigatório") : schema,
            ),
        collaborators: Yup.object()
            .shape({
                id: Yup.number().nullable(),
                label: Yup.string().nullable(),
            })
            .nullable(),
    },
    [["date_start", "date_end"]],
);

export function ListRecordsCSATAssessments() {
    const [loading, setLoading] = useState(false);
    const [listCsatAssessments, setListCsatAssessments] = useState<ISearchCsatAssessments[]>([]);
    const [dataCsatAssessments, setDataCsatAssessments] = useState<ISearchCsatAssessments | null>();
    const [autoCompleteEmployees, setAutoCompleteEmployees] = useState<AutoCompleteNumber[]>([]);
    const [accessPermission, setAccessPermission] = useState<PermissionProps[]>([]);
    const [openDrawerFilter, setOpenDrawerFilter] = useState(false);
    const [openDrawerCsatAssessments, setOpenDrawerCsatAssessments] = useState(false);
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);
    const [showCharts, setShowCharts] = useState<boolean>(false);
    //
    const [cachedModules, setCachedModules] = useState<string[]>([]);
    const [cachedRoutes, setCachedRoutes] = useState<string[]>([]);

    const {
        getInfoError,
        toggleStatusBackdrop,
        colorBorderSystem,
        colorBackgroundSystem,
        colorScrollSystem,
        theme: themeContext,
        redBlur,
        cyanBlur,
    } = useGlobal();
    const { device } = useMediaQuery();

    const theme = useTheme();

    const confirm = useConfirm();

    const {
        handleSubmit,
        reset,
        formState: { errors },
        control,
    } = useForm<CsatAssessmentsProps | any>({
        resolver: yupResolver(validationSchema),
    });

    const isThemeLight = themeContext === "light";

    const handleOpenDrawerCsatAssessments = () => {
        setOpenDrawerCsatAssessments((oldValue) => !oldValue);
    };

    const handleFilterPanelCooperated = () => {
        setOpenDrawerFilter((oldValue) => !oldValue);
        setSpeedDialOpen(true);
    };

    const handleRemoveCsatAssessments = (id_csat_accessments: number) => {
        confirm({
            title: `Deseja realmente apagar o registro?`,
            description:
                "O registro de avaliação será removido e irá afetar a contagem de avaliações do módulo em que foi avaliado.",
        })
            .then(async () => {
                try {
                    await deleteCsatAssessmentsByID(id_csat_accessments);
                    setListCsatAssessments((prev) =>
                        prev.filter((csat_assessment) => csat_assessment.id !== id_csat_accessments),
                    );
                    toast.success(`Registro de Avaliação foi removido com sucesso!`);
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                }
            })
            .catch(() => {});
    };

    const updateColumn = (csatAssessments: UpdateColumnCSATAssessments) => {
        const data = listCsatAssessments.map((item) => {
            return item.id === csatAssessments.id ? { ...item, ...csatAssessments } : item;
        });
        setListCsatAssessments(data);
    };

    const onSubmit = async (params: CsatAssessmentsProps) => {
        let refactor = {};

        if (params.rating) {
            refactor = { ...refactor, rating: params.rating?.id };
        }

        if (params.module) {
            refactor = { ...refactor, module: params.module?.id };
        }

        if (params.route_path) {
            refactor = { ...refactor, route_path: params.route_path?.id };
        }

        if (params.date_start) {
            refactor = {
                ...refactor,
                date_start: params.date_start ? moment(params.date_start).format("YYYY-MM-DD") : "",
            };
        }

        if (params.date_end) {
            refactor = { ...refactor, date_end: params.date_end ? moment(params.date_end).format("YYYY-MM-DD") : "" };
        }

        if (params.is_active) {
            refactor = { ...refactor, is_active: params.is_active?.id };
        }

        if (params.collaborators && Object.keys(params.collaborators).length > 0) {
            refactor = { ...refactor, id_user_by_evaluation: params.collaborators?.id_user };
        }

        try {
            setLoading(true);
            const listCsatAssessments = await searchAllCsatAssessments(refactor);

            setListCsatAssessments(listCsatAssessments);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 1250);
        }
    };

    const ratingDistribution = listCsatAssessments.reduce(
        (acc, item) => {
            const rating = item.rating;
            acc[rating] = (acc[rating] || 0) + 1;
            return acc;
        },
        {} as Record<number, number>,
    );

    const moduleDistribution = listCsatAssessments.reduce(
        (acc, item) => {
            const module = item.module;
            acc[module] = (acc[module] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    const moduleOptions: ECBasicOption = {
        title: { text: "Distribuição dos Módulos", left: "center" },
        tooltip: {
            trigger: "item",
            position: "right",
            formatter: (params: any) =>
                `${params.marker} ${params.name}: ${params.value} avaliações (${params.percent}%)`,
            textStyle: {
                color: isThemeLight ? "#011216" : "#ffffff",
            },
            backgroundColor: isThemeLight ? "#ffffff" : "#00161b",
        },
        series: [
            {
                type: "pie",
                radius: ["30%", "55%"],
                data: Object.entries(moduleDistribution).map(([key, value]) => ({
                    name: key,
                    value,
                })),
            },
        ],
    };

    const dateDistribution = listCsatAssessments.reduce(
        (acc, item) => {
            const date = item.created_at ? item.created_at.substring(0, 10) : "Sem Data";
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    const datesSorted = Object.keys(dateDistribution).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const dateOptions: ECBasicOption = {
        title: { text: "Avaliações por Data", left: "center" },
        tooltip: {
            trigger: "axis",
            formatter: (params: any) =>
                params.map((item: any) => `${item.marker} ${item.name}: ${item.value} avaliações`).join("<br>"),
            textStyle: {
                color: isThemeLight ? "#011216" : "#ffffff",
            },
            backgroundColor: isThemeLight ? "#ffffff" : "#00161b",
        },
        grid: {
            left: "2.5%",
            right: "2.5%",
        },
        xAxis: {
            type: "category",
            data: datesSorted,
            axisLabel: {
                rotate: 45,
                formatter: (value: string) => moment(value).format("DD/MM"),
            },
            splitLine: { show: false },
        },
        yAxis: {
            type: "value",
            name: "Avaliações",
            splitLine: { show: false },
        },
        series: [
            {
                type: "line",
                smooth: true,
                data: datesSorted.map((date) => dateDistribution[date]),
                symbol: "circle",
                symbolSize: 8,
                lineStyle: {
                    width: 3,
                    color: "#009688",
                },
                markLine: {
                    data: [{ type: "average", name: "Média" }],
                },
                label: {
                    show: true,
                    position: "top",
                    fontWeight: "bold",
                    color: "#009688",
                },
                connectNulls: true,
                itemStyle: {
                    color: "#0da797 ",
                    borderColor: "#088578",
                    borderWidth: 1,
                },
                areaStyle: {
                    color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: "#03534b7b" },
                            { offset: 1, color: "#03534b13" },
                        ],
                    },
                },
            },
        ],
    };

    useEffect(() => {
        async function execute() {
            try {
                toggleStatusBackdrop();

                const [dataUserPermission, listCsatAssessments, autoCompleteEmployees] = await Promise.all([
                    searchAllAccessPermissionGroup(),
                    searchAllCsatAssessments({}),
                    searchAutoCompleteEmployees({
                        is_active: true,
                    }),
                ]);

                setAccessPermission(dataUserPermission);
                setListCsatAssessments(listCsatAssessments);

                const refEmployees = autoCompleteEmployees.map(({ id, name, id_user }) => {
                    return { id: id, label: name, id_user: id_user };
                });

                setAutoCompleteEmployees(refEmployees);
            } catch (error) {
                const { message } = await getInfoError(error);
                toast.error(message);
            } finally {
                toggleStatusBackdrop();
            }
        }

        execute();
    }, []);

    const isGroupAdminAccess = accessPermission.some((value) => value.group === "GROUP_ADMIN");

    const QuickSearchToolbar = () => {
        return (
            <Grid sx={{ p: 2, display: "flex", justifyContent: "space-between", mb: -2 }}>
                <Grid>
                    <GridToolbarColumnsButton />
                    <GridToolbarFilterButton />
                    {isGroupAdminAccess && <GridToolbarExport />}
                </Grid>

                <GridToolbarQuickFilter placeholder='Digite para pesquisar' />
            </Grid>
        );
    };

    useEffect(() => {
        if (!listCsatAssessments || !listCsatAssessments.length) return;

        setCachedModules((prev) =>
            Array.from(new Set([...prev, ...listCsatAssessments.map((item) => item.module)].filter(Boolean))),
        );

        setCachedRoutes((prev) =>
            Array.from(new Set([...prev, ...listCsatAssessments.map((item) => item.route_path || "")].filter(Boolean))),
        );
    }, [listCsatAssessments]);

    const autoCompleteModulesOptions = useMemo(() => {
        return cachedModules
            .sort((a, b) => (a || "").localeCompare(b || ""))
            .map((module) => ({
                id: module,
                label: module,
            }));
    }, [cachedModules]);

    const autoCompleteRoutesOptions = useMemo(() => {
        return cachedRoutes
            .sort((a, b) => (a || "").localeCompare(b || ""))
            .map((route) => ({
                id: route,
                label: route,
            }));
    }, [cachedRoutes]);

    const columns: GridColDef[] = [
        {
            field: "Opções",
            width: isGroupAdminAccess ? 92 : 65,
            headerAlign: "center",
            align: "center",
            renderCell: (cellValues) => {
                return (
                    <Stack direction='row' spacing={0.25}>
                        <IconButton
                            onClick={(event) => {
                                event.stopPropagation();
                                setDataCsatAssessments(cellValues.row);
                                handleOpenDrawerCsatAssessments();
                            }}
                            color='success'
                            title={isGroupAdminAccess ? "Editar" : "Visualizar"}
                            aria-label='Editar registro'>
                            {isGroupAdminAccess ? <EditIcon /> : <VisibilityOutlinedIcon />}
                        </IconButton>
                        {isGroupAdminAccess && (
                            <IconButton
                                onClick={() => handleRemoveCsatAssessments(cellValues.row.id)}
                                color='error'
                                title='Excluir'
                                aria-label='Excluir registro'>
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </Stack>
                );
            },
        },
        {
            field: "is_active",
            headerName: "Situação",
            headerAlign: "center",
            align: "center",
            minWidth: 80,
            renderCell: ({ value }) => {
                return <Typography>{value ? "🟢 Ativo" : "🔴 Inativo"}</Typography>;
            },
        },
        {
            field: "rating",
            headerName: "Avaliação",
            headerAlign: "center",
            align: "center",
            minWidth: 145,
            flex: 1,
            renderCell: ({ value }) => {
                return <Rating readOnly value={Number(value)} />;
            },
        },
        {
            field: "module",
            headerName: "Módulo",
            minWidth: 165,
        },
        {
            field: "selected_tags",
            headerName: "Opções",
            headerAlign: "center",
            minWidth: 350,
            flex: 1,
            sortable: false,
            renderCell: (cellValues) => {
                const tags: string[] = cellValues.value?.split(";").filter((tag: string) => tag.trim()) || [];

                const colorAndSelectRating =
                    cellValues.row.rating && cellValues.row.rating <= 3
                        ? theme.palette.info.main
                        : cellValues.row.rating === 4
                          ? theme.palette.warning.main
                          : theme.palette.primary.main;

                return (
                    <Box
                        display='flex'
                        flexWrap='wrap'
                        gap={0.5}
                        sx={{
                            py: 0.35,
                            maxWidth: "100%",
                            overflow: "hidden",
                            wordWrap: "break-word",
                        }}>
                        {tags.map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag}
                                variant='outlined'
                                size='small'
                                sx={{
                                    maxWidth: "100%",
                                    whiteSpace: "normal",
                                    lineHeight: 1,
                                    fontSize: "0.70rem",
                                    color: isThemeLight ? colorAndSelectRating : "white",
                                    backgroundColor: isThemeLight ? "none" : `${colorAndSelectRating}7d`,
                                    borderColor: colorAndSelectRating,
                                }}
                            />
                        ))}
                    </Box>
                );
            },
        },
        {
            field: "description",
            headerName: "Descrição",
            minWidth: 140,
        },

        {
            field: "route_path",
            headerName: "Localização",
            minWidth: 220,
        },
        {
            field: "context",
            headerName: "Contexto",
            minWidth: 135,
        },
        {
            field: "user_avatar_created",
            headerName: "Avatar",
            headerAlign: "center",
            width: 70,
            align: "center",
            disableExport: true,
            renderCell: ({ value, row }) => {
                const imageProfileURL = value ? getBaseURL() + value : undefined;

                return (
                    <Grid container justifyContent={"center"}>
                        <Box mt={1} mb={1}>
                            <BadgeAvatars
                                user={{ name: row.user_name_created, url_image_profile: imageProfileURL }}
                                type='dot'
                                status={row.socket_status}
                            />
                        </Box>
                    </Grid>
                );
            },
        },
        {
            field: "user_name_created",
            headerName: "Avaliado por",
            minWidth: 180,
        },
        {
            field: "agency_name_created",
            headerName: "Agência do Usuário",
            minWidth: 180,
        },
        {
            field: "portfolio_name_created",
            headerName: "Carteira do Usuário",
            minWidth: 180,
        },
        {
            field: "created_at",
            headerName: "Data Cadastro",
            headerAlign: "center",
            align: "center",
            minWidth: 165,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY HH:mm:ss")}</Typography>;
            },
        },
        {
            field: "updated_at",
            headerName: "Data Atualização",
            headerAlign: "center",
            align: "center",
            minWidth: 165,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatDate(value, "DD/MM/YYYY HH:mm:ss") : "-"}
                    </Typography>
                );
            },
        },
    ];

    return (
        <>
            <Grid container spacing={1} justifyContent='center' paddingInline={2} mt={0} mb={0.75} wrap='wrap'>
                <Grid item xs={12} md={12}>
                    <Breadcrumbs aria-label='breadcrumb' separator='›'>
                        <Typography color='text.primary' sx={{ display: "inline-flex", alignItems: "center" }} pt={1}>
                            <StarBorderRoundedIcon sx={{ color: isThemeLight ? "#5e5e5e" : "#FFFFFF", mr: 0.5 }} />{" "}
                            Relatórios
                        </Typography>
                        <Typography sx={{ color: "text.secondary" }}>Avaliações CSAT</Typography>
                    </Breadcrumbs>
                </Grid>
            </Grid>

            <BoxMain isDivider={false} mt={0}>
                <Grid container spacing={0.5}>
                    <Grid item xs={12} md={3.5}>
                        <ChartsCSATAssessmentsRating
                            distribution={ratingDistribution}
                            total={listCsatAssessments.length}
                        />
                    </Grid>
                    <Grid item xs={12} md={8.5}>
                        <ChartsCSATAssessmentsTagsDistribution data={listCsatAssessments} />
                    </Grid>
                </Grid>

                <Box display='flex' justifyContent='flex-end' mb={2}>
                    <Tooltip title={showCharts ? "Ocultar Gráficos Detalhados" : "Exibir Gráficos Detalhados"}>
                        <IconButton
                            size='small'
                            onClick={() => setShowCharts((prev) => !prev)}
                            sx={{ textTransform: "none", zIndex: 10, border: `1px solid ${colorBorderSystem}` }}>
                            {showCharts ? <ExpandLessIcon color='primary' /> : <ExpandMoreIcon color='primary' />}
                        </IconButton>
                    </Tooltip>
                </Box>

                <Collapse in={showCharts} timeout='auto' unmountOnExit>
                    <Grid container spacing={0.5} mb={3} mt={-4}>
                        <Grid item xs={12} md={2.5}>
                            <Chart options={moduleOptions} height={250} />
                        </Grid>
                        <Grid item xs={12} md={9.5}>
                            <Chart options={dateOptions} height={250} />
                        </Grid>
                    </Grid>
                </Collapse>

                <Box sx={{ position: "relative" }} mt={showCharts ? -3 : 0}>
                    <DataGrid
                        autoHeight
                        rows={listCsatAssessments}
                        columns={columns}
                        density='comfortable'
                        localeText={dataGridLocaleTextTranslateFull}
                        getRowHeight={(params) => {
                            const tags: string[] =
                                params.model.selected_tags?.split(";").filter((tag: string) => tag.trim()) || [];
                            const tagCount = tags.length;
                            if (tagCount === 0) return undefined;
                            const estimatedLines = Math.ceil(tagCount / 3);
                            return 40 + estimatedLines * 25;
                        }}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 10,
                                },
                            },
                        }}
                        slots={{
                            toolbar: QuickSearchToolbar,
                            pagination: CustomPagination,
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
                                    backgroundColor: isThemeLight ? "#ffffff" : "#1F3D44",
                                },
                            },
                        }}
                        pageSizeOptions={[5, 10, 20, 30, 50, 100]}
                        sx={getDataGridStyles(colorBorderSystem, colorScrollSystem)}
                    />
                </Box>

                <TemporaryDrawer
                    title='Avaliação CSAT'
                    open={openDrawerCsatAssessments}
                    onClose={handleOpenDrawerCsatAssessments}
                    disableEscapeKeyDown={false}
                    closeButton={handleOpenDrawerCsatAssessments}
                    sx={{
                        "& .MuiDrawer-paperAnchorRight": {
                            width: device === "Mobile" ? "100%" : "500px",
                        },
                        "& .MuiModal-backdrop": {
                            backgroundColor: "rgb(0 0 0 / 30%)",
                        },
                        "& .MuiDrawer-paper": {
                            background: colorBackgroundSystem,
                            borderLeft: `1px solid ${colorBorderSystem}`,
                            backdropFilter: "blur(25px)",
                            backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                            backgroundRepeat: "no-repeat, no-repeat",
                            backgroundSize: "50%, 50%",
                            backgroundPosition: "right top, left bottom",
                        },
                    }}>
                    {dataCsatAssessments && dataCsatAssessments ? (
                        <CSATAssessmentsFields
                            dataCSATAssessments={dataCsatAssessments}
                            isGroupAdmin={isGroupAdminAccess}
                            updateColumn={updateColumn}
                            p={3}
                        />
                    ) : (
                        <Typography>Carregando...</Typography>
                    )}
                </TemporaryDrawer>

                <TemporaryDrawer
                    title='Filtro Listagem'
                    closeButton={handleFilterPanelCooperated}
                    onClose={handleFilterPanelCooperated}
                    disableEscapeKeyDown={false}
                    open={openDrawerFilter}
                    sx={{
                        "& .MuiDrawer-paperAnchorRight": {
                            width: device === "Mobile" ? "100%" : "40%",
                        },
                        "& .MuiModal-backdrop": {
                            backgroundColor: "rgb(0 0 0 / 30%)",
                        },
                        "& .MuiDrawer-paper": {
                            background: colorBackgroundSystem,
                            borderLeft: `1px solid ${colorBorderSystem}`,
                            backdropFilter: "blur(25px)",
                            backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                            backgroundRepeat: "no-repeat, no-repeat",
                            backgroundSize: "50%, 50%",
                            backgroundPosition: "right top, left bottom",
                        },
                    }}>
                    <Box
                        margin={2}
                        padding={3}
                        mt={-1}
                        flexDirection='column'
                        sx={{ border: `1px dashed ${colorBorderSystem}`, borderRadius: 4 }}
                        gap={1}>
                        <Grid
                            container
                            component={"form"}
                            direction='row'
                            spacing={2}
                            onSubmit={handleSubmit(onSubmit)}>
                            <Grid item xs={12} md={6}>
                                <FormAutocomplete
                                    fullWidth
                                    name='rating'
                                    label='Avaliação'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                    options={[
                                        { id: 1, label: "⭐" },
                                        { id: 2, label: "⭐⭐" },
                                        { id: 3, label: "⭐⭐⭐" },
                                        { id: 4, label: "⭐⭐⭐⭐" },
                                        { id: 5, label: "⭐⭐⭐⭐⭐" },
                                    ]}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormAutocomplete
                                    fullWidth
                                    name='is_active'
                                    label='Situação'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                    options={ArrayTypesStatus}
                                />
                            </Grid>

                            <Grid item xs={12} md={12}>
                                <FormAutocomplete
                                    fullWidth
                                    name='module'
                                    label='Módulo'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                    options={autoCompleteModulesOptions}
                                />
                            </Grid>

                            <Grid item xs={12} md={12}>
                                <FormAutocomplete
                                    fullWidth
                                    name='route_path'
                                    label='Rota'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                    options={autoCompleteRoutesOptions}
                                />
                            </Grid>

                            {isGroupAdminAccess && (
                                <Grid item xs={12} md={12}>
                                    <FormAutocomplete
                                        fullWidth
                                        name='collaborators'
                                        label='Avaliado por'
                                        variant='outlined'
                                        size='medium'
                                        control={control}
                                        errors={errors}
                                        options={autoCompleteEmployees}
                                    />
                                </Grid>
                            )}

                            <Grid item xs={6} md={6}>
                                <FormDatePicker
                                    fullWidth
                                    name='date_start'
                                    label='Data Avaliação - Min'
                                    variant='outlined'
                                    size='medium'
                                    maxDate={String(new Date())}
                                    control={control}
                                    errors={errors}
                                />
                            </Grid>

                            <Grid item xs={6} md={6}>
                                <FormDatePicker
                                    fullWidth
                                    name='date_end'
                                    label='Data Avaliação - Max'
                                    variant='outlined'
                                    size='medium'
                                    maxDate={String(new Date())}
                                    control={control}
                                    errors={errors}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <LoadingButton
                                    fullWidth
                                    type='submit'
                                    color='success'
                                    loadingPosition='start'
                                    size='large'
                                    variant='contained'
                                    startIcon={<SearchIcon />}
                                    loading={loading}
                                    sx={{ boxShadow: "none" }}>
                                    Pesquisar
                                </LoadingButton>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <LoadingButton
                                    fullWidth
                                    type='reset'
                                    color='primary'
                                    loadingPosition='start'
                                    size='large'
                                    variant='contained'
                                    startIcon={<SearchOffIcon />}
                                    loading={loading}
                                    sx={{ boxShadow: "none" }}
                                    onClick={() => {
                                        reset({
                                            rating: null,
                                            is_active: null,
                                            module: null,
                                            route_path: null,
                                            date_start: null,
                                            date_end: null,
                                            collaborators: null,
                                        });
                                    }}>
                                    Limpar Filtros
                                </LoadingButton>
                            </Grid>
                        </Grid>
                    </Box>
                </TemporaryDrawer>

                <BasicSpeedDial
                    ariaLabel='Opções'
                    title='Opções'
                    open={speedDialOpen}
                    onClick={() => setSpeedDialOpen((oldValue) => !oldValue)}
                    actions={[
                        {
                            icon: (
                                <Badge
                                    color='primary'
                                    // badgeContent={
                                    //     Object.values(filters).filter((value) => {
                                    //         if (Array.isArray(value)) {
                                    //             return value.length > 0;
                                    //         }
                                    //         return value !== undefined && value !== null && value !== "";
                                    //     }).length || null
                                    // }
                                    max={100}>
                                    <FilterAltOutlinedIcon color='action' />
                                </Badge>
                            ),
                            name: "Filtros",
                            click_event: () => {
                                handleFilterPanelCooperated();
                            },
                        },
                    ]}
                    sx={{
                        zIndex: 9999,
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
            </BoxMain>
        </>
    );
}
