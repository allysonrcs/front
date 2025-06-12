import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as Yup from "yup";
import {
    createUser,
    createUserProps,
    ISearchUser,
    searchUserByID,
    updateStatusUser,
    updateUser,
    UserAccessDepartmentProps,
} from "@/services/users";
import { searchAutoCompleteEmployees } from "@/services/employees";
import { autoCompleteAccessGroup, ITreeRouteProps } from "@/services/access-groups";
import { useGlobal } from "@/contexts/GlobalContext";
import { getAgenciesAndSectors } from "@/services/agencies";
import { Grid, GridProps, Icon, Typography, useTheme } from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import { LoadingButton } from "@mui/lab";
import FormAutocompleteMultiple from "@/components/FormComponents/FormAutocompleteMultiple";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import FormInput from "@/components/FormComponents/FormInput";
import TreeComponent from "@/components/TreeComponent/TreeComponent";

type autocomplete = {
    id: number;
    label: string;
};

type UserPros = {
    agency: autocomplete;
    collaborator: autocomplete;
    sisbr_id: number | null;
    login: string;
    password: string;
    confirm_password: string;
    access_groups: autocomplete[];
    user_access_agency: autocomplete[];
};

export type UserComponentProps = {
    idUser?: number;
    updateFunc?: (data: ISearchUser) => void;
} & GridProps;

const validationSchemaCreate = Yup.object().shape({
    collaborator: Yup.object().typeError("Obrigatório").required("Obrigatório"),
    login: Yup.string().max(255, "Excedeu 255 caracteres").required("Login é obrigatório").uppercase().trim(),
    sisbr_id: Yup.number()
        .nullable()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v)),
    password: Yup.string()
        .required("Obrigatório")
        .min(6, "A senha deve ter pelo menos 6 caracteres")
        .max(20, "A senha não deve exceder 20 caracteres"),
    confirm_password: Yup.string().oneOf([Yup.ref("password")], "Senhas não coincidem"),
    access_groups: Yup.array().test("isEmpty", "Obrigatório", (val) => (!val || val.length === 0 ? false : true)),
});

const validationSchemaUpdate = Yup.object().shape({
    login: Yup.string().max(255, "Excedeu 255 caracteres").uppercase().trim().required("Login é obrigatório"),
    sisbr_id: Yup.number()
        .nullable()
        .transform((v) => (v === "" || Number.isNaN(v) ? null : v)),
    password: Yup.string()
        .test("existMin", "A senha deve ter pelo menos 6 caracteres", (val) => (val && val?.length < 6 ? false : true))
        .max(20, "A senha não deve exceder 20 caracteres"),
    confirm_password: Yup.string().oneOf([Yup.ref("password")], "Senhas não coincidem"),
    access_groups: Yup.array().test("isEmpty", "Obrigatório", (val) => (!val || val.length === 0 ? false : true)),
});

