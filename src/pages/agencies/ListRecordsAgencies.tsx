import { useEffect, useState } from "react";
import { Box, Breadcrumbs, Grid, IconButton, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { DataGrid, GridColDef, GridToolbar, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { BoxMain } from "@/components/Box/BoxMain";
import { useGlobal } from "@/contexts/GlobalContext";
import { IAgencyProps, listAgencies, removeAgency } from "@/services/agencies";
import { toast } from "react-toastify";
import { useConfirm } from "material-ui-confirm";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { AgenciesFields, UpdateColumnAgencyProps } from "./AgenciesFields";
import { formatDate } from "@/functions/date";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { LoadingButton } from "@mui/lab";
import { ArrayTypesStatus } from "@/constants/array-status";
import { searchAutoCompleteCooperatives } from "@/services/cooperatives";
import { ArrayTypesArea } from "@/constants/array-area";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

type AutoCompleteNumber = {
    id: number;
    label: string;
};

type AutoCompleteString = {
    id: string;
    label: string;
};

type AgencyProps = {
    cooperatives: AutoCompleteNumber;
    type_area: AutoCompleteString;
    is_active: AutoCompleteBoolean;
};

type ListAgencyProps = {
    id: number;
    is_active: boolean;
    name: string;
    abbreviation: string;
    type_area: string;
    ipbx_identifier: string;
    created_at: string;
    matriz?: string | null;
    agency_employee_manager?: string | null | undefined;
    code_cooperative?: number | null;
};

export function ListRecordsAgencies() {
    const [dataAgencies, setDataAgencies] = useState<ListAgencyProps[]>([]);
    const [editAgency, setEditAgency] = useState(false);
    const [loading, setLoading] = useState(false);
    const [idAgency, setIdAgency] = useState<number>();
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);
    const [autoCompleteCooperatives, setAutoCompleteCooperatives] = useState<AutoCompleteNumber[]>([]);

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
    } = useForm<AgencyProps>();

    const handleNewRegisterAgency = () => {
        navigate("/funcoes-administrativas/agencias/cadastrar");
    };

    const handleRemoveRegisterAgency = (id_agency: number) => {
        confirm({
            title: `Deseja realmente apagar o registro ?`,
            description: "O registro de agência será removido.",
        })
            .then(async () => {
                try {
                    await removeAgency(id_agency);
                    setDataAgencies((prev) => prev.filter((agency) => agency.id !== id_agency));
                    toast.success(`Registro de agência removido com sucesso`);
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                }
            })
            .catch(() => {});
    };

    function updateColumn(params: UpdateColumnAgencyProps) {
        setDataAgencies((prev) => {
            const newAgency = prev;
            return newAgency.map((value) => {
                if (idAgency == value.id) {
                    value = {
                        ...value,
                        ...params,
                    };
                }
                return value;
            });
        });
    }

    const onSubmit = async (params: AgencyProps) => {
        let refactor = {};

        if (params.cooperatives) {
            refactor = { ...refactor, id_cooperative: params.cooperatives?.id };
        }

        if (params.type_area) {
            refactor = { ...refactor, type_area: params.type_area?.id };
        }

        if (params.is_active) {
            refactor = { ...refactor, is_active: params.is_active?.id };
        }

        try {
            setLoading(true);
            const data = await listAgencies(refactor);

            const agencies = data.map((item: IAgencyProps) => {
                return {
                    id: item.id,
                    name: item.name,
                    abbreviation: item.abbreviation,
                    type_area: item.type_area,
                    ipbx_identifier: item.ipbx_identifier,
                    is_active: item.is_active,
                    created_at: item.created_at,
                    matriz: item?.matriz_name,
                    agency_employee_manager: item?.agency_employee_manager,
                    cooperative_code: item?.cooperative_code,
                };
            });

            setDataAgencies(agencies);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const setAutocompleteOptions = async () => {
        try {
            const resultAutocompletCooperatives = await searchAutoCompleteCooperatives({});

            const formattedCooperatives = resultAutocompletCooperatives.map((item) => ({
                id: item.id,
                label: item.abbreviation,
            }));

            setAutoCompleteCooperatives(formattedCooperatives);
        } catch (error) {
            const { message } = await getInfoError(error);
            toast.error(message);
        }
    };

    useEffect(() => {
        async function execute() {
            toggleStatusBackdrop();

            try {
                await setAutocompleteOptions();

                const data = await listAgencies({});

                const agencies = data.map((item: IAgencyProps) => {
                    return {
                        id: item.id,
                        name: item.name,
                        abbreviation: item.abbreviation,
                        type_area: item.type_area,
                        ipbx_identifier: item.ipbx_identifier,
                        is_active: item.is_active,
                        created_at: item.created_at,
                        matriz: item?.matriz_name,
                        agency_employee_manager: item?.agency_employee_manager,
                        cooperative_code: item?.cooperative_code,
                    };
                });

                setDataAgencies(agencies);
            } catch (error) {
                const { message } = await getInfoError(error);
                toast.error(message);
            }

            toggleStatusBackdrop();
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
                                setIdAgency(cellValues.row.id);
                                setEditAgency((prev) => !prev);
                            }}
                            color='success'
                            title='Editar'
                            aria-label='Editar registro'>
                            <EditIcon />
                        </IconButton>

                        <IconButton
                            onClick={() => handleRemoveRegisterAgency(cellValues.row.id)}
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
            field: "name",
            headerName: "Nome",
            minWidth: 150,
            flex: 1,
        },
        {
            field: "cooperative_code",
            headerName: "Cooperativa",
            width: 92,
        },
        {
            field: "abbreviation",
            headerName: "Abreviação",
            minWidth: 140,
        },
        {
            field: "type_area",
            headerName: "Area",
            minWidth: 135,
        },
        {
            field: "matriz",
            headerName: "Matriz",
            minWidth: 165,
        },
        {
            field: "agency_employee_manager",
            headerName: "Gerente da Agência",
            minWidth: 180,
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
            field: "created_at",
            headerName: "Data Cadastro",
            minWidth: 120,
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
                            <SettingsOutlinedIcon sx={{ color: theme === "light" ? "#5e5e5e" : "#FFFFFF", mr: 0.5 }} />
                            Funções Administrativas
                        </Typography>
                        <Typography color='text.secondary'>Agências</Typography>
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
                    onSubmit={handleSubmit(onSubmit)}>
                    <Grid item xs={12} md={4}>
                        <FormAutocomplete
                            fullWidth
                            name='cooperatives'
                            label='Cooperativa'
                            variant='outlined'
                            size='medium'
                            control={control}
                            errors={errors}
                            options={autoCompleteCooperatives}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <FormAutocomplete
                            fullWidth
                            name='type_area'
                            label='Área'
                            variant='outlined'
                            size='medium'
                            control={control}
                            errors={errors}
                            options={ArrayTypesArea}
                        />
                    </Grid>

                    <Grid item xs={12} md={2.5}>
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

                    <Grid item xs={12} md={1.5}>
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

                <Box sx={{ position: "relative" }}>
                    <DataGrid
                        autoHeight
                        rows={dataAgencies}
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
                            columnMenu: {
                                style: {
                                    maxHeight: "300px",
                                    overflowY: "auto",
                                },
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
                </Box>

                <TemporaryDrawer
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
                    open={editAgency}
                    title='Agência'
                    closeButton={() => {
                        setEditAgency((prev) => !prev);
                    }}>
                    <AgenciesFields idAgency={idAgency} updateColumn={updateColumn} marginTop={1} padding={3} />
                </TemporaryDrawer>

                <BasicSpeedDial
                    ariaLabel='Opções'
                    title='Opções'
                    open={speedDialOpen}
                    onClick={() => setSpeedDialOpen((oldValue) => !oldValue)}
                    actions={[
                        {
                            icon: <AddCircleOutlineOutlinedIcon color='action' />,
                            name: "Nova Agência",
                            click_event: () => {
                                handleNewRegisterAgency();
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
