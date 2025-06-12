import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Box, Breadcrumbs, Grid, IconButton, Modal, Stack, Typography } from "@mui/material";
import { BoxMain } from "@/components/Box/BoxMain";
import { LoadingButton } from "@mui/lab";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { ArrayTypesStatus } from "@/constants/array-status";
import { ArrayTypesPortfolio } from "@/constants/array-type-portfolio";
import { DataGrid, GridColDef, GridToolbar, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";
import { useConfirm } from "material-ui-confirm";
import { formatDate } from "@/functions/date";
import { IPortfoliosUpdateColumn, SearchPortfolios } from "@/types/portfolios";
import { deletePortfolio, ISearchPortfolios, searchListPortfolios } from "@/services/portfolios";
import { BoxModal } from "@/components/BoxModal/BoxModal";
import { PortfoliosFields } from "./PortfoliosFields";
import { searchAutocompleteAgencies } from "@/services/agencies";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";

type AutoCompleteAgenciesProps = {
    id: number;
    label: string;
};

type RefactParamsOnSubmit = {
    is_active?: boolean;
    is_global?: boolean;
    id_agency?: number;
};

export function ListRecordsPortfolios() {
    const [idPortfolio, setIdPortfolio] = useState<number>();
    const [listPortfolios, setListPortfolios] = useState<ISearchPortfolios[]>([]);
    const [autoCompleteAgencies, setAutoCompleteAgencies] = useState<AutoCompleteAgenciesProps[]>([]);
    const [openEditPortfolio, setOpenEditPortfolio] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);

    const navigate = useNavigate();
    const { getInfoError, toggleStatusBackdrop, colorBorderSystem, colorScrollSystem, theme } = useGlobal();
    const confirm = useConfirm();

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SearchPortfolios>();

    const handleNewRegister = () => {
        navigate("/funcoes-administrativas/carteiras/cadastrar");
    };

    const handleCloseModalPortfolio = () => {
        setOpenEditPortfolio((oldValue) => !oldValue);
    };

    const handleRemovePortfolio = (id: number) => {
        confirm({
            title: "Deseja realmente remover o registro?",
            description: "O registro de carteira será removido.",
        })
            .then(async () => {
                try {
                    await deletePortfolio(id);
                    setListPortfolios((prev) => prev.filter((portfolios) => portfolios.id !== id));
                    toast.success("Carteira excluída com sucesso!");
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                }
            })
            .catch(() => {});
    };

    const updateColumn = (dataPortfolio: IPortfoliosUpdateColumn) => {
        const data = listPortfolios.map((item) => {
            return item.id === dataPortfolio.id ? { ...item, ...dataPortfolio } : item;
        });
        setListPortfolios(data);
    };

    const QuickSearchToolbar = () => {
        return (
            <Grid sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
                <GridToolbar />
                <GridToolbarQuickFilter placeholder='Digite para pesquisar' />
            </Grid>
        );
    };

    const onSubmit = async (data: SearchPortfolios) => {
        try {
            setLoading(true);

            let refactor: RefactParamsOnSubmit = {};

            if (data.id_agency) {
                refactor = { ...refactor, id_agency: data.id_agency.id };
            }

            if (data.is_global) {
                refactor = { ...refactor, is_global: data.is_global?.id };
            }

            if (data.is_active) {
                refactor = { ...refactor, is_active: data.is_active?.id };
            }

            const result = await searchListPortfolios(refactor);
            setListPortfolios(result);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const setAutoCompleteAgenciesOptions = async () => {
        try {
            const dataAgencies = await searchAutocompleteAgencies({ is_active: true, with_restrict_agency: true });
            const refactor = dataAgencies.map(({ id, abbreviation }: any) => {
                return { id: id, label: abbreviation };
            });
            setAutoCompleteAgencies(refactor);
        } catch (error) {
            const { message } = await getInfoError(error);
            toast.error(message);
        }
    };

    useEffect(() => {
        async function execute() {
            try {
                toggleStatusBackdrop();

                await setAutoCompleteAgenciesOptions();

                const dataPortfolio = await searchListPortfolios({});
                setListPortfolios(dataPortfolio);
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
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
                    <>
                        <Stack direction='row' spacing={0.25}>
                            <IconButton
                                onClick={() => {
                                    setIdPortfolio(cellValues.row.id);
                                    handleCloseModalPortfolio();
                                }}
                                color='success'
                                title='Editar'
                                aria-label='Editar'>
                                <EditIcon />
                            </IconButton>
                        </Stack>

                        <Stack direction='row' spacing={1}>
                            <IconButton
                                onClick={() => handleRemovePortfolio(cellValues.row.id)}
                                color='error'
                                title='Excluir'
                                aria-label='Excluir'>
                                <DeleteIcon />
                            </IconButton>
                        </Stack>
                    </>
                );
            },
        },
        {
            field: "ref_id",
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
            field: "agency",
            headerName: "Agência",
            minWidth: 160,
        },
        {
            field: "main_responsible",
            headerName: "Gerente da Carteira",
            minWidth: 180,
        },
        {
            field: "is_global",
            headerName: "Tipo",
            minWidth: 120,
            description: "Segmento da Carteira",
            renderCell: ({ value }) => {
                return <Typography>{value ? "Global" : "Segmentada"}</Typography>;
            },
        },
        {
            field: "count_substitute",
            headerName: "Qtd. Substituto",
            headerAlign: "center",
            align: "center",
            minWidth: 120,
        },
        {
            field: "count_assistant",
            headerName: "Qtd. Assistentes",
            headerAlign: "center",
            align: "center",
            minWidth: 125,
        },
        {
            field: "count_employee",
            headerName: "Qtd. Colaboradores",
            headerAlign: "center",
            align: "center",
            minWidth: 145,
        },
        {
            field: "is_active",
            headerName: "Situação",
            width: 85,
            renderCell: ({ value }) => {
                return <Typography>{value ? "🟢 Ativo" : "🔴 Inativo"}</Typography>;
            },
        },
        {
            field: "created_at",
            headerName: "Data Cadastro",
            minWidth: 110,
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

    return (
        <>
            <Grid container spacing={1} justifyContent='center' paddingInline={2} mt={0} mb={0.75} wrap='wrap'>
                <Grid item xs={12} md={12}>
                    <Breadcrumbs aria-label='breadcrumb' separator='›'>
                        <Typography color='text.primary' sx={{ display: "inline-flex", alignItems: "center" }} pt={1}>
                            <SettingsOutlinedIcon sx={{ color: theme === "light" ? "#5e5e5e" : "#FFFFFF", mr: 0.5 }} />
                            Funções Administrativas
                        </Typography>
                        <Typography color='text.secondary'>Carteiras</Typography>
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
                            name='id_agency'
                            label='Agência'
                            variant='outlined'
                            size='medium'
                            control={control}
                            errors={errors}
                            options={autoCompleteAgencies}
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <FormAutocomplete
                            fullWidth
                            name='is_global'
                            label='Tipo Carteira'
                            variant='outlined'
                            size='medium'
                            control={control}
                            errors={errors}
                            options={ArrayTypesPortfolio}
                        />
                    </Grid>

                    <Grid item xs={6} md={3}>
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
                    rows={listPortfolios}
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

                <Modal open={openEditPortfolio}>
                    <Box>
                        <BoxModal
                            title={`Editar Carteira`}
                            handleClose={() => handleCloseModalPortfolio()}
                            width='60%'
                            height={"95vh"}
                            overflow={"auto"}>
                            <PortfoliosFields
                                idPortfolio={idPortfolio}
                                updateColumn={updateColumn}
                                onClose={handleCloseModalPortfolio}
                            />
                        </BoxModal>
                    </Box>
                </Modal>

                <BasicSpeedDial
                    ariaLabel='Opções'
                    title='Opções'
                    open={speedDialOpen}
                    onClick={() => setSpeedDialOpen((oldValue) => !oldValue)}
                    actions={[
                        {
                            icon: <AddCircleOutlineOutlinedIcon color='action' />,
                            name: "Nova Carteira",
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
