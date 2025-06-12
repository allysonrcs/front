import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
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
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import { formatCnpjCpf, formatToBRLCurrency } from "@/functions/number";
import { ExtClientInfo } from "@/components/ExtClientInfo/ExtClientInfo";
import {
    IListPreApproved,
    ISearchAllReportsCatalog,
    searchAllReportsCatalogRecords,
    searchReportsCatalogPanelPreApproved,
} from "@/services/reports";
import { BoxModal } from "@/components/BoxModal/BoxModal";
import { Link as LinkRouter } from "react-router-dom";
import WhatsAppButton from "@/components/WhatsappButton/WhatsappButton";
import { useAuth } from "@/contexts/AuthContext";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";
import FormAutocompleteMultiple from "@/components/FormComponents/FormAutocompleteMultiple";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import FormInputCpfCnpj from "@/components/FormComponents/FormInputCpfCnpj";
import { ArrayTypesAgenciesName } from "@/constants/array-type-agencies";
import { ArrayTypesPortfolioName } from "@/constants/array-type-portfolio-name";
import { ArrayTypesProfileClient } from "@/constants/array-type-profile-client";
import { LoadingButton } from "@mui/lab";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";
import { ArrayTypesFactoryFramePortfolio } from "@/constants/array-type-factory-frame-portfolio";
import { ArrayTypesFactoryFrameModality } from "@/constants/array-type-factory-frame-modality";
import { ArrayTypesRiskCRL } from "@/constants/array-type-risk-crl";
import { CSATAverageRating } from "@/components/CSATAssessments/CSATAverageRating";
import FormInput from "@/components/FormComponents/FormInput";

type AutoCompleteString = {
    id: string;
    label: string;
};

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

export type BusinessPanelPreApprovedProps = {
    filter_client_agencies?: AutoCompleteString[];
    filter_client_wallets?: AutoCompleteString[];
    filter_client_profile?: AutoCompleteString[];
    filter_portfolios?: AutoCompleteString[];
    filter_modality?: AutoCompleteString[];
    filter_client_is_rural?: AutoCompleteBoolean;
    filter_client_risk_crl?: AutoCompleteString[];
    filter_client_document?: string | null;
    filter_present_value_min?: number | null;
    filter_present_value_max?: number | null;
    filter_assigned_limit_min?: number | null;
    filter_assigned_limit_max?: number | null;
    filter_automatic_limit_min?: number | null;
    filter_automatic_limit_max?: number | null;
    filter_automatic_usage_min?: number | null;
    filter_automatic_usage_max?: number | null;
    filter_pre_approved_limit_usage_min?: number | null;
    filter_pre_approved_limit_usage_max?: number | null;
    filter_pre_approved_usage_min?: number | null;
    filter_pre_approved_usage_max?: number | null;
    filter_intramonth_indebtedness_min?: number | null;
    filter_intramonth_indebtedness_max?: number | null;
    filter_max_monthly_installment_min?: number | null;
    filter_max_monthly_installment_max?: number | null;
    filter_overdraft_limit_min?: number | null;
    filter_overdraft_limit_max?: number | null;
    filter_overdraft_used_min?: number | null;
    filter_overdraft_used_max?: number | null;
    filter_overdraft_usage_days_min?: number | null;
    filter_overdraft_usage_days_max?: number | null;
};

interface Filters {
    filter_client_agencies?: string[];
    filter_client_wallets?: string[];
    filter_client_profile?: string[];
    filter_portfolios?: string[];
    filter_modality?: string[];
    filter_client_is_rural?: string;
    filter_client_risk_crl?: string[];
    filter_client_document?: string;
    filter_present_value_min?: string;
    filter_present_value_max?: string;
    filter_assigned_limit_min?: string;
    filter_assigned_limit_max?: string;
    filter_automatic_limit_min?: string;
    filter_automatic_limit_max?: string;
    filter_automatic_usage_min?: string;
    filter_automatic_usage_max?: string;
    filter_pre_approved_limit_usage_min?: string;
    filter_pre_approved_limit_usage_max?: string;
    filter_pre_approved_usage_min?: string;
    filter_pre_approved_usage_max?: string;
    filter_intramonth_indebtedness_min?: string;
    filter_intramonth_indebtedness_max?: string;
    filter_max_monthly_installment_min?: string;
    filter_max_monthly_installment_max?: string;
    filter_overdraft_limit_min?: string;
    filter_overdraft_limit_max?: string;
    filter_overdraft_used_min?: string;
    filter_overdraft_used_max?: string;
    filter_overdraft_usage_days_min?: string;
    filter_overdraft_usage_days_max?: string;
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
    filter_client_wallets: Yup.array()
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
    filter_portfolios: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_modality: Yup.array()
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
    filter_client_risk_crl: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_client_document: Yup.string().max(18, "Máximo 18 caracteres").trim().nullable(),
    filter_present_value_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_present_value_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_assigned_limit_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_assigned_limit_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_automatic_limit_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_automatic_limit_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_automatic_usage_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_automatic_usage_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_pre_approved_limit_usage_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_pre_approved_limit_usage_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_pre_approved_usage_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_pre_approved_usage_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_intramonth_indebtedness_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_intramonth_indebtedness_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_max_monthly_installment_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_max_monthly_installment_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_overdraft_limit_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_overdraft_limit_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_overdraft_used_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_overdraft_used_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_overdraft_usage_days_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_overdraft_usage_days_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
});

