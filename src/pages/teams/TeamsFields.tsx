import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Grid, GridProps, Icon } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useConfirm } from "material-ui-confirm";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useGlobal } from "@/contexts/GlobalContext";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import FormInput from "@/components/FormComponents/FormInput";
import { IAutocompleteSector, searchAutocompleteSector } from "@/services/sectors";
import { IAgenciesAutocomplete, searchAutocompleteAgencies } from "@/services/agencies";
import { createTeam, searchOneTeam, updateStatusTeam, ISearchOneTeam, updateTeam, ISearchTeam } from "@/services/teams";
import { searchAutoCompleteEmployees, ISearchAutoCompleteEmployee } from "@/services/employees";
import moment from "moment";

type AutocompleteNumber = {
    id: number;
    label: string;
};
type TeamProps = {
    agency: AutocompleteNumber;
    sector: AutocompleteNumber;
    leader: AutocompleteNumber;
    ref_team_id?: number | null;
    name: string;
    description: string | null;
};

const validationSchema = Yup.object().shape({
    agency: Yup.object().typeError("Obrigatório").required("Agência é obrigatório"),
    sector: Yup.object().typeError("Obrigatório").required("Setor é obrigatório"),
    ref_team_id: Yup.number()
        .transform((v) => (v === "" || v === null || Number.isNaN(v) ? null : v))
        .nullable(),
    leader: Yup.object().nullable(),
    name: Yup.string().required("Nome é obrigatório").trim(),
});

export type TeamComponentProps = {
    idTeam?: number;
    updateFunc?: (data: ISearchTeam) => void;
} & GridProps;

