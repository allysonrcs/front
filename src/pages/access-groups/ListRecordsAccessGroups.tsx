import { useEffect, useState } from "react";
import { Breadcrumbs, Grid, IconButton, Stack, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { BoxMain } from "@/components/Box/BoxMain";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";
import { useConfirm } from "material-ui-confirm";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockPersonOutlinedIcon from "@mui/icons-material/LockPersonOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { deleteAccessGroup, getAllGroupAccess, IAccessGroup } from "@/services/access-groups";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";

export function ListRecordsAccessGroups() {
    const [allGroupAccess, setAllGroupAccess] = useState<IAccessGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);

    const { getInfoError, toggleStatusBackdrop, colorBorderSystem, colorScrollSystem, theme } = useGlobal();
    const navigate = useNavigate();
    const confirm = useConfirm();

    useEffect(() => {
        async function execute() {
            try {
                toggleStatusBackdrop();
                const all_group_access = await getAllGroupAccess();
                setAllGroupAccess(all_group_access);
            } catch (error) {
                const { message } = await getInfoError(error);
                toast.error(message);
            } finally {
                toggleStatusBackdrop();
            }
        }
        if (!allGroupAccess.length) {
            execute();
        }
    }, []);

    const handleNewRegister = () => {
        navigate("/acessos/grupo-acessos/cadastrar");
    };

    const handleEditRegister = (id: number) => {
        navigate(`/acessos/grupo-acessos/${id}`);
    };

    const handleRemove = (id_access_group: number) => {
        confirm({
            title: `Deseja realmente apagar o registro ?`,
            description: "O registro de grupo de acesso será removido.",
        })
            .then(async () => {
                try {
                    setLoading(true);

                    await deleteAccessGroup(id_access_group);
                    const access_group = allGroupAccess.filter((value) => value.id !== id_access_group);

                    setAllGroupAccess(access_group);
                    toast.success(`Registro removido com sucesso`);
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                } finally {
                    setLoading(false);
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
                            onClick={() => handleEditRegister(cellValues.row.id)}
                            color='success'
                            title='Editar'
                            aria-label='Editar registro'>
                            <EditIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => handleRemove(cellValues.row.id)}
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
            headerName: "Grupo de acesso",
            minWidth: 300,
        },
        {
            field: "description",
            headerName: "Descrição",
            minWidth: 150,
            flex: 1,
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
                        <Typography color='text.secondary'>Grupos de Acessos</Typography>
                    </Breadcrumbs>
                </Grid>
            </Grid>
            <BoxMain isDivider={false} mt={0}>
                <Grid container>
                    <DataGrid
                        autoHeight
                        rows={allGroupAccess}
                        columns={columns}
                        density='compact'
                        localeText={dataGridLocaleTextTranslateFull}
                        loading={loading}
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
                </Grid>

                <BasicSpeedDial
                    ariaLabel='Opções'
                    title='Opções'
                    open={speedDialOpen}
                    onClick={() => setSpeedDialOpen((oldValue) => !oldValue)}
                    actions={[
                        {
                            icon: <AddCircleOutlineOutlinedIcon color='action' />,
                            name: "Novo Grupo de Acesso",
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
