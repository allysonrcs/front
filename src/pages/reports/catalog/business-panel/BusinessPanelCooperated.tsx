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
import { formatCnpjCpf, formatNumberWithThousandsSeparator } from "@/functions/number";
import { ExtClientInfo, mapValueCurrentAccount } from "@/components/ExtClientInfo/ExtClientInfo";
import {
    IListCooperatedPanel,
    ISearchAllReportsCatalog,
    searchAllReportsCatalogRecords,
    SearchCooperatedPanelProps,
    searchReportsCatalogCooperatedPanel,
} from "@/services/reports";
import FormAutocompleteMultiple from "@/components/FormComponents/FormAutocompleteMultiple";
import { ArrayTypesDocumentClient } from "@/constants/array-type-document-client";
import { ArrayTypesProfileClient } from "@/constants/array-type-profile-client";
import { ArrayTypesPortfolioName } from "@/constants/array-type-portfolio-name";
import { ArrayTypesAgenciesName } from "@/constants/array-type-agencies";
import { ArrayTypeStatusCurrentAccountClient } from "@/constants/array-type-status-current-account-client";
import { useAuth } from "@/contexts/AuthContext";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";
import { ChartsBusinessPanelCooperated } from "./charts/ChartsBusinessPanelCooperated";
import { CSATAverageRating } from "@/components/CSATAssessments/CSATAverageRating";
import FormInputCpfCnpj from "@/components/FormComponents/FormInputCpfCnpj";
import DonutLargeOutlinedIcon from "@mui/icons-material/DonutLargeOutlined";
import FormInput from "@/components/FormComponents/FormInput";

type AutoCompleteString = {
    id: string;
    label: string;
};

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

export type BusinessPanelCooperatedProps = {
    filter_client_agencies?: AutoCompleteString[];
    filter_client_portfolio?: AutoCompleteString[];
    filter_client_profile?: AutoCompleteString[];
    filter_client_type?: AutoCompleteString[];
    filter_client_marital?: AutoCompleteString[];
    filter_client_gender?: AutoCompleteString[];
    filter_client_cc_sitconta?: AutoCompleteString[];
    filter_client_is_rural?: AutoCompleteBoolean;
    filter_client_is_cooperated?: AutoCompleteBoolean;
    filter_client_is_employee?: AutoCompleteBoolean;
    filter_client_in_migration?: AutoCompleteBoolean;
    filter_client_document?: string | null;
    filter_id_client?: number | null;
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
    filter_client_in_migration?: string;
    filter_client_document?: string;
    filter_id_client?: string;
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
    filter_client_in_migration: Yup.object()
        .shape({
            id: Yup.boolean().nullable(),
            label: Yup.string().nullable(),
        })
        .nullable(),
    filter_client_document: Yup.string().max(18, "Máximo 18 caracteres").trim().nullable(),
    filter_id_client: Yup.number()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
});

