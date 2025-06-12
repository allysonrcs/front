import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Breadcrumbs, Grid, IconButton, Stack, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";
import { useConfirm } from "material-ui-confirm";
import { useGlobal } from "@/contexts/GlobalContext";
import { IAutocompleteSector, searchAutocompleteSector } from "@/services/sectors";
import { IAgenciesAutocomplete, searchAutocompleteAgencies } from "@/services/agencies";
import { searchTeam, ISearchTeam, deleteTeam } from "@/services/teams";
import { BoxMain } from "@/components/Box/BoxMain";
import { ArrayTypesStatus } from "@/constants/array-status";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { formatDate } from "@/functions/date";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { TeamsFields } from "./TeamsFields";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";

type autocomplete = {
    id: number;
    label: string;
};

type autoCompleteIdString = {
    id: string;
    label: string;
};

type onSubmitProps = {
    agency: autocomplete;
    sector: autocomplete;
    is_active: autoCompleteIdString;
};

export function ListRecordsTeams() {
    const [arraySector, setArraySector] = useState<IAutocompleteSector[]>([]);
    const [arrayAgencies, setArrayAgencies] = useState<IAgenciesAutocomplete[]>([]);
    const [listTeams, setListTeams] = useState<ISearchTeam[]>([]);
    const [loading, setLoading] = useState(false);
    const [edit, setEdit] = useState(false);
    const [teamSelected, setTeamSelected] = useState<number>();
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);

    const {
        getInfoError,
        toggleStatusBackdrop,
        colorBorderSystem,
        colorBackgroundSystem,
        colorScrollSystem,
        theme,
        redBlur,
        cyanBlur,
    } = useGlobal();
    const { device } = useMediaQuery();

    const navigate = useNavigate();
    const confirm = useConfirm();

    const {
        handleSubmit,
        formState: { errors },
        control,
        watch,
        resetField,
    } = useForm<onSubmitProps>();

    const agencySelected = watch("agency");

    const handleNewRegister = () => {
        navigate("/funcoes-administrativas/times/cadastrar");
    };

    const handleRemoveTeam = (data: ISearchTeam) => {
        confirm({
            title: `Deseja realmente apagar o time '${data.name}'?`,
            description: "O registro de time será excluído.",
        })
            .then(async () => {
                try {
                    await deleteTeam(data.id);
                    setListTeams((prev) => prev.filter((team) => team.id !== data.id));

                    toast.success(`Registro removido com sucesso`);
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                }
            })
            .catch(() => {});
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

    const handleDataGridChange = (data: ISearchTeam) => {
        setListTeams((prev) => {
            const newRole = prev;
            return newRole.map((value) => {
                if (data.id == value.id) {
                    return {
                        ...value,
                        ...data,
                        total_employee: value.total_employee,
                        created_at: value.created_at,
                    };
                }
                return value;
            });
        });
    };

    const onSubmitFilter = async (data: onSubmitProps) => {
        try {
            toggleStatusBackdrop();
            setLoading(true);
            let params = {};

            if (data.sector) {
                params = { ...params, id_sector: data.sector.id };
            }

            if (data.agency) {
                params = { ...params, id_agency: data.agency.id };
            }

            if (data.is_active) {
                params = { ...params, is_active: data.is_active.id };
            }

            const result = await searchTeam(params);
            setListTeams(result);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
            setLoading(false);
        }
    };

    useEffect(() => {
        setArraySector([]);
        resetField("sector", { defaultValue: undefined });

        if (agencySelected) {
            searchSector(agencySelected.id);
        }
    }, [agencySelected]);

    useEffect(() => {
        async function execute() {
            try {
                toggleStatusBackdrop();

                const agencies = await searchAutocompleteAgencies({ is_active: true, with_restrict_agency: true });
                setArrayAgencies(agencies);

                const result = await searchTeam({});
                setListTeams(result);
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                toggleStatusBackdrop();
            }
        }

        execute();
    }, []);

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
            align: "center",
            headerAlign: "center",
            minWidth: 100,
            renderCell: (cellValues) => {
                return (
                    <Stack direction='row' spacing={0.25}>
                        <IconButton
                            onClick={() => {
                                setEdit(true);
                                setTeamSelected(cellValues.row.id);
                            }}
                            color='success'
                            title='Editar'
                            aria-label='Editar registro'>
                            <EditIcon />
                        </IconButton>

                        <IconButton
                            onClick={() => handleRemoveTeam(cellValues.row)}
                            color='error'
                            title='Excluir'
                            aria-label='Excluir registro'>
                            <DeleteIcon />
                        </IconButton>
                    </Stack>
                );
            },
        },
        {
            field: "ref_team_id",
            headerName: "ID Referência",
            headerAlign: "center",
            align: "center",
            minWidth: 100,
            renderCell: ({ value }) => {
                return <Typography>{value !== null && value !== undefined ? value : "-"}</Typography>;
            },
        },
        {
            field: "name",
            headerName: "Nome",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "agency_name",
            headerName: "Agência",
            minWidth: 220,
        },
        {
            field: "sector_name",
            headerName: "Setor",
            minWidth: 250,
        },
        {
            field: "total_employee",
            headerName: "Qntd. Colaboradores",
            headerAlign: "center",
            align: "center",
            minWidth: 145,
        },
        {
            field: "description",
            headerName: "Descrição",
            headerAlign: "center",
            align: "center",
            minWidth: 150,
            renderCell: ({ value }) => {
                return <Typography>{value !== null && value !== undefined ? value : "-"}</Typography>;
            },
        },
        {
            field: "is_active",
            headerName: "Situação",
            headerAlign: "center",
            align: "center",
            minWidth: 80,
            renderCell: ({ value }) => {
                return <Typography>{value ? "🟢 Ativo" : "🔴 Inativo"}</Typography>;
            },
        },
        {
            field: "created_at",
            headerName: "Data Cadastro",
            headerAlign: "center",
            align: "center",
            minWidth: 120,
            renderCell: ({ value }) => {
                return <Typography>{formatDate(value, "DD/MM/YYYY")}</Typography>;
            },
        },
        {
            field: "updated_at",
            headerName: "Data Atualização",
            headerAlign: "center",
            align: "center",
            minWidth: 175,
            renderCell: ({ value }) => {
                return (
                    <Typography>
                        {value !== null && value !== undefined ? formatDate(value, "DD/MM/YYYY HH:mm:ss") : ""}
                    </Typography>
                );
            },
        },
    ];

    return (
        <>
            <Grid container spacing={1} justifyContent='center' paddingInline={2} mt={0} mb={0.75} wrap='wrap'>
                <Grid item xs={12} md={12}>
                    <Breadcrumbs aria-label='breadcrumb' separator='›'>
                        <Typography color='text.primary' sx={{ display: "inline-flex", alignItems: "center" }} pt={1}>
                            <SettingsOutlinedIcon sx={{ color: theme === "light" ? "#5e5e5e" : "#FFFFFF", mr: 0.5 }} />
                            Funções Administrativas
                        </Typography>
                        <Typography color='text.secondary'>Times</Typography>
                    </Breadcrumbs>
                </Grid>
            </Grid>
            <BoxMain isDivider={false} mt={0}>
                <Grid
                    container
                    component={"form"}
                    direction='row'
                    spacing={2}
                    sx={{ paddingBottom: 2 }}
                    mb={1}
                    onSubmit={handleSubmit(onSubmitFilter)}>
                    <Grid item xs={6} md={3.5}>
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

                    <Grid item xs={6} md={3.5}>
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

                    <Grid item xs={6} md={3.5}>
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

                    <Grid item xs={6} md={1.5}>
                        <LoadingButton
                            fullWidth
                            type='submit'
                            color='success'
                            loadingPosition='start'
                            size='large'
                            variant='contained'
                            startIcon={<SearchIcon />}
                            loading={loading}
                            sx={{ height: 55, boxShadow: "none" }}>
                            Pesquisar
                        </LoadingButton>
                    </Grid>
                </Grid>

                <DataGrid
                    autoHeight
                    rows={listTeams}
                    columns={columns}
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
                    sx={getDataGridStyles(colorBorderSystem, colorScrollSystem)}
                />

                <TemporaryDrawer
                    sx={{
                        "& .MuiDrawer-paperAnchorRight": {
                            width: device === "Mobile" ? "100%" : "none",
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
                    open={edit}
                    title='Times'
                    closeButton={() => {
                        setEdit((prev) => !prev);
                    }}>
                    <TeamsFields p={3} idTeam={teamSelected} updateFunc={handleDataGridChange} />
                </TemporaryDrawer>

                <BasicSpeedDial
                    ariaLabel='Opções'
                    title='Opções'
                    open={speedDialOpen}
                    onClick={() => setSpeedDialOpen((oldValue) => !oldValue)}
                    actions={[
                        {
                            icon: <AddCircleOutlineOutlinedIcon color='action' />,
                            name: "Novo Time",
                            click_event: () => {
                                handleNewRegister();
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
