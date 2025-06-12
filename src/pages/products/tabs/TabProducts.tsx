import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useGlobal } from "@/contexts/GlobalContext";
import { useConfirm } from "material-ui-confirm";
import { Grid, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { DataGrid, GridColDef, GridToolbar, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { formatDate } from "@/functions/date";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteProduct, searchListProducts } from "@/services/products";
import { ArrayTypesSegmentProducts } from "@/constants/array-type-segment-products";
import { ArrayTypesStatus } from "@/constants/array-status";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { ProductsFields } from "../ProductsFields";
import { IProductsUpdateColumn, ISearchListProducts } from "@/types/products";
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined";
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import PlusOneOutlinedIcon from "@mui/icons-material/PlusOneOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import NumbersOutlinedIcon from "@mui/icons-material/NumbersOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { ArrayTypesPolarityProducts } from "@/constants/array-type-porality-products";
import { ArrayTypesOperatorProducts } from "@/constants/array-type-operator-products";
import { searchAutoCompleteCooperatives } from "@/services/cooperatives";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { CustomPagination } from "@/components/DataGrid/dataGridPagination";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";

type AutoCompleteNumber = {
    id: number;
    label: string;
};

type AutoCompleteString = {
    id: string;
    label: string;
};

type AutoCompleteBoolean = {
    id: boolean;
    label: string;
};

type ProductsDataProps = {
    cooperatives?: AutoCompleteNumber;
    type_segment?: AutoCompleteString;
    type_polarity?: AutoCompleteString;
    type_operator?: AutoCompleteString;
    is_active?: AutoCompleteBoolean;
};

type SearchOnSubmitProps = {
    id_cooperative?: number;
    type_segment?: string;
    type_polarity?: string;
    type_operator?: string;
    is_active?: boolean;
};

export const TabProducts = () => {
    const [idProduct, setIdProduct] = useState<number>();
    const [listProducts, setListProducts] = useState<ISearchListProducts[]>([]);
    const [cooperatives, setCooperatives] = useState<AutoCompleteNumber[]>([]);
    const [openEditProduct, setOpenEditProduct] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);
    const [currentFilters, setCurrentFilters] = useState<ProductsDataProps>({});

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
    } = useForm<ProductsDataProps>();

    const handleNewRegister = () => {
        navigate("/funcoes-administrativas/produtos/cadastrar");
    };

    const handleCloseModalProduct = () => {
        setOpenEditProduct((oldValue) => !oldValue);
    };

    const handleRemoveProduct = (id: number) => {
        confirm({
            title: "Deseja realmente remover o registro?",
            description: "O registro de produto será removido.",
        })
            .then(async () => {
                try {
                    await deleteProduct(id);
                    setListProducts((prev) => prev.filter((product) => product.id !== id));
                    toast.success("Produto excluído com sucesso!");
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                }
            })
            .catch(() => {});
    };

    const hasActiveFilters = (filters: ProductsDataProps): boolean => {
        return !!(
            filters.cooperatives ||
            filters.type_segment ||
            filters.type_polarity ||
            filters.type_operator ||
            filters.is_active
        );
    };

    const onSubmit = async (data: ProductsDataProps) => {
        try {
            setLoading(true);

            let refactor: SearchOnSubmitProps = {};

            if (data.cooperatives) {
                refactor = { ...refactor, id_cooperative: data.cooperatives?.id };
            }

            if (data.type_segment) {
                refactor = { ...refactor, type_segment: data.type_segment?.id };
            }

            if (data.type_polarity) {
                refactor = { ...refactor, type_polarity: data.type_polarity?.id };
            }

            if (data.type_operator) {
                refactor = { ...refactor, type_operator: data.type_operator?.id };
            }

            if (data.is_active) {
                refactor = { ...refactor, is_active: data.is_active?.id };
            }

            const result = await searchListProducts(refactor);
            setListProducts(result);

            setCurrentFilters(data);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const { minProductId, maxProductId, availableIds } = useMemo(() => {
        const validProductIds = listProducts
            .filter((row) => row.product_sisbr_id)
            .map((row) => Number(row.product_sisbr_id));

        if (validProductIds.length === 0) {
            return { minProductId: null, maxProductId: null, availableIds: [] };
        }

        const minId = Math.min(...validProductIds);
        const maxId = Math.max(...validProductIds);

        const existingIdsSet = new Set(validProductIds);

        const available = [];
        let count = 0;
        const MAX_IDS_TO_SHOW = 100;

        for (let id = minId; id <= maxId && count < MAX_IDS_TO_SHOW; id++) {
            if (!existingIdsSet.has(id)) {
                available.push(id);
                count++;
            }
        }

        return {
            minProductId: minId,
            maxProductId: maxId,
            availableIds: available,
        };
    }, [listProducts]);

    const CountsAvailableIDs = () => {
        const availableIdsTooltip = useMemo(() => {
            if (!availableIds.length) return "Não há IDs disponíveis no intervalo";

            const formattedIds = [];
            const ITEMS_PER_ROW = 10;

            for (let i = 0; i < availableIds.length; i += ITEMS_PER_ROW) {
                formattedIds.push(availableIds.slice(i, i + ITEMS_PER_ROW).join(", "));
            }

            if (availableIds.length === 100) {
                formattedIds.push("... (mostrando apenas os primeiros 100 IDs disponíveis)");
            }

            return formattedIds.join("\n");
        }, [availableIds]);

        return (
            <Tooltip
                title={
                    <Typography variant='body2' style={{ whiteSpace: "pre-line", textAlign: "center" }}>
                        <b>IDs disponíveis para uso:</b>
                        <br />
                        {availableIdsTooltip}
                    </Typography>
                }
                placement='bottom'
                arrow>
                <Grid
                    item
                    xs={12}
                    sm='auto'
                    sx={{
                        display: device === "Mobile" ? "none" : "flex",
                        flexWrap: "wrap",
                        justifyContent: "left",
                        ml: 0.5,
                        gap: 1,
                        border: `1px dashed ${colorBorderSystem}`,
                        borderRadius: "16px",
                        padding: "0.40rem 0.90rem 0.40rem 0.65rem",
                        cursor: "help",
                    }}>
                    {minProductId !== null && maxProductId !== null ? (
                        <Typography variant='body2'>
                            ID Min: {minProductId} | ID Max: {maxProductId} |
                            <Typography
                                variant='body2'
                                component='span'
                                color={availableIds.length > 0 ? "primary" : "text.primary"}>
                                {` ${availableIds.length} IDs disponíveis`}
                            </Typography>
                        </Typography>
                    ) : (
                        <Typography variant='body2'> ID Min: 0 | ID Max: 0 | 0 IDs disponíveis</Typography>
                    )}
                </Grid>
            </Tooltip>
        );
    };

    const QuickSearchToolbar = () => {
        return (
            <Grid
                container
                sx={{ p: 1, display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <Grid
                    item
                    sx={{
                        p: 1,
                        display: device === "Mobile" ? "none" : "flex",
                        justifyContent: "start",
                        alignItems: "center",
                    }}>
                    <GridToolbar />

                    {!hasActiveFilters(currentFilters) && (
                        <Tooltip title='Contagem de produtos com base no filtro atual'>
                            <CountsAvailableIDs />
                        </Tooltip>
                    )}
                </Grid>

                <Grid item sx={{ p: 1, display: "flex", justifyContent: "end" }}>
                    <GridToolbarQuickFilter placeholder='Digite para pesquisar' />
                </Grid>
            </Grid>
        );
    };

    const updateColumn = (dataProduct: IProductsUpdateColumn) => {
        const data = listProducts.map((item) => {
            return item.id === dataProduct.id ? { ...item, ...dataProduct } : item;
        });
        setListProducts(data);
    };

    useEffect(() => {
        (async () => {
            try {
                toggleStatusBackdrop();

                const [dataListProducts, autocompletCooperatives] = await Promise.all([
                    searchListProducts({}),
                    searchAutoCompleteCooperatives({}),
                ]);

                setListProducts(dataListProducts);

                const formattedCooperatives = autocompletCooperatives.map((item) => ({
                    id: item.id,
                    label: item.abbreviation,
                }));

                setCooperatives(formattedCooperatives);
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
                                    setIdProduct(cellValues.row.id);
                                    handleCloseModalProduct();
                                }}
                                color='success'
                                title='Editar'
                                aria-label='Editar'>
                                <EditIcon />
                            </IconButton>

                            <IconButton
                                onClick={() => handleRemoveProduct(cellValues.row.id)}
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
            field: "product_sisbr_id",
            headerName: "ID Referência",
            headerAlign: "center",
            align: "center",
            minWidth: 100,
        },
        {
            field: "name",
            headerName: "Nome",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "coopcard_name",
            headerName: "Coopcard Descrição",
            minWidth: 220,
        },
        {
            field: "cooperative_name",
            headerName: "Cooperativa",
            minWidth: 180,
        },
        {
            field: "type_segment",
            headerName: "Segmento",
            minWidth: 110,
            renderCell: ({ value }) => {
                let label;

                switch (value) {
                    case "PF":
                        label = "PF";
                        break;
                    case "PJ":
                        label = "PJ";
                        break;
                    case "AMBOS":
                        label = "Ambos";
                        break;
                    case "RURAL":
                        label = "Rural";
                        break;
                    case "TODOS":
                        label = "Todos";
                        break;
                    case "INDEFINIDO":
                        label = "Indefinido";
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
            field: "type_polarity",
            headerName: "Polaridade",
            minWidth: 120,
            renderCell: ({ value }) => {
                let icon;
                let label;

                switch (value) {
                    case "SUBIR":
                        icon = <ArrowUpwardOutlinedIcon color='success' />;
                        label = "Subir";
                        break;
                    case "CAIR":
                        icon = <ArrowDownwardOutlinedIcon color='error' />;
                        label = "Cair";
                        break;
                    case "INDEFINIDO":
                        icon = <HelpOutlineIcon color='disabled' />;
                        label = "Indefinido";
                        break;
                    default:
                        icon = null;
                        label = value;
                }

                return (
                    <Stack direction='row' alignItems='center' justifyContent='center'>
                        {icon}
                        <Typography ml={1}>{label}</Typography>
                    </Stack>
                );
            },
        },
        {
            field: "type_operator",
            headerName: "Operação",
            minWidth: 150,
            renderCell: ({ value }) => {
                let icon;
                let label;

                switch (value) {
                    case "DINHEIRO":
                        icon = <AttachMoneyOutlinedIcon color='success' />;
                        label = "Dinheiro";
                        break;
                    case "PONTOS":
                        icon = <PlusOneOutlinedIcon color='primary' />;
                        label = "Pontos";
                        break;
                    case "PORCENTAGEM":
                        icon = <PercentOutlinedIcon color='info' />;
                        label = "Porcentagem";
                        break;
                    case "QUANTIDADE":
                        icon = <NumbersOutlinedIcon color='warning' />;
                        label = "Quantidade";
                        break;
                    case "INDEFINIDO":
                        icon = <HelpOutlineIcon color='disabled' />;
                        label = "Indefinido";
                        break;
                    default:
                        icon = null;
                        label = value;
                }

                return (
                    <Stack direction='row' alignItems='center' justifyContent='center'>
                        {icon}
                        <Typography ml={1}>{label}</Typography>
                    </Stack>
                );
            },
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
        <Grid item mt={2}>
            <Grid
                container
                component={"form"}
                direction='row'
                spacing={2}
                sx={{ paddingTop: 1, paddingBottom: 2 }}
                mb={1}
                onSubmit={handleSubmit(onSubmit)}>
                <Grid item xs={6} md={2}>
                    <FormAutocomplete
                        fullWidth
                        name='cooperatives'
                        label='Cooperativa'
                        variant='outlined'
                        size='medium'
                        control={control}
                        errors={errors}
                        options={cooperatives}
                    />
                </Grid>

                <Grid item xs={6} md={2.5}>
                    <FormAutocomplete
                        fullWidth
                        name='type_segment'
                        label='Segmento'
                        variant='outlined'
                        size='medium'
                        control={control}
                        errors={errors}
                        options={ArrayTypesSegmentProducts}
                    />
                </Grid>

                <Grid item xs={6} md={2}>
                    <FormAutocomplete
                        fullWidth
                        name='type_polarity'
                        label='Polaridade'
                        variant='outlined'
                        size='medium'
                        control={control}
                        errors={errors}
                        options={ArrayTypesPolarityProducts}
                    />
                </Grid>

                <Grid item xs={6} md={2}>
                    <FormAutocomplete
                        fullWidth
                        name='type_operator'
                        label='Operador'
                        variant='outlined'
                        size='medium'
                        control={control}
                        errors={errors}
                        options={ArrayTypesOperatorProducts}
                    />
                </Grid>

                <Grid item xs={6} md={1.5}>
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
                rows={listProducts}
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
                pageSizeOptions={[10, 30, 50, 100]}
                sx={getDataGridStyles(colorBorderSystem, colorScrollSystem)}
            />

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
                open={openEditProduct}
                title='Editar Produto'
                closeButton={() => {
                    setOpenEditProduct((prev) => !prev);
                }}>
                <ProductsFields idProduct={idProduct} updateColumn={updateColumn} marginTop={1} padding={3} />
            </TemporaryDrawer>

            <BasicSpeedDial
                ariaLabel='Opções'
                title='Opções'
                open={speedDialOpen}
                onClick={() => setSpeedDialOpen((oldValue) => !oldValue)}
                actions={[
                    {
                        icon: <AddCircleOutlineOutlinedIcon color='action' />,
                        name: "Novo Produto",
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
