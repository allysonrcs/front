import { useEffect, useState } from "react";
import { Alert, Box, BoxProps, Collapse, Grid, Icon, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import { useGlobal } from "@/contexts/GlobalContext";
import { BoxModal } from "@/components/BoxModal/BoxModal";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import FormDatePicker from "@/components/FormComponents/FormDatePicker";
import { searchAutocompleteAgencies } from "@/services/agencies";
import { searchProductivityDailyByID, validationProductivityDaily } from "@/services/productivities-control";
import { useConfirm } from "material-ui-confirm";
import { statusWithoutLabelMap } from "../ListRecordsProductivityDaily";
import { searchAutoCompletePortfolios } from "@/services/portfolios";
import moment from "moment";
import FormSwitchGroup from "@/components/FormComponents/FormSwitchGroup";

type AutoCompleteNumber = {
    id: number;
    label: string;
};

type ListAgencies = {
    id: number;
    label: string;
    agency_sisbr_id: number;
};

type ListPortfolios = {
    id: number;
    label: string;
    id_ref?: number | null;
    id_agency?: number | null;
};

export type ValidationProps = {
    mob_validation_agency: AutoCompleteNumber;
    mob_validation_portfolio: AutoCompleteNumber;
    mob_validation_date: Date;
    mob_validation_is_counted: boolean;
};

export interface IInfoProductivityDaily {
    id: number;
    status: string;
    client_name: string;
}

export type EditValidationProductivityProps = {
    id?: number;
    mob_validation_agency_name?: string;
    mob_validation_portfolio_name?: string;
    mob_validation_date?: string;
    mob_validation_is_counted?: boolean;
    updated_at?: string;
};

export type ModalValidationProductivityProps = {
    idProductivityDaily?: number;
    handleClose?: () => void;
    updateColumn?: (params: EditValidationProductivityProps) => void;
} & BoxProps;

export function ValidationProductivityDaily({
    idProductivityDaily,
    handleClose,
    updateColumn,
    ...props
}: ModalValidationProductivityProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [infoProductivityDaily, setInfoProductivityDaily] = useState<IInfoProductivityDaily>();
    const [listMobValidationAgencies, setListMobValidationAgencies] = useState<ListAgencies[]>([]);
    const [listMobValidationPortfolios, setListMobValidationPortfolios] = useState<ListPortfolios[]>([]);
    const { getInfoError } = useGlobal();
    const confirm = useConfirm();

    const validationProductivityDailySchema = Yup.object().shape({
        mob_validation_agency: Yup.object()
            .shape({
                id: Yup.number().required("Obrigatório"),
                label: Yup.string().required("Obrigatório"),
                agency_sisbr_id: Yup.number().nullable().optional(),
            })
            .required("Obrigatório"),
        mob_validation_portfolio: Yup.object()
            .shape({
                id: Yup.number().required("Obrigatório"),
                label: Yup.string().required("Obrigatório"),
                id_ref: Yup.number().nullable().optional(),
                id_agency: Yup.number().nullable().optional(),
            })
            .required("Obrigatório"),
        mob_validation_date: Yup.date().typeError("Digite uma data válida").required("Obrigatório"),
        mob_validation_is_counted: Yup.boolean().required("Obrigatório"),
    });

    const {
        handleSubmit,
        setValue,
        resetField,
        setError,
        watch,
        control,
        formState: { errors },
    } = useForm<ValidationProps>({ resolver: yupResolver(validationProductivityDailySchema) });

    const mobValidationAgencyWatch = watch("mob_validation_agency");
    const mobValidationPortfolioWatch = watch("mob_validation_portfolio");
    const mobValidationIsCountedPublicWatch = watch("mob_validation_is_counted");

    const onSubmitValidationProductivityDaily = async (params: ValidationProps) => {
        try {
            setLoading(true);

            if (idProductivityDaily) {
                if (!mobValidationPortfolioWatch.id || mobValidationPortfolioWatch.label.length === 0) {
                    setError("mob_validation_portfolio", { message: "Obrigatório", type: "required" });

                    toast.error("Carteira de validação é obrigatório!");
                    return;
                }

                await validationProductivityDaily(idProductivityDaily, {
                    mob_validation_agency_id: params.mob_validation_agency.id,
                    mob_validation_portfolio_id: params.mob_validation_portfolio.id,
                    mob_validation_date: params.mob_validation_date,
                    mob_validation_is_counted: params.mob_validation_is_counted,
                });

                updateColumn?.({
                    mob_validation_agency_name: params.mob_validation_agency.label,
                    mob_validation_portfolio_name: params.mob_validation_portfolio.label,
                    mob_validation_date: params.mob_validation_date
                        ? moment(params.mob_validation_date).format("YYYY-MM-DD")
                        : "-",
                    mob_validation_is_counted: params.mob_validation_is_counted,
                    updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                });

                toast.success(`Dados de Validação da produção alterado com sucesso!`);
                handleClose?.();
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const setValuesProductivityDailyByID = async (id_productivity_daily: number) => {
        try {
            setLoading(true);

            if (id_productivity_daily) {
                const {
                    id,
                    status,
                    client_name,
                    mob_validation_agency_ref_id,
                    mob_validation_portfolio_ref_id,
                    mob_validation_date,
                    mob_validation_is_counted,
                } = await searchProductivityDailyByID(id_productivity_daily);

                setInfoProductivityDaily({ id, status, client_name });

                mob_validation_date && setValue("mob_validation_date", mob_validation_date);
                setValue("mob_validation_is_counted", mob_validation_is_counted);

                setProductivityDailyOptions(mob_validation_agency_ref_id, mob_validation_portfolio_ref_id);
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const setProductivityDailyOptions = async (
        mob_validation_agency_ref_id: number,
        mob_validation_portfolio_ref_id: number,
    ) => {
        try {
            const [dataMobValidationAgencies, dataMobValidationPortfolios] = await Promise.all([
                searchAutocompleteAgencies({
                    with_agency_sisbr_id: true,
                    is_active: true,
                    with_restrict_agency: false,
                }),
                searchAutoCompletePortfolios({
                    agency_sisbr_id: mob_validation_agency_ref_id,
                    is_active: true,
                    with_restrict_agency: false,
                    has_id_ref: true,
                    has_id_agency: true,
                }),
            ]);

            const autoCompleteMobValidationAgencies = dataMobValidationAgencies
                .map(({ id, abbreviation, agency_sisbr_id }) => ({
                    id,
                    label: abbreviation,
                    agency_sisbr_id,
                }))
                .filter((value) => value.agency_sisbr_id !== 9999);

            setListMobValidationAgencies(autoCompleteMobValidationAgencies);

            const searchAutoCompleteMobValidationAgencies = dataMobValidationAgencies
                .map(({ id, abbreviation, agency_sisbr_id }) => ({
                    id,
                    label: abbreviation,
                    agency_sisbr_id,
                }))
                .filter((value) => value.agency_sisbr_id === mob_validation_agency_ref_id);

            if (searchAutoCompleteMobValidationAgencies) {
                setValue("mob_validation_agency", {
                    id: searchAutoCompleteMobValidationAgencies[0].id,
                    label: searchAutoCompleteMobValidationAgencies[0].label,
                });
            }

            const selectedMobValidationPortfolio = dataMobValidationPortfolios.find(
                (value) => value.ref_id === mob_validation_portfolio_ref_id,
            );

            if (selectedMobValidationPortfolio) {
                setValue("mob_validation_portfolio", {
                    id: selectedMobValidationPortfolio.id,
                    label: selectedMobValidationPortfolio.name + " - " + selectedMobValidationPortfolio.ref_id,
                });
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const searchPortfoliosOfTheAgency = async (id_agency: number) => {
        try {
            setLoading(true);

            const dataPortfolios = await searchAutoCompletePortfolios({
                id_agency,
                is_active: true,
                with_restrict_agency: false,
                has_id_ref: true,
                has_id_agency: true,
            });

            const autoCompleteMobValidationPortfolios = dataPortfolios.map(({ id, name, ref_id }) => {
                return {
                    id,
                    label: name + " - " + ref_id,
                    id_ref: ref_id,
                };
            });

            setListMobValidationPortfolios(autoCompleteMobValidationPortfolios);

            if (autoCompleteMobValidationPortfolios.length === 1) {
                setValue("mob_validation_portfolio", {
                    id: autoCompleteMobValidationPortfolios[0].id,
                    label: autoCompleteMobValidationPortfolios[0].label,
                });
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        async function execute() {
            if (!Object.keys(listMobValidationAgencies).length || Object.keys(listMobValidationPortfolios).length) {
                resetField("mob_validation_portfolio");
                setListMobValidationPortfolios([]);
            }

            if (mobValidationAgencyWatch) {
                await searchPortfoliosOfTheAgency(mobValidationAgencyWatch.id);
            }
        }
        execute();
    }, [mobValidationAgencyWatch]);

    useEffect(() => {
        async function execute() {
            if (idProductivityDaily) {
                await setValuesProductivityDailyByID(idProductivityDaily);
            }
        }

        execute();
    }, [idProductivityDaily]);

    return (
        <BoxModal title='Validação da Produtividade' handleClose={handleClose} maxWidth={"500px"} {...props}>
            {infoProductivityDaily && (
                <Grid container justifyContent='center' mt={-2.5} mb={2}>
                    <Typography fontWeight={"100"} fontSize={14}>
                        {statusWithoutLabelMap[infoProductivityDaily.status] + " " + infoProductivityDaily.client_name}
                    </Typography>
                </Grid>
            )}

            <Box component={"form"}>
                <Grid container gap={2.5}>
                    <Grid item xs={12} md={12}>
                        <FormAutocomplete
                            fullWidth
                            name='mob_validation_agency'
                            label='Agência'
                            variant='outlined'
                            required
                            disabledAutocomplete={idProductivityDaily ? false : true}
                            control={control}
                            errors={errors}
                            options={listMobValidationAgencies}
                        />
                    </Grid>
                    <Grid item xs={12} md={12}>
                        <FormAutocomplete
                            fullWidth
                            name='mob_validation_portfolio'
                            label='Setor'
                            variant='outlined'
                            required
                            disabled={loading}
                            disabledAutocomplete={loading}
                            disableClearable
                            control={control}
                            errors={errors}
                            options={listMobValidationPortfolios}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12}>
                        <FormDatePicker
                            fullWidth
                            name='mob_validation_date'
                            label='Data Validação'
                            variant='outlined'
                            size='medium'
                            required
                            maxDate={String(new Date())}
                            control={control}
                            errors={errors}
                        />
                    </Grid>

                    <Grid item xs={12} sm={12} md={12}>
                        <FormSwitchGroup
                            row
                            title='Contabilização da Produção'
                            options={[
                                {
                                    name: "mob_validation_is_counted",
                                    label: mobValidationIsCountedPublicWatch ? "Ativo" : "Inativo",
                                },
                            ]}
                            control={control}
                        />
                    </Grid>

                    <Grid item xs={12} sm={12} md={12}>
                        <Collapse in={!mobValidationIsCountedPublicWatch}>
                            <Alert
                                severity='warning'
                                sx={{
                                    fontSize: 12,
                                    border: `1px dashed #a1a800`,
                                }}>
                                A situação da validação está desativada, o que significa que esta produção não será
                                contabilizada no painel do mobilizador. Se isso não for o desejado, ative a opção de
                                contabilização.
                            </Alert>
                        </Collapse>
                    </Grid>

                    <Grid item xs={12} sm={12} md={12}>
                        <Typography color='text.secondary' textAlign={"justify"} fontSize={12}>
                            <b>Atenção:</b> Alterar os dados de validação desta produtividade impactará diretamente a
                            contabilização dessa produção no relatório de mobilizador em tempo real. Faça alterações
                            apenas se tiver certeza de que o ajuste é necessário!
                        </Typography>
                    </Grid>
                </Grid>

                <Grid container justifyContent={"center"} mt={2}>
                    <LoadingButton
                        fullWidth
                        size='large'
                        color='success'
                        variant='contained'
                        title='Salvar dados da validação'
                        startIcon={<Icon>assignment_turned_in_outlined_icon</Icon>}
                        loading={loading}
                        onClick={async () => {
                            await confirm({
                                title: "Confirmação de Validação da Produção",
                                description: "Tem certeza de que deseja realizar a validação desta produção?",
                            })
                                .then(() => handleSubmit((params) => onSubmitValidationProductivityDaily(params))())
                                .catch(() => {});
                        }}>
                        Editar Validação
                    </LoadingButton>
                </Grid>
            </Box>
        </BoxModal>
    );
}
