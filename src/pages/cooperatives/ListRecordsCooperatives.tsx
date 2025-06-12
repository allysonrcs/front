import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
import { Box, Breadcrumbs, Grid, IconButton, Stack, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { useConfirm } from "material-ui-confirm";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { toast } from "react-toastify";
import { BoxMain } from "@/components/Box/BoxMain";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { useGlobal } from "@/contexts/GlobalContext";
import { ArrayTypesStatus } from "@/constants/array-status";
import { deleteCooperative, ISearchCooperatives, searchCooperatives } from "@/services/cooperatives";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { EditCooperativeModalProps, CooperativesFields } from "./CooperativesFields";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { formatDate } from "@/functions/date";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { searchAllAccessPermissionGroup } from "@/services/access-groups";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";

type autocompleteActiveProps = {
    id: boolean;
    label: string;
};

type FunctionProps = {
    is_active: autocompleteActiveProps;
};

type PermissionProps = {
    group: string;
};

export function ListRecordsCooperatives() {
    const [idCooperative, setIdCooperative] = useState<number>();
    const [accessPermission, setAccessPermission] = useState<PermissionProps[]>([]);
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

    const [listCooperatives, setListCooperatives] = useState<ISearchCooperatives[]>([]);
    const [loading, setLoading] = useState(false);

    const { device } = useMediaQuery();

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<FunctionProps>();

    function handleNewRegister() {
        navigate("/funcoes-administrativas/cooperativas/cadastrar");
    }

    const handleEditCooperative = () => {
        setOpenEdit((prev) => !prev);
    };

    function handleRemoveOrganization(id: number) {
        confirm({
            title: "Deseja realmente apagar o registro?",
            description: "O registro da cooperativa será removido.",
        })
            .then(async () => {
                try {
                    await deleteCooperative(id);

                    setListCooperatives((prev) => prev.filter((institution) => institution.id !== id));
                    toast.success("Registro da Cooperativa removido com sucesso");
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

    const onSubmit = async (params: FunctionProps) => {
        let refactor = {};

        if (params.is_active) {
            refactor = { ...refactor, is_active: params.is_active?.id };
        }

        try {
            setLoading(true);
            const data = await searchCooperatives(refactor);
            setListCooperatives(data);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    function editCooperativeModal(params: EditCooperativeModalProps) {
        setListCooperatives((prev) => {
            const newCooperative = prev;
            return newCooperative.map((value) => {
                if (idCooperative == value.id) {
                    value = {
                        ...value,
                        ...params,
                    };
                }
                return value;
            });
        });
    }

    useEffect(() => {
        async function execute() {
            try {
                toggleStatusBackdrop();

                const [dataUserPermission, dataCooperatives] = await Promise.all([
                    searchAllAccessPermissionGroup(),
                    searchCooperatives({ is_active: true }),
                ]);

                setAccessPermission(dataUserPermission);
                setListCooperatives(dataCooperatives);
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
                                handleEditCooperative();
                                setIdCooperative(cellValues.row.id);
                            }}
                            color='success'
                            title='Editar'
                            aria-label='Editar registro'>
                            <EditIcon />
                        </IconButton>
                        {accessPermission.some((value) => value.group === "GROUP_ADMIN") && (
                            <IconButton
                                onClick={() => handleRemoveOrganization(cellValues.row.id)}
                                color='error'
                                title='Excluir'
                                aria-label='Excluir registro'>
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </Stack>
                );
            },
        },
        {
            field: "code_cooperative",
            headerName: "Código",
            width: 65,
        },
        {
            field: "name",
            headerName: "Nome",
            minWidth: 400,
            flex: 1,
        },
        {
            field: "abbreviation",
            headerName: "Abreviação",
            minWidth: 175,
        },
        {
            field: "name_president",
            headerName: "Presidente",
            minWidth: 160,
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
                        <Typography color='text.secondary'>Cooperativas</Typography>
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
                    <Grid item xs={6} md={10}>
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

                    <Grid item xs={6} md={2}>
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
                    rows={listCooperatives}
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
                    title='Cooperativa'
                    closeButton={handleEditCooperative}
                    open={openEdit}
                    sx={{
                        "& .MuiDrawer-paperAnchorRight": {
                            width: device === "Mobile" ? "100%" : "60%",
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
                        <CooperativesFields p={3} updateColumn={editCooperativeModal} idCooperative={idCooperative} />
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
                            name: "Nova Cooperativa",
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
