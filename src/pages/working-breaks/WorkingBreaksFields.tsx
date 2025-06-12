import { useEffect, useState } from "react";
import { Grid, GridProps, Icon } from "@mui/material";
import { Box } from "@mui/system";
import { LoadingButton } from "@mui/lab";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { ArrayTypesWorkingBreaks } from "@/constants/array-working-breaks";
import { useGlobal } from "@/contexts/GlobalContext";
import { searchAutocompleteAgencies } from "@/services/agencies";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
    IWorkingBreakProps,
    changeStatusInterval,
    createIntervalWork,
    searchIntervalById,
    updateIntervalWork,
} from "@/services/working-breaks";
import { useConfirm } from "material-ui-confirm";
import FormInput from "@/components/FormComponents/FormInput";
import FormTimePicker from "@/components/FormComponents/FormTimePicker";
import moment from "moment";

const regex = /(\d{2}:\d{2})(:\d{2})?/g;

type AutoCompleteNumber = {
    id: number;
    label: string;
};

type AutoCompleteString = {
    id: string;
    label: string;
};

type workingBreakProps = {
    id: number;
    agency: AutoCompleteNumber;
    type: AutoCompleteString;
    time_start: string;
    time_end: string;
    description?: string | null | undefined;
};

const validationSchema = Yup.object().shape({
    agency: Yup.object().nullable().typeError("Obrigatório").required("Agência é obrigatório"),
    type: Yup.object().nullable().typeError("Obrigatório").required("Tipo obrigatório"),
    time_start: Yup.string()
        .required("Data inicial é obrigatória")
        .matches(/(\d{2}:\d{2})(:\d{2})?/g, "Formato de hora inválido"),
    time_end: Yup.string()
        .required("Data final é obrigatória")
        .matches(/(\d{2}:\d{2})(:\d{2})?/g, "Formato de hora inválido")
        .test("is-greater", "Data final deve ser maior que data inicial", function (value) {
            const { time_start } = this.parent;
            return value > time_start;
        }),
    description: Yup.string().nullable().max(4000, "Excedeu 4000 caracteres"),
});

export type WorkingBreakComponentProps = {
    idWorkingBreak?: number;
    updateFunc?: (data: IWorkingBreakProps) => void;
} & GridProps;

