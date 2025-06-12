import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Grid, GridProps, Icon } from "@mui/material";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import FormInput from "@/components/FormComponents/FormInput";
import { LoadingButton } from "@mui/lab";
import { ArrayTypesRoutes } from "@/constants/array-routes";
import { useGlobal } from "@/contexts/GlobalContext";
import { toast } from "react-toastify";
import { changeStatusRoute, createRoute, searchRouteById, updateRoute } from "@/services/access-actions";
import { autocompleteModule } from "@/services/access-modules";
import { useConfirm } from "material-ui-confirm";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { IRouteProps, IsearchRoutesEditProps } from "@/types/access-actions";
import { autocompleteModuleProps } from "@/types/access-modules";

export type OpenEditRouteProps = {
    idRoute?: number | null;
    editRoute?: (Params: IsearchRoutesEditProps) => void;
} & GridProps;

const validationSchema = Yup.object().shape({
    id_access_module: Yup.object().typeError("Obrigatório").required("Obrigatório"),
    name: Yup.string().typeError("Obrigatório").required("Obrigatório").max(120, "Excedeu 120 caracteres").trim(),
    type_route: Yup.object().typeError("Obrigatório").required("Obrigatório"),
    route: Yup.string().typeError("Obrigatório").required("Obrigatório").max(120, "Excedeu 120 caracteres").trim(),
});

export function AccessActionsFields({ idRoute, editRoute, ...props }: OpenEditRouteProps) {
    const [autocompleteModules, setAutocompleteModules] = useState<autocompleteModuleProps[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<boolean>(false);

    const {
        handleSubmit,
        control,
        formState: { errors },
        setValue,
        reset,
    } = useForm<IRouteProps>({ resolver: yupResolver(validationSchema) });

    const { getInfoError, toggleStatusBackdrop } = useGlobal();

    const confirm = useConfirm();

    const onSubmit = async (params: IRouteProps) => {
        let refactoring: any = {
            name: params.name,
            route: params.route,
            id_access_module: params.id_access_module?.id,
            type_route: params.type_route?.id,
        };

        try {
            setLoading(true);
            if (idRoute) {
                await updateRoute(idRoute, refactoring);
                editRoute?.(refactoring);
            } else {
                await createRoute(refactoring);
                reset();
            }
            toast.success(`Rota ${idRoute ? "atualizada" : "criada"} com sucesso!`);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    function handleChangeStatus() {
        if (idRoute) {
            confirm({
                title: `Deseja realmente ${!status ? "Ativar" : "Inativar"} o registro?`,
                description: "O registro de rota sofrerá alteração em seu status.",
            })
                .then(async () => {
                    try {
                        if (idRoute) {
                            await changeStatusRoute(idRoute, { is_active: !status });
                            editRoute?.({ is_active: !status });
                            setStatus((status) => !status);
                        }

                        toast.success("Status da rota alterada com sucesso!");
                    } catch (error) {
                        const info = await getInfoError(error);
                        toast.error(info.message);
                    }
                })
                .catch(() => {});
        }
    }

    async function setValuesRoute(id: number) {
        try {
            toggleStatusBackdrop();
            const { name, route, type_route, access_modules, is_active } = await searchRouteById(id);

            const moduleRef = { id: access_modules.id, label: access_modules.name };
            const type = { id: type_route, label: type_route };

            setValue("id_access_module", moduleRef);
            setValue("name", name);
            setValue("route", route);
            setValue("type_route", type);
            setStatus(is_active);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            toggleStatusBackdrop();
        }
    }

    const setAutocompleteOptions = async () => {
        try {
            const data = await autocompleteModule({ is_active: true });

            const refactor = data.map(({ id_access_module, name }) => {
                return { id: id_access_module, label: name };
            });

            setAutocompleteModules(refactor);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    useEffect(() => {
        setAutocompleteOptions();

        if (idRoute) {
            setValuesRoute(idRoute);
        }
    }, []);

    return (
        <Grid {...props}>
            <Grid container spacing={2} component='form' onSubmit={handleSubmit(onSubmit)} mt={1}>
                <Grid item xs={12} md={12}>
                    <FormAutocomplete
                        fullWidth
                        name='id_access_module'
                        label='Módulo'
                        variant='outlined'
                        control={control}
                        errors={errors}
                        options={autocompleteModules}
                    />
                </Grid>

                <Grid item xs={12} md={12}>
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

                <Grid item xs={3} md={3}>
                    <FormAutocomplete
                        fullWidth
                        name='type_route'
                        label='Tipo de rota'
                        variant='outlined'
                        control={control}
                        errors={errors}
                        options={ArrayTypesRoutes}
                    />
                </Grid>

                <Grid item xs={9} md={9}>
                    <FormInput
                        fullWidth
                        label='Rota'
                        name='route'
                        type='text'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>

                <Grid container justifyContent='center' mt={5} gap={1}>
                    {idRoute && (
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
