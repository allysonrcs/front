import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Breadcrumbs, Grid, IconButton, Stack, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { DataGrid, GridColDef, GridToolbar, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { useConfirm } from "material-ui-confirm";
import { BoxMain } from "@/components/Box/BoxMain";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { ArrayTypesStatus } from "@/constants/array-status";
import { AccessMenusFields } from "./AccessMenusFields";
import { IAccessMenu, deleteMenu, getAllMenuAccess } from "@/services/access-menus";
import { useGlobal } from "@/contexts/GlobalContext";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";

export interface IupdateMenu {
    name?: string;
    icon?: string;
    route?: string;
    is_active?: boolean;
    description?: string;
}

type autocompleteActiveProps = {
    id: boolean;
    label: string;
};

type MenuProps = {
    is_active: autocompleteActiveProps;
};

export function ListRecordsAccessMenus() {
    const [idMenu, setIdMenu] = useState<number | null>(null);
    const [openEditMenu, setOpenEditMenu] = useState<boolean>(false);
    const [listMenu, setListMenu] = useState<IAccessMenu[]>([]);
    const [loading, setLoading] = useState(false);
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);

    const {
        toggleStatusBackdrop,
        getInfoError,
        theme,
        colorBorderSystem,
        colorBackgroundSystem,
        colorScrollSystem,
        redBlur,
        cyanBlur,
    } = useGlobal();
    const confirm = useConfirm();

    const { device } = useMediaQuery();

    const navigate = useNavigate();
    const {
        control,
        formState: { errors },
        handleSubmit,
    } = useForm<MenuProps>();

    async function onSubmit(params: MenuProps) {
        let refactor = {};

        if (params.is_active) {
            refactor = { ...refactor, is_active: params.is_active?.id };
        }

        try {
            toggleStatusBackdrop();
            setLoading(true);
            const data = await getAllMenuAccess(refactor);
            setListMenu(data);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
            toggleStatusBackdrop();
        }
    }

    const handleNewRegister = () => {
        navigate("/sistema/menus/cadastrar");
    };
    const handleEditMenu = () => {
        setOpenEditMenu((prev) => !prev);
    };

    const handleRemoveMenu = (id: number) => {
        confirm({
            title: "Deseja realmente apagar o registro?",
            description: "O registro de menu de acesso será excluído.",
        })
            .then(async () => {
                try {
                    await deleteMenu(id);
                    setListMenu((prev) => prev.filter((menu) => menu.id !== id));
                    toast.success("Menu excluído com sucesso!");
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                }
            })
            .catch(() => {});
    };

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
                                handleEditMenu();
                                setIdMenu(cellValues.row.id);
                            }}
                            color='success'
                            title='Editar'
                            aria-label='Editar registro'>
                            <EditIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => handleRemoveMenu(cellValues.row.id)}
                            color='error'
                            title='Excluir'
                            aria-label='Remover registro'>
                            <DeleteIcon />
                        </IconButton>
                    </Stack>
                );
            },
        },
        {
            field: "name",
            headerName: "Nome do menu",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "route",
            headerName: "Rota",
            minWidth: 200,
        },
        {
            field: "icon",
            headerName: "Icone",
            minWidth: 200,
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

    function editFunctionModal(params: IupdateMenu) {
        setListMenu((prev) => {
            const newMenu = prev;
            return newMenu.map((value) => {
                if (idMenu == value.id) {
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
                setLoading((prev) => !prev);
                const data = await getAllMenuAccess({});

                setListMenu(data);
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                setLoading(false);
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
                        <Typography color='text.secondary'>Menus</Typography>
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
                    rows={listMenu}
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
                    title='Menu de Acesso do Sistema'
                    closeButton={handleEditMenu}
                    open={openEditMenu}
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
                    <AccessMenusFields p={2} editMenu={editFunctionModal} idMenu={idMenu} />
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
