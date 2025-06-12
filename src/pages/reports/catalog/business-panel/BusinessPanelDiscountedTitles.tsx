import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
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
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import { Link as LinkRouter } from "react-router-dom";
import { formatCnpjCpf, formatPercentage, formatToBRLCurrency } from "@/functions/number";
import { ExtClientInfo } from "@/components/ExtClientInfo/ExtClientInfo";
import {
    IListPanelDiscountedTitles,
    ISearchAllReportsCatalog,
    searchAllReportsCatalogRecords,
    searchReportsCatalogPanelDiscountedTitles,
} from "@/services/reports";
import WhatsAppButton from "@/components/WhatsappButton/WhatsappButton";
import moment from "moment";
import { BoxModal } from "@/components/BoxModal/BoxModal";
import { ArrayTypesAgenciesName } from "@/constants/array-type-agencies";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingButton } from "@mui/lab";
import FormAutocompleteMultiple from "@/components/FormComponents/FormAutocompleteMultiple";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import FormInputCpfCnpj from "@/components/FormComponents/FormInputCpfCnpj";
import FormDatePicker from "@/components/FormComponents/FormDatePicker";
import FormInput from "@/components/FormComponents/FormInput";
import { ArrayTypesPortfolioName } from "@/constants/array-type-portfolio-name";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";
import { CSATAverageRating } from "@/components/CSATAssessments/CSATAverageRating";

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

type AutoCompleteString = {
    id: string;
    label: string;
};

export type PortfoliosMigrationProps = {
    is_active?: AutoCompleteBoolean;
};

export type BusinessPanelDiscountedTitlesProps = {
    filter_client_agencies?: AutoCompleteString[];
    filter_client_portfolio?: AutoCompleteString[];
    filter_client_is_rural: AutoCompleteBoolean;
    filter_client_document?: string | null;
    filter_date_end_validity_min?: Date | null;
    filter_date_end_validity_max?: Date | null;
    filter_cls_total_min?: number | null;
    filter_cls_total_max?: number | null;
    filter_cls_used_min?: number | null;
    filter_cls_used_max?: number | null;
    filter_cls_available_min?: number | null;
    filter_cls_available_max?: number | null;
    filter_limit_total_contracted_min?: number | null;
    filter_limit_total_contracted_max?: number | null;
    filter_limit_distributed_min?: number | null;
    filter_limit_distributed_max?: number | null;
    filter_limit_distributed_used_min?: number | null;
    filter_limit_distributed_used_max?: number | null;
    filter_limit_distributed_available_min?: number | null;
    filter_limit_distributed_available_max?: number | null;
    filter_billing_margin_total_min?: number | null;
    filter_billing_margin_total_max?: number | null;
    filter_billing_margin_used_min?: number | null;
    filter_billing_margin_used_max?: number | null;
    filter_billing_margin_available_min?: number | null;
    filter_billing_margin_available_max?: number | null;
    filter_check_margin_total_min?: number | null;
    filter_check_margin_total_max?: number | null;
    filter_check_margin_used_min?: number | null;
    filter_check_margin_used_max?: number | null;
    filter_check_margin_available_min?: number | null;
    filter_check_margin_available_max?: number | null;
};

interface Filters {
    filter_client_agencies?: string[];
    filter_client_portfolio?: string[];
    filter_client_is_rural?: string;
    filter_client_document?: string;
    filter_date_end_validity_min?: string | null;
    filter_date_end_validity_max?: string | null;
    filter_cls_total_min?: string;
    filter_cls_total_max?: string;
    filter_cls_used_min?: string;
    filter_cls_used_max?: string;
    filter_cls_available_min?: string;
    filter_cls_available_max?: string;
    filter_limit_total_contracted_min?: string;
    filter_limit_total_contracted_max?: string;
    filter_limit_distributed_min?: string;
    filter_limit_distributed_max?: string;
    filter_limit_distributed_used_min?: string;
    filter_limit_distributed_used_max?: string;
    filter_limit_distributed_available_min?: string;
    filter_limit_distributed_available_max?: string;
    filter_billing_margin_total_min?: string;
    filter_billing_margin_total_max?: string;
    filter_billing_margin_used_min?: string;
    filter_billing_margin_used_max?: string;
    filter_billing_margin_available_min?: string;
    filter_billing_margin_available_max?: string;
    filter_check_margin_total_min?: string;
    filter_check_margin_total_max?: string;
    filter_check_margin_used_min?: string;
    filter_check_margin_used_max?: string;
    filter_check_margin_available_min?: string;
    filter_check_margin_available_max?: string;
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
    filter_client_document: Yup.string().max(18, "Máximo 18 caracteres").trim().nullable(),
    filter_date_end_validity_min: Yup.date().nullable().typeError("Digite uma data válida"),
    filter_date_end_validity_max: Yup.date().nullable().typeError("Digite uma data válida"),
    filter_cls_total_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_cls_total_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_cls_used_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_cls_used_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_cls_available_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_cls_available_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_limit_total_contracted_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_limit_total_contracted_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_limit_distributed_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_limit_distributed_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_limit_distributed_used_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_limit_distributed_used_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_limit_distributed_available_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_limit_distributed_available_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_billing_margin_total_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_billing_margin_total_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_billing_margin_used_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_billing_margin_used_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_billing_margin_available_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_billing_margin_available_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_check_margin_total_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_check_margin_total_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_check_margin_used_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_check_margin_used_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_check_margin_available_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_check_margin_available_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
});

