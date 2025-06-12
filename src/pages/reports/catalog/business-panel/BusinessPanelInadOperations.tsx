import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
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
import StackedBarChartOutlinedIcon from "@mui/icons-material/StackedBarChartOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import { formatCnpjCpf, formatNumberWithThousandsSeparator, formatToBRLCurrency } from "@/functions/number";
import { ExtClientInfo } from "@/components/ExtClientInfo/ExtClientInfo";
import {
    IListPanelInadOperations,
    ISearchAllReportsCatalog,
    searchAllReportsCatalogRecords,
    searchReportsCatalogPanelInadOperations,
} from "@/services/reports";
import { BoxModal } from "@/components/BoxModal/BoxModal";
import { Link as LinkRouter } from "react-router-dom";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";
import WhatsAppButton from "@/components/WhatsappButton/WhatsappButton";
import FormAutocompleteMultiple from "@/components/FormComponents/FormAutocompleteMultiple";
import FormInput from "@/components/FormComponents/FormInput";
import FormInputCpfCnpj from "@/components/FormComponents/FormInputCpfCnpj";
import { LoadingButton } from "@mui/lab";
import { useAuth } from "@/contexts/AuthContext";
import { ArrayTypesAgenciesName } from "@/constants/array-type-agencies";
import { ArrayTypesPortfolioName } from "@/constants/array-type-portfolio-name";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";
import { ArrayTypesINADOperationsTypeContract } from "@/constants/array-type-inad-operations-type-contract";
import { CSATAverageRating } from "@/components/CSATAssessments/CSATAverageRating";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { ArrayTypesYesOrNo } from "@/constants/array-type-yes-or-no";

type AutoCompleteString = {
    id: string;
    label: string;
};

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

export type BusinessPanelInadOperationsProps = {
    filter_client_agencies?: AutoCompleteString[];
    filter_client_portfolio?: AutoCompleteString[];
    filter_type_contract?: AutoCompleteString[];
    filter_client_document?: string | null;
    filter_client_is_rural?: AutoCompleteBoolean;
    filter_days_late_min?: number;
    filter_days_late_max?: number;
    filter_total_balance_min?: number | null;
    filter_total_balance_max?: number | null;
    filter_open_installments_min?: string;
    filter_open_installments_max?: string;
    filter_anot_vig_abs?: AutoCompleteBoolean;
};

interface Filters {
    filter_client_agencies?: string[];
    filter_client_portfolio?: string[];
    filter_type_contract?: string[];
    filter_client_document?: string;
    filter_client_is_rural?: string;
    filter_days_late_min?: string;
    filter_days_late_max?: string;
    filter_total_balance_min?: string;
    filter_total_balance_max?: string;
    filter_open_installments_min?: string;
    filter_open_installments_max?: string;
    filter_anot_vig_abs?: string;
}

interface FilterAppliedProps {
    filters: Filters;
    clearAllFilters: () => void;
    removeFilter: (key: keyof Filters) => void;
}

const validationSchema = Yup.object().shape({
    filter_client_agencies: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_client_portfolio: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_type_contract: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_client_is_rural: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_client_document: Yup.string().max(18, "Máximo 18 caracteres").trim().nullable(),
    filter_days_late_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_days_late_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_total_balance_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_total_balance_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_open_installments_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_open_installments_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_anot_vig_abs: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
});

