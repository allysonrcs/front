import { useEffect, useMemo, useState } from "react";
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
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import { Link as LinkRouter } from "react-router-dom";
import { formatCnpjCpf, formatToBRLCurrency } from "@/functions/number";
import { ExtClientInfo } from "@/components/ExtClientInfo/ExtClientInfo";
import {
    IListDisbursement,
    ISearchAllReportsCatalog,
    searchAllReportsCatalogRecords,
    searchReportsCatalogPanelDisbursement,
} from "@/services/reports";
import FormAutocompleteMultiple from "@/components/FormComponents/FormAutocompleteMultiple";
import FormInputCpfCnpj from "@/components/FormComponents/FormInputCpfCnpj";
import { ArrayTypesProfileClient } from "@/constants/array-type-profile-client";
import { ArrayTypesPortfolioName } from "@/constants/array-type-portfolio-name";
import { ArrayTypesAgenciesName } from "@/constants/array-type-agencies";
import { useAuth } from "@/contexts/AuthContext";
import { ArrayTypesRiskCRL } from "@/constants/array-type-risk-crl";
import { ArrayTypesDisbursementModality } from "@/constants/array-type-disbursement-modality";
import moment from "moment";
import FormDatePicker from "@/components/FormComponents/FormDatePicker";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";
import FormInput from "@/components/FormComponents/FormInput";
import { CSATAverageRating } from "@/components/CSATAssessments/CSATAverageRating";

type AutoCompleteString = {
    id: string;
    label: string;
};

type AutoCompleteNumber = {
    id: number;
    label: string;
};

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

export type BusinessPanelDisbursementProps = {
    filter_client_agencies?: AutoCompleteString[];
    filter_client_portfolio?: AutoCompleteString[];
    filter_client_profile?: AutoCompleteString[];
    filter_client_risk_crl?: AutoCompleteString[];
    filter_client_disbursement_modality?: AutoCompleteNumber[];
    filter_client_is_rural?: AutoCompleteBoolean;
    filter_client_in_migration?: AutoCompleteBoolean;
    filter_client_document?: string | null;
    filter_refmonth?: AutoCompleteString[];
    filter_date_verification_min?: Date | null;
    filter_date_verification_max?: Date | null;
    filter_value_disbursement_min?: number | null;
    filter_value_disbursement_max?: number | null;
};

interface Filters {
    filter_client_agencies?: string[];
    filter_client_portfolio?: string[];
    filter_client_profile?: string[];
    filter_client_risk_crl?: string[];
    filter_client_disbursement_modality?: number[];
    filter_client_is_rural?: string;
    filter_client_in_migration?: string;
    filter_client_document?: string;
    filter_refmonth?: string[];
    filter_date_verification_min?: string | null;
    filter_date_verification_max?: string | null;
    filter_value_disbursement_min?: string;
    filter_value_disbursement_max?: string;
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
    filter_client_profile: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_client_risk_crl: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_client_disbursement_modality: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.number().nullable(),
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
    filter_client_in_migration: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_client_document: Yup.string().max(18, "Máximo 18 caracteres").trim().nullable(),
    filter_refmonth: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_date_verification_min: Yup.date().nullable().typeError("Digite uma data válida"),
    filter_date_verification_max: Yup.date().nullable().typeError("Digite uma data válida"),
    filter_value_disbursement_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_value_disbursement_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
});

