import { useEffect, useState } from "react";
import { Button, Grid, IconButton, Stack, Typography } from "@mui/material";
import FormAutocompleteMultiple from "@/components/FormComponents/FormAutocompleteMultiple";
import { useForm } from "react-hook-form";
import { DataGrid, GridColDef, GridToolbar, GridToolbarQuickFilter } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";
import { useStepper } from "@/contexts/PortfoliosStepperContext";
import { useNavigate } from "react-router-dom";
import { createPortfolio, updatePortfolio } from "@/services/portfolios";
import {
    AutoCompleteNumber,
    IPortfoliosUpdateColumn,
    ISearchCollaborator,
    SearchAllParamsPortfoliosById,
} from "@/types/portfolios";
import { useConfirm } from "material-ui-confirm";
import { StepperChildrenProps } from "@/components/Stepper/Context/CustomizedSteppers";
import { dataGridLocaleTextTranslateFull, getDataGridStyles } from "@/components/DataGrid/dataGridStyles";
import moment from "moment";

type IAutoFormMultiple = {
    collaborator: AutoCompleteNumber[];
};

type Props = {
    dataValues?: SearchAllParamsPortfoliosById;
    idPortfolio?: number;
    updateColumn?: (params: IPortfoliosUpdateColumn) => void;
} & StepperChildrenProps;

