import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton } from "@mui/lab";
import {
    Badge,
    Box,
    Breadcrumbs,
    CardContentProps,
    Chip,
    Grid,
    IconButton,
    Modal,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
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
import BasicMenu from "@/components/BasicMenu/BasicMenu";
import FormDatePicker from "@/components/FormComponents/FormDatePicker";
import { toast } from "react-toastify";
import { BoxMain } from "@/components/Box/BoxMain";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { useGlobal } from "@/contexts/GlobalContext";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { formatDate } from "@/functions/date";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { CardTotalized } from "@/components/Card/CardTotalized";
import { formatCnpjCpf, isValidCNPJ, isValidCPF } from "@/functions/number";
import { searchAutoCompleteEmployees } from "@/services/employees";
import { useAuth } from "@/contexts/AuthContext";
import { searchAllAccessPermissionGroup } from "@/services/access-groups";
import { EditPortfoliosMigration, PortfoliosMigrationFields } from "./PortfoliosMigrationFields";
import { ArrayTypeStatusValidation } from "@/constants/array-type-status-validation-portfolios-migration";
import { ArrayTypeStatusFinished } from "@/constants/array-type-status-finished-portfolios-migration";
import {
    changeIsActivePortfoliosMigration,
    getDashboardPortfoliosMigrationTotalizer,
    IDashboardPortfoliosMigration,
    ISearchListPortfoliosMigration,
    searchListPortfoliosMigration,
    synchronizePortfoliosMigration,
} from "@/services/portfolios-management";
import { AuditPortfoliosMigration } from "./modal-interactions/AuditPortfoliosMigration";
import { TimelineHistoryPortfoliosMigration } from "./modal-interactions/HistoryPortfoliosMigration";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";
import { ArrayTypesStatus } from "@/constants/array-status";
import { ValidationPortfoliosMigration } from "./modal-interactions/ValidationPortfoliosMigration";
import { statusMap } from "@/constants/map-status";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import WalletOutlinedIcon from "@mui/icons-material/WalletOutlined";
import CloudSyncOutlinedIcon from "@mui/icons-material/CloudSyncOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import moment from "moment";
import FormInputCpfCnpj from "@/components/FormComponents/FormInputCpfCnpj";
import { CSATAverageRating } from "@/components/CSATAssessments/CSATAverageRating";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";
import { formatNumberWithThousandsSeparator } from "@/functions/number";

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

type PermissionProps = {
    group: string;
};

type RowsProps = {
    id: number;
    is_active: boolean;
};

export type PortfoliosMigrationProps = {
    status_finished?: AutoCompleteString;
    status_validation_destiny?: AutoCompleteString;
    collaborators?: AutoCompleteNumber;
    date_search?: AutoCompleteString;
    date_start?: Date | null;
    date_end?: Date | null;
    is_active?: AutoCompleteBoolean;
    client_document?: string | null;
};

interface Filters {
    status_finished?: string;
    status_validation_destiny?: string;
    collaborators?: string;
    date_search?: string;
    date_start?: string;
    date_end?: string;
    is_active?: string;
    client_document?: string;
}

interface FilterAppliedProps {
    filters: Filters;
    clearAllFilters: () => void;
    removeFilter: (key: keyof Filters) => void;
}

const styleOfCard: CardContentProps = {
    sx: {
        display: "flex",
        flexDirection: "column-reverse",
        justifyContent: "center",
        alignItems: "center",
    },
};

const arrayTypeDateSearch = [
    { id: "created_at", label: "Data Criação" },
    { id: "status_validation_destiny", label: "Data Validação Destino" },
    { id: "date_finished", label: "Data Finalização" },
];

const validationSchema = Yup.object().shape(
    {
        status_finished: Yup.object()
            .shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            })
            .nullable(),
        status_validation_destiny: Yup.object()
            .shape({
                id: Yup.string().nullable(),
                label: Yup.string().nullable(),
            })
            .nullable(),
        collaborators: Yup.object()
            .shape({
                id: Yup.number().nullable(),
                label: Yup.string().nullable(),
            })
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
        is_active: Yup.object()
            .shape({
                id: Yup.boolean().nullable(),
                label: Yup.string().nullable(),
            })
            .nullable(),
        client_document: Yup.string().max(18, "Máximo 18 caracteres").trim().nullable(),
    },
    [["date_start", "date_end"]],
);

