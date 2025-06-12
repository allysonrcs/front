import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useConfirm } from "material-ui-confirm";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useGlobal } from "@/contexts/GlobalContext";
import { changeStatusAgency, createAgency, updateAgency, getAgencyByID } from "@/services/agencies";
import { Grid, GridProps, Icon } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import FormInput from "@/components/FormComponents/FormInput";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import { searchAutocompleteAgencies } from "@/services/agencies";
import { ArrayTypesArea } from "@/constants/array-area";
import { searchAutoCompleteCooperatives } from "@/services/cooperatives";
import { searchAutoCompleteEmployees } from "@/services/employees";

type AutoCompleteNumber = {
    id: number;
    label: string;
};

type AutoCompleteString = {
    id: string;
    label: string;
};

export type UpdateColumnAgencyProps = {
    id: number;
    name?: string;
    abbreviation?: string;
    type_area?: string;
    agency_employee_manager?: string;
    matriz?: string;
    is_active?: boolean;
};

type AgencyProps = {
    agency_sisbr_id: number;
    name: string;
    ipbx_identifier?: string | null | undefined;
    abbreviation: string;
    headquarters?: AutoCompleteNumber | null | undefined;
    manager?: AutoCompleteNumber | null | undefined;
    type_area: AutoCompleteString;
    cooperative: AutoCompleteNumber;
    description?: string | null | undefined;
};

type AgencyComponentProps = {
    idAgency?: number;
    updateColumn?: (agency: UpdateColumnAgencyProps) => void;
} & GridProps;

const schemaAgency = Yup.object({
    agency_sisbr_id: Yup.number()
        .required("ID Agência Sisbr é obrigatório")
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v)),
    name: Yup.string().max(255, "Máximo 255 caracteres").required("Nome é obrigatório").trim(),
    ipbx_identifier: Yup.string().max(10, "Este campo deve conter no máximo 10 caracteres").nullable(),
    abbreviation: Yup.string().max(120, "Máximo 120 caracteres").required("Abreviação é obrigatório").trim(),
    headquarters: Yup.object()
        .shape({
            id: Yup.number().required("ID é obrigatório"),
            label: Yup.string().required("Label é obrigatório"),
        })
        .nullable(),
    manager: Yup.object()
        .shape({
            id: Yup.number().required("ID é obrigatório"),
            label: Yup.string().required("Label é obrigatório"),
        })
        .nullable(),
    type_area: Yup.object()
        .shape({
            id: Yup.string().required("ID é obrigatório"),
            label: Yup.string().required("Label é obrigatório"),
        })
        .required("Área é obrigatório!"),
    cooperative: Yup.object()
        .shape({
            id: Yup.number().required("ID é obrigatório"),
            label: Yup.string().required("Label é obrigatório"),
        })
        .required("Cooperativa é obrigatório!"),
    description: Yup.string().nullable().max(4000, "Excedeu 4000 caracteres"),
});