export function TeamsFields({ idTeam, updateFunc, ...props }: TeamComponentProps) {
    const [dataTeam, setDataTeam] = useState<ISearchOneTeam>({} as ISearchOneTeam);
    const [arraySector, setArraySector] = useState<IAutocompleteSector[]>([]);
    const [arrayAgencies, setArrayAgencies] = useState<IAgenciesAutocomplete[]>([]);
    const [arrayLeader, setArrayLeader] = useState<ISearchAutoCompleteEmployee[]>([]);
    const [status, setStatus] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    const { getInfoError, toggleStatusBackdrop } = useGlobal();

    const confirm = useConfirm();

    const {
        handleSubmit,
        control,
        setValue,
        reset,
        resetField,
        watch,
        getValues,
        formState: { errors },
    } = useForm<TeamProps | any>({ resolver: yupResolver(validationSchema) });

    const agencySelected = watch("agency");
    const sectorSelected = watch("sector");

    const onSubmit = async (data: TeamProps) => {
        try {
            setLoading(true);

            if (idTeam) {
                await updateTeam(idTeam, {
                    id_leader: data?.leader?.id,
                    name: data.name,
                    description: data.description,
                    ref_team_id: data.ref_team_id === undefined || data.ref_team_id === null ? null : data.ref_team_id,
                });

                updateFunc?.({
                    id: idTeam,
                    description: data?.description ? data.description : null,
                    name: data.name,
                    agency_name: data.agency.label,
                    sector_name: data.sector.label,
                    ref_team_id: data.ref_team_id === undefined || data.ref_team_id === null ? null : data.ref_team_id,
                    total_employee: -1,
                    created_at: "",
                    is_active: status,
                    updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                });

                toast.success("Registro atualizado com sucesso!");
            } else {
                await createTeam({
                    id_sector: data.sector.id,
                    id_leader: data?.leader?.id,
                    name: data.name,
                    ref_team_id: data.ref_team_id === undefined || data.ref_team_id === null ? null : data.ref_team_id,
                    description: data.description,
                });

                toast.success("Registro criado com sucesso!");
                reset();
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatus = () => {
        if (idTeam) {
            confirm({
                title: `Deseja realmente ${!status ? "Ativar" : "Inativar"} o registro?`,
                description: `O registro do Time sofrerá alteração em seu status.`,
            })
                .then(async () => {
                    try {
                        await updateStatusTeam(idTeam, { is_active: !status });
                        setStatus((status) => !status);

                        updateFunc?.({
                            id: idTeam,
                            name: getValues("name"),
                            agency_name: getValues("agency.label"),
                            sector_name: getValues("sector.label"),
                            total_employee: -1,
                            created_at: "",
                            is_active: !status,
                            updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
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

    const searchAgencies = async () => {
        try {
            const agency = await searchAutocompleteAgencies({ is_active: true, with_restrict_agency: true });

            setArrayAgencies(agency);

            if (agency && agency.length === 1) {
                setValue("agency", { id: agency[0].id, label: agency[0].abbreviation });
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const searchRegister = async (id: number) => {
        try {
            const data = await searchOneTeam(id);
            setDataTeam(data);

            setValue("agency", { id: data.sectors.agencies.id, label: data.sectors.agencies.abbreviation });
            setValue("sector", { id: data.sectors.id, label: data.sectors.name });
            if (data.leader_employee) {
                setValue("leader", { id: data.leader_employee.id, label: data.leader_employee.peoples.name });
            }
            setValue("name", data.name);
            setValue("ref_team_id", data.ref_team_id ?? null);
            setValue("description", data.description ?? "");

            setStatus(data.is_active);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const searchSectorsOfTheUnit = async (id_agency: number) => {
        try {
            const sector = await searchAutocompleteSector({ is_active: true, id_agency });
            setArraySector(sector);

            if (sector && sector.length === 1) {
                setValue("sector", {
                    id: sector[0].id,
                    label: sector[0].name,
                });
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const searchEmployeeOfTheSector = async () => {
        try {
            const employee = await searchAutoCompleteEmployees({
                id_agency: agencySelected.id,
                id_sector: sectorSelected.id,
                is_active: true,
                has_function: true,
            });

            setArrayLeader(employee);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    useEffect(() => {
        async function execute() {
            if (
                !Object.keys(dataTeam).length ||
                (Object.keys(dataTeam).length && agencySelected?.id !== dataTeam.sectors.agencies.id)
            ) {
                resetField("sector");
                setArraySector([]);
            }

            if (agencySelected) {
                toggleStatusBackdrop();

                await searchSectorsOfTheUnit(agencySelected.id);

                toggleStatusBackdrop();
            }
        }
        execute();
    }, [agencySelected]);

    useEffect(() => {
        async function execute() {
            if (
                !Object.keys(dataTeam).length ||
                (Object.keys(dataTeam).length && sectorSelected?.id !== dataTeam.sectors.id)
            ) {
                resetField("leader");
                setArrayLeader([]);
            }

            if (sectorSelected) {
                toggleStatusBackdrop();

                await searchEmployeeOfTheSector();

                toggleStatusBackdrop();
            }
        }
        execute();
    }, [sectorSelected]);

    useEffect(() => {
        async function execute() {
            toggleStatusBackdrop();

            await searchAgencies();

            if (idTeam) {
                await searchRegister(idTeam);
            }

            toggleStatusBackdrop();
        }

        execute();
    }, []);

    return (
        <Grid {...props}>
            <Grid container spacing={2} component='form' onSubmit={handleSubmit(onSubmit)} mt={0}>
                <Grid item xs={12} md={4}>
                    <FormAutocomplete
                        fullWidth
                        name='agency'
                        label='Agência'
                        variant='outlined'
                        disabledAutocomplete={idTeam ? true : false}
                        control={control}
                        errors={errors}
                        options={arrayAgencies.map((value) => {
                            return {
                                id: value.id,
                                label: value.abbreviation,
                            };
                        })}
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <FormAutocomplete
                        fullWidth
                        name='sector'
                        label='Setor'
                        variant='outlined'
                        control={control}
                        disabledAutocomplete={!agencySelected || (idTeam ? true : false)}
                        errors={errors}
                        options={arraySector.map((value) => {
                            return {
                                id: value.id,
                                label: value.name,
                            };
                        })}
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <FormInput
                        fullWidth
                        label='ID Referência'
                        name='ref_team_id'
                        type='number'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>

                <Grid item xs={12} md={12}>
                    <FormAutocomplete
                        fullWidth
                        name='leader'
                        label='Líder'
                        variant='outlined'
                        control={control}
                        disabledAutocomplete={!sectorSelected}
                        errors={errors}
                        options={arrayLeader.map((value) => {
                            return {
                                id: value.id,
                                label: value.name,
                            };
                        })}
                    />
                </Grid>

                <Grid item xs={12} md={12}>
                    <FormInput
                        fullWidth
                        label='Nome equipe'
                        name='name'
                        type='text'
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

                <Grid container justifyContent='center' mt={5} gap={1}>
                    {idTeam && (
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
            </Grid>
        </Grid>
    );
}
