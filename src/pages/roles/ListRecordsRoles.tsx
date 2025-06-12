import { LoadingButton } from "@mui/lab";
import { Box, Breadcrumbs, Grid, IconButton, Stack, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { useConfirm } from "material-ui-confirm";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { BoxMain } from "@/components/Box/BoxMain";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { useGlobal } from "@/contexts/GlobalContext";
import { ArrayTypesStatus } from "@/constants/array-status";
import { deleteRole, IsearchSectorProps, searchAllRoles } from "@/services/roles";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { EditRoleModalProps, RolesFields } from "./RolesFields";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { formatDate } from "@/functions/date";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { searchAutoCompleteCooperatives } from "@/services/cooperatives";
import { ArrayTypesGradeRoles } from "@/constants/array-type-grade-roles";
import { ArrayTypesLevelRoles } from "@/constants/array-type-level-roles";
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

type RolesProps = {
    cooperatives: AutoCompleteNumber;
    grade: AutoCompleteString;
    level: AutoCompleteString;
    is_active: AutoCompleteBoolean;
};

export function ListRecordsRoles() {
    const [idRole, setIdRole] = useState<number>();
    const [openEdit, setOpenEdit] = useState(false);
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
    const navigate = useNavigate();
    const confirm = useConfirm();

    const { device } = useMediaQuery();
    const [autoCompleteCooperatives, setAutoCompleteCooperatives] = useState<AutoCompleteNumber[]>([]);
    const [listRoles, setListRoles] = useState<IsearchSectorProps[]>([]);
    const [loading, setLoading] = useState(false);

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<RolesProps>();

    function handleNewRegister() {
        navigate("/funcoes-administrativas/cargos/cadastrar");
    }

    const handleEditRole = () => {
        setOpenEdit((prev) => !prev);
    };

    function handleRemoveRole(id: number) {
        confirm({
            title: "Deseja realmente apagar o registro?",
            description: "O registro do cargo será excluído.",
        })
            .then(async () => {
                try {
                    await deleteRole(id);
                    setListRoles((prev) => prev.filter((role) => role.id !== id));
                    toast.success("Registro de cargo removido com sucesso");
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                }
            })
            .catch(() => {});
    }

    const QuickSearchToolbar = () => {
        return (
            <Grid sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
                <GridToolbar />
                <GridToolbarQuickFilter placeholder='Digite para pesquisar' />
            </Grid>
        );
    };

    const onSubmit = async (params: RolesProps) => {
        let refactor = {};

        if (params.cooperatives) {
            refactor = { ...refactor, id_cooperative: params.cooperatives?.id };
        }

        if (params.grade) {
            refactor = { ...refactor, grade: params.grade?.id };
        }

        if (params.level) {
            refactor = { ...refactor, level: params.level?.id };
        }

        if (params.is_active) {
            refactor = { ...refactor, is_active: params.is_active?.id };
        }

        try {
            setLoading(true);
            const data = await searchAllRoles(refactor);
            setListRoles(data);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    function editRoleModal(params: EditRoleModalProps) {
        setListRoles((prev) => {
            const newRole = prev;
            return newRole.map((value) => {
                if (idRole == value.id) {
                    value = {
                        ...value,
                        ...params,
                    };
                }
                return value;
            });
        });
    }

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
            try {
                toggleStatusBackdrop();

                await setAutocompleteOptions();
                const data = await searchAllRoles({});

                setListRoles(data);
            } catch (error) {
                const { message } = await getInfoError(error);
                toast.error(message);
            } finally {
                toggleStatusBackdrop();
            }
        }
        execute();
    }, []);

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
                                handleEditRole();
                                setIdRole(cellValues.row.id);
                            }}
                            color='success'
                            title='Editar'
                            aria-label='Editar registro'>
                            <EditIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => handleRemoveRole(cellValues.row.id)}
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
            minWidth: 300,
            flex: 1,
        },
        {
            field: "grade",
            headerName: "Grau",
            minWidth: 65,
            renderCell: ({ value }) => {
                let label;

                switch (value) {
                    case 1:
                        label = "I";
                        break;
                    case 2:
                        label = "II";
                        break;
                    case 3:
                        label = "III";
                        break;
                    case 4:
                        label = "IV";
                        break;
                    case 5:
                        label = "V";
                        break;
                    case 6:
                        label = "VI";
                        break;
                    case 0:
                        label = "Sem grau";
                        break;
                    default:
                        label = value;
                }

                return (
                    <Stack direction='row' alignItems='center' justifyContent='center'>
                        <Typography>{label}</Typography>
                    </Stack>
                );
            },
        },
        {
            field: "level",
            headerName: "Nível",
            minWidth: 65,
            renderCell: ({ value }) => {
                return <Typography>{value === "S" ? "Sem nível" : value}</Typography>;
            },
        },
        {
            field: "abbreviation_cooperative",
            headerName: "Cooperativa",
            minWidth: 200,
        },
        {
            field: "is_active",
            headerName: "Situação",
            minWidth: 120,
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
                        <Typography color='text.secondary'>Cargos</Typography>
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
                    <Grid item xs={12} md={3}>
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
                    <Grid item xs={6} md={2.5}>
                        <FormAutocomplete
                            fullWidth
                            name='grade'
                            label='Grau'
                            variant='outlined'
                            size='medium'
                            control={control}
                            errors={errors}
                            options={ArrayTypesGradeRoles}
                        />
                    </Grid>
                    <Grid item xs={6} md={2.5}>
                        <FormAutocomplete
                            fullWidth
                            name='level'
                            label='Nível'
                            variant='outlined'
                            size='medium'
                            control={control}
                            errors={errors}
                            options={ArrayTypesLevelRoles}
                        />
                    </Grid>
                    <Grid item xs={6} md={2.5}>
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
                    columns={columns}
                    rows={listRoles}
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
                    title='Cargo'
                    closeButton={handleEditRole}
                    open={openEdit}
                    sx={{
                        "& .MuiDrawer-paperAnchorRight": {
                            width: device === "Mobile" ? "100%" : "65%",
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
                    <Box>
                        <RolesFields p={3} updateColumn={editRoleModal} idRole={idRole} />
                    </Box>
                </TemporaryDrawer>

                <BasicSpeedDial
                    ariaLabel='Opções'
                    title='Opções'
                    open={speedDialOpen}
                    onClick={() => setSpeedDialOpen((oldValue) => !oldValue)}
                    actions={[
                        {
                            icon: <AddCircleOutlineOutlinedIcon color='action' />,
                            name: "Novo Cargo",
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
