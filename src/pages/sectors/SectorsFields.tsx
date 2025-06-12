import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { Grid, GridProps, Icon } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
import { searchAutocompleteAgencies } from "@/services/agencies";
import { Box } from "@mui/system";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import FormAutocompleteMultiple from "@/components/FormComponents/FormAutocompleteMultiple";
import FormInput from "@/components/FormComponents/FormInput";
import { IsearchSector, createSector, searchSectorByID, updateSector, updateStatusSector } from "@/services/sectors";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";
import { useConfirm } from "material-ui-confirm";
import { searchAutoCompleteEmployees } from "@/services/employees";
import moment from "moment";

type AutoCompleteNumber = {
    id: number;
    label: string;
};

type SectorProps = {
    agency: AutoCompleteNumber;
    name: string;
    abbreviation?: string | null;
    ref_sector_id?: number | null;
    managers: AutoCompleteNumber[];
    supervisors: AutoCompleteNumber[];
    description?: string | null | undefined;
};

export type SectorComponentProps = {
    idSector?: number;
    updateFunc?: (data: IsearchSector) => void;
} & GridProps;

export function SectorsFields({ idSector, updateFunc, ...props }: SectorComponentProps) {
    const validationSchema = Yup.object().shape({
        agency: Yup.object().nullable().required("Agência é obrigatório"),
        name: Yup.string().max(255, "Excedeu 255 caracteres").required("Campo obrigatório.").trim(),
        abbreviation: Yup.string().max(255, "Excedeu 255 caracteres").nullable().trim(),
        ref_sector_id: Yup.number()
            .transform((v) => (v === "" || Number.isNaN(v) ? null : v))
            .nullable(),
        managers: Yup.array().nullable(),
        supervisors: Yup.array().nullable(),
        description: Yup.string().nullable().max(4000, "Excedeu 4000 caracteres"),
    });

    const confirm = useConfirm();
    const { getInfoError, toggleStatusBackdrop } = useGlobal();

    const [agencies, setAgencies] = useState<AutoCompleteNumber[]>([]);
    const [immediateSuperior, setImmediateSuperior] = useState<AutoCompleteNumber[]>([]);
    const [managers, setManagers] = useState<AutoCompleteNumber[]>([]);
    const [status, setStatus] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    const {
        handleSubmit,
        control,
        reset,
        setValue,
        resetField,
        getValues,
        watch,
        formState: { errors },
    } = useForm<SectorProps | any>({ resolver: yupResolver(validationSchema) });

    const selectAgency = watch("agency");

    const setAgenciesOptions = async () => {
        try {
            toggleStatusBackdrop();
            const data = await searchAutocompleteAgencies({ is_active: true, with_restrict_agency: true });
            const refactor = data.map(({ id, abbreviation }) => {
                return { id: id, label: abbreviation };
            });
            setAgencies(refactor);
            return refactor;
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    const onSubmitSector = async (params: SectorProps) => {
        const refactoring = {
            supervisors: params.supervisors ? params.supervisors.map((item) => item.id) : [],
            managers: params.managers ? params.managers.map((item) => item.id) : [],
            name: params.name,
            abbreviation: params.abbreviation ? params.abbreviation : null,
            ref_sector_id: params.ref_sector_id ? params.ref_sector_id : null,
            description: params.description ? params.description : null,
        };

        try {
            setLoading(true);

            if (idSector) {
                await updateSector(idSector, refactoring);
                updateFunc?.({
                    id: idSector,
                    ref_sector_id: params?.ref_sector_id ? params.ref_sector_id : null,
                    abbreviation_agency: getValues("agency.label"),
                    responsible_manager:
                        getValues("managers")
                            ?.map((manager: AutoCompleteNumber) => manager.label)
                            ?.join(", ") || null,
                    responsible_superior:
                        getValues("supervisors")
                            ?.map((supervisor: AutoCompleteNumber) => supervisor.label)
                            ?.join(", ") || null,
                    abbreviation: refactoring.abbreviation,
                    is_active: status,
                    name: refactoring.name,
                    updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                });
            } else {
                await createSector({ ...refactoring, id_agency: params.agency.id });
                reset();
            }

            toast.success(`Setor ${idSector ? "atualizado" : "criado"} com sucesso!`);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatus = () => {
        if (idSector) {
            confirm({
                title: `Deseja realmente ${!status ? "Ativar" : "Inativar"} o registro?`,
                description: "O registro do setor sofrerá alteração em seu status.",
            })
                .then(async () => {
                    try {
                        await updateStatusSector(idSector, { is_active: !status });
                        setStatus((status) => !status);

                        updateFunc?.({
                            id: idSector,
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

    const setValuesSector = async (id: number) => {
        try {
            toggleStatusBackdrop();
            const { agencies, name, abbreviation, is_active, sectors_roles_employees, description, ref_sector_id } =
                await searchSectorByID(id);
            const unitRef = { id: agencies.id, label: agencies.name };

            setValue("name", name);
            setValue("abbreviation", abbreviation);
            setValue("ref_sector_id", ref_sector_id);
            setValue("description", description);
            setValue("agency", unitRef);
            setStatus(is_active);

            const managers_filtered = sectors_roles_employees.filter((item) => item.type === "Gerente");
            const supervisors_filtered = sectors_roles_employees.filter((item) => item.type === "Supervisor");

            if (sectors_roles_employees.length) {
                setValue(
                    "supervisors",
                    supervisors_filtered.map((item) => ({ id: item.employees.id, label: item.employees.peoples.name })),
                );
                setValue(
                    "managers",
                    managers_filtered.map((item) => ({ id: item.employees.id, label: item.employees.peoples.name })),
                );
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    useEffect(() => {
        setAgenciesOptions();
        if (idSector) {
            setValuesSector(idSector);
        }
    }, []);

    useEffect(() => {
        const run = async () => {
            if (selectAgency) {
                try {
                    toggleStatusBackdrop();
                    const employees = await searchAutoCompleteEmployees({
                        id_agency: selectAgency.id,
                        is_active: true,
                        has_function: true,
                    });

                    const immediate_superior_filtered = employees.filter(({ is_manager }) => is_manager !== true);
                    const managers_filtered = employees.filter(({ is_manager }) => is_manager);

                    setImmediateSuperior(immediate_superior_filtered.map((emp) => ({ id: emp.id, label: emp.name })));
                    setManagers(managers_filtered.map((manager) => ({ id: manager.id, label: manager.name })));

                    if (!idSector) {
                        resetField("supervisors");
                        resetField("managers");
                    }
                } catch (error) {
                    const info = await getInfoError(error);
                    toast.error(info.message);
                } finally {
                    toggleStatusBackdrop();
                }
            }
        };
        run();
    }, [selectAgency]);

    return (
        <Grid {...props}>
            <Box component='form' onSubmit={handleSubmit(onSubmitSector)}>
                <Grid container spacing={3} mt={0}>
                    <Grid item md={3.5} xs={12}>
                        <FormAutocomplete
                            disabledAutocomplete={idSector ? true : false}
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
                        <FormInput
                            control={control}
                            errors={errors}
                            name='name'
                            fullWidth
                            label='Nome do setor'
                            variant='outlined'
                        />
                    </Grid>

                    <Grid item md={2.5} xs={12}>
                        <FormInput
                            control={control}
                            errors={errors}
                            name='abbreviation'
                            fullWidth
                            label='Apelido'
                            variant='outlined'
                        />
                    </Grid>

                    <Grid item md={2} xs={12}>
                        <FormInput
                            fullWidth
                            label='ID Referência'
                            name='ref_sector_id'
                            type='number'
                            variant='outlined'
                            control={control}
                            errors={errors}
                        />
                    </Grid>

                    <Grid item md={6} xs={12}>
                        <FormAutocompleteMultiple
                            name='managers'
                            label='Gerente'
                            variant='outlined'
                            size='medium'
                            control={control}
                            errors={errors}
                            options={managers}
                        />
                    </Grid>

                    <Grid item md={6} xs={12}>
                        <FormAutocompleteMultiple
                            name='supervisors'
                            label='Superior Imediato'
                            variant='outlined'
                            size='medium'
                            control={control}
                            errors={errors}
                            options={immediateSuperior}
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
                    {idSector && (
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
