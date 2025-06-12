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
import { createRole, searchRoleById, updateRole, updateStatusRole } from "@/services/roles";
import { toast } from "react-toastify";
import { GridProps } from "@mui/material";
import FormRadioGroup from "@/components/FormComponents/FormRadioGroup";
import { ArrayTypesGradeRoles } from "@/constants/array-type-grade-roles";

import FormInputCurrency from "@/components/FormComponents/FormInputCurrency";
import { searchAutoCompleteCooperatives } from "@/services/cooperatives";

type AutoCompleteNumber = {
    id: number;
    label: string;
};

export type RolesProps = {
    cooperatives: AutoCompleteNumber;
    name: string;
    level: string;
    grade: AutoCompleteNumber;
    base_salary?: number | null;
    gratification?: number | null;
    responsibility_allowance?: number | null;
    description?: string | null | undefined;
};

export type EditRoleModalProps = {
    name?: string;
    level?: string;
    grade?: string;
    is_active?: boolean;
};

export type EditRoleProps = {
    idRole?: number;
    updateColumn?: (params: EditRoleModalProps) => void;
} & GridProps;

export function RolesFields({ idRole, updateColumn, ...props }: EditRoleProps) {
    const confirm = useConfirm();
    const { getInfoError, toggleStatusBackdrop } = useGlobal();

    const [status, setStatus] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [autoCompleteCooperatives, setAutoCompleteCooperatives] = useState<AutoCompleteNumber[]>([]);

    const validationSchema = Yup.object().shape({
        cooperatives: Yup.object()
            .shape({
                id: Yup.number().required("ID é obrigatório"),
                label: Yup.string().required("Label é obrigatório"),
            })
            .required("Cooperativa é obrigatória"),
        name: Yup.string().required("Nome é obrigatório").trim(),
        level: Yup.string().required("Nível é Obrigatório"),
        grade: Yup.object()
            .shape({
                id: Yup.number().required("ID é obrigatório"),
                label: Yup.string().required("Label é obrigatório"),
            })
            .required("Grau é obrigatório"),
        base_salary: Yup.number()
            .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
            .nullable(),
        gratification: Yup.number()
            .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
            .nullable(),
        responsibility_allowance: Yup.number()
            .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
            .nullable(),
        description: Yup.string().nullable().max(4000, "Excedeu 4000 caracteres"),
    });

    const {
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors },
    } = useForm<RolesProps>({ resolver: yupResolver(validationSchema) });

    const handleChangeStatus = () => {
        if (idRole) {
            confirm({
                title: `Deseja realmente ${!status ? "Ativar" : "Inativar"} o registro?`,
                description: "O registro de cargo sofrerá alteração em seu status.",
            })
                .then(async () => {
                    try {
                        await updateStatusRole(idRole, { is_active: !status });
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

    const onSubmitRoles = async (params: RolesProps) => {
        const refactoring = {
            name: params.name,
            level: params.level,
            grade: params.grade.id,
            base_salary: params?.base_salary ?? null,
            gratification: params?.gratification ?? null,
            responsibility_allowance: params?.responsibility_allowance ?? null,
            description: params?.description ?? null,
        };

        try {
            setLoading(true);

            if (idRole) {
                await updateRole(idRole, refactoring);

                updateColumn?.({
                    name: `${params.name} - ${params.level}`,
                    grade: params.grade.label,
                    level: params.level,
                });
            } else {
                await createRole({
                    ...refactoring,
                    id_cooperative: params.cooperatives.id,
                });
                reset();
            }

            toast.success(`Registro de cargo ${idRole ? "atualizado" : "criado"} com sucesso!`);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const setAgenciesOptions = async () => {
        try {
            toggleStatusBackdrop();

            const resultAutocompletCooperatives = await searchAutoCompleteCooperatives({});

            const formattedCooperatives = resultAutocompletCooperatives.map((item) => ({
                id: item.id,
                label: item.abbreviation,
            }));

            setAutoCompleteCooperatives(formattedCooperatives);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    const setValuesRole = async (idRole: number) => {
        try {
            toggleStatusBackdrop();

            const {
                cooperatives,
                name,
                level,
                grade,
                base_salary,
                gratification,
                responsibility_allowance,
                is_active,
                description,
            } = await searchRoleById(idRole);

            const cooperativeRef = { id: cooperatives.id, label: cooperatives.abbreviation };

            const selectedTypeGrade = ArrayTypesGradeRoles.find((value) => value.id === grade);
            if (selectedTypeGrade) {
                setValue("grade", {
                    id: selectedTypeGrade.id,
                    label: selectedTypeGrade.label,
                });
            }

            const validlevel = level === null ? "S" : level;

            setValue("cooperatives", cooperativeRef);
            setValue("name", name);
            setValue("level", validlevel);
            setValue("base_salary", base_salary);
            setValue("gratification", gratification);
            setValue("responsibility_allowance", responsibility_allowance);
            setValue("description", description);
            setStatus(is_active);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    useEffect(() => {
        toggleStatusBackdrop();

        if (idRole) {
            setValuesRole(Number(idRole));
        }

        async function execute() {
            await setAgenciesOptions();
        }
        toggleStatusBackdrop();
        execute();
    }, []);

    return (
        <Grid {...props}>
            <Box component='form' onSubmit={handleSubmit(onSubmitRoles)}>
                <Grid container spacing={3} mt={0}>
                    <Grid item xs={12} md={6}>
                        <FormAutocomplete
                            name='cooperatives'
                            label='Cooperativa'
                            variant='outlined'
                            disabledAutocomplete={idRole ? true : false}
                            disableClearable
                            control={control}
                            errors={errors}
                            options={autoCompleteCooperatives}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormInput
                            fullWidth
                            name='name'
                            label='Nome'
                            variant='outlined'
                            control={control}
                            errors={errors}
                        />
                    </Grid>
                    <Grid item xs={12} md={12}>
                        <FormRadioGroup
                            row
                            defaultValue={"S"}
                            name='level'
                            label='Nível:'
                            control={control}
                            errors={errors}
                            options={[
                                { label: "A", value: "A" },
                                { label: "B", value: "B" },
                                { label: "C", value: "C" },
                                { label: "D", value: "D" },
                                { label: "E", value: "E" },
                                { label: "Sem nível", value: "S" },
                            ]}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormAutocomplete
                            name='grade'
                            label='Grau'
                            variant='outlined'
                            control={control}
                            errors={errors}
                            options={ArrayTypesGradeRoles}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormInputCurrency
                            fullWidth
                            label='Salário Base (R$)'
                            name='base_salary'
                            variant='outlined'
                            placeholder='R$ '
                            decimalScale={2}
                            control={control}
                            errors={errors}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormInputCurrency
                            fullWidth
                            label='Gratificação (R$)'
                            name='gratification'
                            variant='outlined'
                            placeholder='R$ '
                            decimalScale={2}
                            control={control}
                            errors={errors}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormInputCurrency
                            fullWidth
                            label='Adicional de Responsabilidade (R$)'
                            name='responsibility_allowance'
                            variant='outlined'
                            placeholder='R$ '
                            decimalScale={2}
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
                    {idRole && (
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
