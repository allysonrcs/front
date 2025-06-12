import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton } from "@mui/lab";
import {
    Badge,
    Box,
    Breadcrumbs,
    Chip,
    Grid,
    IconButton,
    Modal,
    Stack,
    SxProps,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    DataGrid,
    GridColDef,
    GridToolbarColumnsButton,
    GridToolbarDensitySelector,
    GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { useConfirm } from "material-ui-confirm";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import EditIcon from "@mui/icons-material/Edit";
import AddchartIcon from "@mui/icons-material/Addchart";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import CloudSyncOutlinedIcon from "@mui/icons-material/CloudSyncOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { BoxMain } from "@/components/Box/BoxMain";
import { toast } from "react-toastify";
import { useGlobal } from "@/contexts/GlobalContext";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { EditProductivityDailyProps, ProductivityDailyFields } from "./ProductivityDailyFields";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { formatDate } from "@/functions/date";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { searchAutoCompleteProducts, searchAutoCompleteProductsModalities } from "@/services/products";
import { ArrayTypeStatusProductivityDaily } from "@/constants/array-type-status-productivity-daily";
import {
    changeIsActiveProductivityDaily,
    getDashboardProductivityDailyTotalizer,
    IDashboardProductivityDailyTotalizer,
    ISearchListProductivityDaily,
    searchListProductivityDaily,
    synchronizeProductivityDaily,
} from "@/services/productivities-control";
import { searchAutocompleteAgencies } from "@/services/agencies";
import { searchAutoCompletePortfolios } from "@/services/portfolios";
import {
    formatCnpjCpf,
    formatNumberWithThousandsSeparator,
    formatToBRLCurrency,
    isValidCNPJ,
    isValidCPF,
} from "@/functions/number";
import FormDatePicker from "@/components/FormComponents/FormDatePicker";
import FormInputCpfCnpj from "@/components/FormComponents/FormInputCpfCnpj";
import moment from "moment";
import { searchAutoCompleteEmployees } from "@/services/employees";
import { useAuth } from "@/contexts/AuthContext";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";
import BasicMenu from "@/components/BasicMenu/BasicMenu";
import { searchAllAccessPermissionGroup } from "@/services/access-groups";
import { InteractionsProductivityDaily } from "./modal-interactions/InteractionsProductivityDaily";
import { TransferProductivityDaily } from "./modal-interactions/TransferProductivityDaily";
import { AuditProductivityDaily } from "./modal-interactions/AuditProductivityDaily";
import { TimelineHistoryProductivityDaily } from "./modal-interactions/TimelineHistoryProductivityDaily";
import { ValidationProductivityDaily } from "./modal-interactions/ValidationProductivityDaily";
import { Chart } from "@/components/Charts/ECharts/chart";
import { CSATAverageRating } from "@/components/CSATAssessments/CSATAverageRating";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";
import FormAutocompleteMultiple from "@/components/FormComponents/FormAutocompleteMultiple";

export const statusProductivityDailyMap: { [key: string]: string } = {
    APROVADO: "🟢 Aprovado",
    REPROVADO: "🔴 Reprovado",
    PENDENTE: "🟡 Pendente",
    CORREÇÃO: "🔵 Correção",
    RASCUNHO: "🟣 Rascunho",
    CANCELADO: "⚫ Cancelado",
};

export const statusWithoutLabelMap: { [key: string]: string } = {
    APROVADO: "🟢",
    REPROVADO: "🔴",
    PENDENTE: "🟡",
    CORREÇÃO: "🔵",
    RASCUNHO: "🟣",
    CANCELADO: "⚫",
};

export const productMap: { [key: string]: string } = {
    Consórcio: "🤝 Consórcio",
    "Seguros de Vida": "❤️ Seguros de Vida",
    SIPAG: "✳️ SIPAG",
    "Seguros Gerais": "🛡️ Seguros Gerais",
    Previdência: "🏅 Previdência",
};

export const productIconMap: { [key: string]: string } = {
    Consórcio: "🤝",
    "Seguros de Vida": "❤️",
    SIPAG: "✳️",
    "Seguros Gerais": "🛡️",
    Previdência: "🏅",
};

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

type AutoCompleteModalitiesProdutc = {
    id: number;
    label: string;
    product_name: string;
};

type ListAgencies = {
    id: number;
    label: string;
    agency_sisbr_id: number;
};

type ListPortfolios = {
    id: number;
    label: string;
    id_ref?: number | null;
    id_agency_sisbr?: number | null;
};

type PermissionProps = {
    group: string;
};

type RowsProps = {
    id: number;
    is_active: boolean;
};

export type ProductivityDailyProps = {
    status?: AutoCompleteString[];
    is_client?: AutoCompleteBoolean;
    products?: AutoCompleteNumber[];
    modalities_product?: AutoCompleteModalitiesProdutc[];
    date_search?: AutoCompleteString;
    date_start?: Date | null;
    date_end?: Date | null;
    collaborators?: AutoCompleteNumber[];
    agencies?: ListAgencies[];
    portfolios?: ListPortfolios[];
    client_document?: string | null;
    mob_validation_is_counted?: AutoCompleteBoolean;
};

interface Filters {
    status?: string[];
    is_client?: string;
    products?: string[];
    modalities_product?: string[];
    date_search?: string;
    date_start?: string;
    collaborators?: string[];
    agencies?: string[];
    portfolios?: string[];
    client_document?: string;
    mob_validation_is_counted?: string;
}

interface FilterAppliedProps {
    filters: Filters;
    clearAllFilters: () => void;
    removeFilter: (key: keyof Filters) => void;
}

type AgencyMap = { [key: number]: string | undefined };

const arrayTypeDateSearch = [
    { id: "created_at", label: "Data Inclusão" },
    { id: "mob_validation_date", label: "Data Validação" },
    { id: "date_audit", label: "Data Auditoria" },
    { id: "updated_at", label: "Data Atualização" },
];

export function ListRecordsProductivityDaily() {
    const [loading, setLoading] = useState(false);
    const [listProductivityDaily, setListProductivityDaily] = useState<ISearchListProductivityDaily[]>([]);
    const [dashboard, setDashboard] = useState<IDashboardProductivityDailyTotalizer>();
    const [autoCompleteProducts, setAutoCompleteProducts] = useState<AutoCompleteNumber[]>([]);
    const [autoCompleteModalitiesProduct, setAutoCompleteModalitiesProduct] = useState<AutoCompleteModalitiesProdutc[]>(
        [],
    );
    const [autoCompletePortfolios, setAutoCompletePortfolios] = useState<ListPortfolios[]>([]);
    const [autoCompleteEmployees, setAutoCompleteEmployees] = useState<AutoCompleteNumber[]>([]);
    const [autoCompleteAgencies, setAutoCompleteAgencies] = useState<ListAgencies[]>([]);
    const [idProductivityDaily, setIDProductivityDaily] = useState<number>();
    const [permissionProductivityDaily, setPermissionProductivityDaily] = useState<boolean>(false);
    const [openDrawerEdit, setOpenDrawerEdit] = useState(false);
    const [openDrawerFilter, setOpenDrawerFilter] = useState(false);
    const [openModalInteraction, setOpenModalInteraction] = useState(false);
    const [openModalTransferProductivity, setOpenModalTransferProductivity] = useState(false);
    const [openModalAuditProductivity, setOpenModalAuditProductivity] = useState(false);
    const [openModalHistoryProductivity, setOpenModalHistoryProductivity] = useState(false);
    const [openModalValidationProductivity, setOpenModalValidationProductivity] = useState(false);
    const [accessPermission, setAccessPermission] = useState<PermissionProps[]>([]);
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);

    const {
        getInfoError,
        toggleStatusBackdrop,
        theme,
        colorBorderSystem,
        colorBackgroundSystem,
        colorScrollSystem,
        redBlur,
        cyanBlur,
    } = useGlobal();
    const navigate = useNavigate();
    const confirm = useConfirm();

    const { device } = useMediaQuery();
    const { user } = useAuth();

    const isThemeLight = theme === "light";
    const isMobile = device === "Mobile";

    const validationSchema = Yup.object().shape(
        {
            status: Yup.array()
                .of(
                    Yup.object().shape({
                        id: Yup.string().nullable(),
                        label: Yup.string().nullable(),
                    }),
                )
                .nullable(),
            is_client: Yup.object()
                .shape({
                    id: Yup.boolean().nullable(),
                    label: Yup.string().nullable(),
                })
                .nullable(),
            products: Yup.array()
                .of(
                    Yup.object().shape({
                        id: Yup.number().nullable(),
                        label: Yup.string().nullable(),
                    }),
                )
                .nullable(),
            modalities_product: Yup.array()
                .of(
                    Yup.object().shape({
                        id: Yup.number().nullable(),
                        label: Yup.string().nullable(),
                        product_name: Yup.string().nullable(),
                    }),
                )
                .nullable(),
            date_search: Yup.object()
                .shape({
                    id: Yup.string().nullable(),
                    label: Yup.string().nullable(),
                })
                .nullable(),
            date_start: Yup.date()
                .nullable()
                .typeError("Digite uma data válida")
                .when(["date_end"], ([date_start], schema) =>
                    moment(date_start).isValid() ? schema.required("Obrigatório") : schema,
                ),
            date_end: Yup.date()
                .nullable()
                .when("date_start", ([date_start], schema) =>
                    moment(date_start).isValid()
                        ? schema.min(date_start, "Data Final deve ser maior que Data Inicial.")
                        : schema,
                )
                .typeError("Digite uma data válida")
                .when(["date_start"], ([date_start], schema) =>
                    moment(date_start).isValid() ? schema.required("Obrigatório") : schema,
                ),
            collaborators: Yup.array()
                .of(
                    Yup.object().shape({
                        id: Yup.number().nullable(),
                        label: Yup.string().nullable(),
                    }),
                )
                .nullable(),
            agencies: Yup.array()
                .of(
                    Yup.object().shape({
                        id: Yup.number().required("ID é Obrigatório"),
                        label: Yup.string().required("Nome da PA é obrigatório"),
                        agency_sisbr_id: Yup.number().required("ID Ref da Agencia é Obrigatório"),
                    }),
                )
                .nullable(),
            portfolios: Yup.array()
                .of(
                    Yup.object().shape({
                        id: Yup.number().required("ID é Obrigatório"),
                        label: Yup.string().required("Nome da Carteira é obrigatório"),
                        id_ref: Yup.number().nullable(),
                        id_agency_sisbr: Yup.number().nullable(),
                    }),
                )
                .nullable(),
            client_document: Yup.string().max(18, "Máximo 18 caracteres").trim().nullable(),
            mob_validation_is_counted: Yup.object()
                .shape({
                    id: Yup.boolean().nullable(),
                    label: Yup.string().nullable(),
                })
                .nullable(),
        },
        [["date_start", "date_end"]],
    );

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<ProductivityDailyProps | any>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            status: [{ id: "PENDENTE", label: "🟡 Pendente" }],
            date_search: { id: "created_at", label: "Data Inclusão" },
            date_start: null,
            date_end: null,
            client_document: null,
        },
    });

    const productCounts = useMemo(() => {
        return listProductivityDaily.reduce(
            (acc, row) => {
                const productName = row.product_name;
                if (productIconMap[productName]) {
                    acc[productName] = (acc[productName] || 0) + 1;
                }
                return acc;
            },
            {} as { [key: string]: number },
        );
    }, [listProductivityDaily]);

    const productElements = useMemo(() => {
        return Object.entries(productIconMap).map(([productName, icon]) => {
            const count = productCounts[productName] || 0;
            return (
                <Typography key={productName} sx={{ fontSize: "14px" }}>
                    {`${icon} ${formatNumberWithThousandsSeparator(count)}`}
                </Typography>
            );
        });
    }, [productCounts]);

    const totalPrice = useMemo(() => {
        return listProductivityDaily.reduce((acc, item) => acc + (item.price || 0), 0);
    }, [listProductivityDaily]);

    const totalAmount = useMemo(() => {
        return listProductivityDaily.reduce((acc, item) => acc + (item.amount || 0), 0);
    }, [listProductivityDaily]);

    const QuickSearchToolbar = () => {
        return (
            <Grid
                container
                sx={{ p: 1, display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <Grid
                    item
                    sx={{
                        p: 1,
                        display: device === "Mobile" ? "none" : "flex",
                        justifyContent: "start",
                        alignItems: "center",
                    }}>
                    <GridToolbarColumnsButton />
                    <GridToolbarFilterButton />
                    <GridToolbarDensitySelector />
                    {accessPermission.some(
                        (value) =>
                            value.group === "GROUP_AUDITOR_PRODUCTIVITY_CONTROL" || value.group === "GROUP_ADMIN",
                    ) && <GridToolbarExport />}

                    <Tooltip title='Contagem de produtos com base no filtro atual'>
                        <Grid
                            item
                            xs={12}
                            sm='auto'
                            sx={{
                                display: device === "Mobile" ? "none" : "flex",
                                flexWrap: "wrap",
                                justifyContent: "left",
                                ml: 0.5,
                                gap: 1,
                                border: `1px dashed ${colorBorderSystem}`,
                                borderRadius: "16px",
                                padding: "0.40rem 0.90rem 0.40rem 0.65rem",
                                cursor: "default",
                            }}>
                            {productElements}
                        </Grid>
                    </Tooltip>

                    <Tooltip title='Totais de Valor e Quantidade das linhas exibidas'>
                        <Grid
                            item
                            xs={12}
                            sm='auto'
                            sx={{
                                display: device === "Mobile" ? "none" : "flex",
                                flexWrap: "wrap",
                                justifyContent: "left",
                                ml: 0.5,
                                gap: 1,
                                border: `1px dashed ${colorBorderSystem}`,
                                borderRadius: "16px",
                                padding: "0.40rem 0.90rem 0.40rem 0.65rem",
                                cursor: "default",
                            }}>
                            <Typography sx={{ fontSize: "14px" }}>
                                💰 Valor Total: {formatToBRLCurrency(totalPrice)}
                            </Typography>
                            <Typography sx={{ fontSize: "14px" }}>
                                📦 Quantidade Total: {formatNumberWithThousandsSeparator(totalAmount)}
                            </Typography>
                        </Grid>
                    </Tooltip>
                </Grid>

                <Box sx={{ p: 1, display: "flex", justifyContent: "end" }}>
                    <GridToolbarQuickFilter placeholder='Digite para pesquisar' />
                </Box>
            </Grid>
        );
    };

    const filters = {
        status: Array.isArray(watch("status")) ? watch("status").map((item: { label: string }) => item.label) : [],
        is_client: watch("is_client")?.label,
        products: Array.isArray(watch("products"))
            ? watch("products").map((item: { label: string }) => item.label)
            : [],
        modalities_product: Array.isArray(watch("modalities_product"))
            ? watch("modalities_product").map((item: { label: string }) => item.label)
            : [],
        date_search: watch("date_search")?.label,
        date_start: watch("date_start") ? moment(watch("date_start")).format("DD/MM/YYYY") : undefined,
        date_end: watch("date_end") ? moment(watch("date_end")).format("DD/MM/YYYY") : undefined,
        collaborators: Array.isArray(watch("collaborators"))
            ? watch("collaborators").map((item: { label: string }) => item.label)
            : [],
        agencies: Array.isArray(watch("agencies"))
            ? watch("agencies").map((item: { label: string }) => item.label)
            : [],
        portfolios: Array.isArray(watch("portfolios"))
            ? watch("portfolios").map((item: { label: string }) => item.label)
            : [],
        client_document: watch("client_document"),
        mob_validation_is_counted: watch("mob_validation_is_counted")?.label,
    };

    const labelsMap = {
        status: "Status",
        collaborators: "Criado por",
        is_client: "É Cooperado",
        products: "Produto",
        modalities_product: "Modalidades",
        date_search: "Buscar por",
        date_start: "Data Inicial",
        date_end: "Data Final",
        agencies: "Agências",
        portfolios: "Carteiras",
        client_document: "Documento",
        mob_validation_is_counted: "Situação Validação",
    };

    const clearAllFilters = () => {
        reset({
            status: [],
            is_client: null,
            products: [],
            modalities_product: [],
            date_search: null,
            date_start: null,
            date_end: null,
            collaborators: [],
            agencies: [],
            portfolios: [],
            client_document: null,
            mob_validation_is_counted: null,
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
                            title='Filtros'
                            size='small'
                            type='submit'
                            disabled={loading}
                            sx={{ border: `1px solid ${colorBorderSystem}` }}
                            onClick={handleFilterProductivityDaily}>
                            <FilterAltOutlinedIcon color={loading ? "disabled" : "primary"} />
                        </IconButton>
                    </Stack>
                )}
            </Stack>
        );
    };

    const handleRefresh = handleSubmit((params) => {
        onSubmit(params);
    });

    function handleNewRegister() {
        navigate("/controle-produtividades/produtividade-diaria/cadastrar");
    }

    const handleEditProductivityDaily = () => {
        setOpenDrawerEdit((oldValue) => !oldValue);
    };

    const handleFilterProductivityDaily = () => {
        setOpenDrawerFilter((oldValue) => !oldValue);
        setSpeedDialOpen(true);
    };

    const handleModalInteractionProductivityDaily = () => {
        setOpenModalInteraction((oldValue) => !oldValue);
    };

    const handleModalTransferProductivityDaily = () => {
        setOpenModalTransferProductivity((oldValue) => !oldValue);
    };

    const handleModalAuditProductivityDaily = () => {
        setOpenModalAuditProductivity((oldValue) => !oldValue);
    };

    const handleHistoryProductivityDaily = () => {
        setOpenModalHistoryProductivity((oldValue) => !oldValue);
    };

    const handleModalValidationProductivityDaily = () => {
        setOpenModalValidationProductivity((oldValue) => !oldValue);
    };

    const handlePermissionAuditProductivityDaily = (valueBooleanPermission: boolean) => {
        setPermissionProductivityDaily(valueBooleanPermission);
    };

    const safePercentage = (value: number, total: number): number => {
        if (total === 0) return 0;
        const result = (value / total) * 100;
        return isNaN(result) || !isFinite(result) ? 0 : result;
    };

    const getChartColor = (type: "aprovados" | "reprovados" | "correcoes" | "pendentes" | "rascunho" | "total") => {
        switch (type) {
            case "aprovados":
                return "#21D87D";
            case "reprovados":
                return "#F94C4A";
            case "correcoes":
                return "#2186C3";
            case "pendentes":
                return "#fcdb58";
            case "rascunho":
                return "#BBA3DC";
            default:
                return "#292929";
        }
    };

    const generateChartOptions = (
        achievementPercentage: number,
        type: "aprovados" | "reprovados" | "correcoes" | "pendentes" | "rascunho" | "total",
    ) => ({
        tooltip: {
            trigger: "item",
            formatter: (params: any) => {
                const val = parseFloat(params.value).toFixed(2);
                return `${params.marker} ${params.name} ${val}%`;
            },
            textStyle: {
                color: isThemeLight ? "#011216" : "#ffffff",
            },
            backgroundColor: isThemeLight ? "#ffffff" : "#00161b",
            position: (point: number[]): [number, number] => {
                const x = point[0] + 20;
                const y = point[1];
                return [x, y];
            },
        },
        title: {
            text: `${achievementPercentage.toFixed(2)}%`,
            left: "center",
            top: "center",
            textStyle: {
                fontSize: 11,
                fontWeight: "bold",
            },
        },
        series: [
            {
                type: "pie",
                radius: ["100%", "80%"],
                avoidLabelOverlap: false,
                label: { show: false },
                emphasis: { label: { show: false } },
                data: [
                    {
                        value: achievementPercentage,
                        name: "Progresso",
                        itemStyle: { color: getChartColor(type), borderRadius: 2 },
                    },
                    {
                        value: 100 - Math.min(achievementPercentage, 100),
                        name: "Faltante",
                        itemStyle: { color: colorBorderSystem },
                    },
                ],
            },
        ],
    });

    const handleChangeIsActive = (row: RowsProps) => {
        confirm({
            title: `Deseja realmente ${!row.is_active ? "Ativar" : "Inativar"} o registro?`,
            description: (
                <>
                    <Typography fontSize={16}>O registro de Produtividade sofrerá alteração em sua situação</Typography>

                    {!row.is_active ? null : (
                        <Typography mt={1} fontSize={16}>
                            O status da produtividade será alterado para: ⚫ Cancelado
                        </Typography>
                    )}
                </>
            ),
        })
            .then(async () => {
                try {
                    setLoading(true);

                    const resultChangeIsActive = await changeIsActiveProductivityDaily(row.id, {
                        is_active: !row.is_active,
                    });

                    setListProductivityDaily((prev) =>
                        prev.map((value) => {
                            if (value.id === row.id) {
                                return {
                                    ...value,
                                    status: resultChangeIsActive.status,
                                    is_active: !row.is_active,
                                    updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                                };
                            }
                            return value;
                        }),
                    );

                    if (
                        row.is_active &&
                        !accessPermission.some(
                            (value) =>
                                value.group === "GROUP_AUDITOR_PRODUCTIVITY_CONTROL" || value.group === "GROUP_ADMIN",
                        )
                    ) {
                        setListProductivityDaily((prev) =>
                            prev.filter((productivityDaily) => productivityDaily.id !== row.id),
                        );
                    }

                    searchDashboardProductivityDailyTotalizer();

                    toast.success("Situação alterada com sucesso!");
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                } finally {
                    setLoading(false);
                }
            })
            .catch(() => {});
    };

    const handleUpdateRegisterClient = (row: RowsProps) => {
        confirm({
            title: `Deseja realmente atualizar o registro?`,
            description: (
                <Typography fontSize={16}>O registro de Produtividade sofrerá alteração em seus dados</Typography>
            ),
        })
            .then(async () => {
                try {
                    setLoading(true);

                    const resultUpdateRegisterClient = await synchronizeProductivityDaily(row.id);

                    if (!resultUpdateRegisterClient.is_updated) {
                        setListProductivityDaily((prev) =>
                            prev.map((value) => {
                                if (value.id === row.id) {
                                    return {
                                        ...value,
                                        is_client: resultUpdateRegisterClient.is_client,
                                        is_client_rural: resultUpdateRegisterClient.is_client_rural,
                                        client_date_movement: moment(
                                            resultUpdateRegisterClient.client_date_movement,
                                        ).format("YYYY-MM-DD"),
                                        client_sisbr_id: resultUpdateRegisterClient.client_sisbr_id,
                                        client_name: resultUpdateRegisterClient.client_name,
                                        client_document: resultUpdateRegisterClient.client_document,
                                        client_agency_name: resultUpdateRegisterClient.client_agency_name,
                                        client_portfolio_name: resultUpdateRegisterClient.client_portfolio_name,
                                        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                                    };
                                }
                                return value;
                            }),
                        );

                        searchDashboardProductivityDailyTotalizer();

                        toast.success(`${resultUpdateRegisterClient.message}`);
                    } else {
                        toast.info(`${resultUpdateRegisterClient.message}`);
                    }
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                } finally {
                    setLoading(false);
                }
            })
            .catch(() => {});
    };

    const onSubmit = async (params: ProductivityDailyProps) => {
        let refactor = {};

        let clientDocumentReplaced: string | undefined;

        if (params?.client_document) {
            clientDocumentReplaced = params.client_document.replace(/[\.\-\/]/g, "");

            if (clientDocumentReplaced.length === 11) {
                const isValid = isValidCPF(clientDocumentReplaced);
                if (!isValid) {
                    setError("client_document", {
                        type: "manual",
                        message: "CPF inválido. Verifique os dados inseridos.",
                    });
                    toast.error("CPF inválido. Verifique os dados inseridos.");
                    return false;
                }
            } else if (clientDocumentReplaced.length === 14) {
                const isValid = isValidCNPJ(clientDocumentReplaced);
                if (!isValid) {
                    setError("client_document", {
                        type: "manual",
                        message: "CNPJ inválido. Verifique os dados inseridos.",
                    });
                    toast.error("CNPJ inválido. Verifique os dados inseridos.");
                    return false;
                }
            } else {
                setError("client_document", {
                    type: "manual",
                    message: "Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ).",
                });
                toast.error("Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ).");
                return false;
            }
        }

        if (params.status && Object.keys(params.status).length > 0) {
            refactor = {
                ...refactor,
                status: params.status.map((status) => status?.id),
            };
        }

        if (params.collaborators && Object.keys(params.collaborators).length > 0) {
            refactor = {
                ...refactor,
                created_by_id: params.collaborators.map((collaborators) => collaborators?.id),
            };
        }

        if (params.is_client && Object.keys(params.is_client).length > 0) {
            refactor = { ...refactor, is_client: params.is_client?.id };
        }

        if (params.products && Object.keys(params.products).length > 0) {
            refactor = {
                ...refactor,
                id_product: params.products.map((products) => products?.id),
            };
        }

        if (params.modalities_product && Object.keys(params.modalities_product).length > 0) {
            refactor = {
                ...refactor,
                id_modality_product: params.modalities_product.map((modalitiesProduct) => modalitiesProduct?.id),
            };
        }

        if (params.agencies && Object.keys(params.agencies).length > 0) {
            refactor = {
                ...refactor,
                id_agency: params.agencies.map((agencies) => agencies?.agency_sisbr_id),
            };
        }

        if (params.portfolios && Object.keys(params.portfolios).length > 0) {
            refactor = {
                ...refactor,
                id_portfolio: params.portfolios.map((agencies) => agencies?.id_ref),
            };
        }

        if (params.date_search && Object.keys(params.date_search).length > 0) {
            refactor = { ...refactor, date_search: params.date_search?.id };
        }

        if (params.date_start) {
            refactor = {
                ...refactor,
                date_start: params.date_start ? moment(params.date_start).format("YYYY-MM-DD") : "",
            };
        }

        if (params.date_end) {
            refactor = { ...refactor, date_end: params.date_end ? moment(params.date_end).format("YYYY-MM-DD") : "" };
        }

        if (params.mob_validation_is_counted && Object.keys(params.mob_validation_is_counted).length > 0) {
            refactor = { ...refactor, mob_validation_is_counted: params.mob_validation_is_counted?.id };
        }

        if (clientDocumentReplaced) {
            refactor = { ...refactor, client_document: clientDocumentReplaced };
        }

        try {
            setLoading(true);
            const data = await searchListProductivityDaily(refactor);

            setListProductivityDaily(data);

            searchDashboardProductivityDailyTotalizer();

            toast.success("Atualização realizada com sucesso!");
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            clearErrors();

            setTimeout(() => {
                setLoading(false);
            }, 1500);
        }
    };

    async function searchDashboardProductivityDailyTotalizer() {
        try {
            const dataDashboard = await getDashboardProductivityDailyTotalizer({ is_active: true });

            setDashboard(dataDashboard);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    }

    function editProductivityDailyModal(params: EditProductivityDailyProps) {
        setListProductivityDaily((prev) => {
            return prev.map((value) => {
                if (idProductivityDaily === value.id) {
                    return {
                        ...value,
                        ...params,
                        interaction_count_manual:
                            (value.interaction_count_manual || 0) + (params.interaction_count_manual || 0),
                    };
                }
                return value;
            });
        });

        searchDashboardProductivityDailyTotalizer();
    }

    useEffect(() => {
        async function execute() {
            try {
                toggleStatusBackdrop();

                const [
                    dataUserPermission,
                    listProductivityDaily,
                    dashboardProductivityDaily,
                    autoCompleteProducts,
                    autoCompleteModalitiesProduct,
                    autoCompleteEmployees,
                    autoCompleteAgencies,
                    autoCompletePortfolios,
                ] = await Promise.all([
                    searchAllAccessPermissionGroup(),
                    searchListProductivityDaily({ is_active: true, status: "PENDENTE" }),
                    getDashboardProductivityDailyTotalizer({ is_active: true }),
                    searchAutoCompleteProducts({ is_active: true, is_productivity_control: true }),
                    searchAutoCompleteProductsModalities({ is_active: true, with_product_name: true }),
                    searchAutoCompleteEmployees({
                        is_active: true,
                    }),
                    searchAutocompleteAgencies({
                        with_agency_sisbr_id: true,
                        is_active: true,
                        with_restrict_agency: false,
                    }),
                    searchAutoCompletePortfolios({
                        is_active: true,
                        with_restrict_agency: false,
                        has_id_ref: true,
                        has_agency_sisbr_id: true,
                    }),
                ]);

                const mapProducts = autoCompleteProducts.map(({ id, name }) => {
                    return { id, label: productMap[name] || name };
                });

                const mapModalitiesProduct = autoCompleteModalitiesProduct.map(({ id, name, product_name }) => {
                    return {
                        id,
                        label: `${productIconMap[product_name] ? productIconMap[product_name] + " " : ""}${name}`,
                        product_name,
                    };
                });

                const refEmployees = autoCompleteEmployees.map(({ id, name }) => {
                    return { id: id, label: name };
                });

                const mapAgencies = autoCompleteAgencies.map(({ id, abbreviation, agency_sisbr_id }) => ({
                    id,
                    label: abbreviation,
                    agency_sisbr_id,
                }));

                const mapAgency: AgencyMap = autoCompleteAgencies.reduce((acc, { abbreviation, agency_sisbr_id }) => {
                    if (agency_sisbr_id != null) {
                        acc[agency_sisbr_id] = abbreviation;
                    }
                    return acc;
                }, {} as AgencyMap);

                const mapPortfolios = autoCompletePortfolios
                    .map(({ id, name, ref_id, id_agency_sisbr }) => ({
                        id,
                        label: `${id_agency_sisbr != null && mapAgency[id_agency_sisbr] ? mapAgency[id_agency_sisbr] : id_agency_sisbr} ➖ ${name}`,
                        id_ref: ref_id,
                        id_agency_sisbr,
                    }))
                    .sort((a, b) => {
                        if (a.id_agency_sisbr == null && b.id_agency_sisbr == null) return 0;
                        if (a.id_agency_sisbr == null) return 1;
                        if (b.id_agency_sisbr == null) return -1;

                        if (a.id_agency_sisbr < b.id_agency_sisbr) return -1;
                        if (a.id_agency_sisbr > b.id_agency_sisbr) return 1;

                        return a.id - b.id;
                    });

                setAccessPermission(dataUserPermission);
                setListProductivityDaily(listProductivityDaily);
                setDashboard(dashboardProductivityDaily);
                setAutoCompleteProducts(mapProducts);
                setAutoCompleteModalitiesProduct(mapModalitiesProduct);
                setAutoCompleteEmployees(refEmployees);
                setAutoCompleteAgencies(mapAgencies);
                setAutoCompletePortfolios(mapPortfolios);
            } catch (error) {
                const { message } = await getInfoError(error);
                toast.error(message);
            } finally {
                toggleStatusBackdrop();
            }
        }
        execute();
    }, []);

    const SxBoxProps: SxProps = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: "100px",
        ml: !isMobile ? 0 : 2,
        flexGrow: 1,
        overflowX: "auto",
        "&::-webkit-scrollbar": {
            height: "6px",
            width: "6px",
        },
        "&::-webkit-scrollbar-thumb": {
            backgroundColor: colorBorderSystem,
        },
    };

    const actionsPeedDial = [
        {
            icon: <AddchartIcon color='action' />,
            name: "Lançar Produtividade",
            click_event: () => {
                handleNewRegister();
            },
        },
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
                handleFilterProductivityDaily();
            },
        },
    ];

    const columns: GridColDef[] = [
        {
            field: "Opções",
            width: 75,
            headerAlign: "center",
            align: "center",
            renderCell: (cellValues) => {
                const status = cellValues.row.status;
                const countInteractionManual = cellValues.row.interaction_count_manual;
                const productivityValidationCounted =
                    cellValues.row.status === "APROVADO"
                        ? cellValues.row.mob_validation_is_counted
                            ? "✅"
                            : "⛔"
                        : "     ";

                return (
                    <Stack direction='row'>
                        <Typography
                            justifyContent={"center"}
                            sx={{ cursor: "default" }}
                            mt={1}
                            title={
                                cellValues.row.status === "APROVADO"
                                    ? cellValues.row.mob_validation_is_counted
                                        ? "Produção sendo contabilizada no mobilizador"
                                        : "Produção não contabilizada no mobilizador"
                                    : ""
                            }>
                            {productivityValidationCounted}
                        </Typography>

                        {accessPermission.some(
                            (value) =>
                                value.group === "GROUP_AUDITOR_PRODUCTIVITY_CONTROL" || value.group === "GROUP_ADMIN",
                        ) ? (
                            <>
                                <Badge
                                    color='error'
                                    badgeContent={countInteractionManual}
                                    max={99}
                                    title='Contagem de Interações Manuais'
                                    sx={{
                                        "& .MuiBadge-badge": {
                                            height: "16px",
                                            minWidth: "16px",
                                            borderRadius: "50%",
                                            fontSize: "8.4px",
                                            backgroundColor: "#f92f60",
                                            color: "white",
                                            fontWeight: "bold",
                                            cursor: "default",
                                            top: 14,
                                            right: 4,
                                        },
                                    }}>
                                    {user && (
                                        <BasicMenu
                                            actions={[
                                                {
                                                    action: () => {
                                                        handleEditProductivityDaily();
                                                        setIDProductivityDaily(cellValues.row.id);
                                                        setPermissionProductivityDaily(true);
                                                    },
                                                    icon: <EditIcon color='warning' />,
                                                    name: "Editar",
                                                },
                                                {
                                                    action: () => {
                                                        handleModalInteractionProductivityDaily();
                                                        setIDProductivityDaily(cellValues.row.id);
                                                    },
                                                    icon: (
                                                        <Badge
                                                            color='error'
                                                            badgeContent={countInteractionManual}
                                                            max={999}
                                                            title='Contagem de Interações Manuais'
                                                            sx={{
                                                                "& .MuiBadge-badge": {
                                                                    height: "16px",
                                                                    minWidth: "16px",
                                                                    borderRadius: "50%",
                                                                    fontSize: "8px",
                                                                    backgroundColor: "#605ebb",
                                                                    color: "white",
                                                                    fontWeight: "bold",
                                                                    cursor: "default",
                                                                    top: 3,
                                                                    right: 2,
                                                                },
                                                            }}>
                                                            <ChatOutlinedIcon color='info' />
                                                        </Badge>
                                                    ),
                                                    name: "Interações",
                                                },
                                                {
                                                    action: () => {
                                                        handleModalAuditProductivityDaily();
                                                        setIDProductivityDaily(cellValues.row.id);
                                                        handlePermissionAuditProductivityDaily(true);
                                                    },
                                                    icon: <RuleOutlinedIcon color='success' />,
                                                    name: "Auditoria",
                                                },
                                                ...(status === "APROVADO"
                                                    ? [
                                                          {
                                                              action: () => {
                                                                  handleModalValidationProductivityDaily();
                                                                  setIDProductivityDaily(cellValues.row.id);
                                                              },
                                                              icon: (
                                                                  <AssignmentTurnedInOutlinedIcon
                                                                      sx={{ color: "#db7515" }}
                                                                  />
                                                              ),
                                                              name: "Validação",
                                                          },
                                                      ]
                                                    : []),
                                                {
                                                    action: () => {
                                                        handleModalTransferProductivityDaily();
                                                        setIDProductivityDaily(cellValues.row.id);
                                                    },
                                                    icon: <PeopleOutlinedIcon color='primary' />,
                                                    name: "Transferir",
                                                },
                                                {
                                                    action: () => {
                                                        handleHistoryProductivityDaily();
                                                        setIDProductivityDaily(cellValues.row.id);
                                                    },
                                                    icon: <HistoryOutlinedIcon />,
                                                    name: "Histórico",
                                                },
                                                {
                                                    action: () => {
                                                        handleUpdateRegisterClient(cellValues.row);
                                                    },
                                                    icon: <CloudSyncOutlinedIcon color='disabled' />,
                                                    name: "Sincronizar",
                                                },
                                                {
                                                    action: () => {
                                                        handleChangeIsActive(cellValues.row);
                                                    },
                                                    icon: !cellValues.row.is_active ? (
                                                        <CheckCircleOutlinedIcon color='success' />
                                                    ) : (
                                                        <HighlightOffOutlinedIcon color='error' />
                                                    ),
                                                    name: `${!cellValues.row.is_active ? "Ativar" : "Inativar"}`,
                                                },
                                            ]}
                                            cellValues={cellValues}
                                            color={
                                                user && user.id_user === cellValues.row.created_by_id
                                                    ? "success"
                                                    : "primary"
                                            }
                                        />
                                    )}
                                </Badge>
                            </>
                        ) : (
                            <>
                                <Badge
                                    color='error'
                                    badgeContent={countInteractionManual}
                                    max={99}
                                    title='Contagem de Interações Manuais'
                                    sx={{
                                        "& .MuiBadge-badge": {
                                            height: "16px",
                                            minWidth: "16px",
                                            borderRadius: "50%",
                                            fontSize: "8.4px",
                                            backgroundColor: "#f92f60",
                                            color: "white",
                                            fontWeight: "bold",
                                            cursor: "default",
                                            top: 14,
                                            right: 4,
                                        },
                                    }}>
                                    {["RASCUNHO", "CORREÇÃO"].includes(status) ? (
                                        <>
                                            {user && user.id_user === cellValues.row.created_by_id ? (
                                                <BasicMenu
                                                    actions={[
                                                        {
                                                            action: () => {
                                                                handleEditProductivityDaily();
                                                                setIDProductivityDaily(cellValues.row.id);
                                                                setPermissionProductivityDaily(false);
                                                            },
                                                            icon: <EditIcon color='warning' />,
                                                            name: "Editar",
                                                        },
                                                        {
                                                            action: () => {
                                                                handleModalInteractionProductivityDaily();
                                                                setIDProductivityDaily(cellValues.row.id);
                                                            },
                                                            icon: (
                                                                <Badge
                                                                    color='error'
                                                                    badgeContent={countInteractionManual}
                                                                    max={999}
                                                                    title='Contagem de Interações Manuais'
                                                                    sx={{
                                                                        "& .MuiBadge-badge": {
                                                                            height: "16px",
                                                                            minWidth: "16px",
                                                                            borderRadius: "50%",
                                                                            fontSize: "8px",
                                                                            backgroundColor: "#605ebb",
                                                                            color: "white",
                                                                            fontWeight: "bold",
                                                                            cursor: "default",
                                                                            top: 3,
                                                                            right: 2,
                                                                        },
                                                                    }}>
                                                                    <ChatOutlinedIcon color='info' />
                                                                </Badge>
                                                            ),
                                                            name: "Interações",
                                                        },
                                                        {
                                                            action: () => {
                                                                handleHistoryProductivityDaily();
                                                                setIDProductivityDaily(cellValues.row.id);
                                                            },
                                                            icon: <HistoryOutlinedIcon />,
                                                            name: "Histórico",
                                                        },
                                                        {
                                                            action: () => {
                                                                handleChangeIsActive(cellValues.row);
                                                            },
                                                            icon: <HighlightOffOutlinedIcon color='error' />,
                                                            name: `${!cellValues.row.is_active ? "Ativar" : "Inativar"}`,
                                                        },
                                                    ]}
                                                    cellValues={cellValues}
                                                    color={
                                                        user && user.id_user === cellValues.row.created_by_id
                                                            ? "success"
                                                            : "primary"
                                                    }
                                                />
                                            ) : (
                                                <BasicMenu
                                                    actions={[
                                                        {
                                                            action: () => {
                                                                handleModalAuditProductivityDaily();
                                                                setIDProductivityDaily(cellValues.row.id);
                                                                handlePermissionAuditProductivityDaily(false);
                                                            },
                                                            icon: <VisibilityOutlinedIcon color='success' />,
                                                            name: "Visualizar",
                                                        },
                                                        {
                                                            action: () => {
                                                                handleModalInteractionProductivityDaily();
                                                                setIDProductivityDaily(cellValues.row.id);
                                                            },
                                                            icon: (
                                                                <Badge
                                                                    color='error'
                                                                    badgeContent={countInteractionManual}
                                                                    max={999}
                                                                    title='Contagem de Interações Manuais'
                                                                    sx={{
                                                                        "& .MuiBadge-badge": {
                                                                            height: "16px",
                                                                            minWidth: "16px",
                                                                            borderRadius: "50%",
                                                                            fontSize: "8px",
                                                                            backgroundColor: "#605ebb",
                                                                            color: "white",
                                                                            fontWeight: "bold",
                                                                            cursor: "default",
                                                                            top: 3,
                                                                            right: 2,
                                                                        },
                                                                    }}>
                                                                    <ChatOutlinedIcon color='info' />
                                                                </Badge>
                                                            ),
                                                            name: "Interações",
                                                        },
                                                        {
                                                            action: () => {
                                                                handleHistoryProductivityDaily();
                                                                setIDProductivityDaily(cellValues.row.id);
                                                            },
                                                            icon: <HistoryOutlinedIcon />,
                                                            name: "Histórico",
                                                        },
                                                    ]}
                                                    cellValues={cellValues}
                                                    color='primary'
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {user && user.id_user === cellValues.row.created_by_id ? (
                                                <BasicMenu
                                                    actions={[
                                                        {
                                                            action: () => {
                                                                handleModalAuditProductivityDaily();
                                                                setIDProductivityDaily(cellValues.row.id);
                                                                handlePermissionAuditProductivityDaily(false);
                                                            },
                                                            icon: <VisibilityOutlinedIcon color='success' />,
                                                            name: "Visualizar",
                                                        },
                                                        {
                                                            action: () => {
                                                                handleModalInteractionProductivityDaily();
                                                                setIDProductivityDaily(cellValues.row.id);
                                                            },
                                                            icon: (
                                                                <Badge
                                                                    color='error'
                                                                    badgeContent={countInteractionManual}
                                                                    max={999}
                                                                    title='Contagem de Interações Manuais'
                                                                    sx={{
                                                                        "& .MuiBadge-badge": {
                                                                            height: "16px",
                                                                            minWidth: "16px",
                                                                            borderRadius: "50%",
                                                                            fontSize: "8px",
                                                                            backgroundColor: "#605ebb",
                                                                            color: "white",
                                                                            fontWeight: "bold",
                                                                            cursor: "default",
                                                                            top: 3,
                                                                            right: 2,
                                                                        },
                                                                    }}>
                                                                    <ChatOutlinedIcon color='info' />
                                                                </Badge>
                                                            ),
                                                            name: "Interações",
                                                        },
                                                        {
                                                            action: () => {
                                                                handleHistoryProductivityDaily();
                                                                setIDProductivityDaily(cellValues.row.id);
                                                            },
                                                            icon: <HistoryOutlinedIcon />,
                                                            name: "Histórico",
                                                        },
                                                    ]}
                                                    cellValues={cellValues}
                                                    color={
                                                        user && user.id_user === cellValues.row.created_by_id
                                                            ? "success"
                                                            : "primary"
                                                    }
                                                />
                                            ) : (
                                                <BasicMenu
                                                    actions={[
                                                        {
                                                            action: () => {
                                                                handleModalAuditProductivityDaily();
                                                                setIDProductivityDaily(cellValues.row.id);
                                                                handlePermissionAuditProductivityDaily(false);
                                                            },
                                                            icon: <VisibilityOutlinedIcon color='warning' />,
                                                            name: "Visualizar",
                                                        },
                                                        {
                                                            action: () => {
                                                                handleModalInteractionProductivityDaily();
                                                                setIDProductivityDaily(cellValues.row.id);
                                                            },
                                                            icon: (
                                                                <Badge
                                                                    color='error'
                                                                    badgeContent={countInteractionManual}
                                                                    max={999}
                                                                    title='Contagem de Interações Manuais'
                                                                    sx={{
                                                                        "& .MuiBadge-badge": {
                                                                            height: "16px",
                                                                            minWidth: "16px",
                                                                            borderRadius: "50%",
                                                                            fontSize: "8px",
                                                                            backgroundColor: "#605ebb",
                                                                            color: "white",
                                                                            fontWeight: "bold",
                                                                            cursor: "default",
                                                                            top: 3,
                                                                            right: 2,
                                                                        },
                                                                    }}>
                                                                    <ChatOutlinedIcon color='info' />
                                                                </Badge>
                                                            ),
                                                            name: "Interações",
                                                        },
                                                        {
                                                            action: () => {
                                                                handleHistoryProductivityDaily();
                                                                setIDProductivityDaily(cellValues.row.id);
                                                            },
                                                            icon: <HistoryOutlinedIcon />,
                                                            name: "Histórico",
                                                        },
                                                    ]}
                                                    cellValues={cellValues}
                                                    color='primary'
                                                />
                                            )}
                                        </>
                                    )}
                                </Badge>
                            </>
                        )}
                    </Stack>
                );
            },
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 100,
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{statusProductivityDailyMap[value]}</Typography>;
            },
        },
        {
            field: "created_at",
            headerName: "Data Inclusão",
            minWidth: 125,
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY HH:mm")}</Typography>;
            },
        },
        {
            field: "is_client",
            headerName: "Pré Cadastro",
            minWidth: 115,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography>{value ? "💚 Não " : "🚩 Sim"}</Typography>;
            },
        },
        {
            field: "is_client_rural",
            headerName: "É Rural",
            minWidth: 65,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography>{value ? "🌱 Sim" : "      Não"}</Typography>;
            },
        },
        {
            field: "client_date_movement",
            headerName: "Data de Movimento",
            minWidth: 135,
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{value ? formatDate(value, "DD/MM/YYYY") : ""}</Typography>;
            },
        },
        {
            field: "client_sisbr_id",
            headerName: "ID Cooperado",
            minWidth: 95,
            flex: 1,
        },
        {
            field: "client_name",
            headerName: "Nome Cooperado",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "client_document",
            headerName: "CPF/CNPJ",
            minWidth: 150,
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatCnpjCpf(value)}</Typography>;
            },
        },
        {
            field: "client_agency_name",
            headerName: "PA Cooperado",
            minWidth: 160,
            flex: 1,
        },
        {
            field: "client_portfolio_name",
            headerName: "Carteira",
            minWidth: 150,
            flex: 1,
        },
        {
            field: "product_name",
            headerName: "Produto",
            minWidth: 140,
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{productMap[value] || value}</Typography>;
            },
        },
        {
            field: "modality_name",
            headerName: "Modalidade",
            minWidth: 170,
            flex: 1,
        },
        {
            field: "modality_multiplier",
            headerName: "Multiplicador",
            minWidth: 100,
            flex: 1,
        },
        {
            field: "price",
            headerName: "Valor",
            minWidth: 125,
            headerAlign: "center",
            align: "right",
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
            field: "amount",
            headerName: "Quantidade",
            headerAlign: "center",
            minWidth: 90,
            align: "center",
            flex: 1,
        },
        {
            field: "observation",
            headerName: "Observação",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "created_by_name",
            headerName: "Criado por",
            minWidth: 180,
            flex: 1,
        },
        {
            field: "creator_agency_name",
            headerName: "PA do usuário",
            minWidth: 160,
            flex: 1,
        },
        {
            field: "created_portfolio_name",
            headerName: "Carteira do usuário",
            minWidth: 180,
            flex: 1,
        },
        {
            field: "audited_by_name",
            headerName: "Auditado por",
            minWidth: 140,
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{value !== null && value !== undefined ? value : "-"}</Typography>;
            },
        },
        {
            field: "date_audit",
            headerName: "Data Auditoria",
            minWidth: 130,
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{value ? formatDate(value, "DD/MM/YYYY HH:mm") : "-"}</Typography>;
            },
        },
        {
            field: "mob_validation_agency_name",
            headerName: "✔️ PA de Validação",
            minWidth: 165,
            flex: 1,
        },
        {
            field: "mob_validation_portfolio_name",
            headerName: "✔️ Carteira de Validação",
            minWidth: 170,
            flex: 1,
        },
        {
            field: "mob_validation_date",
            headerName: "✔️ Data de Validação",
            minWidth: 152,
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{value ? formatDate(value, "DD/MM/YYYY") : "-"}</Typography>;
            },
        },
        {
            field: "mob_validation_is_counted",
            headerName: "✔️ Situação Validação",
            align: "center",
            minWidth: 155,
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography>{value ? "✅ Ativo" : "⛔ Inativo"}</Typography>;
            },
        },
        {
            field: "updated_at",
            headerName: "Data Atualização",
            minWidth: 140,
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{value ? formatDate(value, "DD/MM/YYYY HH:mm") : "-"}</Typography>;
            },
        },
        {
            field: "is_active",
            headerName: "Situação",
            minWidth: 90,
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography>{value ? "🟢 Ativo" : "🔴 Inativo"}</Typography>;
            },
        },
        {
            field: "detail",
            headerName: "Detalhes do Produto",
            minWidth: 500,
            flex: 1,
            renderCell: ({ value }) => {
                if (value && typeof value === "string" && Object.keys(value).length > 0) {
                    const detailObject = JSON.parse(value);

                    return (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {Object.entries(detailObject).map(([key, val]: any) => (
                                <Typography
                                    key={key}
                                    fontSize={11.5}
                                    component='span'
                                    display='flex'
                                    alignItems='center'>
                                    <Typography component='span' fontSize={11.5} color='primary.main'>
                                        {key
                                            .replace(/_/g, " ")
                                            .split(" ")
                                            .slice(-1)[0]
                                            .replace(/^\w/, (c: string) => c.toUpperCase())}
                                        :
                                    </Typography>
                                    <Typography component='span' fontSize={11.5} ml={0.5}>
                                        {val}
                                    </Typography>
                                </Typography>
                            ))}
                        </Box>
                    );
                }
                return null;
            },
        },
    ];

    return (
        <>
            <Grid container spacing={1} justifyContent='center' paddingInline={2} mt={0} mb={0.75} wrap='wrap'>
                <Grid item xs={12} md={12}>
                    <Box display='flex' justifyContent='space-between' alignItems='center' width='100%'>
                        <Breadcrumbs aria-label='breadcrumb' separator='›'>
                            <Typography
                                color='text.primary'
                                sx={{ display: "inline-flex", alignItems: "center" }}
                                pt={1}>
                                <InsightsOutlinedIcon sx={{ color: isThemeLight ? "#5e5e5e" : "#FFFFFF", mr: 0.5 }} />
                                Controle de Produtividades
                            </Typography>
                            <Typography color='text.secondary'>Produtividade Diária</Typography>
                        </Breadcrumbs>

                        <CSATAverageRating
                            module={"Produtividade Diária"}
                            routePath={"/controle-produtividades/produtividade-diaria"}
                            isClickable
                            formProps={{
                                module: "Produtividade Diária",
                                routePath: "/controle-produtividades/produtividade-diaria",
                            }}
                        />
                    </Box>
                </Grid>
            </Grid>
            <BoxMain isDivider={false} mt={0}>
                <Grid container spacing={2} justifyContent='center' mb={3} wrap={"wrap"}>
                    {dashboard && (
                        <Box sx={SxBoxProps}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flex: 1,
                                    padding: 1,
                                    borderRight: `1px dashed ${colorBorderSystem}`,
                                }}>
                                <Box display='flex' alignItems='center' textAlign='center'>
                                    <Box width={65} height={60}>
                                        <Chart
                                            options={generateChartOptions(
                                                safePercentage(dashboard.approved, dashboard.total),
                                                "aprovados",
                                            )}
                                            height={60}
                                        />
                                    </Box>
                                    <Box ml={2}>
                                        <Typography
                                            variant='subtitle1'
                                            color='text.primary'
                                            fontSize={!isMobile ? 16 : 12}>
                                            🟢 Aprovados
                                        </Typography>
                                        <Typography
                                            variant='h5'
                                            color={isThemeLight ? "#1ab96a" : "#66E4A6"}
                                            fontSize={!isMobile ? 16 : 12}>
                                            {formatNumberWithThousandsSeparator(dashboard.approved) || "0"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flex: 1,
                                    padding: 1,
                                    borderRight: `1px dashed ${colorBorderSystem}`,
                                }}>
                                <Box display='flex' alignItems='center' textAlign='center'>
                                    <Box width={65} height={60}>
                                        <Chart
                                            options={generateChartOptions(
                                                safePercentage(dashboard.failed, dashboard.total),
                                                "reprovados",
                                            )}
                                            height={60}
                                        />
                                    </Box>
                                    <Box ml={2}>
                                        <Typography
                                            variant='subtitle1'
                                            color='text.primary'
                                            fontSize={!isMobile ? 16 : 12}>
                                            🔴 Reprovados
                                        </Typography>
                                        <Typography
                                            variant='h5'
                                            color={isThemeLight ? "#be1c1c" : "#FB8382"}
                                            fontSize={!isMobile ? 16 : 12}>
                                            {formatNumberWithThousandsSeparator(dashboard.failed) || "0"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flex: 1,
                                    padding: 1,
                                    borderRight: `1px dashed ${colorBorderSystem}`,
                                }}>
                                <Box display='flex' alignItems='center' textAlign='center'>
                                    <Box width={65} height={60}>
                                        <Chart
                                            options={generateChartOptions(
                                                safePercentage(dashboard.pending, dashboard.total),
                                                "pendentes",
                                            )}
                                            height={60}
                                        />
                                    </Box>
                                    <Box ml={2}>
                                        <Typography
                                            variant='subtitle1'
                                            color='text.primary'
                                            fontSize={!isMobile ? 16 : 12}>
                                            🟡 Pendentes
                                        </Typography>
                                        <Typography
                                            variant='h5'
                                            color={isThemeLight ? "#b49310" : "#FDE68C"}
                                            fontSize={!isMobile ? 16 : 12}>
                                            {formatNumberWithThousandsSeparator(dashboard.pending) || "0"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flex: 1,
                                    padding: 1,
                                    borderRight: `1px dashed ${colorBorderSystem}`,
                                }}>
                                <Box display='flex' alignItems='center' textAlign='center'>
                                    <Box width={65} height={60}>
                                        <Chart
                                            options={generateChartOptions(
                                                safePercentage(dashboard.correction, dashboard.total),
                                                "correcoes",
                                            )}
                                            height={60}
                                        />
                                    </Box>
                                    <Box ml={2}>
                                        <Typography
                                            variant='subtitle1'
                                            color='text.primary'
                                            fontSize={!isMobile ? 16 : 12}>
                                            🔵 Correções
                                        </Typography>
                                        <Typography
                                            variant='h5'
                                            color={isThemeLight ? "#0b5e92" : "#66ACD6"}
                                            fontSize={!isMobile ? 16 : 12}>
                                            {formatNumberWithThousandsSeparator(dashboard.correction) || "0"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flex: 1,
                                    padding: 1,
                                    borderRight: `1px dashed ${colorBorderSystem}`,
                                }}>
                                <Box display='flex' alignItems='center' textAlign='center'>
                                    <Box width={65} height={60}>
                                        <Chart
                                            options={generateChartOptions(
                                                safePercentage(dashboard.sketch, dashboard.total),
                                                "rascunho",
                                            )}
                                            height={60}
                                        />
                                    </Box>
                                    <Box ml={2}>
                                        <Typography
                                            variant='subtitle1'
                                            color='text.primary'
                                            fontSize={!isMobile ? 16 : 12}>
                                            🟣 Rascunhos
                                        </Typography>
                                        <Typography
                                            variant='h5'
                                            color={isThemeLight ? "#6125b6" : "#BBA3DC"}
                                            fontSize={!isMobile ? 16 : 12}>
                                            {formatNumberWithThousandsSeparator(dashboard.sketch) || "0"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: 1,
                                }}>
                                <Box display='flex' alignItems='center' textAlign='center'>
                                    <Box marginInline={1}>
                                        <Typography
                                            variant='subtitle1'
                                            color='text.primary'
                                            fontSize={!isMobile ? 16 : 12}
                                            title='Não contabiliza os registros de status: (⚫ Cancelado)'>
                                            Total
                                        </Typography>
                                        <Typography variant='h5' color='text.secondary' fontSize={!isMobile ? 16 : 12}>
                                            {formatNumberWithThousandsSeparator(dashboard.total) || "0"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Grid>

                {Object.values(filters).some((value) => value !== undefined && value !== null && value.length > 0) ? (
                    <>
                        <Grid
                            title='Filtro aplicado'
                            container
                            direction='row'
                            gap={1}
                            border={`1px dashed ${colorBorderSystem}`}
                            padding={1}
                            borderRadius={4}
                            mt={-1}
                            marginBottom={2}>
                            <Grid item xs={12}>
                                <FilterApplied
                                    filters={filters}
                                    clearAllFilters={clearAllFilters}
                                    removeFilter={removeFilter}
                                />
                            </Grid>
                        </Grid>
                    </>
                ) : (
                    <Grid item xs={12} mb={0} mt={-0.75} borderTop={`1px dashed ${colorBorderSystem}`} p={2}>
                        <LoadingButton
                            title='Atualizar dados'
                            size='small'
                            type='submit'
                            variant={loading ? "outlined" : "text"}
                            color='success'
                            disabled={loading}
                            loading={loading}
                            sx={{
                                borderRadius: 2,
                            }}
                            onClick={handleRefresh}>
                            <RefreshIcon
                                color={loading ? "disabled" : "success"}
                                sx={{ visibility: loading ? "hidden" : "visible" }}
                            />
                            <Typography
                                component={"span"}
                                fontSize={14}
                                fontStyle={"initial"}
                                color={"success.light"}
                                visibility={loading ? "hidden" : "visible"}
                                ml={1}
                                mr={1}>
                                Atualizar Dados
                            </Typography>
                        </LoadingButton>
                    </Grid>
                )}

                <DataGrid
                    autoHeight
                    columns={columns}
                    rows={listProductivityDaily}
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
                                client_date_movement: false,
                                client_sisbr_id: false,
                                modality_multiplier: false,
                                observation: false,
                                is_active: false,
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
                                transform: "translate(43%, 36%)",
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

                <TemporaryDrawer
                    title='Filtro Listagem | Produtividade Diária'
                    closeButton={handleFilterProductivityDaily}
                    onClose={handleFilterProductivityDaily}
                    disableEscapeKeyDown={false}
                    open={openDrawerFilter}
                    sx={{
                        "& .MuiDrawer-paperAnchorRight": {
                            width: device === "Mobile" ? "100%" : "45%",
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
                        <Grid
                            container
                            component={"form"}
                            direction='row'
                            spacing={2}
                            sx={{ paddingTop: 1, paddingBottom: 1 }}
                            onSubmit={handleSubmit(onSubmit)}>
                            <Grid item xs={12} md={12}>
                                <FormAutocompleteMultiple
                                    fullWidth
                                    name='status'
                                    label='Status'
                                    variant='outlined'
                                    size='medium'
                                    disableCloseOnSelect
                                    control={control}
                                    errors={errors}
                                    options={
                                        accessPermission.some(
                                            (value) =>
                                                value.group === "GROUP_AUDITOR_PRODUCTIVITY_CONTROL" ||
                                                value.group === "GROUP_ADMIN",
                                        )
                                            ? ArrayTypeStatusProductivityDaily
                                            : ArrayTypeStatusProductivityDaily.filter(
                                                  (status) => status.id !== "CANCELADO",
                                              )
                                    }
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormAutocomplete
                                    fullWidth
                                    name='mob_validation_is_counted'
                                    label='Situação Validação'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                    options={[
                                        { id: true, label: "✅ Ativo" },
                                        { id: false, label: "⛔ Inativo" },
                                    ]}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormAutocomplete
                                    fullWidth
                                    name='is_client'
                                    label='Pré Cadastro'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                    options={[
                                        { id: true, label: "💚 Não" },
                                        { id: false, label: "🚩 Sim" },
                                    ]}
                                />
                            </Grid>

                            <Grid item xs={12} md={12}>
                                <FormAutocompleteMultiple
                                    fullWidth
                                    name='products'
                                    label='Produto'
                                    variant='outlined'
                                    size='medium'
                                    disableCloseOnSelect
                                    control={control}
                                    errors={errors}
                                    options={autoCompleteProducts}
                                />
                            </Grid>

                            <Grid item xs={12} md={12}>
                                <FormAutocompleteMultiple
                                    fullWidth
                                    name='modalities_product'
                                    label='Modalidades'
                                    variant='outlined'
                                    size='medium'
                                    disableCloseOnSelect
                                    control={control}
                                    errors={errors}
                                    options={autoCompleteModalitiesProduct}
                                />
                            </Grid>

                            <Grid item xs={12} md={12}>
                                <FormAutocompleteMultiple
                                    fullWidth
                                    name='agencies'
                                    label='Agência de Validação'
                                    variant='outlined'
                                    size='medium'
                                    disableCloseOnSelect
                                    control={control}
                                    errors={errors}
                                    options={autoCompleteAgencies
                                        .map(({ id, label, agency_sisbr_id }) => {
                                            return { id, label, agency_sisbr_id };
                                        })
                                        .filter((value) => value.agency_sisbr_id !== 9999)}
                                />
                            </Grid>

                            <Grid item xs={12} md={12}>
                                <FormAutocompleteMultiple
                                    fullWidth
                                    name='portfolios'
                                    label='Carteira de Validação'
                                    variant='outlined'
                                    size='medium'
                                    disableCloseOnSelect
                                    control={control}
                                    errors={errors}
                                    options={autoCompletePortfolios}
                                />
                            </Grid>

                            <Grid item xs={12} md={12}>
                                <FormAutocompleteMultiple
                                    fullWidth
                                    name='collaborators'
                                    label='Criado por (Usuário)'
                                    variant='outlined'
                                    size='medium'
                                    disableCloseOnSelect
                                    control={control}
                                    errors={errors}
                                    options={autoCompleteEmployees}
                                />
                            </Grid>

                            <Grid item xs={12} md={12}>
                                <FormInputCpfCnpj
                                    fullWidth
                                    name='client_document'
                                    label='CPF ou CNPJ do Cooperado'
                                    placeholder='Digite um CPF ou CNPJ'
                                    size='medium'
                                    variant='outlined'
                                    control={control}
                                    errors={errors}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <FormAutocomplete
                                    fullWidth
                                    name='date_search'
                                    label='Buscar por:'
                                    variant='outlined'
                                    size='medium'
                                    disableClearable
                                    control={control}
                                    errors={errors}
                                    options={arrayTypeDateSearch}
                                />
                            </Grid>

                            <Grid item xs={6} md={4}>
                                <FormDatePicker
                                    fullWidth
                                    name='date_start'
                                    label='Data Inicial'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                />
                            </Grid>

                            <Grid item xs={6} md={4}>
                                <FormDatePicker
                                    fullWidth
                                    name='date_end'
                                    label='Data Final'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <LoadingButton
                                    fullWidth
                                    type='submit'
                                    color='success'
                                    loadingPosition='start'
                                    size='large'
                                    variant='contained'
                                    startIcon={<SearchIcon />}
                                    loading={loading}
                                    sx={{ boxShadow: "none" }}>
                                    Pesquisar
                                </LoadingButton>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <LoadingButton
                                    fullWidth
                                    type='reset'
                                    color='primary'
                                    loadingPosition='start'
                                    size='large'
                                    variant='contained'
                                    startIcon={<SearchOffIcon />}
                                    loading={loading}
                                    sx={{ boxShadow: "none" }}
                                    onClick={() => {
                                        reset({
                                            status: [],
                                            is_client: null,
                                            products: [],
                                            modalities_product: [],
                                            date_search: null,
                                            date_start: null,
                                            date_end: null,
                                            agencies: [],
                                            portfolios: [],
                                            collaborators: [],
                                            client_document: null,
                                        });
                                    }}>
                                    Limpar Filtros
                                </LoadingButton>
                            </Grid>
                        </Grid>
                    </Box>
                </TemporaryDrawer>

                <TemporaryDrawer
                    title='Editar Produtividade Diária'
                    closeButton={handleEditProductivityDaily}
                    open={openDrawerEdit}
                    sx={{
                        "& .MuiDrawer-paperAnchorRight": {
                            width: device === "Mobile" ? "100%" : "80%",
                        },
                        "& .MuiModal-backdrop": {
                            backgroundColor: "rgb(0 0 0 / 30%)",
                        },
                        "& .MuiDrawer-paper": {
                            background: colorBackgroundSystem,
                            borderLeft: `1px solid ${colorBorderSystem}`,
                            backdropFilter: "blur(30px)",
                            backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                            backgroundRepeat: "no-repeat, no-repeat",
                            backgroundSize: "50%, 50%",
                            backgroundPosition: "right top, left bottom",
                        },
                    }}>
                    <Box>
                        <ProductivityDailyFields
                            p={3}
                            updateColumn={editProductivityDailyModal}
                            idProductivityDaily={idProductivityDaily}
                        />
                    </Box>
                </TemporaryDrawer>

                <Modal open={openModalInteraction}>
                    <Box>
                        <InteractionsProductivityDaily
                            idProductivityDaily={idProductivityDaily}
                            updateColumn={editProductivityDailyModal}
                            handleClose={handleModalInteractionProductivityDaily}
                        />
                    </Box>
                </Modal>

                <Modal open={openModalTransferProductivity}>
                    <TransferProductivityDaily
                        idProductivityDaily={idProductivityDaily}
                        updateColumn={editProductivityDailyModal}
                        handleClose={handleModalTransferProductivityDaily}
                    />
                </Modal>

                <Modal open={openModalValidationProductivity}>
                    <ValidationProductivityDaily
                        idProductivityDaily={idProductivityDaily}
                        updateColumn={editProductivityDailyModal}
                        handleClose={handleModalValidationProductivityDaily}
                    />
                </Modal>

                <Modal open={openModalAuditProductivity}>
                    <Box>
                        <AuditProductivityDaily
                            idProductivityDaily={idProductivityDaily}
                            permissionProductivityDaily={permissionProductivityDaily}
                            updateColumn={editProductivityDailyModal}
                            handleClose={handleModalAuditProductivityDaily}
                        />
                    </Box>
                </Modal>

                <Modal open={openModalHistoryProductivity}>
                    <Box>
                        <TimelineHistoryProductivityDaily
                            idProductivityDaily={idProductivityDaily}
                            handleClose={handleHistoryProductivityDaily}
                        />
                    </Box>
                </Modal>

                <BasicSpeedDial
                    ariaLabel='Menu'
                    actions={actionsPeedDial}
                    open={speedDialOpen}
                    onClick={() => setSpeedDialOpen((oldValue) => !oldValue)}
                    sx={{
                        position: "absolute",
                        bottom: 17,
                        right: 8,
                        "& .MuiSpeedDial-fab": {
                            width: "40px",
                            height: "40px",
                            boxShadow: "0 0 12px 1px #0096876f",
                        },
                    }}
                />
            </BoxMain>
        </>
    );
}
