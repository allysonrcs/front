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
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { Link as LinkRouter } from "react-router-dom";
import { formatCnpjCpf, formatNumberWithThousandsSeparator, formatToBRLCurrency } from "@/functions/number";
import { ExtClientInfo } from "@/components/ExtClientInfo/ExtClientInfo";
import {
    IListQualifiedAccounts,
    ISearchAllReportsCatalog,
    searchAllReportsCatalogRecords,
    searchReportsCatalogPanelQualifiedAccounts,
} from "@/services/reports";
import FormAutocompleteMultiple from "@/components/FormComponents/FormAutocompleteMultiple";
import FormInputCpfCnpj from "@/components/FormComponents/FormInputCpfCnpj";
import { ArrayTypesPortfolioName } from "@/constants/array-type-portfolio-name";
import { ArrayTypesAgenciesName } from "@/constants/array-type-agencies";
import { useAuth } from "@/contexts/AuthContext";
import { ArrayTypesRiskCRL } from "@/constants/array-type-risk-crl";
import {
    ArrayTypeStatusCurrentAccountClientComplete,
    statusCurrentAccountMap,
} from "@/constants/array-type-status-current-account-client-complet";
import { BoxModal } from "@/components/BoxModal/BoxModal";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";
import { ArrayTypesYesOrNo } from "@/constants/array-type-yes-or-no";
import { CSATAverageRating } from "@/components/CSATAssessments/CSATAverageRating";

type AutoCompleteString = {
    id: string;
    label: string;
};

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

export type BusinessPanelDisbursementProps = {
    filter_client_agencies?: AutoCompleteString[];
    filter_client_portfolio?: AutoCompleteString[];
    filter_client_risk_crl?: AutoCompleteString[];
    filter_client_is_rural?: AutoCompleteBoolean;
    filter_status_current_account?: AutoCompleteString[];
    filter_client_document?: string | null;
    filter_is_tariff?: AutoCompleteBoolean;
    filter_is_limit?: AutoCompleteBoolean;
    filter_is_card?: AutoCompleteBoolean;
    filter_is_insurance?: AutoCompleteBoolean;
    filter_is_previ_dom_bank?: AutoCompleteBoolean;
    filter_qualified_account?: AutoCompleteBoolean;
    filter_annotation_current_relation?: AutoCompleteBoolean;
    filter_annotation_current_absolute?: AutoCompleteBoolean;
    filter_annotation_downloaded_relation?: AutoCompleteBoolean;
    filter_annotation_downloaded_absolute?: AutoCompleteBoolean;
};

interface Filters {
    filter_client_agencies?: string[];
    filter_client_portfolio?: string[];
    filter_client_risk_crl?: string[];
    filter_client_is_rural?: string;
    filter_status_current_account?: string[];
    filter_client_document?: string;
    filter_is_tariff?: string;
    filter_is_limit?: string;
    filter_is_card?: string;
    filter_is_insurance?: string;
    filter_is_previ_dom_bank?: string;
    filter_qualified_account?: string;
    filter_annotation_current_relation?: string;
    filter_annotation_current_absolute?: string;
    filter_annotation_downloaded_relation?: string;
    filter_annotation_downloaded_absolute?: string;
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
    filter_client_risk_crl: Yup.array()
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
    filter_qualified_account: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_status_current_account: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_annotation_current_relation: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_annotation_current_absolute: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_annotation_downloaded_relation: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_annotation_downloaded_absolute: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_client_document: Yup.string().max(18, "Máximo 18 caracteres").trim().nullable(),
});

