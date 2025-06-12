import { useEffect, useState } from "react";
import { Breadcrumbs, Grid, IconButton, Stack, Typography } from "@mui/material";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
import { ArrayTypesStatus } from "@/constants/array-status";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { DataGrid, GridColDef, GridToolbar, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { IsearchPagesProps, deletePage, searchPagesMenu } from "@/services/access-pages";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { AccessPagesFields } from "./AccessPagesFields";
import { BoxMain } from "@/components/Box/BoxMain";
import { useNavigate } from "react-router-dom";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";
import { autocompleteMenu } from "@/services/access-menus";
import { useConfirm } from "material-ui-confirm";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";

type autocompleteMenuProps = {
    id: number;
    label: string;
};

export interface IUpdatePageProps {
    id_access_menu?: number;
    id_access_page?: number;
    name?: string;
    route?: string;
    is_active?: boolean;
    icon?: string;
    component?: string;
}

type MenuProps = {
    is_active: autocompleteMenuProps;
    id_access_menu?: autocompleteMenuProps;
};

export function ListRecordsAccessPages() {
    const [idPage, setIdPage] = useState<number | null>(null);
    const [openEditPage, setOpenEditPage] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [autocomplete, setAutocomplete] = useState<autocompleteMenuProps[]>([]);
    const [listPage, setListPage] = useState<IsearchPagesProps[]>([]);
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);

    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<MenuProps>();

    const navigate = useNavigate();

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

    const confirm = useConfirm();

    const onSubmit = async (params: MenuProps) => {
        let refactor = {};

        if (params.id_access_menu?.id) {
            refactor = { id_access_menu: params.id_access_menu?.id };
        }

        if (params.is_active?.id !== undefined) {
            refactor = { ...refactor, is_active: params.is_active.id };
        }

        try {
            toggleStatusBackdrop();
            setLoading(true);
            const data = await searchPagesMenu(refactor);

            setListPage(data);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
            toggleStatusBackdrop();
        }
    };

    const handleNewRegister = () => {
        navigate("/sistema/paginas/cadastrar");
    };

    const handleEditPage = () => {
        setOpenEditPage((prev) => !prev);
    };

    function handleRemovePage(id: number) {
        confirm({
            title: "Deseja realmente apagar o registro?",
            description: "O registro de página de acesso será excluído.",
        }).then(async () => {
            try {
                await deletePage(id);
                setListPage((prev) => prev.filter((page) => page.id !== id));
                toast.success("Página excluída com sucesso!");
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            }
        });
    }

    function editFunctionModal(params: IUpdatePageProps) {
        setListPage((prev) => {
            const newPage = prev;
            return newPage.map((value) => {
                if (idPage == value.id) {
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
        const data = await autocompleteMenu({ is_active: true });

        const refactor = data.map(({ id_access_menu, name }) => {
            return { id: id_access_menu, label: name };
        });

        setAutocomplete(refactor);
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
                                handleEditPage();
                                setIdPage(cellValues.row.id);
                            }}
                            color='success'
                            title='Editar'
                            aria-label='Editar registro'>
                            <EditIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => handleRemovePage(cellValues.row.id)}
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
            headerName: "Nome da página",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "name_route_father",
            headerName: "Rota principal",
            minWidth: 200,
        },
        {
            field: "component",
            headerName: "Componente",
            minWidth: 200,
        },
        {
            field: "menu_name",
            headerName: "Menu",
            minWidth: 200,
        },
        {
            field: "route",
            headerName: "Rota",
            minWidth: 300,
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
                const data = await searchPagesMenu({});
                setListPage(data);
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
                        <Typography color='text.secondary'>Páginas</Typography>
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
                            name='id_access_menu'
                            label='Menu'
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
                    rows={listPage}
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
                    title='Página de Acesso do Sistema'
                    closeButton={handleEditPage}
                    open={openEditPage}
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
                    <AccessPagesFields p={2} editPage={editFunctionModal} idPage={idPage} />
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
                        name: "Nova Página",
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
