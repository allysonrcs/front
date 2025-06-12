import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton } from "@mui/lab";
import {
    Badge,
    Box,
    Breadcrumbs,
    Card,
    CardContent,
    Chip,
    Grid,
    Icon,
    IconButton,
    Link,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import {
    DataGrid,
    GridColDef,
    GridToolbarColumnsButton,
    GridToolbarDensitySelector,
    GridToolbarFilterButton,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { toast } from "react-toastify";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { useGlobal } from "@/contexts/GlobalContext";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { formatDate } from "@/functions/date";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import StackedBarChartOutlinedIcon from "@mui/icons-material/StackedBarChartOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import { Link as LinkRouter } from "react-router-dom";
import { formatCpfHidden, formatNumberWithThousandsSeparator } from "@/functions/number";
import {
    IListSurveyRH,
    ISearchAllReportsCatalog,
    searchAllReportsCatalogRecords,
    searchReportsCatalogPanelSurveyRH,
} from "@/services/reports";
import FormAutocompleteMultiple from "@/components/FormComponents/FormAutocompleteMultiple";
import FormInputCpfCnpj from "@/components/FormComponents/FormInputCpfCnpj";
import { ArrayTypesAgenciesName } from "@/constants/array-type-agencies";
import { useAuth } from "@/contexts/AuthContext";
import { ArrayTypesYesOrNo } from "@/constants/array-type-yes-or-no";
import { ArrayTypesStatus } from "@/constants/array-status";
import { IAutocompleteSector, searchAutocompleteSector } from "@/services/sectors";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";
import { ArrayTypesSurveyRHPortfolios } from "@/constants/array-type-survey-rh-portfolios";
import { CSATAverageRating } from "@/components/CSATAssessments/CSATAverageRating";

type AutoCompleteString = {
    id: string;
    label: string;
};

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

export type BusinessPanelSurveyRHProps = {
    filter_employee_agencies?: AutoCompleteString[];
    filter_employee_portfolio?: AutoCompleteString[];
    filter_employee_sectors?: AutoCompleteString[];
    filter_employee_does_clock_in?: AutoCompleteBoolean;
    filter_employee_paired_point?: AutoCompleteBoolean;
    filter_employee_is_training?: AutoCompleteBoolean;
    filter_employee_date_moviment?: AutoCompleteString[];
    filter_employee_is_active?: AutoCompleteBoolean;
    filter_employee_document?: string | null;
};

interface Filters {
    filter_employee_agencies?: string[];
    filter_employee_portfolio?: string[];
    filter_employee_sectors?: string[];
    filter_employee_does_clock_in?: string;
    filter_employee_paired_point?: string;
    filter_employee_is_training?: string;
    filter_employee_date_moviment?: string[];
    filter_employee_is_active?: string;
    filter_employee_document?: string;
}

interface FilterAppliedProps {
    filters: Filters;
    clearAllFilters: () => void;
    removeFilter: (key: keyof Filters) => void;
}

const validationSchema = Yup.object().shape({
    filter_employee_agencies: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_employee_portfolio: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_employee_sectors: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_employee_does_clock_in: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_employee_paired_point: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_employee_is_training: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_employee_date_moviment: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_employee_is_active: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_employee_document: Yup.string().max(18, "Máximo 18 caracteres").trim().nullable(),
});

export function BusinessPanelSurveyRH() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [listPanelSurveyRH, setListPanelSurveyRH] = useState<IListSurveyRH[]>([]);
    const [originalListPanelSurveyRH, setOriginalListPanelSurveyRH] = useState<IListSurveyRH[]>([]);
    const [movimentDatePanelSurveyRH, setMovimentDatePanelSurveyRH] = useState<string>();
    const [listMovimentDatePanelSurveyRH, setListMovimentDatePanelSurveyRH] = useState<string[]>([]);
    const [listArraySectors, setListArraySectors] = useState<IAutocompleteSector[]>([]);
    const [dataPanelSurveyRH, setdataPanelSurveyRH] = useState<ISearchAllReportsCatalog>();
    const [openDrawerFilter, setOpenDrawerFilter] = useState(false);
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);

    const {
        getInfoError,
        toggleStatusBackdrop,
        theme,
        colorBorderSystem,
        colorBackgroundSystem,
        colorScrollSystem,
        colorBoxShadowSystem,
        redBlur,
        cyanBlur,
    } = useGlobal();
    const navigate = useNavigate();

    const themeBreakPoint = useTheme();
    const isMobile = useMediaQuery(themeBreakPoint.breakpoints.down("sm"));
    const isThemeLight = theme === "light";

    const location = useLocation();
    const currentPath = location.pathname;

    const {
        control,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<BusinessPanelSurveyRHProps | any>({
        resolver: yupResolver(validationSchema),
    });

    const filterEmployeeAgenciesWatch = watch("filter_employee_agencies");
    const filterEmployeePortfolioWatch = watch("filter_employee_portfolio");
    const filterEmployeeSectorsWatch = watch("filter_employee_sectors");
    const filterEmployeeDoesClockInWatch = watch("filter_employee_does_clock_in");
    const filterEmployeePairedPointWatch = watch("filter_employee_paired_point");
    const filterEmployeeIsTrainingWatch = watch("filter_employee_is_training");
    const filterEmployeeDateMovimentWatch = watch("filter_employee_date_moviment");
    const filterEmployeeIsActiveWatch = watch("filter_employee_is_active");
    const filterEmployeeDocumentWatch = watch("filter_employee_document");

    useEffect(() => {
        const fetchData = async () => {
            try {
                toggleStatusBackdrop();
                setLoading(true);

                const [responseCatalogPanel, responseAllReports, responseListSectors] = await Promise.all([
                    searchReportsCatalogPanelSurveyRH({}),
                    searchAllReportsCatalogRecords({ route: currentPath }),
                    searchAutocompleteSector({ is_active: true }),
                ]);

                const { levantamento_rh, data_movimento, lista_data_movimento } = responseCatalogPanel;
                const dataPanelSurveyRH = responseAllReports[0];

                const uniqueListSectors = Array.from(
                    new Map(responseListSectors.map((item) => [item.name, item])).values(),
                );

                setOriginalListPanelSurveyRH(levantamento_rh);
                setListPanelSurveyRH(levantamento_rh);

                setMovimentDatePanelSurveyRH(data_movimento);
                setdataPanelSurveyRH(dataPanelSurveyRH);

                setListMovimentDatePanelSurveyRH(lista_data_movimento);

                setListArraySectors(uniqueListSectors);
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                setLoading(false);
                toggleStatusBackdrop();
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (user) {
            const userAgencyId = user.agency_sisbr_id;
            const userPortfolioName = user?.portfolio_name?.toLocaleUpperCase();

            if (userAgencyId && ![9999].includes(userAgencyId)) {
                const selectedAgency = ArrayTypesAgenciesName.find((agency) => agency.ref_id === userAgencyId);

                if (selectedAgency) {
                    setValue("filter_employee_agencies", [
                        { id: selectedAgency.id, label: selectedAgency.label, ref_id: selectedAgency.ref_id },
                    ]);
                }
            }

            if (listMovimentDatePanelSurveyRH.length > 0) {
                const latestDate = new Date(
                    Math.max(...listMovimentDatePanelSurveyRH.map((date) => new Date(date).getTime())),
                );

                setValue("filter_employee_date_moviment", [
                    {
                        id: latestDate.toISOString().split("T")[0],
                        label: latestDate.toLocaleDateString("pt-BR", { timeZone: "UTC" }),
                    },
                ]);

                setValue("filter_employee_is_active", {
                    id: true,
                    label: "🟢 Ativo(a)",
                });
            }
        }
    }, [dataPanelSurveyRH]);

    const handleFilterPanelSurveyRH = () => {
        setOpenDrawerFilter((oldValue) => !oldValue);
        setSpeedDialOpen(true);
    };

    const QuickSearchToolbar = () => {
        return (
            <Grid
                container
                sx={{
                    p: 1.5,
                    display: "flex",
                    justifyContent: isMobile ? "center" : "space-between",
                    alignItems: "center",
                }}>
                {!isMobile && (
                    <Grid>
                        <GridToolbarColumnsButton />
                        <GridToolbarFilterButton />
                        <GridToolbarDensitySelector />
                    </Grid>
                )}

                <Grid
                    item
                    sx={{
                        flex: isMobile ? 1 : "none",
                        maxWidth: isMobile ? "100%" : "auto",
                    }}>
                    <GridToolbarQuickFilter placeholder='Digite para pesquisar' fullWidth={isMobile} />
                </Grid>
            </Grid>
        );
    };

    const applyFilters = (filters: Filters) => {
        const filteredData = originalListPanelSurveyRH.filter((item) => {
            return (
                (!filters.filter_employee_agencies ||
                    filters.filter_employee_agencies.length === 0 ||
                    filters.filter_employee_agencies.some((selected) => item.sing_nome_agencia === selected)) &&
                (!filters.filter_employee_portfolio ||
                    filters.filter_employee_portfolio.length === 0 ||
                    filters.filter_employee_portfolio.some((selected) => item.carteira_nome === selected)) &&
                (!filters.filter_employee_sectors ||
                    filters.filter_employee_sectors.length === 0 ||
                    filters.filter_employee_sectors.some((selected) => item.sing_nome_setor === selected)) &&
                (filters.filter_employee_does_clock_in === null ||
                    item.bate_ponto === Boolean(filters.filter_employee_does_clock_in)) &&
                (filters.filter_employee_paired_point === null ||
                    item.batidas_pares === Boolean(filters.filter_employee_paired_point)) &&
                (filters.filter_employee_is_training === null ||
                    item.treinamento === Boolean(filters.filter_employee_is_training)) &&
                (filters.filter_employee_is_active === null ||
                    item.sing_situacao_colaborador === Boolean(filters.filter_employee_is_active)) &&
                (!filters.filter_employee_date_moviment ||
                    filters.filter_employee_date_moviment.length === 0 ||
                    filters.filter_employee_date_moviment.some(
                        (selected) => new Date(item.data_movimento).toISOString().split("T")[0] === selected,
                    )) &&
                (!filters.filter_employee_document ||
                    String(item.funcionario_documento).includes(
                        String(filters.filter_employee_document.replace(/[\.\-\/]/g, "")),
                    ))
            );
        });

        setListPanelSurveyRH(filteredData);
    };

    useEffect(() => {
        const filtersWatch = {
            filter_employee_agencies: filterEmployeeAgenciesWatch?.map((item: { label: string }) => item.label) || [],
            filter_employee_portfolio: filterEmployeePortfolioWatch?.map((item: { label: string }) => item.label) || [],
            filter_employee_sectors: filterEmployeeSectorsWatch?.map((item: { label: string }) => item.label) || [],
            filter_employee_does_clock_in:
                filterEmployeeDoesClockInWatch?.id !== undefined ? filterEmployeeDoesClockInWatch?.id : null,
            filter_employee_paired_point:
                filterEmployeePairedPointWatch?.id !== undefined ? filterEmployeePairedPointWatch?.id : null,
            filter_employee_is_training:
                filterEmployeeIsTrainingWatch?.id !== undefined ? filterEmployeeIsTrainingWatch?.id : null,
            filter_employee_date_moviment:
                filterEmployeeDateMovimentWatch?.map((item: { id: string }) => item.id) || [],
            filter_employee_is_active:
                filterEmployeeIsActiveWatch?.id !== undefined ? filterEmployeeIsActiveWatch?.id : null,
            filter_employee_document: filterEmployeeDocumentWatch || null,
        };

        applyFilters(filtersWatch);
    }, [
        filterEmployeeAgenciesWatch,
        filterEmployeePortfolioWatch,
        filterEmployeeSectorsWatch,
        filterEmployeeDoesClockInWatch,
        filterEmployeePairedPointWatch,
        filterEmployeeIsTrainingWatch,
        filterEmployeeDateMovimentWatch,
        filterEmployeeIsActiveWatch,
        filterEmployeeDocumentWatch,
    ]);

    const filters = {
        filter_employee_agencies: filterEmployeeAgenciesWatch?.map((item: { label: string }) => item.label) || [],
        filter_employee_portfolio: filterEmployeePortfolioWatch?.map((item: { label: string }) => item.label) || [],
        filter_employee_sectors: filterEmployeeSectorsWatch?.map((item: { label: string }) => item.label) || [],
        filter_employee_does_clock_in: filterEmployeeDoesClockInWatch?.label,
        filter_employee_paired_point: filterEmployeePairedPointWatch?.label,
        filter_employee_is_training: filterEmployeeIsTrainingWatch?.label,
        filter_employee_date_moviment:
            filterEmployeeDateMovimentWatch?.map((item: { label: string }) => item.label) || [],
        filter_employee_is_active: filterEmployeeIsActiveWatch?.label,
        filter_employee_document: filterEmployeeDocumentWatch,
    };

    const labelsMap = {
        filter_employee_agencies: "Agência(s)",
        filter_employee_portfolio: "Carteira(s)",
        filter_employee_sectors: "Setor(es)",
        filter_employee_does_clock_in: "Bate Ponto",
        filter_employee_paired_point: "Pendência de Ponto",
        filter_employee_is_training: "Pendência de Treinamento",
        filter_employee_date_moviment: "Data Movimento",
        filter_employee_is_active: "Situação",
        filter_employee_document: "CPF/CNPJ",
    };

    const clearAllFilters = () => {
        reset({
            filter_employee_agencies: [],
            filter_employee_portfolio: [],
            filter_employee_sectors: [],
            filter_employee_does_clock_in: null,
            filter_employee_paired_point: null,
            filter_employee_is_training: null,
            filter_employee_date_moviment: [],
            filter_employee_is_active: null,
            filter_employee_document: null,
        });
    };

    const removeFilter = (key: keyof Filters) => {
        const currentValue = watch(key);

        if (Array.isArray(currentValue)) {
            setValue(key, []);
        } else {
            setValue(key, null);
        }

        watch(key);
    };

    const FilterApplied = ({ filters, clearAllFilters, removeFilter }: FilterAppliedProps) => {
        const hasActiveFilters = Object.values(filters).some(
            (value) => value !== undefined && value !== null && value.length > 0,
        );

        if (!hasActiveFilters) {
            return null;
        }

        return (
            <Stack direction='row' alignItems='center' flexWrap='wrap' gap={1}>
                {Object.entries(filters).map(([key, value]) => {
                    if (Array.isArray(value) && value.length > 0) {
                        const displayValue = value.join(", ");

                        return (
                            <Chip
                                key={key}
                                label={
                                    <>
                                        <Typography
                                            component='span'
                                            fontSize={14}
                                            color={theme === "light" ? "info" : "primary"}>
                                            {labelsMap[key as keyof typeof labelsMap]}:
                                        </Typography>
                                        <Typography
                                            component='span'
                                            fontSize={14}
                                            color={theme === "light" ? "text.secondary" : "text.primary"}
                                            ml={0.5}>
                                            {displayValue}
                                        </Typography>
                                    </>
                                }
                                onDelete={() => {
                                    removeFilter(key as keyof Filters);
                                }}
                                color={theme === "light" ? "info" : "primary"}
                                variant={theme === "light" ? "outlined" : "outlined"}
                            />
                        );
                    }

                    if (value !== undefined && value !== null && value.length > 0) {
                        return (
                            <Chip
                                key={key}
                                label={
                                    <>
                                        <Typography
                                            component='span'
                                            fontSize={14}
                                            color={theme === "light" ? "info" : "primary"}>
                                            {labelsMap[key as keyof typeof labelsMap]}:
                                        </Typography>
                                        <Typography
                                            component='span'
                                            fontSize={14}
                                            color={theme === "light" ? "text.secondary" : "text.primary"}
                                            ml={0.5}>
                                            {value}
                                        </Typography>
                                    </>
                                }
                                onDelete={() => {
                                    removeFilter(key as keyof Filters);
                                }}
                                color={theme === "light" ? "info" : "primary"}
                                variant={theme === "light" ? "outlined" : "outlined"}
                            />
                        );
                    }

                    return null;
                })}

                {hasActiveFilters && (
                    <Stack direction='row' alignItems='center' flexWrap='wrap' gap={1}>
                        <IconButton
                            title='Limpar filtros'
                            size='small'
                            sx={{ border: `1px solid ${colorBorderSystem}` }}
                            onClick={clearAllFilters}>
                            <DeleteOutlineOutlinedIcon color='error' />
                        </IconButton>
                        <IconButton
                            title='Abrir Filtros'
                            size='small'
                            type='submit'
                            sx={{ border: `1px solid ${colorBorderSystem}` }}
                            onClick={handleFilterPanelSurveyRH}>
                            <FilterAltOutlinedIcon color='primary' />
                        </IconButton>
                    </Stack>
                )}
            </Stack>
        );
    };

    const columns: GridColDef[] = [
        {
            field: "data_movimento",
            headerName: "Data Movimento",
            minWidth: 117,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY")}</Typography>;
            },
        },
        {
            field: "nome_colaborador",
            headerName: "Nome",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "funcionario_documento",
            headerName: "CPF",
            headerAlign: "center",
            align: "center",
            minWidth: 150,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatCpfHidden(value, "start-end")}</Typography>;
            },
        },
        {
            field: "sing_nome_agencia",
            headerName: "PA",
            headerAlign: "center",
            align: "center",
            minWidth: 150,
        },
        {
            field: "agencia_id",
            headerName: "Agência ID",
            headerAlign: "center",
            align: "center",
            minWidth: 80,
        },
        {
            field: "carteira_nome",
            headerName: "Carteira",
            headerAlign: "center",
            align: "center",
            minWidth: 165,
        },
        {
            field: "sing_nome_setor",
            headerName: "Setor",
            headerAlign: "center",
            align: "center",
            minWidth: 160,
        },
        {
            field: "sing_nome_time",
            headerName: "Time",
            headerAlign: "center",
            align: "center",
            minWidth: 130,
            renderCell: ({ value }: any) => {
                return <Typography fontSize={14}>{value ? value : "-"}</Typography>;
            },
        },
        {
            field: "carteira_id",
            headerName: "Carteira ID",
            headerAlign: "center",
            align: "center",
            minWidth: 80,
        },
        {
            field: "bate_ponto",
            headerName: "Bate Ponto?",
            width: 100,
            align: "center",
            renderCell: ({ value }: any) => {
                return (
                    <Typography color={value ? "success.light" : "text.secondary"}>{value ? "Sim" : "Não"}</Typography>
                );
            },
        },
        {
            field: "batidas_pares",
            headerName: "Pendência de Ponto?",
            width: 145,
            align: "center",
            renderCell: ({ value }: any) => {
                return (
                    <Typography color={value ? "error.light" : "text.secondary"}>{value ? "Sim" : "Não"}</Typography>
                );
            },
        },
        {
            field: "treinamento",
            headerName: "Pendência de Treinamento?",
            width: 185,
            align: "center",
            renderCell: ({ value }: any) => {
                return (
                    <Typography color={value ? "success.light" : "text.secondary"}>{value ? "Sim" : "Não"}</Typography>
                );
            },
        },
        {
            field: "banco_hora",
            headerName: "Banco de Horas",
            align: "center",
            headerAlign: "center",
            minWidth: 115,
            renderCell: ({ value }) => {
                let color = "text.secondary";
                if (value.startsWith("+")) {
                    color = "success.light";
                } else if (value.startsWith("-")) {
                    color = "error.light";
                }

                return (
                    <Typography color={color} textAlign='center'>
                        {value}
                    </Typography>
                );
            },
        },
        {
            field: "sing_situacao_colaborador",
            headerName: "Situação Colaborador",
            width: 150,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return <Typography>{value ? "🟢 Ativo" : "🔴 Inativo"}</Typography>;
            },
        },
        {
            field: "origem_dados",
            headerName: "Origem Dados",
            minWidth: 105,
            headerAlign: "center",
            align: "center",
        },
    ];

    return (
        <>
            <Grid container spacing={2} justifyContent='center' mt={-1} mb={0.5} wrap={"wrap"} paddingInline={2}>
                <Grid item xs={12} md={12} mt={0.5}>
                    <Box display='flex' justifyContent='space-between' alignItems='center' width='100%'>
                        <Breadcrumbs aria-label='breadcrumb' separator='›'>
                            <Typography color='text.primary' sx={{ display: "inline-flex", alignItems: "center" }}>
                                <StackedBarChartOutlinedIcon
                                    sx={{ color: isThemeLight ? "#5e5e5e" : "#FFFFFF", mr: 0.5 }}
                                />
                                <Typography color='text.primary' sx={{ mt: 0.5 }}>
                                    Relatórios
                                </Typography>
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
                                    navigate("/relatorios/catalogo");
                                }}>
                                Catálogo
                            </Link>
                            <Typography sx={{ color: "text.secondary" }}>{dataPanelSurveyRH?.title || ""}</Typography>
                        </Breadcrumbs>

                        {dataPanelSurveyRH && (
                            <CSATAverageRating
                                module={`Painel | ${dataPanelSurveyRH.title}`}
                                routePath={`${dataPanelSurveyRH.route}`}
                                isClickable
                                formProps={{
                                    module: `Painel | ${dataPanelSurveyRH.title}`,
                                    routePath: `${dataPanelSurveyRH.route}`,
                                }}
                            />
                        )}
                    </Box>
                </Grid>
            </Grid>

            <Grid
                container
                spacing={2}
                justifyContent='center'
                alignItems='center'
                mt={-1}
                paddingInline={2}
                paddingBottom={2}>
                {loading ? (
                    <>
                        <Grid item xs={12} mb={-1.5}>
                            <Skeleton
                                variant='rounded'
                                animation='wave'
                                height={50}
                                width={"100%"}
                                sx={{ borderRadius: "8px 8px 0px 0px" }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Skeleton
                                variant='rounded'
                                animation='wave'
                                height={540}
                                width={"100%"}
                                sx={{ borderRadius: "0px 0px 8px 8px" }}
                            />
                        </Grid>
                    </>
                ) : dataPanelSurveyRH ? (
                    <Grid item xs={12}>
                        <Card
                            sx={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: "8px",
                                border: `1px solid ${colorBorderSystem}`,
                                background: colorBackgroundSystem,
                                boxShadow: colorBoxShadowSystem,
                            }}>
                            <Box position='relative'>
                                <Box
                                    height='48px'
                                    sx={{
                                        backgroundImage: dataPanelSurveyRH.background_color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "1.5rem",
                                        fontWeight: "bold",
                                        position: "relative",
                                    }}>
                                    <Tooltip title={dataPanelSurveyRH?.description || ""}>
                                        <Box
                                            position='absolute'
                                            top={5}
                                            left={8}
                                            color='white'
                                            padding='4px 8px'
                                            borderRadius='4px'>
                                            <Icon>{dataPanelSurveyRH.label_icon}</Icon>
                                        </Box>
                                    </Tooltip>
                                    {movimentDatePanelSurveyRH && (
                                        <Tooltip
                                            title={`Data de atualização da base funcionários do dia: ${formatDate(
                                                movimentDatePanelSurveyRH,
                                                "DD/MM/YYYY",
                                            )}`}>
                                            <Box
                                                position='absolute'
                                                left={55}
                                                bottom={8}
                                                bgcolor='rgba(0, 0, 0, 0.35)'
                                                sx={{ borderRadius: 2 }}
                                                color='white'
                                                padding='4px 8px'
                                                borderRadius='4px'
                                                fontSize='1rem'>
                                                <Typography
                                                    component={"span"}
                                                    fontSize={14}
                                                    fontWeight='bold'
                                                    display={isMobile ? "none" : "inline"}>
                                                    Data Atualização:
                                                </Typography>
                                                <Typography component={"span"} fontSize={14} ml={0.5}>
                                                    {movimentDatePanelSurveyRH &&
                                                        formatDate(movimentDatePanelSurveyRH, "DD/MM/YYYY")}
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    )}
                                    <Tooltip title='Total de Colaboradores'>
                                        <Box
                                            position='absolute'
                                            bottom={8}
                                            right={16}
                                            bgcolor='rgba(0, 0, 0, 0.35)'
                                            sx={{ borderRadius: 2 }}
                                            color='white'
                                            padding='4px 8px'
                                            borderRadius='4px'
                                            fontSize='1rem'>
                                            {listPanelSurveyRH &&
                                                formatNumberWithThousandsSeparator(listPanelSurveyRH.length)}
                                        </Box>
                                    </Tooltip>
                                </Box>
                            </Box>
                            <CardContent
                                sx={{
                                    background: colorBackgroundSystem,
                                    boxShadow: colorBoxShadowSystem,
                                }}>
                                <Box>
                                    {Object.values(filters).some(
                                        (value) => value !== undefined && value !== null && value.length > 0,
                                    ) && (
                                        <Grid
                                            container
                                            direction='row'
                                            gap={1}
                                            border={`1px dashed ${colorBorderSystem}`}
                                            padding={1}
                                            borderRadius={4}
                                            marginBottom={1.5}>
                                            <Grid item xs={12}>
                                                <FilterApplied
                                                    filters={filters}
                                                    clearAllFilters={clearAllFilters}
                                                    removeFilter={removeFilter}
                                                />
                                            </Grid>
                                        </Grid>
                                    )}

                                    <DataGrid
                                        autoHeight
                                        columns={columns}
                                        rows={listPanelSurveyRH}
                                        density='compact'
                                        localeText={dataGridLocaleTextTranslateFull}
                                        loading={loading}
                                        initialState={{
                                            pagination: {
                                                paginationModel: {
                                                    pageSize: 10,
                                                },
                                            },
                                            columns: {
                                                columnVisibilityModel: {
                                                    agencia_id: false,
                                                    carteira_id: false,
                                                    funcionario_documento: false,
                                                    origem_dados: false,
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
                                            columnsPanel: {
                                                style: {
                                                    maxHeight: "360px",
                                                    position: "absolute",
                                                    top: "auto",
                                                    bottom: 0,
                                                    transform: "translate(44%, 52%)",
                                                    zIndex: 1300,
                                                    borderRadius: "8px",
                                                    boxShadow:
                                                        "0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)",
                                                    backgroundColor: theme === "light" ? "#ffffff" : "#1F3D44",
                                                },
                                            },
                                        }}
                                        pageSizeOptions={[10, 20, 30, 50, 100]}
                                        getRowClassName={(params) =>
                                            params.row.situacao_colaborador === false ? "inactive-row" : ""
                                        }
                                        sx={{
                                            ...getDataGridStyles(colorBorderSystem, colorScrollSystem),
                                            "& .inactive-row": {
                                                backgroundColor: theme === "light" ? "#fae1e3e6" : "#77050f63",
                                                color: theme === "light" ? "#721c24" : "#f0cccf",
                                            },
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ) : (
                    <Grid container justifyContent='center' mb={1}>
                        <Grid item>
                            <Typography
                                color='text.secondary'
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                component='span'
                                mt={2}
                                mb={2}>
                                <SearchOffOutlinedIcon color='disabled' sx={{ mr: 0.5 }} />
                                Nenhum painel encontrado
                            </Typography>

                            <LinkRouter to='/relatorios/catalogo'>
                                <Typography
                                    sx={{
                                        color: "#00A494",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                    fontSize={18}
                                    component='span'>
                                    <ArrowCircleLeftOutlinedIcon sx={{ mr: 0.5 }} />
                                    Retornar para página do Catálogo
                                </Typography>
                            </LinkRouter>
                        </Grid>
                    </Grid>
                )}
            </Grid>

            <TemporaryDrawer
                title='Filtro Listagem'
                closeButton={handleFilterPanelSurveyRH}
                onClose={handleFilterPanelSurveyRH}
                disableEscapeKeyDown={false}
                open={openDrawerFilter}
                sx={{
                    "& .MuiDrawer-paperAnchorRight": {
                        width: isMobile ? "100%" : "52%",
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
                    <Grid container component={"form"} direction='row' spacing={2}>
                        <Grid item xs={12} md={12} mt={-2} mb={-1}>
                            <Typography
                                color='primary'
                                fontSize={12}
                                sx={{ display: "inline-flex", alignItems: "center" }}>
                                <FilterAltOutlinedIcon color='primary' sx={{ mr: 0.5 }} /> Filtros:
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={12}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_employee_agencies'
                                label='Agência(s)'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={ArrayTypesAgenciesName.filter((item) => item.ref_id !== 9999)}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_employee_portfolio'
                                label='Carteira(s)'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={ArrayTypesSurveyRHPortfolios}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_employee_sectors'
                                label='Setor(es)'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={listArraySectors
                                    .map((value) => {
                                        return {
                                            id: value.name,
                                            label: value.name,
                                        };
                                    })
                                    .filter((item) => item.id !== "Administrativo SING")}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_employee_does_clock_in'
                                label='Bate Ponto?'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNo}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_employee_paired_point'
                                label='Pendência de Ponto?'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNo}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_employee_is_training'
                                label='Pendência de Treinamento?'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNo}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_employee_date_moviment'
                                label='Data Movimento'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={listMovimentDatePanelSurveyRH.map((value) => ({
                                    id: value,
                                    label: new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" }),
                                }))}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_employee_is_active'
                                label='Situação'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesStatus}
                            />
                        </Grid>

                        <Grid item xs={12} md={12}>
                            <FormInputCpfCnpj
                                fullWidth
                                name='filter_employee_document'
                                label='CPF do Colaborador'
                                placeholder='Digite um CPF ou CNPJ'
                                size='medium'
                                control={control}
                                errors={errors}
                            />
                        </Grid>

                        <Grid item xs={12} md={12}>
                            <LoadingButton
                                fullWidth
                                type='reset'
                                color='primary'
                                loadingPosition='start'
                                size='large'
                                variant='outlined'
                                startIcon={<SearchOffIcon />}
                                loading={loading}
                                sx={{ boxShadow: "none" }}
                                onClick={() => {
                                    reset({
                                        filter_employee_agencies: [],
                                        filter_employee_portfolio: [],
                                        filter_employee_sectors: [],
                                        filter_employee_does_clock_in: null,
                                        filter_employee_paired_point: null,
                                        filter_employee_is_training: null,
                                        filter_employee_date_moviment: [],
                                        filter_employee_is_active: null,
                                        filter_employee_document: null,
                                    });
                                }}>
                                Limpar Filtros
                            </LoadingButton>
                        </Grid>

                        <Grid item xs={12} md={12} mt={0} mb={-1}>
                            <Typography
                                color='primary'
                                fontSize={12}
                                sx={{ display: "inline-flex", alignItems: "center" }}>
                                <ReportGmailerrorredIcon color='primary' sx={{ mr: 0.5 }} /> A listagem é atualizada
                                automaticamente com os filtros selecionados.
                            </Typography>
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
                                badgeContent={
                                    Object.values(filters).filter((value) => {
                                        if (Array.isArray(value)) {
                                            return value.length > 0;
                                        }
                                        return value !== undefined && value !== null && value !== "";
                                    }).length || null
                                }
                                max={100}>
                                <FilterAltOutlinedIcon color='action' />
                            </Badge>
                        ),
                        name: "Filtros",
                        click_event: () => {
                            handleFilterPanelSurveyRH();
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
