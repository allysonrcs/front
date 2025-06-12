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
    GridRenderCellParams,
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
    IListPanelInadCards,
    ISearchAllReportsCatalog,
    searchAllReportsCatalogRecords,
    searchReportsCatalogPanelInadCards,
} from "@/services/reports";
import { BoxModal } from "@/components/BoxModal/BoxModal";
import { Link as LinkRouter } from "react-router-dom";
import WhatsAppButton from "@/components/WhatsappButton/WhatsappButton";
import IconMasterCardSVG from "@/assets/icons/icon-master-card.svg?react";
import IconVisaCardSVG from "@/assets/icons/icon-visa-card.svg?react";
import IconBndesCardSVG from "@/assets/icons/icon-bndes-card.svg?react";
import IconCabalCardPNG from "@/assets/icons/icon-cabal-logo.png";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";
import FormAutocompleteMultiple from "@/components/FormComponents/FormAutocompleteMultiple";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import FormInput from "@/components/FormComponents/FormInput";
import FormInputCpfCnpj from "@/components/FormComponents/FormInputCpfCnpj";
import FormDatePicker from "@/components/FormComponents/FormDatePicker";
import moment from "moment";
import { LoadingButton } from "@mui/lab";
import { useAuth } from "@/contexts/AuthContext";
import { ArrayTypesAgenciesName } from "@/constants/array-type-agencies";
import { ArrayTypesPortfolioName } from "@/constants/array-type-portfolio-name";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";
import { CSATAverageRating } from "@/components/CSATAssessments/CSATAverageRating";
import { ArrayTypesYesOrNo } from "@/constants/array-type-yes-or-no";

const statusSituationCardsMap: { [key: string]: string } = {
    OPERATIVO: "🟢 OPERATIVO",
    BLOQUEADO: "🟠 BLOQUEADO",
    CANCELADO: "🔴 CANCELADO",
};

type Bandeira = "MASTER" | "VISA" | "BNDES" | "CABAL";

const bandeiras: {
    [key in Bandeira]: {
        icon: JSX.Element;
    };
} = {
    MASTER: {
        icon: <IconMasterCardSVG width={35} />,
    },
    VISA: {
        icon: <IconVisaCardSVG height={13} />,
    },
    BNDES: {
        icon: <IconBndesCardSVG width={45} />,
    },
    CABAL: {
        icon: <img src={IconCabalCardPNG} alt='cabal' style={{ width: 25, height: 25 }} />,
    },
};

type AutoCompleteString = {
    id: string;
    label: string;
};

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

export type BusinessPanelInadCardsProps = {
    filter_client_agencies?: AutoCompleteString[];
    filter_client_portfolio?: AutoCompleteString[];
    filter_client_is_rural?: AutoCompleteBoolean;
    filter_date_end_validity?: Date | null;
    filter_card_status?: AutoCompleteString;
    filter_card?: AutoCompleteString[];
    filter_client_document?: string | null;
    filter_days_late_min?: number;
    filter_days_late_max?: number;
    filter_limit_value_min?: number | null;
    filter_limit_value_max?: number | null;
    filter_consolidated_debt_value_min?: number | null;
    filter_consolidated_debt_value_max?: number | null;
    filter_minimum_payment_value_min?: number | null;
    filter_minimum_payment_value_max?: number | null;
    filter_invoice_value_min?: number | null;
    filter_invoice_value_max?: number | null;
    filter_honors_endorsements?: AutoCompleteBoolean;
    filter_anot_vig_abs?: AutoCompleteBoolean;
};