export function BusinessPanelInadOperations() {
    const [loading, setLoading] = useState(false);
    const [listPanelInadOperations, setListPanelInadOperations] = useState<IListPanelInadOperations[]>([]);
    const [originalListInadOperations, setOriginalListInadOperations] = useState<IListPanelInadOperations[]>([]);
    const [dataPanelInadOperations, setDataPanelInadOperations] = useState<ISearchAllReportsCatalog>();
    const [movimentDatePanelInadCard, setMovimentDatePanelInadCard] = useState<string>();
    const [idExtClient, setIdExtClient] = useState<number>();
    const [dataExtClient, setDataExtClient] = useState<IListPanelInadOperations>();
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);
    const [openDrawerFilter, setOpenDrawerFilter] = useState(false);
    const [openModalClient, setOpenModalClient] = useState(false);
    const [openModalDetail, setOpenModalDetail] = useState(false);

    const { user } = useAuth();

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
    } = useForm<BusinessPanelInadOperationsProps | any>({
        resolver: yupResolver(validationSchema),
    });

    const filterClientAgenciesWatch = watch("filter_client_agencies");
    const filterClientPortfolioWatch = watch("filter_client_portfolio");
    const filterTypeContractWatch = watch("filter_type_contract");
    const filterClientDocumentWatch = watch("filter_client_document");
    const filterClientIsRuralWatch = watch("filter_client_is_rural");
    const filterDaysLateMinWatch = watch("filter_days_late_min");
    const filterDaysLateMaxWatch = watch("filter_days_late_max");
    const filterTotalBalanceMinWatch = watch("filter_total_balance_min");
    const filterTotalBalanceMaxWatch = watch("filter_total_balance_max");
    const filterOpenInstallmentsMinWatch = watch("filter_open_installments_min");
    const filterOpenInstallmentsMaxWatch = watch("filter_open_installments_max");
    const filterAnotVigABSWatch = watch("filter_anot_vig_abs");

    const handleFilterPanelInadOperations = () => {
        setOpenDrawerFilter((oldValue) => !oldValue);
        setSpeedDialOpen(true);
    };

    const handleOpenModalClient = () => {
        setOpenModalClient((oldValue) => !oldValue);
    };

    const handleModalDetail = () => {
        setOpenModalDetail((oldValue) => !oldValue);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                toggleStatusBackdrop();
                setLoading(true);

                const [responseInadCardsPanel, responseAllReports] = await Promise.all([
                    searchReportsCatalogPanelInadOperations({}),
                    searchAllReportsCatalogRecords({ route: currentPath }),
                ]);

                const { inad_cartoes, data_movimento } = responseInadCardsPanel;
                const dataPanelresponseInadCardsPanel = responseAllReports[0];

                setOriginalListInadOperations(inad_cartoes);
                setListPanelInadOperations(inad_cartoes);

                setMovimentDatePanelInadCard(data_movimento);
                setDataPanelInadOperations(dataPanelresponseInadCardsPanel);
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
    }, [dataPanelInadOperations]);

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
        const filteredData = originalListInadOperations.filter((item) => {
            return (
                (!filters.filter_client_agencies ||
                    filters.filter_client_agencies.length === 0 ||
                    filters.filter_client_agencies.some((selected) => item.agencia_nome === selected)) &&
                (!filters.filter_client_portfolio ||
                    filters.filter_client_portfolio.length === 0 ||
                    filters.filter_client_portfolio.some((selected) => item.carteira_nome === selected)) &&
                (!filters.filter_type_contract ||
                    filters.filter_type_contract.length === 0 ||
                    filters.filter_type_contract.some((selected) => item.tipo_contrato === selected)) &&
                (!filters.filter_client_document ||
                    String(item.cliente_documento).includes(
                        String(filters.filter_client_document.replace(/[\.\-\/]/g, "")),
                    )) &&
                (filters.filter_client_is_rural === null || item.e_rural === Boolean(filters.filter_client_is_rural)) &&
                (filters.filter_anot_vig_abs === null ||
                    item.anot_vigentes_abs === Boolean(filters.filter_anot_vig_abs)) &&
                (filters.filter_days_late_min === null || item.dias_atraso >= Number(filters.filter_days_late_min)) &&
                (filters.filter_days_late_max === null || item.dias_atraso <= Number(filters.filter_days_late_max)) &&
                (filters.filter_total_balance_min === null ||
                    item.saldo_total >= Number(filters.filter_total_balance_min)) &&
                (filters.filter_total_balance_max === null ||
                    item.saldo_total <= Number(filters.filter_total_balance_max)) &&
                (filters.filter_open_installments_min === null ||
                    item.parcelas_abertas >= Number(filters.filter_open_installments_min)) &&
                (filters.filter_open_installments_max === null ||
                    item.parcelas_abertas <= Number(filters.filter_open_installments_max))
            );
        });

        setListPanelInadOperations(filteredData);
    };

    useEffect(() => {
        const filtersWatch = {
            filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_portfolio: filterClientPortfolioWatch?.map((item: { label: string }) => item.label) || [],
            filter_type_contract: filterTypeContractWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_document: filterClientDocumentWatch || null,
            filter_client_is_rural: filterClientIsRuralWatch?.id !== undefined ? filterClientIsRuralWatch?.id : null,
            filter_days_late_min: filterDaysLateMinWatch || null,
            filter_days_late_max: filterDaysLateMaxWatch || null,
            filter_total_balance_min: filterTotalBalanceMinWatch || null,
            filter_total_balance_max: filterTotalBalanceMaxWatch || null,
            filter_open_installments_min: filterOpenInstallmentsMinWatch || null,
            filter_open_installments_max: filterOpenInstallmentsMaxWatch || null,
            filter_anot_vig_abs: filterAnotVigABSWatch?.id !== undefined ? filterAnotVigABSWatch?.id : null,
        };

        applyFilters(filtersWatch);
    }, [
        filterClientAgenciesWatch,
        filterClientPortfolioWatch,
        filterTypeContractWatch,
        filterClientDocumentWatch,
        filterClientIsRuralWatch,
        filterDaysLateMinWatch,
        filterDaysLateMaxWatch,
        filterTotalBalanceMinWatch,
        filterTotalBalanceMaxWatch,
        filterOpenInstallmentsMinWatch,
        filterOpenInstallmentsMaxWatch,
        filterAnotVigABSWatch,
    ]);

    const filters = {
        filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_portfolio: filterClientPortfolioWatch?.map((item: { label: string }) => item.label) || [],
        filter_type_contract: filterTypeContractWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_document: filterClientDocumentWatch,
        filter_client_is_rural: filterClientIsRuralWatch?.label,
        filter_days_late_min: filterDaysLateMinWatch,
        filter_days_late_max: filterDaysLateMaxWatch,
        filter_total_balance_min: filterTotalBalanceMinWatch,
        filter_total_balance_max: filterTotalBalanceMaxWatch,
        filter_open_installments_min: filterOpenInstallmentsMinWatch,
        filter_open_installments_max: filterOpenInstallmentsMaxWatch,
        filter_anot_vig_abs: filterAnotVigABSWatch?.label,
    };

    const labelsMap = {
        filter_client_agencies: "Agência(s)",
        filter_client_portfolio: "Carteira(s)",
        filter_type_contract: "Tipo Contrato",
        filter_client_is_rural: "É Rural",
        filter_client_document: "CPF/CNPJ",
        filter_days_late_min: "Dias Atraso - Min",
        filter_days_late_max: "Dias Atraso - Max",
        filter_total_balance_min: "Saldo Total - Min",
        filter_total_balance_max: "Saldo Total - Max",
        filter_open_installments_min: "Parcelas Abertas - Min",
        filter_open_installments_max: "Parcelas Abertas - Max",
        filter_anot_vig_abs: "Anot Vigente ABS",
    };

    const clearAllFilters = () => {
        reset({
            filter_client_agencies: [],
            filter_client_portfolio: [],
            filter_type_contract: [],
            filter_client_is_rural: null,
            filter_client_document: null,
            filter_days_late_min: null,
            filter_days_late_max: null,
            filter_total_balance_min: null,
            filter_total_balance_max: null,
            filter_open_installments_min: null,
            filter_open_installments_max: null,
            filter_anot_vig_abs: null,
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
                            onClick={handleFilterPanelInadOperations}>
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
            field: "cliente_nome",
            headerName: "Nome",
            minWidth: 200,
            flex: 1,
            headerAlign: "center",
        },
        {
            field: "cliente_documento",
            headerName: "CPF/CNPJ",
            minWidth: 140,
            flex: 1,
            headerAlign: "center",
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatCnpjCpf(value)}</Typography>;
            },
        },
        {
            field: "agencia_nome",
            headerName: "PA",
            description: "Agência",
            width: 155,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "carteira_nome",
            headerName: "Carteira",
            minWidth: 155,
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "e_rural",
            headerName: "É Rural",
            width: 70,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }: any) => {
                return <Typography>{value ? "🌱 Sim" : "      Não"}</Typography>;
            },
        },
        {
            field: "num_contrato",
            headerName: "Número Contrato",
            minWidth: 125,
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "tipo_contrato",
            headerName: "Tipo Contrato",
            minWidth: 275,
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "saldo_total",
            headerName: "Saldo Total",
            minWidth: 100,
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : "-"}
                    </Typography>
                );
            },
        },
        // {
        //     field: "parcelas_abertas",
        //     headerName: "Parcelas Abertas",
        //     minWidth: 125,
        //     flex: 1,
        //     headerAlign: "center",
        //     align: "center",
        //     renderCell: ({ value }) => {
        //         return <Typography fontSize={14}>{value !== null && value !== undefined ? value : "-"}</Typography>;
        //     },
        // },
        {
            field: "dias_atraso",
            headerName: "Dias Atraso",
            minWidth: 90,
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "anot_vigentes_abs",
            headerName: "Anot Vigente ABS",
            align: "center",
            headerAlign: "center",
            width: 125,
            renderCell: ({ value }: any) => {
                return <Typography color={value ? "#e27005" : "#439B70"}>{value ? "⚠️ Sim" : "✅ Não"}</Typography>;
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
                                {dataPanelInadOperations?.title || ""}
                            </Typography>
                        </Breadcrumbs>

                        {dataPanelInadOperations && (
                            <CSATAverageRating
                                module={`Painel | ${dataPanelInadOperations.title}`}
                                routePath={`${dataPanelInadOperations.route}`}
                                isClickable
                                formProps={{
                                    module: `Painel | ${dataPanelInadOperations.title}`,
                                    routePath: `${dataPanelInadOperations.route}`,
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
                ) : dataPanelInadOperations ? (
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
                                        backgroundImage: dataPanelInadOperations.background_color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "1.5rem",
                                        fontWeight: "bold",
                                        position: "relative",
                                    }}>
                                    <Tooltip title={dataPanelInadOperations?.description || ""}>
                                        <Box
                                            position='absolute'
                                            top={5}
                                            left={8}
                                            color='white'
                                            padding='4px 8px'
                                            borderRadius='4px'>
                                            <Icon>{dataPanelInadOperations.label_icon}</Icon>
                                        </Box>
                                    </Tooltip>
                                    {movimentDatePanelInadCard && (
                                        <Tooltip
                                            title={`Data de atualização da base de inad - operações do dia: ${formatDate(
                                                movimentDatePanelInadCard,
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
                                                    {movimentDatePanelInadCard &&
                                                        formatDate(movimentDatePanelInadCard, "DD/MM/YYYY")}
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    )}
                                    <Tooltip title='Total de inadimplência de Cartão'>
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
                                            {listPanelInadOperations &&
                                                formatNumberWithThousandsSeparator(listPanelInadOperations.length)}
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
                                        rows={listPanelInadOperations}
                                        density='compact'
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
                                                        É Rural:
                                                    </TableCell>
                                                    <TableCell>{dataExtClient.e_rural ? "🌱 Sim" : "Não"}</TableCell>
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
                                                        Número do Contrato:
                                                    </TableCell>
                                                    <TableCell>{dataExtClient.num_contrato}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Tipo do Contrato:
                                                    </TableCell>
                                                    <TableCell>{dataExtClient.tipo_contrato}</TableCell>
                                                </TableRow>
                                                {/* <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Parcelas em Aberto:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.parcelas_abertas !== null &&
                                                        dataExtClient.parcelas_abertas !== undefined
                                                            ? dataExtClient.parcelas_abertas
                                                            : "-"}
                                                    </TableCell>
                                                </TableRow> */}
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Saldo Total:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.saldo_total !== null &&
                                                        dataExtClient.saldo_total !== undefined
                                                            ? formatToBRLCurrency(dataExtClient.saldo_total)
                                                            : "-"}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Dias de Atraso:
                                                    </TableCell>
                                                    <TableCell>{dataExtClient.dias_atraso}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Tem Anotação Vigente Absoluta?:
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            color={
                                                                dataExtClient.anot_vigentes_abs ? "#e27005" : "#439B70"
                                                            }>
                                                            {dataExtClient.anot_vigentes_abs ? "⚠️ Sim" : "✅ Não"}
                                                        </Typography>
                                                    </TableCell>
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

            <TemporaryDrawer
                title='Filtro Listagem'
                closeButton={handleFilterPanelInadOperations}
                onClose={handleFilterPanelInadOperations}
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

                        <Grid item xs={12} md={12}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_type_contract'
                                label='Tipo Contrato'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={ArrayTypesINADOperationsTypeContract}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_anot_vig_abs'
                                label='Tem Anotação Vigente ABS?'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNo}
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
                                label='Dias Atraso - Min'
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
                                label='Dias Atraso - Max'
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
                            <FormInput
                                fullWidth
                                label='Saldo Total - Min'
                                placeholder='Digite um número'
                                name='filter_total_balance_min'
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
                                label='Saldo Total - Max'
                                placeholder='Digite um número'
                                name='filter_total_balance_max'
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

                        {/* <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='Parcelas Abertas - Min'
                                placeholder='Digite um número'
                                name='filter_open_installments_min'
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
                                label='Parcelas Abertas - Max'
                                placeholder='Digite um número'
                                name='filter_open_installments_max'
                                type='number'
                                variant='outlined'
                                control={control}
                                errors={errors}
                                inputProps={{
                                    min: 0,
                                    max: 99999,
                                }}
                            />
                        </Grid> */}

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
                                        filter_type_contract: [],
                                        filter_client_is_rural: null,
                                        filter_client_document: null,
                                        filter_days_late_min: "",
                                        filter_days_late_max: "",
                                        filter_total_balance_min: "",
                                        filter_total_balance_max: "",
                                        filter_open_installments_min: "",
                                        filter_open_installments_max: "",
                                        filter_anot_vig_abs: null,
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
                            handleFilterPanelInadOperations();
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
