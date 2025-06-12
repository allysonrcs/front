import { useEffect } from "react";
import { Box, Button, Grid } from "@mui/material";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { useForm } from "react-hook-form";
import { ArrayTypesPortfolio } from "@/constants/array-type-portfolio";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";
import { IPortfolioDataProps, SearchAllParamsPortfoliosById } from "@/types/portfolios";
import { useStepper } from "@/contexts/PortfoliosStepperContext";
import { StepperChildrenProps } from "@/components/Stepper/Context/CustomizedSteppers";
import FormInput from "@/components/FormComponents/FormInput";
import FormAutocompleteMultiple from "@/components/FormComponents/FormAutocompleteMultiple";
import { ArrayTypesYesOrNo } from "@/constants/array-type-yes-or-no";

const validationSchema = Yup.object().shape({
    name: Yup.string().max(255, "Máximo 255 caracteres").required("Nome da Carteira é obrigatório").trim(),
    agencies: Yup.object()
        .shape({
            id: Yup.number().required("Obrigatório"),
            label: Yup.string().required("Obrigatório"),
        })
        .required("Agência é obrigatório!"),
    type_portfolio: Yup.object()
        .shape({
            id: Yup.boolean().required("Obrigatório"),
            label: Yup.string().required("Obrigatório"),
        })
        .required("Tipo Carteira é obrigatório!"),
    portfolio_sisbr_id: Yup.number()
        .nullable()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v)),
    is_visible: Yup.object()
        .shape({
            id: Yup.boolean().required("Obrigatório"),
            label: Yup.string().required("Obrigatório"),
        })
        .required("Tipo Carteira é obrigatório!"),
    ref_id: Yup.number()
        .nullable()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v)),
    main_responsible: Yup.object()
        .shape({
            id: Yup.number().required("Obrigatório"),
            label: Yup.string().required("Obrigatório"),
        })
        .required("Responsável Principal é obrigatório!"),
    description: Yup.string().max(4000, "Excedeu 4000 caracteres").nullable(),
    substitutes: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.number().required(),
                label: Yup.string().required(),
            }),
        )
        .min(1, "Você deve selecionar pelo menos 1 substituto")
        .max(3, "Você pode selecionar no máximo 3 substitutos")
        .required("Substitutos é obrigatório"),
    assistants: Yup.array()
        .of(
            Yup.object().shape({
                id: Yup.number().required(),
                label: Yup.string().required(),
            }),
        )
        .min(1, "Você deve selecionar pelo menos 1 assistente")
        .max(10, "Você pode selecionar no máximo 3 assistentes")
        .required("Assistentes é obrigatório"),
});

type Props = { dataValues?: SearchAllParamsPortfoliosById; idPortfolio?: number } & StepperChildrenProps;

