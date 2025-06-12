import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useGlobal } from "@/contexts/GlobalContext";
import { ISearchUser, searchUser } from "@/services/users";
import { searchAutocompleteAgencies } from "@/services/agencies";
import { Badge, Box, Breadcrumbs, Chip, Grid, IconButton, Stack, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar, GridToolbarQuickFilter } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import LockPersonOutlinedIcon from "@mui/icons-material/LockPersonOutlined";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { LoadingButton } from "@mui/lab";
import { BoxMain } from "@/components/Box/BoxMain";
import { ArrayTypesStatus } from "@/constants/array-status";
import { searchAutocompleteSector } from "@/services/sectors";
import { searchTeamAutocomplete } from "@/services/teams";
import { UsersFields } from "./UsersFields";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { searchAutocompleteRole } from "@/services/roles";
import { formatDate } from "@/functions/date";
import { getBaseURL } from "@/functions/getBaseURL";
import BadgeAvatars from "@/components/AvatarWithBadge/AvatarWithBadge";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";

type autoCompleteActiveBooleanProps = {
    id: boolean;
    label: string;
};

type autoCompleteNumberProps = {
    id: number;
    label: string;
};

type UsersProps = {
    agency?: autoCompleteNumberProps | null;
    sector?: autoCompleteNumberProps | null;
    team?: autoCompleteNumberProps | null;
    role?: autoCompleteNumberProps | null;
    is_active?: autoCompleteActiveBooleanProps | null;
};

interface Filters {
    agency?: string;
    sector?: string;
    team?: string;
    role?: string;
    is_active?: string;
}

interface FilterAppliedProps {
    filters: Filters;
    clearAllFilters: () => void;
    removeFilter: (key: keyof Filters) => void;
}