export function BusinessPanelPreApproved() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [listPanelPreApproved, setListPanelPreApproved] = useState<IListPreApproved[]>([]);
    const [originalListPanelPreApproved, setOriginalListPanelPreApproved] = useState<IListPreApproved[]>([]);
    const [dataPanelPreApproved, setDataPanelPreApproved] = useState<ISearchAllReportsCatalog>();
    const [movimentDatePanelPreApproved, setMovimentDatePanelPreApproved] = useState<string>();
    const [idExtClient, setIdExtClient] = useState<number>();
    const [dataExtClient, setDataExtClient] = useState<IListPreApproved>();
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
    } = useForm<BusinessPanelPreApprovedProps | any>({
        resolver: yupResolver(validationSchema),
    });

    const filterClientAgenciesWatch = watch("filter_client_agencies");
    const filterClientPortfoliosWatch = watch("filter_client_wallets");
    const filterClientProfileWatch = watch("filter_client_profile");
    const filterPortfoliosWatch = watch("filter_portfolios");
    const filterModalityWatch = watch("filter_modality");
    const filterClientIsRuralWatch = watch("filter_client_is_rural");
    const filterClientRiskCRLWatch = watch("filter_client_risk_crl");
    const filterClientDocumentWatch = watch("filter_client_document");
    const filterPresentValueMinWatch = watch("filter_present_value_min");
    const filterPresentValueMaxWatch = watch("filter_present_value_max");
    const filterAssignedLimitMinWatch = watch("filter_assigned_limit_min");
    const filterAssignedLimitMaxWatch = watch("filter_assigned_limit_max");
    const filterAutomaticLimitMinWatch = watch("filter_automatic_limit_min");
    const filterAutomaticLimitMaxWatch = watch("filter_automatic_limit_max");
    const filterAutomaticUsageMinWatch = watch("filter_automatic_usage_min");
    const filterAutomaticUsageMaxWatch = watch("filter_automatic_usage_max");
    const filterPreApprovedLimitUsageMinWatch = watch("filter_pre_approved_limit_usage_min");
    const filterPreApprovedLimitUsageMaxWatch = watch("filter_pre_approved_limit_usage_max");
    const filterPreApprovedUsageMinWatch = watch("filter_pre_approved_usage_min");
    const filterPreApprovedUsageMaxWatch = watch("filter_pre_approved_usage_max");
    const filterIntramonthIndebtednessMinWatch = watch("filter_intramonth_indebtedness_min");
    const filterIntramonthIndebtednessMaxWatch = watch("filter_intramonth_indebtedness_max");
    const filterMaxMonthlyInstallmentMinWatch = watch("filter_max_monthly_installment_min");
    const filterMaxMonthlyInstallmentMaxWatch = watch("filter_max_monthly_installment_max");
    const filterOverdraftLimitMinWatch = watch("filter_overdraft_limit_min");
    const filterOverdraftLimitMaxWatch = watch("filter_overdraft_limit_max");
    const filterOverdraftUsedMinWatch = watch("filter_overdraft_used_min");
    const filterOverdraftUsedMaxWatch = watch("filter_overdraft_used_max");
    const filterOverdraftUsageDaysMinWatch = watch("filter_overdraft_usage_days_min");
    const filterOverdraftUsageDaysMaxWatch = watch("filter_overdraft_usage_days_max");

    useEffect(() => {
        const fetchData = async () => {
            try {
                toggleStatusBackdrop();
                setLoading(true);

                const [responsePreApprovedPanel, responseAllReports] = await Promise.all([
                    searchReportsCatalogPanelPreApproved({}),
                    searchAllReportsCatalogRecords({ route: currentPath }),
                ]);

                const { pre_aprovado, data_movimento } = responsePreApprovedPanel;
                const dataPanelPreApproved = responseAllReports[0];

                setOriginalListPanelPreApproved(pre_aprovado);
                setListPanelPreApproved(pre_aprovado);

                setMovimentDatePanelPreApproved(data_movimento);
                setDataPanelPreApproved(dataPanelPreApproved);
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
    }, [dataPanelPreApproved]);

    const handleOpenModalClient = () => {
        setOpenModalClient((oldValue) => !oldValue);
    };

    const handleModalDetail = () => {
        setOpenModalDetail((oldValue) => !oldValue);
    };

    const handleFilterPanelPreApproved = () => {
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
        const filteredData = originalListPanelPreApproved.filter((item) => {
            return (
                (!filters.filter_client_agencies ||
                    filters.filter_client_agencies.length === 0 ||
                    filters.filter_client_agencies.some((selected) => item.agencia_nome === selected)) &&
                (!filters.filter_client_wallets ||
                    filters.filter_client_wallets.length === 0 ||
                    filters.filter_client_wallets.some((selected) => item.carteira_nome === selected)) &&
                (!filters.filter_modality ||
                    filters.filter_modality.length === 0 ||
                    filters.filter_modality.some((selected) => item.modalidade === selected)) &&
                (!filters.filter_portfolios ||
                    filters.filter_portfolios.length === 0 ||
                    filters.filter_portfolios.some((selected) => item.portifolio === selected)) &&
                (!filters.filter_client_profile ||
                    filters.filter_client_profile.length === 0 ||
                    filters.filter_client_profile.some((selected) => item.cliente_perfil === selected)) &&
                (filters.filter_client_is_rural === null || item.e_rural === Boolean(filters.filter_client_is_rural)) &&
                (!filters.filter_client_risk_crl ||
                    filters.filter_client_risk_crl.length === 0 ||
                    filters.filter_client_risk_crl.some((selected) =>
                        selected === "NULL" ? item.risco_crl === null : item.risco_crl === selected,
                    )) &&
                (!filters.filter_client_document ||
                    String(item.cliente_documento).includes(
                        String(filters.filter_client_document.replace(/[\.\-\/]/g, "")),
                    )) &&
                (filters.filter_present_value_min === null ||
                    item.valor_presente >= Number(filters.filter_present_value_min)) &&
                (filters.filter_present_value_max === null ||
                    item.valor_presente <= Number(filters.filter_present_value_max)) &&
                (filters.filter_assigned_limit_min === null ||
                    item.limite_atribuido >= Number(filters.filter_assigned_limit_min)) &&
                (filters.filter_assigned_limit_max === null ||
                    item.limite_atribuido <= Number(filters.filter_assigned_limit_max)) &&
                (filters.filter_automatic_limit_min === null ||
                    item.limite_automatico >= Number(filters.filter_automatic_limit_min)) &&
                (filters.filter_automatic_limit_max === null ||
                    item.limite_automatico <= Number(filters.filter_automatic_limit_max)) &&
                (filters.filter_automatic_usage_min === null ||
                    item.uso_automatico >= Number(filters.filter_automatic_usage_min)) &&
                (filters.filter_automatic_usage_max === null ||
                    item.uso_automatico <= Number(filters.filter_automatic_usage_max)) &&
                (filters.filter_pre_approved_limit_usage_min === null ||
                    item.limite_pre_aprovado >= Number(filters.filter_pre_approved_limit_usage_min)) &&
                (filters.filter_pre_approved_limit_usage_max === null ||
                    item.limite_pre_aprovado <= Number(filters.filter_pre_approved_limit_usage_max)) &&
                (filters.filter_pre_approved_usage_min === null ||
                    item.uso_preaprov >= Number(filters.filter_pre_approved_usage_min)) &&
                (filters.filter_pre_approved_usage_max === null ||
                    item.uso_preaprov <= Number(filters.filter_pre_approved_usage_max)) &&
                (filters.filter_intramonth_indebtedness_min === null ||
                    item.endividamento_intrames >= Number(filters.filter_intramonth_indebtedness_min)) &&
                (filters.filter_intramonth_indebtedness_max === null ||
                    item.endividamento_intrames <= Number(filters.filter_intramonth_indebtedness_max)) &&
                (filters.filter_max_monthly_installment_min === null ||
                    item.max_parcela_mensal >= Number(filters.filter_max_monthly_installment_min)) &&
                (filters.filter_max_monthly_installment_max === null ||
                    item.max_parcela_mensal <= Number(filters.filter_max_monthly_installment_max)) &&
                (filters.filter_overdraft_limit_min === null ||
                    item.chesp_limite >= Number(filters.filter_overdraft_limit_min)) &&
                (filters.filter_overdraft_limit_max === null ||
                    item.chesp_limite <= Number(filters.filter_overdraft_limit_max)) &&
                (filters.filter_overdraft_used_min === null ||
                    item.chesp_usado >= Number(filters.filter_overdraft_used_min)) &&
                (filters.filter_overdraft_used_max === null ||
                    item.chesp_usado <= Number(filters.filter_overdraft_used_max)) &&
                (filters.filter_overdraft_usage_days_min === null ||
                    item.chesp_diasuso >= Number(filters.filter_overdraft_usage_days_min)) &&
                (filters.filter_overdraft_usage_days_max === null ||
                    item.chesp_diasuso <= Number(filters.filter_overdraft_usage_days_max))
            );
        });

        setListPanelPreApproved(filteredData);
    };

    useEffect(() => {
        const filtersWatch = {
            filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_wallets: filterClientPortfoliosWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_profile: filterClientProfileWatch?.map((item: { label: string }) => item.label) || [],
            filter_portfolios: filterPortfoliosWatch?.map((item: { label: string }) => item.label) || [],
            filter_modality: filterModalityWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_is_rural: filterClientIsRuralWatch?.id !== undefined ? filterClientIsRuralWatch?.id : null,
            filter_client_risk_crl: filterClientRiskCRLWatch?.map((item: { id: string }) => item.id) || [],
            filter_client_document: filterClientDocumentWatch || null,
            filter_present_value_min: filterPresentValueMinWatch || null,
            filter_present_value_max: filterPresentValueMaxWatch || null,
            filter_assigned_limit_min: filterAssignedLimitMinWatch || null,
            filter_assigned_limit_max: filterAssignedLimitMaxWatch || null,
            filter_automatic_limit_min: filterAutomaticLimitMinWatch || null,
            filter_automatic_limit_max: filterAutomaticLimitMaxWatch || null,
            filter_automatic_usage_min: filterAutomaticUsageMinWatch || null,
            filter_automatic_usage_max: filterAutomaticUsageMaxWatch || null,
            filter_pre_approved_limit_usage_min: filterPreApprovedLimitUsageMinWatch || null,
            filter_pre_approved_limit_usage_max: filterPreApprovedLimitUsageMaxWatch || null,
            filter_pre_approved_usage_min: filterPreApprovedUsageMinWatch || null,
            filter_pre_approved_usage_max: filterPreApprovedUsageMaxWatch || null,
            filter_intramonth_indebtedness_min: filterIntramonthIndebtednessMinWatch || null,
            filter_intramonth_indebtedness_max: filterIntramonthIndebtednessMaxWatch || null,
            filter_max_monthly_installment_min: filterMaxMonthlyInstallmentMinWatch || null,
            filter_max_monthly_installment_max: filterMaxMonthlyInstallmentMaxWatch || null,
            filter_overdraft_limit_min: filterOverdraftLimitMinWatch || null,
            filter_overdraft_limit_max: filterOverdraftLimitMaxWatch || null,
            filter_overdraft_used_min: filterOverdraftUsedMinWatch || null,
            filter_overdraft_used_max: filterOverdraftUsedMaxWatch || null,
            filter_overdraft_usage_days_min: filterOverdraftUsageDaysMinWatch || null,
            filter_overdraft_usage_days_max: filterOverdraftUsageDaysMaxWatch || null,
        };

        applyFilters(filtersWatch);
    }, [
        filterClientAgenciesWatch,
        filterClientPortfoliosWatch,
        filterClientProfileWatch,
        filterPortfoliosWatch,
        filterModalityWatch,
        filterClientIsRuralWatch,
        filterClientRiskCRLWatch,
        filterClientDocumentWatch,
        filterPresentValueMinWatch,
        filterPresentValueMaxWatch,
        filterAssignedLimitMinWatch,
        filterAssignedLimitMaxWatch,
        filterAutomaticLimitMinWatch,
        filterAutomaticLimitMaxWatch,
        filterAutomaticUsageMinWatch,
        filterAutomaticUsageMaxWatch,
        filterPreApprovedLimitUsageMinWatch,
        filterPreApprovedLimitUsageMaxWatch,
        filterPreApprovedUsageMinWatch,
        filterPreApprovedUsageMaxWatch,
        filterIntramonthIndebtednessMinWatch,
        filterIntramonthIndebtednessMaxWatch,
        filterMaxMonthlyInstallmentMinWatch,
        filterMaxMonthlyInstallmentMaxWatch,
        filterOverdraftLimitMinWatch,
        filterOverdraftLimitMaxWatch,
        filterOverdraftUsedMinWatch,
        filterOverdraftUsedMaxWatch,
        filterOverdraftUsageDaysMinWatch,
        filterOverdraftUsageDaysMaxWatch,
    ]);

    const filters = {
        filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_wallets: filterClientPortfoliosWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_profile: filterClientProfileWatch?.map((item: { label: string }) => item.label) || [],
        filter_portfolios: filterPortfoliosWatch?.map((item: { label: string }) => item.label) || [],
        filter_modality: filterModalityWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_is_rural: filterClientIsRuralWatch?.label,
        filter_client_risk_crl: filterClientRiskCRLWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_document: filterClientDocumentWatch,
        filter_present_value_min: filterPresentValueMinWatch,
        filter_present_value_max: filterPresentValueMaxWatch,
        filter_assigned_limit_min: filterAssignedLimitMinWatch,
        filter_assigned_limit_max: filterAssignedLimitMaxWatch,
        filter_automatic_limit_min: filterAutomaticLimitMinWatch,
        filter_automatic_limit_max: filterAutomaticLimitMaxWatch,
        filter_automatic_usage_min: filterAutomaticUsageMinWatch,
        filter_automatic_usage_max: filterAutomaticUsageMaxWatch,
        filter_pre_approved_limit_usage_min: filterPreApprovedLimitUsageMinWatch,
        filter_pre_approved_limit_usage_max: filterPreApprovedLimitUsageMaxWatch,
        filter_pre_approved_usage_min: filterPreApprovedUsageMinWatch,
        filter_pre_approved_usage_max: filterPreApprovedUsageMaxWatch,
        filter_intramonth_indebtedness_min: filterIntramonthIndebtednessMinWatch,
        filter_intramonth_indebtedness_max: filterIntramonthIndebtednessMaxWatch,
        filter_max_monthly_installment_min: filterMaxMonthlyInstallmentMinWatch,
        filter_max_monthly_installment_max: filterMaxMonthlyInstallmentMaxWatch,
        filter_overdraft_limit_min: filterOverdraftLimitMinWatch,
        filter_overdraft_limit_max: filterOverdraftLimitMaxWatch,
        filter_overdraft_used_min: filterOverdraftUsedMinWatch,
        filter_overdraft_used_max: filterOverdraftUsedMaxWatch,
        filter_overdraft_usage_days_min: filterOverdraftUsageDaysMinWatch,
        filter_overdraft_usage_days_max: filterOverdraftUsageDaysMaxWatch,
    };

    const labelsMap = {
        filter_client_agencies: "Agências",
        filter_client_wallets: "Carteiras",
        filter_client_profile: "Perfil",
        filter_portfolios: "Portfólios",
        filter_modality: "Modalidades",
        filter_client_is_rural: "É Rural",
        filter_client_risk_crl: "Risco CRL",
        filter_client_document: "CPF/CNPJ",
        filter_present_value_min: "Valor Presente - Min",
        filter_present_value_max: "Valor Presente - Max",
        filter_assigned_limit_min: "Limite Atribuído - Min",
        filter_assigned_limit_max: "Limite Atribuído - Max",
        filter_automatic_limit_min: "Limite Automático - Min",
        filter_automatic_limit_max: "Limite Automático - Max",
        filter_automatic_usage_min: "Uso Automático - Min",
        filter_automatic_usage_max: "Uso Automático - Min",
        filter_pre_approved_limit_usage_min: "Uso Limite Pré Aprovado - Min",
        filter_pre_approved_limit_usage_max: "Uso Limite Pré Aprovado - Max",
        filter_pre_approved_usage_min: "Uso Pré Aprovado - Min",
        filter_pre_approved_usage_max: "Uso Pré Aprovado - Max",
        filter_intramonth_indebtedness_min: "Endividamento Intramês - Min",
        filter_intramonth_indebtedness_max: "Endividamento Intramês - Min",
        filter_max_monthly_installment_min: "Max Parcela Mensal - Min",
        filter_max_monthly_installment_max: "Max Parcela Mensal - Max",
        filter_overdraft_limit_min: "Cheque Especial Limite - Min",
        filter_overdraft_limit_max: "Cheque Especial Limite - Max",
        filter_overdraft_used_min: "Cheque Especial Usado - Min",
        filter_overdraft_used_max: "Cheque Especial Usado - Max",
        filter_overdraft_usage_days_min: "Cheque Especial Dias Uso - Min",
        filter_overdraft_usage_days_max: "Cheque Especial Dias Uso - Max",
    };

    const clearAllFilters = () => {
        reset({
            filter_client_agencies: [],
            filter_client_wallets: [],
            filter_client_profile: [],
            filter_portfolios: [],
            filter_modality: [],
            filter_client_is_rural: null,
            filter_client_risk_crl: [],
            filter_client_document: null,
            filter_present_value_min: null,
            filter_present_value_max: null,
            filter_assigned_limit_min: null,
            filter_assigned_limit_max: null,
            filter_automatic_limit_min: null,
            filter_automatic_limit_max: null,
            filter_automatic_usage_min: null,
            filter_automatic_usage_max: null,
            filter_pre_approved_limit_usage_min: null,
            filter_pre_approved_limit_usage_max: null,
            filter_pre_approved_usage_min: null,
            filter_pre_approved_usage_max: null,
            filter_intramonth_indebtedness_min: null,
            filter_intramonth_indebtedness_max: null,
            filter_max_monthly_installment_min: null,
            filter_max_monthly_installment_max: null,
            filter_overdraft_limit_min: null,
            filter_overdraft_limit_max: null,
            filter_overdraft_used_min: null,
            filter_overdraft_used_max: null,
            filter_overdraft_usage_days_min: null,
            filter_overdraft_usage_days_max: null,
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
                            onClick={handleFilterPanelPreApproved}>
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
            align: "center",
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatCnpjCpf(value)}</Typography>;
            },
        },
        {
            field: "agencia_nome",
            headerName: "PA",
            minWidth: 165,
            flex: 1,
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
            field: "cliente_perfil",
            headerName: "Perfil",
            minWidth: 200,
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "e_rural",
            headerName: "É Rural",
            minWidth: 80,
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return <Typography>{value ? "🌱 Sim" : "      Não"}</Typography>;
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
            field: "email",
            headerName: "E-mail",
            minWidth: 250,
            headerAlign: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{value ? value.toLowerCase() : ""}</Typography>;
            },
        },
        {
            field: "risco_crl",
            headerName: "Risco CRL",
            minWidth: 80,
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "pd",
            headerName: "PD",
            width: 70,
            headerAlign: "center",
            align: "center",
            flex: 1,
        },
        {
            field: "portifolio",
            headerName: "Portfolio",
            minWidth: 180,
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "modalidade",
            headerName: "Modalidade",
            minWidth: 130,
            headerAlign: "center",
            align: "center",
            flex: 1,
        },
        {
            field: "valor_presente",
            headerName: "Valor Presente",
            minWidth: 125,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : ""}
                    </Typography>
                );
            },
        },
        {
            field: "limite_atribuido",
            headerName: "Limite Atribuído",
            minWidth: 125,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : ""}
                    </Typography>
                );
            },
        },
        {
            field: "limite_automatico",
            headerName: "Limite Automático",
            minWidth: 130,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : ""}
                    </Typography>
                );
            },
        },
        {
            field: "uso_automatico",
            headerName: "Uso Automático",
            minWidth: 130,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : ""}
                    </Typography>
                );
            },
        },
        {
            field: "limite_pre_aprovado",
            headerName: "Uso Limite Pré Aprovado",
            minWidth: 170,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : ""}
                    </Typography>
                );
            },
        },
        {
            field: "uso_preaprov",
            headerName: "Uso Pré Aprovado",
            minWidth: 135,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : ""}
                    </Typography>
                );
            },
        },
        {
            field: "endividamento_intrames",
            headerName: "Endividamento Intramês",
            minWidth: 170,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : ""}
                    </Typography>
                );
            },
        },
        {
            field: "max_parcela_mensal",
            headerName: "Max Parcela Mensal",
            minWidth: 160,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : ""}
                    </Typography>
                );
            },
        },
        {
            field: "chesp_limite",
            headerName: "Cheque Esp. Limite",
            headerAlign: "center",
            align: "center",
            width: 157,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "chesp_usado",
            headerName: "Cheque Esp. Usado",
            headerAlign: "center",
            align: "center",
            width: 158,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "chesp_diasuso",
            headerName: "Cheque Esp. Dia Uso",
            headerAlign: "center",
            align: "center",
            width: 167,
            renderCell: ({ value }) => {
                return <Typography>{value !== null && value !== undefined ? value : "-"}</Typography>;
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
                                {dataPanelPreApproved?.title || ""}
                            </Typography>
                        </Breadcrumbs>

                        {dataPanelPreApproved && (
                            <CSATAverageRating
                                module={`Painel | ${dataPanelPreApproved.title}`}
                                routePath={`${dataPanelPreApproved.route}`}
                                isClickable
                                formProps={{
                                    module: `Painel | ${dataPanelPreApproved.title}`,
                                    routePath: `${dataPanelPreApproved.route}`,
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
                ) : dataPanelPreApproved ? (
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
                                        backgroundImage: dataPanelPreApproved.background_color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "1.5rem",
                                        fontWeight: "bold",
                                        position: "relative",
                                    }}>
                                    <Tooltip title={dataPanelPreApproved?.description || ""}>
                                        <Box
                                            position='absolute'
                                            top={5}
                                            left={8}
                                            color='white'
                                            padding='4px 8px'
                                            borderRadius='4px'>
                                            <Icon>{dataPanelPreApproved.label_icon}</Icon>
                                        </Box>
                                    </Tooltip>
                                    {movimentDatePanelPreApproved && (
                                        <Tooltip
                                            title={`Data de atualização da base de pré aprovados do dia: ${formatDate(
                                                movimentDatePanelPreApproved,
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
                                                    {movimentDatePanelPreApproved &&
                                                        formatDate(movimentDatePanelPreApproved, "DD/MM/YYYY")}
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    )}
                                    <Tooltip title='Total dos Limites Automáticos Aprovados'>
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
                                            {listPanelPreApproved &&
                                                formatToBRLCurrency(
                                                    listPanelPreApproved.reduce(
                                                        (total, item) => total + (item.limite_pre_aprovado || 0),
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
                                        rows={listPanelPreApproved}
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
                                                    email: false,
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
                        width='65%'
                        maxHeight='95%'>
                        <Box
                            sx={{
                                maxHeight: "75vh",
                                overflow: "auto",
                                mt: -4,
                            }}>
                            {dataExtClient && (
                                <>
                                    <Grid container mt={1.5} paddingInline={!isMobile ? 2 : 0} spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TableContainer
                                                sx={{
                                                    border: `1px solid ${colorBorderSystem}`,
                                                    borderRadius: 2.5,
                                                    backgroundColor: theme === "light" ? "#F4F6F8" : "#00161b",
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
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
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
                                                                                    dataExtClient.cliente_id,
                                                                                );
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
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                Nome:
                                                            </TableCell>
                                                            <TableCell>{dataExtClient.cliente_nome}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Nome Fantasia:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataExtClient.cliente_fantasia || "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Documento:
                                                            </TableCell>
                                                            <TableCell>
                                                                {formatCnpjCpf(dataExtClient.cliente_documento)}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                É Rural:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataExtClient.e_rural ? "🌱 Sim" : "Não"}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Agência:
                                                            </TableCell>
                                                            <TableCell>{dataExtClient.agencia_nome}</TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <TableContainer
                                                sx={{
                                                    border: `1px solid ${colorBorderSystem}`,
                                                    borderRadius: 2.5,
                                                    backgroundColor: theme === "light" ? "#F4F6F8" : "#00161b",
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
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Perfil:
                                                            </TableCell>
                                                            <TableCell>{dataExtClient.cliente_perfil || "-"}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Melhor Contato:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataExtClient.melhor_contato ? (
                                                                    <Box
                                                                        display='flex'
                                                                        alignItems='center'
                                                                        gap={0.5}
                                                                        ml={-1}>
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
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                E-mail:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataExtClient.email
                                                                    ? dataExtClient.email.toLowerCase()
                                                                    : "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Risco CRL:
                                                            </TableCell>
                                                            <TableCell>{dataExtClient.risco_crl || "-"}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                PD:
                                                            </TableCell>
                                                            <TableCell>{dataExtClient.pd || "-"}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Carteira:
                                                            </TableCell>
                                                            <TableCell>{dataExtClient.carteira_nome}</TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>
                                    </Grid>

                                    <Grid container mt={1.5} paddingInline={!isMobile ? 2 : 0} spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TableContainer
                                                sx={{
                                                    border: `1px solid ${colorBorderSystem}`,
                                                    borderRadius: 2.5,
                                                    backgroundColor: theme === "light" ? "#F4F6F8" : "#00161b",
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
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Portfólio:
                                                            </TableCell>
                                                            <TableCell>{dataExtClient.portifolio || "-"}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Modalidade:
                                                            </TableCell>
                                                            <TableCell>{dataExtClient.modalidade || "-"}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Submodalidade:
                                                            </TableCell>
                                                            <TableCell>{dataExtClient.submodalidade || "-"}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Valor Presente:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataExtClient.valor_presente !== null &&
                                                                dataExtClient.valor_presente !== undefined
                                                                    ? formatToBRLCurrency(dataExtClient.valor_presente)
                                                                    : "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Limite Atribuído:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataExtClient.limite_atribuido !== null &&
                                                                dataExtClient.limite_atribuido !== undefined
                                                                    ? formatToBRLCurrency(
                                                                          dataExtClient.limite_atribuido,
                                                                      )
                                                                    : "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Limite Automático:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataExtClient.limite_automatico !== null &&
                                                                dataExtClient.limite_automatico !== undefined
                                                                    ? formatToBRLCurrency(
                                                                          dataExtClient.limite_automatico,
                                                                      )
                                                                    : "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Uso Automático:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataExtClient.uso_automatico !== null &&
                                                                dataExtClient.uso_automatico !== undefined
                                                                    ? formatToBRLCurrency(dataExtClient.uso_automatico)
                                                                    : "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>

                                        <Grid item xs={12} md>
                                            <TableContainer
                                                sx={{
                                                    border: `1px solid ${colorBorderSystem}`,
                                                    borderRadius: 2.5,
                                                    backgroundColor: theme === "light" ? "#F4F6F8" : "#00161b",
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
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Limite Pré Aprovado:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataExtClient.limite_pre_aprovado !== null &&
                                                                dataExtClient.limite_pre_aprovado !== undefined
                                                                    ? formatToBRLCurrency(
                                                                          dataExtClient.limite_pre_aprovado,
                                                                      )
                                                                    : "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Uso Pré Aprovado:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataExtClient.uso_preaprov !== null &&
                                                                dataExtClient.uso_preaprov !== undefined
                                                                    ? formatToBRLCurrency(dataExtClient.uso_preaprov)
                                                                    : "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Endividamento Intramês:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataExtClient.endividamento_intrames !== null &&
                                                                dataExtClient.endividamento_intrames !== undefined
                                                                    ? formatToBRLCurrency(
                                                                          dataExtClient.endividamento_intrames,
                                                                      )
                                                                    : "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Máximo de Parcela Mensal:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataExtClient.max_parcela_mensal !== null &&
                                                                dataExtClient.max_parcela_mensal !== undefined
                                                                    ? formatToBRLCurrency(
                                                                          dataExtClient.max_parcela_mensal,
                                                                      )
                                                                    : "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Cheque Especial Limite:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataExtClient.chesp_limite !== null &&
                                                                dataExtClient.chesp_limite !== undefined
                                                                    ? formatToBRLCurrency(dataExtClient.chesp_limite)
                                                                    : "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Cheque Especial Usado:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataExtClient.chesp_usado !== null &&
                                                                dataExtClient.chesp_usado !== undefined
                                                                    ? formatToBRLCurrency(dataExtClient.chesp_usado)
                                                                    : "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: "bold",
                                                                    color: "text.primary",
                                                                    whiteSpace: "nowrap",
                                                                }}>
                                                                Cheque Especial Dias de Uso:
                                                            </TableCell>
                                                            <TableCell>{dataExtClient.chesp_diasuso || "-"}</TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>
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

            <TemporaryDrawer
                title='Filtro Listagem'
                closeButton={handleFilterPanelPreApproved}
                onClose={handleFilterPanelPreApproved}
                disableEscapeKeyDown={false}
                open={openDrawerFilter}
                sx={{
                    "& .MuiDrawer-paperAnchorRight": {
                        width: isMobile ? "100%" : "45%",
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

                        <Grid item xs={12} md={6}>
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

                        <Grid item xs={12} md={6}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_client_wallets'
                                label='Carteira(s)'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={ArrayTypesPortfolioName}
                            />
                        </Grid>

                        <Grid item xs={12} md={5}>
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

                        <Grid item xs={12} md={3}>
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

                        <Grid item xs={12} md={4}>
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

                        <Grid item xs={12} md={6}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_portfolios'
                                label='Portfólio'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={ArrayTypesFactoryFramePortfolio}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_modality'
                                label='Modalidade'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={ArrayTypesFactoryFrameModality}
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
                                label='Valor Presente - Min'
                                placeholder='Digite um número'
                                name='filter_present_value_min'
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
                                label='Valor Presente - Max'
                                placeholder='Digite um número'
                                name='filter_present_value_max'
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

                        <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='Limite Atribuído - Min'
                                placeholder='Digite um número'
                                name='filter_assigned_limit_min'
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
                                label='Limite Atribuído - Max'
                                placeholder='Digite um número'
                                name='filter_assigned_limit_max'
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

                        <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='Limite Automático - Min'
                                placeholder='Digite um número'
                                name='filter_automatic_limit_min'
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
                                label='Limite Automático - Max'
                                placeholder='Digite um número'
                                name='filter_automatic_limit_max'
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

                        <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='Uso Automático - Min'
                                placeholder='Digite um número'
                                name='filter_automatic_usage_min'
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
                                label='Uso Automático - Max'
                                placeholder='Digite um número'
                                name='filter_automatic_usage_max'
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

                        <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='Uso Limite Pré Aprovado - Min'
                                placeholder='Digite um número'
                                name='filter_pre_approved_limit_usage_min'
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
                                label='Uso Limite Pré Aprovado - Max'
                                placeholder='Digite um número'
                                name='filter_pre_approved_limit_usage_max'
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

                        <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='Uso Pré Aprovado - Min'
                                placeholder='Digite um número'
                                name='filter_pre_approved_usage_min'
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
                                label='Uso Pré Aprovado - Max'
                                placeholder='Digite um número'
                                name='filter_pre_approved_usage_max'
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

                        <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='Endividamento Intramês - Min'
                                placeholder='Digite um número'
                                name='filter_intramonth_indebtedness_min'
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
                                label='Endividamento Intramês - Max'
                                placeholder='Digite um número'
                                name='filter_intramonth_indebtedness_max'
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

                        <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='Max Parcela Mensal - Min'
                                placeholder='Digite um número'
                                name='filter_max_monthly_installment_min'
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
                                label='Max Parcela Mensal - Max'
                                placeholder='Digite um número'
                                name='filter_max_monthly_installment_max'
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

                        <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='Cheque Especial Limite - Min'
                                placeholder='Digite um número'
                                name='filter_overdraft_limit_min'
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
                                label='Cheque Especial Limite - Max'
                                placeholder='Digite um número'
                                name='filter_overdraft_limit_max'
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

                        <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='Cheque Especial Usado - Min'
                                placeholder='Digite um número'
                                name='filter_overdraft_used_min'
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
                                label='Cheque Especial Usado - Max'
                                placeholder='Digite um número'
                                name='filter_overdraft_used_max'
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

                        <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='Cheque Especial Dias Uso - Min'
                                placeholder='Digite um número'
                                name='filter_overdraft_usage_days_min'
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
                                label='Cheque Especial Dias Uso - Max'
                                placeholder='Digite um número'
                                name='filter_overdraft_usage_days_max'
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
                                        filter_client_wallets: [],
                                        filter_client_profile: [],
                                        filter_portfolios: [],
                                        filter_modality: [],
                                        filter_client_is_rural: null,
                                        filter_client_risk_crl: [],
                                        filter_client_document: null,
                                        filter_present_value_min: "",
                                        filter_present_value_max: "",
                                        filter_assigned_limit_min: "",
                                        filter_assigned_limit_max: "",
                                        filter_automatic_limit_min: "",
                                        filter_automatic_limit_max: "",
                                        filter_automatic_usage_min: "",
                                        filter_automatic_usage_max: "",
                                        filter_pre_approved_limit_usage_min: "",
                                        filter_pre_approved_limit_usage_max: "",
                                        filter_pre_approved_usage_min: "",
                                        filter_pre_approved_usage_max: "",
                                        filter_intramonth_indebtedness_min: "",
                                        filter_intramonth_indebtedness_max: "",
                                        filter_max_monthly_installment_min: "",
                                        filter_max_monthly_installment_max: "",
                                        filter_overdraft_limit_min: "",
                                        filter_overdraft_limit_max: "",
                                        filter_overdraft_used_min: "",
                                        filter_overdraft_used_max: "",
                                        filter_overdraft_usage_days_min: "",
                                        filter_overdraft_usage_days_max: "",
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
                            handleFilterPanelPreApproved();
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
