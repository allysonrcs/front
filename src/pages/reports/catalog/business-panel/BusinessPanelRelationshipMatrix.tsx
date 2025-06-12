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
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import FormInput from "@/components/FormComponents/FormInput";
import { toast } from "react-toastify";
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
import { formatCnpjCpf, formatNumberWithThousandsSeparator, formatToBRLCurrency } from "@/functions/number";
import { ExtClientInfo } from "@/components/ExtClientInfo/ExtClientInfo";
import {
    IListRelationshipMatrix,
    ISearchAllReportsCatalog,
    searchAllReportsCatalogRecords,
    searchReportsCatalogPanelRelationshipMatrix,
} from "@/services/reports";
import FormAutocompleteMultiple from "@/components/FormComponents/FormAutocompleteMultiple";
import FormInputCpfCnpj from "@/components/FormComponents/FormInputCpfCnpj";
import { useAuth } from "@/contexts/AuthContext";
import { ArrayTypesYesOrNo } from "@/constants/array-type-yes-or-no";
import { ArrayTypesProfileClient } from "@/constants/array-type-profile-client";
import { ArrayTypesPortfolioName } from "@/constants/array-type-portfolio-name";
import { ArrayTypesAgenciesName } from "@/constants/array-type-agencies";
import { ArrayTypeStatusCurrentAccountClient } from "@/constants/array-type-status-current-account-client";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";
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

export type BusinessPanelRelationshipMatrixProps = {
    filter_client_agencies?: AutoCompleteString[];
    filter_client_portfolios?: AutoCompleteString[];
    filter_client_profiles?: AutoCompleteString[];
    filter_client_cc_sitconta?: AutoCompleteString[];
    filter_client_is_cooperated?: AutoCompleteBoolean;
    filter_client_is_rural?: AutoCompleteBoolean;
    filter_iap?: AutoCompleteString[];
    filter_class_iap?: AutoCompleteString;
    filter_class_soc?: AutoCompleteString;
    filter_quartile?: AutoCompleteNumber[];
    filter_client_risk_crl?: AutoCompleteNumber[];
    filter_anot_vig_rel?: AutoCompleteBoolean;
    filter_anot_vig_abs?: AutoCompleteBoolean;
    filter_hist_inad?: AutoCompleteBoolean;
    filter_client_document?: string | null;
    filter_gross_income_min?: number | null;
    filter_gross_income_max?: number | null;
    filter_loan_min?: number | null;
    filter_loan_max?: number | null;
    filter_financing_min?: number | null;
    filter_financing_max?: number | null;
    filter_financing_rural_min?: number | null;
    filter_financing_rural_max?: number | null;
    filter_contribution_margin_min?: number | null;
    filter_contribution_margin_max?: number | null;
};