interface Filters {
    filter_client_agencies?: string[];
    filter_client_portfolio?: string[];
    filter_client_is_rural?: string;
    filter_date_end_validity?: string | null;
    filter_card_status?: string;
    filter_card?: string[];
    filter_client_document?: string;
    filter_days_late_min?: string;
    filter_days_late_max?: string;
    filter_limit_value_min?: string;
    filter_limit_value_max?: string;
    filter_consolidated_debt_value_min?: string;
    filter_consolidated_debt_value_max?: string;
    filter_minimum_payment_value_min?: string;
    filter_minimum_payment_value_max?: string;
    filter_invoice_value_min?: string;
    filter_invoice_value_max?: string;
    filter_honors_endorsements?: string;
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
    filter_client_is_rural: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_date_end_validity: Yup.date().nullable().typeError("Digite uma data válida"),
    filter_card_status: Yup.object()
        .shape({
            id: Yup.string().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_card: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_client_document: Yup.string().max(18, "Máximo 18 caracteres").trim().nullable(),
    filter_days_late_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_days_late_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_limit_value_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_limit_value_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_consolidated_debt_value_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_consolidated_debt_value_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_minimum_payment_value_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_minimum_payment_value_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_invoice_value_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_invoice_value_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_honors_endorsements: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_anot_vig_abs: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
});

export function BusinessPanelInadCards() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [listPanelInadCards, setListPanelInadCards] = useState<IListPanelInadCards[]>([]);
    const [originalListInadCards, setOriginalListInadCards] = useState<IListPanelInadCards[]>([]);
    const [dataPanelInadCards, setDataPanelInadCards] = useState<ISearchAllReportsCatalog>();
    const [movimentDatePanelInadCard, setMovimentDatePanelInadCard] = useState<string>();
    const [idExtClient, setIdExtClient] = useState<number>();
    const [dataExtClient, setDataExtClient] = useState<IListPanelInadCards>();
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);
    const [openDrawerFilter, setOpenDrawerFilter] = useState(false);
    const [openModalClient, setOpenModalClient] = useState(false);
    const [openModalDetail, setOpenModalDetail] = useState(false);

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
    } = useForm<BusinessPanelInadCardsProps | any>({
        resolver: yupResolver(validationSchema),
    });

    const filterClientAgenciesWatch = watch("filter_client_agencies");
    const filterClientPortfolioWatch = watch("filter_client_portfolio");
    const filterClientIsRuralWatch = watch("filter_client_is_rural");
    const filterDateEndValidityWatch = watch("filter_date_end_validity");
    const filterCardStatusWatch = watch("filter_card_status");
    const filterCardWatch = watch("filter_card");
    const filterClientDocumentWatch = watch("filter_client_document");
    const filterDaysLateMinWatch = watch("filter_days_late_min");
    const filterDaysLateMaxWatch = watch("filter_days_late_max");
    const filterLimitValueMinWatch = watch("filter_limit_value_min");
    const filterLimitValueMaxWatch = watch("filter_limit_value_max");
    const filterConsolidatedDebtValueMinWatch = watch("filter_consolidated_debt_value_min");
    const filterConsolidatedDebtValueMaxWatch = watch("filter_consolidated_debt_value_max");
    const filterMinimumPaymentValueMinWatch = watch("filter_minimum_payment_value_min");
    const filterMinimumPaymentValueMaxWatch = watch("filter_minimum_payment_value_max");
    const filterInvoiceValueMinWatch = watch("filter_invoice_value_min");
    const filterInvoiceValueMaxWatch = watch("filter_invoice_value_max");
    const filterHonorsEndorsementsWatch = watch("filter_honors_endorsements");
    const filterAnotVigABSWatch = watch("filter_anot_vig_abs");

    useEffect(() => {
        const fetchData = async () => {
            try {
                toggleStatusBackdrop();
                setLoading(true);

                const [responseInadCardsPanel, responseAllReports] = await Promise.all([
                    searchReportsCatalogPanelInadCards({}),
                    searchAllReportsCatalogRecords({ route: currentPath }),
                ]);

                const { inad_cartoes, data_movimento } = responseInadCardsPanel;
                const dataPanelresponseInadCardsPanel = responseAllReports[0];

                setOriginalListInadCards(inad_cartoes);
                setListPanelInadCards(inad_cartoes);
                setMovimentDatePanelInadCard(data_movimento);
                setDataPanelInadCards(dataPanelresponseInadCardsPanel);
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
    }, [dataPanelInadCards]);

    const handleFilterPanelInadCards = () => {
        setOpenDrawerFilter((oldValue) => !oldValue);
        setSpeedDialOpen(true);
    };

    const handleOpenModalClient = () => {
        setOpenModalClient((oldValue) => !oldValue);
    };

    const handleModalDetail = () => {
        setOpenModalDetail((oldValue) => !oldValue);
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
        const filteredData = originalListInadCards.filter((item) => {
            return (
                (!filters.filter_client_agencies ||
                    filters.filter_client_agencies.length === 0 ||
                    filters.filter_client_agencies.some((selected) => item.agencia_nome === selected)) &&
                (!filters.filter_client_portfolio ||
                    filters.filter_client_portfolio.length === 0 ||
                    filters.filter_client_portfolio.some((selected) => item.carteira_nome === selected)) &&
                (!filters.filter_date_end_validity ||
                    moment(item.data_vencimento).isSame(moment(filters.filter_date_end_validity), "day")) &&
                (filters.filter_card_status === null || item.situacao === String(filters.filter_card_status)) &&
                (!filters.filter_card ||
                    filters.filter_card.length === 0 ||
                    filters.filter_card.some((selected) => item.bandeira === selected)) &&
                (!filters.filter_client_document ||
                    String(item.cliente_documento).includes(
                        String(filters.filter_client_document.replace(/[\.\-\/]/g, "")),
                    )) &&
                (filters.filter_client_is_rural === null || item.e_rural === Boolean(filters.filter_client_is_rural)) &&
                (filters.filter_anot_vig_abs === null ||
                    item.anot_vigentes_abs === Boolean(filters.filter_anot_vig_abs)) &&
                (filters.filter_honors_endorsements === null ||
                    item.vira_honra_esse_mes === Boolean(filters.filter_honors_endorsements)) &&
                (filters.filter_days_late_min === null || item.dias_atraso >= Number(filters.filter_days_late_min)) &&
                (filters.filter_days_late_max === null || item.dias_atraso <= Number(filters.filter_days_late_max)) &&
                (filters.filter_limit_value_min === null ||
                    item.valor_limite >= Number(filters.filter_limit_value_min)) &&
                (filters.filter_limit_value_max === null ||
                    item.valor_limite <= Number(filters.filter_limit_value_max)) &&
                (filters.filter_consolidated_debt_value_min === null ||
                    item.valor_divida_cons >= Number(filters.filter_consolidated_debt_value_min)) &&
                (filters.filter_consolidated_debt_value_max === null ||
                    item.valor_divida_cons <= Number(filters.filter_consolidated_debt_value_max)) &&
                (filters.filter_invoice_value_min === null ||
                    item.valor_fatura >= Number(filters.filter_invoice_value_min)) &&
                (filters.filter_invoice_value_max === null ||
                    item.valor_fatura <= Number(filters.filter_invoice_value_max)) &&
                (filters.filter_minimum_payment_value_min === null ||
                    item.pag_minimo >= Number(filters.filter_minimum_payment_value_min)) &&
                (filters.filter_minimum_payment_value_max === null ||
                    item.pag_minimo <= Number(filters.filter_minimum_payment_value_max))
            );
        });

        setListPanelInadCards(filteredData);
    };

    useEffect(() => {
        const filtersWatch = {
            filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_portfolio: filterClientPortfolioWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_is_rural: filterClientIsRuralWatch?.id !== undefined ? filterClientIsRuralWatch?.id : null,
            filter_date_end_validity: filterDateEndValidityWatch
                ? moment(filterDateEndValidityWatch).format("YYYY-MM-DD")
                : null,
            filter_card_status: filterCardStatusWatch?.id !== undefined ? filterCardStatusWatch?.id : null,
            filter_card: filterCardWatch?.map((item: { id: string }) => item.id) || [],
            filter_client_document: filterClientDocumentWatch || null,
            filter_days_late_min: filterDaysLateMinWatch || null,
            filter_days_late_max: filterDaysLateMaxWatch || null,
            filter_limit_value_min: filterLimitValueMinWatch || null,
            filter_limit_value_max: filterLimitValueMaxWatch || null,
            filter_consolidated_debt_value_min: filterConsolidatedDebtValueMinWatch || null,
            filter_consolidated_debt_value_max: filterConsolidatedDebtValueMaxWatch || null,
            filter_minimum_payment_value_min: filterMinimumPaymentValueMinWatch || null,
            filter_minimum_payment_value_max: filterMinimumPaymentValueMaxWatch || null,
            filter_invoice_value_min: filterInvoiceValueMinWatch || null,
            filter_invoice_value_max: filterInvoiceValueMaxWatch || null,
            filter_honors_endorsements:
                filterHonorsEndorsementsWatch?.id !== undefined ? filterHonorsEndorsementsWatch?.id : null,
            filter_anot_vig_abs: filterAnotVigABSWatch?.id !== undefined ? filterAnotVigABSWatch?.id : null,
        };

        applyFilters(filtersWatch);
    }, [
        filterClientAgenciesWatch,
        filterClientPortfolioWatch,
        filterClientIsRuralWatch,
        filterDateEndValidityWatch,
        filterCardStatusWatch,
        filterCardWatch,
        filterClientDocumentWatch,
        filterDaysLateMinWatch,
        filterDaysLateMaxWatch,
        filterLimitValueMinWatch,
        filterLimitValueMaxWatch,
        filterConsolidatedDebtValueMinWatch,
        filterConsolidatedDebtValueMaxWatch,
        filterMinimumPaymentValueMinWatch,
        filterMinimumPaymentValueMaxWatch,
        filterInvoiceValueMinWatch,
        filterInvoiceValueMaxWatch,
        filterHonorsEndorsementsWatch,
        filterAnotVigABSWatch,
    ]);

    const filters = {
        filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_portfolio: filterClientPortfolioWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_is_rural: filterClientIsRuralWatch?.label,
        filter_date_end_validity: filterDateEndValidityWatch
            ? moment(filterDateEndValidityWatch).format("DD/MM/YYYY")
            : null,
        filter_card_status: filterCardStatusWatch?.label,
        filter_card: filterCardWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_document: filterClientDocumentWatch,
        filter_days_late_min: filterDaysLateMinWatch,
        filter_days_late_max: filterDaysLateMaxWatch,
        filter_limit_value_min: filterLimitValueMinWatch,
        filter_limit_value_max: filterLimitValueMaxWatch,
        filter_consolidated_debt_value_min: filterConsolidatedDebtValueMinWatch,
        filter_consolidated_debt_value_max: filterConsolidatedDebtValueMaxWatch,
        filter_minimum_payment_value_min: filterMinimumPaymentValueMinWatch,
        filter_minimum_payment_value_max: filterMinimumPaymentValueMaxWatch,
        filter_invoice_value_min: filterInvoiceValueMinWatch,
        filter_invoice_value_max: filterInvoiceValueMaxWatch,
        filter_honors_endorsements: filterHonorsEndorsementsWatch?.label,
        filter_anot_vig_abs: filterAnotVigABSWatch?.label,
    };

    const labelsMap = {
        filter_client_agencies: "Agência(s)",
        filter_client_portfolio: "Carteira(s)",
        filter_client_is_rural: "É Rural",
        filter_date_end_validity: "Data Vencimento",
        filter_card_status: "Situação Cartão",
        filter_card: "Cartão",
        filter_client_document: "CPF/CNPJ",
        filter_days_late_min: "Dias Atraso - Min",
        filter_days_late_max: "Dias Atraso - Max",
        filter_limit_value_min: "Valor Limite - Min",
        filter_limit_value_max: "Valor Limite - Max",
        filter_consolidated_debt_value_min: "Valor Dívida Consolidado - Min",
        filter_consolidated_debt_value_max: "Valor Dívida Consolidado - Max",
        filter_minimum_payment_value_min: "Pagamento Mínimo - Min",
        filter_minimum_payment_value_max: "Pagamento Mínimo - Max",
        filter_invoice_value_min: "Valor Fatura - Min",
        filter_invoice_value_max: "Valor Fatura - Max",
        filter_honors_endorsements: "Vira honras/avais este mês",
        filter_anot_vig_abs: "Anot Vigente ABS",
    };

    const clearAllFilters = () => {
        reset({
            filter_client_agencies: [],
            filter_client_portfolio: [],
            filter_client_is_rural: null,
            filter_date_end_validity: null,
            filter_card_status: null,
            filter_card: [],
            filter_client_document: null,
            filter_days_late_min: null,
            filter_days_late_max: null,
            filter_limit_value_min: null,
            filter_limit_value_max: null,
            filter_consolidated_debt_value_min: null,
            filter_consolidated_debt_value_max: null,
            filter_minimum_payment_value_min: null,
            filter_minimum_payment_value_max: null,
            filter_invoice_value_min: null,
            filter_invoice_value_max: null,
            filter_honors_endorsements: null,
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
                            onClick={handleFilterPanelInadCards}>
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
            width: 165,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "carteira_nome",
            headerName: "Carteira",
            minWidth: 165,
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
            field: "data_vencimento",
            headerName: "Data Vencimento",
            minWidth: 130,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY")}</Typography>;
            },
        },
        {
            field: "dias_atraso",
            headerName: "Dias Atraso",
            minWidth: 90,
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "bandeira",
            headerName: "Bandeira",
            minWidth: 70,
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: (params: GridRenderCellParams) => {
                const value = params.value as Bandeira | undefined;

                const bandeiraInfo =
                    value && bandeiras[value] ? bandeiras[value] : { icon: null, label: value || "Indefinido" };

                return (
                    <Stack direction='row' alignItems='center' justifyContent='center'>
                        {bandeiraInfo.icon}
                    </Stack>
                );
            },
        },
        {
            field: "conta_cartao",
            headerName: "Conta Cartão",
            minWidth: 130,
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "situacao",
            headerName: "Situação",
            minWidth: 110,
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{statusSituationCardsMap[value]}</Typography>;
            },
        },
        {
            field: "valor_limite",
            headerName: "Valor Limite",
            minWidth: 100,
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : ""}
                    </Typography>
                );
            },
        },
        {
            field: "valor_divida_cons",
            headerName: "Valor Dívida Consolidada",
            minWidth: 170,
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : ""}
                    </Typography>
                );
            },
        },
        {
            field: "valor_fatura",
            headerName: "Valor Fatura",
            minWidth: 100,
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : ""}
                    </Typography>
                );
            },
        },
        {
            field: "pag_minimo",
            headerName: "Pagamento Mínimo",
            minWidth: 140,
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : ""}
                    </Typography>
                );
            },
        },
        {
            field: "contato_sipagnet",
            headerName: "Contato Sipagnet",
            minWidth: 140,
            flex: 1,
            headerAlign: "center",
            align: "left",
            renderCell: ({ value }) => {
                return <WhatsAppButton phoneNumber={value} message='Olá, tudo bem? Gostariamos de falar com você' />;
            },
        },
        {
            field: "contato_sisbr",
            headerName: "Contato Sisbr",
            minWidth: 140,
            flex: 1,
            headerAlign: "center",
            align: "left",
            renderCell: ({ value }) => {
                return <WhatsAppButton phoneNumber={value} message='Olá, tudo bem? Gostariamos de falar com você' />;
            },
        },
        {
            field: "vira_honra_em",
            headerName: "Vira Honras/Avais em",
            minWidth: 150,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                if (!value) return null;

                const endDate = moment(value, "YYYY-MM-DD");
                const today = moment();

                let emoji = "";
                let isValid = false;

                if (endDate.isSameOrBefore(today, "day")) {
                    emoji = "🔴";
                    isValid = true;
                } else {
                    emoji = "⚠️";
                }

                return (
                    <Typography fontSize={14} color={isValid ? "error" : "text.primary"}>
                        {emoji} {formatDate(value, "DD/MM/YYYY")}
                    </Typography>
                );
            },
        },
        {
            field: "vira_honra_esse_mes",
            headerName: "Vira Honras/Avais este mês?",
            width: 198,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }: any) => {
                return <Typography color={value ? "error" : "text.primary"}>{value ? "Sim" : "Não"}</Typography>;
            },
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
                            <Typography sx={{ color: "text.secondary" }}>{dataPanelInadCards?.title || ""}</Typography>
                        </Breadcrumbs>

                        {dataPanelInadCards && (
                            <CSATAverageRating
                                module={`Painel | ${dataPanelInadCards.title}`}
                                routePath={`${dataPanelInadCards.route}`}
                                isClickable
                                formProps={{
                                    module: `Painel | ${dataPanelInadCards.title}`,
                                    routePath: `${dataPanelInadCards.route}`,
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
                ) : dataPanelInadCards ? (
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
                                        backgroundImage: dataPanelInadCards.background_color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "1.5rem",
                                        fontWeight: "bold",
                                        position: "relative",
                                    }}>
                                    <Tooltip title={dataPanelInadCards?.description || ""}>
                                        <Box
                                            position='absolute'
                                            top={5}
                                            left={8}
                                            color='white'
                                            padding='4px 8px'
                                            borderRadius='4px'>
                                            <Icon>{dataPanelInadCards.label_icon}</Icon>
                                        </Box>
                                    </Tooltip>
                                    {movimentDatePanelInadCard && (
                                        <Tooltip
                                            title={`Data de atualização da base de inad cartões do dia: ${formatDate(
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
                                            {listPanelInadCards &&
                                                formatNumberWithThousandsSeparator(listPanelInadCards.length)}
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
                                        rows={listPanelInadCards}
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
                                maxHeight: "80vh",
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
                                                        Data de Vencimento:
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(dataExtClient.data_vencimento, "DD/MM/YYYY")}
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
                                                        Conta Cartão:
                                                    </TableCell>
                                                    <TableCell>{dataExtClient.conta_cartao}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Bandeira Cartão:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.bandeira ? (
                                                            <Typography fontSize={14}>
                                                                {(() => {
                                                                    const value = dataExtClient.bandeira as
                                                                        | Bandeira
                                                                        | undefined;

                                                                    const bandeiraInfo =
                                                                        value && bandeiras[value]
                                                                            ? bandeiras[value]
                                                                            : {
                                                                                  icon: null,
                                                                                  label: value || "Indefinido",
                                                                              };

                                                                    return (
                                                                        <Stack direction='row' alignItems='center'>
                                                                            {bandeiraInfo.icon}
                                                                        </Stack>
                                                                    );
                                                                })()}
                                                            </Typography>
                                                        ) : (
                                                            ""
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Situação Cartão:
                                                    </TableCell>
                                                    <TableCell>{dataExtClient.situacao}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Valor Limite:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.valor_limite !== null &&
                                                        dataExtClient.valor_limite !== undefined
                                                            ? formatToBRLCurrency(dataExtClient.valor_limite)
                                                            : ""}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Valor da Fatura:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.valor_fatura !== null &&
                                                        dataExtClient.valor_fatura !== undefined
                                                            ? formatToBRLCurrency(dataExtClient.valor_fatura)
                                                            : ""}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Valor da Dívida Consolidada:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.valor_divida_cons !== null &&
                                                        dataExtClient.valor_divida_cons !== undefined
                                                            ? formatToBRLCurrency(dataExtClient.valor_divida_cons)
                                                            : ""}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Pagamento Mínimo:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.pag_minimo !== null &&
                                                        dataExtClient.pag_minimo !== undefined
                                                            ? formatToBRLCurrency(dataExtClient.pag_minimo)
                                                            : ""}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Contato Sipagnet:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.contato_sipagnet ? (
                                                            <Box display='flex' alignItems='center' gap={0.5} ml={-1}>
                                                                <WhatsAppButton
                                                                    phoneNumber={dataExtClient.contato_sipagnet}
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
                                                        Contato Sisbr:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.contato_sisbr ? (
                                                            <Box display='flex' alignItems='center' gap={0.5} ml={-1}>
                                                                <WhatsAppButton
                                                                    phoneNumber={dataExtClient.contato_sisbr}
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
                                                        Vira Honras/Avais este mês?:
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            color={
                                                                dataExtClient.vira_honra_esse_mes
                                                                    ? "error"
                                                                    : "text.primary"
                                                            }>
                                                            {dataExtClient.vira_honra_esse_mes ? "Sim" : "Não"}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Vira Honra/Avais em:
                                                    </TableCell>
                                                    <TableCell>
                                                        {(() => {
                                                            if (!dataExtClient.vira_honra_em) return null;

                                                            const endDate = moment(
                                                                dataExtClient.vira_honra_em,
                                                                "YYYY-MM-DD",
                                                            );
                                                            const today = moment();

                                                            let emoji = "";
                                                            let isValid = false;

                                                            if (endDate.isSameOrBefore(today, "day")) {
                                                                emoji = "🔴";
                                                                isValid = true;
                                                            } else {
                                                                emoji = "⚠️";
                                                            }

                                                            return (
                                                                <Typography
                                                                    fontSize={14}
                                                                    color={isValid ? "error" : "text.primary"}>
                                                                    {emoji}{" "}
                                                                    {formatDate(
                                                                        dataExtClient.vira_honra_em,
                                                                        "DD/MM/YYYY",
                                                                    )}
                                                                </Typography>
                                                            );
                                                        })()}
                                                    </TableCell>
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
                closeButton={handleFilterPanelInadCards}
                onClose={handleFilterPanelInadCards}
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

                        <Grid item xs={12} md={8.25}>
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

                        <Grid item xs={12} md={3.75}>
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

                        <Grid item xs={12} md={4.5}>
                            <FormDatePicker
                                fullWidth
                                name='filter_date_end_validity'
                                label='Data Vencimento'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                            />
                        </Grid>

                        <Grid item xs={12} md={3.75}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_card_status'
                                label='Situação Cartão'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={[
                                    { id: "OPERATIVO", label: "🟢 OPERATIVO" },
                                    { id: "BLOQUEADO", label: "🟠 BLOQUEADO" },
                                    { id: "CANCELADO", label: "🔴 CANCELADO" },
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12} md={3.75}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_card'
                                label='Bandeira Cartão'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={[
                                    { id: "VISA", label: "VISA" },
                                    { id: "MASTER", label: "MASTERCARD" },
                                    { id: "CABAL", label: "CABAL" },
                                    { id: "BNDES", label: "BNDES" },
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_honors_endorsements'
                                label='Vira Honras/Avais este mês?'
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
                                name='filter_anot_vig_abs'
                                label='Tem Anotação Vigente ABS?'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNo}
                            />
                        </Grid>

                        <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='Valor Limite - Min'
                                placeholder='Digite um número'
                                name='filter_limit_value_min'
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
                                label='Valor Limite - Max'
                                placeholder='Digite um número'
                                name='filter_limit_value_max'
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
                                label='Valor Dívida Cons - Min'
                                placeholder='Digite um número'
                                name='filter_consolidated_debt_value_min'
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
                                label='Valor Dívida Cons - Max'
                                placeholder='Digite um número'
                                name='filter_consolidated_debt_value_max'
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
                                label='Valor Fatura - Min'
                                placeholder='Digite um número'
                                name='filter_invoice_value_min'
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
                                label='Valor Fatura - Max'
                                placeholder='Digite um número'
                                name='filter_invoice_value_max'
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
                                label='Pagamento Mínimo - Min'
                                placeholder='Digite um número'
                                name='filter_minimum_payment_value_min'
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
                                label='Pagamento Mínimo - Max'
                                placeholder='Digite um número'
                                name='filter_minimum_payment_value_max'
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
                                        filter_client_is_rural: null,
                                        filter_days_late_min: "",
                                        filter_days_late_max: "",
                                        filter_date_end_validity: null,
                                        filter_card_status: null,
                                        filter_card: [],
                                        filter_client_document: null,
                                        filter_limit_value_min: "",
                                        filter_limit_value_max: "",
                                        filter_consolidated_debt_value_min: "",
                                        filter_consolidated_debt_value_max: "",
                                        filter_minimum_payment_value_min: "",
                                        filter_minimum_payment_value_max: "",
                                        filter_invoice_value_min: "",
                                        filter_invoice_value_max: "",
                                        filter_honors_endorsements: null,
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
                            handleFilterPanelInadCards();
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