export function UsersFields({ idUser, updateFunc, ...props }: UserComponentProps) {
    const [autoCollaborator, setAutoCollaborator] = useState<autocomplete[]>([]);
    const [autoCompleteAgency, setAutoCompleAgency] = useState<autocomplete[]>([]);
    const [accessGroup, setAccessGroup] = useState<autocomplete[]>([]);
    const [allow, setAllow] = useState<boolean>(true);
    const [status, setStatus] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [agenciesAndSectors, setAgenciesAndSectors] = useState<ITreeRouteProps[]>([]);
    const [options, setOptions] = useState<string[] | null>([]);
    const [agenciesAndSectorsSelected, setAgenciesAndSectorsSelected] = useState<string[]>([]);
    const [userAccessDepartment, setUserAccessDepartment] = useState<UserAccessDepartmentProps[]>([]);

    const { getInfoError, toggleStatusBackdrop } = useGlobal();

    const confirm = useConfirm();
    const theme = useTheme();

    const {
        setValue,
        handleSubmit,
        watch,
        control,
        reset,
        resetField,
        formState: { errors },
        getValues,
    } = useForm<UserPros | any>({
        resolver: yupResolver(idUser ? validationSchemaUpdate : validationSchemaCreate),
    });

    const agencySelected = watch("agency");
    const collaboratorSelected = watch("collaborator");

    const handleChangeStatus = () => {
        if (idUser) {
            confirm({
                title: `Deseja realmente ${!status ? "Ativar" : "Inativar"} o registro?`,
                description: "O registro do login sofrerá alteração em seu status.",
            })
                .then(async () => {
                    try {
                        await updateStatusUser(idUser, { is_active: !status });
                        setStatus((status) => !status);

                        updateFunc?.({
                            id: idUser,
                            is_active: !status,
                            login: getValues("login"),
                            name_people: getValues("collaborator.label"),
                            agency_name: getValues("agency.label"),
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

    async function onSubmit(params: UserPros) {
        let refactor = {} as createUserProps;

        if (params.login) {
            refactor = { ...refactor, login: params.login.trim() };
        }

        if (params.password) {
            refactor = { ...refactor, password: params.password };
        }

        if (params.access_groups) {
            const access_groups = params.access_groups.map(({ id }) => id);
            refactor = { ...refactor, access_groups: [...access_groups] };
        }

        refactor = {
            ...refactor,
            sisbr_id: params.sisbr_id ?? null,
            user_access_agencies_and_sectors: getSelecteds(agenciesAndSectors),
        };

        try {
            toggleStatusBackdrop();
            setLoading(true);

            if (idUser) {
                await updateUser(idUser, refactor);
                toast.success("Usuário atualizado com sucesso!");
                updateFunc?.({
                    id: idUser,
                    login: refactor.login,
                    name_people: getValues("collaborator.label"),
                    agency_name: getValues("agency.label"),
                    is_active: status,
                });
            } else {
                if (params.collaborator.id) {
                    refactor = { ...refactor, id_employee: params.collaborator.id };
                }

                await createUser(refactor);

                setAutoCollaborator((prev) => {
                    const data = prev.filter((value) => value.id !== params.collaborator.id);
                    return data;
                });

                setAgenciesAndSectorsSelected([]);

                toast.success("Usuário criado com sucesso!");

                reset();
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
            toggleStatusBackdrop();
        }
    }

    useEffect(() => {
        const run = async () => {
            try {
                toggleStatusBackdrop();

                const data = await autoCompleteAccessGroup({ is_active: true });
                const autoAccessGroup = data.map(({ id, name }) => {
                    return { id: id, label: name };
                });

                const allAgenciesAndSectors = await getAgenciesAndSectors();

                const units = allAgenciesAndSectors.map(({ id, name }) => {
                    return { id: id, label: name };
                });

                setAutoCompleAgency(units);

                const formated_agencies_and_sectors = allAgenciesAndSectors.map((item) => ({
                    id: item.id,
                    id_unique: item.id_unique,
                    name: item.name,
                    children: item.children as any,
                }));

                setAgenciesAndSectors(formated_agencies_and_sectors);

                setAccessGroup(autoAccessGroup);

                if (idUser) {
                    const { employees, is_active, login, sisbr_id, user_access_groups, user_access_departments } =
                        await searchUserByID(idUser);

                    setUserAccessDepartment(user_access_departments);

                    const access_groups = user_access_groups?.map(({ access_groups }: any) => {
                        const { id, name } = access_groups;
                        return { id: id, label: name };
                    });

                    setStatus(is_active);
                    setValue("agency", { id: employees.agencies.id, label: employees.agencies.abbreviation });
                    setValue("login", login);
                    setValue("sisbr_id", sisbr_id);
                    setValue("collaborator", { id: employees.peoples.id, label: employees.peoples.name });
                    setValue("access_groups", access_groups);
                }
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                toggleStatusBackdrop();
            }
        };

        run();
    }, []);

    useEffect(() => {
        const run = async () => {
            try {
                toggleStatusBackdrop();
                if (agencySelected) {
                    if (!idUser) {
                        const autoEmployee = await searchAutoCompleteEmployees({
                            id_agency: agencySelected.id,
                            no_user: true,
                        });

                        const refactor = autoEmployee.map(({ id, name }) => {
                            return { id: id, label: name };
                        });

                        setAutoCollaborator(refactor);

                        if (autoEmployee.length === 1) {
                            setValue("collaborator", { id: autoEmployee[0].id, label: autoEmployee[0].name });
                        }
                    }
                }
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                toggleStatusBackdrop();
            }
        };
        run();
    }, [agencySelected]);

    useEffect(() => {
        if (collaboratorSelected) {
            setAllow(false);

            if (!idUser) {
                resetField("login");
                resetField("password");
                resetField("confirm_password");
                resetField("access_groups");
                resetField("user_access_agency");
            }
        } else {
            setAllow(true);
        }
    }, [collaboratorSelected]);

    const getSelecteds = (params: ITreeRouteProps[] | undefined) => {
        let array: {
            agencies: {
                id: number;
                id_unique: string;
                sectors: number[];
            };
        }[] = [];

        function getItems(params: ITreeRouteProps[] | undefined) {
            if (params && options) {
                for (let item of params) {
                    for (let id_unique of options) {
                        if (item.id_unique === id_unique) {
                            if (item.id_parent) {
                                const exists = array.find((agencies) => agencies.agencies.id_unique === item.id_parent);

                                if (!exists) {
                                    array.push({
                                        agencies: {
                                            id: agenciesAndSectors.find((p) => p.id_unique === item.id_parent)?.id ?? 0,
                                            id_unique:
                                                agenciesAndSectors.find((p) => p.id_unique === item.id_parent)
                                                    ?.id_unique ?? "",
                                            sectors: [item.id],
                                        },
                                    });
                                } else {
                                    array.map((e) => {
                                        if (e.agencies.id === exists.agencies.id) {
                                            if (!e.agencies.sectors.includes(item.id)) {
                                                e.agencies.sectors.push(item.id);
                                            }
                                        }
                                        return e;
                                    });
                                }
                            } else {
                                array.push({
                                    agencies: {
                                        id: item.id,
                                        id_unique: item.id_unique,
                                        sectors: item.children.map((e) => e.id),
                                    },
                                });
                            }
                        }
                    }

                    if (item.children) {
                        getItems(item.children);
                    }
                }
            }
        }

        getItems(params);
        return array.map((item) => ({ agencies: { id: item.agencies.id, sectors: item.agencies.sectors } }));
    };

    function getAllChild(routes: ITreeRouteProps[], id_unit: number, id_sector: number) {
        let array: string[] = [];

        for (let route of routes) {
            if (route.id === id_unit && route.children) {
                for (let child of route.children) {
                    if (child.id === id_sector) {
                        if (!array.includes(child.id_unique)) {
                            array.push(child.id_unique);
                        }
                    }
                }
            }
        }
        return array;
    }

    async function getSelectedIds(user_access_department: UserAccessDepartmentProps[]): Promise<string[]> {
        return new Promise(async (resolve) => {
            let arraySelected: string[] = [];
            for (let value of user_access_department) {
                const unitFather = agenciesAndSectors.find((item) => item.id === value.id_agency);

                if (unitFather) {
                    if (!arraySelected.includes(unitFather.id_unique) && unitFather.children.length === 0) {
                        arraySelected.push(unitFather.id_unique);
                    }
                }

                const selected = await getAllChild(agenciesAndSectors, value.id_agency, value.id_sector);
                if (selected.length) {
                    for (let item of selected) {
                        if (!arraySelected.includes(item)) {
                            arraySelected.push(item);
                        }
                    }
                }
            }
            resolve(arraySelected);
        });
    }

    useEffect(() => {
        getSelectedIds(userAccessDepartment).then((result) => {
            setAgenciesAndSectorsSelected(result);
        });
    }, [userAccessDepartment]);

    return (
        <Grid {...props}>
            <Grid component='form' onSubmit={handleSubmit(onSubmit)} container spacing={2} mt={idUser ? -3 : undefined}>
                <Grid item md={6} xs={12}>
                    <FormAutocomplete
                        fullWidth
                        disabledAutocomplete={idUser ? true : false}
                        name='agency'
                        variant='outlined'
                        label='Filtrar usuário por Agência'
                        control={control}
                        errors={errors}
                        options={autoCompleteAgency}
                    />
                </Grid>

                <Grid item md={6} xs={12}>
                    <FormAutocomplete
                        fullWidth
                        disabledAutocomplete={idUser ? true : false}
                        name='collaborator'
                        variant='outlined'
                        label='Colaborador'
                        control={control}
                        errors={errors}
                        options={autoCollaborator}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography fontWeight={600}>Dados de Acesso</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                    <FormInput
                        fullWidth
                        title='Login do usuário utilizado no sistema SISBR'
                        disabled={allow ? true : false}
                        variant='outlined'
                        name='login'
                        label='Login'
                        control={control}
                        errors={errors}
                        inputProps={{
                            style: { textTransform: "uppercase" },
                        }}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <FormInput
                        fullWidth
                        disabled={allow ? true : false}
                        type='number'
                        variant='outlined'
                        name='sisbr_id'
                        label='ID Sisbr Usuário'
                        control={control}
                        errors={errors}
                    />
                </Grid>

                <Grid item md={6} xs={12}>
                    <FormInput
                        fullWidth
                        disabled={allow ? true : false}
                        type='password'
                        variant='outlined'
                        name='password'
                        label='Senha'
                        autoComplete='new-password'
                        control={control}
                        errors={errors}
                    />
                </Grid>

                <Grid item md={6} xs={12}>
                    <FormInput
                        fullWidth
                        disabled={allow ? true : false}
                        type='password'
                        variant='outlined'
                        name='confirm_password'
                        label='Confirme a senha'
                        control={control}
                        errors={errors}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography fontSize={12}>
                        <span style={{ color: theme.palette.warning.main }}>Atenção:</span> Lembre-se sempre de
                        adicionar a permissão
                        <span style={{ color: theme.palette.primary.main }}> grupo base</span> a todos os novos usuários
                        do sistema para garantir as permissões iniciais adequadas.
                    </Typography>
                </Grid>

                <Grid item xs={12}>
                    <FormAutocompleteMultiple
                        label='Permissão de acesso'
                        name='access_groups'
                        variant='outlined'
                        size='medium'
                        options={accessGroup}
                        control={control}
                        errors={errors}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography>Quais agências e setores esse usuário terá acesso?</Typography>
                    <Grid item xs={12} sx={{ height: 300, overflowY: "scroll" }}>
                        <TreeComponent
                            routes={agenciesAndSectors}
                            onChangeData={setOptions}
                            all_selected={agenciesAndSectorsSelected}
                        />
                    </Grid>
                </Grid>

                <Grid container justifyContent='center' gap={1} mt={5}>
                    {idUser && (
                        <Grid>
                            <LoadingButton
                                size='large'
                                color={"info"}
                                variant='contained'
                                onClick={handleChangeStatus}
                                startIcon={<Icon>{status ? "person_off" : "person"}</Icon>}
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
