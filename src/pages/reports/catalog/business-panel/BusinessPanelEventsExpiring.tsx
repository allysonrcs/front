import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
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
    Modal,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
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
import { useGlobal } from "@/contexts/GlobalContext";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { formatDate } from "@/functions/date";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import StackedBarChartOutlinedIcon from "@mui/icons-material/StackedBarChartOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import { formatCnpjCpf, formatNumberWithThousandsSeparator } from "@/functions/number";
import { ExtClientInfo } from "@/components/ExtClientInfo/ExtClientInfo";
import {
    IListEventsExpiring,
    ISearchAllReportsCatalog,
    searchAllReportsCatalogRecords,
    searchReportsCatalogPanelEventsExpiring,
} from "@/services/reports";
import { BoxModal } from "@/components/BoxModal/BoxModal";
import { Link as LinkRouter } from "react-router-dom";
import WhatsAppButton from "@/components/WhatsappButton/WhatsappButton";
import moment from "moment";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import FormAutocompleteMultiple from "@/components/FormComponents/FormAutocompleteMultiple";
import FormInputCpfCnpj from "@/components/FormComponents/FormInputCpfCnpj";
import FormDatePicker from "@/components/FormComponents/FormDatePicker";
import { ArrayTypesPortfolioName } from "@/constants/array-type-portfolio-name";
import { ArrayTypesAgenciesName } from "@/constants/array-type-agencies";
import { LoadingButton } from "@mui/lab";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";
import { useAuth } from "@/contexts/AuthContext";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";
import FormInput from "@/components/FormComponents/FormInput";
import { CSATAverageRating } from "@/components/CSATAssessments/CSATAverageRating";

export const naturezaMap: any = {
    CRL: "📊 CRL",
    Cadastro: "📝 Cadastro",
    Investimento: "📈 Investimento",
};

type AutoCompleteString = {
    id: string;
    label: string;
};

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
} | null;

export type BusinessPanelEventsExpiringProps = {
    filter_client_agencies?: AutoCompleteString[] | null;
    filter_client_portfolio?: AutoCompleteString[] | null;
    filter_client_nature?: AutoCompleteString[] | null;
    filter_client_is_rural?: AutoCompleteBoolean;
    filter_client_document?: string | null;
    filter_days_late_min?: number;
    filter_days_late_max?: number;
    filter_date_due_min?: Date | null;
    filter_date_due_max?: Date | null;
};

interface Filters {
    filter_client_agencies?: string[];
    filter_client_portfolio?: string[];
    filter_client_nature?: string[];
    filter_client_is_rural?: boolean;
    filter_client_document?: string;
    filter_days_late_min?: string;
    filter_days_late_max?: string;
    filter_date_due_min?: string | null;
    filter_date_due_max?: string | null;
}

interface FilterAppliedProps {
    filters: Filters;
    clearAllFilters: () => void;
    removeFilter: (key: keyof Filters) => void;
}

const validationSchema = Yup.object().shape({
    filter_client_agencies: Yup.array()
        .of(
            Yup.object()
                .shape({
                    id: Yup.string().required(),
                    label: Yup.string().required(),
                })
                .required(),
        )
        .nullable(),
    filter_client_portfolio: Yup.array()
        .of(
            Yup.object()
                .shape({
                    id: Yup.string().required(),
                    label: Yup.string().required(),
                })
                .required(),
        )
        .nullable(),
    filter_client_nature: Yup.array()
        .of(
            Yup.object()
                .shape({
                    id: Yup.string().required(),
                    label: Yup.string().required(),
                })
                .required(),
        )
        .nullable(),
    filter_client_is_rural: Yup.object()
        .shape({
            id: Yup.boolean().required(),
            label: Yup.string().required(),
        })
        .nullable(),
    filter_client_document: Yup.string().max(18, "Máximo 18 caracteres").trim().nullable(),
    filter_days_late_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_days_late_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_date_due_min: Yup.date().nullable().typeError("Digite uma data válida"),
    filter_date_due_max: Yup.date().nullable().typeError("Digite uma data válida"),
});

