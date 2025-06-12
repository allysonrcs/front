import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton } from "@mui/lab";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Badge,
    Box,
    Breadcrumbs,
    Card,
    CardContent,
    Chip,
    Divider,
    FormControlLabel,
    Grid,
    Icon,
    IconButton,
    Link,
    Modal,
    Skeleton,
    Stack,
    Switch,
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
    GridColumnVisibilityModel,
    GridToolbarColumnsButton,
    GridToolbarDensitySelector,
    GridToolbarFilterButton,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import FormAutocompleteMultiple from "@/components/FormComponents/FormAutocompleteMultiple";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import FormInputCpfCnpj from "@/components/FormComponents/FormInputCpfCnpj";
import FormSlider from "@/components/FormComponents/FormSlider";
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
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import CachedOutlinedIcon from "@mui/icons-material/CachedOutlined";
import { Link as LinkRouter } from "react-router-dom";
import {
    formatCnpjCpf,
    formatNumberWithThousandsSeparator,
    formatToBRLCurrency,
    isValidCNPJ,
    isValidCPF,
} from "@/functions/number";
import { ExtClientInfo, mapValueCurrentAccount } from "@/components/ExtClientInfo/ExtClientInfo";
import {
    IListBusinessPanel,
    ISearchAllReportsCatalog,
    searchAllReportsCatalogRecords,
    searchReportsCatalogPanelBusiness,
} from "@/services/reports";
import { ArrayTypesDocumentClient } from "@/constants/array-type-document-client";
import { ArrayTypesProfileClient } from "@/constants/array-type-profile-client";
import { ArrayTypesPortfolioName } from "@/constants/array-type-portfolio-name";
import { ArrayTypeStatusCurrentAccountClient } from "@/constants/array-type-status-current-account-client";
import { searchAutocompleteAgencies } from "@/services/agencies";
import { BoxModal } from "@/components/BoxModal/BoxModal";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";
import { CSATAverageRating } from "@/components/CSATAssessments/CSATAverageRating";
import { ArrayTypesYesOrNoWithEmoji } from "@/constants/array-type-yes-or-no";
import { ArrayTypesPlasticCards } from "@/constants/array-type-plastic-cards";
import { ArrayTypesIncomeTypes } from "@/constants/array-type-income-type";
import WhatsAppButton from "@/components/WhatsappButton/WhatsappButton";
import FormInput from "@/components/FormComponents/FormInput";

const statusSituationCardsMap: { [key: string]: string } = {
    OPERATIVO: "🟢 OPERATIVO",
    BLOQUEADO: "🟠 BLOQUEADO",
    CANCELADO: "🔴 CANCELADO",
};

const marksRiskCRL = Array.from({ length: 22 }, (_, index) => ({
    value: index,
    label: index === 0 ? "R?" : index === 21 ? "R99" : `R${index}`,
}));

const marksIAP = Array.from({ length: 21 }, (_, index) => ({
    value: index,
    label: `${index}`,
}));

type AutoCompleteString = {
    id: string;
    label: string;
};

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

type ListAgencies = {
    id: number;
    label: string;
    agency_sisbr_id: number;
};

export type BusinessPanelProps = {
    filter_client_agencies?: ListAgencies[];
    filter_client_portfolio?: AutoCompleteString[];
    filter_client_profile?: AutoCompleteString[];
    filter_client_type?: AutoCompleteString[];
    filter_client_marital?: AutoCompleteString[];
    filter_client_gender?: AutoCompleteString[];
    filter_client_cc_sitconta?: AutoCompleteString[];
    filter_client_is_rural?: AutoCompleteBoolean;
    filter_client_is_cooperated?: AutoCompleteBoolean;
    filter_client_is_employee?: AutoCompleteBoolean;
    filter_client_document?: string | null;
    filter_financial_risk_crl: [number, number] | null;
    filter_financial_iap: [number, number] | null;
    filter_monthly_income_min?: number | null;
    filter_monthly_income_max?: number | null;
    filter_credit_balance_min?: number | null;
    filter_credit_balance_max?: number | null;
    filter_balance_deudor_sfn_min?: number | null;
    filter_balance_deudor_sfn_max?: number | null;
    filter_credit_days_late_min?: number | null;
    filter_credit_days_late_max?: number | null;
    filter_value_rdc_min?: number | null;
    filter_value_rdc_max?: number | null;
    filter_value_lca_min?: number | null;
    filter_value_lca_max?: number | null;
    filter_value_dap_min?: number | null;
    filter_value_dap_max?: number | null;
    filter_has_ad?: AutoCompleteBoolean;
    filter_income_types?: AutoCompleteString[];
    filter_annotation_current_relation?: AutoCompleteBoolean;
    filter_annotation_current_absolute?: AutoCompleteBoolean;
    filter_annotation_downloaded_relation?: AutoCompleteBoolean;
    filter_annotation_downloaded_absolute?: AutoCompleteBoolean;
    filter_insurance_life?: AutoCompleteBoolean;
    filter_insurance_automobile?: AutoCompleteBoolean;
    filter_insurance_residential?: AutoCompleteBoolean;
    filter_insurance_business?: AutoCompleteBoolean;
    filter_insurance_multirisk?: AutoCompleteBoolean;
    filter_consortium_motorcycle?: AutoCompleteBoolean;
    filter_consortium_automobile?: AutoCompleteBoolean;
    filter_consortium_property?: AutoCompleteBoolean;
    filter_consortium_equipment?: AutoCompleteBoolean;
    filter_consortium_trip?: AutoCompleteBoolean;
    filter_card_plastic?: AutoCompleteString;
    filter_card_status?: AutoCompleteString;
    filter_card_limit_value_min?: number | null;
    filter_card_limit_value_max?: number | null;
    check_special_limit_min?: number | null;
    check_special_limit_max?: number | null;
    check_special_used_min?: number | null;
    check_special_used_max?: number | null;
    check_special_days_use_min?: number | null;
    check_special_days_use_max?: number | null;
};

