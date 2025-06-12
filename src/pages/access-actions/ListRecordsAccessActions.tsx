import { Breadcrumbs, Grid, IconButton, Stack, Typography } from "@mui/material";
import { BoxMain } from "@/components/Box/BoxMain";
import { DataGrid, GridColDef, GridToolbar, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { LoadingButton } from "@mui/lab";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { useForm } from "react-hook-form";
import { ArrayTypesStatus } from "@/constants/array-status";
import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { useNavigate } from "react-router-dom";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { AccessActionsFields } from "./AccessActionsFields";
import { autocompleteModule } from "@/services/access-modules";
import { toast } from "react-toastify";
import { useGlobal } from "@/contexts/GlobalContext";
import { IsearchRoutesProps, deleteRoute, searchAllRoutes } from "@/services/access-actions";
import { useConfirm } from "material-ui-confirm";
import { ModuleProps, autocompleteModuleProps } from "@/types/access-modules";
import { IsearchRoutesEditProps } from "@/types/access-actions";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";

export function ListRecordsAccessActions() {
    const [idRoute, setIdRoute] = useState<number | null>(null);
    const [openEditRoute, setOpenEditRoute] = useState<boolean>(false);
    const [listRoutes, setListRoutes] = useState<IsearchRoutesProps[]>([]);
    const [autocomplete, setAutocomplete] = useState<autocompleteModuleProps[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ModuleProps>();

    const navigate = useNavigate();
    const confirm = useConfirm();

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

    const handleRemoveRoute = (id: number) => {
        confirm({
            title: "Deseja realmente apagar o registro?",
            description: "O registro de rota de acesso será excluído.",
        }).then(async () => {
            try {
                await deleteRoute(id);
                setListRoutes((prev) => prev.filter((page) => page.id !== id));
                toast.success("Rota excluída com sucesso!");
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            }
        });
    };

    const handleEditRoute = () => {
        setOpenEditRoute((prev) => !prev);
    };

    const handleNewRegister = () => {
        navigate("/sistema/rotas/cadastrar");
    };

    const onSubmit = async (params: ModuleProps) => {
        let ref = {};

        if (params.id_access_module?.id) {
            ref = { id_access_module: params.id_access_module?.id };
        }

        if (params.is_active?.id !== undefined) {
            ref = { ...ref, is_active: params.is_active.id };
        }
        try {
            toggleStatusBackdrop();
            const data = await searchAllRoutes(ref);
            setListRoutes(data);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    const QuickSearchToolbar = () => {
        return (
            <Grid sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
                <GridToolbar />
                <GridToolbarQuickFilter placeholder='Digite para pesquisar' />
            </Grid>
        );
    };

    const setAutocompleteOptions = async () => {
        try {
            const data = await autocompleteModule({ is_active: true });

            const refactor = data.map(({ id_access_module, name }) => {
                return { id: id_access_module, label: name };
            });
            setAutocomplete(refactor);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    function editFunctionModal(params: IsearchRoutesEditProps) {
        setListRoutes((prev) => {
            const newRoute = prev;
            return newRoute.map((value) => {
                if (idRoute == value.id) {
                    value = {
                        ...value,

                        ...params,
                    };
                }
                return value;
            });
        });
    }

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
                                handleEditRoute();
                                setIdRoute(cellValues.row.id);
                            }}
                            color='success'
                            title='Editar'
                            aria-label='Editar registro'>
                            <EditIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => handleRemoveRoute(cellValues.row.id)}
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
            field: "module_name",
            headerName: "Nome do módulo",
            minWidth: 250,
        },
        {
            field: "name",
            headerName: "Nome da rota",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "type_route",
            headerName: "Tipo de rota",
            minWidth: 120,
        },
        {
            field: "route",
            headerName: "Rota",
            minWidth: 400,
        },
        {
            field: "is_active",
            headerName: "Situação",
            minWidth: 100,
            renderCell: ({ value }) => {
                return <Typography>{value ? "🟢 Ativo" : "🔴 Inativo"}</Typography>;
            },
        },
    ];

    useEffect(() => {
        async function execute() {
            try {
                toggleStatusBackdrop();

                await setAutocompleteOptions();
                const data = await searchAllRoutes({});
                setListRoutes(data);
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                toggleStatusBackdrop();
            }
        }
        execute();
    }, []);

    return (
        <>
            <Grid container spacing={1} justifyContent='center' paddingInline={2} mt={0} mb={0.75} wrap='wrap'>
                <Grid item xs={12} md={12}>
                    <Breadcrumbs aria-label='breadcrumb' separator='›'>
                        <Typography color='text.primary' sx={{ display: "inline-flex", alignItems: "center" }} pt={1}>
                            <TuneOutlinedIcon sx={{ color: theme === "light" ? "#5e5e5e" : "#FFFFFF", mr: 0.5 }} />
                            Sistema
                        </Typography>
                        <Typography color='text.secondary'>Rotas</Typography>
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
                    onSubmit={handleSubmit(onSubmit)}>
                    <Grid item xs={6} md={5}>
                        <FormAutocomplete
                            fullWidth
                            name='id_access_module'
                            label='Módulo'
                            variant='outlined'
                            size='medium'
                            control={control}
                            errors={errors}
                            options={autocomplete}
                        />
                    </Grid>

                    <Grid item xs={6} md={5}>
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

                    <Grid item xs={12} md={2}>
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
                    rows={listRoutes}
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
                    title='Rota de Acesso do Sistema'
                    closeButton={handleEditRoute}
                    open={openEditRoute}
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
                            backdropFilter: "blur(30px)",
                            backgroundImage: `url(${cyanBlur}), url(${redBlur})`,
                            backgroundRepeat: "no-repeat, no-repeat",
                            backgroundSize: "50%, 50%",
                            backgroundPosition: "right top, left bottom",
                        },
                    }}>
                    <AccessActionsFields p={2} editRoute={editFunctionModal} idRoute={idRoute} />
                </TemporaryDrawer>
            </BoxMain>

            <BasicSpeedDial
                ariaLabel='Opções'
                title='Opções'
                open={speedDialOpen}
                onClick={() => setSpeedDialOpen((oldValue) => !oldValue)}
                actions={[
                    {
                        icon: <AddCircleOutlineOutlinedIcon color='action' />,
                        name: "Novo Menu",
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
        </>
    );
}