export function BusinessPanelQualifiedAccounts() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [listPanelQualifiedAccounts, setListPanelQualifiedAccounts] = useState<IListQualifiedAccounts[]>([]);
    const [originalListPanelQualifiedAccounts, setOriginalListPanelQualifiedAccounts] = useState<
        IListQualifiedAccounts[]
    >([]);
    const [movimentDatePanelQualifiedAccounts, setMovimentDatePanelQualifiedAccounts] = useState<string>();
    const [dataPanelQualifiedAccounts, setDataPanelQualifiedAccounts] = useState<ISearchAllReportsCatalog>();
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);
    const [openDrawerFilter, setOpenDrawerFilter] = useState(false);
    const [openModalDetail, setOpenModalDetail] = useState(false);
    const [openModalClient, setOpenModalClient] = useState(false);
    const [idExtClient, setIdExtClient] = useState<number>();
    const [dataDetailQualifiedAccount, setDataDetailQualifiedAccount] = useState<IListQualifiedAccounts>();

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
    const filterClientIsRuralWatch = watch("filter_client_is_rural");
    const filterStatusQualifiedAccountWatch = watch("filter_status_current_account");
    const filterClientDocumentWatch = watch("filter_client_document");
    const filterTariffWatch = watch("filter_is_tariff");
    const filterIsLimitWatch = watch("filter_is_limit");
    const filterIsCardWatch = watch("filter_is_card");
    const filterIsInsuranceWatch = watch("filter_is_insurance");
    const filterIsPreviDomBankWatch = watch("filter_is_previ_dom_bank");
    const filterQualifiedAccountWatch = watch("filter_qualified_account");
    const filterAnnotationCurrentRelationWatch = watch("filter_annotation_current_relation");
    const filterAnnotationCurrentAbsoluteWatch = watch("filter_annotation_current_absolute");
    const filterAnnotationDownloadedRelationWatch = watch("filter_annotation_downloaded_relation");
    const filterAnnotationDownloadedAbsoluteWatch = watch("filter_annotation_downloaded_absolute");

    useEffect(() => {
        const fetchData = async () => {
            try {
                toggleStatusBackdrop();
                setLoading(true);

                const [responseAllReports, responseCatalogQualifiedAccounts] = await Promise.all([
                    searchAllReportsCatalogRecords({ route: currentPath }),
                    searchReportsCatalogPanelQualifiedAccounts({}),
                ]);

                const dataPanelQualifiedAccounts = responseAllReports[0];
                const { painel_contas_qualificadas, data_movimento } = responseCatalogQualifiedAccounts;

                setOriginalListPanelQualifiedAccounts(painel_contas_qualificadas);
                setListPanelQualifiedAccounts(painel_contas_qualificadas);

                setMovimentDatePanelQualifiedAccounts(data_movimento);
                setDataPanelQualifiedAccounts(dataPanelQualifiedAccounts);
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
    }, [dataPanelQualifiedAccounts]);

    const handleFilterPanelQualifiedAccounts = () => {
        setOpenDrawerFilter((oldValue) => !oldValue);
        setSpeedDialOpen(true);
    };

    const handleModalDetail = () => {
        setOpenModalDetail((oldValue) => !oldValue);
    };

    const handleOpenModalClient = () => {
        setOpenModalClient((oldValue) => !oldValue);
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
        const filteredData = originalListPanelQualifiedAccounts.filter((item) => {
            return (
                (!filters.filter_client_agencies ||
                    filters.filter_client_agencies.length === 0 ||
                    filters.filter_client_agencies.some((selected) => item.agencia_nome === selected)) &&
                (!filters.filter_client_portfolio ||
                    filters.filter_client_portfolio.length === 0 ||
                    filters.filter_client_portfolio.some((selected) => item.carteira_nome === selected)) &&
                (!filters.filter_client_risk_crl ||
                    filters.filter_client_risk_crl.length === 0 ||
                    filters.filter_client_risk_crl.some((selected) =>
                        selected === "NULL" ? item.risco_crl === null : item.risco_crl === selected,
                    )) &&
                (filters.filter_client_is_rural === null || item.e_rural === Boolean(filters.filter_client_is_rural)) &&
                (!filters.filter_status_current_account ||
                    filters.filter_status_current_account.length === 0 ||
                    filters.filter_status_current_account.some((selected) =>
                        selected === "NULL" ? item.conta_situacao === null : item.conta_situacao === selected,
                    )) &&
                (!filters.filter_client_document ||
                    String(item.cliente_documento).includes(
                        String(filters.filter_client_document.replace(/[\.\-\/]/g, "")),
                    )) &&
                (filters.filter_is_tariff === null || item.tarifa === Boolean(filters.filter_is_tariff)) &&
                (filters.filter_is_limit === null || item.limite === Boolean(filters.filter_is_limit)) &&
                (filters.filter_is_card === null || item.cartao === Boolean(filters.filter_is_card)) &&
                (filters.filter_is_insurance === null || item.seguro === Boolean(filters.filter_is_insurance)) &&
                (filters.filter_is_previ_dom_bank === null ||
                    item.previ_domicilio === Boolean(filters.filter_is_previ_dom_bank)) &&
                (filters.filter_qualified_account === null ||
                    item.e_qualificada === Boolean(filters.filter_qualified_account)) &&
                (filters.filter_annotation_current_relation === null ||
                    item.anot_vigentes_rel === Boolean(filters.filter_annotation_current_relation)) &&
                (filters.filter_annotation_current_absolute === null ||
                    item.anot_vigentes_abs === Boolean(filters.filter_annotation_current_absolute)) &&
                (filters.filter_annotation_downloaded_relation === null ||
                    item.anot_baixadas_rel === Boolean(filters.filter_annotation_downloaded_relation)) &&
                (filters.filter_annotation_downloaded_absolute === null ||
                    item.anot_baixadas_abs === Boolean(filters.filter_annotation_downloaded_absolute))
            );
        });

        setListPanelQualifiedAccounts(filteredData);
    };

    useEffect(() => {
        const filtersWatch = {
            filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_portfolio: filterClientPortfolioWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_risk_crl: filterClientRiskCRLWatch?.map((item: { id: string }) => item.id) || [],
            filter_client_is_rural: filterClientIsRuralWatch?.id !== undefined ? filterClientIsRuralWatch?.id : null,
            filter_status_current_account:
                filterStatusQualifiedAccountWatch?.map((item: { id: string }) => item.id) || [],
            filter_client_document: filterClientDocumentWatch || null,
            filter_is_tariff: filterTariffWatch?.id !== undefined ? filterTariffWatch?.id : null,
            filter_is_limit: filterIsLimitWatch?.id !== undefined ? filterIsLimitWatch?.id : null,
            filter_is_card: filterIsCardWatch?.id !== undefined ? filterIsCardWatch?.id : null,
            filter_is_insurance: filterIsInsuranceWatch?.id !== undefined ? filterIsInsuranceWatch?.id : null,
            filter_is_previ_dom_bank:
                filterIsPreviDomBankWatch?.id !== undefined ? filterIsPreviDomBankWatch?.id : null,
            filter_qualified_account:
                filterQualifiedAccountWatch?.id !== undefined ? filterQualifiedAccountWatch?.id : null,
            filter_annotation_current_relation:
                filterAnnotationCurrentRelationWatch?.id !== undefined
                    ? filterAnnotationCurrentRelationWatch?.id
                    : null,
            filter_annotation_current_absolute:
                filterAnnotationCurrentAbsoluteWatch?.id !== undefined
                    ? filterAnnotationCurrentAbsoluteWatch?.id
                    : null,
            filter_annotation_downloaded_relation:
                filterAnnotationDownloadedRelationWatch?.id !== undefined
                    ? filterAnnotationDownloadedRelationWatch?.id
                    : null,
            filter_annotation_downloaded_absolute:
                filterAnnotationDownloadedAbsoluteWatch?.id !== undefined
                    ? filterAnnotationDownloadedAbsoluteWatch?.id
                    : null,
        };

        applyFilters(filtersWatch);
    }, [
        filterClientAgenciesWatch,
        filterClientPortfolioWatch,
        filterClientRiskCRLWatch,
        filterClientIsRuralWatch,
        filterStatusQualifiedAccountWatch,
        filterClientDocumentWatch,
        filterTariffWatch,
        filterIsLimitWatch,
        filterIsCardWatch,
        filterIsInsuranceWatch,
        filterIsPreviDomBankWatch,
        filterQualifiedAccountWatch,
        filterAnnotationCurrentRelationWatch,
        filterAnnotationCurrentAbsoluteWatch,
        filterAnnotationDownloadedRelationWatch,
        filterAnnotationDownloadedAbsoluteWatch,
    ]);

    const filters = {
        filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_portfolio: filterClientPortfolioWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_risk_crl: filterClientRiskCRLWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_is_rural: filterClientIsRuralWatch?.label,
        filter_status_current_account:
            filterStatusQualifiedAccountWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_document: filterClientDocumentWatch,
        filter_is_tariff: filterTariffWatch?.label,
        filter_is_limit: filterIsLimitWatch?.label,
        filter_is_card: filterIsCardWatch?.label,
        filter_is_insurance: filterIsInsuranceWatch?.label,
        filter_is_previ_dom_bank: filterIsPreviDomBankWatch?.label,
        filter_qualified_account: filterQualifiedAccountWatch?.label,
        filter_annotation_current_relation: filterAnnotationCurrentRelationWatch?.label,
        filter_annotation_current_absolute: filterAnnotationCurrentAbsoluteWatch?.label,
        filter_annotation_downloaded_relation: filterAnnotationDownloadedRelationWatch?.label,
        filter_annotation_downloaded_absolute: filterAnnotationDownloadedAbsoluteWatch?.label,
    };

    const labelsMap = {
        filter_client_agencies: "Agência(s)",
        filter_client_portfolio: "Carteira(s)",
        filter_client_risk_crl: "Risco CRL",
        filter_client_is_rural: "É Rural",
        filter_status_current_account: "Situação Conta Corrente",
        filter_client_document: "CPF/CNPJ",
        filter_is_tariff: "Tem Tarifca",
        filter_is_limit: "Tem Limite",
        filter_is_card: "Tem Cartão",
        filter_is_insurance: "Tem Seguro",
        filter_is_previ_dom_bank: "Tem Previ/Dom. Bancário",
        filter_qualified_account: "É Qualificada",
        filter_annotation_current_relation: "Anotação Vigente Relativa",
        filter_annotation_current_absolute: "Anotação Vigente Absoluta",
        filter_annotation_downloaded_relation: "Anotação Baixada Relativa",
        filter_annotation_downloaded_absolute: "Anotação Baixada Absoluta",
    };

    const clearAllFilters = () => {
        reset();
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
                            onClick={handleFilterPanelQualifiedAccounts}>
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
                                setDataDetailQualifiedAccount(cellValues.row);
                            }}
                            color='success'
                            title='Visualizar Dados do Registro'
                            aria-label='Visualizar Registro'>
                            <FormatListBulletedOutlinedIcon />
                        </IconButton>
                    </Stack>
                );
            },
        },
        {
            field: "cliente_documento",
            headerName: "CPF/CNPJ",
            hideable: false,
            minWidth: 140,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatCnpjCpf(value)}</Typography>;
            },
        },
        {
            field: "cliente_nome",
            headerName: "Nome",
            hideable: false,
            width: 200,
        },
        {
            field: "agencia_nome",
            headerName: "PA",
            headerAlign: "center",
            hideable: false,
            width: 125,
        },
        {
            field: "carteira_nome",
            headerName: "Carteira",
            headerAlign: "center",
            minWidth: 125,
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
            field: "renda_bruta",
            headerName: "Renda Bruta",
            headerAlign: "center",
            align: "center",
            width: 100,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "numconta",
            headerName: "Número Conta",
            headerAlign: "center",
            align: "center",
            width: 105,
        },
        {
            field: "conta_modalidade",
            headerName: "Modalidade Conta",
            headerAlign: "center",
            align: "center",
            width: 139,
        },
        {
            field: "conta_situacao",
            headerName: "Situação Conta",
            headerAlign: "center",
            width: 145,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14} title={statusCurrentAccountMap[value] || value}>
                        {statusCurrentAccountMap[value] || value}
                    </Typography>
                );
            },
        },
        {
            field: "tarifa",
            headerName: "Tarifa",
            width: 50,
            align: "center",
            headerAlign: "center",
            renderCell: ({ value }: any) => {
                return <Typography>{value ? "✅" : "❌"}</Typography>;
            },
        },
        {
            field: "limite",
            headerName: "Limite",
            width: 53,
            align: "center",
            headerAlign: "center",
            renderCell: ({ value }: any) => {
                return <Typography>{value ? "✅" : "❌"}</Typography>;
            },
        },
        {
            field: "cartao",
            headerName: "Cartão",
            width: 56,
            align: "center",
            headerAlign: "center",
            renderCell: ({ value }: any) => {
                return <Typography>{value ? "✅" : "❌"}</Typography>;
            },
        },
        {
            field: "seguro",
            headerName: "Seguro",
            width: 58,
            align: "center",
            headerAlign: "center",
            renderCell: ({ value }: any) => {
                return <Typography>{value ? "✅" : "❌"}</Typography>;
            },
        },
        {
            field: "previ_domicilio",
            headerName: "Previ / Domicílio Bancário",
            width: 175,
            align: "center",
            headerAlign: "center",
            renderCell: ({ value }: any) => {
                return <Typography>{value ? "✅" : "❌"}</Typography>;
            },
        },
        {
            field: "stack",
            headerName: "É Qualificada?",
            width: 103,
            align: "center",
            headerAlign: "center",
            renderCell: (cellValues) => {
                return cellValues.row.e_qualificada ? (
                    <Stack direction='row' spacing={1}>
                        <CheckCircleOutlineOutlinedIcon color='success' />
                        <Typography
                            title={cellValues.row.stack ? `${((cellValues.row.stack / 5) * 100).toFixed(2)}%` : "0%"}>
                            {cellValues.row.stack !== null && cellValues.row.stack !== undefined
                                ? cellValues.row.stack
                                : 0}
                        </Typography>
                    </Stack>
                ) : (
                    <Stack direction='row' spacing={1}>
                        <CancelOutlinedIcon color='error' />
                        <Typography
                            title={cellValues.row.stack ? `${((cellValues.row.stack / 5) * 100).toFixed(2)}%` : "0%"}>
                            {cellValues.row.stack !== null && cellValues.row.stack !== undefined
                                ? cellValues.row.stack
                                : 0}
                        </Typography>
                    </Stack>
                );
            },
        },
        {
            field: "risco_crl",
            headerName: "Risco CRL",
            headerAlign: "center",
            align: "center",
            width: 78,
            renderCell: ({ value }) => {
                return (
                    <Typography title={value === null ? "Sem classificação de risco" : value}>
                        {value ? value : "R?"}
                    </Typography>
                );
            },
        },
        {
            field: "anot_baixadas_abs",
            headerName: "Anot Baixadas ABS",
            align: "center",
            headerAlign: "center",
            width: 134,
            renderCell: ({ value }: any) => {
                return (
                    <Typography color={value ? "success.light" : "text.primary"}>{value ? "Sim" : "Não"}</Typography>
                );
            },
        },
        {
            field: "anot_baixadas_rel",
            headerName: "Anot Baixadas REL",
            align: "center",
            headerAlign: "center",
            width: 132,
            renderCell: ({ value }: any) => {
                return (
                    <Typography color={value ? "success.light" : "text.primary"}>{value ? "Sim" : "Não"}</Typography>
                );
            },
        },
        {
            field: "anot_vigentes_abs",
            headerName: "Anot Vigentes ABS",
            align: "center",
            headerAlign: "center",
            width: 132,
            renderCell: ({ value }: any) => {
                return <Typography color={value ? "error.light" : "success.light"}>{value ? "Sim" : "Não"}</Typography>;
            },
        },
        {
            field: "anot_vigentes_rel",
            headerName: "Anot Vigentes REL",
            align: "center",
            headerAlign: "center",
            width: 130,
            renderCell: ({ value }: any) => {
                return <Typography color={value ? "error.light" : "success.light"}>{value ? "Sim" : "Não"}</Typography>;
            },
        },
        {
            field: "conta_tipo",
            headerName: "Tipo Conta",
            headerAlign: "center",
            align: "center",
            width: 145,
        },
        {
            field: "pacote_nome",
            headerName: "Nome Pacote",
            headerAlign: "center",
            width: 145,
        },
        {
            field: "pacote_valor",
            headerName: "Valor Pacote",
            headerAlign: "center",
            align: "center",
            width: 94,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "chesp_limite",
            headerName: "Cheque Esp. Limite",
            headerAlign: "center",
            align: "center",
            width: 134,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "chsp_data_implantacao",
            headerName: "Cheque Esp. Data Implantação",
            width: 207,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatDate(value, "DD/MM/YYYY") : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "plastico",
            headerName: "Plástico",
            headerAlign: "center",
            width: 255,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{value !== null && value !== undefined ? value : "-"}</Typography>;
            },
        },
        {
            field: "sitcartao",
            headerName: "Situação Cartão",
            headerAlign: "center",
            align: "center",
            width: 120,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{value !== null && value !== undefined ? value : "-"}</Typography>;
            },
        },
        {
            field: "data_pri_compra_cred",
            headerName: "Data Primeira Compra Crédito",
            width: 200,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatDate(value, "DD/MM/YYYY") : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "valor_limite",
            headerName: "Valor Limite",
            headerAlign: "center",
            align: "center",
            width: 115,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "limite_atribuido",
            headerName: "Limite Atribuído",
            headerAlign: "center",
            align: "center",
            width: 120,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : "-"}
                    </Typography>
                );
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
                                {dataPanelQualifiedAccounts?.title || ""}
                            </Typography>
                        </Breadcrumbs>

                        {dataPanelQualifiedAccounts && (
                            <CSATAverageRating
                                module={`Painel | ${dataPanelQualifiedAccounts.title}`}
                                routePath={`${dataPanelQualifiedAccounts.route}`}
                                isClickable
                                formProps={{
                                    module: `Painel | ${dataPanelQualifiedAccounts.title}`,
                                    routePath: `${dataPanelQualifiedAccounts.route}`,
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
                ) : dataPanelQualifiedAccounts ? (
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
                                        backgroundImage: dataPanelQualifiedAccounts.background_color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "1.5rem",
                                        fontWeight: "bold",
                                        position: "relative",
                                    }}>
                                    <Tooltip title={dataPanelQualifiedAccounts?.description || ""}>
                                        <Box
                                            position='absolute'
                                            top={5}
                                            left={8}
                                            color='white'
                                            padding='4px 8px'
                                            borderRadius='4px'>
                                            <Icon>{dataPanelQualifiedAccounts.label_icon}</Icon>
                                        </Box>
                                    </Tooltip>
                                    {movimentDatePanelQualifiedAccounts && (
                                        <Tooltip
                                            title={`Data de atualização da base de contas qualificadas do dia: ${formatDate(
                                                movimentDatePanelQualifiedAccounts,
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
                                                    {movimentDatePanelQualifiedAccounts &&
                                                        formatDate(movimentDatePanelQualifiedAccounts, "DD/MM/YYYY")}
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    )}
                                    <Tooltip title='Total de Contas Qualificadas ✅ e ❌ Não Qualificadas, com base no filtro aplicado'>
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
                                            {listPanelQualifiedAccounts &&
                                                (() => {
                                                    const totalAccounts = listPanelQualifiedAccounts.length;
                                                    const qualifiedCount = listPanelQualifiedAccounts.filter(
                                                        (item) => item.e_qualificada === true,
                                                    ).length;
                                                    const nonQualifiedCount = listPanelQualifiedAccounts.filter(
                                                        (item) => item.e_qualificada === false,
                                                    ).length;

                                                    const qualifiedPercentage = (
                                                        (qualifiedCount / totalAccounts) *
                                                        100
                                                    ).toFixed(2);
                                                    const nonQualifiedPercentage = (
                                                        (nonQualifiedCount / totalAccounts) *
                                                        100
                                                    ).toFixed(2);

                                                    return (
                                                        <>
                                                            {"✅ " +
                                                                formatNumberWithThousandsSeparator(qualifiedCount) +
                                                                ` (${qualifiedPercentage}%)` +
                                                                " | ❌ " +
                                                                formatNumberWithThousandsSeparator(nonQualifiedCount) +
                                                                ` (${nonQualifiedPercentage}%)`}
                                                        </>
                                                    );
                                                })()}
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
                                        rows={listPanelQualifiedAccounts}
                                        density='compact'
                                        localeText={dataGridLocaleTextTranslateFull}
                                        loading={loading}
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
                                        getRowClassName={(params) =>
                                            params.row.e_qualificada === true ? "active-row" : ""
                                        }
                                        sx={{
                                            ...getDataGridStyles(colorBorderSystem, colorScrollSystem),
                                            "& .active-row": {
                                                backgroundColor: theme === "light" ? "#a5d84c55" : "#95da1f24",
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
                closeButton={handleFilterPanelQualifiedAccounts}
                onClose={handleFilterPanelQualifiedAccounts}
                disableEscapeKeyDown={false}
                open={openDrawerFilter}
                sx={{
                    "& .MuiDrawer-paperAnchorRight": {
                        width: isMobile ? "100%" : "50%",
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

                        <Grid item xs={12} md={6}>
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

                        <Grid item xs={12} md={7}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_status_current_account'
                                label='Situação Conta Corrente'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={ArrayTypeStatusCurrentAccountClientComplete}
                            />
                        </Grid>

                        <Grid item xs={12} md={5}>
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

                        <Grid item xs={12} md={3}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_is_tariff'
                                label='Tarifa'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={[
                                    { id: true, label: "✅ Sim" },
                                    { id: false, label: "❌ Não" },
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_is_limit'
                                label='Limite'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={[
                                    { id: true, label: "✅ Sim" },
                                    { id: false, label: "❌ Não" },
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_is_card'
                                label='Cartão'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={[
                                    { id: true, label: "✅ Sim" },
                                    { id: false, label: "❌ Não" },
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_is_insurance'
                                label='Seguro'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={[
                                    { id: true, label: "✅ Sim" },
                                    { id: false, label: "❌ Não" },
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_is_previ_dom_bank'
                                label='Previdência / Domicílio Bancário'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={[
                                    { id: true, label: "✅ Sim" },
                                    { id: false, label: "❌ Não" },
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_qualified_account'
                                label='É Qualificada?'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={[
                                    { id: true, label: "✅ Sim" },
                                    { id: false, label: "❌ Não" },
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_annotation_current_relation'
                                label='Anot Vigente REL'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNo}
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_annotation_current_absolute'
                                label='Anot Vigente ABS'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNo}
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_annotation_downloaded_relation'
                                label='Anot Baixada REL'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNo}
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_annotation_downloaded_absolute'
                                label='Anot Baixada ABS'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNo}
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
                                        filter_client_is_rural: null,
                                        filter_status_current_account: [],
                                        filter_client_document: null,
                                        filter_is_tariff: null,
                                        filter_is_limit: null,
                                        filter_is_card: null,
                                        filter_is_insurance: null,
                                        filter_is_previ_dom_bank: null,
                                        filter_qualified_account: null,
                                        filter_annotation_current_relation: null,
                                        filter_annotation_current_absolute: null,
                                        filter_annotation_downloaded_relation: null,
                                        filter_annotation_downloaded_absolute: null,
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

            <Modal open={openModalDetail} onClose={handleModalDetail} disableEscapeKeyDown={false}>
                <Box>
                    <BoxModal
                        title={(dataDetailQualifiedAccount && dataDetailQualifiedAccount?.cliente_nome) || ""}
                        handleClose={handleModalDetail}
                        width={isMobile ? "30%" : "65%"}
                        maxHeight='95%'>
                        <Box
                            sx={{
                                maxHeight: "80vh",
                                overflow: "auto",
                                mt: -4,
                            }}>
                            {dataDetailQualifiedAccount && (
                                <>
                                    <Grid mt={2} marginInline={2}>
                                        <TableContainer
                                            sx={{
                                                border: `1px solid ${colorBorderSystem}`,
                                                borderRadius: 2.5,
                                                backgroundColor: theme === "light" ? "#ffffff" : "#00161b",
                                                boxShadow:
                                                    theme === "light"
                                                        ? "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 8px 10px -4px"
                                                        : "none",
                                                overflow: "hidden",
                                            }}>
                                            <Table
                                                sx={{
                                                    "& .MuiTableCell-root": {
                                                        borderBottom: `1px solid ${colorBorderSystem}`,
                                                        padding: "3px 12px",
                                                        fontSize: "14px",
                                                        lineHeight: 2,
                                                    },
                                                    "& .MuiTableRow-root:last-child .MuiTableCell-root": {
                                                        borderBottom: "none",
                                                    },
                                                }}
                                                size='small'>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            ID Cooperado:
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography
                                                                fontWeight={"100"}
                                                                fontSize={14}
                                                                mb={-1}
                                                                ml={-1}>
                                                                <Tooltip title='Visualizar Dados do Cooperado'>
                                                                    <IconButton
                                                                        onClick={() => {
                                                                            handleOpenModalClient();
                                                                            setIdExtClient(
                                                                                dataDetailQualifiedAccount.cliente_id,
                                                                            );
                                                                        }}
                                                                        color='success'
                                                                        aria-label='Visualizar Cooperado'>
                                                                        <AccountCircleOutlinedIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                {dataDetailQualifiedAccount.cliente_id}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Nome:
                                                        </TableCell>
                                                        <TableCell>{dataDetailQualifiedAccount.cliente_nome}</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Documento:
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatCnpjCpf(
                                                                dataDetailQualifiedAccount.cliente_documento,
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Agência:
                                                        </TableCell>
                                                        <TableCell>{dataDetailQualifiedAccount.agencia_nome}</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Carteira:
                                                        </TableCell>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.carteira_nome}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            É Rural:
                                                        </TableCell>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.e_rural ? "🌱 Sim" : "Não"}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Risco CRL:
                                                        </TableCell>
                                                        <TableCell>{dataDetailQualifiedAccount.risco_crl}</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Renda bruta:
                                                        </TableCell>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.renda_bruta !== null &&
                                                            dataDetailQualifiedAccount.renda_bruta !== undefined
                                                                ? formatToBRLCurrency(
                                                                      dataDetailQualifiedAccount.renda_bruta,
                                                                  )
                                                                : "-"}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>

                                    <Grid mt={3} marginInline={2}>
                                        <TableContainer
                                            sx={{
                                                border: `1px solid ${colorBorderSystem}`,
                                                borderRadius: 2.5,
                                                backgroundColor: theme === "light" ? "#ffffff" : "#00161b",
                                                boxShadow:
                                                    theme === "light"
                                                        ? "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 8px 10px -4px"
                                                        : "none",
                                                overflow: "hidden",
                                            }}>
                                            <Table
                                                sx={{
                                                    "& .MuiTableCell-root": {
                                                        borderBottom: `1px solid ${colorBorderSystem}`,
                                                        padding: "3px 12px",
                                                        fontSize: "14px",
                                                        lineHeight: 2,
                                                        textAlign: "center",
                                                    },
                                                    "& .MuiTableRow-root:last-child .MuiTableCell-root": {
                                                        borderBottom: "none",
                                                    },
                                                }}
                                                size='small'>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            💲 Tarifa
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            📈 Limite
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            💳 Cartão
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            🛡️ Seguro
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            🏦 Previdência / Domicílio Bancário
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            É Qualificada?
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.tarifa ? "✅" : "❌"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.limite ? "✅" : "❌"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.cartao ? "✅" : "❌"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.seguro ? "✅" : "❌"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.previ_domicilio ? "✅" : "❌"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.e_qualificada ? (
                                                                <Stack
                                                                    direction='row'
                                                                    spacing={1}
                                                                    justifyContent='center'
                                                                    alignItems='center'>
                                                                    <CheckCircleOutlineOutlinedIcon color='success' />
                                                                    <Typography>
                                                                        {dataDetailQualifiedAccount.stack !== null &&
                                                                        dataDetailQualifiedAccount.stack !== undefined
                                                                            ? dataDetailQualifiedAccount.stack +
                                                                              " | " +
                                                                              `${((dataDetailQualifiedAccount.stack / 5) * 100).toFixed(2)}%`
                                                                            : 0}
                                                                    </Typography>
                                                                </Stack>
                                                            ) : (
                                                                <Stack
                                                                    direction='row'
                                                                    spacing={1}
                                                                    justifyContent='center'
                                                                    alignItems='center'>
                                                                    <CancelOutlinedIcon color='error' />
                                                                    <Typography>
                                                                        {dataDetailQualifiedAccount.stack !== null &&
                                                                        dataDetailQualifiedAccount.stack !== undefined
                                                                            ? dataDetailQualifiedAccount.stack +
                                                                              " | " +
                                                                              `${((dataDetailQualifiedAccount.stack / 5) * 100).toFixed(2)}%`
                                                                            : 0}
                                                                    </Typography>
                                                                </Stack>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>

                                    <Grid mt={3} marginInline={2}>
                                        <TableContainer
                                            sx={{
                                                border: `1px solid ${colorBorderSystem}`,
                                                borderRadius: 2.5,
                                                backgroundColor: theme === "light" ? "#ffffff" : "#00161b",
                                                boxShadow:
                                                    theme === "light"
                                                        ? "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 8px 10px -4px"
                                                        : "none",
                                                overflow: "hidden",
                                            }}>
                                            <Table
                                                sx={{
                                                    "& .MuiTableCell-root": {
                                                        borderBottom: `1px solid ${colorBorderSystem}`,
                                                        padding: "3px 12px",
                                                        fontSize: "14px",
                                                        lineHeight: 2,
                                                        textAlign: "center",
                                                    },
                                                    "& .MuiTableRow-root:last-child .MuiTableCell-root": {
                                                        borderBottom: "none",
                                                    },
                                                }}
                                                size='small'>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Anotação Baixada ABS
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Anotação Baixada REL
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Anotação Vigente ABS
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Anotação Vigente REL
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.anot_baixadas_abs
                                                                ? "Sim"
                                                                : "Não"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.anot_baixadas_rel
                                                                ? "Sim"
                                                                : "Não"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.anot_vigentes_abs
                                                                ? "Sim"
                                                                : "Não"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.anot_vigentes_rel
                                                                ? "Sim"
                                                                : "Não"}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>

                                    <Grid mt={3} marginInline={2}>
                                        <TableContainer
                                            sx={{
                                                border: `1px solid ${colorBorderSystem}`,
                                                borderRadius: 2.5,
                                                backgroundColor: theme === "light" ? "#ffffff" : "#00161b",
                                                boxShadow:
                                                    theme === "light"
                                                        ? "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 8px 10px -4px"
                                                        : "none",
                                                overflow: "hidden",
                                            }}>
                                            <Table
                                                sx={{
                                                    "& .MuiTableCell-root": {
                                                        borderBottom: `1px solid ${colorBorderSystem}`,
                                                        padding: "3px 12px",
                                                        fontSize: "14px",
                                                        lineHeight: 2,
                                                        textAlign: "center",
                                                    },
                                                    "& .MuiTableRow-root:last-child .MuiTableCell-root": {
                                                        borderBottom: "none",
                                                    },
                                                }}
                                                size='small'>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Número da Conta Corrente:
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Modalidade da Conta Corrente:
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Situação da Conta Corrente:
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.numconta || "-"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.conta_modalidade || "-"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {statusCurrentAccountMap[
                                                                dataDetailQualifiedAccount.conta_situacao
                                                            ] || dataDetailQualifiedAccount.conta_situacao}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>

                                    <Grid mt={3} marginInline={2}>
                                        <TableContainer
                                            sx={{
                                                border: `1px solid ${colorBorderSystem}`,
                                                borderRadius: 2.5,
                                                backgroundColor: theme === "light" ? "#ffffff" : "#00161b",
                                                boxShadow:
                                                    theme === "light"
                                                        ? "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 8px 10px -4px"
                                                        : "none",
                                                overflow: "hidden",
                                            }}>
                                            <Table
                                                sx={{
                                                    "& .MuiTableCell-root": {
                                                        borderBottom: `1px solid ${colorBorderSystem}`,
                                                        padding: "3px 12px",
                                                        fontSize: "14px",
                                                        lineHeight: 2,
                                                        textAlign: "center",
                                                    },
                                                    "& .MuiTableRow-root:last-child .MuiTableCell-root": {
                                                        borderBottom: "none",
                                                    },
                                                }}
                                                size='small'>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Tipo da Conta
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Nome do Pacote
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Valor do Pacote
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.conta_tipo || "-"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.pacote_nome || "-"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.pacote_valor !== null &&
                                                            dataDetailQualifiedAccount.pacote_valor !== undefined
                                                                ? formatToBRLCurrency(
                                                                      dataDetailQualifiedAccount.pacote_valor,
                                                                  )
                                                                : "-"}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>

                                    <Grid marginBlock={3} marginInline={2}>
                                        <TableContainer
                                            sx={{
                                                border: `1px solid ${colorBorderSystem}`,
                                                borderRadius: 2.5,
                                                backgroundColor: theme === "light" ? "#ffffff" : "#00161b",
                                                boxShadow:
                                                    theme === "light"
                                                        ? "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 8px 10px -4px"
                                                        : "none",
                                                overflow: "hidden",
                                            }}>
                                            <Table
                                                sx={{
                                                    "& .MuiTableCell-root": {
                                                        borderBottom: `1px solid ${colorBorderSystem}`,
                                                        padding: "3px 12px",
                                                        fontSize: "14px",
                                                        lineHeight: 2,
                                                        textAlign: "center",
                                                    },
                                                    "& .MuiTableRow-root:last-child .MuiTableCell-root": {
                                                        borderBottom: "none",
                                                    },
                                                }}
                                                size='small'>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Plástico
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Situação do Cartão
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Data Primeira Compra Crédito
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Valor do Limite
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            Limite Atribuído
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.plastico || "-"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.sitcartao || "-"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.data_pri_compra_cred !== null &&
                                                            dataDetailQualifiedAccount.data_pri_compra_cred !==
                                                                undefined
                                                                ? formatDate(
                                                                      dataDetailQualifiedAccount.data_pri_compra_cred,
                                                                      "DD/MM/YYYY",
                                                                  )
                                                                : "-"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.valor_limite !== null &&
                                                            dataDetailQualifiedAccount.valor_limite !== undefined
                                                                ? formatToBRLCurrency(
                                                                      dataDetailQualifiedAccount.valor_limite,
                                                                  )
                                                                : "-"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {dataDetailQualifiedAccount.limite_atribuido !== null &&
                                                            dataDetailQualifiedAccount.limite_atribuido !== undefined
                                                                ? formatToBRLCurrency(
                                                                      dataDetailQualifiedAccount.limite_atribuido,
                                                                  )
                                                                : "-"}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>

                                    <Grid item mb={2} ml={2.5}>
                                        <Typography fontWeight={"100"} fontSize={12} justifyContent='end'>
                                            <Typography component={"span"} color='primary' fontSize={14}>
                                                Data Atualização:{" "}
                                            </Typography>
                                            {dataDetailQualifiedAccount.data_movimento
                                                ? formatDate(dataDetailQualifiedAccount.data_movimento, "DD/MM/YYYY")
                                                : "-"}
                                        </Typography>
                                    </Grid>
                                </>
                            )}
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
                            handleFilterPanelQualifiedAccounts();
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
