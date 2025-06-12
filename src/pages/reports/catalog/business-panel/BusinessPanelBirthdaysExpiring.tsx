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
import { useGlobal } from "@/contexts/GlobalContext";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { formatDate } from "@/functions/date";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { formatCnpjCpf, formatNumberWithThousandsSeparator } from "@/functions/number";
import { ExtClientInfo } from "@/components/ExtClientInfo/ExtClientInfo";
import {
    IListBirthdaysExpiring,
    ISearchAllReportsCatalog,
    searchAllReportsCatalogRecords,
    searchReportsCatalogPanelBirthdaysExpiring,
} from "@/services/reports";
import WhatsAppButton from "@/components/WhatsappButton/WhatsappButton";
import StackedBarChartOutlinedIcon from "@mui/icons-material/StackedBarChartOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import { Link as LinkRouter } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrayTypesAgenciesName } from "@/constants/array-type-agencies";
import { LoadingButton } from "@mui/lab";
import FormInputCpfCnpj from "@/components/FormComponents/FormInputCpfCnpj";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import FormAutocompleteMultiple from "@/components/FormComponents/FormAutocompleteMultiple";
import FormInput from "@/components/FormComponents/FormInput";
import { ArrayTypesPortfolioName } from "@/constants/array-type-portfolio-name";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";
import { CSATAverageRating } from "@/components/CSATAssessments/CSATAverageRating";

type AutoCompleteString = {
    id: string;
    label: string;
};

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

export type BusinessPanelBirthdaysExpiringProps = {
    filter_client_agencies?: AutoCompleteString[];
    filter_client_portfolio?: AutoCompleteString[];
    filter_client_is_rural: AutoCompleteBoolean;
    filter_client_is_cooperated: AutoCompleteBoolean;
    filter_client_is_employee: AutoCompleteBoolean;
    filter_client_document?: string | null;
    filter_client_missing_days_min?: number | null;
    filter_client_missing_days_max?: number | null;
};

interface Filters {
    filter_client_agencies?: string[];
    filter_client_portfolio?: string[];
    filter_client_is_rural?: string;
    filter_client_is_cooperated?: string;
    filter_client_is_employee?: string;
    filter_client_document?: string;
    filter_client_missing_days_min?: string;
    filter_client_missing_days_max?: string;
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
    filter_client_missing_days_min: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_client_missing_days_max: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
});

