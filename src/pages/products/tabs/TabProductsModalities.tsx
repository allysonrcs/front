import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useGlobal } from "@/contexts/GlobalContext";
import { useConfirm } from "material-ui-confirm";
import { Grid, IconButton, Stack, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { DataGrid, GridToolbar, GridColDef, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { formatDate } from "@/functions/date";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteProductModality, searchListProductsModalities } from "@/services/products";
import { ArrayTypesStatus } from "@/constants/array-status";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { IProductsUpdateColumn, ISearchListProductsModalities } from "@/types/products";
import { ProductsModalitiesFields } from "../ProductsModalitiesFields";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

type ProductsModalitiesDataProps = {
    is_active?: AutoCompleteBoolean;
};

type SearchOnSubmitProps = {
    is_active?: boolean;
};

export const TabProductsModalities = () => {
    const [idProductModality, setIdProductModality] = useState<number>();
    const [listProductsModalities, setListProductsModalities] = useState<ISearchListProductsModalities[]>([]);
    const [openEditProductModality, setOpenEditProductModality] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);
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

    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<ProductsModalitiesDataProps>();

    const handleNewRegister = () => {
        navigate("/funcoes-administrativas/produtos/modalidades/cadastrar");
    };

    const handleCloseModalProductModality = () => {
        setOpenEditProductModality((oldValue) => !oldValue);
    };

    const QuickSearchToolbar = () => {
        return (
            <Grid sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
                <GridToolbar />
                <GridToolbarQuickFilter placeholder='Digite para pesquisar' />
            </Grid>
        );
    };

    const handleRemoveProductModality = (id: number) => {
        confirm({
            title: "Deseja realmente remover o registro?",
            description: "O registro de modalidade de produto será removido.",
        })
            .then(async () => {
                try {
                    await deleteProductModality(id);
                    setListProductsModalities((prev) => prev.filter((product) => product.id !== id));
                    toast.success("Modalidade excluída com sucesso!");
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                }
            })
            .catch(() => {});
    };

    const onSubmit = async (data: ProductsModalitiesDataProps) => {
        try {
            setLoading(true);

            let refactor: SearchOnSubmitProps = {};

            if (data.is_active) {
                refactor = { ...refactor, is_active: data.is_active?.id };
            }

            const result = await searchListProductsModalities(refactor);
            setListProductsModalities(result);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const updateColumn = (dataProduct: IProductsUpdateColumn) => {
        const data = listProductsModalities.map((item) => {
            return item.id === dataProduct.id ? { ...item, ...dataProduct } : item;
        });
        setListProductsModalities(data);
    };

    useEffect(() => {
        (async () => {
            try {
                toggleStatusBackdrop();

                const dataListProducts = await searchListProductsModalities({});
                setListProductsModalities(dataListProducts);
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                toggleStatusBackdrop();
            }
        })();
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
                                    setIdProductModality(cellValues.row.id);
                                    handleCloseModalProductModality();
                                }}
                                color='success'
                                title='Editar'
                                aria-label='Editar'>
                                <EditIcon />
                            </IconButton>

                            <IconButton
                                onClick={() => handleRemoveProductModality(cellValues.row.id)}
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
            field: "name",
            headerName: "Nome",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "modality",
            headerName: "Modalidade",
            minWidth: 220,
        },
        {
            field: "multiplier",
            headerName: "Multiplicador",
            minWidth: 120,
        },
        {
            field: "product_name",
            headerName: "Nome do produto",
            minWidth: 270,
        },
        {
            field: "is_active",
            headerName: "Situação",
            width: 90,
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
        <Grid mt={2} mb={2}>
            <Grid
                container
                component={"form"}
                direction='row'
                spacing={2}
                sx={{ paddingTop: 1, paddingBottom: 2 }}
                mb={1}
                onSubmit={handleSubmit(onSubmit)}>
                <Grid item xs={7.5} md={10}>
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

                <Grid item xs={4.5} md={2}>
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
                rows={listProductsModalities}
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
                sx={{
                    "& .MuiDrawer-paperAnchorRight": {
                        width: device === "Mobile" ? "100%" : "75%",
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
                open={openEditProductModality}
                title='Editar Modalidade'
                closeButton={() => {
                    setOpenEditProductModality((prev) => !prev);
                }}>
                <ProductsModalitiesFields
                    idProductModality={idProductModality}
                    updateColumn={updateColumn}
                    marginTop={1}
                    padding={3}
                />
            </TemporaryDrawer>

            <BasicSpeedDial
                ariaLabel='Opções'
                title='Opções'
                open={speedDialOpen}
                onClick={() => setSpeedDialOpen((oldValue) => !oldValue)}
                actions={[
                    {
                        icon: <AddCircleOutlineOutlinedIcon color='action' />,
                        name: "Nova Modalidade",
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
        </Grid>
    );
};
