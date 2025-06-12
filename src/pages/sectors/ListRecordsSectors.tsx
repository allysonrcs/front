import { useEffect, useState } from "react";
import { Breadcrumbs, Grid, IconButton, Stack, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar, GridToolbarQuickFilter } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { LoadingButton } from "@mui/lab";
import { useConfirm } from "material-ui-confirm";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { deleteSector, IsearchSector, searchProps, searchSector } from "@/services/sectors";
import { useGlobal } from "@/contexts/GlobalContext";
import { searchAutocompleteAgencies } from "@/services/agencies";
import { BoxMain } from "@/components/Box/BoxMain";
import { toast } from "react-toastify";
import { ArrayTypesStatus } from "@/constants/array-status";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { SectorsFields } from "./SectorsFields";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { formatDate } from "@/functions/date";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

type AutoCompleteNumber = {
    id: number;
    label: string;
};

type SectorPros = {
    id_agency: AutoCompleteNumber;
    is_active: AutoCompleteBoolean;
};

export function ListRecordsSectors() {
    const [autocomplete, setAutocomplete] = useState<AutoCompleteNumber[]>([]);
    const [savedFilters, setSavedFilters] = useState<searchProps>({});
    const [listSector, setListSector] = useState<IsearchSector[]>([]);
    const [loading, setLoading] = useState(false);
    const [edit, setEdit] = useState(false);
    const [sectorSelected, setSectorSelected] = useState<number>();
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

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SectorPros>();

    const refresh = async () => {
        let data;
        try {
            if (savedFilters) {
                data = await searchSector(savedFilters);
            }

            if (data) {
                setListSector(data);
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const handleNewRegister = () => {
        navigate("/funcoes-administrativas/setores/cadastrar");
    };

    const handleRemoveSector = (id_sector: number) => {
        confirm({
            title: "Deseja realmente apagar o registro?",
            description: "O registro do setor será excluído.",
        })
            .then(async () => {
                try {
                    await deleteSector(id_sector);
                    await refresh();

                    toast.success("Registro de setor removido com sucesso");
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                }
            })
            .catch(() => {});
    };

    const setAutocompleteOptions = async () => {
        try {
            const data = await searchAutocompleteAgencies({ is_active: true, with_restrict_agency: true });
            const refactor = data.map(({ id, abbreviation }) => {
                return { id: id, label: abbreviation };
            });
            setAutocomplete(refactor);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
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
                                setSectorSelected(cellValues.row.id);
                            }}
                            color='success'
                            title='Editar'
                            aria-label='Editar registro'>
                            <EditIcon />
                        </IconButton>

                        <IconButton
                            onClick={() => handleRemoveSector(cellValues.row.id)}
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
            field: "ref_sector_id",
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
            minWidth: 300,
            flex: 1,
        },
        {
            field: "abbreviation",
            headerName: "Apelido",
            minWidth: 120,
        },
        {
            field: "responsible_manager",
            headerName: "Gerente(s) Responsável(eis)",
            minWidth: 250,
        },
        {
            field: "responsible_superior",
            headerName: "Superior(es) Imediato(s)",
            minWidth: 250,
        },
        {
            field: "abbreviation_agency",
            headerName: "Agência",
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
        {
            field: "created_at",
            headerName: "Data Cadastro",
            minWidth: 120,
            renderCell: ({ value }) => {
                return <Typography>{formatDate(value, "DD/MM/YYYY")}</Typography>;
            },
        },
        {
            field: "updated_at",
            headerName: "Data Atualização",
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

    const onSubmit = async (params: SectorPros) => {
        let refactor = {};

        if (params.id_agency) {
            refactor = { ...refactor, id_agency: params.id_agency?.id };
        }

        if (params.is_active) {
            refactor = { ...refactor, is_active: params.is_active?.id };
        }

        try {
            setLoading(true);
            const data = await searchSector(refactor);

            setSavedFilters(refactor);
            setListSector(data);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
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

    useEffect(() => {
        async function execute() {
            try {
                toggleStatusBackdrop();

                await setAutocompleteOptions();
                const data = await searchSector({});
                setListSector(data);
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                toggleStatusBackdrop();
            }
        }

        execute();
    }, []);

    const handleDataGridChange = (data: IsearchSector) => {
        setListSector((prev) => {
            const newRole = prev;
            return newRole.map((value) => {
                if (data.id == value.id) {
                    return { ...value, ...data };
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
                            <SettingsOutlinedIcon sx={{ color: theme === "light" ? "#5e5e5e" : "#FFFFFF", mr: 0.5 }} />
                            Funções Administrativas
                        </Typography>
                        <Typography color='text.secondary'>Setores</Typography>
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
                    <Grid item xs={12} md={6}>
                        <FormAutocomplete
                            fullWidth
                            name='id_agency'
                            label='Agência'
                            variant='outlined'
                            size='medium'
                            control={control}
                            errors={errors}
                            options={autocomplete}
                        />
                    </Grid>

                    <Grid item xs={6} md={4}>
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
                    rows={listSector}
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
                    sx={getDataGridStyles(colorBorderSystem, colorScrollSystem)}
                />

                <TemporaryDrawer
                    open={edit}
                    title='Setor'
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
                    <SectorsFields p={3} idSector={sectorSelected} updateFunc={handleDataGridChange} />
                </TemporaryDrawer>

                <BasicSpeedDial
                    ariaLabel='Opções'
                    title='Opções'
                    open={speedDialOpen}
                    onClick={() => setSpeedDialOpen((oldValue) => !oldValue)}
                    actions={[
                        {
                            icon: <AddCircleOutlineOutlinedIcon color='action' />,
                            name: "Novo Setor",
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