export function BusinessPanelBirthdaysExpiring() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [listPanelBirthdaysExpiring, setListPanelBirthdaysExpiring] = useState<IListBirthdaysExpiring[]>([]);
    const [originalListBirthdaysExpiring, setOriginalListBirthdaysExpiring] = useState<IListBirthdaysExpiring[]>([]);
    const [dataPanelBirthdaysExpiring, setDataPanelBirthdaysExpiring] = useState<ISearchAllReportsCatalog>();
    const [MovimentDatePanelBirthdaysExpiring, setMovimentDatePanelBirthdaysExpiring] = useState<string>();
    const [idExtClient, setIdExtClient] = useState<number>();
    const [openDrawerFilter, setOpenDrawerFilter] = useState(false);
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);
    const [openModalClient, setOpenModalClient] = useState(false);

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
    } = useForm<BusinessPanelBirthdaysExpiringProps | any>({
        resolver: yupResolver(validationSchema),
    });

    const filterClientAgenciesWatch = watch("filter_client_agencies");
    const filterClientPortfolioWatch = watch("filter_client_portfolio");
    const filterClientIsRuralWatch = watch("filter_client_is_rural");
    const filterClientIsCooperatedWatch = watch("filter_client_is_cooperated");
    const filterClientIsEmployeeWatch = watch("filter_client_is_employee");
    const filterClientDocumentWatch = watch("filter_client_document");
    const filterClientMissingDaysMinWatch = watch("filter_client_missing_days_min");
    const filterClientMissingDaysMaxWatch = watch("filter_client_missing_days_max");

    useEffect(() => {
        const fetchData = async () => {
            try {
                toggleStatusBackdrop();
                setLoading(true);

                const [responseBirthdaysExpiringPanel, responseAllReports] = await Promise.all([
                    searchReportsCatalogPanelBirthdaysExpiring({}),
                    searchAllReportsCatalogRecords({ route: currentPath }),
                ]);

                const { proximos_aniversarios, data_movimento } = responseBirthdaysExpiringPanel;
                const dataPanelBirthdaysExpiring = responseAllReports[0];

                setOriginalListBirthdaysExpiring(proximos_aniversarios);
                setListPanelBirthdaysExpiring(proximos_aniversarios);

                setMovimentDatePanelBirthdaysExpiring(data_movimento);
                setDataPanelBirthdaysExpiring(dataPanelBirthdaysExpiring);
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
    }, [dataPanelBirthdaysExpiring]);

    const handleOpenModalClient = () => {
        setOpenModalClient((oldValue) => !oldValue);
    };

    const handleFilterPanelBirthdaysExpiring = () => {
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
        const filteredData = originalListBirthdaysExpiring.filter((item) => {
            return (
                (!filters.filter_client_agencies ||
                    filters.filter_client_agencies.length === 0 ||
                    filters.filter_client_agencies.some((selected) => item.agencia_nome === selected)) &&
                (!filters.filter_client_portfolio ||
                    filters.filter_client_portfolio.length === 0 ||
                    filters.filter_client_portfolio.some((selected) => item.carteira_nome === selected)) &&
                (filters.filter_client_is_rural === null || item.e_rural === Boolean(filters.filter_client_is_rural)) &&
                (filters.filter_client_is_cooperated === null ||
                    item.e_cooperado === Boolean(filters.filter_client_is_cooperated)) &&
                (filters.filter_client_is_employee === null ||
                    item.e_funcionario === Boolean(filters.filter_client_is_employee)) &&
                (!filters.filter_client_document ||
                    String(item.cliente_documento).includes(
                        String(filters.filter_client_document.replace(/[\.\-\/]/g, "")),
                    )) &&
                (filters.filter_client_missing_days_min === null ||
                    item.dias_faltantes_numero >= Number(filters.filter_client_missing_days_min)) &&
                (filters.filter_client_missing_days_max === null ||
                    item.dias_faltantes_numero <= Number(filters.filter_client_missing_days_max))
            );
        });

        setListPanelBirthdaysExpiring(filteredData);
    };

    useEffect(() => {
        const filtersWatch = {
            filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_portfolio: filterClientPortfolioWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_is_rural: filterClientIsRuralWatch?.id !== undefined ? filterClientIsRuralWatch?.id : null,
            filter_client_is_cooperated:
                filterClientIsCooperatedWatch?.id !== undefined ? filterClientIsCooperatedWatch?.id : null,
            filter_client_is_employee:
                filterClientIsEmployeeWatch?.id !== undefined ? filterClientIsEmployeeWatch?.id : null,
            filter_client_document: filterClientDocumentWatch || null,
            filter_client_missing_days_min: filterClientMissingDaysMinWatch || null,
            filter_client_missing_days_max: filterClientMissingDaysMaxWatch || null,
        };

        applyFilters(filtersWatch);
    }, [
        filterClientAgenciesWatch,
        filterClientPortfolioWatch,
        filterClientIsRuralWatch,
        filterClientIsCooperatedWatch,
        filterClientIsEmployeeWatch,
        filterClientDocumentWatch,
        filterClientMissingDaysMinWatch,
        filterClientMissingDaysMaxWatch,
    ]);

    const filters = {
        filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_portfolio: filterClientPortfolioWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_is_rural: filterClientIsRuralWatch?.label,
        filter_client_is_cooperated: filterClientIsCooperatedWatch?.label,
        filter_client_is_employee: filterClientIsEmployeeWatch?.label,
        filter_client_document: filterClientDocumentWatch,
        filter_client_missing_days_min: filterClientMissingDaysMinWatch,
        filter_client_missing_days_max: filterClientMissingDaysMaxWatch,
    };

    const labelsMap = {
        filter_client_agencies: "Agência(s)",
        filter_client_portfolio: "Carteira(s)",
        filter_client_is_rural: "É Rural",
        filter_client_is_cooperated: "É Cooperado",
        filter_client_is_employee: "É Funcionário",
        filter_client_document: "CPF/CNPJ",
        filter_client_missing_days_min: "Dias Faltantes - Min",
        filter_client_missing_days_max: "Dias Faltantes - Max",
    };

    const clearAllFilters = () => {
        reset({
            filter_client_agencies: [],
            filter_client_portfolio: [],
            filter_client_is_rural: null,
            filter_client_is_cooperated: null,
            filter_client_is_employee: null,
            filter_client_document: null,
            filter_client_missing_days_min: null,
            filter_client_missing_days_max: null,
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
                            onClick={handleFilterPanelBirthdaysExpiring}>
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
                                handleOpenModalClient();
                                setIdExtClient(cellValues.row.id);
                            }}
                            color='success'
                            title='Visualizar Dados do Cooperado'
                            aria-label='Visualizar Cooperado'>
                            <AccountCircleOutlinedIcon />
                        </IconButton>
                    </Stack>
                );
            },
        },
        {
            field: "cliente_nome",
            headerName: "Nome",
            minWidth: 230,
            flex: 1,
            headerAlign: "center",
            renderCell: ({ value, row: { dias_faltantes_numero } }) => {
                const isBirthDay = dias_faltantes_numero === 0;

                return <Typography fontSize={14}>{isBirthDay ? `🎂 ${value}` : value}</Typography>;
            },
        },
        {
            field: "cliente_documento",
            headerName: "CPF/CNPJ",
            minWidth: 120,
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
            field: "e_funcionario",
            headerName: "É Funcionário",
            minWidth: 100,
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return (
                    <Typography color={value ? "primary.light" : "success.light"}>{value ? "Sim" : "Não"}</Typography>
                );
            },
        },
        {
            field: "e_cooperado",
            headerName: "É Cooperado",
            minWidth: 100,
            flex: 1,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return <Typography color={value ? "#00D26A" : "#FF6723"}>{value ? "💚 Sim" : "🟠 Não"}</Typography>;
            },
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
            field: "dias_faltantes",
            headerName: "Dias Faltantes",
            minWidth: 115,
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "idade_fazendo",
            headerName: "Idade Aniversário",
            minWidth: 135,
            headerAlign: "center",
            align: "center",
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography>{value} anos</Typography>;
            },
        },
        {
            field: "cliente_nascimento",
            headerName: "Data Nascimento",
            minWidth: 125,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY")}</Typography>;
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
                                {dataPanelBirthdaysExpiring?.title || ""}
                            </Typography>
                        </Breadcrumbs>

                        {dataPanelBirthdaysExpiring && (
                            <CSATAverageRating
                                module={`Painel | ${dataPanelBirthdaysExpiring.title}`}
                                routePath={`${dataPanelBirthdaysExpiring.route}`}
                                isClickable
                                formProps={{
                                    module: `Painel | ${dataPanelBirthdaysExpiring.title}`,
                                    routePath: `${dataPanelBirthdaysExpiring.route}`,
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
                ) : dataPanelBirthdaysExpiring ? (
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
                                        backgroundImage: dataPanelBirthdaysExpiring.background_color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "1.5rem",
                                        fontWeight: "bold",
                                        position: "relative",
                                    }}>
                                    <Tooltip title={dataPanelBirthdaysExpiring?.description || ""}>
                                        <Box
                                            position='absolute'
                                            top={5}
                                            left={8}
                                            color='white'
                                            padding='4px 8px'
                                            borderRadius='4px'>
                                            <Icon>{dataPanelBirthdaysExpiring.label_icon}</Icon>
                                        </Box>
                                    </Tooltip>
                                    {MovimentDatePanelBirthdaysExpiring && (
                                        <Tooltip
                                            title={`Data de atualização da base de cooperados do dia: ${formatDate(
                                                MovimentDatePanelBirthdaysExpiring,
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
                                                    {MovimentDatePanelBirthdaysExpiring &&
                                                        formatDate(MovimentDatePanelBirthdaysExpiring, "DD/MM/YYYY")}
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
                                            {listPanelBirthdaysExpiring &&
                                                formatNumberWithThousandsSeparator(listPanelBirthdaysExpiring.length)}
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
                                        rows={listPanelBirthdaysExpiring}
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

            <TemporaryDrawer
                title='Filtro Listagem'
                closeButton={handleFilterPanelBirthdaysExpiring}
                onClose={handleFilterPanelBirthdaysExpiring}
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

                        <Grid item xs={12} md={4}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_client_is_cooperated'
                                label='É Cooperado'
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

                        <Grid item xs={12} md={4}>
                            <FormAutocomplete
                                fullWidth
                                name='filter_client_is_employee'
                                label='É Funcionário'
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

                        <Grid item xs={12} md={5.25}>
                            <FormInput
                                fullWidth
                                label='Dias Faltantes - Inicial'
                                placeholder='Digite um número'
                                name='filter_client_missing_days_min'
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
                                label='Dias Faltantes - Final'
                                placeholder='Digite um número'
                                name='filter_client_missing_days_max'
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
                                        filter_client_is_cooperated: null,
                                        filter_client_is_employee: null,
                                        filter_client_document: null,
                                        filter_client_missing_days_min: "",
                                        filter_client_missing_days_max: "",
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
                            handleFilterPanelBirthdaysExpiring();
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