export function Collaborators({ goBack, finalize, onClose, dataValues, idPortfolio, updateColumn }: Props) {
    const {
        collaboratorsDataSaved,
        setCollaboratorsDataSaved,
        portfolioDataSaved,
        setListDeleteCollaborators,
        listDeleteCollaborators,
        setListAddedCollaborators,
        listAddedCollaborators,
        setListIdsCollaboratorsDataBase,
        listIdsCollaboratorsDataBase,
    } = useStepper();
    const { toggleStatusBackdrop, getInfoError, colorBorderSystem, colorScrollSystem } = useGlobal();

    const [employeeOfPortfolio, setEmployeeOfPortfolio] = useState<ISearchCollaborator[]>(
        dataValues?.employees_portfolio ? dataValues?.employees_portfolio : [],
    );
    const [selectedCollaborators, setSelectedCollaborators] = useState<ISearchCollaborator[]>(
        collaboratorsDataSaved ? collaboratorsDataSaved : (dataValues?.collaborators ?? []),
    );

    const navigate = useNavigate();
    const confirm = useConfirm();

    const {
        handleSubmit,
        formState: { errors },
        control,
        watch,
        reset,
    } = useForm<IAutoFormMultiple>();

    const { collaborator } = watch();

    const QuickSearchToolbar = () => {
        return (
            <Grid sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
                <GridToolbar />
                <GridToolbarQuickFilter placeholder='Digite para pesquisar' />
            </Grid>
        );
    };

    const handleAddCollaborators = () => {
        if (collaborator && collaborator.length > 0) {
            const getValuesAutoFormMultiple = collaborator.map((employee) => ({
                id: employee.id,
                name: employee.label,
            }));

            const collaboratorIdsToAdd = getValuesAutoFormMultiple.map((collaborator) => collaborator.id);

            if (idPortfolio) {
                const newCollaborators = getValuesAutoFormMultiple.filter(
                    (collaborator) => !listIdsCollaboratorsDataBase.includes(collaborator.id),
                );

                const newCollaboratorIds = newCollaborators.map((collaborator) => collaborator.id);

                setListAddedCollaborators((prev) => [...prev, ...newCollaboratorIds]);
                setListDeleteCollaborators((prev) => prev.filter((id) => !newCollaboratorIds.includes(id)));
            }

            const updatedCollaborators = [...selectedCollaborators, ...getValuesAutoFormMultiple];

            reset();

            setSelectedCollaborators(updatedCollaborators);
            setCollaboratorsDataSaved(updatedCollaborators);

            setEmployeeOfPortfolio((prev) => prev.filter((employee) => !collaboratorIdsToAdd.includes(employee.id)));
        }
    };

    const handleRemoveCollaboratorDataGrid = (id_collaborator: number) => {
        confirm({
            title: `Deseja realmente remover o colaborador?`,
            description: "O colaborador será removido da carteira.",
        })
            .then(async () => {
                const removedCollaborator = selectedCollaborators.find(
                    (collaborator) => collaborator.id === id_collaborator,
                );

                setSelectedCollaborators((prev) =>
                    prev.filter((selectedCollaborators) => selectedCollaborators.id !== id_collaborator),
                );

                if (removedCollaborator) {
                    setEmployeeOfPortfolio((prev) => [
                        ...prev,
                        { id: removedCollaborator.id, name: removedCollaborator.name },
                    ]);
                }

                setCollaboratorsDataSaved((prev) =>
                    prev?.filter((collaboratorsDataSaved) => collaboratorsDataSaved.id !== id_collaborator),
                );

                if (idPortfolio) {
                    if (listIdsCollaboratorsDataBase.includes(id_collaborator)) {
                        setListDeleteCollaborators((prev) => [...prev, id_collaborator]);
                    }

                    setListAddedCollaborators((prev) => prev.filter((addedId) => addedId !== id_collaborator));
                }
            })
            .catch(() => {});
    };

    const onSubmit = () => {
        finalize(async () => {
            try {
                toggleStatusBackdrop();

                const params: any = {
                    portfolio: {
                        name: portfolioDataSaved?.name,
                        id_agency: portfolioDataSaved?.agencies.id,
                        ref_id: portfolioDataSaved?.ref_id ?? null,
                        portfolio_sisbr_id: portfolioDataSaved?.portfolio_sisbr_id ?? null,
                        is_visible: portfolioDataSaved?.is_visible.id,
                        is_global: portfolioDataSaved?.type_portfolio.id,
                        id_main_responsible: portfolioDataSaved?.main_responsible.id,
                        description: portfolioDataSaved?.description ?? null,
                    },
                    substitutes: portfolioDataSaved?.substitutes?.map((value) => ({ id_employee: value.id })) || [],
                    assistants: portfolioDataSaved?.assistants?.map((value) => ({ id_employee: value.id })) || [],
                };

                let countCollaboratorsUpdate: number = listIdsCollaboratorsDataBase.length;

                if (idPortfolio) {
                    const isCollaboratorChanged =
                        listDeleteCollaborators.length > 0 || listAddedCollaborators.length > 0;

                    if (isCollaboratorChanged) {
                        params.delete_collaborators = listDeleteCollaborators;
                        params.added_collaborators = listAddedCollaborators;

                        countCollaboratorsUpdate -= listDeleteCollaborators.length;
                        countCollaboratorsUpdate += listAddedCollaborators.length;
                    }

                    await updatePortfolio(idPortfolio, {
                        ...params,
                        delete_collaborators: params.delete_collaborators,
                        added_collaborators: params.added_collaborators,
                    });

                    updateColumn?.({
                        id: idPortfolio,
                        ref_id: params.portfolio.ref_id,
                        name: params.portfolio.name,
                        agency: portfolioDataSaved?.agencies.label,
                        main_responsible: portfolioDataSaved?.main_responsible.label,
                        is_global: params.portfolio.is_global,
                        count_substitute: params.substitutes.length,
                        count_assistant: params.assistants.length,
                        count_employee: countCollaboratorsUpdate,
                        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                    });

                    onClose?.();
                    toast.success("Carteira atualizada com sucesso!");
                } else {
                    params.collaborators =
                        collaboratorsDataSaved?.map((collaborator) => ({
                            id_employee: collaborator.id,
                        })) ?? [];

                    await createPortfolio(params);

                    navigate("/funcoes-administrativas/carteiras");
                    toast.success("Carteira criada com sucesso!");
                }
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                toggleStatusBackdrop();
            }
        });
    };

    const setValuesCollaboratorsByParams = async (dataValues: SearchAllParamsPortfoliosById) => {
        try {
            const { collaborators } = dataValues;

            setListIdsCollaboratorsDataBase(collaborators?.map((item) => item.id) ?? [0]);

            setCollaboratorsDataSaved(
                collaborators?.map((item) => ({
                    id: item.id,
                    name: item.name,
                })),
            );
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    useEffect(() => {
        if (collaboratorsDataSaved) {
            const savedCollaboratorIds = collaboratorsDataSaved.map((item) => item.id);

            const remainingCollaborators = employeeOfPortfolio.filter(
                (employee) => !savedCollaboratorIds.includes(employee.id),
            );

            if (remainingCollaborators.length !== employeeOfPortfolio.length) {
                setEmployeeOfPortfolio(remainingCollaborators);
            }

            setSelectedCollaborators(
                collaboratorsDataSaved.map((item) => ({
                    id: item.id,
                    name: item.name,
                })),
            );
        } else if (dataValues) {
            setValuesCollaboratorsByParams(dataValues);
        }
    }, [collaboratorsDataSaved]);

    const columns: GridColDef[] = [
        {
            field: "Opções",
            minWidth: 100,
            headerAlign: "center",
            align: "center",
            renderCell: (cellValues) => {
                return (
                    <Stack direction='row' spacing={1}>
                        <IconButton
                            onClick={() => handleRemoveCollaboratorDataGrid(cellValues.row.id)}
                            color='error'
                            title='Remover'
                            aria-label='Remover Carteira'>
                            <DeleteIcon />
                        </IconButton>
                    </Stack>
                );
            },
        },
        {
            field: "name",
            headerName: "Nome do colaborador",
            flex: 1,
        },
    ];

    return (
        <Grid container component={"form"} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2} mb={2}>
                <Grid item xs>
                    <FormAutocompleteMultiple
                        fullWidth
                        name='collaborator'
                        label='Colaboradores'
                        variant='outlined'
                        size='medium'
                        control={control}
                        errors={errors}
                        options={employeeOfPortfolio.map((employee) => ({ id: employee.id, label: employee.name }))}
                    />
                </Grid>
                <Grid item display='flex'>
                    <Button
                        type='button'
                        variant='contained'
                        onClick={handleAddCollaborators}
                        sx={{ borderRadius: "8px" }}
                        disabled={!collaborator || collaborator.length === 0}>
                        Adicionar
                    </Button>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Typography overflow='hidden' textOverflow='ellipses' fontSize={13} mb={1}>
                    Atenção: Os colaboradores listados abaixo terão permissão para visualizar esta carteira
                </Typography>
            </Grid>
            <DataGrid
                autoHeight
                rows={selectedCollaborators}
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
                }}
                pageSizeOptions={[10, 20, 30, 50, 100]}
                sx={getDataGridStyles(colorBorderSystem, colorScrollSystem)}
            />

            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} mt={2}>
                <Stack
                    spacing={1}
                    direction='row'
                    sx={{
                        width: "100%",
                        justifyContent: "space-between",
                    }}>
                    <Button
                        variant='outlined'
                        onClick={() => {
                            goBack?.();
                        }}
                        sx={{ borderRadius: "8px" }}>
                        <ArrowBackIcon sx={{ mr: 1 }} /> Voltar
                    </Button>
                    <Button type='submit' variant='contained' sx={{ borderRadius: "8px" }}>
                        {idPortfolio ? "Salvar " : "Finalizar "} <CheckIcon sx={{ ml: 1 }} />
                    </Button>
                </Stack>
            </Grid>
        </Grid>
    );
}