interface Filters {
    filter_client_agencies?: string[];
    filter_client_portfolio?: string[];
    filter_client_profile?: string[];
    filter_client_type?: string[];
    filter_client_marital?: string[];
    filter_client_gender?: string[];
    filter_client_cc_sitconta?: string[];
    filter_client_is_rural?: string;
    filter_client_is_cooperated?: string;
    filter_client_is_employee?: string;
    filter_client_document?: string;
    filter_financial_risk_crl?: string;
    filter_financial_iap?: string;
    filter_monthly_income_min?: string;
    filter_monthly_income_max?: string;
    filter_credit_balance_min?: string;
    filter_credit_balance_max?: string;
    filter_balance_deudor_sfn_min?: string;
    filter_balance_deudor_sfn_max?: string;
    filter_credit_days_late_min?: string;
    filter_credit_days_late_max?: string;
    filter_value_rdc_min?: string;
    filter_value_rdc_max?: string;
    filter_value_lca_min?: string;
    filter_value_lca_max?: string;
    filter_value_dap_min?: string;
    filter_value_dap_max?: string;
    filter_has_ad?: string;
    filter_income_types?: string;
    filter_annotation_current_relation?: string;
    filter_annotation_current_absolute?: string;
    filter_annotation_downloaded_relation?: string;
    filter_annotation_downloaded_absolute?: string;
    filter_insurance_life?: string;
    filter_insurance_automobile?: string;
    filter_insurance_residential?: string;
    filter_insurance_business?: string;
    filter_insurance_multirisk?: string;
    filter_consortium_motorcycle?: string;
    filter_consortium_automobile?: string;
    filter_consortium_property?: string;
    filter_consortium_equipment?: string;
    filter_consortium_trip?: string;
    filter_card_plastic?: string;
    filter_card_status?: string;
    filter_card_limit_value_max?: string;
    filter_card_limit_value_min?: string;
    check_special_limit_min?: string;
    check_special_limit_max?: string;
    check_special_used_min?: string;
    check_special_used_max?: string;
    check_special_days_use_min?: string;
    check_special_days_use_max?: string;
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
    filter_client_type: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_client_marital: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            }),
        )
        .nullable(),
    filter_client_gender: Yup.array()
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
    filter_client_is_rural: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_client_is_cooperated: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_client_is_employee: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_client_document: Yup.string().max(18, "Máximo 18 caracteres").trim().nullable(),
    filter_financial_risk_crl: Yup.array().of(Yup.number()).nullable(),
    filter_financial_iap: Yup.array().of(Yup.number()).nullable(),
    filter_monthly_income_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_monthly_income_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_credit_balance_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_credit_balance_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_balance_deudor_sfn_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_balance_deudor_sfn_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_credit_days_late_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_credit_days_late_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_value_rdc_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_value_rdc_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_value_lca_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_value_lca_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_value_dap_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_value_dap_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_has_ad: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_income_types: Yup.array()
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
    filter_insurance_life: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_insurance_automobile: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_insurance_residential: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_insurance_business: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_insurance_multirisk: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_consortium_motorcycle: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_consortium_automobile: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_consortium_property: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_consortium_equipment: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_consortium_trip: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_card_plastic: Yup.object()
        .shape({
            id: Yup.string().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_card_status: Yup.object()
        .shape({
            id: Yup.string().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_card_limit_value_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_card_limit_value_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    check_special_limit_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    check_special_limit_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    check_special_used_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    check_special_used_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    check_special_days_use_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    check_special_days_use_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
});

export function BusinessPanel() {
    const [loading, setLoading] = useState(false);
    const [listPanelBusiness, setListPanelBusiness] = useState<IListBusinessPanel[]>([]);
    const [arrayListAgencies, setArrayListAgencies] = useState<ListAgencies[]>([]);
    const [movimentDatePanelBusiness, setMovimentDatePanelBusiness] = useState<string>();
    const [dataPanelBusiness, setDataPanelBusiness] = useState<ISearchAllReportsCatalog>();
    const [dataDetailBusinessPanel, setDataDetailBusinessPanel] = useState<IListBusinessPanel>();
    const [openDrawerFilter, setOpenDrawerFilter] = useState(false);
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);
    const [openModalDetail, setOpenModalDetail] = useState(false);
    const [openModalClient, setOpenModalClient] = useState(false);
    const [idExtClient, setIdExtClient] = useState<number>();
    const [isSwitchOnAllController, setIsSwitchOnAllController] = useState(true);
    const [isSwitchOnAmount, setIsSwitchOnAmount] = useState(false);
    const [isSwitchOnColumnsInformation, setIsSwitchOnColumnsInformation] = useState(true);
    const [isSwitchOnColumnsFinancial, setIsSwitchOnColumnsFinancial] = useState(true);
    const [isSwitchOnColumnsAnnotations, setIsSwitchOnColumnsAnnotations] = useState(true);
    const [isSwitchOnColumnsInsurance, setIsSwitchOnColumnsInsurance] = useState(true);
    const [isSwitchOnColumnsConsortium, setIsSwitchOnColumnsConsortium] = useState(true);
    const [isSwitchOnColumnsCards, setIsSwitchOnColumnsCards] = useState(true);
    const [isSwitchOnColumnsCheckSpecial, setIsSwitchOnColumnsCheckSpecial] = useState(true);
    const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
        cliente_tipo: true,
        cliente_sexo: true,
        cliente_estado_civil: true,
        e_cooperado: true,
        e_funcionario: true,
        cliente_nascimento: true,
        cliente_relacionamento: true,
        cc_sitconta: true,
        risco_crl: true,
        iap: true,
        renda_tipo: true,
        renda_mensal: true,
        credito_saldo: true,
        credito_maxdiasatraso: true,
        valor_rdc: true,
        valor_lca: true,
        valor_dap: true,
        tem_ad: true,
        saldo_devedor_sfn: true,
        anot_vigentes_abs: true,
        anot_vigentes_rel: true,
        anot_baixadas_abs: true,
        anot_baixadas_rel: true,
        seg_vida: true,
        seg_automovel: true,
        seg_residencial: true,
        seg_empresarial: true,
        seg_multirisco: true,
        cons_moto: true,
        cons_automovel: true,
        cons_imoveis: true,
        cons_equipamento: true,
        cons_viagem: true,
        plastico: true,
        sitcartao: true,
        valor_limite: true,
        chesp_limite: true,
        chesp_usado: true,
        chesp_diasuso: true,
    });

    const {
        getInfoError,
        theme,
        isSidebarOpen,
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
        handleSubmit,
        reset,
        resetField,
        setValue,
        watch,
        clearErrors,
        setError,
        formState: { errors },
    } = useForm<BusinessPanelProps | any>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            filter_client_is_cooperated: { id: true, label: "💚 Sim" },
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                const [responseCatalogPanelBusiness, responseListAgencies] = await Promise.all([
                    searchAllReportsCatalogRecords({ route: currentPath }),
                    searchAutocompleteAgencies({
                        is_active: true,
                        with_agency_sisbr_id: true,
                        with_restrict_agency: false,
                    }),
                ]);

                const autoCompleteAgencies = responseListAgencies
                    .map(({ id, abbreviation, agency_sisbr_id }) => ({
                        id,
                        label: abbreviation,
                        agency_sisbr_id,
                    }))
                    .filter((value) => value.agency_sisbr_id !== 102 && value.agency_sisbr_id !== 9999);

                setDataPanelBusiness(responseCatalogPanelBusiness[0]);
                setArrayListAgencies(autoCompleteAgencies);

                const painel_negocios = await searchReportsCatalogPanelBusiness({ e_cooperado: true });
                setListPanelBusiness(painel_negocios);
                setMovimentDatePanelBusiness(painel_negocios[0].data_movimento);
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleModalDetail = () => {
        setOpenModalDetail((oldValue) => !oldValue);
    };

    const handleFilterPanelBusiness = () => {
        setOpenDrawerFilter((oldValue) => !oldValue);
        setSpeedDialOpen(true);
    };

    const handleOpenModalClient = () => {
        setOpenModalClient((oldValue) => !oldValue);
    };

    const handleSwitchChangeAllController = (event: React.ChangeEvent<HTMLInputElement>) => {
        const eventTargetCheckedAllSwitch = event.target.checked;

        setIsSwitchOnAllController(eventTargetCheckedAllSwitch);

        const updateFunctions = [
            setIsSwitchOnAmount,
            setIsSwitchOnColumnsInformation,
            setIsSwitchOnColumnsFinancial,
            setIsSwitchOnColumnsAnnotations,
            setIsSwitchOnColumnsInsurance,
            setIsSwitchOnColumnsConsortium,
            setIsSwitchOnColumnsCards,
            setIsSwitchOnColumnsCheckSpecial,
        ];

        updateFunctions.forEach((updateFunc) => updateFunc(eventTargetCheckedAllSwitch));

        setColumnVisibilityModel((prev) => ({
            ...prev,
            cliente_tipo: eventTargetCheckedAllSwitch,
            cliente_sexo: eventTargetCheckedAllSwitch,
            cliente_estado_civil: eventTargetCheckedAllSwitch,
            e_cooperado: eventTargetCheckedAllSwitch,
            e_funcionario: eventTargetCheckedAllSwitch,
            cliente_nascimento: eventTargetCheckedAllSwitch,
            cliente_relacionamento: eventTargetCheckedAllSwitch,
            cc_sitconta: eventTargetCheckedAllSwitch,
            risco_crl: eventTargetCheckedAllSwitch,
            iap: eventTargetCheckedAllSwitch,
            renda_tipo: eventTargetCheckedAllSwitch,
            renda_mensal: eventTargetCheckedAllSwitch,
            credito_saldo: eventTargetCheckedAllSwitch,
            credito_maxdiasatraso: eventTargetCheckedAllSwitch,
            tem_ad: eventTargetCheckedAllSwitch,
            saldo_devedor_sfn: eventTargetCheckedAllSwitch,
            valor_rdc: eventTargetCheckedAllSwitch,
            valor_lca: eventTargetCheckedAllSwitch,
            valor_dap: eventTargetCheckedAllSwitch,
            anot_vigentes_abs: eventTargetCheckedAllSwitch,
            anot_vigentes_rel: eventTargetCheckedAllSwitch,
            anot_baixadas_abs: eventTargetCheckedAllSwitch,
            anot_baixadas_rel: eventTargetCheckedAllSwitch,
            seg_vida: eventTargetCheckedAllSwitch,
            seg_automovel: eventTargetCheckedAllSwitch,
            seg_residencial: eventTargetCheckedAllSwitch,
            seg_empresarial: eventTargetCheckedAllSwitch,
            seg_multirisco: eventTargetCheckedAllSwitch,
            cons_moto: eventTargetCheckedAllSwitch,
            cons_automovel: eventTargetCheckedAllSwitch,
            cons_imoveis: eventTargetCheckedAllSwitch,
            cons_equipamento: eventTargetCheckedAllSwitch,
            cons_viagem: eventTargetCheckedAllSwitch,
            plastico: eventTargetCheckedAllSwitch,
            sitcartao: eventTargetCheckedAllSwitch,
            valor_limite: eventTargetCheckedAllSwitch,
            chesp_limite: eventTargetCheckedAllSwitch,
            chesp_usado: eventTargetCheckedAllSwitch,
            chesp_diasuso: eventTargetCheckedAllSwitch,
        }));
    };

    const handleSwitchChangeAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsSwitchOnAmount(event.target.checked);
    };

    const handleSwitchChangeColumnsInformation = (event: React.ChangeEvent<HTMLInputElement>) => {
        const eventTargetCheckedInformation = event.target.checked;

        setIsSwitchOnColumnsInformation(eventTargetCheckedInformation);
        setColumnVisibilityModel((prev) => ({
            ...prev,
            cliente_tipo: eventTargetCheckedInformation,
            cliente_sexo: eventTargetCheckedInformation,
            cliente_estado_civil: eventTargetCheckedInformation,
            e_cooperado: eventTargetCheckedInformation,
            e_funcionario: eventTargetCheckedInformation,
            cliente_nascimento: eventTargetCheckedInformation,
            cliente_relacionamento: eventTargetCheckedInformation,
            cc_sitconta: eventTargetCheckedInformation,
        }));
    };

    const handleSwitchChangeColumnsFinancial = (event: React.ChangeEvent<HTMLInputElement>) => {
        const eventTargetCheckedFinancial = event.target.checked;

        setIsSwitchOnColumnsFinancial(eventTargetCheckedFinancial);
        setColumnVisibilityModel((prev) => ({
            ...prev,
            risco_crl: eventTargetCheckedFinancial,
            iap: eventTargetCheckedFinancial,
            renda_tipo: eventTargetCheckedFinancial,
            renda_mensal: eventTargetCheckedFinancial,
            credito_saldo: eventTargetCheckedFinancial,
            credito_maxdiasatraso: eventTargetCheckedFinancial,
            tem_ad: eventTargetCheckedFinancial,
            saldo_devedor_sfn: eventTargetCheckedFinancial,
            valor_rdc: eventTargetCheckedFinancial,
            valor_lca: eventTargetCheckedFinancial,
            valor_dap: eventTargetCheckedFinancial,
        }));
    };

    const handleSwitchChangeColumnsAnnotations = (event: React.ChangeEvent<HTMLInputElement>) => {
        const eventTargetCheckedAnnotations = event.target.checked;

        setIsSwitchOnColumnsAnnotations(eventTargetCheckedAnnotations);
        setColumnVisibilityModel((prev) => ({
            ...prev,
            anot_vigentes_abs: eventTargetCheckedAnnotations,
            anot_vigentes_rel: eventTargetCheckedAnnotations,
            anot_baixadas_abs: eventTargetCheckedAnnotations,
            anot_baixadas_rel: eventTargetCheckedAnnotations,
        }));
    };

    const handleSwitchChangeColumnsInsurance = (event: React.ChangeEvent<HTMLInputElement>) => {
        const eventTargetCheckedInsurance = event.target.checked;

        setIsSwitchOnColumnsInsurance(eventTargetCheckedInsurance);
        setColumnVisibilityModel((prev) => ({
            ...prev,
            seg_vida: eventTargetCheckedInsurance,
            seg_automovel: eventTargetCheckedInsurance,
            seg_residencial: eventTargetCheckedInsurance,
            seg_empresarial: eventTargetCheckedInsurance,
            seg_multirisco: eventTargetCheckedInsurance,
        }));
    };

    const handleSwitchChangeColumnsConsortium = (event: React.ChangeEvent<HTMLInputElement>) => {
        const eventTargetCheckedConsortium = event.target.checked;

        setIsSwitchOnColumnsConsortium(eventTargetCheckedConsortium);
        setColumnVisibilityModel((prev) => ({
            ...prev,
            cons_moto: eventTargetCheckedConsortium,
            cons_automovel: eventTargetCheckedConsortium,
            cons_imoveis: eventTargetCheckedConsortium,
            cons_equipamento: eventTargetCheckedConsortium,
            cons_viagem: eventTargetCheckedConsortium,
        }));
    };

    const handleSwitchChangeColumnsCards = (event: React.ChangeEvent<HTMLInputElement>) => {
        const eventTargetCheckedCards = event.target.checked;

        setIsSwitchOnColumnsCards(eventTargetCheckedCards);
        setColumnVisibilityModel((prev) => ({
            ...prev,
            plastico: eventTargetCheckedCards,
            sitcartao: eventTargetCheckedCards,
            valor_limite: eventTargetCheckedCards,
        }));
    };

    const handleSwitchChangeColumnsCheckSpecial = (event: React.ChangeEvent<HTMLInputElement>) => {
        const eventTargetCheckedCheckSpecial = event.target.checked;

        setIsSwitchOnColumnsCheckSpecial(eventTargetCheckedCheckSpecial);
        setColumnVisibilityModel((prev) => ({
            ...prev,
            chesp_limite: eventTargetCheckedCheckSpecial,
            chesp_usado: eventTargetCheckedCheckSpecial,
            chesp_diasuso: eventTargetCheckedCheckSpecial,
        }));
    };

    const onSubmit = async (params: BusinessPanelProps) => {
        let refactor = {};

        let clientDocumentReplaced: string | undefined;

        if (params.filter_client_agencies && Object.keys(params.filter_client_agencies).length > 0) {
            refactor = {
                ...refactor,
                agencia_id: params.filter_client_agencies.map((clientAgencies) => clientAgencies.agency_sisbr_id),
            };
        }

        if (params.filter_client_portfolio && Object.keys(params.filter_client_portfolio).length > 0) {
            refactor = {
                ...refactor,
                carteira_nome: params.filter_client_portfolio.map((clientPortfolios) => clientPortfolios.id),
            };
        }

        if (params.filter_client_profile && Object.keys(params.filter_client_profile).length > 0) {
            refactor = {
                ...refactor,
                cliente_perfil: params.filter_client_profile.map((clientProfile) => clientProfile.id),
            };
        }

        if (params.filter_client_type && Object.keys(params.filter_client_type).length > 0) {
            refactor = {
                ...refactor,
                cliente_tipo: params.filter_client_type.map((clientType) => clientType.id),
            };
        }

        if (params.filter_client_marital && Object.keys(params.filter_client_marital).length > 0) {
            refactor = {
                ...refactor,
                cliente_estado_civil: params.filter_client_marital.map((clientMarital) => clientMarital.id),
            };
        }

        if (params.filter_client_gender && Object.keys(params.filter_client_gender).length > 0) {
            refactor = {
                ...refactor,
                cliente_sexo: params.filter_client_gender.map((clientGender) => clientGender.id),
            };
        }

        if (params.filter_client_cc_sitconta && Object.keys(params.filter_client_cc_sitconta).length > 0) {
            refactor = {
                ...refactor,
                cliente_cc_sitconta: params.filter_client_cc_sitconta.map((clientGender) => clientGender.id),
            };
        }

        if (params.filter_client_is_rural && Object.keys(params.filter_client_is_rural).length > 0) {
            refactor = { ...refactor, e_rural: params.filter_client_is_rural?.id };
        }

        if (params.filter_client_is_cooperated && Object.keys(params.filter_client_is_cooperated).length > 0) {
            refactor = { ...refactor, e_cooperado: params.filter_client_is_cooperated?.id };
        }

        if (params.filter_client_is_employee && Object.keys(params.filter_client_is_employee).length > 0) {
            refactor = { ...refactor, e_funcionario: params.filter_client_is_employee?.id };
        }

        if (params.filter_financial_risk_crl) {
            const [minRisk, maxRisk] = params.filter_financial_risk_crl;

            const adjustedMaxRisk = maxRisk === 21 ? 99 : maxRisk;

            refactor = {
                ...refactor,
                risco_crl_min: minRisk,
                risco_crl_max: adjustedMaxRisk,
            };
        }

        if (params.filter_financial_iap) {
            const [minIAP, maxIAP] = params.filter_financial_iap;
            refactor = { ...refactor, iap_min: minIAP, iap_max: maxIAP };
        }

        if (params.filter_monthly_income_min) {
            refactor = { ...refactor, renda_mensal_min: params.filter_monthly_income_min };
        }

        if (params.filter_monthly_income_max) {
            refactor = { ...refactor, renda_mensal_max: params.filter_monthly_income_max };
        }

        if (params.filter_credit_balance_min) {
            refactor = { ...refactor, credito_saldo_min: params.filter_credit_balance_min };
        }

        if (params.filter_credit_balance_max) {
            refactor = { ...refactor, credito_saldo_max: params.filter_credit_balance_max };
        }

        if (params.filter_balance_deudor_sfn_min) {
            refactor = { ...refactor, saldo_devedor_sfn_min: params.filter_balance_deudor_sfn_min };
        }

        if (params.filter_balance_deudor_sfn_max) {
            refactor = { ...refactor, saldo_devedor_sfn_max: params.filter_balance_deudor_sfn_max };
        }

        if (params.filter_credit_days_late_min) {
            refactor = { ...refactor, credito_dias_atraso_min: params.filter_credit_days_late_min };
        }

        if (params.filter_credit_days_late_max) {
            refactor = { ...refactor, credito_dias_atraso_max: params.filter_credit_days_late_max };
        }

        if (params.filter_value_rdc_min) {
            refactor = { ...refactor, valor_rdc_min: params.filter_value_rdc_min };
        }

        if (params.filter_value_rdc_max) {
            refactor = { ...refactor, valor_rdc_max: params.filter_value_rdc_max };
        }

        if (params.filter_value_lca_min) {
            refactor = { ...refactor, valor_lca_min: params.filter_value_lca_min };
        }

        if (params.filter_value_lca_max) {
            refactor = { ...refactor, valor_lca_max: params.filter_value_lca_max };
        }

        if (params.filter_value_dap_min) {
            refactor = { ...refactor, valor_dap_min: params.filter_value_dap_min };
        }

        if (params.filter_value_dap_max) {
            refactor = { ...refactor, valor_dap_max: params.filter_value_dap_max };
        }

        if (params.filter_has_ad && Object.keys(params.filter_has_ad).length > 0) {
            refactor = { ...refactor, tem_ad: params.filter_has_ad?.id };
        }

        if (params.filter_income_types && Object.keys(params.filter_income_types).length > 0) {
            refactor = {
                ...refactor,
                renda_tipo: params.filter_income_types.map((incomeTypes) => incomeTypes.id),
            };
        }

        if (
            params.filter_annotation_current_relation &&
            Object.keys(params.filter_annotation_current_relation).length > 0
        ) {
            refactor = { ...refactor, anot_vigentes_rel: params.filter_annotation_current_relation?.id };
        }

        if (
            params.filter_annotation_current_absolute &&
            Object.keys(params.filter_annotation_current_absolute).length > 0
        ) {
            refactor = { ...refactor, anot_vigentes_abs: params.filter_annotation_current_absolute?.id };
        }

        if (
            params.filter_annotation_downloaded_relation &&
            Object.keys(params.filter_annotation_downloaded_relation).length > 0
        ) {
            refactor = { ...refactor, anot_baixadas_rel: params.filter_annotation_downloaded_relation?.id };
        }

        if (
            params.filter_annotation_downloaded_absolute &&
            Object.keys(params.filter_annotation_downloaded_absolute).length > 0
        ) {
            refactor = { ...refactor, anot_baixadas_abs: params.filter_annotation_downloaded_absolute?.id };
        }

        if (params.filter_insurance_life && Object.keys(params.filter_insurance_life).length > 0) {
            refactor = { ...refactor, seg_vida: params.filter_insurance_life?.id };
        }

        if (params.filter_insurance_automobile && Object.keys(params.filter_insurance_automobile).length > 0) {
            refactor = { ...refactor, seg_automovel: params.filter_insurance_automobile?.id };
        }

        if (params.filter_insurance_residential && Object.keys(params.filter_insurance_residential).length > 0) {
            refactor = { ...refactor, seg_residencial: params.filter_insurance_residential?.id };
        }

        if (params.filter_insurance_business && Object.keys(params.filter_insurance_business).length > 0) {
            refactor = { ...refactor, seg_empresarial: params.filter_insurance_business?.id };
        }

        if (params.filter_insurance_multirisk && Object.keys(params.filter_insurance_multirisk).length > 0) {
            refactor = { ...refactor, seg_multirisco: params.filter_insurance_multirisk?.id };
        }

        if (params.filter_consortium_motorcycle && Object.keys(params.filter_consortium_motorcycle).length > 0) {
            refactor = { ...refactor, cons_moto: params.filter_consortium_motorcycle?.id };
        }

        if (params.filter_consortium_automobile && Object.keys(params.filter_consortium_automobile).length > 0) {
            refactor = { ...refactor, cons_automovel: params.filter_consortium_automobile?.id };
        }

        if (params.filter_consortium_property && Object.keys(params.filter_consortium_property).length > 0) {
            refactor = { ...refactor, cons_imoveis: params.filter_consortium_property?.id };
        }

        if (params.filter_consortium_equipment && Object.keys(params.filter_consortium_equipment).length > 0) {
            refactor = { ...refactor, cons_equipamento: params.filter_consortium_equipment?.id };
        }

        if (params.filter_consortium_trip && Object.keys(params.filter_consortium_trip).length > 0) {
            refactor = { ...refactor, cons_viagem: params.filter_consortium_trip?.id };
        }

        if (params.filter_card_plastic && Object.keys(params.filter_card_plastic).length > 0) {
            refactor = { ...refactor, cartao_plastico: params.filter_card_plastic?.id };
        }

        if (params.filter_card_status && Object.keys(params.filter_card_status).length > 0) {
            refactor = { ...refactor, cartao_situacao: params.filter_card_status?.id };
        }

        if (params.filter_card_limit_value_min) {
            refactor = { ...refactor, cartao_valor_limite_min: params.filter_card_limit_value_min };
        }

        if (params.filter_card_limit_value_max) {
            refactor = { ...refactor, cartao_valor_limite_max: params.filter_card_limit_value_max };
        }

        if (params.check_special_limit_min) {
            refactor = { ...refactor, check_especial_limite_min: params.check_special_limit_min };
        }

        if (params.check_special_limit_max) {
            refactor = { ...refactor, check_especial_limite_max: params.check_special_limit_max };
        }

        if (params.check_special_used_min) {
            refactor = { ...refactor, check_especial_usado_min: params.check_special_used_min };
        }

        if (params.check_special_used_max) {
            refactor = { ...refactor, check_especial_usado_max: params.check_special_used_max };
        }

        if (params.check_special_days_use_min) {
            refactor = { ...refactor, cartao_valor_dia_uso_min: params.check_special_days_use_min };
        }

        if (params.check_special_days_use_max) {
            refactor = { ...refactor, cartao_valor_dia_uso_max: params.check_special_days_use_max };
        }

        if (params.filter_has_ad && Object.keys(params.filter_has_ad).length > 0) {
            refactor = { ...refactor, tem_ad: params.filter_has_ad?.id };
        }

        if (params?.filter_client_document) {
            clientDocumentReplaced = params.filter_client_document.replace(/[\.\-\/]/g, "");

            if (clientDocumentReplaced.length === 11) {
                const isValid = isValidCPF(clientDocumentReplaced);
                if (!isValid) {
                    setError("filter_client_document", {
                        type: "manual",
                        message: "CPF inválido. Verifique os dados inseridos.",
                    });
                    toast.error("CPF inválido. Verifique os dados inseridos.");
                    return false;
                }
            } else if (clientDocumentReplaced.length === 14) {
                const isValid = isValidCNPJ(clientDocumentReplaced);
                if (!isValid) {
                    setError("filter_client_document", {
                        type: "manual",
                        message: "CNPJ inválido. Verifique os dados inseridos.",
                    });
                    toast.error("CNPJ inválido. Verifique os dados inseridos.");
                    return false;
                }
            } else {
                setError("filter_client_document", {
                    type: "manual",
                    message: "Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ).",
                });
                toast.error("Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ).");
                return false;
            }

            if (clientDocumentReplaced) {
                refactor = { ...refactor, cliente_documento: clientDocumentReplaced };
            }
        }

        try {
            setLoading(true);

            const dataPanelBusiness = await searchReportsCatalogPanelBusiness(refactor);
            setListPanelBusiness(dataPanelBusiness);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            clearErrors();

            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    };

    const handleRefresh = handleSubmit((params) => {
        onSubmit(params);
        toast.success("Atualização realizada com sucesso!");
    });

    const filters = {
        filter_client_agencies: watch("filter_client_agencies")?.map((item: { label: string }) => item.label) || [],
        filter_client_portfolio: watch("filter_client_portfolio")?.map((item: { label: string }) => item.label) || [],
        filter_client_profile: watch("filter_client_profile")?.map((item: { label: string }) => item.label) || [],
        filter_client_type: watch("filter_client_type")?.map((item: { label: string }) => item.label) || [],
        filter_client_marital: watch("filter_client_marital")?.map((item: { label: string }) => item.label) || [],
        filter_client_gender: watch("filter_client_gender")?.map((item: { label: string }) => item.label) || [],
        filter_client_cc_sitconta:
            watch("filter_client_cc_sitconta")?.map((item: { label: string }) => item.label) || [],
        filter_client_is_rural: watch("filter_client_is_rural")?.label,
        filter_client_is_cooperated: watch("filter_client_is_cooperated")?.label,
        filter_client_is_employee: watch("filter_client_is_employee")?.label,
        filter_client_document: watch("filter_client_document"),
    };

    const labelsMap = {
        filter_client_agencies: "Agência(s)",
        filter_client_portfolio: "Carteira(s)",
        filter_client_profile: "Perfil",
        filter_client_type: "Tipo",
        filter_client_marital: "Estado Civil",
        filter_client_gender: "Genêro",
        filter_client_cc_sitconta: "Situação Conta Corrente",
        filter_client_is_rural: "É Rural",
        filter_client_is_cooperated: "É Cooperado",
        filter_client_is_employee: "É Funcionário",
        filter_client_document: "CPF/CNPJ",
    };

    const clearAllFilters = () => {
        reset({
            filter_client_agencies: [],
            filter_client_portfolio: [],
            filter_client_profile: [],
            filter_client_type: [],
            filter_client_marital: [],
            filter_client_gender: [],
            filter_client_cc_sitconta: [],
            filter_client_is_rural: null,
            filter_client_is_cooperated: null,
            filter_client_is_employee: null,
            filter_client_document: null,
        });
        handleRefresh();
    };

    const removeFilter = (key: keyof Filters) => {
        const currentValue = watch(key);

        if (Array.isArray(currentValue)) {
            setValue(key, []);
        } else {
            setValue(key, null);
        }

        watch(key);
        handleRefresh();
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
                            disabled={loading}
                            sx={{ border: `1px solid ${colorBorderSystem}` }}
                            onClick={clearAllFilters}>
                            <DeleteOutlineOutlinedIcon color={loading ? "disabled" : "error"} />
                        </IconButton>
                        <IconButton
                            title='Atualizar dados'
                            size='small'
                            type='submit'
                            disabled={loading}
                            sx={{ border: `1px solid ${colorBorderSystem}` }}
                            onClick={handleRefresh}>
                            <RefreshIcon color={loading ? "disabled" : "success"} />
                        </IconButton>
                        <IconButton
                            title='Abrir Filtros'
                            size='small'
                            type='submit'
                            sx={{ border: `1px solid ${colorBorderSystem}` }}
                            onClick={handleFilterPanelBusiness}>
                            <FilterAltOutlinedIcon color='primary' />
                        </IconButton>
                    </Stack>
                )}
            </Stack>
        );
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

    const columns: GridColDef[] = [
        {
            field: "Opções",
            width: 68,
            align: "center",
            headerAlign: "center",
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            hideable: false,
            renderCell: (cellValues) => {
                return (
                    <Stack direction='row' spacing={1}>
                        <IconButton
                            onClick={(event) => {
                                event.stopPropagation();
                                handleModalDetail();
                                setDataDetailBusinessPanel(cellValues.row);
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
            field: "cliente_nome",
            headerName: "Nome",
            minWidth: 200,
            hideable: false,
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
            field: "agencia_nome",
            headerName: "PA",
            headerAlign: "center",
            hideable: false,
            minWidth: 125,
        },
        {
            field: "carteira_nome",
            headerName: "Carteira",
            headerAlign: "center",
            minWidth: 125,
        },
        {
            field: "cliente_perfil",
            headerName: "Perfil",
            width: 90,
        },
        {
            field: "e_rural",
            headerName: "É Rural?",
            width: 65,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }: any) => {
                return <Typography>{value ? "🌱 Sim" : "      Não"}</Typography>;
            },
        },
        {
            field: "cliente_tipo",
            headerName: "ℹ️ Tipo",
            width: 65,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "cliente_sexo",
            headerName: "ℹ️ Gênero",
            width: 82,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{value !== null && value !== undefined ? value : "-"}</Typography>;
            },
        },
        {
            field: "cliente_estado_civil",
            headerName: "ℹ️ Estado Civil",
            width: 110,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{value !== null && value !== undefined ? value : "-"}</Typography>;
            },
        },
        {
            field: "e_cooperado",
            headerName: "ℹ️ É Cooperado?",
            width: 124,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }: any) => {
                return <Typography>{value ? "💚 Sim" : "🟠 Não"}</Typography>;
            },
        },
        {
            field: "e_funcionario",
            headerName: "ℹ️ É Funcionário?",
            width: 128,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return <Typography color={value ? "error.light" : "text.primary"}>{value ? "Sim" : "Não"}</Typography>;
            },
        },
        {
            field: "cliente_nascimento",
            headerName: "ℹ️ Data Nascimento",
            minWidth: 145,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY")}</Typography>;
            },
        },
        {
            field: "cliente_relacionamento",
            headerName: "ℹ️ Início Relacionamento",
            minWidth: 175,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY")}</Typography>;
            },
        },
        {
            headerAlign: "center",
            field: "cc_sitconta",
            headerName: "ℹ️ Status Conta Corrente",
            align: "center",
            width: 175,
            renderCell: ({ value }: any) => {
                return <Typography>{mapValueCurrentAccount(value)}</Typography>;
            },
        },
        {
            field: "risco_crl",
            headerName: "💰 Risco CRL",
            headerAlign: "center",
            align: "center",
            width: 101,
            renderCell: ({ value }) => {
                return (
                    <Typography title={value === 0 ? "Sem classificação de risco" : ""}>
                        {value ? `R${value}` : "R?"}
                    </Typography>
                );
            },
        },
        {
            field: "iap",
            headerName: "💰 IAP",
            headerAlign: "center",
            align: "center",
            width: 59,
            renderCell: ({ value }) => {
                return <Typography>{value ? value : 0}</Typography>;
            },
        },
        {
            field: "renda_tipo",
            headerName: "💰 Tipo da Renda",
            headerAlign: "center",
            width: 126,
        },
        {
            field: "renda_mensal",
            headerName: "💰 Renda Mensal",
            minWidth: 126,
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
        {
            field: "credito_saldo",
            headerName: "💰 Crédito Saldo",
            minWidth: 121,
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
        {
            field: "credito_maxdiasatraso",
            headerName: "💰 Crédito dias atraso",
            headerAlign: "center",
            align: "center",
            width: 155,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{value !== null && value !== undefined ? value : "-"}</Typography>;
            },
        },
        {
            field: "tem_ad",
            headerName: "💰 Tem AD",
            headerAlign: "center",
            align: "center",
            width: 86,
            renderCell: ({ value }: any) => {
                return <Typography>{value ? "Sim" : "Não"}</Typography>;
            },
        },
        {
            field: "saldo_devedor_sfn",
            headerName: "💰 Saldo Devedor SFN",
            headerAlign: "center",
            align: "center",
            width: 158,
            renderCell: ({ value }: any) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "valor_rdc",
            headerName: "💰 Valor RDC",
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
            field: "valor_lca",
            headerName: "💰 Valor LCA",
            headerAlign: "center",
            align: "center",
            width: 98,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? formatToBRLCurrency(value) : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "valor_dap",
            headerName: "💰 Valor DAP",
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
            field: "anot_vigentes_abs",
            headerName: "📝 Anot. Vigente ABS",
            headerAlign: "center",
            align: "center",
            minWidth: 179,
            renderCell: ({ value }) => (
                <Typography
                    fontWeight={value !== null && value !== undefined ? "bold" : "100"}
                    color={
                        isSwitchOnAmount
                            ? value !== null && value !== undefined
                                ? "success.light"
                                : "#b5b5b5"
                            : "text.primary"
                    }
                    title={
                        value !== null && value !== undefined
                            ? `✅ Possui | Quantidade: ${value}`
                            : "❌ Não Possui | Quantidade: 0"
                    }>
                    {isSwitchOnAmount
                        ? value !== null && value !== undefined
                            ? value
                            : "0"
                        : value !== null && value !== undefined
                          ? "✅"
                          : "❌"}
                </Typography>
            ),
        },
        {
            field: "anot_baixadas_abs",
            headerName: "📝 Anot. Baixadas ABS",
            headerAlign: "center",
            align: "center",
            minWidth: 160,
            renderCell: ({ value }) => (
                <Typography
                    fontWeight={value !== null && value !== undefined ? "bold" : "100"}
                    color={
                        isSwitchOnAmount
                            ? value !== null && value !== undefined
                                ? "success.light"
                                : "#b5b5b5"
                            : "text.primary"
                    }
                    title={
                        value !== null && value !== undefined
                            ? `✅ Possui | Quantidade: ${value}`
                            : "❌ Não Possui | Quantidade: 0"
                    }>
                    {isSwitchOnAmount
                        ? value !== null && value !== undefined
                            ? value
                            : "0"
                        : value !== null && value !== undefined
                          ? "✅"
                          : "❌"}
                </Typography>
            ),
        },
        {
            field: "anot_vigentes_rel",
            headerName: "📝 Anot. Vigente REL",
            headerAlign: "center",
            align: "center",
            minWidth: 149,
            renderCell: ({ value }) => (
                <Typography
                    fontWeight={value !== null && value !== undefined ? "bold" : "100"}
                    color={
                        isSwitchOnAmount
                            ? value !== null && value !== undefined
                                ? "success.light"
                                : "#b5b5b5"
                            : "text.primary"
                    }
                    title={
                        value !== null && value !== undefined
                            ? `✅ Possui | Quantidade: ${value}`
                            : "❌ Não Possui | Quantidade: 0"
                    }>
                    {isSwitchOnAmount
                        ? value !== null && value !== undefined
                            ? value
                            : "0"
                        : value !== null && value !== undefined
                          ? "✅"
                          : "❌"}
                </Typography>
            ),
        },
        {
            field: "anot_baixadas_rel",
            headerName: "📝 Anot. Baixadas REL",
            headerAlign: "center",
            align: "center",
            minWidth: 160,
            renderCell: ({ value }) => (
                <Typography
                    fontWeight={value !== null && value !== undefined ? "bold" : "100"}
                    color={
                        isSwitchOnAmount
                            ? value !== null && value !== undefined
                                ? "success.light"
                                : "#b5b5b5"
                            : "text.primary"
                    }
                    title={
                        value !== null && value !== undefined
                            ? `✅ Possui | Quantidade: ${value}`
                            : "❌ Não Possui | Quantidade: 0"
                    }>
                    {isSwitchOnAmount
                        ? value !== null && value !== undefined
                            ? value
                            : "0"
                        : value !== null && value !== undefined
                          ? "✅"
                          : "❌"}
                </Typography>
            ),
        },
        {
            field: "seg_vida",
            headerName: "🛡️ Seg. Vida",
            headerAlign: "center",
            align: "center",
            width: 96,
            renderCell: ({ value }) => (
                <Typography
                    fontWeight={value !== null && value !== undefined ? "bold" : "100"}
                    color={
                        isSwitchOnAmount
                            ? value !== null && value !== undefined
                                ? "success.light"
                                : "#b5b5b5"
                            : "text.primary"
                    }
                    title={
                        value !== null && value !== undefined
                            ? `✅ Possui | Quantidade: ${value}`
                            : "❌ Não Possui | Quantidade: 0"
                    }>
                    {isSwitchOnAmount
                        ? value !== null && value !== undefined
                            ? value
                            : "0"
                        : value !== null && value !== undefined
                          ? "✅"
                          : "❌"}
                </Typography>
            ),
        },
        {
            field: "seg_automovel",
            headerName: "🛡️ Seg. Automóvel",
            headerAlign: "center",
            align: "center",
            width: 135,
            renderCell: ({ value }) => (
                <Typography
                    fontWeight={value !== null && value !== undefined ? "bold" : "100"}
                    color={
                        isSwitchOnAmount
                            ? value !== null && value !== undefined
                                ? "success.light"
                                : "#b5b5b5"
                            : "text.primary"
                    }
                    title={
                        value !== null && value !== undefined
                            ? `✅ Possui | Quantidade: ${value}`
                            : "❌ Não Possui | Quantidade: 0"
                    }>
                    {isSwitchOnAmount
                        ? value !== null && value !== undefined
                            ? value
                            : "0"
                        : value !== null && value !== undefined
                          ? "✅"
                          : "❌"}
                </Typography>
            ),
        },
        {
            field: "seg_residencial",
            headerName: "🛡️ Seg. Residencial",
            headerAlign: "center",
            align: "center",
            width: 139,
            renderCell: ({ value }) => (
                <Typography
                    fontWeight={value !== null && value !== undefined ? "bold" : "100"}
                    color={
                        isSwitchOnAmount
                            ? value !== null && value !== undefined
                                ? "success.light"
                                : "#b5b5b5"
                            : "text.primary"
                    }
                    title={
                        value !== null && value !== undefined
                            ? `✅ Possui | Quantidade: ${value}`
                            : "❌ Não Possui | Quantidade: 0"
                    }>
                    {isSwitchOnAmount
                        ? value !== null && value !== undefined
                            ? value
                            : "0"
                        : value !== null && value !== undefined
                          ? "✅"
                          : "❌"}
                </Typography>
            ),
        },
        {
            field: "seg_empresarial",
            headerName: "🛡️ Seg. Empresarial",
            headerAlign: "center",
            align: "center",
            width: 142,
            renderCell: ({ value }) => (
                <Typography
                    fontWeight={value !== null && value !== undefined ? "bold" : "100"}
                    color={
                        isSwitchOnAmount
                            ? value !== null && value !== undefined
                                ? "success.light"
                                : "#b5b5b5"
                            : "text.primary"
                    }
                    title={
                        value !== null && value !== undefined
                            ? `✅ Possui | Quantidade: ${value}`
                            : "❌ Não Possui | Quantidade: 0"
                    }>
                    {isSwitchOnAmount
                        ? value !== null && value !== undefined
                            ? value
                            : "0"
                        : value !== null && value !== undefined
                          ? "✅"
                          : "❌"}
                </Typography>
            ),
        },
        {
            field: "seg_multirisco",
            headerName: "🛡️ Seg. Multirisco",
            headerAlign: "center",
            align: "center",
            width: 130,
            renderCell: ({ value }) => (
                <Typography
                    fontWeight={value !== null && value !== undefined ? "bold" : "100"}
                    color={
                        isSwitchOnAmount
                            ? value !== null && value !== undefined
                                ? "success.light"
                                : "#b5b5b5"
                            : "text.primary"
                    }
                    title={
                        value !== null && value !== undefined
                            ? `✅ Possui | Quantidade: ${value}`
                            : "❌ Não Possui | Quantidade: 0"
                    }>
                    {isSwitchOnAmount
                        ? value !== null && value !== undefined
                            ? value
                            : "0"
                        : value !== null && value !== undefined
                          ? "✅"
                          : "❌"}
                </Typography>
            ),
        },
        {
            field: "cons_moto",
            headerName: "🤝 Cons. Moto",
            headerAlign: "center",
            align: "center",
            width: 109,
            renderCell: ({ value }) => (
                <Typography
                    fontWeight={value !== null && value !== undefined ? "bold" : "100"}
                    color={
                        isSwitchOnAmount
                            ? value !== null && value !== undefined
                                ? "success.light"
                                : "#b5b5b5"
                            : "text.primary"
                    }
                    title={
                        value !== null && value !== undefined
                            ? `✅ Possui | Quantidade: ${value}`
                            : "❌ Não Possui | Quantidade: 0"
                    }>
                    {isSwitchOnAmount
                        ? value !== null && value !== undefined
                            ? value
                            : "0"
                        : value !== null && value !== undefined
                          ? "✅"
                          : "❌"}
                </Typography>
            ),
        },
        {
            field: "cons_automovel",
            headerName: "🤝 Cons. Automóvel",
            headerAlign: "center",
            align: "center",
            width: 143,
            renderCell: ({ value }) => (
                <Typography
                    fontWeight={value !== null && value !== undefined ? "bold" : "100"}
                    color={
                        isSwitchOnAmount
                            ? value !== null && value !== undefined
                                ? "success.light"
                                : "#b5b5b5"
                            : "text.primary"
                    }
                    title={
                        value !== null && value !== undefined
                            ? `✅ Possui | Quantidade: ${value}`
                            : "❌ Não Possui | Quantidade: 0"
                    }>
                    {isSwitchOnAmount
                        ? value !== null && value !== undefined
                            ? value
                            : "0"
                        : value !== null && value !== undefined
                          ? "✅"
                          : "❌"}
                </Typography>
            ),
        },
        {
            field: "cons_imoveis",
            headerName: "🤝 Cons. Imóveis",
            headerAlign: "center",
            align: "center",
            width: 125,
            renderCell: ({ value }) => (
                <Typography
                    fontWeight={value !== null && value !== undefined ? "bold" : "100"}
                    color={
                        isSwitchOnAmount
                            ? value !== null && value !== undefined
                                ? "success.light"
                                : "#b5b5b5"
                            : "text.primary"
                    }
                    title={
                        value !== null && value !== undefined
                            ? `✅ Possui | Quantidade: ${value}`
                            : "❌ Não Possui | Quantidade: 0"
                    }>
                    {isSwitchOnAmount
                        ? value !== null && value !== undefined
                            ? value
                            : "0"
                        : value !== null && value !== undefined
                          ? "✅"
                          : "❌"}
                </Typography>
            ),
        },
        {
            field: "cons_equipamento",
            headerName: "🤝 Cons. Equipamento",
            headerAlign: "center",
            align: "center",
            width: 159,
            renderCell: ({ value }) => (
                <Typography
                    fontWeight={value !== null && value !== undefined ? "bold" : "100"}
                    color={
                        isSwitchOnAmount
                            ? value !== null && value !== undefined
                                ? "success.light"
                                : "#b5b5b5"
                            : "text.primary"
                    }
                    title={
                        value !== null && value !== undefined
                            ? `✅ Possui | Quantidade: ${value}`
                            : "❌ Não Possui | Quantidade: 0"
                    }>
                    {isSwitchOnAmount
                        ? value !== null && value !== undefined
                            ? value
                            : "0"
                        : value !== null && value !== undefined
                          ? "✅"
                          : "❌"}
                </Typography>
            ),
        },
        {
            field: "cons_viagem",
            headerName: "🤝 Cons. Viagem",
            headerAlign: "center",
            align: "center",
            width: 124,
            renderCell: ({ value }) => (
                <Typography
                    fontWeight={value !== null && value !== undefined ? "bold" : "100"}
                    color={
                        isSwitchOnAmount
                            ? value !== null && value !== undefined
                                ? "success.light"
                                : "#b5b5b5"
                            : "text.primary"
                    }
                    title={
                        value !== null && value !== undefined
                            ? `✅ Possui | Quantidade: ${value}`
                            : "❌ Não Possui | Quantidade: 0"
                    }>
                    {isSwitchOnAmount
                        ? value !== null && value !== undefined
                            ? value
                            : "0"
                        : value !== null && value !== undefined
                          ? "✅"
                          : "❌"}
                </Typography>
            ),
        },
        {
            field: "plastico",
            headerName: "💳 Plástico",
            headerAlign: "center",
            width: 145,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{value !== null && value !== undefined ? value : "-"}</Typography>;
            },
        },
        {
            field: "sitcartao",
            headerName: "💳 Situação Cartão",
            headerAlign: "center",
            align: "center",
            width: 137,
            renderCell: ({ value }) => {
                return (
                    <Typography fontSize={14}>
                        {value !== null && value !== undefined ? statusSituationCardsMap[value] : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "valor_limite",
            headerName: "💳 Valor Limite",
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
            field: "chesp_limite",
            headerName: "🧾 Cheque Esp. Limite",
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
            headerName: "🧾 Cheque Esp. Usado",
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
            headerName: "🧾 Cheque Esp. Dia Uso",
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
                            <Typography sx={{ color: "text.secondary" }}>{dataPanelBusiness?.title || ""}</Typography>
                        </Breadcrumbs>

                        {dataPanelBusiness && (
                            <CSATAverageRating
                                module={`Painel | ${dataPanelBusiness.title}`}
                                routePath={`${dataPanelBusiness.route}`}
                                isClickable
                                formProps={{
                                    module: `Painel | ${dataPanelBusiness.title}`,
                                    routePath: `${dataPanelBusiness.route}`,
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
                {dataPanelBusiness ? (
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
                                        backgroundImage: dataPanelBusiness.background_color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "1.5rem",
                                        fontWeight: "bold",
                                        position: "relative",
                                    }}>
                                    <Tooltip title={dataPanelBusiness?.description || ""}>
                                        <Box
                                            position='absolute'
                                            top={5}
                                            left={8}
                                            color='white'
                                            padding='4px 8px'
                                            borderRadius='4px'>
                                            <Icon>{dataPanelBusiness.label_icon}</Icon>
                                        </Box>
                                    </Tooltip>
                                    {movimentDatePanelBusiness && (
                                        <Tooltip
                                            title={`Data de atualização da base do painel de negócios do dia: ${formatDate(
                                                movimentDatePanelBusiness,
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
                                                    {movimentDatePanelBusiness &&
                                                        formatDate(movimentDatePanelBusiness, "DD/MM/YYYY")}
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    )}
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
                                        {listPanelBusiness &&
                                            formatNumberWithThousandsSeparator(listPanelBusiness.length)}
                                    </Box>
                                </Box>
                            </Box>
                            <CardContent
                                sx={{
                                    background: colorBackgroundSystem,
                                    boxShadow: colorBoxShadowSystem,
                                }}>
                                <Box>
                                    {dataPanelBusiness.is_active === false && (
                                        <Grid item xs={12}>
                                            <Alert severity='error' sx={{ mb: 2, fontSize: 12 }}>
                                                Este painel está desativado e não pode ser carregado. Entre em contato
                                                com a equipe do MIND para mais informações.
                                                <LinkRouter to='/relatorios/catalogo'>
                                                    <Typography
                                                        color='error.light'
                                                        fontSize={14}
                                                        component='span'
                                                        ml={0.5}>
                                                        Retornar para página do Catálogo
                                                    </Typography>
                                                </LinkRouter>
                                            </Alert>
                                        </Grid>
                                    )}

                                    <Grid display='flex' container item xs={12} mb={2}>
                                        <Accordion
                                            defaultExpanded
                                            sx={{
                                                width: "100%",
                                            }}>
                                            <AccordionSummary
                                                sx={{ marginTop: -0.5, marginBottom: -0.5 }}
                                                expandIcon={<ArrowDropDownOutlinedIcon />}
                                                aria-controls='panel2-content'
                                                id='panel2-header'>
                                                <Typography fontWeight={700}>Exibição de Colunas</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Grid display='flex' flexDirection='row'>
                                                    <Grid container mt={-2} xs={12} gap={1}>
                                                        <Grid
                                                            item
                                                            xs={6}
                                                            md={5.6}
                                                            sx={{
                                                                border: `1px dashed ${colorBorderSystem}`,
                                                                borderRadius: 3,
                                                                paddingInline: 1,
                                                            }}
                                                            title={"Colunas de Produtos"}>
                                                            <FormControlLabel
                                                                title='Exibir Resultado em Quantidade na coluna de produtos'
                                                                control={
                                                                    <Switch
                                                                        checked={isSwitchOnAmount}
                                                                        onChange={handleSwitchChangeAmount}
                                                                        color='primary'
                                                                        disabled={
                                                                            !isSwitchOnColumnsAnnotations &&
                                                                            !isSwitchOnColumnsInsurance &&
                                                                            !isSwitchOnColumnsConsortium
                                                                        }
                                                                    />
                                                                }
                                                                label={
                                                                    isMobile || isSidebarOpen
                                                                        ? "🔢 Qtd"
                                                                        : "🔢 Quantidade"
                                                                }
                                                            />

                                                            <FormControlLabel
                                                                title='Exibir coluna de Anotações'
                                                                control={
                                                                    <Switch
                                                                        checked={isSwitchOnColumnsAnnotations}
                                                                        onChange={handleSwitchChangeColumnsAnnotations}
                                                                        color='primary'
                                                                    />
                                                                }
                                                                label={
                                                                    isMobile || isSidebarOpen
                                                                        ? "📝 Anot"
                                                                        : "📝 Anotações"
                                                                }
                                                            />

                                                            <FormControlLabel
                                                                title='Exibir coluna de Seguros'
                                                                control={
                                                                    <Switch
                                                                        checked={isSwitchOnColumnsInsurance}
                                                                        onChange={handleSwitchChangeColumnsInsurance}
                                                                        color='primary'
                                                                    />
                                                                }
                                                                label={
                                                                    isMobile || isSidebarOpen ? "🛡️ Seg" : "🛡️ Seguros"
                                                                }
                                                            />

                                                            <FormControlLabel
                                                                title='Exibir coluna de Consórcios'
                                                                control={
                                                                    <Switch
                                                                        checked={isSwitchOnColumnsConsortium}
                                                                        onChange={handleSwitchChangeColumnsConsortium}
                                                                        color='primary'
                                                                    />
                                                                }
                                                                label={
                                                                    isMobile || isSidebarOpen
                                                                        ? "🤝 Cons"
                                                                        : "🤝 Consórcio"
                                                                }
                                                            />
                                                        </Grid>

                                                        <Grid
                                                            item
                                                            xs
                                                            md={4.9}
                                                            sx={{
                                                                border: `1px dashed ${colorBorderSystem}`,
                                                                borderRadius: 3,
                                                                paddingInline: 1,
                                                            }}
                                                            title={"Colunas de Informações do Cooperado"}>
                                                            <FormControlLabel
                                                                title='Exibir coluna de Informações Adicionais do Cooperado'
                                                                control={
                                                                    <Switch
                                                                        checked={isSwitchOnColumnsInformation}
                                                                        onChange={handleSwitchChangeColumnsInformation}
                                                                        color='primary'
                                                                    />
                                                                }
                                                                label={"ℹ️ Info"}
                                                            />

                                                            <FormControlLabel
                                                                title='Exibir coluna de Dados Financeiros'
                                                                control={
                                                                    <Switch
                                                                        checked={isSwitchOnColumnsFinancial}
                                                                        onChange={handleSwitchChangeColumnsFinancial}
                                                                        color='primary'
                                                                    />
                                                                }
                                                                label={
                                                                    isMobile || isSidebarOpen
                                                                        ? "💰 Financ"
                                                                        : "💰 Financeiro"
                                                                }
                                                            />

                                                            <FormControlLabel
                                                                title='Exibir coluna de Cartão'
                                                                control={
                                                                    <Switch
                                                                        checked={isSwitchOnColumnsCards}
                                                                        onChange={handleSwitchChangeColumnsCards}
                                                                        color='primary'
                                                                    />
                                                                }
                                                                label='💳 Cartão'
                                                            />

                                                            <FormControlLabel
                                                                title='Exibir coluna de Cheque Especial'
                                                                control={
                                                                    <Switch
                                                                        checked={isSwitchOnColumnsCheckSpecial}
                                                                        onChange={handleSwitchChangeColumnsCheckSpecial}
                                                                        color='primary'
                                                                    />
                                                                }
                                                                label='🧾 Cheque'
                                                            />
                                                        </Grid>

                                                        <Grid
                                                            item
                                                            xs={12}
                                                            md
                                                            sx={{
                                                                border: `1px dashed ${colorBorderSystem}`,
                                                                borderRadius: 3,
                                                                paddingInline: 1,
                                                            }}>
                                                            <FormControlLabel
                                                                title={
                                                                    isSwitchOnAllController
                                                                        ? "Desativar todos os switchs"
                                                                        : "Ativar todos os switchs"
                                                                }
                                                                control={
                                                                    <Switch
                                                                        checked={isSwitchOnAllController}
                                                                        onChange={handleSwitchChangeAllController}
                                                                        color='success'
                                                                    />
                                                                }
                                                                label={isSwitchOnAllController ? "Desativar" : "Ativar"}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </AccordionDetails>
                                        </Accordion>
                                    </Grid>
                                    {Object.values(filters).some(
                                        (value) => value !== undefined && value !== null && value.length > 0,
                                    ) && (
                                        <>
                                            <Grid
                                                container
                                                direction='row'
                                                gap={1}
                                                border={`1px dashed ${colorBorderSystem}`}
                                                padding={1}
                                                borderRadius={4}
                                                marginBottom={1.5}
                                                title='Filtros Aplicados'>
                                                <Grid item xs={12}>
                                                    <FilterApplied
                                                        filters={filters}
                                                        clearAllFilters={clearAllFilters}
                                                        removeFilter={removeFilter}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </>
                                    )}

                                    <DataGrid
                                        autoHeight
                                        columns={columns}
                                        rows={listPanelBusiness}
                                        density='compact'
                                        localeText={dataGridLocaleTextTranslateFull}
                                        loading={loading}
                                        disableRowSelectionOnClick
                                        columnVisibilityModel={columnVisibilityModel}
                                        onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
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
                ) : dataPanelBusiness === null ? (
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
                ) : (
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
                                height={285}
                                width={"100%"}
                                sx={{ borderRadius: "0px 0px 8px 8px" }}
                            />
                        </Grid>
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
                                    fontSize={20}
                                    mt={2}
                                    mb={2}>
                                    <CachedOutlinedIcon color='disabled' sx={{ mr: 0.5 }} />
                                    Carregando...
                                </Typography>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Grid>

            <TemporaryDrawer
                title='Filtro Listagem'
                closeButton={handleFilterPanelBusiness}
                onClose={handleFilterPanelBusiness}
                disableEscapeKeyDown={false}
                open={openDrawerFilter}
                sx={{
                    "& .MuiDrawer-paperAnchorRight": {
                        width: isMobile ? "100%" : "60%",
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
                    flexDirection='column'
                    sx={{ border: `1px dashed ${colorBorderSystem}`, borderRadius: 4 }}
                    gap={1}
                    mt={-1}>
                    <Grid container component={"form"} direction='row' spacing={2} onSubmit={handleSubmit(onSubmit)}>
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
                                label='Agências'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={arrayListAgencies}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_client_portfolio'
                                label='Carteira'
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
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_client_type'
                                label='Tipo'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={ArrayTypesDocumentClient}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_client_marital'
                                label='Estado Civil'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={[
                                    { id: "Solteiro(a)", label: "Solteiro(a)" },
                                    { id: "Casado(a)", label: "Casado(a)" },
                                    { id: "Viúvo(a)", label: "Viúvo(a)" },
                                    { id: "Separado(a)/desquitado(a)", label: "Separado(a)/desquitado(a)" },
                                    { id: "União estavel", label: "União Estável" },
                                    { id: "Não informado", label: "Não informado" },
                                    { id: "NULL", label: "Não se Aplica" },
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_client_gender'
                                label='Gênero'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={[
                                    { id: "M", label: "Masculino" },
                                    { id: "F", label: "Feminino" },
                                    { id: "N", label: "Não Informado" },
                                    { id: "NULL", label: "Não se Aplica" },
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_client_cc_sitconta'
                                label='Status da Conta Corrente'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={ArrayTypeStatusCurrentAccountClient}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_client_is_rural'
                                label='É Rural?'
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
                                name='filter_client_is_cooperated'
                                label='É Cooperado?'
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

                        <Grid item xs={12} md={4}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_client_is_employee'
                                label='É Funcionário?'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={[
                                    { id: false, label: "Não" },
                                    { id: true, label: "Sim" },
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

                        <Grid item xs={12} md={12} mt={0.5}>
                            <Divider>
                                <Chip label='💰 Dados Financeiro' size='medium' color='info' />
                            </Divider>
                        </Grid>

                        <Grid item xs={12} md={12} mt={-0.5}>
                            <FormSlider
                                range={true}
                                name='filter_financial_risk_crl'
                                labelTop='Risco CRL'
                                min={0}
                                max={21}
                                step={1}
                                defaultValue={[0, 21]}
                                valueLabelDisplay={isMobile ? "on" : "off"}
                                control={control}
                                errors={errors}
                                marks={isMobile ? false : marksRiskCRL}
                            />
                        </Grid>

                        <Grid item xs={12} md={12}>
                            <FormSlider
                                range={true}
                                name='filter_financial_iap'
                                labelTop='IAP'
                                min={0}
                                max={20}
                                step={1}
                                defaultValue={[0, 20]}
                                valueLabelDisplay={isMobile ? "on" : "off"}
                                control={control}
                                errors={errors}
                                marks={isMobile ? false : marksIAP}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormAutocompleteMultiple
                                fullWidth
                                name='filter_income_types'
                                label='Tipo de Renda'
                                variant='outlined'
                                size='medium'
                                disableCloseOnSelect
                                control={control}
                                errors={errors}
                                options={ArrayTypesIncomeTypes}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_has_ad'
                                label='Tem AD?'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={[
                                    { id: true, label: "Sim" },
                                    { id: false, label: "Não" },
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='Renda Mensal - Min'
                                placeholder='Digite um número'
                                name='filter_monthly_income_min'
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
                                label='Renda Mensal - Max'
                                placeholder='Digite um número'
                                name='filter_monthly_income_max'
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
                                label='Saldo Crédito - Min'
                                placeholder='Digite um número'
                                name='filter_credit_balance_min'
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
                                label='Saldo Crédito - Max'
                                placeholder='Digite um número'
                                name='filter_credit_balance_max'
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
                                label='Saldo Devedor SFN - Min'
                                placeholder='Digite um número'
                                name='filter_balance_deudor_sfn_min'
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
                                label='Saldo Devedor SFN - Max'
                                placeholder='Digite um número'
                                name='filter_balance_deudor_sfn_max'
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
                                label='Crédito dias atraso - Min'
                                placeholder='Digite um número'
                                name='filter_credit_days_late_min'
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
                                label='Crédito dias atraso - Max'
                                placeholder='Digite um número'
                                name='filter_credit_days_late_max'
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
                                label='Valor RDC - Min'
                                placeholder='Digite um número'
                                name='filter_value_rdc_min'
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
                                label='Valor RDC - Max'
                                placeholder='Digite um número'
                                name='filter_value_rdc_max'
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
                                label='Valor LCA - Min'
                                placeholder='Digite um número'
                                name='filter_value_lca_min'
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
                                label='Valor LCA - Max'
                                placeholder='Digite um número'
                                name='filter_value_lca_max'
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
                                label='Valor DAP - Min'
                                placeholder='Digite um número'
                                name='filter_value_dap_min'
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
                                label='Valor DAP - Max'
                                placeholder='Digite um número'
                                name='filter_value_dap_max'
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

                        <Grid item xs={12} md={12} marginBlock={2}>
                            <Divider>
                                <Chip label='📝 Anotações' size='medium' color='default' />
                            </Divider>
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
                                options={ArrayTypesYesOrNoWithEmoji}
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
                                options={ArrayTypesYesOrNoWithEmoji}
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
                                options={ArrayTypesYesOrNoWithEmoji}
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
                                options={ArrayTypesYesOrNoWithEmoji}
                            />
                        </Grid>

                        <Grid item xs={12} md={12} marginBlock={2}>
                            <Divider>
                                <Chip label='🛡️ Seguros' size='medium' color='default' />
                            </Divider>
                        </Grid>

                        <Grid item xs={12} md={2.4}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_insurance_life'
                                label='Seg. Vida'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNoWithEmoji}
                            />
                        </Grid>

                        <Grid item xs={12} md={2.4}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_insurance_automobile'
                                label='Seg. Automóvel'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNoWithEmoji}
                            />
                        </Grid>

                        <Grid item xs={12} md={2.4}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_insurance_residential'
                                label='Seg. Residencial'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNoWithEmoji}
                            />
                        </Grid>

                        <Grid item xs={12} md={2.4}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_insurance_business'
                                label='Seg. Empresarial'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNoWithEmoji}
                            />
                        </Grid>

                        <Grid item xs={12} md={2.4}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_insurance_multirisk'
                                label='Seg. Multirisco'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNoWithEmoji}
                            />
                        </Grid>

                        <Grid item xs={12} md={12} marginBlock={2}>
                            <Divider>
                                <Chip label='🤝 Consórcio' size='medium' color='default' />
                            </Divider>
                        </Grid>

                        <Grid item xs={12} md={2.4}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_consortium_motorcycle'
                                label='Cons. Moto'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNoWithEmoji}
                            />
                        </Grid>

                        <Grid item xs={12} md={2.4}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_consortium_automobile'
                                label='Cons. Automóvel'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNoWithEmoji}
                            />
                        </Grid>

                        <Grid item xs={12} md={2.4}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_consortium_property'
                                label='Cons. Imóveis'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNoWithEmoji}
                            />
                        </Grid>

                        <Grid item xs={12} md={2.4}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_consortium_equipment'
                                label='Cons. Equipamento'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNoWithEmoji}
                            />
                        </Grid>

                        <Grid item xs={12} md={2.4}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_consortium_trip'
                                label='Cons. Viagem'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesYesOrNoWithEmoji}
                            />
                        </Grid>

                        <Grid item xs={12} md={12} marginBlock={2}>
                            <Divider>
                                <Chip label='💳 Cartão' size='medium' color='default' />
                            </Divider>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_card_plastic'
                                label='Plástico'
                                variant='outlined'
                                size='medium'
                                control={control}
                                errors={errors}
                                options={ArrayTypesPlasticCards}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
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

                        <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='Valor Limite Cartão - Min'
                                placeholder='Digite um número'
                                name='filter_card_limit_value_min'
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
                                label='Valor Limite Cartão - Max'
                                placeholder='Digite um número'
                                name='filter_card_limit_value_max'
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

                        <Grid item xs={12} md={12} marginBlock={2}>
                            <Divider>
                                <Chip label='🧾 Cheque' size='medium' color='default' />
                            </Divider>
                        </Grid>

                        <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='Cheque Esp. Limite - Min'
                                placeholder='Digite um número'
                                name='check_special_limit_min'
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
                                label='Cheque Esp. Limite - Max'
                                placeholder='Digite um número'
                                name='check_special_limit_max'
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
                                label='Cheque Esp. Usado - Min'
                                placeholder='Digite um número'
                                name='check_special_used_min'
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
                                label='Cheque Esp. Usado - Max'
                                placeholder='Digite um número'
                                name='check_special_used_max'
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
                                label='Cheque Esp. Dia Uso - Min'
                                placeholder='Digite um número'
                                name='check_special_days_use_min'
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
                                label='Cheque Esp. Dia Uso - Max'
                                placeholder='Digite um número'
                                name='check_special_days_use_max'
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

                        <Grid item xs={6} md={6} mt={1}>
                            <LoadingButton
                                fullWidth
                                type='submit'
                                color='success'
                                loadingPosition='start'
                                size='large'
                                variant='outlined'
                                startIcon={<SearchOutlinedIcon />}
                                loading={loading}
                                sx={{ boxShadow: "none" }}>
                                Pesquisar
                            </LoadingButton>
                        </Grid>

                        <Grid item xs={6} md={6} mt={1}>
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
                                    resetField("filter_client_agencies");
                                    resetField("filter_client_portfolio");
                                    resetField("filter_client_profile");
                                    resetField("filter_client_type");
                                    resetField("filter_client_marital");
                                    resetField("filter_client_gender");
                                    resetField("filter_client_is_rural");
                                    resetField("filter_client_is_cooperated");
                                    resetField("filter_client_is_employee");
                                    resetField("filter_client_agencies");
                                    resetField("filter_client_document");
                                    setValue("filter_financial_risk_crl", [0, 21]);
                                    setValue("filter_financial_iap", [0, 20]);
                                    resetField("filter_monthly_income_min");
                                    resetField("filter_monthly_income_max");
                                    resetField("filter_credit_balance_min");
                                    resetField("filter_credit_balance_max");
                                    resetField("filter_balance_deudor_sfn_min");
                                    resetField("filter_balance_deudor_sfn_max");
                                    resetField("filter_credit_days_late_min");
                                    resetField("filter_credit_days_late_max");
                                    resetField("filter_value_rdc_min");
                                    resetField("filter_value_rdc_max");
                                    resetField("filter_value_lca_min");
                                    resetField("filter_value_lca_max");
                                    resetField("filter_value_dap_min");
                                    resetField("filter_value_dap_max");
                                    resetField("filter_has_ad");
                                    resetField("filter_income_types");
                                    resetField("filter_annotation_current_relation");
                                    resetField("filter_annotation_current_absolute");
                                    resetField("filter_annotation_downloaded_relation");
                                    resetField("filter_annotation_downloaded_absolute");
                                    resetField("filter_insurance_life");
                                    resetField("filter_insurance_automobile");
                                    resetField("filter_insurance_residential");
                                    resetField("filter_insurance_business");
                                    resetField("filter_insurance_multirisk");
                                    resetField("filter_consortium_motorcycle");
                                    resetField("filter_consortium_automobile");
                                    resetField("filter_consortium_property");
                                    resetField("filter_consortium_equipment");
                                    resetField("filter_consortium_trip");
                                    resetField("filter_card_plastic");
                                    resetField("filter_card_status");
                                    resetField("filter_card_limit_value_min");
                                    resetField("filter_card_limit_value_max");
                                }}>
                                Resetar Filtros
                            </LoadingButton>
                        </Grid>
                    </Grid>
                </Box>
            </TemporaryDrawer>

            <Modal open={openModalDetail} onClose={handleModalDetail} disableEscapeKeyDown={false}>
                <Box>
                    <BoxModal
                        title={(dataDetailBusinessPanel && dataDetailBusinessPanel?.cliente_nome) || ""}
                        handleClose={handleModalDetail}
                        width={isMobile ? "30%" : "85%"}
                        maxHeight='95%'>
                        <Box
                            sx={{
                                maxHeight: "80vh",
                                overflow: "auto",
                                mt: -4,
                            }}>
                            {dataDetailBusinessPanel && (
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
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                {!isMobile ? " ID Cooperado: " : "ID"}
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
                                                                                    dataDetailBusinessPanel.cliente_id,
                                                                                );
                                                                            }}
                                                                            color='success'
                                                                            aria-label='Visualizar Cooperado'>
                                                                            <AccountCircleOutlinedIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    {dataDetailBusinessPanel.cliente_id}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                Nome:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.cliente_nome}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                Nome Fantasia:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.cliente_fantasia || "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                Documento:
                                                            </TableCell>
                                                            <TableCell>
                                                                {formatCnpjCpf(
                                                                    dataDetailBusinessPanel.cliente_documento,
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                Melhor Contato:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.melhor_contato ? (
                                                                    <Box
                                                                        display='flex'
                                                                        alignItems='center'
                                                                        gap={0.5}
                                                                        ml={-1}>
                                                                        <WhatsAppButton
                                                                            phoneNumber={
                                                                                dataDetailBusinessPanel.melhor_contato
                                                                            }
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
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                PA:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.agencia_nome}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                Carteira:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.carteira_nome}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                É Rural:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.e_rural ? "🌱 Sim" : "Não"}
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
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                ℹ️ Tipo:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.cliente_tipo}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                ℹ️ Gênero:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.cliente_sexo || "-"}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                ℹ️ Estado Civil:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.cliente_estado_civil || "-"}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                ℹ️ É Cooperado?:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.e_cooperado
                                                                    ? "💚 Sim"
                                                                    : "🟠 Não"}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                ℹ️ É Funcionário?:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.e_funcionario ? "Sim" : "Não"}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                            ℹ️ Data Nascimento:
                                                        </TableCell>
                                                        <TableCell>
                                                            {dataDetailBusinessPanel.cliente_nascimento
                                                                ? formatDate(
                                                                      dataDetailBusinessPanel.cliente_nascimento,
                                                                      "DD/MM/YYYY",
                                                                  )
                                                                : "-"}
                                                        </TableCell>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                ℹ️ Início Relacionamento:
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.cliente_relacionamento
                                                                    ? formatDate(
                                                                          dataDetailBusinessPanel.cliente_relacionamento,
                                                                          "DD/MM/YYYY",
                                                                      )
                                                                    : "-"}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                ℹ️ Status Conta Corrente:
                                                            </TableCell>
                                                            <TableCell>
                                                                {mapValueCurrentAccount(
                                                                    dataDetailBusinessPanel.cc_sitconta,
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>
                                    </Grid>

                                    <Grid container mt={1.5} paddingInline={!isMobile ? 2 : 0} spacing={2}>
                                        <Grid item xs={12} md={3}>
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
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                🛡️ Seguro Vida
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.seg_vida !== null &&
                                                                dataDetailBusinessPanel.seg_vida !== undefined
                                                                    ? `✅ | ${dataDetailBusinessPanel.seg_vida}`
                                                                    : `❌ | 0`}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                🛡️ Seguro Automóvel
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.seg_automovel !== null &&
                                                                dataDetailBusinessPanel.seg_automovel !== undefined
                                                                    ? `✅ | ${dataDetailBusinessPanel.seg_automovel}`
                                                                    : `❌ | 0`}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                🛡️ Seguro Residencial
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.seg_residencial !== null &&
                                                                dataDetailBusinessPanel.seg_residencial !== undefined
                                                                    ? `✅ | ${dataDetailBusinessPanel.seg_residencial}`
                                                                    : `❌ | 0`}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                🛡️ Seguro Empresarial
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.seg_empresarial !== null &&
                                                                dataDetailBusinessPanel.seg_empresarial !== undefined
                                                                    ? `✅ | ${dataDetailBusinessPanel.seg_empresarial}`
                                                                    : `❌ | 0`}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                🛡️ Seguro Multirisco
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.seg_multirisco !== null &&
                                                                dataDetailBusinessPanel.seg_multirisco !== undefined
                                                                    ? `✅ | ${dataDetailBusinessPanel.seg_multirisco}`
                                                                    : `❌ | 0`}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>

                                        <Grid item xs={12} md={3}>
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
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                🤝 Consórcio Moto
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.cons_moto !== null &&
                                                                dataDetailBusinessPanel.cons_moto !== undefined
                                                                    ? `✅ | ${dataDetailBusinessPanel.cons_moto}`
                                                                    : `❌ | 0`}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                🤝 Consórcio Automóvel
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.cons_automovel !== null &&
                                                                dataDetailBusinessPanel.cons_automovel !== undefined
                                                                    ? `✅ | ${dataDetailBusinessPanel.cons_automovel}`
                                                                    : `❌ | 0`}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                🤝 Consórcio Imóveis
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.cons_imoveis !== null &&
                                                                dataDetailBusinessPanel.cons_imoveis !== undefined
                                                                    ? `✅ | ${dataDetailBusinessPanel.cons_imoveis}`
                                                                    : `❌ | 0`}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                🤝 Consórcio Equipamento
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.cons_equipamento !== null &&
                                                                dataDetailBusinessPanel.cons_equipamento !== undefined
                                                                    ? `✅ | ${dataDetailBusinessPanel.cons_equipamento}`
                                                                    : `❌ | 0`}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                🤝 Consórcio Viagem
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.cons_viagem !== null &&
                                                                dataDetailBusinessPanel.cons_viagem !== undefined
                                                                    ? `✅ | ${dataDetailBusinessPanel.cons_viagem}`
                                                                    : `❌ | 0`}
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
                                                            textAlign: "center",
                                                        },
                                                        "& .MuiTableRow-root:last-child .MuiTableCell-root": {
                                                            borderBottom: "none",
                                                        },
                                                    }}
                                                    size='small'>
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                {!isMobile ? "💳 Cartão Plástico" : "💳 Plástico"}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                {!isMobile ? "💳 Cartão Situação" : "💳 Situação"}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                {!isMobile
                                                                    ? "💳 Cartão Valor Limite"
                                                                    : "💳 Valor Limite"}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.plastico || "-"}
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.sitcartao || "-"}
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.valor_limite !== null &&
                                                                dataDetailBusinessPanel.valor_limite !== undefined
                                                                    ? formatToBRLCurrency(
                                                                          dataDetailBusinessPanel.valor_limite,
                                                                      )
                                                                    : "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>

                                            <TableContainer
                                                sx={{
                                                    mt: 2,
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
                                                            textAlign: "center",
                                                        },
                                                        "& .MuiTableRow-root:last-child .MuiTableCell-root": {
                                                            borderBottom: "none",
                                                        },
                                                    }}
                                                    size='small'>
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                {!isMobile ? "🧾 Cheque Especial Limite" : "🧾 Limite"}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                {!isMobile ? "🧾 Cheque Especial Usado" : "🧾 Usado"}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                {!isMobile
                                                                    ? "🧾 Cheque Especial Dia Uso"
                                                                    : "🧾 Dia Uso"}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.chesp_limite !== null &&
                                                                dataDetailBusinessPanel.chesp_limite !== undefined
                                                                    ? formatToBRLCurrency(
                                                                          dataDetailBusinessPanel.chesp_limite,
                                                                      )
                                                                    : "-"}
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.chesp_usado !== null &&
                                                                dataDetailBusinessPanel.chesp_usado !== undefined
                                                                    ? formatToBRLCurrency(
                                                                          dataDetailBusinessPanel.chesp_usado,
                                                                      )
                                                                    : "-"}
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.chesp_diasuso || "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>
                                    </Grid>

                                    <Grid container mt={1.5} paddingInline={!isMobile ? 2 : 0} spacing={2}>
                                        <Grid item xs={12} md={12}>
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
                                                            textAlign: "center",
                                                        },
                                                        "& .MuiTableRow-root:last-child .MuiTableCell-root": {
                                                            borderBottom: "none",
                                                        },
                                                    }}
                                                    size='small'>
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                {!isMobile
                                                                    ? "📝 Anotação Baixada ABS"
                                                                    : "📝 Baixada ABS"}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                {!isMobile
                                                                    ? "📝 Anotação Baixada REL"
                                                                    : "📝 Baixada REL"}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                {!isMobile
                                                                    ? "📝 Anotação Vigente ABS"
                                                                    : "📝 Vigente ABS"}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                {!isMobile
                                                                    ? "📝 Anotação Vigente REL"
                                                                    : "📝 Vigente REL"}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.anot_baixadas_abs
                                                                    ? "✅"
                                                                    : "❌"}
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.anot_baixadas_rel
                                                                    ? "✅"
                                                                    : "❌"}
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.anot_vigentes_abs
                                                                    ? "✅"
                                                                    : "❌"}
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.anot_vigentes_rel
                                                                    ? "✅"
                                                                    : "❌"}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>
                                    </Grid>

                                    <Grid container mt={1.5} paddingInline={!isMobile ? 2 : 0} spacing={2}>
                                        <Grid item xs={12} md={4}>
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
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                💰 Risco CRL
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.risco_crl
                                                                    ? `R${dataDetailBusinessPanel.risco_crl}`
                                                                    : "R?"}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                💰 Tipo da Renda
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.renda_tipo || "-"}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                💰 Renda Mensal
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.renda_mensal !== null &&
                                                                dataDetailBusinessPanel.renda_mensal !== undefined
                                                                    ? formatToBRLCurrency(
                                                                          dataDetailBusinessPanel.renda_mensal,
                                                                      )
                                                                    : "-"}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                💰 IAP
                                                            </TableCell>
                                                            <TableCell>{dataDetailBusinessPanel.iap || 0}</TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>

                                        <Grid item xs={12} md={4}>
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
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                💰 Tem AD
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.tem_ad ? "Sim" : "Não"}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                💰 Saldo Devedor SFN
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.saldo_devedor_sfn !== null &&
                                                                dataDetailBusinessPanel.saldo_devedor_sfn !== undefined
                                                                    ? formatToBRLCurrency(
                                                                          dataDetailBusinessPanel.saldo_devedor_sfn,
                                                                      )
                                                                    : "-"}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                💰 Crédito Saldo
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.credito_saldo !== null &&
                                                                dataDetailBusinessPanel.credito_saldo !== undefined
                                                                    ? formatToBRLCurrency(
                                                                          dataDetailBusinessPanel.credito_saldo,
                                                                      )
                                                                    : "-"}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                💰 Crédito dias atraso
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.credito_maxdiasatraso || "-"}
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
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                💰 Valor LCA
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.valor_lca !== null &&
                                                                dataDetailBusinessPanel.valor_lca !== undefined
                                                                    ? formatToBRLCurrency(
                                                                          dataDetailBusinessPanel.valor_lca,
                                                                      )
                                                                    : "-"}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                💰 Valor RDC
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.valor_rdc !== null &&
                                                                dataDetailBusinessPanel.valor_rdc !== undefined
                                                                    ? formatToBRLCurrency(
                                                                          dataDetailBusinessPanel.valor_rdc,
                                                                      )
                                                                    : "-"}
                                                            </TableCell>
                                                        </TableRow>

                                                        <TableRow>
                                                            <TableCell
                                                                sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                                💰 Valor DAP
                                                            </TableCell>
                                                            <TableCell>
                                                                {dataDetailBusinessPanel.valor_dap !== null &&
                                                                dataDetailBusinessPanel.valor_dap !== undefined
                                                                    ? formatToBRLCurrency(
                                                                          dataDetailBusinessPanel.valor_dap,
                                                                      )
                                                                    : "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>
                                    </Grid>

                                    <Grid item mb={2} ml={2.5} mt={2}>
                                        <Typography fontWeight={"100"} fontSize={12} justifyContent='end'>
                                            <Typography component={"span"} color='primary' fontSize={14}>
                                                Data Atualização:{" "}
                                            </Typography>
                                            {dataDetailBusinessPanel.data_movimento
                                                ? formatDate(dataDetailBusinessPanel.data_movimento, "DD/MM/YYYY")
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
                            handleFilterPanelBusiness();
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