export function AgenciesFields({ idAgency, updateColumn, ...props }: AgencyComponentProps) {
    const { getInfoError, toggleStatusBackdrop } = useGlobal();
    const confirm = useConfirm();

    const [status, setStatus] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [agencies, setAgencies] = useState<AutoCompleteNumber[]>([]);
    const [cooperatives, setCooperatives] = useState<AutoCompleteNumber[]>([]);
    const [manager, setManager] = useState<AutoCompleteNumber[]>([]);

    const {
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors },
    } = useForm<AgencyProps | any>({
        resolver: yupResolver(schemaAgency),
    });

    const onSubmitAgency = async (data: AgencyProps) => {
        try {
            if (idAgency) {
                setLoading(true);

                await updateAgency(idAgency, {
                    agency_sisbr_id: Number(data.agency_sisbr_id),
                    name: data.name,
                    abbreviation: data.abbreviation,
                    ipbx_identifier: data?.ipbx_identifier,
                    id_headquarters: data?.headquarters?.id,
                    id_cooperative: data.cooperative.id,
                    id_manager_agency: data?.manager?.id,
                    type_area: data.type_area.label.toUpperCase(),
                    description: data?.description,
                });

                updateColumn?.({
                    id: idAgency,
                    name: data.name,
                    abbreviation: data.abbreviation,
                    type_area: data.type_area.label.toUpperCase(),
                    matriz: data?.headquarters?.label,
                    agency_employee_manager: data?.manager?.label,
                });

                toast.success("Atualizado com sucesso!");
            } else {
                setLoading(true);

                await createAgency({
                    agency_sisbr_id: Number(data.agency_sisbr_id),
                    name: data.name,
                    abbreviation: data.abbreviation,
                    ipbx_identifier: data?.ipbx_identifier,
                    id_headquarters: data?.headquarters?.id,
                    id_cooperative: data.cooperative.id,
                    id_manager_agency: data?.manager?.id,
                    type_area: data.type_area.label.toUpperCase(),
                    description: data?.description,
                });

                reset();
                toast.success("Criado com sucesso!");
            }
        } catch (error) {
            const { message } = await getInfoError(error);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatus = async () => {
        if (idAgency) {
            confirm({
                title: `Deseja realmente ${!status ? "Ativar" : "Inativar"} o registro?`,
                description: "O registro de agência sofrerá alteração em seu status.",
            })
                .then(async () => {
                    try {
                        await changeStatusAgency(idAgency, { is_active: !status });

                        setStatus((status) => !status);

                        updateColumn?.({
                            id: idAgency,
                            is_active: !status,
                        });

                        toast.success(`${status ? "Inativo" : "Ativo"} com sucesso!`);
                    } catch (error) {
                        const info = await getInfoError(error);
                        toast.error(info.message);
                    }
                })
                .catch(() => {});
        }
    };

    const searchRegisterAgency = async (id_agency: number) => {
        try {
            const data = await getAgencyByID(id_agency);
            const typeAreaRef = {
                id: data.type_area,
                label: data.type_area.charAt(0).toUpperCase() + data.type_area.slice(1).toLowerCase(),
            };

            setValue("name", data.name);
            setValue("agency_sisbr_id", data.agency_sisbr_id);
            setValue("abbreviation", data.abbreviation);
            setValue("description", data.description);
            setValue("type_area", typeAreaRef);
            setValue("ipbx_identifier", data.ipbx_identifier);
            setStatus(data.is_active);

            return {
                id_headquarters: data.id_headquarters,
                id_cooperative: data.id_cooperative,
                id_manager_agency: data.id_manager_agency,
            };
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    useEffect(() => {
        async function execute() {
            try {
                toggleStatusBackdrop();

                const [autocompleteAgencies, autocompletCooperatives, autocompleteManager] = await Promise.all([
                    searchAutocompleteAgencies({ with_restrict_agency: true }),
                    searchAutoCompleteCooperatives({}),
                    searchAutoCompleteEmployees({
                        is_active: true,
                        has_function: true,
                    }),
                ]);

                const formattedAgencies = autocompleteAgencies.map((item) => ({
                    id: item.id,
                    label: item.abbreviation,
                }));
                setAgencies(formattedAgencies);

                const formattedCooperatives = autocompletCooperatives.map((item) => ({
                    id: item.id,
                    label: item.abbreviation,
                }));
                setCooperatives(formattedCooperatives);

                const formattedManagerAgency = autocompleteManager
                    .filter(({ is_manager }) => is_manager)
                    .map((item) => ({
                        id: item.id,
                        label: item.name,
                    }));
                setManager(formattedManagerAgency);

                if (idAgency) {
                    const agenciesFiltered = formattedAgencies.filter((agency) => agency.id !== idAgency);
                    setAgencies(agenciesFiltered);

                    const registerAgency = await searchRegisterAgency(idAgency);

                    if (registerAgency?.id_headquarters) {
                        const agencyMatriz = agenciesFiltered.find(
                            (item) => item.id === registerAgency.id_headquarters,
                        );
                        if (agencyMatriz) {
                            setValue("headquarters", agencyMatriz);
                        }
                    }

                    if (registerAgency?.id_cooperative) {
                        const cooperativeFiltered = formattedCooperatives.find(
                            (item) => item.id === registerAgency.id_cooperative,
                        );
                        if (cooperativeFiltered) {
                            setValue("cooperative", cooperativeFiltered);
                        }
                    }

                    if (registerAgency?.id_manager_agency) {
                        const managerFiltered = formattedManagerAgency.find(
                            (item) => item.id === registerAgency.id_manager_agency,
                        );
                        if (managerFiltered) {
                            setValue("manager", managerFiltered);
                        }
                    }
                }
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                toggleStatusBackdrop();
            }
        }

        execute();
    }, [idAgency]);

    return (
        <Grid {...props}>
            <Grid spacing={2} container component='form' onSubmit={handleSubmit(onSubmitAgency)} mt={0}>
                <Grid item md={2} xs={12}>
                    <FormInput
                        fullWidth
                        label='ID Agência Sisbr'
                        name='agency_sisbr_id'
                        type='number'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>
                <Grid item md={4} xs={12}>
                    <FormInput
                        fullWidth
                        label='Nome'
                        name='name'
                        type='text'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>
                <Grid item md={3} xs={12}>
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

                <Grid item md={3} xs={12}>
                    <FormAutocomplete
                        name='manager'
                        label='Gerente da Agência'
                        variant='outlined'
                        control={control}
                        errors={errors}
                        options={manager}
                        title='Selecione caso a agência que você está cadastrando/atualizando possua um Gerente Responsável'
                    />
                </Grid>

                <Grid item md={2} xs={12}>
                    <FormInput
                        fullWidth
                        label='Identificador IPBX'
                        name='ipbx_identifier'
                        type='text'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>

                <Grid item md={4} xs={12}>
                    <FormAutocomplete
                        name='headquarters'
                        label='Agência matriz'
                        variant='outlined'
                        control={control}
                        errors={errors}
                        options={agencies}
                        title='Selecione caso a agência que você está cadastrando/atualizando possua uma agência matriz'
                    />
                </Grid>

                <Grid item md={3} xs={12}>
                    <FormAutocomplete
                        name='type_area'
                        label='Selecione uma Área'
                        variant='outlined'
                        control={control}
                        errors={errors}
                        options={ArrayTypesArea}
                    />
                </Grid>

                <Grid item md={3} xs={12}>
                    <FormAutocomplete
                        name='cooperative'
                        label='Selecione uma Cooperativa'
                        variant='outlined'
                        control={control}
                        errors={errors}
                        options={cooperatives}
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

                <Grid item container display='flex' justifyContent='center' gap={2} mt={3}>
                    {idAgency && (
                        <LoadingButton
                            size='large'
                            color={"info"}
                            variant='contained'
                            onClick={handleChangeStatus}
                            startIcon={<Icon>autorenew</Icon>}
                            title='Alterar situação'
                            loading={loading}>
                            {status ? "Inativar" : "Ativar"}
                        </LoadingButton>
                    )}

                    <LoadingButton
                        type='submit'
                        size='large'
                        color={"success"}
                        variant='contained'
                        startIcon={<Icon>save</Icon>}
                        loading={loading}>
                        Salvar
                    </LoadingButton>
                </Grid>
            </Grid>
        </Grid>
    );
}
