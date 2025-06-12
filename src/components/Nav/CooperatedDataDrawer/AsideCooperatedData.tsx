import {
    Avatar,
    Badge,
    Box,
    Grid,
    Icon,
    IconButton,
    Paper,
    Stack,
    SxProps,
    Typography,
    useTheme,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Divider,
    Chip,
    useMediaQuery,
} from "@mui/material";
import { useGlobal } from "@/contexts/GlobalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { VariableSizeList, ListChildComponentProps } from "react-window";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { formatTimeAgo } from "@/functions/date";
import { ICooperatedDataHistoryProps, IListCooperatedData, useCooperatedData } from "@/contexts/CooperatedDataContext";
import { DataGrid, GridColDef, GridPagination, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import { formatCnpjCpf, isValidCNPJ, isValidCPF } from "@/functions/number";
import { useConfirm } from "material-ui-confirm";
import FormInputCpfCnpj from "@/components/FormComponents/FormInputCpfCnpj";
import FormInput from "@/components/FormComponents/FormInput";
import AutoSizer from "react-virtualized-auto-sizer";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import SearchIcon from "@mui/icons-material/Search";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";

interface OnSubmitFilter {
    filter_id_client?: string | null;
    filter_document_client?: string | null;
    filter_client_name?: string | null;
}

const validationSchema = Yup.object().shape({
    filter_id_client: Yup.string()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
        .nullable(),
    filter_document_client: Yup.string()
        .max(18, "Máximo 18 caracteres")
        .transform((value) => value.replace(/[\.\-\/]/g, ""))
        .nullable()
        .trim(),
    filter_client_name: Yup.string().max(255, "Máximo 255 caracteres").nullable().uppercase().trim(),
});

export function AsideCooperatedData() {
    const [loadingButton, setLoadingButton] = useState<boolean>(false);
    const [loadingDataGrid, setLoadingDataGrid] = useState<boolean>(false);

    const {
        filterMode,
        cooperatedList,
        cooperatedListHistory,
        setCooperatedList,
        setCooperatedHistoryList,
        fetchListAsideCooperatedData,
        selectCooperatedDataContent,
        toggleDrawer,
        closeDrawer,
        setFilterMode,
    } = useCooperatedData();

    const { getInfoError, theme: themeContext, colorScrollSystem } = useGlobal();

    const themeUI = useTheme();
    const smDown = useMediaQuery(themeUI.breakpoints.down("md"));

    const confirm = useConfirm();

    const isThemeLight = themeContext === "light";

    const {
        handleSubmit,
        control,
        setError,
        setValue,
        formState: { errors },
    } = useForm<OnSubmitFilter>({
        resolver: yupResolver(validationSchema, { context: { isSubmitting: true } }),
    });

    const sxSearchSectionProps: SxProps = {
        padding: "0.45rem 0.45rem",
        display: "flex",
        borderRadius: 1.5,
        bgcolor: isThemeLight ? "#ffffffda" : "#00161bd5",
        marginBlock: 1,
        borderColor:
            filterMode === "document" && errors.filter_document_client ? themeUI.palette.error.light : "outlined",
    };

    const onSubmitExtClients = async (params: OnSubmitFilter) => {
        let refactor: any = {};

        if (filterMode === "document" && params.filter_document_client) {
            const raw = params.filter_document_client;
            if (raw.length === 11) {
                const isValid = isValidCPF(raw);
                if (!isValid) {
                    setError("filter_document_client", {
                        type: "manual",
                        message: "CPF inválido. Verifique os dados inseridos.",
                    });
                    toast.error("CPF inválido. Verifique os dados inseridos.");
                    return false;
                }
            } else if (raw.length === 14) {
                const isValid = isValidCNPJ(raw);
                if (!isValid) {
                    setError("filter_document_client", {
                        type: "manual",
                        message: "CNPJ inválido. Verifique os dados inseridos.",
                    });
                    toast.error("CNPJ inválido. Verifique os dados inseridos.");
                    return false;
                }
            } else {
                setError("filter_document_client", {
                    type: "manual",
                    message: "Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ).",
                });
                toast.error("Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ).");
                return false;
            }
        }

        if (filterMode === "id" && params.filter_id_client != null) {
            refactor = { cliente_id: Number(params.filter_id_client) };
        } else if (filterMode === "document" && params.filter_document_client) {
            refactor = { cliente_documento: params.filter_document_client };
        } else if (filterMode === "name" && params.filter_client_name) {
            refactor = { cliente_nome: params.filter_client_name };
        }

        const hasAnyValue =
            (filterMode === "id" && params.filter_id_client != null) ||
            (filterMode === "document" && params.filter_document_client) ||
            (filterMode === "name" && params.filter_client_name);
        if (!hasAnyValue) {
            toast.warn("Preencha o campo correspondente ao filtro selecionado.");
            return false;
        }

        try {
            setLoadingButton(true);
            setLoadingDataGrid(true);

            await fetchListAsideCooperatedData({
                ...refactor,
                filtro_agencia: false,
            });

            toast.success("Consulta Cooperado realizado com sucesso!");
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoadingDataGrid(false);

            setTimeout(() => {
                setLoadingButton(false);
            }, 2000);
        }
    };

    const handleClickSelectCooperated = async (id: number) => {
        try {
            selectCooperatedDataContent(id);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const handleRemoveAll = () => {
        confirm({
            title: `Confirmação: limpar lista de cooperados`,
            description: "Todos os cooperados exibidos na pesquisa serão removidos. Esta ação não pode ser desfeita.",
        })
            .then(async () => {
                try {
                    setLoadingButton(true);

                    setCooperatedList?.([]);
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                } finally {
                    setLoadingButton(false);
                }
            })
            .catch(() => {});
    };

    function buttonDeleteRowsPermissions() {
        return (
            <Stack
                direction='row'
                spacing={1}
                alignItems='center'
                justifyContent='space-between'
                sx={{ width: "100%" }}>
                <Box>
                    {cooperatedList.length > 1 && (
                        <Tooltip title='Limpar lista de cooperados'>
                            <span>
                                <IconButton
                                    size='large'
                                    color='error'
                                    onClick={handleRemoveAll}
                                    disabled={cooperatedList.length === 0}
                                    sx={{ ml: 1.25 }}>
                                    <DeleteSweepOutlinedIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    )}
                </Box>
                <GridPagination />
            </Stack>
        );
    }

    const QuickSearchToolbar = () => {
        return (
            <GridToolbarContainer>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        width: "100%",
                    }}>
                    <Box sx={{ p: 0.25 }}>
                        <GridToolbarQuickFilter placeholder='Digite para pesquisar' />
                    </Box>
                </Box>
            </GridToolbarContainer>
        );
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                toggleDrawer();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const columns: GridColDef[] = [
        {
            field: "id",
            headerName: "ID",
            minWidth: 65,
        },
        {
            field: "cliente_nome",
            headerName: "Nome",
            minWidth: 100,
            flex: 1,
            renderCell: (cellValues) => {
                return (
                    <Tooltip title={`${cellValues.row.e_rural ? "🌱" : ""} ${cellValues.row.cliente_nome}`}>
                        <Typography
                            fontSize={
                                12
                            }>{`${cellValues.row.e_rural ? "🌱" : ""} ${cellValues.row.cliente_nome}`}</Typography>
                    </Tooltip>
                );
            },
        },
        {
            field: "cliente_documento",
            headerName: "CPF/CNPJ",
            minWidth: 120,
            renderCell: ({ value }) => {
                return <Typography fontSize={12}>{formatCnpjCpf(value)}</Typography>;
            },
        },
        {
            field: "agencia_id",
            headerName: "PA",
            width: 40,
            renderCell: ({ value }) => {
                return <Typography fontSize={12}>{value}</Typography>;
            },
        },
        {
            field: "carteira_nome",
            headerName: "Carteira",
            minWidth: 110,
            renderCell: ({ value }) => {
                return <Typography fontSize={12}>{value}</Typography>;
            },
        },
        {
            field: "cliente_tipo",
            headerName: "Tipo",
            headerAlign: "center",
            align: "center",
            width: 50,
            renderCell: ({ value }) => {
                return <Typography fontSize={12}>{value}</Typography>;
            },
        },
    ];

    function RenderList(props: ListChildComponentProps) {
        const { index, style } = props;
        const { id, name, document, agency, portfolio, client_type, is_rural, is_cooperated, created_at } =
            props.data[index];

        return (
            <Paper
                variant='outlined'
                style={style}
                onClick={() => {
                    const newHistoryItem: ICooperatedDataHistoryProps = {
                        id: id,
                        name: name,
                        document: document,
                        agency: String(agency),
                        portfolio: portfolio,
                        client_type: client_type,
                        is_rural: is_rural,
                        is_cooperated: is_cooperated,
                        created_at: new Date().toISOString(),
                    };

                    setCooperatedHistoryList((prev) => {
                        const filtered = prev.filter((item) => item.id !== newHistoryItem.id);

                        const updated = [newHistoryItem, ...filtered];

                        return updated.slice(0, 10);
                    });

                    handleClickSelectCooperated(id);
                }}
                sx={{
                    bgcolor: isThemeLight ? "#ffffffda" : "#00161bd5",
                    borderBlock: "none",
                    borderBottom: `1px solid ${themeUI.palette.divider}`,
                    borderRadius: 0,
                    overflow: "hidden",
                    "&:first-of-type": {
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        borderTop: `1px solid ${themeUI.palette.divider}`,
                    },
                    "&:last-of-type": {
                        borderBottom: `1px solid ${themeUI.palette.divider}`,
                        borderBottomLeftRadius: 8,
                        borderBottomRightRadius: 8,
                    },
                    "&:hover": {
                        backgroundColor: isThemeLight ? "#7DB61C22" : "background.default",
                        cursor: "pointer",
                    },
                }}>
                <Box sx={{ padding: 1.75 }}>
                    <Stack direction='row' spacing={1.5} alignItems='center'>
                        <Box display='flex' alignItems='center' minWidth={43} height={50}>
                            <Badge
                                overlap='circular'
                                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                badgeContent={
                                    <HistoryOutlinedIcon
                                        sx={{
                                            fontSize: 18,
                                            color: isThemeLight ? "#7DB61C" : "#a4e03b",
                                            borderRadius: 50,
                                            background: isThemeLight ? "#f4f6f8" : "#00232B",
                                            boxShadow: "0px 2px 4px 0px rgba(125, 132, 139, 0.16)",
                                        }}
                                    />
                                }>
                                <Avatar
                                    sx={{
                                        textTransform: "uppercase",
                                        backgroundColor: isThemeLight ? "#7eb61c2d" : "#a3e03b34",
                                        color: "#ffffff",
                                        border: "1px solid",
                                        borderColor: isThemeLight ? "#7DB61C" : "#a4e03b",
                                    }}>
                                    <Icon
                                        className='material-icons-outlined'
                                        sx={{
                                            color: isThemeLight ? "#7DB61C" : "#a4e03b",
                                        }}>
                                        account_circle_Icon
                                    </Icon>
                                </Avatar>
                            </Badge>
                        </Box>

                        <Box flexGrow={1} minWidth={0}>
                            <Typography
                                fontWeight='bold'
                                fontSize={14}
                                color='text.primary'
                                noWrap
                                overflow='hidden'
                                textOverflow='ellipsis'
                                whiteSpace='nowrap'>
                                {`${is_rural ? "🌱" : ""} ${name}`}
                            </Typography>

                            <Typography
                                variant='body2'
                                color={isThemeLight ? "#7DB61C" : "#a4e03b"}
                                fontSize='0.67rem'
                                lineHeight={1.2}
                                noWrap
                                overflow='hidden'
                                textOverflow='ellipsis'
                                whiteSpace='nowrap'>
                                {formatCnpjCpf(document)}
                            </Typography>

                            <Typography
                                variant='body2'
                                color='text.secondary'
                                fontSize='0.8rem'
                                noWrap
                                overflow='hidden'
                                textOverflow='ellipsis'
                                whiteSpace='nowrap'>
                                {id + " | " + agency + " | " + portfolio}
                            </Typography>
                        </Box>

                        <Box
                            textAlign='right'
                            sx={{
                                minWidth: "auto",
                                flexShrink: 0,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                            }}>
                            <Typography variant='caption' fontSize={12} color='text.secondary'>
                                {formatTimeAgo(created_at)}
                            </Typography>
                            <Typography variant='caption' fontSize={12} color='text.secondary'>
                                {client_type}
                            </Typography>
                            <Box
                                width={8}
                                height={8}
                                borderRadius='50%'
                                bgcolor={
                                    is_cooperated
                                        ? isThemeLight
                                            ? "#7DB61C"
                                            : "#a4e03b"
                                        : isThemeLight
                                          ? "#e00e0e"
                                          : "#FB8382"
                                }
                                mt={0.5}
                                ml='auto'
                            />
                        </Box>
                    </Stack>
                </Box>
            </Paper>
        );
    }

    return (
        <Grid container height='100%' p='1rem' gap={1}>
            <Grid item width='100%'>
                <Grid
                    container
                    mt={-1.5}
                    mb={0.5}
                    sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "nowrap",
                    }}>
                    <Stack direction='row' gap={1}>
                        <AccountCircleOutlinedIcon color='success' />
                        <Typography
                            sx={{
                                fontSize: "18px",
                                fontWeight: "bold",
                            }}>
                            Consulta Cooperado
                        </Typography>
                    </Stack>
                    <Stack direction='row' gap={1}>
                        <IconButton sx={{ mr: -1 }} onClick={() => closeDrawer()} title='Fechar'>
                            <HighlightOffIcon />
                        </IconButton>
                    </Stack>
                </Grid>

                <Grid item xs={12} mt={-1.5} display={smDown ? "none" : "block"}>
                    <Typography fontSize={9} color={"#679c0e"} fontWeight='100'>
                        Selecione uma das opções abaixo para filtrar os cooperados por CPF/CNPJ, ID ou Nome/Razão
                        Social.
                    </Typography>
                </Grid>

                <Grid item xs={12} marginBlock={!smDown ? 1 : 0}>
                    <ToggleButtonGroup
                        fullWidth
                        value={filterMode}
                        exclusive
                        size='small'
                        onChange={(_, mode) => mode && setFilterMode(mode)}
                        sx={{ backgroundColor: isThemeLight ? "#ffffffda" : "#00161bd5" }}>
                        <ToggleButton
                            value='id'
                            sx={{
                                "&.Mui-selected": {
                                    bgcolor: "#7DB61C",
                                    color: "#ffffff",
                                    fontWeight: "bold",
                                },
                                "&.Mui-selected:hover": {
                                    bgcolor: "#679c0e",
                                },
                            }}>
                            ID
                        </ToggleButton>
                        <ToggleButton
                            value='document'
                            sx={{
                                "&.Mui-selected": {
                                    bgcolor: "#7DB61C",
                                    color: "#ffffff",
                                    fontWeight: "bold",
                                },
                                "&.Mui-selected:hover": {
                                    bgcolor: "#679c0e",
                                },
                            }}>
                            CPF/CNPJ
                        </ToggleButton>
                        <ToggleButton
                            value='name'
                            sx={{
                                "&.Mui-selected": {
                                    bgcolor: "#7DB61C",
                                    color: "#ffffff",
                                    fontWeight: "bold",
                                },
                                "&.Mui-selected:hover": {
                                    bgcolor: "#679c0e",
                                },
                            }}>
                            {!smDown ? "Nome/Razão Social" : "Nome"}
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Grid>

                <Paper
                    component='form'
                    onSubmit={handleSubmit(onSubmitExtClients)}
                    variant='outlined'
                    sx={sxSearchSectionProps}>
                    <Tooltip title='Clique para iniciar a busca'>
                        <IconButton
                            aria-label='Pesquisar Cooperado'
                            onClick={handleSubmit(onSubmitExtClients)}
                            disabled={loadingButton}>
                            <SearchIcon color={"inherit"} />
                        </IconButton>
                    </Tooltip>

                    {filterMode === "id" && (
                        <FormInput
                            fullWidth
                            name='filter_id_client'
                            placeholder='Escreva o ID do cooperado'
                            variant='outlined'
                            size='small'
                            control={control}
                            errors={errors}
                            type='text'
                            inputProps={{
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (
                                        (e.ctrlKey || e.metaKey) &&
                                        ["c", "v", "x", "a"].includes(e.key.toLowerCase())
                                    ) {
                                        return;
                                    }

                                    const allowedKeys = [
                                        "Enter",
                                        "Backspace",
                                        "Delete",
                                        "ArrowLeft",
                                        "ArrowRight",
                                        "Tab",
                                    ];

                                    if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
                                        e.preventDefault();
                                    }
                                },
                                onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
                                    const paste = e.clipboardData.getData("text");
                                    if (!/^[0-9]+$/.test(paste)) {
                                        e.preventDefault();
                                    }
                                },
                            }}
                            InputLabelProps={{
                                sx: { display: "none" },
                            }}
                            InputProps={{
                                sx: {
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: "none",
                                    },
                                },
                            }}
                        />
                    )}

                    {filterMode === "document" && (
                        <FormInputCpfCnpj
                            fullWidth
                            name='filter_document_client'
                            placeholder='Digite o CPF ou CNPJ do cooperado'
                            size='small'
                            variant='outlined'
                            control={control}
                            errors={errors}
                            InputLabelProps={{
                                sx: {
                                    display: "none",
                                },
                            }}
                            InputProps={{
                                sx: {
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: "none",
                                    },
                                },
                            }}
                        />
                    )}

                    {filterMode === "name" && (
                        <FormInput
                            fullWidth
                            name='filter_client_name'
                            placeholder='Escreva o (nome/razão social) do cooperado'
                            variant='outlined'
                            size='small'
                            control={control}
                            errors={errors}
                            InputLabelProps={{
                                sx: {
                                    display: "none",
                                },
                            }}
                            InputProps={{
                                sx: {
                                    "& input": {
                                        textTransform: "uppercase",
                                    },
                                    "& input::placeholder": {
                                        textTransform: "none",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: "none",
                                    },
                                },
                            }}
                        />
                    )}

                    <Stack direction={"row"} gap={1}>
                        <Tooltip title='Limpar campo de pesquisa'>
                            <IconButton
                                onClick={() => {
                                    filterMode === "id"
                                        ? setValue("filter_id_client", "")
                                        : filterMode === "document"
                                          ? setValue("filter_document_client", "")
                                          : setValue("filter_client_name", "");
                                }}>
                                <ClearOutlinedIcon color={"inherit"} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Paper>

                <Grid item xs={12} md={12}>
                    <DataGrid
                        autoHeight
                        columns={columns}
                        rows={cooperatedList || []}
                        density='compact'
                        localeText={dataGridLocaleTextTranslateFull}
                        loading={loadingDataGrid}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 3,
                                },
                            },
                            columns: {
                                columnVisibilityModel: {
                                    id: false,
                                },
                            },
                        }}
                        slots={{
                            toolbar: QuickSearchToolbar,
                            pagination: buttonDeleteRowsPermissions,
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
                                    transform: "translate(44%, 52%)",
                                    zIndex: 1300,
                                    borderRadius: "8px",
                                    boxShadow:
                                        "0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)",
                                    backgroundColor: themeContext === "light" ? "#ffffff" : "#1F3D44",
                                },
                            },
                        }}
                        onRowClick={(params) => {
                            const row = params.row as IListCooperatedData;

                            const newHistoryItem: ICooperatedDataHistoryProps = {
                                id: row.id,
                                name: row.cliente_nome,
                                document: row.cliente_documento,
                                agency: String(row.agencia_id),
                                portfolio: row.carteira_nome,
                                client_type: row.cliente_tipo,
                                is_rural: row.e_rural,
                                is_cooperated: row.e_cooperado,
                                created_at: new Date().toISOString(),
                            };

                            setCooperatedHistoryList((prev) => {
                                const filtered = prev.filter((item) => item.id !== newHistoryItem.id);

                                const updated = [newHistoryItem, ...filtered];

                                return updated.slice(0, 10);
                            });

                            handleClickSelectCooperated(row.id);
                        }}
                        pageSizeOptions={[10, 25]}
                        sx={{
                            backgroundColor: isThemeLight ? "#ffffffda" : "#00161bd5",
                            ...getDataGridStyles(themeUI.palette.divider, colorScrollSystem),
                        }}
                    />
                </Grid>

                <Grid item xs={12} mt={!smDown ? 1 : 2}>
                    <Divider sx={{ borderStyle: "dashed" }}>
                        <Chip
                            label={`Histórico de consultas: ${cooperatedListHistory.length > 0 ? "(" + cooperatedListHistory.length + ")" : ""}`}
                            size='small'
                            color='info'
                            icon={<HistoryOutlinedIcon />}
                        />
                    </Divider>
                </Grid>

                <Grid
                    mt={1}
                    item
                    sx={{
                        width: "100%",
                        minWidth: "300px",
                        height:
                            cooperatedList.length >= 3
                                ? "calc(100% - 442px)"
                                : cooperatedList.length === 2
                                  ? "calc(100% - 404px)"
                                  : cooperatedList.length === 1
                                    ? "calc(100% - 368px)"
                                    : "calc(100% - 405px)",
                    }}>
                    {cooperatedListHistory && cooperatedListHistory.length > 0 ? (
                        <AutoSizer>
                            {({ height, width }) => (
                                <VariableSizeList
                                    height={height}
                                    width={width}
                                    itemData={cooperatedListHistory}
                                    itemCount={cooperatedListHistory.length}
                                    itemSize={() => 78}
                                    overscanCount={5}>
                                    {RenderList}
                                </VariableSizeList>
                            )}
                        </AutoSizer>
                    ) : (
                        <Grid
                            item
                            xs={12}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "8px",
                                padding: "10px",
                                minWidth: "300px",
                                width: "100%",
                                height: "100%",
                            }}>
                            <Typography color='text.secondary' sx={{ display: "inline-flex", alignItems: "center" }}>
                                <SearchOffOutlinedIcon color='success' sx={{ mr: 0.5 }} />
                                Nenhuma consulta realizada.
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Grid>
        </Grid>
    );
}