interface Filters {
    filter_client_agencies?: string[];
    filter_client_portfolios?: string[];
    filter_client_profiles?: string[];
    filter_client_cc_sitconta?: string[];
    filter_client_is_cooperated?: string[];
    filter_client_is_rural?: string;
    filter_iap?: string[];
    filter_class_iap?: string;
    filter_class_soc?: string;
    filter_quartile?: string[];
    filter_client_risk_crl?: string[];
    filter_anot_vig_rel?: string;
    filter_anot_vig_abs?: string;
    filter_hist_inad?: string;
    filter_client_document?: string;
    filter_gross_income_min?: string;
    filter_gross_income_max?: string;
    filter_loan_min?: string;
    filter_loan_max?: string;
    filter_financing_min?: string;
    filter_financing_max?: string;
    filter_financing_rural_min?: string;
    filter_financing_rural_max?: string;
    filter_contribution_margin_min?: string;
    filter_contribution_margin_max?: string;
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
    filter_client_portfolios: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_client_profiles: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_client_cc_sitconta: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_client_is_cooperated: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_client_is_rural: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_class_iap: Yup.object()
        .shape({
            id: Yup.string().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_class_soc: Yup.object()
        .shape({
            id: Yup.string().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_quartile: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.number().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_client_risk_crl: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.number().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_anot_vig_rel: Yup.object()
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
    filter_hist_inad: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_client_document: Yup.string().max(18, "Máximo 18 caracteres").trim().nullable(),
    filter_gross_income_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_gross_income_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_loan_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_loan_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_financing_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_financing_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_contribution_margin_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_contribution_margin_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
});

export function BusinessPanelRelationshipMatrix() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [listPanelRelationshipMatrix, setlistPanelRelationshipMatrix] = useState<IListRelationshipMatrix[]>([]);
    const [originalListPanelRelationshipMatrix, setOriginalListPanelRelationshipMatrix] = useState<
        IListRelationshipMatrix[]
    >([]);
    const [movimentDatePanelDisbursement, setmovimentDatePanelDisbursement] = useState<string>();
    const [dataPanelRelationshipMatrix, setdataPanelRelationshipMatrix] = useState<ISearchAllReportsCatalog>();
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
    } = useForm<BusinessPanelRelationshipMatrixProps | any>({
        resolver: yupResolver(validationSchema),
    });

    const filterClientAgenciesWatch = watch("filter_client_agencies");
    const filterClientPortfoliosWatch = watch("filter_client_portfolios");
    const filterClientProfilesWatch = watch("filter_client_profiles");
    const filterClientAccountCurrentSituationWatch = watch("filter_client_cc_sitconta");
    const filterClientIsCooperatedWatch = watch("filter_client_is_cooperated");
    const filterClientIsRuralWatch = watch("filter_client_is_rural");
    const filterIAPWatch = watch("filter_iap");
    const filterClassIAPWatch = watch("filter_class_iap");
    const filterClassSOCWatch = watch("filter_class_soc");
    const filterQuartileWatch = watch("filter_quartile");
    const filterClientRiskCRLWatch = watch("filter_client_risk_crl");
    const filterAnotVigRELWatch = watch("filter_anot_vig_rel");
    const filterAnotVigABSWatch = watch("filter_anot_vig_abs");
    const filterHistINADWatch = watch("filter_hist_inad");
    const filterClientDocumentWatch = watch("filter_client_document");
    const filterGrossIncomeMinWatch = watch("filter_gross_income_min");
    const filterGrossIncomeMaxWatch = watch("filter_gross_income_max");
    const filterLoanMinWatch = watch("filter_loan_min");
    const filterLoanMaxWatch = watch("filter_loan_max");
    const filterFinancingMinWatch = watch("filter_financing_min");
    const filterFinancingMaxWatch = watch("filter_financing_max");
    const filterFinancingRuralMinWatch = watch("filter_financing_rural_min");
    const filterFinancingRuralMaxWatch = watch("filter_financing_rural_max");
    const filterContributionMarginMinWatch = watch("filter_contribution_margin_min");
    const filterContributionMarginMaxWatch = watch("filter_contribution_margin_max");

    const mapValueCurrentAccount = (value: string | null | undefined) => {
        switch (value) {
            case "ATIVA":
                return "🟢 Ativa";
            case "INATIVA":
                return "🔴 Inativa";
            case "ENCERRADA":
                return "❌ Encerrada";
            case "BLOQUEADA":
                return "🚫 Bloqueada";
            default:
                return "⚠️ Não Possui";
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                toggleStatusBackdrop();
                setLoading(true);

                const [responseCatalogDisbursement, responseAllReports] = await Promise.all([
                    searchReportsCatalogPanelRelationshipMatrix({}),
                    searchAllReportsCatalogRecords({ route: currentPath }),
                ]);

                const { painel_matriz_relacionamento, data_movimento } = responseCatalogDisbursement;
                const dataPanelRelationshipMatrix = responseAllReports[0];

                setOriginalListPanelRelationshipMatrix(painel_matriz_relacionamento);
                setlistPanelRelationshipMatrix(painel_matriz_relacionamento);

                setmovimentDatePanelDisbursement(data_movimento);
                setdataPanelRelationshipMatrix(dataPanelRelationshipMatrix);
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
                        setValue("filter_client_portfolios", [
                            {
                                id: userPortfolioName,
                                label: userPortfolioName,
                            },
                        ]);
                    }
                }
            }
        }
    }, [dataPanelRelationshipMatrix]);

    const handleOpenModalClient = () => {
        setOpenModalClient((oldValue) => !oldValue);
    };

    const handleFilterPanelRelationshipMatrix = () => {
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
        const filteredData = originalListPanelRelationshipMatrix.filter((item) => {
            return (
                (!filters.filter_client_agencies ||
                    filters.filter_client_agencies.length === 0 ||
                    filters.filter_client_agencies.some((selected) => item.agencia_nome === selected)) &&
                (!filters.filter_client_portfolios ||
                    filters.filter_client_portfolios.length === 0 ||
                    filters.filter_client_portfolios.some((selected) => item.carteira_nome === selected)) &&
                (!filters.filter_client_profiles ||
                    filters.filter_client_profiles.length === 0 ||
                    filters.filter_client_profiles.some((selected) => item.cliente_perfil === selected)) &&
                (!filters.filter_client_cc_sitconta ||
                    filters.filter_client_cc_sitconta.length === 0 ||
                    filters.filter_client_cc_sitconta.some((selected) =>
                        selected === "NULL" ? item.cc_sitconta === null : item.cc_sitconta === selected,
                    )) &&
                (filters.filter_client_is_cooperated === null ||
                    item.e_cooperado === Boolean(filters.filter_client_is_cooperated)) &&
                (filters.filter_client_is_rural === null || item.e_rural === Boolean(filters.filter_client_is_rural)) &&
                (!filters.filter_iap ||
                    filters.filter_iap.length === 0 ||
                    filters.filter_iap.some((selected) => item.iap === Number(selected))) &&
                (!filters.filter_class_iap || filters.filter_class_iap === item.classe_iap) &&
                (!filters.filter_class_soc || filters.filter_class_soc === item.classe_soc) &&
                (!filters.filter_quartile ||
                    filters.filter_quartile.length === 0 ||
                    filters.filter_quartile.some((selected) => item.quartil === selected)) &&
                (!filters.filter_client_risk_crl ||
                    filters.filter_client_risk_crl.length === 0 ||
                    filters.filter_client_risk_crl.some((selected) => Number(item.risco_crl) === Number(selected))) &&
                (filters.filter_anot_vig_rel === null ||
                    item.anot_vigentes_rel === Boolean(filters.filter_anot_vig_rel)) &&
                (filters.filter_anot_vig_abs === null ||
                    item.anot_vigentes_abs === Boolean(filters.filter_anot_vig_abs)) &&
                (filters.filter_hist_inad === null || item.historico_inad === Boolean(filters.filter_hist_inad)) &&
                (!filters.filter_client_document ||
                    String(item.cliente_documento).includes(
                        String(filters.filter_client_document.replace(/[\.\-\/]/g, "")),
                    )) &&
                (filters.filter_gross_income_min === null ||
                    item.renda_bruta >= Number(filters.filter_gross_income_min)) &&
                (filters.filter_gross_income_max === null ||
                    item.renda_bruta <= Number(filters.filter_gross_income_max)) &&
                (filters.filter_loan_min === null || item.emprestimo >= Number(filters.filter_loan_min)) &&
                (filters.filter_loan_max === null || item.emprestimo <= Number(filters.filter_loan_max)) &&
                (filters.filter_financing_min === null || item.financiamento >= Number(filters.filter_financing_min)) &&
                (filters.filter_financing_max === null || item.financiamento <= Number(filters.filter_financing_max)) &&
                (filters.filter_financing_rural_min === null ||
                    item.financiamento_rural >= Number(filters.filter_financing_rural_min)) &&
                (filters.filter_financing_rural_max === null ||
                    item.financiamento_rural <= Number(filters.filter_financing_rural_max)) &&
                (filters.filter_contribution_margin_min === null ||
                    item.margem_contribuicao >= Number(filters.filter_contribution_margin_min)) &&
                (filters.filter_contribution_margin_max === null ||
                    item.margem_contribuicao <= Number(filters.filter_contribution_margin_max))
            );
        });

        setlistPanelRelationshipMatrix(filteredData);
    };

    useEffect(() => {
        const filtersWatch = {
            filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_portfolios: filterClientPortfoliosWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_profiles: filterClientProfilesWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_cc_sitconta:
                filterClientAccountCurrentSituationWatch?.map((item: { id: string }) => item.id) || [],
            filter_client_is_cooperated:
                filterClientIsCooperatedWatch?.id !== undefined ? filterClientIsCooperatedWatch.id : null,
            filter_client_is_rural: filterClientIsRuralWatch?.id !== undefined ? filterClientIsRuralWatch.id : null,
            filter_class_iap: filterClassIAPWatch?.id !== undefined ? filterClassIAPWatch.id : null,
            filter_class_soc: filterClassSOCWatch?.id !== undefined ? filterClassSOCWatch.id : null,
            filter_iap: filterIAPWatch?.map((item: { id: number }) => item.id) || [],
            filter_quartile: filterQuartileWatch?.map((item: { id: number }) => item.id) || [],
            filter_client_risk_crl: filterClientRiskCRLWatch?.map((item: { id: number }) => item.id) || [],
            filter_anot_vig_rel: filterAnotVigRELWatch?.id !== undefined ? filterAnotVigRELWatch.id : null,
            filter_anot_vig_abs: filterAnotVigABSWatch?.id !== undefined ? filterAnotVigABSWatch.id : null,
            filter_hist_inad: filterHistINADWatch?.id !== undefined ? filterHistINADWatch.id : null,
            filter_client_document: filterClientDocumentWatch || null,
            filter_gross_income_min: filterGrossIncomeMinWatch || null,
            filter_gross_income_max: filterGrossIncomeMaxWatch || null,
            filter_loan_min: filterLoanMinWatch || null,
            filter_loan_max: filterLoanMaxWatch || null,
            filter_financing_min: filterFinancingMinWatch || null,
            filter_financing_max: filterFinancingMaxWatch || null,
            filter_financing_rural_min: filterFinancingRuralMinWatch || null,
            filter_financing_rural_max: filterFinancingRuralMaxWatch || null,
            filter_contribution_margin_min: filterContributionMarginMinWatch || null,
            filter_contribution_margin_max: filterContributionMarginMaxWatch || null,
        };

        applyFilters(filtersWatch);
    }, [
        filterClientAgenciesWatch,
        filterClientPortfoliosWatch,
        filterClientProfilesWatch,
        filterClientAccountCurrentSituationWatch,
        filterClientIsCooperatedWatch,
        filterClientIsRuralWatch,
        filterIAPWatch,
        filterClassIAPWatch,
        filterClassSOCWatch,
        filterQuartileWatch,
        filterClientRiskCRLWatch,
        filterAnotVigRELWatch,
        filterAnotVigABSWatch,
        filterHistINADWatch,
        filterClientDocumentWatch,
        filterGrossIncomeMinWatch,
        filterGrossIncomeMaxWatch,
        filterLoanMinWatch,
        filterLoanMaxWatch,
        filterFinancingMinWatch,
        filterFinancingMaxWatch,
        filterFinancingRuralMinWatch,
        filterFinancingRuralMaxWatch,
        filterContributionMarginMinWatch,
        filterContributionMarginMaxWatch,
    ]);

    const filters = {
        filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_portfolios: filterClientPortfoliosWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_profiles: filterClientProfilesWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_is_rural: filterClientIsRuralWatch?.label,
        filter_client_is_cooperated: filterClientIsCooperatedWatch?.label,
        filter_class_iap: filterClassIAPWatch?.label,
        filter_class_soc: filterClassSOCWatch?.label,
        filter_iap: filterIAPWatch?.map((item: { label: string }) => item.label) || [],
        filter_quartile: filterQuartileWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_risk_crl: filterClientRiskCRLWatch?.map((item: { label: string }) => item.label) || [],
        filter_anot_vig_rel: filterAnotVigRELWatch?.label,
        filter_anot_vig_abs: filterAnotVigABSWatch?.label,
        filter_hist_inad: filterHistINADWatch?.label,
        filter_client_document: filterClientDocumentWatch,
        filter_gross_income_min: filterGrossIncomeMinWatch,
        filter_gross_income_max: filterGrossIncomeMaxWatch,
        filter_loan_min: filterLoanMinWatch,
        filter_loan_max: filterLoanMaxWatch,
        filter_financing_min: filterFinancingMinWatch,
        filter_financing_max: filterFinancingMaxWatch,
        filter_financing_rural_min: filterFinancingRuralMinWatch,
        filter_financing_rural_max: filterFinancingRuralMaxWatch,
        filter_contribution_margin_min: filterContributionMarginMinWatch,
        filter_contribution_margin_max: filterContributionMarginMaxWatch,
    };

    const labelsMap = {
        filter_client_agencies: "Agência(s)",
        filter_client_portfolios: "Carteira(s)",
        filter_client_profiles: "Perfil",
        filter_client_cc_sitconta: "Situação Conta Corrente",
        filter_client_is_cooperated: "É Cooperado",
        filter_client_is_rural: "É Rural",
        filter_iap: "IAP",
        filter_class_iap: "Classe IAP",
        filter_class_soc: "Classe SOC",
        filter_quartile: "Quartil",
        filter_client_risk_crl: "Risco CRL",
        filter_anot_vig_rel: "Anotação Vigente REL",
        filter_anot_vig_abs: "Anotação Vigente ABS",
        filter_hist_inad: "Histórico INAD",
        filter_client_document: "CPF/CNPJ",
        filter_gross_income_min: "Renda Bruta - Min",
        filter_gross_income_max: "Renda Bruta - Max",
        filter_loan_min: "Empréstimo - Min",
        filter_loan_max: "Empréstimo - Max",
        filter_financing_min: "Financiamento - Min",
        filter_financing_max: "Financiamento - Max",
        filter_financing_rural_min: "Financiamento Rural - Min",
        filter_financing_rural_max: "Financiamento Rural - Max",
        filter_contribution_margin_min: "Margem de Contribuição - Min",
        filter_contribution_margin_max: "Margem de Contribuição - Max",
    };

    const clearAllFilters = () => {
        reset({
            filter_client_agencies: [],
            filter_client_portfolios: [],
            filter_client_profiles: [],
            filter_client_cc_sitconta: [],
            filter_client_is_cooperated: null,
            filter_client_is_rural: null,
            filter_iap: [],
            filter_class_iap: null,
            filter_class_soc: null,
            filter_quartile: [],
            filter_client_risk_crl: [],
            filter_anot_vig_rel: null,
            filter_anot_vig_abs: null,
            filter_hist_inad: null,
            filter_client_document: null,
            filter_gross_income_min: null,
            filter_gross_income_max: null,
            filter_loan_min: null,
            filter_loan_max: null,
            filter_financing_min: null,
            filter_financing_max: null,
            filter_financing_rural_min: null,
            filter_financing_rural_max: null,
            filter_contribution_margin_min: null,
            filter_contribution_margin_max: null,
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
                            onClick={handleFilterPanelRelationshipMatrix}>
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
            field: "data_movimento",
            headerName: "Data Movimento",
            minWidth: 120,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY")}</Typography>;
            },
        },
        {
            field: "cliente_id",
            headerName: "ID Cooperado",
            headerAlign: "center",
            minWidth: 85,
        },
        {
            field: "cliente_nome",
            headerName: "Nome",
            minWidth: 200,
        },
        {
            field: "cliente_documento",
            headerName: "CPF/CNPJ",
            headerAlign: "center",
            minWidth: 150,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatCnpjCpf(value)}</Typography>;
            },
        },
        {
            field: "agencia_nome",
            headerName: "PA",
            align: "center",
            headerAlign: "center",
            minWidth: 150,
        },
        {
            field: "carteira_nome",
            headerName: "Carteira",
            align: "center",
            headerAlign: "center",
            minWidth: 140,
        },
        {
            field: "cliente_perfil",
            headerName: "Perfil",
            headerAlign: "center",
            width: 100,
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
            field: "e_cooperado",
            headerName: "É Cooperado",
            width: 100,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }: any) => {
                return <Typography>{value ? "💚 Sim" : "🟠 Não"}</Typography>;
            },
        },
        {
            headerAlign: "center",
            field: "cc_sitconta",
            headerName: "Conta Corrente",
            align: "center",
            width: 110,
            renderCell: ({ value }: any) => {
                return <Typography>{mapValueCurrentAccount(value)}</Typography>;
            },
        },
        {
            field: "iap",
            headerName: "IAP",
            headerAlign: "center",
            align: "center",
            width: 45,
        },
        {
            field: "classe_iap",
            headerName: "Classe IAP",
            headerAlign: "center",
            align: "center",
            width: 85,
        },
        {
            field: "soc",
            headerName: "SOC",
            headerAlign: "center",
            align: "center",
            width: 70,
        },
        {
            field: "classe_soc",
            headerName: "Classe SOC",
            headerAlign: "center",
            align: "center",
            width: 90,
        },
        {
            field: "quartil",
            headerName: "Quartil",
            align: "center",
            width: 70,
        },
        {
            field: "risco_crl",
            headerName: "Risco CRL",
            headerAlign: "center",
            align: "center",
            width: 78,
            renderCell: ({ value }) => {
                return (
                    <Typography title={value === 0 ? "Sem classificação de risco" : `R${value}`}>
                        {value ? `R${value}` : "R?"}
                    </Typography>
                );
            },
        },
        {
            field: "renda_bruta",
            headerName: "Renda Bruta",
            headerAlign: "center",
            align: "center",
            width: 125,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "anot_vigentes_rel",
            headerName: "Anot Vigente REL",
            align: "center",
            headerAlign: "center",
            width: 130,
            renderCell: ({ value }: any) => {
                return <Typography color={value ? "error.light" : "success.light"}>{value ? "Sim" : "Não"}</Typography>;
            },
        },
        {
            field: "anot_vigentes_abs",
            headerName: "Anot Vigente ABS",
            align: "center",
            headerAlign: "center",
            width: 132,
            renderCell: ({ value }: any) => {
                return <Typography color={value ? "error.light" : "success.light"}>{value ? "Sim" : "Não"}</Typography>;
            },
        },
        {
            field: "historico_inad",
            headerName: "Histórico INAD",
            align: "center",
            headerAlign: "center",
            width: 110,
            renderCell: ({ value }: any) => {
                return <Typography color={value ? "error.light" : "success.light"}>{value ? "Sim" : "Não"}</Typography>;
            },
        },
        {
            field: "emprestimo",
            headerName: "Emprestimo",
            headerAlign: "center",
            align: "center",
            width: 125,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "financiamento",
            headerName: "Financiamento",
            headerAlign: "center",
            align: "center",
            width: 125,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "financiamento_rural",
            headerName: "Financiamento Rural",
            headerAlign: "center",
            align: "center",
            width: 145,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : "-"}
                    </Typography>
                );
            },
        },

        {
            field: "margem_contribuicao",
            headerName: "Margem Contribuição",
            headerAlign: "center",
            align: "center",
            width: 160,
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
                                {dataPanelRelationshipMatrix?.title || ""}
                            </Typography>
                        </Breadcrumbs>

                        {dataPanelRelationshipMatrix && (
                            <CSATAverageRating
                                module={`Painel | ${dataPanelRelationshipMatrix.title}`}
                                routePath={`${dataPanelRelationshipMatrix.route}`}
                                isClickable
                                formProps={{
                                    module: `Painel | ${dataPanelRelationshipMatrix.title}`,
                                    routePath: `${dataPanelRelationshipMatrix.route}`,
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
                ) : dataPanelRelationshipMatrix ? (
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
                                        backgroundImage: dataPanelRelationshipMatrix.background_color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "1.5rem",
                                        fontWeight: "bold",
                                        position: "relative",
                                    }}>
                                    <Tooltip title={dataPanelRelationshipMatrix?.description || ""}>
                                        <Box
                                            position='absolute'
                                            top={5}
                                            left={8}
                                            color='white'
                                            padding='4px 8px'
                                            borderRadius='4px'>
                                            <Icon>{dataPanelRelationshipMatrix.label_icon}</Icon>
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
                                    <Tooltip title='Total de Cooperados'>
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
                                            {listPanelRelationshipMatrix &&
                                                formatNumberWithThousandsSeparator(listPanelRelationshipMatrix.length)}
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
                                        rows={listPanelRelationshipMatrix}
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
                                                    data_movimento: false,
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

            <TemporaryDrawer
                title='Filtro Listagem'
                closeButton={handleFilterPanelRelationshipMatrix}
                onClose={handleFilterPanelRelationshipMatrix}
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
                                disableClearable={false}
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
                                name='filter_client_portfolios'
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
                                name='filter_client_profiles'
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
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_client_cc_sitconta'
                                label='Situação Conta Corrente'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={ArrayTypeStatusCurrentAccountClient}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_client_is_cooperated'
                                label='É Cooperado'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={[
                                    { id: true, label: "💚 Sim" },
                                    { id: false, label: "🟠 Não" },
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

                        <Grid item xs={12} md={3}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_iap'
                                label='IAP'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={Array.from({ length: 15 }, (_, index) => ({
                                    id: index + 1,
                                    label: (index + 1).toString(),
                                }))}
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_class_iap'
                                label='Classe IAP'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={[
                                    { id: "A", label: "A" },
                                    { id: "B", label: "B" },
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_class_soc'
                                label='Classe SOC'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={[
                                    { id: "A", label: "A" },
                                    { id: "B", label: "B" },
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_quartile'
                                label='Quartil'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={[
                                    { id: "Q1", label: "Q1" },
                                    { id: "Q2", label: "Q2" },
                                    { id: "Q3", label: "Q3" },
                                    { id: "Q4", label: "Q4" },
                                ]}
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
                                options={[
                                    { id: 0, label: "R?" },
                                    { id: 1, label: "R1" },
                                    { id: 2, label: "R2" },
                                    { id: 3, label: "R3" },
                                    { id: 4, label: "R4" },
                                    { id: 5, label: "R5" },
                                    { id: 6, label: "R6" },
                                    { id: 7, label: "R7" },
                                    { id: 8, label: "R8" },
                                    { id: 9, label: "R9" },
                                    { id: 10, label: "R10" },
                                    { id: 11, label: "R11" },
                                    { id: 12, label: "R12" },
                                    { id: 13, label: "R13" },
                                    { id: 14, label: "R14" },
                                    { id: 15, label: "R15" },
                                    { id: 16, label: "R16" },
                                    { id: 17, label: "R17" },
                                    { id: 18, label: "R18" },
                                    { id: 19, label: "R19" },
                                    { id: 20, label: "R20" },
                                    { id: 99, label: "R99" },
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_anot_vig_rel'
                                label='Anot Vig REL'
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
                                name='filter_anot_vig_abs'
                                label='Anot Vig ABS'
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
                                name='filter_hist_inad'
                                label='Histórico INAD'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNo}
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
                                label='Renda Bruta - Min'
                                placeholder='Digite um número'
                                name='filter_gross_income_min'
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
                                label='Renda Bruta - Max'
                                placeholder='Digite um número'
                                name='filter_gross_income_max'
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
                                label='Empréstimo - Min'
                                placeholder='Digite um número'
                                name='filter_loan_min'
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
                                label='Empréstimo - Max'
                                placeholder='Digite um número'
                                name='filter_loan_max'
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
                                label='Financiamento - Min'
                                placeholder='Digite um número'
                                name='filter_financing_min'
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
                                label='Financiamento - Max'
                                placeholder='Digite um número'
                                name='filter_financing_max'
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
                                label='Financiamento Rural - Min'
                                placeholder='Digite um número'
                                name='filter_financing_rural_min'
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
                                label='Financiamento Rural - Max'
                                placeholder='Digite um número'
                                name='filter_financing_rural_max'
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
                                label='Margem Contribuição - Min'
                                placeholder='Digite um número'
                                name='filter_contribution_margin_min'
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
                                label='Margem Contribuição - Max'
                                placeholder='Digite um número'
                                name='filter_contribution_margin_max'
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
                                        filter_client_portfolios: [],
                                        filter_client_profiles: [],
                                        filter_client_cc_sitconta: [],
                                        filter_client_is_cooperated: null,
                                        filter_client_is_rural: null,
                                        filter_iap: [],
                                        filter_class_iap: null,
                                        filter_class_soc: null,
                                        filter_quartile: [],
                                        filter_client_risk_crl: [],
                                        filter_anot_vig_rel: null,
                                        filter_anot_vig_abs: null,
                                        filter_hist_inad: null,
                                        filter_client_document: null,
                                        filter_gross_income_min: "",
                                        filter_gross_income_max: "",
                                        filter_loan_min: "",
                                        filter_loan_max: "",
                                        filter_financing_min: "",
                                        filter_financing_max: "",
                                        filter_financing_rural_min: "",
                                        filter_financing_rural_max: "",
                                        filter_contribution_margin_min: "",
                                        filter_contribution_margin_max: "",
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
                            handleFilterPanelRelationshipMatrix();
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
