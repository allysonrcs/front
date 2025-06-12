import { useEffect, useState } from "react";
import { Breadcrumbs, Grid, IconButton, Stack, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar, GridToolbarQuickFilter } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SearchIcon from "@mui/icons-material/Search";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { LoadingButton } from "@mui/lab";
import { BoxMain } from "@/components/Box/BoxMain";
import { useForm } from "react-hook-form";
import { ArrayTypesWorkingBreaks } from "@/constants/array-working-breaks";
import { ArrayTypesStatus } from "@/constants/array-status";
import { searchAutocompleteAgencies } from "@/services/agencies";
import { useGlobal } from "@/contexts/GlobalContext";
import { useNavigate } from "react-router-dom";
import { IWorkingBreakProps, deleteWorkingBreak, getListWorkingBreak } from "@/services/working-breaks";
import { toast } from "react-toastify";
import { useConfirm } from "material-ui-confirm";
import { TemporaryDrawer } from "@/components/TemporaryDrawer/TemporaryDrawer";
import { WorkingBreaksFields } from "./WorkingBreaksFields";
import { useMediaQuery } from "@/contexts/MediaQueryContext";
import { formatDate } from "@/functions/date";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import moment from "moment";
import { BasicSpeedDial } from "@/components/BasicSpeedDial/BasicSpeedDial";

type autoCompleteAgencyProps = {
    id: number;
    label: string;
};

type autocompleteActiveProps = {
    id: boolean;
    label: string;
};

type autocompleteTypeProps = {
    id: string;
    label: string;
};

type workingBreakProps = {
    id_agency: autoCompleteAgencyProps;
    type: autocompleteTypeProps;
    is_active: autocompleteActiveProps;
};

export function ListRecordsWorkingBreaks() {
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
    const [autoCompleteAgency, setAutocompleteAgency] = useState<autoCompleteAgencyProps[]>([]);
    const [listIntervalInfo, setListIntervalInfo] = useState<IWorkingBreakProps[]>([]);
    const [loading, setLoading] = useState(false);
    const [edit, setEdit] = useState(false);
    const [intervalSelected, setIntervalSelected] = useState<number>();
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(true);

    const { device } = useMediaQuery();

    const confirm = useConfirm();

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<workingBreakProps>();

    async function onSubmit(params: workingBreakProps) {
        let refactor = {};

        if (params.id_agency) {
            refactor = { ...refactor, id_agency: params.id_agency?.id };
        }

        if (params.is_active) {
            refactor = { ...refactor, is_active: params.is_active?.id };
        }

        if (params.type) {
            refactor = { ...refactor, type: params.type?.id };
        }

        try {
            setLoading(true);
            const data = await getListWorkingBreak(refactor);
            setListIntervalInfo(data);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    }

    function handleRemoveInterval(id_working_break: number) {
        confirm({
            title: "Deseja realmente apagar o registro?",
            description: "O registro do intervalo será excluído.",
        })
            .then(async () => {
                try {
                    await deleteWorkingBreak(id_working_break);
                    setListIntervalInfo((prev) => prev.filter((intervals) => intervals.id !== id_working_break));
                    toast.success("Registro removido com sucesso");
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                }
            })
            .catch(() => {});
    }

    function handleNewRegister() {
        navigate("/funcoes-administrativas/intervalos/cadastrar");
    }

    const setAutocompleteOptions = async () => {
        try {
            toggleStatusBackdrop();

            const data = await searchAutocompleteAgencies({ is_active: true, with_restrict_agency: true });
            const refactor = data.map(({ id, abbreviation }) => {
                return { id: id, label: abbreviation };
            });

            setAutocompleteAgency(refactor);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
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
                                setIntervalSelected(cellValues.row.id);
                                setEdit(true);
                            }}
                            color='success'
                            title='Editar'
                            aria-label='Editar registro'>
                            <EditIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => handleRemoveInterval(cellValues.row.id)}
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
            field: "abbreviation_agency",
            headerName: "Agência",
            minWidth: 200,
        },
        {
            field: "type",
            headerName: "Tipo",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "time_start",
            headerName: "Horário início",
            minWidth: 150,
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography>{moment(value).format("HH:mm")}</Typography>;
            },
        },
        {
            field: "time_end",
            headerName: "Horário final",
            minWidth: 150,
            flex: 1,
            renderCell: ({ value }) => {
                return <Typography>{moment(value).format("HH:mm")}</Typography>;
            },
        },
        {
            field: "is_active",
            headerName: "Situação",
            minWidth: 150,
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
                const data = await getListWorkingBreak({});
                setListIntervalInfo(data);
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                toggleStatusBackdrop();
            }
        }
        execute();
    }, []);

    const handleDataGridChange = (data: IWorkingBreakProps) => {
        setListIntervalInfo((prev) => {
            const newRole = prev;
            return newRole.map((value) => {
                if (data.id == value.id) {
                    return {
                        ...value,
                        ...data,
                        abbreviation_agency: value.abbreviation_agency,
                    };
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
                        <Typography color='text.secondary'>Intervalos</Typography>
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
                    <Grid item xs={6} md={4}>
                        <FormAutocomplete
                            fullWidth
                            name='id_agency'
                            label='Agência'
                            variant='outlined'
                            size='medium'
                            control={control}
                            errors={errors}
                            options={autoCompleteAgency}
                        />
                    </Grid>

                    <Grid item xs={6} md={3}>
                        <FormAutocomplete
                            fullWidth
                            name='type'
                            label='Tipo'
                            variant='outlined'
                            size='medium'
                            control={control}
                            errors={errors}
                            options={ArrayTypesWorkingBreaks}
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
                    columns={columns}
                    rows={listIntervalInfo}
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
                    sx={{
                        "& .MuiDrawer-paperAnchorRight": {
                            width: device === "Mobile" ? "100%" : "none",
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
                    open={edit}
                    title='Intervalo'
                    closeButton={() => {
                        setEdit((prev) => !prev);
                    }}>
                    <WorkingBreaksFields p={3} idWorkingBreak={intervalSelected} updateFunc={handleDataGridChange} />
                </TemporaryDrawer>

                <BasicSpeedDial
                    ariaLabel='Opções'
                    title='Opções'
                    open={speedDialOpen}
                    onClick={() => setSpeedDialOpen((oldValue) => !oldValue)}
                    actions={[
                        {
                            icon: <AddCircleOutlineOutlinedIcon color='action' />,
                            name: "Novo Intervalo",
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