export function WorkingBreaksFields({ idWorkingBreak, updateFunc, ...props }: WorkingBreakComponentProps) {
    const confirm = useConfirm();
    const { getInfoError, toggleStatusBackdrop } = useGlobal();

    const [agencies, setAgencies] = useState<AutoCompleteNumber[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<boolean>(false);

    const {
        handleSubmit,
        reset,
        control,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<workingBreakProps | any>({ resolver: yupResolver(validationSchema) });

    const setAutocompleteAgencies = async () => {
        try {
            toggleStatusBackdrop();

            const data = await searchAutocompleteAgencies({ is_active: true, with_restrict_agency: true });
            const refactor = data.map(({ id, abbreviation }) => {
                return { id: id, label: abbreviation };
            });

            setAgencies(refactor);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    async function setValuesInterval(id: number) {
        try {
            toggleStatusBackdrop();
            const { is_active, time_end, time_start, type, agencies, description } = await searchIntervalById(id);

            const AgencyRef = { id: agencies.id, label: agencies.abbreviation };

            const typeRef = { id: type, label: type };

            setValue("agency", AgencyRef);
            setValue("type", typeRef);
            setValue("time_start", new Date().toString().replace(regex, time_start ?? ""));
            setValue("time_end", new Date().toString().replace(regex, time_end ?? ""));
            setValue("description", description);
            setStatus(is_active);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    }

    async function onSubmit(params: workingBreakProps) {
        try {
            setLoading(true);
            const formattedTimeStart = moment(params.time_start).format("HH:mm:00");
            const formattedTimeEnd = moment(params.time_end).format("HH:mm:00");

            const params_start_time = parseInt(moment(params.time_start).format("HHmm"));
            const params_end_time = parseInt(moment(params.time_end).format("HHmm"));

            if (!params.time_start || !params.time_end) {
                toast.error("Favor preencher a data inicial e data final!");
                return;
            }

            if (params_start_time >= params_end_time) {
                toast.error("O horário inicial deve ser menor que o horário final!");
                return;
            }

            if (idWorkingBreak) {
                await updateIntervalWork(idWorkingBreak, {
                    time_start: formattedTimeStart,
                    time_end: formattedTimeEnd,
                    description: params?.description,
                });

                updateFunc?.({
                    id: idWorkingBreak,
                    is_active: status,
                    time_start: params.time_start,
                    time_end: params.time_end,
                    type: params.type.label,
                    abbreviation_agency: "",
                });

                toast.success(`Intervalo atualizado com sucesso!`);
            } else {
                let refactoring: any = {
                    id_agency: params.agency.id,
                    type: params.type.id,
                    time_start: formattedTimeStart,
                    time_end: formattedTimeEnd,
                    description: params?.description,
                };

                await createIntervalWork(refactoring);

                reset();
                toast.success(`Intervalo criado com sucesso!`);
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    }

    function handleChangeStatus() {
        if (idWorkingBreak) {
            confirm({
                title: `Deseja realmente ${!status ? "Ativar" : "Inativar"} o registro?`,
                description: "O registro de intervalo sofrerá alteração em seu status.",
            }).then(async () => {
                try {
                    await changeStatusInterval(idWorkingBreak, { is_active: !status });
                    setStatus((status) => !status);

                    updateFunc?.({
                        id: idWorkingBreak,
                        is_active: !status,
                        time_start: getValues("time_start"),
                        time_end: getValues("time_end"),
                        type: getValues("type.label"),
                        abbreviation_agency: "",
                    });

                    toast.success("Situação alterada com sucesso!");
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                }
            });
        }
    }

    useEffect(() => {
        if (idWorkingBreak) {
            setValuesInterval(idWorkingBreak);
        }

        async function execute() {
            try {
                toggleStatusBackdrop();

                await setAutocompleteAgencies();
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                toggleStatusBackdrop();
            }
        }
        execute();
    }, []);

    return (
        <Grid {...props}>
            <Box component='form' onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3} mt={0}>
                    <Grid item md={12} xs={12}>
                        <FormAutocomplete
                            disabledAutocomplete={idWorkingBreak ? true : false}
                            disableClearable
                            name='agency'
                            label='Agência'
                            variant='outlined'
                            control={control}
                            errors={errors}
                            options={agencies}
                        />
                    </Grid>

                    <Grid item md={4} xs={12}>
                        <FormAutocomplete
                            disabledAutocomplete={idWorkingBreak ? true : false}
                            disableClearable
                            name='type'
                            label='Tipos(s)'
                            variant='outlined'
                            control={control}
                            errors={errors}
                            options={ArrayTypesWorkingBreaks}
                        />
                    </Grid>

                    <Grid item md={4} xs={12}>
                        <FormTimePicker
                            fullWidth
                            control={control}
                            value={undefined}
                            defaultValue={undefined}
                            errors={errors}
                            name='time_start'
                            label='Data inicial'
                        />
                    </Grid>

                    <Grid item md={4} xs={12}>
                        <FormTimePicker
                            fullWidth
                            control={control}
                            value={undefined}
                            defaultValue={undefined}
                            errors={errors}
                            name='time_end'
                            label='Data Final'
                        />
                    </Grid>

                    <Grid item xs={12} md={12}>
                        <FormInput
                            fullWidth
                            multiline
                            rows={5}
                            label='Descrição'
                            name='description'
                            type='text'
                            variant='outlined'
                            control={control}
                            errors={errors}
                        />
                    </Grid>
                </Grid>

                <Grid container justifyContent='center' mt={5} gap={1}>
                    {idWorkingBreak && (
                        <Grid>
                            <LoadingButton
                                size='large'
                                color={"info"}
                                variant='contained'
                                onClick={handleChangeStatus}
                                startIcon={<Icon>autorenew</Icon>}
                                title='Alterar situação'
                                loading={loading}>
                                {!status ? "Ativar" : "Inativar"}
                            </LoadingButton>
                        </Grid>
                    )}

                    <Grid>
                        <LoadingButton
                            type='submit'
                            size='large'
                            color={"success"}
                            variant='contained'
                            title='Salvar'
                            startIcon={<Icon>save</Icon>}
                            loading={loading}>
                            Salvar
                        </LoadingButton>
                    </Grid>
                </Grid>
            </Box>
        </Grid>
    );
}