export function Portfolio({ completed, dataValues, idPortfolio }: Props) {
    const { portfolioDataSaved, setPortfolioDataSaved } = useStepper();
    const { getInfoError, toggleStatusBackdrop } = useGlobal();

    const {
        handleSubmit,
        formState: { errors },
        control,
        setValue,
    } = useForm<IPortfolioDataProps>({
        resolver: yupResolver(validationSchema),
        defaultValues: portfolioDataSaved && {
            name: portfolioDataSaved.name,
            agencies: {
                id: portfolioDataSaved.agencies.id,
                label: portfolioDataSaved.agencies.label,
            },
            ref_id: portfolioDataSaved.ref_id,
            is_visible: {
                id: portfolioDataSaved.is_visible.id,
                label: portfolioDataSaved.is_visible.label,
            },
            portfolio_sisbr_id: portfolioDataSaved.portfolio_sisbr_id,
            type_portfolio: {
                id: portfolioDataSaved.type_portfolio.id,
                label: portfolioDataSaved.type_portfolio.label,
            },
            main_responsible: {
                id: portfolioDataSaved.main_responsible.id,
                label: portfolioDataSaved.main_responsible.label,
            },
            substitutes: portfolioDataSaved.substitutes.map((value) => ({
                id: value.id,
                label: value.label,
            })),
            assistants: portfolioDataSaved.assistants.map((value) => ({
                id: value.id,
                label: value.label,
            })),
            description: portfolioDataSaved.description,
        },
    });

    const goNext = () => {
        completed?.();
    };

    const onSubmit = async (data: IPortfolioDataProps) => {
        try {
            toggleStatusBackdrop();

            setPortfolioDataSaved({
                name: data.name,
                agencies: {
                    id: data.agencies.id,
                    label: data.agencies.label,
                },
                type_portfolio: {
                    id: data.type_portfolio.id,
                    label: data.type_portfolio.label,
                },
                is_visible: {
                    id: data.is_visible.id,
                    label: data.is_visible.label,
                },
                main_responsible: {
                    id: data.main_responsible.id,
                    label: data.main_responsible.label,
                },
                ref_id: data.ref_id,
                portfolio_sisbr_id: data.portfolio_sisbr_id,
                substitutes: data.substitutes.map((value) => ({
                    id: value.id,
                    label: value.label,
                })),
                assistants: data.assistants.map((value) => ({
                    id: value.id,
                    label: value.label,
                })),
                description: data?.description,
            });

            goNext();
        } catch (error) {
            const { message } = await getInfoError(error);
            toast.error(message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    const setValuesPortfolioByParams = async (dataValues: SearchAllParamsPortfoliosById) => {
        try {
            toggleStatusBackdrop();

            const {
                autocomplete_agencies,
                autocomplete_managers_employees,
                substitutes,
                assistants,
                id_agency,
                id_main_responsible,
                is_global,
                is_visible,
                name,
                ref_id,
                portfolio_sisbr_id,
                description,
            } = dataValues;

            const selectedAgencies = autocomplete_agencies?.find((value) => value.id === id_agency);
            if (selectedAgencies) {
                setValue("agencies", { id: selectedAgencies.id, label: selectedAgencies.label });
            }

            const selectedMainResponsiblePortfolio = autocomplete_managers_employees?.find(
                (value) => value.id === id_main_responsible,
            );
            if (selectedMainResponsiblePortfolio) {
                setValue("main_responsible", {
                    id: selectedMainResponsiblePortfolio.id,
                    label: selectedMainResponsiblePortfolio.label,
                });
            }

            const selectedTypePortfolio = ArrayTypesPortfolio.find((value) => value.id === is_global);
            if (selectedTypePortfolio) {
                setValue("type_portfolio", {
                    id: selectedTypePortfolio.id,
                    label: selectedTypePortfolio.label,
                });
            }

            const selectedTypeIsVisible = ArrayTypesYesOrNo.find((value) => value.id === is_visible);
            if (selectedTypeIsVisible) {
                setValue("is_visible", {
                    id: selectedTypeIsVisible.id,
                    label: selectedTypeIsVisible.label,
                });
            }

            if (substitutes) {
                const selectedSubstitutes = substitutes.map(({ id, label }) => ({ id, label }));
                setValue("substitutes", selectedSubstitutes);
            }

            if (assistants) {
                const selectedAssistants = assistants.map(({ id, label }) => ({ id, label }));
                setValue("assistants", selectedAssistants);
            }

            setValue("name", name ?? "");
            setValue("ref_id", ref_id);
            setValue("portfolio_sisbr_id", portfolio_sisbr_id);
            setValue("description", description);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    const setValuesPortfolioByCache = async (dataPortfolio: IPortfolioDataProps) => {
        try {
            toggleStatusBackdrop();

            setValue("name", dataPortfolio.name);
            setValue("ref_id", dataPortfolio.ref_id);
            setValue("portfolio_sisbr_id", dataPortfolio?.portfolio_sisbr_id);
            setValue("description", dataPortfolio?.description);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    useEffect(() => {
        if (portfolioDataSaved) {
            setValuesPortfolioByCache(portfolioDataSaved);
        } else if (dataValues) {
            setValuesPortfolioByParams(dataValues);
        }
    }, [dataValues]);

    return (
        <Grid component='form' container onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={4.5}>
                    <FormInput
                        fullWidth
                        name='name'
                        label='Nome'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>

                <Grid item xs={12} md={3.5}>
                    <FormAutocomplete
                        disabledAutocomplete={idPortfolio ? true : false}
                        disableClearable
                        fullWidth
                        name='agencies'
                        label='Agência'
                        variant='outlined'
                        control={control}
                        errors={errors}
                        options={
                            dataValues?.autocomplete_agencies?.map((value) => ({
                                id: value.id,
                                label: value.label,
                            })) || []
                        }
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <FormAutocomplete
                        fullWidth
                        name='type_portfolio'
                        label='Tipo Carteira'
                        variant='outlined'
                        size='medium'
                        control={control}
                        errors={errors}
                        options={ArrayTypesPortfolio}
                    />
                </Grid>

                <Grid item xs={12} md={3}>
                    <FormInput
                        fullWidth
                        label='ID Ref Carteira'
                        name='ref_id'
                        type='number'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>

                <Grid item xs={12} md={3}>
                    <FormAutocomplete
                        fullWidth
                        name='is_visible'
                        label='Visibilidade da Carteira'
                        variant='outlined'
                        size='medium'
                        control={control}
                        errors={errors}
                        options={ArrayTypesYesOrNo}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <FormAutocomplete
                        fullWidth
                        name='main_responsible'
                        label='Gerente da Carteira'
                        variant='outlined'
                        control={control}
                        errors={errors}
                        options={
                            dataValues?.autocomplete_managers_employees?.map((value) => ({
                                id: value.id,
                                label: value.label,
                            })) || []
                        }
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <FormAutocompleteMultiple
                        fullWidth
                        name='substitutes'
                        label='Substitutos'
                        variant='outlined'
                        size='medium'
                        control={control}
                        errors={errors}
                        options={
                            dataValues?.employees_portfolio?.map((value) => ({
                                id: value.id,
                                label: value.name,
                            })) || []
                        }
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <FormAutocompleteMultiple
                        fullWidth
                        name='assistants'
                        label='Assistentes'
                        variant='outlined'
                        size='medium'
                        control={control}
                        errors={errors}
                        options={
                            dataValues?.employees_portfolio?.map((value) => ({
                                id: value.id,
                                label: value.name,
                            })) || []
                        }
                    />
                </Grid>

                <Grid item xs={12} md={12}>
                    <FormInput
                        fullWidth
                        multiline
                        rows={2}
                        label='Descrição'
                        name='description'
                        type='text'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>
            </Grid>
            <Box flex={1} display='flex' justifyContent='end' mb={-1} mt={2}>
                <Button
                    type='submit'
                    variant='contained'
                    disabled={!dataValues && idPortfolio ? true : false}
                    sx={{ borderRadius: "8px" }}>
                    Avançar <ArrowForwardIcon sx={{ ml: 1 }} />
                </Button>
            </Box>
        </Grid>
    );
}