export function BusinessPanelDisbursement() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [listPanelDisbursement, setListPanelDisbursement] = useState<IListDisbursement[]>([]);
    const [originalListPanelDisbursement, setoriginalListPanelDisbursement] = useState<IListDisbursement[]>([]);
    const [movimentDatePanelDisbursement, setmovimentDatePanelDisbursement] = useState<string>();
    const [dataPanelDisbursement, setDataPanelDisbursement] = useState<ISearchAllReportsCatalog>();
    const [openDrawerFilter, setOpenDrawerFilter] = useState(false);
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);
    const [openModalClient, setOpenModalClient] = useState(false);
    const [idExtClient, setIdExtClient] = useState<number>();

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
    } = useForm<BusinessPanelDisbursementProps | any>({
        resolver: yupResolver(validationSchema),
    });

    const filterClientAgenciesWatch = watch("filter_client_agencies");
    const filterClientPortfolioWatch = watch("filter_client_portfolio");
    const filterClientRiskCRLWatch = watch("filter_client_risk_crl");
    const filterClientDisbursementModalityWatch = watch("filter_client_disbursement_modality");
    const filterClientProfileWatch = watch("filter_client_profile");
    const filterClientIsRuralWatch = watch("filter_client_is_rural");
    const filterClientInMigrationWatch = watch("filter_client_in_migration");
    const filterClientDocumentWatch = watch("filter_client_document");
    const filterRefMonthWatch = watch("filter_refmonth");
    const filterDateVerificationMinWatch = watch("filter_date_verification_min");
    const filterDateVerificationMaxWatch = watch("filter_date_verification_max");
    const filterValueDisbursementMinWatch = watch("filter_value_disbursement_min");
    const filterValueDisbursementMaxWatch = watch("filter_value_disbursement_max");

    const handleOpenModalClient = () => {
        setOpenModalClient((oldValue) => !oldValue);
    };

    const handleFilterPanelDisbursement = () => {
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                toggleStatusBackdrop();
                setLoading(true);

                const [responseCatalogDisbursement, responseAllReports] = await Promise.all([
                    searchReportsCatalogPanelDisbursement({}),
                    searchAllReportsCatalogRecords({ route: currentPath }),
                ]);

                const { painel_desembolso, data_movimento } = responseCatalogDisbursement;
                const dataPanelDisbursement = responseAllReports[0];

                setoriginalListPanelDisbursement(painel_desembolso);
                setListPanelDisbursement(painel_desembolso);

                setmovimentDatePanelDisbursement(data_movimento);
                setDataPanelDisbursement(dataPanelDisbursement);
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

    const refMonthOptions = useMemo(() => {
        const uniqueRefMonth = new Set<string>();

        return originalListPanelDisbursement
            .map((item: any) => item.refmes)
            .filter((refmes: string) => {
                if (!refmes || uniqueRefMonth.has(refmes)) return false;
                uniqueRefMonth.add(refmes);
                return true;
            })
            .sort((a, b) => b.localeCompare(a))
            .map((refmes) => ({
                id: refmes,
                label: refmes,
            }));
    }, [originalListPanelDisbursement]);

    useEffect(() => {
        if (user) {
            const userAgencyId = user.agency_sisbr_id;
            const userPortfolioName = user?.portfolio_name?.toLocaleUpperCase();

            refMonthOptions[0] &&
                setValue("filter_refmonth", [{ id: refMonthOptions[0].id, label: refMonthOptions[0].label }]);

            if (userAgencyId && ![102, 9999].includes(userAgencyId)) {
                const selectedAgency = ArrayTypesAgenciesName.find((agency) => agency.ref_id === userAgencyId);

                if (selectedAgency) {
                    setValue("filter_client_agencies", [
                        { id: selectedAgency.id, label: selectedAgency.label, ref_id: selectedAgency.ref_id },
                    ]);

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
        }
    }, [dataPanelDisbursement]);

    const applyFilters = (filters: Filters) => {
        const filteredData = originalListPanelDisbursement.filter((item) => {
            return (
                (!filters.filter_client_agencies ||
                    filters.filter_client_agencies.length === 0 ||
                    filters.filter_client_agencies.some((selected) => item.agencia_nome === selected)) &&
                (!filters.filter_client_portfolio ||
                    filters.filter_client_portfolio.length === 0 ||
                    filters.filter_client_portfolio.some((selected) => item.carteira_nome === selected)) &&
                (!filters.filter_client_disbursement_modality ||
                    filters.filter_client_disbursement_modality.length === 0 ||
                    filters.filter_client_disbursement_modality.some((selected) => item.linha === selected)) &&
                (!filters.filter_client_profile ||
                    filters.filter_client_profile.length === 0 ||
                    filters.filter_client_profile.some((selected) => item.cliente_perfil === selected)) &&
                (!filters.filter_client_risk_crl ||
                    filters.filter_client_risk_crl.length === 0 ||
                    filters.filter_client_risk_crl.some((selected) =>
                        selected === "NULL" ? item.risco_crl === null : item.risco_crl === selected,
                    )) &&
                (filters.filter_client_is_rural === null || item.e_rural === Boolean(filters.filter_client_is_rural)) &&
                (filters.filter_client_in_migration === null ||
                    item.em_migracao_carteira === Boolean(filters.filter_client_in_migration)) &&
                (!filters.filter_client_document ||
                    String(item.cliente_documento).includes(
                        String(filters.filter_client_document.replace(/[\.\-\/]/g, "")),
                    )) &&
                (!filters.filter_refmonth ||
                    filters.filter_refmonth.length === 0 ||
                    filters.filter_refmonth.some((selected) => item.refmes === selected)) &&
                (filters.filter_value_disbursement_min === null ||
                    item.valor >= Number(filters.filter_value_disbursement_min)) &&
                (filters.filter_value_disbursement_max === null ||
                    item.valor <= Number(filters.filter_value_disbursement_max)) &&
                ((!filters.filter_date_verification_min && !filters.filter_date_verification_max) ||
                    (moment(item.data_apuracao).isSameOrAfter(moment(filters.filter_date_verification_min), "day") &&
                        moment(item.data_apuracao).isSameOrBefore(moment(filters.filter_date_verification_max), "day")))
            );
        });

        setListPanelDisbursement(filteredData);
    };

    useEffect(() => {
        const filtersWatch = {
            filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_portfolio: filterClientPortfolioWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_risk_crl: filterClientRiskCRLWatch?.map((item: { id: string }) => item.id) || [],
            filter_client_disbursement_modality:
                filterClientDisbursementModalityWatch?.map((item: { id: number }) => item.id) || [],
            filter_client_profile: filterClientProfileWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_is_rural: filterClientIsRuralWatch?.id !== undefined ? filterClientIsRuralWatch?.id : null,
            filter_client_in_migration:
                filterClientInMigrationWatch?.id !== undefined ? filterClientInMigrationWatch?.id : null,
            filter_client_document: filterClientDocumentWatch || null,
            filter_refmonth: filterRefMonthWatch?.map((item: { label: string }) => item.label) || [],
            filter_date_verification_min: filterDateVerificationMinWatch
                ? moment(filterDateVerificationMinWatch).format("YYYY-MM-DD")
                : null,
            filter_date_verification_max: filterDateVerificationMaxWatch
                ? moment(filterDateVerificationMaxWatch).format("YYYY-MM-DD")
                : null,
            filter_value_disbursement_min: filterValueDisbursementMinWatch || null,
            filter_value_disbursement_max: filterValueDisbursementMaxWatch || null,
        };

        applyFilters(filtersWatch);
    }, [
        filterClientAgenciesWatch,
        filterClientPortfolioWatch,
        filterClientRiskCRLWatch,
        filterClientDisbursementModalityWatch,
        filterClientProfileWatch,
        filterClientIsRuralWatch,
        filterClientInMigrationWatch,
        filterClientDocumentWatch,
        filterRefMonthWatch,
        filterDateVerificationMinWatch,
        filterDateVerificationMaxWatch,
        filterValueDisbursementMinWatch,
        filterValueDisbursementMaxWatch,
    ]);

    const filters = {
        filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_portfolio: filterClientPortfolioWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_risk_crl: filterClientRiskCRLWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_disbursement_modality:
            filterClientDisbursementModalityWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_profile: filterClientProfileWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_is_rural: filterClientIsRuralWatch?.label,
        filter_client_in_migration: filterClientInMigrationWatch?.label,
        filter_client_document: filterClientDocumentWatch,
        filter_refmonth: filterRefMonthWatch?.map((item: { label: string }) => item.label) || [],
        filter_date_verification_min: filterDateVerificationMinWatch
            ? moment(filterDateVerificationMinWatch).format("DD/MM/YYYY")
            : null,
        filter_date_verification_max: filterDateVerificationMaxWatch
            ? moment(filterDateVerificationMaxWatch).format("DD/MM/YYYY")
            : null,
        filter_value_disbursement_min: filterValueDisbursementMinWatch,
        filter_value_disbursement_max: filterValueDisbursementMaxWatch,
    };

    const labelsMap = {
        filter_client_agencies: "Agência(s)",
        filter_client_portfolio: "Carteira(s)",
        filter_client_risk_crl: "Risco CRL",
        filter_client_disbursement_modality: "Modalidade",
        filter_client_profile: "Perfil",
        filter_client_is_rural: "É Rural",
        filter_client_in_migration: "Em Migração",
        filter_client_document: "CPF/CNPJ",
        filter_refmonth: "Mês de Referência",
        filter_date_verification_min: "Data Apuração - Min",
        filter_date_verification_max: "Data Apuração - Max",
        filter_value_disbursement_min: "Valor Desembolso - Min",
        filter_value_disbursement_max: "Valor Desembolso - Max",
    };

    const clearAllFilters = () => {
        reset({
            filter_client_agencies: [],
            filter_client_portfolio: [],
            filter_client_risk_crl: [],
            filter_client_disbursement_modality: [],
            filter_client_profile: [],
            filter_client_is_rural: null,
            filter_client_in_migration: null,
            filter_client_document: null,
            filter_refmonth: [],
            filter_date_verification_min: null,
            filter_date_verification_max: null,
            filter_value_disbursement_min: null,
            filter_value_disbursement_max: null,
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
                            onClick={handleFilterPanelDisbursement}>
                            <FilterAltOutlinedIcon color='primary' />
                        </IconButton>
                    </Stack>
                )}
            </Stack>
        );
    };

    const hasFilters =
        Object.values(filters).filter((value) => {
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            return value !== undefined && value !== null && value !== "";
        }).length || null;

    const columns: GridColDef[] = [
        {
            field: "Opções",
            width: 68,
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
                                handleOpenModalClient();
                                setIdExtClient(cellValues.row.cliente_id);
                            }}
                            color='success'
                            title='Visualizar dados do cooperado'
                            aria-label='Visualizar Cooperado'>
                            <AccountCircleOutlinedIcon />
                        </IconButton>
                    </Stack>
                );
            },
        },
        {
            field: "refmes",
            headerName: "Mês Referência",
            minWidth: 112,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "MM/YYYY")}</Typography>;
            },
        },
        {
            field: "data_apuracao",
            headerName: "Data Apuração",
            minWidth: 108,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY")}</Typography>;
            },
        },
        {
            field: "cliente_documento",
            headerName: "CPF/CNPJ",
            minWidth: 150,
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatCnpjCpf(value)}</Typography>;
            },
        },
        {
            field: "cliente_nome",
            headerName: "Nome",
            minWidth: 235,
            flex: 1,
        },
        {
            field: "e_funcionario",
            headerName: "É Funcionário",
            flex: 1,
            minWidth: 100,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return <Typography color={value ? "error.light" : "success.light"}>{value ? "Sim" : "Não"}</Typography>;
            },
        },
        {
            field: "conta_corrente",
            headerName: "Conta Corrente",
            align: "center",
            headerAlign: "center",
            minWidth: 125,
            flex: 1,
        },
        {
            field: "modalidade",
            headerName: "Modalidade",
            align: "center",
            headerAlign: "center",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "valor",
            headerName: "Valor Desembolso",
            minWidth: 145,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "usuario",
            headerName: "Usuário Aprovação",
            minWidth: 180,
            headerAlign: "center",
            align: "center",
            flex: 1,
        },
        {
            field: "nome_usuario",
            headerName: "Colaborador que Aprovou",
            minWidth: 270,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: (cellValues) => {
                return (
                    <Typography fontSize={14}>
                        {cellValues.row.nome_usuario !== null && cellValues.row.nome_usuario !== undefined
                            ? cellValues.row.nome_usuario
                            : cellValues.row.usuario}
                    </Typography>
                );
            },
        },
        {
            field: "agencia_nome",
            headerName: "PA",
            minWidth: 160,
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "carteira_nome",
            headerName: "Carteira",
            minWidth: 180,
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "linha",
            headerName: "Linha",
            align: "center",
            headerAlign: "center",
            minWidth: 85,
            flex: 1,
        },
        {
            field: "renda_mensal",
            headerName: "Renda Cooperado",
            minWidth: 135,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "e_rural",
            headerName: "É Rural",
            minWidth: 85,
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }: any) => {
                return <Typography>{value ? "🌱 Sim" : "      Não"}</Typography>;
            },
        },
        {
            field: "em_migracao_carteira",
            headerName: "Em migração?",
            minWidth: 110,
            flex: 1,
            align: "center",
            headerAlign: "center",
            renderCell: ({ value }: any) => {
                return (
                    <Tooltip
                        title={
                            value
                                ? "👍 Sim, está em processo de migração de carteira"
                                : "👎 Não está em processo de migração de carteira"
                        }>
                        <Typography>{value ? "🔄 Sim" : "❎ Não"}</Typography>
                    </Tooltip>
                );
            },
        },
        {
            field: "risco_crl",
            headerName: "Risco",
            minWidth: 65,
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "iap",
            headerName: "IAP",
            minWidth: 60,
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "cliente_perfil",
            headerName: "Perfil",
            headerAlign: "center",
            align: "center",
            minWidth: 200,
            flex: 1,
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
                                {dataPanelDisbursement?.title || ""}
                            </Typography>
                        </Breadcrumbs>

                        {dataPanelDisbursement && (
                            <CSATAverageRating
                                module={`Painel | ${dataPanelDisbursement.title}`}
                                routePath={`${dataPanelDisbursement.route}`}
                                isClickable
                                formProps={{
                                    module: `Painel | ${dataPanelDisbursement.title}`,
                                    routePath: `${dataPanelDisbursement.route}`,
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
                ) : dataPanelDisbursement ? (
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
                                        backgroundImage: dataPanelDisbursement.background_color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "1.5rem",
                                        fontWeight: "bold",
                                        position: "relative",
                                    }}>
                                    <Tooltip title={dataPanelDisbursement?.description || ""}>
                                        <Box
                                            position='absolute'
                                            top={5}
                                            left={8}
                                            color='white'
                                            padding='4px 8px'
                                            borderRadius='4px'>
                                            <Icon>{dataPanelDisbursement.label_icon}</Icon>
                                        </Box>
                                    </Tooltip>
                                    {movimentDatePanelDisbursement && (
                                        <Tooltip
                                            title={`Data de atualização da base de desembolso do dia: ${formatDate(
                                                movimentDatePanelDisbursement,
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
                                                    {movimentDatePanelDisbursement &&
                                                        formatDate(movimentDatePanelDisbursement, "DD/MM/YYYY")}
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    )}
                                    <Tooltip title='Total do Desembolso'>
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
                                            {listPanelDisbursement &&
                                                formatToBRLCurrency(
                                                    listPanelDisbursement.reduce(
                                                        (total, item) => total + (item.valor || 0),
                                                        0,
                                                    ),
                                                )}
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
                                        rows={listPanelDisbursement}
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
                                                    conta_corrente: false,
                                                    linha: false,
                                                    usuario: false,
                                                    e_funcionario: false,
                                                    nome_usuario: false,
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

            <TemporaryDrawer
                title='Filtro Listagem'
                closeButton={handleFilterPanelDisbursement}
                onClose={handleFilterPanelDisbursement}
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
                                disableClearable={false}
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

                        <Grid item xs={12} md={4}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_client_risk_crl'
                                label='Risco CRL'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={ArrayTypesRiskCRL}
                            />
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_client_disbursement_modality'
                                label='Modalidade Desembolso'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={ArrayTypesDisbursementModality}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_client_profile'
                                label='Perfil'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={ArrayTypesProfileClient}
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

                        <Grid item xs={12} md={4}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_client_in_migration'
                                label='Em Migração'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={[
                                    { id: true, label: "🔄 Sim" },
                                    { id: false, label: "❎ Não" },
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12} md={8}>
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

                        <Grid item xs={12} md={12}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_refmonth'
                                label='Mês de Referência'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={refMonthOptions}
                            />
                        </Grid>

                        <Grid item xs={12} md={5.25}>
                            <FormDatePicker
                                fullWidth
                                name='filter_date_verification_min'
                                label='Data Apuração - Min'
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
                                name='filter_date_verification_max'
                                label='Data Apuração - Max'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                            />
                        </Grid>

                        <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='Valor Desembolso - Min'
                                placeholder='Digite um número'
                                name='filter_value_disbursement_min'
                                type='number'
                                variant='outlined'
                                control={control}
                                errors={errors}
                                inputProps={{
                                    min: 0,
                                    max: 9999999,
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
                                label='Valor Desembolso - Max'
                                placeholder='Digite um número'
                                name='filter_value_disbursement_max'
                                type='number'
                                variant='outlined'
                                control={control}
                                errors={errors}
                                inputProps={{
                                    min: 0,
                                    max: 9999999,
                                }}
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
                                        filter_client_risk_crl: [],
                                        filter_client_disbursement_modality: [],
                                        filter_client_profile: [],
                                        filter_client_is_rural: null,
                                        filter_client_in_migration: null,
                                        filter_client_document: null,
                                        filter_refmonth: [],
                                        filter_date_verification_min: null,
                                        filter_date_verification_max: null,
                                        filter_value_disbursement_min: "",
                                        filter_value_disbursement_max: "",
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
                        width: isMobile ? "100%" : "80%",
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
                            <Badge color='primary' badgeContent={hasFilters} max={100}>
                                <FilterAltOutlinedIcon color='action' />
                            </Badge>
                        ),
                        name: "Filtros",
                        click_event: () => {
                            handleFilterPanelDisbursement();
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