export function BusinessPanelCooperated() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [listPanelCooperated, setListPanelCooperated] = useState<IListCooperatedPanel[]>([]);
    const [originalListPanelCooperated, setOriginalListPanelCooperated] = useState<IListCooperatedPanel[]>([]);
    const [movimentDatePanelCooperated, setMovimentDatePanelCooperated] = useState<string>();
    const [dataPanelCooperated, setDataPanelCooperated] = useState<ISearchAllReportsCatalog>();
    const [openDrawerFilter, setOpenDrawerFilter] = useState(false);
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);
    const [openModalClient, setOpenModalClient] = useState(false);
    const [idExtClient, setIdExtClient] = useState<number>();
    const [openDrawerGraphics, setOpenDrawerGraphics] = useState(false);

    const {
        getInfoError,
        theme,
        toggleStatusBackdrop,
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
    } = useForm<BusinessPanelCooperatedProps | any>({
        resolver: yupResolver(validationSchema),
    });

    const filterClientAgenciesWatch = watch("filter_client_agencies");
    const filterClientPortfolioWatch = watch("filter_client_portfolio");
    const filterClientProfileWatch = watch("filter_client_profile");
    const filterClientTypeWatch = watch("filter_client_type");
    const filterClientMaritalWatch = watch("filter_client_marital");
    const filterClientGenderWatch = watch("filter_client_gender");
    const filterClientStatusAccountWatch = watch("filter_client_cc_sitconta");
    const filterClientIsRuralWatch = watch("filter_client_is_rural");
    const filterClientIsCooperatedWatch = watch("filter_client_is_cooperated");
    const filterClientIsEmployeeWatch = watch("filter_client_is_employee");
    const filterClientInMigrationWatch = watch("filter_client_in_migration");
    const filterClientDocumentWatch = watch("filter_client_document");
    const filterIDClientWatch = watch("filter_id_client");

    useEffect(() => {
        const fetchData = async (params: SearchCooperatedPanelProps = {}) => {
            try {
                toggleStatusBackdrop();
                setLoading(true);

                const [responseCooperatedPanel, responseAllReports] = await Promise.all([
                    searchReportsCatalogCooperatedPanel(params),
                    searchAllReportsCatalogRecords({ route: currentPath }),
                ]);

                const { painel_cooperados, data_movimento } = responseCooperatedPanel;
                const dataPanelCooperated = responseAllReports[0];

                setOriginalListPanelCooperated(painel_cooperados);
                setListPanelCooperated(painel_cooperados);

                setMovimentDatePanelCooperated(data_movimento);
                setDataPanelCooperated(dataPanelCooperated);
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

                    setValue("filter_client_is_cooperated", {
                        id: true,
                        label: "💚 Sim",
                    });
                }
            }
        }
    }, [dataPanelCooperated]);

    const handleOpenModalClient = () => {
        setOpenModalClient((oldValue) => !oldValue);
    };

    const handleOpenDrawerGraphics = () => {
        setOpenDrawerGraphics((oldValue) => !oldValue);
        setSpeedDialOpen(true);
    };

    const handleFilterPanelCooperated = () => {
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
        const filteredData = originalListPanelCooperated.filter((item) => {
            return (
                (!filters.filter_client_agencies ||
                    filters.filter_client_agencies.length === 0 ||
                    filters.filter_client_agencies.some((selected) => item.agencia_nome === selected)) &&
                (!filters.filter_client_portfolio ||
                    filters.filter_client_portfolio.length === 0 ||
                    filters.filter_client_portfolio.some((selected) => item.carteira_nome === selected)) &&
                (!filters.filter_client_profile ||
                    filters.filter_client_profile.length === 0 ||
                    filters.filter_client_profile.some((selected) => item.cliente_perfil === selected)) &&
                (!filters.filter_client_type ||
                    filters.filter_client_type.length === 0 ||
                    filters.filter_client_type.some((selected) => item.cliente_tipo === selected)) &&
                (!filters.filter_client_marital ||
                    filters.filter_client_marital.length === 0 ||
                    filters.filter_client_marital.some((selected) => item.cliente_estadocivl === selected)) &&
                (!filters.filter_client_cc_sitconta ||
                    filters.filter_client_cc_sitconta.length === 0 ||
                    filters.filter_client_cc_sitconta.some((selected) =>
                        selected === "NULL" ? item.cc_sitconta === null : item.cc_sitconta === selected,
                    )) &&
                (!filters.filter_client_gender ||
                    filters.filter_client_gender.length === 0 ||
                    filters.filter_client_gender.some((selected) => item.cliente_sexo === selected)) &&
                (filters.filter_client_is_rural === null || item.e_rural === Boolean(filters.filter_client_is_rural)) &&
                (filters.filter_client_is_cooperated === null ||
                    item.e_cooperado === Boolean(filters.filter_client_is_cooperated)) &&
                (filters.filter_client_is_employee === null ||
                    item.e_funcionario === Boolean(filters.filter_client_is_employee)) &&
                (filters.filter_client_in_migration === null ||
                    item.em_migracao_carteira === Boolean(filters.filter_client_in_migration)) &&
                (!filters.filter_client_document ||
                    String(item.cliente_documento).includes(
                        String(filters.filter_client_document.replace(/[\.\-\/]/g, "")),
                    )) &&
                (!filters.filter_id_client ||
                    String(item.id).includes(String(filters.filter_id_client.replace(/[\.\-\/]/g, ""))))
            );
        });

        setListPanelCooperated(filteredData);
    };

    useEffect(() => {
        const filtersWatch = {
            filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_portfolio: filterClientPortfolioWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_profile: filterClientProfileWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_type: filterClientTypeWatch?.map((item: { label: string }) => item.label) || [],
            filter_client_marital: filterClientMaritalWatch?.map((item: { id: string }) => item.id) || [],
            filter_client_gender: filterClientGenderWatch?.map((item: { id: string }) => item.id) || [],
            filter_client_cc_sitconta: filterClientStatusAccountWatch?.map((item: { id: string }) => item.id) || [],
            filter_client_is_rural: filterClientIsRuralWatch?.id !== undefined ? filterClientIsRuralWatch?.id : null,
            filter_client_is_cooperated:
                filterClientIsCooperatedWatch?.id !== undefined ? filterClientIsCooperatedWatch?.id : null,
            filter_client_is_employee:
                filterClientIsEmployeeWatch?.id !== undefined ? filterClientIsEmployeeWatch?.id : null,
            filter_client_in_migration:
                filterClientInMigrationWatch?.id !== undefined ? filterClientInMigrationWatch?.id : null,
            filter_client_document: filterClientDocumentWatch || null,
            filter_id_client: filterIDClientWatch || null,
        };

        applyFilters(filtersWatch);
    }, [
        filterClientAgenciesWatch,
        filterClientPortfolioWatch,
        filterClientProfileWatch,
        filterClientTypeWatch,
        filterClientMaritalWatch,
        filterClientGenderWatch,
        filterClientStatusAccountWatch,
        filterClientIsRuralWatch,
        filterClientIsCooperatedWatch,
        filterClientIsEmployeeWatch,
        filterClientInMigrationWatch,
        filterClientDocumentWatch,
        filterIDClientWatch,
    ]);

    const filters = {
        filter_client_agencies: filterClientAgenciesWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_portfolio: filterClientPortfolioWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_profile: filterClientProfileWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_type: filterClientTypeWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_marital: filterClientMaritalWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_gender: filterClientGenderWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_cc_sitconta: filterClientStatusAccountWatch?.map((item: { label: string }) => item.label) || [],
        filter_client_is_rural: filterClientIsRuralWatch?.label,
        filter_client_is_cooperated: filterClientIsCooperatedWatch?.label,
        filter_client_is_employee: filterClientIsEmployeeWatch?.label,
        filter_client_in_migration: filterClientInMigrationWatch?.label,
        filter_client_document: filterClientDocumentWatch,
        filter_id_client: filterIDClientWatch,
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
        filter_client_in_migration: "Em Migração",
        filter_client_document: "CPF/CNPJ",
        filter_id_client: "ID Cooperado",
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
            filter_client_in_migration: null,
            filter_client_document: null,
            filter_id_client: null,
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
                            onClick={handleFilterPanelCooperated}>
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
            field: "id",
            headerName: "ID",
            minWidth: 85,
            flex: 1,
        },
        {
            field: "cliente_nome",
            headerName: "Nome",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "cliente_fantasia",
            headerName: "Nome Fantasia",
            minWidth: 150,
        },
        {
            field: "cliente_documento",
            headerName: "CPF/CNPJ",
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
            width: 100,
        },
        {
            field: "cliente_tipo",
            headerName: "Tipo",
            width: 60,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "cliente_sexo",
            headerName: "Gênero",
            width: 110,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "cliente_estadocivl",
            headerName: "Estado Civil",
            width: 140,
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
            field: "e_funcionario",
            headerName: "É Funcionário",
            width: 100,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                return <Typography color={value ? "error.light" : "success.light"}>{value ? "Sim" : "Não"}</Typography>;
            },
        },
        {
            field: "em_migracao_carteira",
            headerName: "Em Migração",
            width: 100,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }: any) => {
                return <Typography>{value ? "🔄 Sim" : "❎ Não"}</Typography>;
            },
        },
        {
            headerAlign: "center",
            field: "cc_sitconta",
            headerName: "Situação Conta Corrente",
            align: "center",
            width: 175,
            renderCell: ({ value }: any) => {
                return <Typography>{mapValueCurrentAccount(value)}</Typography>;
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
        {
            field: "cliente_relacionamento",
            headerName: "Início Relacionamento",
            minWidth: 155,
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
                            <Typography sx={{ color: "text.secondary" }}>{dataPanelCooperated?.title || ""}</Typography>
                        </Breadcrumbs>

                        {dataPanelCooperated && (
                            <CSATAverageRating
                                module={`Painel | ${dataPanelCooperated.title}`}
                                routePath={`${dataPanelCooperated.route}`}
                                isClickable
                                formProps={{
                                    module: `Painel | ${dataPanelCooperated.title}`,
                                    routePath: `${dataPanelCooperated.route}`,
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
                ) : dataPanelCooperated ? (
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
                                        backgroundImage: dataPanelCooperated.background_color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "1.5rem",
                                        fontWeight: "bold",
                                        position: "relative",
                                    }}>
                                    <Tooltip title={dataPanelCooperated?.description || ""}>
                                        <Box
                                            position='absolute'
                                            top={5}
                                            left={8}
                                            color='white'
                                            padding='4px 8px'
                                            borderRadius='4px'>
                                            <Icon>{dataPanelCooperated.label_icon}</Icon>
                                        </Box>
                                    </Tooltip>
                                    {movimentDatePanelCooperated && (
                                        <Tooltip
                                            title={`Data de atualização da base de cooperados do dia: ${formatDate(
                                                movimentDatePanelCooperated,
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
                                                    {movimentDatePanelCooperated &&
                                                        formatDate(movimentDatePanelCooperated, "DD/MM/YYYY")}
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
                                            {listPanelCooperated &&
                                                formatNumberWithThousandsSeparator(listPanelCooperated.length)}
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
                                        rows={listPanelCooperated}
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
                closeButton={handleFilterPanelCooperated}
                onClose={handleFilterPanelCooperated}
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

                        <Grid item xs={12} md={6}>
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
                                    { id: "União Estável", label: "União Estável" },
                                    { id: "Não informado", label: "Não informado" },
                                    { id: "Não se Aplica", label: "Não se Aplica" },
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
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
                                    { id: "Não se Aplica", label: "Não se Aplica" },
                                ]}
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
                                    { id: true, label: "💚 Sim" },
                                    { id: false, label: "🟠 Não" },
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

                        <Grid item xs={12} md={4}>
                            <FormInput
                                fullWidth
                                label='ID'
                                name='filter_id_client'
                                type='number'
                                size='medium'
                                variant='outlined'
                                control={control}
                                errors={errors}
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
                                        filter_client_profile: [],
                                        filter_client_type: [],
                                        filter_client_marital: [],
                                        filter_client_gender: [],
                                        filter_client_cc_sitconta: [],
                                        filter_client_is_rural: null,
                                        filter_client_is_cooperated: null,
                                        filter_client_is_employee: null,
                                        filter_client_in_migration: null,
                                        filter_client_document: null,
                                        filter_id_client: null,
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
                    zIndex: 999,
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
                title='Dashboards | Meus Cooperados'
                closeButton={handleOpenDrawerGraphics}
                onClose={handleOpenDrawerGraphics}
                disableEscapeKeyDown={false}
                open={openDrawerGraphics}
                ModalProps={{
                    BackdropProps: { style: { backgroundColor: "transparent" } },
                }}
                sx={{
                    zIndex: 1000,
                    "& .MuiDrawer-paperAnchorRight": {
                        width: isMobile ? "100%" : "90%",
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
                <Box padding={2} mt={-2}>
                    <ChartsBusinessPanelCooperated
                        dataChart={listPanelCooperated}
                        colorBorderSystem={colorBorderSystem}
                        themeContext={theme}
                    />
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
                            handleFilterPanelCooperated();
                        },
                    },
                    {
                        icon: <DonutLargeOutlinedIcon color='action' />,
                        name: "Dashboards",
                        click_event: () => {
                            handleOpenDrawerGraphics();
                        },
                    },
                ]}
                sx={{
                    zIndex: 9999,
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