export function BusinessPanelDiscountedTitles() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [listPanelDiscountedTitles, setListPanelDiscountedTitles] = useState<IListPanelDiscountedTitles[]>([]);
    const [originalListPanelDiscountedTitles, setOriginalListPanelDiscountedTitles] = useState<
        IListPanelDiscountedTitles[]
    >([]);
    const [dataPanelDiscountedTitles, setDataPanelDiscountedTitles] = useState<ISearchAllReportsCatalog>();
    const [movimentDatePanelDiscountedTitles, setMovimentDatePanelDiscountedTitles] = useState<string>();
    const [idExtClient, setIdExtClient] = useState<number>();
    const [dataExtClient, setDataExtClient] = useState<IListPanelDiscountedTitles>();
    const [openModalClient, setOpenModalClient] = useState(false);
    const [openModalDetail, setOpenModalDetail] = useState(false);
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);
    const [openDrawerFilter, setOpenDrawerFilter] = useState(false);

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
    const today = moment();

    const {
        control,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<BusinessPanelDiscountedTitlesProps | any>({
        resolver: yupResolver(validationSchema),
    });

    const filterClientAgenciesWatch = watch("filter_client_agencies");
    const filterClientPortfolioWatch = watch("filter_client_portfolio");
    const filterClientIsRuralWatch = watch("filter_client_is_rural");
    const filterClientDocumentWatch = watch("filter_client_document");
    const filterDateEndValidityMinWatch = watch("filter_date_end_validity_min");
    const filterDateEndValidityMaxWatch = watch("filter_date_end_validity_max");
    const filterCLSTotalMinWatch = watch("filter_cls_total_min");
    const filterCLSTotalMaxWatch = watch("filter_cls_total_max");
    const filterCLSUsedMinWatch = watch("filter_cls_used_min");
    const filterCLSUsedMaxWatch = watch("filter_cls_used_max");
    const filterCLSAvailableMinWatch = watch("filter_cls_available_min");
    const filterCLSAvailableMaxWatch = watch("filter_cls_available_max");
    const filterLimitTotalContractedMinWatch = watch("filter_limit_total_contracted_min");
    const filterLimitTotalContractedMaxWatch = watch("filter_limit_total_contracted_max");
    const filterLimitDistributedMinWatch = watch("filter_limit_distributed_min");
    const filterLimitDistributedMaxWatch = watch("filter_limit_distributed_max");
    const filterLimitDistributedUsedMinWatch = watch("filter_limit_distributed_used_min");
    const filterLimitDistributedUsedMaxWatch = watch("filter_limit_distributed_used_max");
    const filterLimitDistributedAvailableMinWatch = watch("filter_limit_distributed_available_min");
    const filterLimitDistributedAvailableMaxWatch = watch("filter_limit_distributed_available_max");
    const filterBillingMarginTotalMinWatch = watch("filter_billing_margin_total_min");
    const filterBillingMarginTotalMaxWatch = watch("filter_billing_margin_total_max");
    const filterBillingMarginUsedMinWatch = watch("filter_billing_margin_used_min");
    const filterBillingMarginUsedMaxWatch = watch("filter_billing_margin_used_max");
    const filterBillingMarginAvailableMinWatch = watch("filter_billing_margin_available_min");
    const filterBillingMarginAvailableMaxWatch = watch("filter_billing_margin_available_max");
    const filterCheckMarginTotalMinWatch = watch("filter_check_margin_total_min");
    const filterCheckMarginTotalMaxWatch = watch("filter_check_margin_total_max");
    const filterCheckMarginUsedMinWatch = watch("filter_check_margin_used_min");
    const filterCheckMarginUsedMaxWatch = watch("filter_check_margin_used_max");
    const filterCheckMarginAvailableMinWatch = watch("filter_check_margin_available_min");
    const filterCheckMarginAvailableMaxWatch = watch("filter_check_margin_available_max");

    useEffect(() => {
        const fetchData = async () => {
            try {
                toggleStatusBackdrop();
                setLoading(true);

                const [responseDiscountedTitlesPanel, responseAllReports] = await Promise.all([
                    searchReportsCatalogPanelDiscountedTitles({}),
                    searchAllReportsCatalogRecords({ route: currentPath }),
                ]);

                const { titulos_descontados, data_movimento } = responseDiscountedTitlesPanel;
                const dataPanelDiscountedTitles = responseAllReports[0];

                setOriginalListPanelDiscountedTitles(titulos_descontados);
                setListPanelDiscountedTitles(titulos_descontados);

                setMovimentDatePanelDiscountedTitles(data_movimento);
                setDataPanelDiscountedTitles(dataPanelDiscountedTitles);
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
    }, [dataPanelDiscountedTitles]);

    const handleOpenModalClient = () => {
        setOpenModalClient((oldValue) => !oldValue);
    };

    const handleModalDetail = () => {
        setOpenModalDetail((oldValue) => !oldValue);
    };

    const handleFilterPanelDiscountedTitles = () => {
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
        const filteredData = originalListPanelDiscountedTitles.filter((item) => {
            return (
                ((!filters.filter_client_agencies ||
                    filters.filter_client_agencies.length === 0 ||
                    filters.filter_client_agencies.some((selected) => item.agencia_nome === selected)) &&
                    (!filters.filter_client_portfolio ||
                        filters.filter_client_portfolio.length === 0 ||
                        filters.filter_client_portfolio.some((selected) => item.carteira_nome === selected)) &&
                    (filters.filter_client_is_rural === null ||
                        item.e_rural === Boolean(filters.filter_client_is_rural)) &&
                    (!filters.filter_client_document ||
                        String(item.cliente_documento).includes(
                            String(filters.filter_client_document.replace(/[\.\-\/]/g, "")),
                        )) &&
                    (filters.filter_cls_total_min === null || item.cls_total >= Number(filters.filter_cls_total_min)) &&
                    (filters.filter_cls_total_max === null || item.cls_total <= Number(filters.filter_cls_total_max)) &&
                    (filters.filter_cls_used_min === null ||
                        item.cls_utilizado >= Number(filters.filter_cls_used_min)) &&
                    (filters.filter_cls_used_max === null ||
                        item.cls_utilizado <= Number(filters.filter_cls_used_max)) &&
                    (filters.filter_cls_available_min === null ||
                        item.cls_disponivel >= Number(filters.filter_cls_available_min)) &&
                    (filters.filter_cls_available_max === null ||
                        item.cls_disponivel <= Number(filters.filter_cls_available_max)) &&
                    (filters.filter_limit_total_contracted_min === null ||
                        item.limite_total_contratado >= Number(filters.filter_limit_total_contracted_min)) &&
                    (filters.filter_limit_total_contracted_max === null ||
                        item.limite_total_contratado <= Number(filters.filter_limit_total_contracted_max)) &&
                    (filters.filter_limit_distributed_min === null ||
                        item.limite_distribuido >= Number(filters.filter_limit_distributed_min)) &&
                    (filters.filter_limit_distributed_max === null ||
                        item.limite_distribuido <= Number(filters.filter_limit_distributed_max)) &&
                    (filters.filter_limit_distributed_used_min === null ||
                        item.limite_distribuido_utilizado >= Number(filters.filter_limit_distributed_used_min)) &&
                    (filters.filter_limit_distributed_used_max === null ||
                        item.limite_distribuido_utilizado <= Number(filters.filter_limit_distributed_used_max)) &&
                    (filters.filter_limit_distributed_available_min === null ||
                        item.limite_distribuido_disponivel >= Number(filters.filter_limit_distributed_available_min)) &&
                    (filters.filter_limit_distributed_available_max === null ||
                        item.limite_distribuido_disponivel <= Number(filters.filter_limit_distributed_available_max)) &&
                    (filters.filter_billing_margin_total_min === null ||
                        item.b_margem_total >= Number(filters.filter_billing_margin_total_min)) &&
                    (filters.filter_billing_margin_total_max === null ||
                        item.b_margem_total <= Number(filters.filter_billing_margin_total_max)) &&
                    (filters.filter_billing_margin_used_min === null ||
                        item.b_margem_utilizada >= Number(filters.filter_billing_margin_used_min)) &&
                    (filters.filter_billing_margin_used_max === null ||
                        item.b_margem_utilizada <= Number(filters.filter_billing_margin_used_max)) &&
                    (filters.filter_billing_margin_available_min === null ||
                        item.b_margem_disponivel >= Number(filters.filter_billing_margin_available_min)) &&
                    (filters.filter_billing_margin_available_max === null ||
                        item.b_margem_disponivel <= Number(filters.filter_billing_margin_available_max)) &&
                    (filters.filter_check_margin_total_min === null ||
                        item.c_margem_total >= Number(filters.filter_check_margin_total_min)) &&
                    (filters.filter_check_margin_total_max === null ||
                        item.c_margem_total <= Number(filters.filter_check_margin_total_max)) &&
                    (filters.filter_check_margin_used_min === null ||
                        item.c_margem_utilizada >= Number(filters.filter_check_margin_used_min)) &&
                    (filters.filter_check_margin_used_max === null ||
                        item.c_margem_utilizada <= Number(filters.filter_check_margin_used_max)) &&
                    (filters.filter_check_margin_available_min === null ||
                        item.c_margem_disponivel >= Number(filters.filter_check_margin_available_min)) &&
                    (filters.filter_check_margin_available_max === null ||
                        item.c_margem_disponivel <= Number(filters.filter_check_margin_available_max)) &&
                    !filters.filter_date_end_validity_min &&
                    !filters.filter_date_end_validity_max) ||
                (moment(item.fim_vigencia).isSameOrAfter(moment(filters.filter_date_end_validity_min), "day") &&
                    moment(item.fim_vigencia).isSameOrBefore(moment(filters.filter_date_end_validity_max), "day"))
            );
        });

        setListPanelDiscountedTitles(filteredData);
    };

    useEffect(() => {
        const filtersWatch = {
            filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_portfolio: filterClientPortfolioWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_is_rural: filterClientIsRuralWatch?.id !== undefined ? filterClientIsRuralWatch?.id : null,
            filter_client_document: filterClientDocumentWatch || null,
            filter_date_end_validity_min: filterDateEndValidityMinWatch
                ? moment(filterDateEndValidityMinWatch).format("YYYY-MM-DD")
                : null,
            filter_date_end_validity_max: filterDateEndValidityMaxWatch
                ? moment(filterDateEndValidityMaxWatch).format("YYYY-MM-DD")
                : null,
            filter_cls_total_min: filterCLSTotalMinWatch || null,
            filter_cls_total_max: filterCLSTotalMaxWatch || null,
            filter_cls_used_min: filterCLSUsedMinWatch || null,
            filter_cls_used_max: filterCLSUsedMaxWatch || null,
            filter_cls_available_min: filterCLSAvailableMinWatch || null,
            filter_cls_available_max: filterCLSAvailableMaxWatch || null,
            filter_limit_total_contracted_min: filterLimitTotalContractedMinWatch || null,
            filter_limit_total_contracted_max: filterLimitTotalContractedMaxWatch || null,
            filter_limit_distributed_min: filterLimitDistributedMinWatch || null,
            filter_limit_distributed_max: filterLimitDistributedMaxWatch || null,
            filter_limit_distributed_used_min: filterLimitDistributedUsedMinWatch || null,
            filter_limit_distributed_used_max: filterLimitDistributedUsedMaxWatch || null,
            filter_limit_distributed_available_min: filterLimitDistributedAvailableMinWatch || null,
            filter_limit_distributed_available_max: filterLimitDistributedAvailableMaxWatch || null,
            filter_billing_margin_total_min: filterBillingMarginTotalMinWatch || null,
            filter_billing_margin_total_max: filterBillingMarginTotalMaxWatch || null,
            filter_billing_margin_used_min: filterBillingMarginUsedMinWatch || null,
            filter_billing_margin_used_max: filterBillingMarginUsedMaxWatch || null,
            filter_billing_margin_available_min: filterBillingMarginAvailableMinWatch || null,
            filter_billing_margin_available_max: filterBillingMarginAvailableMaxWatch || null,
            filter_check_margin_total_min: filterCheckMarginTotalMinWatch || null,
            filter_check_margin_total_max: filterCheckMarginTotalMaxWatch || null,
            filter_check_margin_used_min: filterCheckMarginUsedMinWatch || null,
            filter_check_margin_used_max: filterCheckMarginUsedMaxWatch || null,
            filter_check_margin_available_min: filterCheckMarginAvailableMinWatch || null,
            filter_check_margin_available_max: filterCheckMarginAvailableMaxWatch || null,
        };

        applyFilters(filtersWatch);
    }, [
        filterClientAgenciesWatch,
        filterClientPortfolioWatch,
        filterClientIsRuralWatch,
        filterClientDocumentWatch,
        filterDateEndValidityMinWatch,
        filterDateEndValidityMaxWatch,
        filterCLSTotalMinWatch,
        filterCLSTotalMaxWatch,
        filterCLSUsedMinWatch,
        filterCLSUsedMaxWatch,
        filterCLSAvailableMinWatch,
        filterCLSAvailableMaxWatch,
        filterLimitTotalContractedMinWatch,
        filterLimitTotalContractedMaxWatch,
        filterLimitDistributedMinWatch,
        filterLimitDistributedMaxWatch,
        filterLimitDistributedUsedMinWatch,
        filterLimitDistributedUsedMaxWatch,
        filterLimitDistributedAvailableMinWatch,
        filterLimitDistributedAvailableMaxWatch,
        filterBillingMarginTotalMinWatch,
        filterBillingMarginTotalMaxWatch,
        filterBillingMarginUsedMinWatch,
        filterBillingMarginUsedMaxWatch,
        filterBillingMarginAvailableMinWatch,
        filterBillingMarginAvailableMaxWatch,
        filterCheckMarginTotalMinWatch,
        filterCheckMarginTotalMaxWatch,
        filterCheckMarginUsedMinWatch,
        filterCheckMarginUsedMaxWatch,
        filterCheckMarginAvailableMinWatch,
        filterCheckMarginAvailableMaxWatch,
    ]);

    const filters = {
        filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_portfolio: filterClientPortfolioWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_is_rural: filterClientIsRuralWatch?.label,
        filter_client_document: filterClientDocumentWatch,
        filter_date_end_validity_min: filterDateEndValidityMinWatch
            ? moment(filterDateEndValidityMinWatch).format("DD/MM/YYYY")
            : null,
        filter_date_end_validity_max: filterDateEndValidityMaxWatch
            ? moment(filterDateEndValidityMaxWatch).format("DD/MM/YYYY")
            : null,
        filter_cls_total_min: filterCLSTotalMinWatch,
        filter_cls_total_max: filterCLSTotalMaxWatch,
        filter_cls_used_min: filterCLSUsedMinWatch,
        filter_cls_used_max: filterCLSUsedMaxWatch,
        filter_cls_available_min: filterCLSAvailableMinWatch,
        filter_cls_available_max: filterCLSAvailableMaxWatch,
        filter_limit_total_contracted_min: filterLimitTotalContractedMinWatch,
        filter_limit_total_contracted_max: filterLimitTotalContractedMaxWatch,
        filter_limit_distributed_min: filterLimitDistributedMinWatch,
        filter_limit_distributed_max: filterLimitDistributedMaxWatch,
        filter_limit_distributed_used_min: filterLimitDistributedUsedMinWatch,
        filter_limit_distributed_used_max: filterLimitDistributedUsedMaxWatch,
        filter_limit_distributed_available_min: filterLimitDistributedAvailableMinWatch,
        filter_limit_distributed_available_max: filterLimitDistributedAvailableMaxWatch,
        filter_billing_margin_total_min: filterBillingMarginTotalMinWatch,
        filter_billing_margin_total_max: filterBillingMarginTotalMaxWatch,
        filter_billing_margin_used_min: filterBillingMarginUsedMinWatch,
        filter_billing_margin_used_max: filterBillingMarginUsedMaxWatch,
        filter_billing_margin_available_min: filterBillingMarginAvailableMinWatch,
        filter_billing_margin_available_max: filterBillingMarginAvailableMaxWatch,
        filter_check_margin_total_min: filterCheckMarginTotalMinWatch,
        filter_check_margin_total_max: filterCheckMarginTotalMaxWatch,
        filter_check_margin_used_min: filterCheckMarginUsedMinWatch,
        filter_check_margin_used_max: filterCheckMarginUsedMaxWatch,
        filter_check_margin_available_min: filterCheckMarginAvailableMinWatch,
        filter_check_margin_available_max: filterCheckMarginAvailableMaxWatch,
    };

    const labelsMap = {
        filter_client_agencies: "Agência(s)",
        filter_client_portfolio: "Carteira(s)",
        filter_client_is_rural: "É Rural",
        filter_client_document: "CPF/CNPJ",
        filter_date_end_validity_min: "Data Fim Vigência - Min",
        filter_date_end_validity_max: "Data Fim Vigência - Max",
        filter_cls_total_min: "CLS Total - Min",
        filter_cls_total_max: "CLS Total - Max",
        filter_cls_used_min: "CLS Utilizado - Min",
        filter_cls_used_max: "CLS Utilizado - Man",
        filter_cls_available_min: "CLS Disponível - Min",
        filter_cls_available_max: "CLS Disponível - Max",
        filter_limit_total_contracted_min: "Limite Total Contratado - Min",
        filter_limit_total_contracted_max: "Limite Total Contratado - Max",
        filter_limit_distributed_min: "Limite Distribuído - Min",
        filter_limit_distributed_max: "Limite Distribuído - Max",
        filter_limit_distributed_used_min: "Limite Distribuído Utilizado - Min",
        filter_limit_distributed_used_max: "Limite Distribuído Utilizado - Max",
        filter_limit_distributed_available_min: "Limite Distribuído Disponível - Min",
        filter_limit_distributed_available_max: "Limite Distribuído Disponível  - Max",
        filter_billing_margin_total_min: "Boleto Margem Total - Min",
        filter_billing_margin_total_max: "Boleto Margem Total - Max",
        filter_billing_margin_used_min: "Boleto Margem Utilizado - Min",
        filter_billing_margin_used_max: "Boleto Margem Utilizado - Max",
        filter_billing_margin_available_min: "Boleto Margem Disponível - Min",
        filter_billing_margin_available_max: "Boleto Margem Disponível  - Max",
        filter_check_margin_total_min: "Cheque Margem Total - Min",
        filter_check_margin_total_max: "Cheque Margem Total - Max",
        filter_check_margin_used_min: "Cheque Margem Utilizado - Min",
        filter_check_margin_used_max: "Cheque Margem Utilizado - Max",
        filter_check_margin_available_min: "Cheque Margem Disponível - Min",
        filter_check_margin_available_max: "Cheque Margem Disponível - Max",
    };

    const clearAllFilters = () => {
        reset({
            filter_client_agencies: [],
            filter_client_portfolio: [],
            filter_client_is_rural: null,
            filter_client_document: null,
            filter_date_end_validity_min: null,
            filter_date_end_validity_max: null,
            filter_cls_total_min: null,
            filter_cls_total_max: null,
            filter_cls_used_min: null,
            filter_cls_used_max: null,
            filter_cls_available_min: null,
            filter_cls_available_max: null,
            filter_limit_total_contracted_min: null,
            filter_limit_total_contracted_max: null,
            filter_limit_distributed_min: null,
            filter_limit_distributed_max: null,
            filter_limit_distributed_used_min: null,
            filter_limit_distributed_used_max: null,
            filter_limit_distributed_available_min: null,
            filter_limit_distributed_available_max: null,
            filter_billing_margin_total_min: null,
            filter_billing_margin_total_max: null,
            filter_billing_margin_used_min: null,
            filter_billing_margin_used_max: null,
            filter_billing_margin_available_min: null,
            filter_billing_margin_available_max: null,
            filter_check_margin_total_min: null,
            filter_check_margin_total_max: null,
            filter_check_margin_used_min: null,
            filter_check_margin_used_max: null,
            filter_check_margin_available_min: null,
            filter_check_margin_available_max: null,
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
                            onClick={handleFilterPanelDiscountedTitles}>
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
                            title='Visualizar'
                            aria-label='Visualizar Cooperado'>
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
            headerAlign: "center",
            flex: 1,
        },
        {
            field: "cliente_documento",
            headerName: "CPF/CNPJ",
            minWidth: 150,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatCnpjCpf(value)}</Typography>;
            },
        },
        {
            field: "melhor_contato",
            headerName: "Melhor Contato",
            minWidth: 150,
            headerAlign: "center",
            align: "left",
            flex: 1,
            renderCell: ({ value }) => {
                return (
                    <WhatsAppButton
                        phoneNumber={value}
                        message='Olá, estamos entrando em contato para compartilhar novidades!'
                    />
                );
            },
        },
        {
            field: "e_rural",
            headerName: "É Rural",
            minWidth: 80,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography>{value ? "🌱 Sim" : "      Não"}</Typography>;
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
            field: "inicio_vigencia",
            headerName: "Início Vigência",
            minWidth: 105,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY")}</Typography>;
            },
        },
        {
            field: "fim_vigencia",
            headerName: "Fim Vigência",
            minWidth: 105,
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
            field: "noccb",
            headerName: "NOCCB",
            minWidth: 120,
            headerAlign: "center",
            align: "center",
            flex: 1,
        },
        {
            field: "cls_total",
            headerName: "CLS Total",
            minWidth: 115,
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
            field: "cls_utilizado",
            headerName: "CLS Utilizado",
            minWidth: 125,
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
            field: "cls_disponivel",
            headerName: "CLS Disponível",
            minWidth: 125,
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
            field: "limite_total_contratado",
            headerName: "Limite Total Contratado",
            minWidth: 165,
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
            field: "limite_distribuido",
            headerName: "Limite Distribuído",
            minWidth: 125,
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
            field: "limite_distribuido_utilizado",
            headerName: "Limite Distribuído Utilizado",
            minWidth: 200,
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
            field: "limite_distribuido_disponivel",
            headerName: "Limite Distribuído Disponível",
            minWidth: 200,
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
            field: "b_margem_total",
            headerName: "Boleto Margem Total",
            minWidth: 185,
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
            field: "b_margem_utilizada",
            headerName: "Boleto Margem Utilizada",
            minWidth: 185,
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
            field: "b_margem_disponivel",
            headerName: "Boleto Margem Disponível",
            minWidth: 185,
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
            field: "b_perc_margem_disponivel",
            headerName: "Boleto % Margem Disponível",
            minWidth: 200,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatPercentage(value * 100, 2) : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "c_margem_total",
            headerName: "Cheque Margem Total",
            minWidth: 180,
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
            field: "c_margem_utilizada",
            headerName: "Cheque Margem Utilizada",
            minWidth: 180,
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
            field: "c_margem_disponivel",
            headerName: "Cheque Margem Disponível",
            minWidth: 185,
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
            field: "c_perc_margem_disponivel",
            headerName: "Cheque % Margem Disponível",
            minWidth: 200,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatPercentage(value * 100, 2) : "-"}
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
                                {dataPanelDiscountedTitles?.title || ""}
                            </Typography>
                        </Breadcrumbs>

                        {dataPanelDiscountedTitles && (
                            <CSATAverageRating
                                module={`Painel | ${dataPanelDiscountedTitles.title}`}
                                routePath={`${dataPanelDiscountedTitles.route}`}
                                isClickable
                                formProps={{
                                    module: `Painel | ${dataPanelDiscountedTitles.title}`,
                                    routePath: `${dataPanelDiscountedTitles.route}`,
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
                ) : dataPanelDiscountedTitles ? (
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
                                        backgroundImage: dataPanelDiscountedTitles.background_color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "1.5rem",
                                        fontWeight: "bold",
                                        position: "relative",
                                    }}>
                                    <Tooltip title={dataPanelDiscountedTitles?.description || ""}>
                                        <Box
                                            position='absolute'
                                            top={5}
                                            left={8}
                                            color='white'
                                            padding='4px 8px'
                                            borderRadius='4px'>
                                            <Icon>{dataPanelDiscountedTitles.label_icon}</Icon>
                                        </Box>
                                    </Tooltip>
                                    {movimentDatePanelDiscountedTitles && (
                                        <Tooltip
                                            title={`Data de atualização da base de títulos descontados do dia: ${formatDate(
                                                movimentDatePanelDiscountedTitles,
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
                                                    {movimentDatePanelDiscountedTitles &&
                                                        formatDate(movimentDatePanelDiscountedTitles, "DD/MM/YYYY")}
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    )}
                                    <Tooltip title='Total dos Limites Distribuidos Utilizados'>
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
                                            {listPanelDiscountedTitles &&
                                                formatToBRLCurrency(
                                                    listPanelDiscountedTitles.reduce(
                                                        (total, item) =>
                                                            total + (item.limite_distribuido_utilizado || 0),
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
                                        rows={listPanelDiscountedTitles}
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
                                                    transform: "translate(39%, 52%)",
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
                                                                        setIdExtClient(dataExtClient.id);
                                                                    }}
                                                                    color='success'
                                                                    aria-label='Visualizar Cooperado'>
                                                                    <AccountCircleOutlinedIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            {dataExtClient.id}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell
                                                        sx={{
                                                            fontWeight: "bold",
                                                            color: "text.primary",
                                                        }}>
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
                                                        NOCCB:
                                                    </TableCell>
                                                    <TableCell>{dataExtClient.noccb}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Início da Vigência:
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(dataExtClient.inicio_vigencia, "DD/MM/YYYY")}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Fim da Vigência:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.fim_vigencia ? (
                                                            <Typography fontSize={14}>
                                                                {(() => {
                                                                    const today = moment();
                                                                    const endDate = moment(
                                                                        dataExtClient.fim_vigencia,
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

                                                                    return `${emoji} ${formatDate(dataExtClient.fim_vigencia, "DD/MM/YYYY")}`;
                                                                })()}
                                                            </Typography>
                                                        ) : (
                                                            "-"
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        CLS Total:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.cls_total !== null &&
                                                        dataExtClient.cls_total !== undefined
                                                            ? formatToBRLCurrency(dataExtClient.cls_total)
                                                            : "-"}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        CLS Utilizado:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.cls_utilizado !== null &&
                                                        dataExtClient.cls_utilizado !== undefined
                                                            ? formatToBRLCurrency(dataExtClient.cls_utilizado)
                                                            : ""}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        CLS Disponível:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.cls_disponivel !== null &&
                                                        dataExtClient.cls_disponivel !== undefined
                                                            ? formatToBRLCurrency(dataExtClient.cls_disponivel)
                                                            : "-"}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Limite Total Contratado:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.limite_total_contratado !== null &&
                                                        dataExtClient.limite_total_contratado !== undefined
                                                            ? formatToBRLCurrency(dataExtClient.limite_total_contratado)
                                                            : "-"}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Limite Distribuído:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.limite_distribuido !== null &&
                                                        dataExtClient.limite_distribuido !== undefined
                                                            ? formatToBRLCurrency(dataExtClient.limite_distribuido)
                                                            : "-"}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Limite Distribuído Utilizado:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.limite_distribuido_utilizado !== null &&
                                                        dataExtClient.limite_distribuido_utilizado !== undefined
                                                            ? formatToBRLCurrency(
                                                                  dataExtClient.limite_distribuido_utilizado,
                                                              )
                                                            : "-"}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Limite Distribuído Disponível:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.limite_distribuido_disponivel !== null &&
                                                        dataExtClient.limite_distribuido_disponivel !== undefined
                                                            ? formatToBRLCurrency(
                                                                  dataExtClient.limite_distribuido_disponivel,
                                                              )
                                                            : "-"}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Boleto Margem Total:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.b_margem_total !== null &&
                                                        dataExtClient.b_margem_total !== undefined
                                                            ? formatToBRLCurrency(dataExtClient.b_margem_total)
                                                            : "-"}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Boleto Margem Disponível:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.b_margem_disponivel !== null &&
                                                        dataExtClient.b_margem_disponivel !== undefined
                                                            ? formatToBRLCurrency(dataExtClient.b_margem_disponivel)
                                                            : "-"}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Boleto % Margem Disponível:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.b_perc_margem_disponivel !== null &&
                                                        dataExtClient.b_perc_margem_disponivel !== undefined
                                                            ? formatPercentage(
                                                                  dataExtClient.b_perc_margem_disponivel * 100,
                                                                  2,
                                                              )
                                                            : "-"}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Cheque Margem Total:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.c_margem_total !== null &&
                                                        dataExtClient.c_margem_total !== undefined
                                                            ? formatToBRLCurrency(dataExtClient.c_margem_total)
                                                            : "-"}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Cheque Margem Utilizada:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.c_margem_utilizada !== null &&
                                                        dataExtClient.c_margem_utilizada !== undefined
                                                            ? formatToBRLCurrency(dataExtClient.c_margem_utilizada)
                                                            : "-"}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Cheque Margem Disponível:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.c_margem_disponivel !== null &&
                                                        dataExtClient.c_margem_disponivel !== undefined
                                                            ? formatToBRLCurrency(dataExtClient.c_margem_disponivel)
                                                            : "-"}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                        Cheque % Margem Disponível:
                                                    </TableCell>
                                                    <TableCell>
                                                        {dataExtClient.c_perc_margem_disponivel !== null &&
                                                        dataExtClient.c_perc_margem_disponivel !== undefined
                                                            ? formatPercentage(
                                                                  dataExtClient.c_perc_margem_disponivel * 100,
                                                                  2,
                                                              )
                                                            : "-"}
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
                closeButton={handleFilterPanelDiscountedTitles}
                onClose={handleFilterPanelDiscountedTitles}
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

                        <Grid item xs={12} md={5.25}>
                            <FormDatePicker
                                fullWidth
                                name='filter_date_end_validity_min'
                                label='Data Fim Vigência - Min'
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
                                name='filter_date_end_validity_max'
                                label='Data Fim Vigência - Max'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                            />
                        </Grid>

                        <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='CLS Total - Min'
                                placeholder='Digite um número'
                                name='filter_cls_total_min'
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
                                label='CLS Total - Max'
                                placeholder='Digite um número'
                                name='filter_cls_total_max'
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
                                label='CLS Utilizado - Min'
                                placeholder='Digite um número'
                                name='filter_cls_used_min'
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
                                label='CLS Utilizado - Max'
                                placeholder='Digite um número'
                                name='filter_cls_used_max'
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
                                label='CLS Disponível - Min'
                                placeholder='Digite um número'
                                name='filter_cls_available_min'
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
                                label='CLS Disponível - Max'
                                placeholder='Digite um número'
                                name='filter_cls_available_max'
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
                                label='Limite Total Contratado - Min'
                                placeholder='Digite um número'
                                name='filter_limit_total_contracted_min'
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
                                label='Limite Total Contratado - Max'
                                placeholder='Digite um número'
                                name='filter_limit_total_contracted_max'
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
                                label='Limite Distribuído - Min'
                                placeholder='Digite um número'
                                name='filter_limit_distributed_min'
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
                                label='Limite Distribuído - Max'
                                placeholder='Digite um número'
                                name='filter_limit_distributed_max'
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
                                label='Limite Distribuído Utilizado - Min'
                                placeholder='Digite um número'
                                name='filter_limit_distributed_used_min'
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
                                label='Limite Distribuído Utilizado - Max'
                                placeholder='Digite um número'
                                name='filter_limit_distributed_used_max'
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
                                label='Limite Distribuído Disponível - Min'
                                placeholder='Digite um número'
                                name='filter_limit_distributed_available_min'
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
                                label='Limite Distribuído Disponível - Max'
                                placeholder='Digite um número'
                                name='filter_limit_distributed_available_max'
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
                                label='Boleto Margem Total - Min'
                                placeholder='Digite um número'
                                name='filter_billing_margin_total_min'
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
                                label='Boleto Margem Total - Max'
                                placeholder='Digite um número'
                                name='filter_billing_margin_total_max'
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
                                label='Boleto Margem Utilizado - Min'
                                placeholder='Digite um número'
                                name='filter_billing_margin_used_min'
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
                                label='Boleto Margem Utilizado - Max'
                                placeholder='Digite um número'
                                name='filter_billing_margin_used_max'
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
                                label='Boleto Margem Disponível - Min'
                                placeholder='Digite um número'
                                name='filter_billing_margin_available_min'
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
                                label='Boleto Margem Disponível - Max'
                                placeholder='Digite um número'
                                name='filter_billing_margin_available_max'
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
                                label='Check Margem Utilizado - Min'
                                placeholder='Digite um número'
                                name='filter_check_margin_total_min'
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
                                label='Check Margem Utilizado - Max'
                                placeholder='Digite um número'
                                name='filter_check_margin_total_max'
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
                                label='Check Margem Utilizado - Min'
                                placeholder='Digite um número'
                                name='filter_check_margin_used_min'
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
                                label='Check Margem Utilizado - Max'
                                placeholder='Digite um número'
                                name='filter_check_margin_used_max'
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
                                label='Cheque Margem Disponível - Min'
                                placeholder='Digite um número'
                                name='filter_check_margin_available_min'
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
                                label='Cheque Margem Disponível - Max'
                                placeholder='Digite um número'
                                name='filter_check_margin_available_max'
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
                                        filter_client_is_rural: null,
                                        filter_client_document: null,
                                        filter_date_end_validity_min: null,
                                        filter_date_end_validity_max: null,
                                        filter_cls_total_min: "",
                                        filter_cls_total_max: "",
                                        filter_cls_used_min: "",
                                        filter_cls_used_max: "",
                                        filter_cls_available_min: "",
                                        filter_cls_available_max: "",
                                        filter_limit_total_contracted_min: "",
                                        filter_limit_total_contracted_max: "",
                                        filter_limit_distributed_min: "",
                                        filter_limit_distributed_max: "",
                                        filter_limit_distributed_used_min: "",
                                        filter_limit_distributed_used_max: "",
                                        filter_limit_distributed_available_min: "",
                                        filter_limit_distributed_available_max: "",
                                        filter_billing_margin_total_min: "",
                                        filter_billing_margin_total_max: "",
                                        filter_billing_margin_used_min: "",
                                        filter_billing_margin_used_max: "",
                                        filter_billing_margin_available_min: "",
                                        filter_billing_margin_available_max: "",
                                        filter_check_margin_total_min: "",
                                        filter_check_margin_total_max: "",
                                        filter_check_margin_used_min: "",
                                        filter_check_margin_used_max: "",
                                        filter_check_margin_available_min: "",
                                        filter_check_margin_available_max: "",
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
                            handleFilterPanelDiscountedTitles();
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