export function ListRecordsUsers() {
    const [loading, setLoading] = useState(false);
    const [rowsUsers, setRowsUsers] = useState<ISearchUser[]>([]);
    const [autocomplete, setAutocomplete] = useState<autoCompleteNumberProps[]>([]);
    const [sectors, setSectors] = useState<autoCompleteNumberProps[]>([]);
    const [teams, setTeams] = useState<autoCompleteNumberProps[]>([]);
    const [roles, setRoles] = useState<autoCompleteNumberProps[]>([]);
    const [edit, setEdit] = useState(false);
    const [userSelected, setUserSelected] = useState<number>();
    const [openDrawerFilter, setOpenDrawerFilter] = useState(false);
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

    const { device } = useMediaQuery();

    const {
        handleSubmit,
        control,
        watch,
        resetField,
        reset,
        setValue,
        formState: { errors },
    } = useForm<UsersProps>({
        defaultValues: {
            is_active: { id: true, label: "🟢 Ativo(a)" },
        },
    });

    const agency = watch("agency");
    const sector = watch("sector");
    const team = watch("team");

    const filters = {
        agency: watch("agency")?.label,
        sector: watch("sector")?.label,
        team: watch("team")?.label,
        role: watch("role")?.label,
        is_active: watch("is_active")?.label,
    };

    const labelsMap = {
        agency: "Agência",
        sector: "Setor",
        team: "Time",
        role: "Cargo",
        is_active: "Situação",
    };

    const clearAllFilters = () => {
        reset({
            agency: null,
            sector: null,
            team: null,
            role: null,
            is_active: null,
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
                            onClick={handleFilterUsers}>
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

    const handleFilterUsers = () => {
        setOpenDrawerFilter((oldValue) => !oldValue);
        setSpeedDialOpen(true);
    };

    const handleNewRegister = () => {
        navigate("/acessos/usuarios/cadastrar");
    };

    const onSubmit = async (params: UsersProps) => {
        let dataInputs: any = {};

        if (params.agency) {
            dataInputs = { ...dataInputs, id_agency: params.agency?.id };
        }

        if (params.sector) {
            dataInputs = { ...dataInputs, id_sector: params.sector?.id };
        }

        if (params.team) {
            dataInputs = { ...dataInputs, id_team: params.team?.id };
        }

        if (params.role) {
            dataInputs = { ...dataInputs, id_role: params.role.id };
        }

        if (params.is_active) {
            dataInputs = { ...dataInputs, is_active: params.is_active?.id };
        }

        try {
            setLoading(true);

            const user = await searchUser(dataInputs);
            setRowsUsers(user);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const run = async () => {
            try {
                toggleStatusBackdrop();

                const user = await searchUser({ is_active: true });
                setRowsUsers(user);

                const [dataAgencies, autoCompleteRoles] = await Promise.all([
                    searchAutocompleteAgencies({ is_active: true, with_restrict_agency: true }),
                    searchAutocompleteRole({ id_cooperative: 1 }),
                ]);

                const refactor = dataAgencies.map(({ id, abbreviation }: any) => {
                    return { id: id, label: abbreviation };
                });

                setAutocomplete(refactor);
                setRoles(autoCompleteRoles.map((item: any) => ({ ...item, label: item.name })));
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                toggleStatusBackdrop();
            }
        };

        run();
    }, []);

    useEffect(() => {
        async function execute() {
            try {
                const sectors = await searchAutocompleteSector({ id_agency: agency?.id, is_active: true });
                setSectors(sectors.map((item: any) => ({ ...item, label: item.name })));
            } catch (error) {
                const { message } = await getInfoError(error);
                toast.error(message);
            }
        }

        if (agency) {
            execute();
        }
        if (sector) {
            resetField("sector");
        }
    }, [agency]);

    useEffect(() => {
        async function execute() {
            try {
                const teams = await searchTeamAutocomplete({ id_sector: sector?.id, is_active: true });
                setTeams(teams.map((item: any) => ({ ...item, label: item.name })));
            } catch (error) {
                const { message } = await getInfoError(error);
                toast.error(message);
            }
        }

        if (sector) {
            execute();
        }

        if (team) {
            resetField("team");
        }
    }, [sector]);

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
                                setUserSelected(cellValues.row.id);
                            }}
                            color='success'
                            title='Editar'
                            aria-label='Editar registro'>
                            <EditIcon />
                        </IconButton>
                    </Stack>
                );
            },
        },
        {
            field: "is_active",
            headerName: "Situação",
            minWidth: 100,
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
                                user={{ name: row.name_people, url_image_profile: imageProfileURL }}
                                type='dot'
                                status={row.socket_status}
                            />
                        </Box>
                    </Grid>
                );
            },
        },
        {
            field: "name_people",
            headerName: "Nome do Usuário",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "login",
            headerName: "Login",
            minWidth: 180,
        },
        {
            field: "agency_name",
            headerName: "Agência",
            minWidth: 200,
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
            minWidth: 100,
        },
        {
            field: "role_name",
            headerName: "Cargo",
            minWidth: 220,
        },
        {
            field: "created_at",
            headerName: "Data Cadastro",
            minWidth: 120,
            renderCell: ({ value }) => {
                return <Typography>{formatDate(value, "DD/MM/YYYY")}</Typography>;
            },
        },
    ];

    const handleDataGridChange = (data: ISearchUser) => {
        setRowsUsers((prev) => {
            const newRole = prev;
            return newRole.map((value) => {
                if (data.id == value.id) {
                    return {
                        ...data,
                        url_avatar: value.url_avatar,
                        socket_status: value.socket_status,
                        sector_name: value.sector_name,
                        team_name: value.team_name,
                        portfolio_name: value.portfolio_name,
                        role_name: value.role_name,
                        agency_name: value.agency_name,
                    };
                }
                return value;
            });
        });
    };

    return (
        <>
            <Grid container spacing={1} justifyContent='center' paddingInline={2} mt={0} mb={0.75} wrap='wrap'>
                <Grid item xs={12} md={12}>
                    <Breadcrumbs aria-label='breadcrumb' separator='›'>
                        <Typography color='text.primary' sx={{ display: "inline-flex", alignItems: "center" }} pt={1}>
                            <LockPersonOutlinedIcon
                                sx={{ color: theme === "light" ? "#5e5e5e" : "#FFFFFF", mr: 0.5 }}
                            />
                            Acessos
                        </Typography>
                        <Typography color='text.secondary'>Usuários</Typography>
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
                    autoHeight
                    columns={columns}
                    rows={rowsUsers}
                    density='standard'
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
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 20, 30, 50, 100]}
                    sx={{
                        ...getDataGridStyles(colorBorderSystem, colorScrollSystem),
                        mt: 1.5,
                    }}
                />

                <TemporaryDrawer
                    title='Filtro Listagem | Usuários'
                    closeButton={handleFilterUsers}
                    onClose={handleFilterUsers}
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
                            onSubmit={handleSubmit(onSubmit)}>
                            <Grid item xs={12} md={6}>
                                <FormAutocomplete
                                    fullWidth
                                    name='agency'
                                    label='Agência'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                    options={autocomplete}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormAutocomplete
                                    fullWidth
                                    name='sector'
                                    label='Setor'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                    options={sectors}
                                    disabledAutocomplete={!agency}
                                    disabled={!agency}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormAutocomplete
                                    fullWidth
                                    name='team'
                                    label='Time'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                    options={teams}
                                    disabledAutocomplete={!sector}
                                    disabled={!sector}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormAutocomplete
                                    fullWidth
                                    name='role'
                                    label='Cargos'
                                    variant='outlined'
                                    size='medium'
                                    control={control}
                                    errors={errors}
                                    options={roles}
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
                                            agency: null,
                                            sector: null,
                                            team: null,
                                            role: null,
                                            is_active: null,
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
                    title='Usuários'
                    sx={{
                        "& .MuiDrawer-paperAnchorRight": {
                            width: device === "Mobile" ? "100%" : "70%",
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
                    <UsersFields p={3} idUser={userSelected} updateFunc={handleDataGridChange} />
                </TemporaryDrawer>

                <BasicSpeedDial
                    ariaLabel='Opções'
                    title='Opções'
                    open={speedDialOpen}
                    onClick={() => setSpeedDialOpen((oldValue) => !oldValue)}
                    actions={[
                        {
                            icon: <AddCircleOutlineOutlinedIcon color='action' />,
                            name: "Novo Usuário",
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
                                handleFilterUsers();
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