export function BusinessPanelEventsExpiring() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [listPanelEventsExpiring, setListPanelEventsExpiring] = useState<IListEventsExpiring[]>([]);
    const [originalListPanelEventsExpiring, setOriginalListPanelEventsExpiring] = useState<IListEventsExpiring[]>([]);
    const [dataPanelEventsExpiring, setDataPanelEventsExpiring] = useState<ISearchAllReportsCatalog>();
    const [movimentDatePanelEventsExpiring, setMovimentDatePanelEventsExpiring] = useState<string>();
    const [idExtClient, setIdExtClient] = useState<number>();
    const [dataExtClient, setDataExtClient] = useState<IListEventsExpiring>();
    const [openModalClient, setOpenModalClient] = useState(false);
    const [openModalDetail, setOpenModalDetail] = useState(false);
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

    const today = moment();

    const location = useLocation();
    const currentPath = location.pathname;

    const {
        control,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<BusinessPanelEventsExpiringProps | any>({
        resolver: yupResolver(validationSchema),
    });

    const filterClientAgenciesWatch = watch("filter_client_agencies");
    const filterClientPortfolioWatch = watch("filter_client_portfolio");
    const filterClientNatureWatch = watch("filter_client_nature");
    const filterClientIsRuralWatch = watch("filter_client_is_rural");
    const filterClientDocumentWatch = watch("filter_client_document");
    const filterDaysLateMinWatch = watch("filter_days_late_min");
    const filterDaysLateMaxWatch = watch("filter_days_late_max");
    const filterDateDueMinWatch = watch("filter_date_due_min");
    const filterDateDueMaxWatch = watch("filter_date_due_max");

    useEffect(() => {
        const fetchData = async () => {
            try {
                toggleStatusBackdrop();
                setLoading(true);

                const [responseEventsExpiringPanel, responseAllReports] = await Promise.all([
                    searchReportsCatalogPanelEventsExpiring({}),
                    searchAllReportsCatalogRecords({ route: currentPath }),
                ]);

                const { eventos_expirados } = responseEventsExpiringPanel;
                const dataPanelEventsExpiring = responseAllReports[0];

                setOriginalListPanelEventsExpiring(eventos_expirados);
                setListPanelEventsExpiring(eventos_expirados);

                setDataPanelEventsExpiring(dataPanelEventsExpiring);

                const mostRecentDate = eventos_expirados.reduce(
                    (mostRecent, currentRow) => {
                        const currentDate = currentRow.data_movimento
                            ? new Date(currentRow.data_movimento)
                            : new Date(0);
                        const mostRecentDate = mostRecent ? new Date(mostRecent) : new Date(0);
                        return currentDate > mostRecentDate ? currentRow.data_movimento : mostRecent;
                    },
                    eventos_expirados[0]?.data_movimento || new Date(0).toISOString(),
                );

                setMovimentDatePanelEventsExpiring(mostRecentDate);
            } catch (error) {
                const { message } = await getInfoError(error);
                toast.error(message);
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

            if (userAgencyId && ![102, 9999].includes(userAgencyId)) {
                const selectedAgency = ArrayTypesAgenciesName.find((agency) => agency.ref_id === userAgencyId);

                if (selectedAgency) {
                    setValue("filter_client_agencies", [
                        { id: selectedAgency.id, label: selectedAgency.label, ref_id: selectedAgency.ref_id },
                    ]);
                }

                if (userPortfolioName && userPortfolioName !== "GLOBAL") {
                    setValue("filter_client_portfolio", [
                        {
                            id: userPortfolioName,
                            label: userPortfolioName,
                        },
                    ]);
                }
            }
        }
    }, [dataPanelEventsExpiring]);

    const handleOpenModalClient = () => {
        setOpenModalClient((oldValue) => !oldValue);
    };

    const handleModalDetail = () => {
        setOpenModalDetail((oldValue) => !oldValue);
    };

    const handleFilterPanelEventsExpiring = () => {
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
        const filteredData = originalListPanelEventsExpiring.filter((item) => {
            return (
                ((!filters.filter_client_agencies ||
                    filters.filter_client_agencies.length === 0 ||
                    filters.filter_client_agencies.some((selected) => item.agencia_nome === selected)) &&
                    (!filters.filter_client_portfolio ||
                        filters.filter_client_portfolio.length === 0 ||
                        filters.filter_client_portfolio.some((selected) => item.carteira_nome === selected)) &&
                    (!filters.filter_client_nature ||
                        filters.filter_client_nature.length === 0 ||
                        filters.filter_client_nature.some((selected) => item.natureza === selected)) &&
                    (filters.filter_client_is_rural === null ||
                        item.e_rural === Boolean(filters.filter_client_is_rural)) &&
                    (!filters.filter_client_document ||
                        String(item.cliente_documento).includes(
                            String(filters.filter_client_document.replace(/[\.\-\/]/g, "")),
                        )) &&
                    (filters.filter_days_late_min === null ||
                        item.dias_restantes >= Number(filters.filter_days_late_min)) &&
                    (filters.filter_days_late_max === null ||
                        item.dias_restantes <= Number(filters.filter_days_late_max)) &&
                    !filters.filter_date_due_min &&
                    !filters.filter_date_due_max) ||
                (moment(item.data_alvo).isSameOrAfter(moment(filters.filter_date_due_min), "day") &&
                    moment(item.data_alvo).isSameOrBefore(moment(filters.filter_date_due_max), "day"))
            );
        });

        setListPanelEventsExpiring(filteredData);
    };

    useEffect(() => {
        const filtersWatch = {
            filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_portfolio: filterClientPortfolioWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_nature: filterClientNatureWatch?.map((item: { id: string }) => item.id) || [],
            filter_client_is_rural: filterClientIsRuralWatch?.id !== undefined ? filterClientIsRuralWatch?.id : null,
            filter_client_document: filterClientDocumentWatch || null,
            filter_days_late_min: filterDaysLateMinWatch || null,
            filter_days_late_max: filterDaysLateMaxWatch || null,
            filter_date_due_min: filterDateDueMinWatch ? moment(filterDateDueMinWatch).format("YYYY-MM-DD") : null,
            filter_date_due_max: filterDateDueMaxWatch ? moment(filterDateDueMaxWatch).format("YYYY-MM-DD") : null,
        };

        applyFilters(filtersWatch);
    }, [
        filterClientAgenciesWatch,
        filterClientPortfolioWatch,
        filterClientNatureWatch,
        filterClientIsRuralWatch,
        filterClientDocumentWatch,
        filterDaysLateMinWatch,
        filterDaysLateMaxWatch,
        filterDateDueMinWatch,
        filterDateDueMaxWatch,
    ]);

    const filters = {
        filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_portfolio: filterClientPortfolioWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_nature: filterClientNatureWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_is_rural: filterClientIsRuralWatch?.label ?? null,
        filter_client_document: filterClientDocumentWatch,
        filter_days_late_min: filterDaysLateMinWatch,
        filter_days_late_max: filterDaysLateMaxWatch,
        filter_date_due_min: filterDateDueMinWatch ? moment(filterDateDueMinWatch).format("DD/MM/YYYY") : null,
        filter_date_due_max: filterDateDueMaxWatch ? moment(filterDateDueMaxWatch).format("DD/MM/YYYY") : null,
    };

    const labelsMap = {
        filter_client_agencies: "Agência(s)",
        filter_client_portfolio: "Carteira(s)",
        filter_client_nature: "Natureza",
        filter_client_is_rural: "É Rural",
        filter_client_document: "CPF/CNPJ",
        filter_days_late_min: "Dias Restantes - Min",
        filter_days_late_max: "Dias Restantes - Max",
        filter_date_due_min: "Data Vencimento - Min",
        filter_date_due_max: "Data Vencimento - Max",
    };

    const clearAllFilters = () => {
        reset({
            filter_client_agencies: [],
            filter_client_portfolio: [],
            filter_client_nature: [],
            filter_client_is_rural: null,
            filter_client_document: null,
            filter_days_late_min: null,
            filter_days_late_max: null,
            filter_date_due_min: null,
            filter_date_due_max: null,
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
                            onClick={handleFilterPanelEventsExpiring}>
                            <FilterAltOutlinedIcon color='primary' />
                        </IconButton>
                    </Stack>
                )}
            </Stack>
        );
    };

    const columns: GridColDef[] = [
        {
            field: "Opções",
            width: 70,
            align: "center",
            headerAlign: "center",
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (cellValues) => {
                return (
                    <Stack direction='row' spacing={1}>
                        <IconButton
                            onClick={(event) => {
                                event.stopPropagation();
                                handleModalDetail();
                                setDataExtClient(cellValues.row);
                            }}
                            color='success'
                            title='Visualizar Dados'
                            aria-label='Visualizar Dados'>
                            <FormatListBulletedOutlinedIcon />
                        </IconButton>
                    </Stack>
                );
            },
        },
        {
            field: "data_movimento",
            headerName: "Data Atualização",
            minWidth: 120,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY")}</Typography>;
            },
        },
        {
            field: "natureza",
            headerName: "Natureza",
            minWidth: 110,
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{naturezaMap[value]}</Typography>;
            },
        },
        {
            field: "dias_restantes",
            headerName: "Dias Restantes",
            minWidth: 110,
            headerAlign: "center",
            align: "center",
            flex: 1,
        },
        {
            field: "data_alvo",
            headerName: "Data Vencimento",
            minWidth: 130,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                if (!value) return null;

                const endDate = moment(value, "YYYY-MM-DD");
                const diffMonths = endDate.diff(today, "months", true);

                let emoji = "🟢";

                if (endDate.isSame(today, "day")) {
                    emoji = "⚠️";
                } else if (endDate.isBefore(today, "day")) {
                    emoji = "❌";
                } else if (diffMonths <= 1 && diffMonths > 0) {
                    emoji = "🔴";
                } else if (diffMonths <= 2 && diffMonths > 1) {
                    emoji = "🟡";
                }

                return (
                    <Typography fontSize={14}>
                        {emoji} {formatDate(value, "DD/MM/YYYY")}
                    </Typography>
                );
            },
        },
        {
            field: "cliente_id",
            headerName: "Cliente ID",
            minWidth: 120,
            headerAlign: "center",
            align: "center",
            flex: 1,
        },
        {
            field: "cliente_nome",
            headerName: "Nome",
            minWidth: 180,
            headerAlign: "center",
            align: "center",
            flex: 1,
        },
        {
            field: "cliente_documento",
            headerName: "CPF/CNPJ",
            minWidth: 140,
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatCnpjCpf(value)}</Typography>;
            },
        },
        {
            field: "melhor_contato",
            headerName: "Melhor Contato",
            minWidth: 150,
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return <WhatsAppButton phoneNumber={value} message='Olá, tudo bem? Gostariamos de falar com você' />;
            },
        },
        {
            field: "obs1",
            headerName: "Observação 1",
            minWidth: 220,
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "obs2",
            headerName: "Observação 2",
            minWidth: 220,
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "obs3",
            headerName: "Observação 3",
            minWidth: 220,
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "agencia_nome",
            headerName: "PA",
            minWidth: 180,
            headerAlign: "center",
            align: "center",
            flex: 1,
        },
        {
            field: "carteira_nome",
            headerName: "Carteira",
            minWidth: 160,
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "e_rural",
            headerName: "É Rural",
            minWidth: 100,
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return <Typography>{value ? "🌱 Sim" : "      Não"}</Typography>;
            },
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
                            <Typography sx={{ color: "text.secondary" }}>
                                {dataPanelEventsExpiring?.title || ""}
                            </Typography>
                        </Breadcrumbs>

                        {dataPanelEventsExpiring && (
                            <CSATAverageRating
                                module={`Painel | ${dataPanelEventsExpiring.title}`}
                                routePath={`${dataPanelEventsExpiring.route}`}
                                isClickable
                                formProps={{
                                    module: `Painel | ${dataPanelEventsExpiring.title}`,
                                    routePath: `${dataPanelEventsExpiring.route}`,
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
                ) : dataPanelEventsExpiring ? (
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
                                        backgroundImage: dataPanelEventsExpiring.background_color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "1.5rem",
                                        fontWeight: "bold",
                                        position: "relative",
                                    }}>
                                    <Tooltip title={dataPanelEventsExpiring?.description || ""}>
                                        <Box
                                            position='absolute'
                                            top={5}
                                            left={8}
                                            color='white'
                                            padding='4px 8px'
                                            borderRadius='4px'>
                                            <Icon>{dataPanelEventsExpiring.label_icon}</Icon>
                                        </Box>
                                    </Tooltip>
                                    {movimentDatePanelEventsExpiring && (
                                        <Tooltip
                                            title={`Data de atualização da base de eventos do dia: ${formatDate(
                                                movimentDatePanelEventsExpiring,
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
                                                    {movimentDatePanelEventsExpiring &&
                                                        formatDate(movimentDatePanelEventsExpiring, "DD/MM/YYYY")}
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    )}
                                    <Tooltip title='Total de Registros'>
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
                                            {listPanelEventsExpiring &&
                                                formatNumberWithThousandsSeparator(listPanelEventsExpiring.length)}
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
                                        rows={listPanelEventsExpiring}
                                        density='compact'
                                        localeText={dataGridLocaleTextTranslateFull}
                                        initialState={{
                                            pagination: {
                                                paginationModel: {
                                                    pageSize: 10,
                                                },
                                            },
                                            columns: {
                                                columnVisibilityModel: {
                                                    cliente_id: false,
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
                                        sx={getDataGridStyles(colorBorderSystem, colorScrollSystem)}
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

            <Modal open={openModalDetail} onClose={handleModalDetail} disableEscapeKeyDown={false}>
                <Box>
                    <BoxModal
                        title={(dataExtClient && dataExtClient?.cliente_nome) || ""}
                        handleClose={handleModalDetail}
                        maxHeight='95%'>
                        <Box
                            sx={{
                                maxHeight: "70vh",
                                overflow: "auto",
                                mt: -4,
                            }}>
                            <TableContainer>
                                <Table
                                    sx={{
                                        "& .MuiTableCell-root": {
                                            padding: "2.5px 8px",
                                            fontSize: "14px",
                                            lineHeight: 2,
                                        },
                                    }}>
                                    <TableBody>
                                        {dataExtClient && (
                                            <>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        ID Cooperado:
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography fontWeight={"100"} fontSize={14} mb={-1} ml={-1}>
                                                            <Tooltip title='Visualizar Dados do Cooperado'>
                                                                <IconButton
                                                                    onClick={() => {
                                                                        handleOpenModalClient();
                                                                        setIdExtClient(dataExtClient.cliente_id);
                                                                    }}
                                                                    color='success'
                                                                    aria-label='Visualizar Cooperado'>
                                                                    <AccountCircleOutlinedIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            {dataExtClient.cliente_id}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Nome:
                                                    </TableCell>
                                                    <TableCell>{dataExtClient.cliente_nome}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Documento:
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatCnpjCpf(dataExtClient.cliente_documento)}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Agência:
                                                    </TableCell>
                                                    <TableCell>{dataExtClient.agencia_nome}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Carteira:
                                                    </TableCell>
                                                    <TableCell>{dataExtClient.carteira_nome}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Melhor Contato:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.melhor_contato ? (
                                                            <Box display='flex' alignItems='center' gap={0.5} ml={-1}>
                                                                <WhatsAppButton
                                                                    phoneNumber={dataExtClient.melhor_contato}
                                                                    message='Olá, estamos entrando em contato para compartilhar novidades!'
                                                                />
                                                            </Box>
                                                        ) : (
                                                            "-"
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        É Rural:
                                                    </TableCell>
                                                    <TableCell>{dataExtClient.e_rural ? "🌱 Sim" : "Não"}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Natureza do Evento:
                                                    </TableCell>
                                                    <TableCell>{naturezaMap[dataExtClient.natureza]}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Dias Restantes:
                                                    </TableCell>
                                                    <TableCell>{dataExtClient.dias_restantes}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Data do Vencimento:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.data_alvo ? (
                                                            <Typography fontSize={14}>
                                                                {(() => {
                                                                    const today = moment();
                                                                    const endDate = moment(
                                                                        dataExtClient.data_alvo,
                                                                        "YYYY-MM-DD",
                                                                    );
                                                                    const diffMonths = endDate.diff(
                                                                        today,
                                                                        "months",
                                                                        true,
                                                                    );

                                                                    let emoji = "🟢";

                                                                    if (endDate.isSame(today, "day")) {
                                                                        emoji = "⚠️";
                                                                    } else if (endDate.isBefore(today, "day")) {
                                                                        emoji = "❌";
                                                                    } else if (diffMonths <= 1 && diffMonths > 0) {
                                                                        emoji = "🔴";
                                                                    } else if (diffMonths <= 2 && diffMonths > 1) {
                                                                        emoji = "🟡";
                                                                    }

                                                                    return `${emoji} ${formatDate(dataExtClient.data_alvo, "DD/MM/YYYY")}`;
                                                                })()}
                                                            </Typography>
                                                        ) : (
                                                            ""
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Observação 1:
                                                    </TableCell>
                                                    <TableCell>{dataExtClient.obs1}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Observação 2:
                                                    </TableCell>
                                                    <TableCell>{dataExtClient.obs2}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Observação 3:
                                                    </TableCell>
                                                    <TableCell>{dataExtClient.obs3}</TableCell>
                                                </TableRow>
                                            </>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </BoxModal>
                </Box>
            </Modal>

            <TemporaryDrawer
                title='Filtro Listagem'
                closeButton={handleFilterPanelEventsExpiring}
                onClose={handleFilterPanelEventsExpiring}
                disableEscapeKeyDown={false}
                open={openDrawerFilter}
                sx={{
                    "& .MuiDrawer-paperAnchorRight": {
                        width: isMobile ? "100%" : "40%",
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
                                name='filter_client_agencies'
                                label='Agência(s)'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={ArrayTypesAgenciesName.filter(
                                    (item) => item.ref_id !== 102 && item.ref_id !== 9999,
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={12}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_client_portfolio'
                                label='Carteira(s)'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={ArrayTypesPortfolioName}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_client_nature'
                                label='Natureza'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={[
                                    { id: "CRL", label: "📊 CRL" },
                                    { id: "Cadastro", label: "📝 Cadastro" },
                                    { id: "Investimento", label: "📈 Investimento" },
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_client_is_rural'
                                label='É Rural'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={[
                                    { id: false, label: "Não" },
                                    { id: true, label: "Sim 🌱" },
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12} md={12}>
                            <FormInputCpfCnpj
                                fullWidth
                                name='filter_client_document'
                                label='CPF ou CNPJ do Cooperado'
                                placeholder='Digite um CPF ou CNPJ'
                                size='medium'
                                control={control}
                                errors={errors}
                            />
                        </Grid>

                        <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='Dias Restantes - Min'
                                placeholder='Digite um número'
                                name='filter_days_late_min'
                                type='number'
                                variant='outlined'
                                control={control}
                                errors={errors}
                                inputProps={{
                                    min: 0,
                                    max: 99999,
                                }}
                            />
                        </Grid>

                        <Grid item md={1.5} alignContent={"center"} justifyContent={"center"} textAlign={"center"}>
                            <Typography fontSize={14} color='text.secondary'>
                                Entre
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='Dias Restantes - Max'
                                placeholder='Digite um número'
                                name='filter_days_late_max'
                                type='number'
                                variant='outlined'
                                control={control}
                                errors={errors}
                                inputProps={{
                                    min: 0,
                                    max: 99999,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={5.25}>
                            <FormDatePicker
                                fullWidth
                                name='filter_date_due_min'
                                label='Data Vencimento - Min'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                            />
                        </Grid>

                        <Grid item md={1.5} alignContent={"center"} justifyContent={"center"} textAlign={"center"}>
                            <Typography fontSize={14} color='text.secondary'>
                                Entre
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={5.25}>
                            <FormDatePicker
                                fullWidth
                                name='filter_date_due_max'
                                label='Data Vencimento - Max'
                                variant='outlined'
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
                                        filter_client_agencies: [],
                                        filter_client_portfolio: [],
                                        filter_client_nature: [],
                                        filter_client_is_rural: null,
                                        filter_client_document: null,
                                        filter_days_late_min: "",
                                        filter_days_late_max: "",
                                        filter_date_due_min: null,
                                        filter_date_due_max: null,
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

            <TemporaryDrawer
                title='Dados do Cooperado'
                closeButton={handleOpenModalClient}
                onClose={handleOpenModalClient}
                disableEscapeKeyDown={false}
                open={openModalClient}
                ModalProps={{
                    BackdropProps: { style: { backgroundColor: "transparent" } },
                }}
                sx={{
                    zIndex: 2001,
                    "& .MuiDrawer-paperAnchorRight": {
                        width: isMobile ? "100%" : "78%",
                    },
                    "& .MuiDrawer-paper": {
                        background: isThemeLight ? "#ffffffae" : "linear-gradient(135deg, #051b1f, #0c2e33)",
                        borderLeft: `1px solid ${colorBorderSystem}`,
                        backdropFilter: "blur(30px)",
                        backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                        backgroundRepeat: "no-repeat, no-repeat",
                        backgroundSize: "50%, 50%",
                        backgroundPosition: "right top, left bottom",
                    },
                }}>
                <Box>
                    <ExtClientInfo idExtClient={idExtClient} p={3} />
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
                            handleFilterPanelEventsExpiring();
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
