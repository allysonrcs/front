import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import { Grid, Icon } from "@mui/material";
import { Box } from "@mui/system";
import { useConfirm } from "material-ui-confirm";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import FormInput from "@/components/FormComponents/FormInput";
import { useGlobal } from "@/contexts/GlobalContext";
import {
    createCooperative,
    searchCooperativeByID,
    updateCooperative,
    updateStatusCooperative,
} from "@/services/cooperatives";
import { toast } from "react-toastify";
import { GridProps } from "@mui/material";
import { searchAutoCompleteEmployees } from "@/services/employees";

type Autocomplete = {
    id: number;
    label: string;
};

export type CooperativesProps = {
    code_cooperative: number;
    name: string;
    abbreviation: string;
    president: Autocomplete;
    matriz_name: string;
    center_name: string;
    description?: string | null | undefined;
};

export type EditCooperativeModalProps = {
    code_cooperative?: number;
    name?: string;
    abbreviation?: string;
    name_president?: string;
    is_active?: boolean;
};

export type EditCooperativeProps = {
    idCooperative?: number;
    updateColumn?: (params: EditCooperativeModalProps) => void;
} & GridProps;

export function CooperativesFields({ idCooperative, updateColumn, ...props }: EditCooperativeProps) {
    const confirm = useConfirm();
    const { getInfoError, toggleStatusBackdrop } = useGlobal();

    const [status, setStatus] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [president, setPresident] = useState<Autocomplete[]>([]);

    const validationSchema = Yup.object().shape({
        code_cooperative: Yup.number()
            .required("ID da Cooperativa é obrigatório")
            .transform((v) => (v === "" || Number.isNaN(v) ? null : v)),
        name: Yup.string().max(255, "Máximo 255 caracteres").required("Nome da Cooperativa é obrigatório").trim(),
        abbreviation: Yup.string().max(255, "Máximo 255 caracteres").required("Abreviação é obrigatório").trim(),
        president: Yup.object()
            .shape({
                id: Yup.number().required("ID é obrigatório"),
                label: Yup.string().required("Label é obrigatório"),
            })
            .required("Presidente é obrigatório!"),
        matriz_name: Yup.string().max(255, "Excedeu 255 caracteres").required("Nome da Matriz é obrigatório").trim(),
        center_name: Yup.string().max(255, "Excedeu 255 caracteres").required("Nome da Central é obrigatório").trim(),
        description: Yup.string().max(4000, "Excedeu 4000 caracteres").nullable(),
    });

    const {
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors },
    } = useForm<CooperativesProps>({ resolver: yupResolver(validationSchema) });

    const handleChangeStatus = () => {
        if (idCooperative) {
            confirm({
                title: `Deseja realmente ${!status ? "Ativar" : "Inativar"} o registro?`,
                description: "O registro de cargo sofrerá alteração em seu status.",
            })
                .then(async () => {
                    try {
                        await updateStatusCooperative(idCooperative, { is_active: !status });
                        setStatus((status) => !status);

                        updateColumn?.({
                            is_active: !status,
                        });

                        toast.success("Situação alterada com sucesso!");
                    } catch (error) {
                        const info = await getInfoError(error);
                        toast.error(info.message);
                    }
                })
                .catch(() => {});
        }
    };

    const onSubmitCooperative = async (params: CooperativesProps) => {
        const refactoring = {
            code_cooperative: Number(params.code_cooperative),
            name: params.name,
            abbreviation: params.abbreviation,
            id_president: params.president.id,
            matriz_name: params.matriz_name,
            center_name: params.center_name,
            description: params?.description,
        };

        try {
            setLoading(true);

            if (idCooperative) {
                await updateCooperative(idCooperative, refactoring);
                updateColumn?.({
                    code_cooperative: params.code_cooperative,
                    name: params.name,
                    abbreviation: params.abbreviation,
                    name_president: params.president.label,
                });
            } else {
                await createCooperative({
                    ...refactoring,
                });
                reset();
            }

            toast.success(`Registro da cooperativa ${idCooperative ? "atualizado" : "criado"} com sucesso!`);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const setPresidentOptions = async () => {
        try {
            toggleStatusBackdrop();
            const employees = await searchAutoCompleteEmployees({
                is_active: true,
                has_function: true,
            });

            const president_filtered = employees.filter(({ is_president }) => is_president);

            setPresident(president_filtered.map((president) => ({ id: president.id, label: president.name })));
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    const setValuesCooperative = async (idCooperative: number) => {
        try {
            toggleStatusBackdrop();
            const {
                code_cooperative,
                name,
                abbreviation,
                description,
                center_name,
                matriz_name,
                is_active,
                employees_president,
            } = await searchCooperativeByID(idCooperative);

            if (employees_president) {
                const presidentRef = { id: employees_president.id, label: employees_president.peoples.name };
                setValue("president", presidentRef);
            }

            setValue("code_cooperative", code_cooperative);
            setValue("name", name);
            setValue("abbreviation", abbreviation);
            setValue("description", description);
            setValue("center_name", center_name);
            setValue("matriz_name", matriz_name);

            setStatus(is_active);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    useEffect(() => {
        async function execute() {
            toggleStatusBackdrop();

            await setPresidentOptions();

            toggleStatusBackdrop();
        }

        execute();

        if (idCooperative) {
            setValuesCooperative(Number(idCooperative));
        }
    }, [idCooperative]);

    return (
        <Grid {...props}>
            <Box component='form' onSubmit={handleSubmit(onSubmitCooperative)}>
                <Grid container spacing={3} mt={0}>
                    <Grid item md={4} xs={12}>
                        <FormInput
                            fullWidth
                            label='Código'
                            name='code_cooperative'
                            type='number'
                            variant='outlined'
                            control={control}
                            errors={errors}
                        />
                    </Grid>

                    <Grid item md={4} xs={12}>
                        <FormInput
                            fullWidth
                            name='name'
                            label='Nome da Cooperativa'
                            variant='outlined'
                            control={control}
                            errors={errors}
                        />
                    </Grid>

                    <Grid item md={4} xs={12}>
                        <FormInput
                            fullWidth
                            label='Abreviação'
                            name='abbreviation'
                            type='text'
                            variant='outlined'
                            control={control}
                            errors={errors}
                        />
                    </Grid>

                    <Grid item md={4} xs={12}>
                        <FormAutocomplete
                            name='president'
                            label='Selecione um Presidente'
                            variant='outlined'
                            control={control}
                            errors={errors}
                            options={president}
                        />
                    </Grid>

                    <Grid item md={4} xs={12}>
                        <FormInput
                            fullWidth
                            name='matriz_name'
                            label='Nome da Matriz'
                            variant='outlined'
                            control={control}
                            errors={errors}
                        />
                    </Grid>

                    <Grid item md={4} xs={12}>
                        <FormInput
                            fullWidth
                            name='center_name'
                            label='Nome da Central'
                            variant='outlined'
                            control={control}
                            errors={errors}
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
                    {idCooperative && (
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
