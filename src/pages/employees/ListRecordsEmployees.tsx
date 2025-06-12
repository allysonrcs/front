import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
    Badge,
    Box,
    Breadcrumbs,
    Chip,
    Grid,
    IconButton,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { DataGrid, GridColDef, GridToolbar, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { BoxMain } from "@/components/Box/BoxMain";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { ArrayTypesStatus } from "@/constants/array-status";
import { useGlobal } from "@/contexts/GlobalContext";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { EmployeesFields } from "./EmployeesFields";
import { formatDate } from "@/functions/date";
import { IAutocompleteSector, searchAutocompleteSector } from "@/services/sectors";
import { IAgenciesAutocomplete, searchAutocompleteAgencies } from "@/services/agencies";
import { ISearchEmployee, searchEmployee } from "@/services/employees";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { searchAutoCompleteCooperatives } from "@/services/cooperatives";
import { searchAutocompleteRole } from "@/services/roles";
import { ITeamAutocomplete, searchTeamAutocomplete } from "@/services/teams";
import { getBaseURL } from "@/functions/getBaseURL";
import BadgeAvatars from "@/components/AvatarWithBadge/AvatarWithBadge";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";

type AutoCompleteNumber = {
    id: number;
    label: string;
};

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

type EmployeeFilterProps = {
    cooperatives?: AutoCompleteNumber | null;
    agency?: AutoCompleteNumber | null;
    sector?: AutoCompleteNumber | null;
    team?: AutoCompleteNumber | null;
    role?: AutoCompleteNumber | null;
    active?: AutoCompleteBoolean | null;
};

export type UpdateColumnEmployeeProps = {
    id: number;
    people_name?: string;
    employee_email_corporate?: string;
    cooperative_name?: string;
    agency_name?: string | null;
    portfolio_name?: string | null;
    id_agency?: number;
    sector_name?: string | null;
    role_name?: string | null;
    team_name?: string | null;
    is_active?: boolean;
    created_at?: string;
};

interface Filters {
    cooperatives?: string;
    agency?: string;
    sector?: string;
    team?: string;
    role?: string;
    active?: string;
}

interface FilterAppliedProps {
    filters: Filters;
    clearAllFilters: () => void;
    removeFilter: (key: keyof Filters) => void;
}

export function ListRecordsEmployees() {
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
    const themeUi = useTheme();
    const navigate = useNavigate();

    const [arraySector, setArraySector] = useState<IAutocompleteSector[]>([]);
    const [arrayTeams, setArrayTeams] = useState<ITeamAutocomplete[]>([]);
    const [arrayCooperatives, setArrayCooperatives] = useState<AutoCompleteNumber[]>([]);
    const [arrayAgencies, setArrayAgencies] = useState<IAgenciesAutocomplete[]>([]);
    const [arrayRoles, setArrayRoles] = useState<AutoCompleteNumber[]>([]);
    const [loading, setLoading] = useState(false);
    const [edit, setEdit] = useState(false);
    const [openDrawerFilter, setOpenDrawerFilter] = useState(false);
    const [idEmployee, setIdEmployee] = useState<number>();
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);
    const [listEmployee, setlistEmployee] = useState<ISearchEmployee[]>([]);

    const mdDown = useMediaQuery(themeUi.breakpoints.down("md"));

    const {
        handleSubmit,
        formState: { errors },
        control,
        watch,
        setValue,
        reset,
        resetField,
    } = useForm<EmployeeFilterProps>({
        defaultValues: {
            active: { id: true, label: "🟢 Ativo(a)" },
        },
    });
    const agencySelected = watch("agency");
    const sectorSelected = watch("sector");

    const filters = {
        cooperatives: watch("cooperatives")?.label,
        agency: watch("agency")?.label,
        sector: watch("sector")?.label,
        team: watch("team")?.label,
        role: watch("role")?.label,
        active: watch("active")?.label,
    };

    const labelsMap = {
        cooperatives: "Cooperativa",
        agency: "Agência",
        sector: "Setor",
        team: "Time",
        role: "Cargo",
        active: "Situação",
    };

    const clearAllFilters = () => {
        reset({
            cooperatives: null,
            agency: null,
            sector: null,
            team: null,
            role: null,
            active: null,
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
                            onClick={handleFilterEmployees}>
                            <FilterAltOutlinedIcon color={loading ? "disabled" : "primary"} />
                        </IconButton>
                    </Stack>
                )}
            </Stack>
        );
    };

    const handleRefresh = handleSubmit((params) => {
        onSubmitFilter(params);
        toast.success("Atualização realizada com sucesso!");
    });

    const handleFilterEmployees = () => {
        setOpenDrawerFilter((oldValue) => !oldValue);
        setSpeedDialOpen(true);
    };

    const handleNewRegister = () => {
        navigate("/gestao-colaboradores/colaboradores/cadastrar");
    };

    const updateColumn = (employee: UpdateColumnEmployeeProps) => {
        const data = listEmployee.map((item) => {
            return item.id === employee.id ? { ...item, ...employee } : item;
        });
        setlistEmployee(data);
    };

    const searchSector = async (id_agency: number) => {
        try {
            const sector = await searchAutocompleteSector({ is_active: true, id_agency });
            setArraySector(sector);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const searchTeam = async (id_sector: number) => {
        try {
            const teams = await searchTeamAutocomplete({ is_active: true, id_sector });
            setArrayTeams(teams);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const onSubmitFilter = async (data: EmployeeFilterProps) => {
        try {
            setLoading(true);
            toggleStatusBackdrop();

            let params = {};

            if (data.cooperatives) {
                params = { ...params, id_cooperative: data.cooperatives?.id };
            }

            if (data.sector) {
                params = { ...params, id_sector: data.sector.id };
            }

            if (data.agency) {
                params = { ...params, id_agency: data.agency.id };
            }

            if (data.team) {
                params = { ...params, id_team: data.team.id };
            }

            if (data.role) {
                params = { ...params, id_role: data.role.id };
            }

            if (data.active) {
                params = { ...params, is_active: data.active.id };
            }

            const employee = await searchEmployee(params);
            setlistEmployee(employee);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
            setLoading(false);
        }
    };

    useEffect(() => {
        async function execute() {
            toggleStatusBackdrop();

            try {
                const [autocompletCooperatives, agencies, autoCompleteRoles] = await Promise.all([
                    searchAutoCompleteCooperatives({ is_active: true }),
                    searchAutocompleteAgencies({ is_active: true, with_restrict_agency: true }),
                    searchAutocompleteRole({ id_cooperative: 1 }),
                ]);

                setArrayRoles(autoCompleteRoles.map((item: any) => ({ ...item, label: item.name })));

                setArrayAgencies(agencies);

                const formattedCooperatives = autocompletCooperatives.map((item) => ({
                    id: item.id,
                    label: item.abbreviation,
                }));

                setArrayCooperatives(formattedCooperatives);

                const data = await searchEmployee({ is_active: true });
                setlistEmployee(data);
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            }

            toggleStatusBackdrop();
        }

        execute();
    }, []);

    useEffect(() => {
        if (agencySelected) {
            searchSector(agencySelected.id);
        } else {
            setArraySector([]);
            resetField("sector", { defaultValue: undefined });
        }
    }, [agencySelected]);

    useEffect(() => {
        if (sectorSelected) {
            searchTeam(sectorSelected.id);
        } else {
            setArrayTeams([]);
            resetField("team", { defaultValue: undefined });
        }
    }, [sectorSelected]);

    const QuickSearchToolbar = () => {
        return (
            <Grid sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
                <GridToolbar />
                <GridToolbarQuickFilter placeholder='Digite para pesquisar' />
            </Grid>
        );
    };

    const columns: GridColDef[] = [
        {
            field: "Opções",
            width: 65,
            align: "center",
            headerAlign: "center",
            renderCell: (cellValues) => {
                return (
                    <Stack direction='row' spacing={1}>
                        <IconButton
                            onClick={() => {
                                setEdit(true);
                                setIdEmployee(cellValues.row.id);
                            }}
                            color='success'
                            title='Editar'
                            aria-label='Editar pessoa'>
                            <EditIcon />
                        </IconButton>
                    </Stack>
                );
            },
        },
        {
            field: "is_active",
            headerName: "Situação",
            minWidth: 80,
            renderCell: ({ value }) => {
                return <Typography>{value ? "🟢 Ativo" : "🔴 Inativo"}</Typography>;
            },
        },
        {
            field: "url_avatar",
            headerName: "Avatar",
            headerAlign: "center",
            width: 70,
            align: "center",
            disableExport: true,
            renderCell: ({ value, row }) => {
                const imageProfileURL = value ? getBaseURL() + value : undefined;

                return (
                    <Grid container justifyContent={"center"}>
                        <Box mt={1} mb={1}>
                            <BadgeAvatars
                                user={{ name: row.people_name, url_image_profile: imageProfileURL }}
                                type='dot'
                                status={row.socket_status}
                            />
                        </Box>
                    </Grid>
                );
            },
        },
        {
            field: "people_name",
            headerName: "Nome",
            minWidth: 300,
            flex: 1,
        },
        {
            field: "employee_email_corporate",
            headerName: "Email Corporativo",
            minWidth: 225,
        },
        {
            field: "agency_name",
            headerName: "Agência",
            minWidth: 140,
        },
        {
            field: "portfolio_name",
            headerName: "Carteira",
            minWidth: 160,
        },
        {
            field: "sector_name",
            headerName: "Setor",
            minWidth: 200,
        },
        {
            field: "team_name",
            headerName: "Time",
            minWidth: 160,
        },
        {
            field: "role_name",
            headerName: "Cargo",
            minWidth: 210,
        },
        {
            field: "created_at",
            headerName: "Data Cadastro",
            minWidth: 110,
            renderCell: ({ value }) => {
                return <Typography>{formatDate(value, "DD/MM/YYYY")}</Typography>;
            },
        },
    ];

    return (
        <>
            <Grid container spacing={1} justifyContent='center' paddingInline={2} mt={0} mb={0.75} wrap='wrap'>
                <Grid item xs={12} md={12}>
                    <Breadcrumbs aria-label='breadcrumb' separator='›'>
                        <Typography color='text.primary' sx={{ display: "inline-flex", alignItems: "center" }} pt={1}>
                            <BadgeOutlinedIcon sx={{ color: theme === "light" ? "#5e5e5e" : "#FFFFFF", mr: 0.5 }} />
                            Gestão de Colaboradores
                        </Typography>
                        <Typography color='text.secondary'>Colaboradores</Typography>
                    </Breadcrumbs>
                </Grid>
            </Grid>

            <BoxMain isDivider={false} mt={0}>
                {Object.values(filters).some((value) => value !== undefined && value !== null) ? (
                    <Grid
                        container
                        direction='row'
                        gap={1}
                        border={`1px dashed ${colorBorderSystem}`}
                        padding={1}
                        borderRadius={4}
                        mb={2}>
                        <Grid item xs={12}>
                            <FilterApplied
                                filters={filters}
                                clearAllFilters={clearAllFilters}
                                removeFilter={removeFilter}
                            />
                        </Grid>
                    </Grid>
                ) : (
                    <Grid item xs={12} mb={2} mt={0.5}>
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
                    rows={listEmployee}
                    columns={columns}
                    density='standard'
                    autoHeight
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
                                transform: "translate(48%, 35%)",
                                zIndex: 1300,
                                borderRadius: "8px",
                                boxShadow:
                                    "0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)",
                                backgroundColor: theme === "light" ? "#ffffff" : "#1F3D44",
                            },
                        },
                    }}
                    pageSizeOptions={[10, 20, 30, 50, 100]}
                    disableRowSelectionOnClick
                    sx={{
                        ...getDataGridStyles(colorBorderSystem, colorScrollSystem),
                        mt: 1.5,
                    }}
                />

                <TemporaryDrawer
                    title='Filtro Listagem | Colaboradores'
                    closeButton={handleFilterEmployees}
                    onClose={handleFilterEmployees}
                    disableEscapeKeyDown={false}
                    open={openDrawerFilter}
                    sx={{
                        "& .MuiDrawer-paperAnchorRight": {
                            width: mdDown ? "100%" : "45%",
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
                            onSubmit={handleSubmit(onSubmitFilter)}>
                            <Grid item xs={12} md={6}>
                                <FormAutocomplete
                                    fullWidth
                                    name='cooperatives'
                                    label='Cooperativa'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                    options={arrayCooperatives}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormAutocomplete
                                    fullWidth
                                    name='agency'
                                    label='Agência'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                    options={arrayAgencies.map((value) => {
                                        return {
                                            id: value.id,
                                            label: value.abbreviation,
                                        };
                                    })}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormAutocomplete
                                    fullWidth
                                    name='sector'
                                    label='Setor'
                                    variant='outlined'
                                    size='medium'
                                    disabledAutocomplete={!agencySelected}
                                    control={control}
                                    errors={errors}
                                    options={arraySector.map((value) => {
                                        return {
                                            id: value.id,
                                            label: value.name,
                                        };
                                    })}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormAutocomplete
                                    fullWidth
                                    name='team'
                                    label='Time'
                                    variant='outlined'
                                    size='medium'
                                    disabledAutocomplete={!sectorSelected}
                                    control={control}
                                    errors={errors}
                                    options={arrayTeams.map((value) => {
                                        return {
                                            id: value.id,
                                            label: value.name,
                                        };
                                    })}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormAutocomplete
                                    fullWidth
                                    name='role'
                                    label='Cargo'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                    options={arrayRoles}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormAutocomplete
                                    fullWidth
                                    name='active'
                                    label='Situação'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                    options={ArrayTypesStatus}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <LoadingButton
                                    fullWidth
                                    type='submit'
                                    color='success'
                                    loadingPosition='start'
                                    size='large'
                                    variant='outlined'
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
                                    variant='outlined'
                                    startIcon={<SearchOffIcon />}
                                    loading={loading}
                                    sx={{ boxShadow: "none" }}
                                    onClick={() => {
                                        reset({
                                            cooperatives: null,
                                            agency: null,
                                            sector: null,
                                            team: null,
                                            role: null,
                                            active: null,
                                        });
                                    }}>
                                    Limpar Filtros
                                </LoadingButton>
                            </Grid>
                        </Grid>
                    </Box>
                </TemporaryDrawer>

                <TemporaryDrawer
                    open={edit}
                    title='Colaborador'
                    sx={{
                        "& .MuiDrawer-paperAnchorRight": {
                            width: mdDown ? "100%" : "80%",
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
                    }}
                    closeButton={() => {
                        setEdit((prev) => !prev);
                    }}>
                    <EmployeesFields idEmployee={idEmployee} updateColumn={updateColumn} padding={3} />
                </TemporaryDrawer>

                <BasicSpeedDial
                    ariaLabel='Opções'
                    title='Opções'
                    open={speedDialOpen}
                    onClick={() => setSpeedDialOpen((oldValue) => !oldValue)}
                    actions={[
                        {
                            icon: <AddCircleOutlineOutlinedIcon color='action' />,
                            name: "Novo Colaborador",
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
                                handleFilterEmployees();
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
            </BoxMain>
        </>
    );
}