export function ListRecordsPortfoliosMigration() {
    const [loading, setLoading] = useState(false);
    const [dashboardPortfoliosMigration, setDashboardPortfoliosMigration] = useState<IDashboardPortfoliosMigration>();
    const [listPortfoliosMigration, setListPortfoliosMigration] = useState<ISearchListPortfoliosMigration[]>([]);
    const [autoCompleteEmployees, setAutoCompleteEmployees] = useState<AutoCompleteNumber[]>([]);
    const [openModalHistoryPortfoliosMigration, setOpenModalHistoryPortfoliosMigration] = useState(false);
    const [openModalAuditPortfoliosMigration, setOpenModalPortfoliosMigration] = useState(false);
    const [openDrawerEdit, setOpenDrawerEdit] = useState(false);
    const [openDrawerFilter, setOpenDrawerFilter] = useState(false);
    const [openDrawerValidation, setOpenDrawerValidation] = useState(false);
    const [idPortfoliosMigration, setIDPortfoliosMigration] = useState<number>();
    const [accessPermission, setAccessPermission] = useState<PermissionProps[]>([]);
    const [permissionPortfoliosMigration, setPermissionPortfoliosMigration] = useState<boolean>(false);
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);

    const { getInfoError, theme, colorBorderSystem, colorBackgroundSystem, colorScrollSystem, redBlur, cyanBlur } =
        useGlobal();
    const navigate = useNavigate();
    const confirm = useConfirm();

    const { user } = useAuth();
    const themeBreakPoint = useTheme();
    const isMobile = useMediaQuery(themeBreakPoint.breakpoints.down("sm"));
    const isThemeLight = theme === "light";

    const {
        handleSubmit,
        control,
        reset,
        setValue,
        setError,
        watch,
        clearErrors,
        formState: { errors },
    } = useForm<PortfoliosMigrationProps | any>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            status_finished: { id: "PENDENTE", label: "🟡 Pendente" },
            date_search: { id: "created_at", label: "Data Criação" },
            date_start: null,
            date_end: null,
            is_active: { id: true, label: "🟢 Ativo(a)" },
            client_document: null,
        },
    });

    const QuickSearchToolbar = () => {
        return (
            <Grid sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
                <Grid>
                    <GridToolbarColumnsButton />
                    <GridToolbarFilterButton />
                    <GridToolbarDensitySelector />

                    {accessPermission.some(
                        (value) =>
                            value.group === "GROUP_AUDITOR_PORTFOLIOS_MANAGEMENT" || value.group === "GROUP_ADMIN",
                    ) && <GridToolbarExport />}
                </Grid>

                <GridToolbarQuickFilter placeholder='Digite para pesquisar' />
            </Grid>
        );
    };

    const filters = {
        status_finished: watch("status_finished")?.label,
        status_validation_destiny: watch("status_validation_destiny")?.label,
        collaborators: watch("collaborators")?.label,
        date_search: watch("date_search")?.label,
        date_start: watch("date_start") ? moment(watch("date_start")).format("DD/MM/YYYY") : undefined,
        date_end: watch("date_end") ? moment(watch("date_end")).format("DD/MM/YYYY") : undefined,
        is_active: watch("is_active")?.label,
        client_document: watch("client_document"),
    };

    const labelsMap = {
        status_finished: "Status Finalização",
        status_validation_destiny: "Status Validação",
        collaborators: "Criado por",
        date_search: "Buscar por",
        date_start: "Data Inicial",
        date_end: "Data Final",
        is_active: "Situação",
        client_document: "Documento",
    };

    const clearAllFilters = () => {
        reset({
            status_finished: null,
            status_validation_destiny: null,
            collaborators: null,
            date_search: null,
            date_start: null,
            date_end: null,
            is_active: null,
            client_document: null,
        });
        handleRefresh();
    };

    const removeFilter = (key: keyof Filters) => {
        setValue(key, null);
        watch(key);
        handleRefresh();
    };

    const FilterApplied = ({ filters, clearAllFilters, removeFilter }: FilterAppliedProps) => {
        const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== null);

        if (!hasActiveFilters) {
            return null;
        }

        return (
            <Stack direction='row' alignItems='center' flexWrap='wrap' gap={1}>
                {Object.entries(filters).map(([key, value]) => {
                    if (value !== undefined && value !== null && value.length > 0) {
                        return (
                            <Chip
                                key={key}
                                label={
                                    <>
                                        <Typography
                                            component={"span"}
                                            fontSize={14}
                                            color={theme === "light" ? "info" : "primary"}>
                                            {labelsMap[key as keyof typeof labelsMap]}:
                                        </Typography>
                                        <Typography
                                            component={"span"}
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
                            onClick={handleFilterPortfoliosMigration}>
                            <FilterAltOutlinedIcon color={loading ? "disabled" : "primary"} />
                        </IconButton>
                    </Stack>
                )}
            </Stack>
        );
    };

    const handleRefresh = handleSubmit((params) => {
        onSubmit(params);
        toast.success("Atualização realizada com sucesso!");
    });

    function handleNewRegister() {
        navigate("/gestao-carteirizacao/migracao-carteira/minha-carteira/cadastrar");
    }

    const handleFilterPortfoliosMigration = () => {
        setOpenDrawerFilter((oldValue) => !oldValue);
        setSpeedDialOpen(true);
    };

    const handleValidationPortfoliosMigration = () => {
        setOpenDrawerValidation((oldValue) => !oldValue);
        setSpeedDialOpen(true);
    };

    const handleEditPortfoliosMigration = () => {
        setOpenDrawerEdit((oldValue) => !oldValue);
    };

    const handleModalAuditPortfoliosMigration = () => {
        setOpenModalPortfoliosMigration((oldValue) => !oldValue);
    };

    const handleHistoryPortfoliosMigration = () => {
        setOpenModalHistoryPortfoliosMigration((oldValue) => !oldValue);
    };

    const handlePermissionAuditPortfoliosMigration = (valueBooleanPermission: boolean) => {
        setPermissionPortfoliosMigration(valueBooleanPermission);
    };

    const handleSynchronizePortfoliosMigration = (row: RowsProps) => {
        confirm({
            title: (
                <Typography fontSize={16}>Deseja realmente sincronizar o registro de migração de carteira?</Typography>
            ),
            description: (
                <>
                    <Typography fontSize={14}>
                        O registro de Migração de Carteira passará por verificação na base de cooperados. <br /> Caso
                        sejam detectadas alterações nos campos de Agência e Carteira, os dados serão atualizados
                        automaticamente, e o status de finalização será alterado para: <br /> (❇️ Finalizado).
                    </Typography>
                </>
            ),
        })
            .then(async () => {
                try {
                    setLoading(true);
                    const resultUpdateRegisterClient = await synchronizePortfoliosMigration(row.id);

                    if (!resultUpdateRegisterClient.is_synchronized) {
                        setListPortfoliosMigration((prev) =>
                            prev.map((value) => {
                                if (value.id === row.id) {
                                    return {
                                        ...value,
                                        status_finished: "FINALIZADO",
                                        is_client: resultUpdateRegisterClient.is_client,
                                        client_is_rural: resultUpdateRegisterClient.client_is_rural,
                                        client_date_movement: moment(
                                            resultUpdateRegisterClient.client_date_movement,
                                        ).format("YYYY-MM-DD"),
                                        client_name: resultUpdateRegisterClient.client_name,
                                        client_agency_name: resultUpdateRegisterClient.client_agency_name,
                                        client_portfolio_name: resultUpdateRegisterClient.client_portfolio_name,
                                        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                                    };
                                }
                                return value;
                            }),
                        );

                        searchDashboardPortfoliosMigration();

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

    const handleChangeIsActive = (row: RowsProps) => {
        confirm({
            title: `Deseja realmente ${!row.is_active ? "Ativar" : "Inativar"} o registro?`,
            description: (
                <>
                    <Typography fontSize={16}>O registro de Migração sofrerá alteração em sua situação</Typography>

                    {!row.is_active ? null : (
                        <Typography mt={1} fontSize={16}>
                            A situação da migração será alterado para: 🔴 Inativo
                        </Typography>
                    )}
                </>
            ),
        })
            .then(async () => {
                try {
                    setLoading(true);

                    await changeIsActivePortfoliosMigration(row.id, {
                        is_active: !row.is_active,
                    });

                    setListPortfoliosMigration((prev) =>
                        prev.map((value) => {
                            if (value.id === row.id) {
                                return {
                                    ...value,
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
                                value.group === "GROUP_AUDITOR_PORTFOLIOS_MANAGEMENT" || value.group === "GROUP_ADMIN",
                        )
                    ) {
                        setListPortfoliosMigration((prev) =>
                            prev.filter((productivityDaily) => productivityDaily.id !== row.id),
                        );
                    }

                    searchDashboardPortfoliosMigration();

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

    const onSubmit = async (params: PortfoliosMigrationProps) => {
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

        if (params.status_finished && Object.keys(params.status_finished).length > 0) {
            refactor = { ...refactor, status_finished: params.status_finished?.id };
        }

        if (params.status_validation_destiny && Object.keys(params.status_validation_destiny).length > 0) {
            refactor = { ...refactor, status_validation_destiny: params.status_validation_destiny?.id };
        }

        if (params.collaborators && Object.keys(params.collaborators).length > 0) {
            refactor = { ...refactor, created_by_id: params.collaborators?.id };
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

        if (params.is_active && Object.keys(params.is_active).length > 0) {
            refactor = { ...refactor, is_active: params.is_active?.id };
        }

        if (clientDocumentReplaced) {
            refactor = { ...refactor, client_document: clientDocumentReplaced };
        }

        try {
            setLoading(true);

            const data = await searchListPortfoliosMigration(refactor);

            setListPortfoliosMigration(data);

            searchDashboardPortfoliosMigration();
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

    async function searchDashboardPortfoliosMigration() {
        try {
            const dataDashboard = await getDashboardPortfoliosMigrationTotalizer({ is_active: true });

            setDashboardPortfoliosMigration(dataDashboard);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    }

    function editPortfoliosMigrationModal(params: EditPortfoliosMigration) {
        setListPortfoliosMigration((prev) => {
            const newPortfoliosMigration = prev;
            return newPortfoliosMigration.map((value) => {
                if (idPortfoliosMigration == value.id) {
                    value = {
                        ...value,
                        ...params,
                    };
                }
                return value;
            });
        });

        searchDashboardPortfoliosMigration();
    }

    function editPortfoliosMigrationValidation(params: EditPortfoliosMigration) {
        setListPortfoliosMigration((prev) => {
            const newPortfoliosMigration = prev;
            return newPortfoliosMigration.map((value) => {
                if (value.id == params.id) {
                    value = {
                        ...value,
                        ...params,
                    };
                }
                return value;
            });
        });

        searchDashboardPortfoliosMigration();
    }

    const setValueOptions = async () => {
        try {
            setLoading(true);

            const [dataUserPermission, listPortfoliosMigration, dashboardPortfoliosMigration, autoCompleteEmployees] =
                await Promise.all([
                    searchAllAccessPermissionGroup(),
                    searchListPortfoliosMigration({ is_active: true, status_finished: "PENDENTE" }),
                    getDashboardPortfoliosMigrationTotalizer({ is_active: true }),
                    searchAutoCompleteEmployees({ is_active: true }),
                ]);

            const refEmployees = autoCompleteEmployees.map(({ id, name }) => ({
                id: id,
                label: name,
            }));

            setAccessPermission(dataUserPermission);
            setListPortfoliosMigration(listPortfoliosMigration);
            setDashboardPortfoliosMigration(dashboardPortfoliosMigration);
            setAutoCompleteEmployees(refEmployees);

            return dataUserPermission;
        } catch (error) {
            const { message } = await getInfoError(error);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const loadedOptions = await setValueOptions();

            if (loadedOptions && loadedOptions.length > 0) {
                if (user) {
                    if (
                        !loadedOptions.some(
                            (value) =>
                                value.group === "GROUP_ADMIN" ||
                                value.group === "GROUP_AUDITOR_PORTFOLIOS_MANAGEMENT" ||
                                value.group === "GROUP_MANAGER_PORTFOLIOS_MANAGEMENT",
                        )
                    ) {
                        setValue("collaborators", { id: user?.id_employee, label: user?.name });
                    } else {
                        return;
                    }
                }
            }
        };

        fetchData();
    }, []);

    const columns: GridColDef[] = [
        {
            field: "Opções",
            width: 70,
            headerAlign: "center",
            align: "center",
            renderCell: (cellValues) => {
                const status = cellValues.row.status_finished;

                return (
                    <Stack direction='row'>
                        {accessPermission.some(
                            (value) =>
                                value.group === "GROUP_AUDITOR_PORTFOLIOS_MANAGEMENT" || value.group === "GROUP_ADMIN",
                        ) ? (
                            <>
                                {user && (
                                    <BasicMenu
                                        actions={[
                                            {
                                                action: () => {
                                                    handleModalAuditPortfoliosMigration();
                                                    setIDPortfoliosMigration(cellValues.row.id);
                                                    handlePermissionAuditPortfoliosMigration(true);
                                                },
                                                icon: <RuleOutlinedIcon color='success' />,
                                                name: "Auditoria",
                                            },
                                            {
                                                action: () => {
                                                    handleHistoryPortfoliosMigration();
                                                    setIDPortfoliosMigration(cellValues.row.id);
                                                },
                                                icon: <HistoryOutlinedIcon />,
                                                name: "Histórico",
                                            },
                                            {
                                                action: () => {
                                                    handleSynchronizePortfoliosMigration(cellValues.row);
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
                            </>
                        ) : (
                            <>
                                {["CORREÇÃO"].includes(status) ? (
                                    <>
                                        {user && user.id_user === cellValues.row.created_by_id ? (
                                            <BasicMenu
                                                actions={[
                                                    {
                                                        action: () => {
                                                            handleHistoryPortfoliosMigration();
                                                            setIDPortfoliosMigration(cellValues.row.id);
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
                                                            handleModalAuditPortfoliosMigration();
                                                            setIDPortfoliosMigration(cellValues.row.id);
                                                            handlePermissionAuditPortfoliosMigration(false);
                                                        },
                                                        icon: <VisibilityOutlinedIcon color='success' />,
                                                        name: "Visualizar",
                                                    },
                                                    {
                                                        action: () => {
                                                            handleHistoryPortfoliosMigration();
                                                            setIDPortfoliosMigration(cellValues.row.id);
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
                                                            handleModalAuditPortfoliosMigration();
                                                            setIDPortfoliosMigration(cellValues.row.id);
                                                            handlePermissionAuditPortfoliosMigration(false);
                                                        },
                                                        icon: <VisibilityOutlinedIcon color='success' />,
                                                        name: "Visualizar",
                                                    },
                                                    {
                                                        action: () => {
                                                            handleHistoryPortfoliosMigration();
                                                            setIDPortfoliosMigration(cellValues.row.id);
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
                                                            handleModalAuditPortfoliosMigration();
                                                            setIDPortfoliosMigration(cellValues.row.id);
                                                            handlePermissionAuditPortfoliosMigration(false);
                                                        },
                                                        icon: <VisibilityOutlinedIcon color='warning' />,
                                                        name: "Visualizar",
                                                    },
                                                    {
                                                        action: () => {
                                                            handleHistoryPortfoliosMigration();
                                                            setIDPortfoliosMigration(cellValues.row.id);
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
                            </>
                        )}
                    </Stack>
                );
            },
        },
        {
            field: "status_finished",
            headerName: "Status Finalização",
            minWidth: 126,
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{statusMap[value]}</Typography>;
            },
        },
        {
            field: "status_validation_destiny",
            headerName: "Status Validação Destino",
            minWidth: 126,
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{statusMap[value]}</Typography>;
            },
        },
        {
            field: "created_at",
            headerName: "Data Inclusão",
            minWidth: 130,
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{formatDate(value, "DD/MM/YYYY HH:mm")}</Typography>;
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
            headerName: "Data Movimento",
            minWidth: 120,
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
            minWidth: 180,
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
            headerName: "PA Origem",
            minWidth: 160,
            flex: 1,
            renderCell: (value) => {
                return (
                    <Typography fontSize={14} fontWeight={550} color='#009688'>
                        {value.row.client_agency_name}
                    </Typography>
                );
            },
        },
        {
            field: "client_portfolio_name",
            headerName: "Carteira Origem",
            minWidth: 130,
            flex: 1,
            renderCell: (value) => {
                return (
                    <Typography fontSize={14} fontWeight={600} color='#009688'>
                        {value.row.client_portfolio_name}
                    </Typography>
                );
            },
        },
        {
            field: "migration_type",
            headerName: "Tipo Migração",
            headerAlign: "center",
            align: "center",
            minWidth: 110,
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{value === "ENVIANDO" ? "Enviando🔸" : "Solicitando🔹"}</Typography>;
            },
        },
        {
            field: "new_client_agency_name",
            headerName: "PA Destino",
            minWidth: 160,
            flex: 1,
            renderCell: (value) => {
                return (
                    <Typography fontSize={14} fontWeight={600} color='#7DB61C'>
                        {value.row.new_client_agency_name}
                    </Typography>
                );
            },
        },
        {
            field: "new_client_portfolio_name",
            headerName: "Carteira Destino",
            minWidth: 130,
            flex: 1,
            renderCell: (value) => {
                return (
                    <Typography fontSize={14} fontWeight={600} color='#7DB61C'>
                        {value.row.new_client_portfolio_name}
                    </Typography>
                );
            },
        },
        {
            field: "observation",
            headerName: "Observação",
            minWidth: 120,
            flex: 1,
        },
        {
            field: "created_by_name",
            headerName: "Criado por",
            minWidth: 140,
            flex: 1,
        },
        {
            field: "creator_agency_name",
            headerName: "PA do usuário",
            minWidth: 140,
            flex: 1,
        },
        {
            field: "creator_portfolio_name",
            headerName: "Carteira do usuário",
            minWidth: 140,
            flex: 1,
        },
        {
            field: "manager_destiny_by_name",
            headerName: "Validado por",
            minWidth: 140,
            flex: 1,
        },
        {
            field: "date_validation_destiny",
            headerName: "Data Validação",
            minWidth: 130,
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{value ? formatDate(value, "DD/MM/YYYY HH:mm") : ""}</Typography>;
            },
        },
        {
            field: "audited_by_name",
            headerName: "Finalizado por",
            minWidth: 140,
            flex: 1,
        },
        {
            field: "date_finished",
            headerName: "Data Finalização",
            minWidth: 130,
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{value ? formatDate(value, "DD/MM/YYYY HH:mm") : ""}</Typography>;
            },
        },
        {
            field: "updated_at",
            headerName: "Data Atualização",
            minWidth: 140,
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography fontSize={14}>{value ? formatDate(value, "DD/MM/YYYY HH:mm") : ""}</Typography>;
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
    ];

    return (
        <>
            <Grid container spacing={1} justifyContent='center' paddingInline={2} mt={0} mb={0.75} wrap='wrap'>
                <Grid item xs={12} md={12} mb={-0.25}>
                    <Box display='flex' justifyContent='space-between' alignItems='center' width='100%'>
                        <Breadcrumbs aria-label='breadcrumb' separator='›'>
                            <Typography
                                color='text.primary'
                                sx={{ display: "inline-flex", alignItems: "center" }}
                                pt={1}>
                                <WalletOutlinedIcon
                                    color='primary'
                                    sx={{ color: isThemeLight ? "#5e5e5e" : "#FFFFFF", mr: 0.5 }}
                                />
                                Gestão de Carteirização
                            </Typography>
                            <Typography color='text.secondary'>Migração de Carteira</Typography>
                        </Breadcrumbs>

                        <CSATAverageRating
                            module={"Migração de Carteira"}
                            routePath={"/gestao-carteirizacao/migracao-carteira"}
                            isClickable
                            formProps={{
                                module: "Migração de Carteira",
                                routePath: "/gestao-carteirizacao/migracao-carteira",
                            }}
                        />
                    </Box>
                </Grid>

                <CardTotalized
                    title={
                        dashboardPortfoliosMigration?.waiting && dashboardPortfoliosMigration?.total
                            ? "Migrações aguardando validação do gerente | Representa " +
                              (
                                  (dashboardPortfoliosMigration?.waiting / dashboardPortfoliosMigration?.total) *
                                  100
                              ).toFixed(2) +
                              "% do Total"
                            : "Migrações aguardando validação do gerente | 0%"
                    }
                    color='#FFA47B'
                    colorValue='#FFA47B'
                    totalized={
                        formatNumberWithThousandsSeparator(dashboardPortfoliosMigration?.waiting ?? 0) +
                        " | " +
                        String(
                            dashboardPortfoliosMigration?.waiting && dashboardPortfoliosMigration?.total
                                ? (
                                      (dashboardPortfoliosMigration?.waiting / dashboardPortfoliosMigration?.total) *
                                      100
                                  ).toFixed(2) + "%"
                                : "0%",
                        )
                    }
                    name='🟠 Aguardando'
                    xs={12}
                    sm={12}
                    md={2}
                    cardProps={{
                        sx: {
                            height: 80,
                            borderRadius: "16px",
                            boxShadow: "none",
                            background: theme === "light" ? "#ffffff" : "linear-gradient(135deg, #041518, #07262b)",
                        },
                    }}
                    cardContentProps={styleOfCard}
                    valueProps={{
                        color: "GrayText",
                        fontSize: 18,
                        variant: "h1",
                    }}
                />

                <CardTotalized
                    title={
                        dashboardPortfoliosMigration?.pending && dashboardPortfoliosMigration?.total
                            ? "Migrações pendentes de Auditoria | Representa " +
                              (
                                  (dashboardPortfoliosMigration?.pending / dashboardPortfoliosMigration?.total) *
                                  100
                              ).toFixed(2) +
                              "% do Total"
                            : "0%"
                    }
                    color='#FDE68C'
                    colorValue='#FDE68C'
                    totalized={
                        formatNumberWithThousandsSeparator(dashboardPortfoliosMigration?.pending ?? 0) +
                        " | " +
                        String(
                            dashboardPortfoliosMigration?.pending && dashboardPortfoliosMigration?.total
                                ? (
                                      (dashboardPortfoliosMigration?.pending / dashboardPortfoliosMigration?.total) *
                                      100
                                  ).toFixed(2) + "%"
                                : "0%",
                        )
                    }
                    name='🟡 Pendentes'
                    xs={12}
                    sm={6}
                    md={2}
                    cardProps={{
                        sx: {
                            height: 80,
                            borderRadius: "16px",
                            boxShadow: "none",
                            background: theme === "light" ? "#ffffff" : "linear-gradient(135deg, #041518, #07262b)",
                        },
                    }}
                    cardContentProps={styleOfCard}
                    valueProps={{
                        color: "GrayText",
                        fontSize: 18,
                        variant: "h1",
                    }}
                />

                <CardTotalized
                    title={
                        dashboardPortfoliosMigration?.finished && dashboardPortfoliosMigration?.total
                            ? "Migrações em finalização (Alteração realizada na base do Sisbr) | Representa " +
                              (
                                  (dashboardPortfoliosMigration?.finished / dashboardPortfoliosMigration?.total) *
                                  100
                              ).toFixed(2) +
                              "% do Total"
                            : "Migrações em finalização | 0%"
                    }
                    color='#66E4A6'
                    colorValue='#66E4A6'
                    totalized={
                        formatNumberWithThousandsSeparator(dashboardPortfoliosMigration?.finished ?? 0) +
                        " | " +
                        String(
                            dashboardPortfoliosMigration?.finished && dashboardPortfoliosMigration?.total
                                ? (
                                      (dashboardPortfoliosMigration?.finished / dashboardPortfoliosMigration?.total) *
                                      100
                                  ).toFixed(2) + "%"
                                : "0%",
                        )
                    }
                    name='❇️ Finalizados'
                    xs={12}
                    sm={6}
                    md={2}
                    cardProps={{
                        sx: {
                            height: 80,
                            borderRadius: "16px",
                            boxShadow: "none",
                            background: theme === "light" ? "#ffffff" : "linear-gradient(135deg, #041518, #07262b)",
                        },
                    }}
                    cardContentProps={styleOfCard}
                    valueProps={{
                        color: "GrayText",
                        fontSize: 18,
                        variant: "h1",
                    }}
                />

                <CardTotalized
                    title={
                        dashboardPortfoliosMigration?.approved && dashboardPortfoliosMigration?.total
                            ? "Migrações aprovadas pelo Auditor | Representa " +
                              (
                                  (dashboardPortfoliosMigration?.approved / dashboardPortfoliosMigration?.total) *
                                  100
                              ).toFixed(2) +
                              "% do Total"
                            : "Migrações aprovadas pelo Auditor | 0%"
                    }
                    color='#66E4A6'
                    colorValue='#66E4A6'
                    totalized={
                        formatNumberWithThousandsSeparator(dashboardPortfoliosMigration?.approved ?? 0) +
                        " | " +
                        String(
                            dashboardPortfoliosMigration?.approved && dashboardPortfoliosMigration?.total
                                ? (
                                      (dashboardPortfoliosMigration?.approved / dashboardPortfoliosMigration?.total) *
                                      100
                                  ).toFixed(2) + "%"
                                : "0%",
                        )
                    }
                    name='🟢 Aprovados'
                    xs={12}
                    sm={6}
                    md={2.5}
                    cardProps={{
                        sx: {
                            height: 80,
                            borderRadius: "16px",
                            boxShadow: "none",
                            background: theme === "light" ? "#ffffff" : "linear-gradient(135deg, #041518, #07262b)",
                        },
                    }}
                    cardContentProps={styleOfCard}
                    valueProps={{
                        color: "GrayText",
                        fontSize: 18,
                        variant: "h1",
                    }}
                />

                <CardTotalized
                    title={
                        dashboardPortfoliosMigration?.failed && dashboardPortfoliosMigration?.total
                            ? "Migrações reprovadas pelo Auditor | Representa " +
                              (
                                  (dashboardPortfoliosMigration?.failed / dashboardPortfoliosMigration?.total) *
                                  100
                              ).toFixed(2) +
                              "% do Total"
                            : "Migrações reprovadas pelo Auditor | 0%"
                    }
                    color='#FB8382'
                    colorValue='#FB8382'
                    totalized={
                        formatNumberWithThousandsSeparator(dashboardPortfoliosMigration?.failed ?? 0) +
                        " | " +
                        String(
                            dashboardPortfoliosMigration?.failed && dashboardPortfoliosMigration?.total
                                ? (
                                      (dashboardPortfoliosMigration?.failed / dashboardPortfoliosMigration?.total) *
                                      100
                                  ).toFixed(2) + "%"
                                : "0%",
                        )
                    }
                    name='🔴 Reprovados'
                    xs={12}
                    sm={6}
                    md={2}
                    cardProps={{
                        sx: {
                            height: 80,
                            borderRadius: "16px",
                            boxShadow: "none",
                            background: theme === "light" ? "#ffffff" : "linear-gradient(135deg, #041518, #07262b)",
                        },
                    }}
                    cardContentProps={styleOfCard}
                    valueProps={{
                        color: "GrayText",
                        fontSize: 18,
                        variant: "h1",
                    }}
                />

                <CardTotalized
                    title='Não contabiliza os registros com situação: (🔴 Inativo)'
                    color='#BBA3DC'
                    colorValue='#BBA3DC'
                    totalized={formatNumberWithThousandsSeparator(dashboardPortfoliosMigration?.total ?? 0)}
                    name='Total'
                    xs={12}
                    sm={12}
                    md
                    cardProps={{
                        sx: {
                            height: 80,
                            borderRadius: "16px",
                            boxShadow: "none",
                            background: theme === "light" ? "#ffffff" : "linear-gradient(135deg, #041518, #07262b)",
                        },
                    }}
                    cardContentProps={styleOfCard}
                    valueProps={{
                        color: "GrayText",
                        fontSize: 18,
                        variant: "h1",
                    }}
                />
            </Grid>

            <BoxMain isDivider={false}>
                {Object.values(filters).some((value) => value !== undefined && value !== null) ? (
                    <>
                        <Grid
                            title='Filtro aplicado'
                            container
                            direction='row'
                            gap={1}
                            border={`1px dashed ${colorBorderSystem}`}
                            padding={1}
                            borderRadius={4}
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
                    <Grid item xs={12} mb={2} mt={-1}>
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
                    rows={listPortfoliosMigration}
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
                                client_sisbr_id: false,
                                observation: false,
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
                    getRowClassName={(params) => (params.row.is_active === false ? "inactive-row" : "")}
                    sx={{
                        ...getDataGridStyles(colorBorderSystem, colorScrollSystem),
                        "& .inactive-row": {
                            backgroundColor: theme === "light" ? "#fae1e3e6" : "#77050f63",
                            color: theme === "light" ? "#721c24" : "#f0cccf",
                        },
                    }}
                />
                <TemporaryDrawer
                    title='Filtro Listagem | Migração de Carteira'
                    closeButton={handleFilterPortfoliosMigration}
                    onClose={handleFilterPortfoliosMigration}
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
                        <Grid
                            container
                            component={"form"}
                            direction='row'
                            spacing={2}
                            onSubmit={handleSubmit(onSubmit)}>
                            <Grid item xs={12} md={12} mt={-2} mb={-1}>
                                <Typography
                                    color='primary'
                                    fontSize={12}
                                    sx={{ display: "inline-flex", alignItems: "center" }}>
                                    <FilterAltOutlinedIcon color='primary' sx={{ mr: 0.5 }} /> Filtros:
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormAutocomplete
                                    fullWidth
                                    title='Status Finalizado pelo time de Inteligência de Negócios'
                                    name='status_finished'
                                    label='Status Finalização'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                    options={ArrayTypeStatusFinished.filter((status) => status.id !== "CANCELADO")}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormAutocomplete
                                    fullWidth
                                    title='Status de Validação do Gestor Responsável de Destino'
                                    name='status_validation_destiny'
                                    label='Status Validação'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                    options={ArrayTypeStatusValidation.filter((status) => status.id !== "CANCELADO")}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormAutocomplete
                                    fullWidth
                                    name='collaborators'
                                    label='Criado por'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                    options={
                                        accessPermission &&
                                        !accessPermission.some(
                                            (value) =>
                                                value.group === "GROUP_ADMIN" ||
                                                value.group === "GROUP_AUDITOR_PORTFOLIOS_MANAGEMENT" ||
                                                value.group === "GROUP_MANAGER_PORTFOLIOS_MANAGEMENT",
                                        )
                                            ? autoCompleteEmployees.filter((employee) => employee.label === user?.name)
                                            : autoCompleteEmployees
                                    }
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormAutocomplete
                                    fullWidth
                                    name='date_search'
                                    label='Buscar por'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                    options={arrayTypeDateSearch}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
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

                            <Grid item xs={12} md={6}>
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

                            <Grid item xs={12} md={12}>
                                <FormAutocomplete
                                    fullWidth
                                    name='is_active'
                                    label='Situação'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                    options={ArrayTypesStatus}
                                />
                            </Grid>

                            <Grid item xs={12} md={12}>
                                <FormInputCpfCnpj
                                    fullWidth
                                    name='client_document'
                                    label='CPF ou CNPJ do Cooperado'
                                    placeholder='Digite um CPF ou CNPJ'
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
                                            status_finished: null,
                                            status_validation_destiny: null,
                                            collaborators: null,
                                            date_search: null,
                                            date_start: null,
                                            date_end: null,
                                            is_active: null,
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
                    title='Editar Migração de Carteira'
                    closeButton={handleEditPortfoliosMigration}
                    open={openDrawerEdit}
                    sx={{
                        "& .MuiDrawer-paperAnchorRight": {
                            width: isMobile ? "100%" : "80%",
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
                        <PortfoliosMigrationFields
                            p={3}
                            updateColumn={editPortfoliosMigrationModal}
                            idPortfoliosMigration={idPortfoliosMigration}
                        />
                    </Box>
                </TemporaryDrawer>

                <TemporaryDrawer
                    sx={{
                        width: "100%",
                        "& .MuiDrawer-paperAnchorRight": {
                            maxWidth: isMobile ? "94%" : "60%",
                            minWidth: isMobile ? "94%" : 500,
                            justifyContent: "center",
                            marginRight: "1rem",
                        },
                        "& .MuiModal-backdrop": {
                            backgroundColor: "rgb(0 0 0 / 20%)",
                        },
                        "& .MuiDrawer-paper": {
                            background: "#1b1b1b00",
                            boxShadow: "none",
                            overflow: "hidden",
                        },
                    }}
                    onClose={handleValidationPortfoliosMigration}
                    disableEscapeKeyDown={false}
                    open={openDrawerValidation}>
                    <ValidationPortfoliosMigration
                        onHandleModalChange={handleValidationPortfoliosMigration}
                        updateColumn={editPortfoliosMigrationValidation}
                        accessPermissionGroups={accessPermission}
                    />
                </TemporaryDrawer>

                <Modal sx={{ zIndex: 1300 }} open={openModalAuditPortfoliosMigration}>
                    <Box>
                        <AuditPortfoliosMigration
                            idPortfoliosMigration={idPortfoliosMigration}
                            permissionPortfoliosMigration={permissionPortfoliosMigration}
                            updateColumn={editPortfoliosMigrationModal}
                            handleClose={handleModalAuditPortfoliosMigration}
                        />
                    </Box>
                </Modal>

                <Modal open={openModalHistoryPortfoliosMigration}>
                    <TimelineHistoryPortfoliosMigration
                        idPortfoliosMigration={idPortfoliosMigration}
                        handleClose={handleHistoryPortfoliosMigration}
                    />
                </Modal>

                <BasicSpeedDial
                    ariaLabel='Opções'
                    title='Opções'
                    open={speedDialOpen}
                    onClick={() => setSpeedDialOpen((oldValue) => !oldValue)}
                    actions={[
                        {
                            icon: <AddCircleOutlineOutlinedIcon color='action' />,
                            name: "Migração de Carteira",
                            click_event: () => {
                                handleNewRegister();
                            },
                        },
                        {
                            icon: (
                                <Badge
                                    color='primary'
                                    badgeContent={
                                        Object.values(filters).filter(
                                            (value) => value !== undefined && value !== null && value !== "",
                                        ).length
                                    }
                                    max={100}>
                                    <FilterAltOutlinedIcon color='action' />
                                </Badge>
                            ),
                            name: "Filtros",
                            click_event: () => {
                                handleFilterPortfoliosMigration();
                            },
                        },
                        ...(accessPermission.some(
                            (value) =>
                                value.group === "GROUP_MANAGER_PORTFOLIOS_MANAGEMENT" ||
                                value.group === "GROUP_AUDITOR_PORTFOLIOS_MANAGEMENT" ||
                                value.group === "GROUP_ADMIN",
                        )
                            ? [
                                  {
                                      icon: (
                                          <Badge
                                              sx={{
                                                  "& .MuiBadge-badge": {
                                                      backgroundColor: "#f92f60",
                                                      color: "white",
                                                  },
                                              }}
                                              badgeContent={
                                                  dashboardPortfoliosMigration?.validation_count
                                                      ? dashboardPortfoliosMigration.validation_count
                                                      : 0
                                              }
                                              max={100}>
                                              <TaskAltIcon color='action' />
                                          </Badge>
                                      ),
                                      name: "Validação",
                                      click_event: () => {
                                          handleValidationPortfoliosMigration();
                                      },
                                  },
                              ]
                            : []),
                    ]}
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
