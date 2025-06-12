import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Grid, GridProps, Icon } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useConfirm } from "material-ui-confirm";
import { IUpdatePageProps } from "./ListRecordsAccessPages";
import FormAutocomplete from "@/components/FormComponents/FormAutocomplete";
import FormInput from "@/components/FormComponents/FormInput";
import { useGlobal } from "@/contexts/GlobalContext";
import {
    ISearchPageByID,
    autocompletePages,
    createPage,
    searchPageById,
    updatePage,
    updatePageStatus,
} from "@/services/access-pages";
import { autocompleteMenu } from "@/services/access-menus";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

export type OpenEditPageProps = {
    idPage?: number | null;
    editPage?: (params: IUpdatePageProps) => void;
} & GridProps;

type autocompleteProps = {
    id: number;
    label: string;
};

export type PageProps = {
    menu: autocompleteProps;
    page: autocompleteProps | null;
    name: string;
    route: string;
    icon?: string | null;
    component: string;
};

const validationSchema = Yup.object().shape({
    menu: Yup.object({
        id: Yup.number().required(),
        label: Yup.string().required(),
    }).required("Menu é obrigatório"),
    page: Yup.object({
        id: Yup.number().required(),
        label: Yup.string().required(),
    }).nullable(),
    name: Yup.string().trim().typeError("Obrigatório").required("Obrigatório").max(120, "Excedeu 120 caracteres"),
    route: Yup.string().trim().typeError("Obrigatório").required("Obrigatório").max(120, "Excedeu 120 caracteres"),
    icon: Yup.string().trim().max(120, "Excedeu 120 caracteres").nullable(),
    component: Yup.string().trim().required("Obrigatório").typeError("Obrigatório").max(120, "Excedeu 120 caracteres"),
});

export function AccessPagesFields({ idPage, editPage, ...props }: OpenEditPageProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<boolean>(false);
    const [menuAutoComplete, setMenuAutoComplete] = useState<autocompleteProps[]>([]);
    const [pageAutocomplete, setPageAutocomplete] = useState<autocompleteProps[]>([]);

    const [page, setPage] = useState<ISearchPageByID>({} as ISearchPageByID);

    const {
        control,
        formState: { errors },
        handleSubmit,
        setValue,
        watch,
        resetField,
        reset,
    } = useForm<PageProps>({ resolver: yupResolver(validationSchema) });

    const confirm = useConfirm();

    const { getInfoError, toggleStatusBackdrop } = useGlobal();

    const menu = watch("menu");

    const onSubmit = async (params: PageProps) => {
        let refactoring: any = {
            name: params.name,
            route: params.route,
            icon: params.icon,
            component: params.component,
        };

        if (params.page) {
            refactoring = { ...refactoring, id_access_page: params.page.id };
        }

        if (params.menu) {
            refactoring = { ...refactoring, id_access_menu: params.menu.id };
        }

        try {
            setLoading(true);
            if (idPage) {
                await updatePage(idPage, {
                    ...refactoring,
                    id_access_menu: params.menu.id,
                    id_access_page: params.page?.id,
                });
                editPage?.({
                    ...refactoring,
                    id_access_menu: params.menu.id,
                    id_access_page: params.page?.id,
                });
            } else {
                await createPage(refactoring);
                reset();
            }
            toast.success(`Página ${idPage ? "atualizada" : "criada"} com sucesso!`);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatus = () => {
        if (idPage) {
            confirm({
                title: `Deseja realmente ${!status ? "Ativar" : "Inativar"} o registro?`,
                description: "O registro de página sofrerá alteração em seu status.",
            })
                .then(async () => {
                    try {
                        if (idPage) {
                            await updatePageStatus(idPage, { is_active: !status });
                            editPage?.({ is_active: !status });
                            setStatus((status) => !status);
                        }

                        toast.success("Status da página alterada com sucesso!");
                    } catch (error) {
                        const info = await getInfoError(error);
                        toast.error(info.message);
                    }
                })
                .catch(() => {});
        }
    };

    const setAutocompleteOptions = async () => {
        const data = await autocompleteMenu({ is_active: true });

        const refactor = data.map(({ id_access_menu, name }) => {
            return { id: id_access_menu, label: name };
        });

        setMenuAutoComplete(refactor);
    };

    const setValuesPage = async (id: number) => {
        try {
            setLoading((prev) => !prev);
            const dataProps = await searchPageById(id);
            setPage(dataProps);

            const menuRef = { id: dataProps.access_menus.id, label: dataProps.access_menus.name };
            const pageRef = { id: dataProps.id, label: dataProps.name };

            setValue("menu", menuRef);
            setValue("page", pageRef);
            setValue("name", dataProps.name);
            setValue("route", dataProps.route);
            setValue("icon", dataProps.icon ?? "");
            setValue("component", dataProps.component);
            setStatus(dataProps.is_active);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const setAutocompleteOptionsPage = async (id_access_menu: number) => {
        try {
            const data = await autocompletePages({ is_active: true, id_access_menu });

            const refactor = data.map(({ id_access_page, name }) => {
                return { id: id_access_page, label: name };
            });

            setPageAutocomplete(refactor);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    useEffect(() => {
        async function execute() {
            toggleStatusBackdrop();
            try {
                await setAutocompleteOptions();

                if (idPage) {
                    await setValuesPage(idPage);
                }
            } catch (error) {
                const info = await getInfoError(error);
                toast.error(info.message);
            } finally {
                toggleStatusBackdrop();
            }
        }
        execute();
    }, []);

    useEffect(() => {
        if (menu) {
            if (!idPage || page.access_menus.id !== menu.id) {
                resetField("page", { defaultValue: undefined });
            }

            setAutocompleteOptionsPage(menu.id);
        }
    }, [menu]);

    return (
        <Grid {...props}>
            <Grid container spacing={2} component='form' onSubmit={handleSubmit(onSubmit)} mt={1}>
                <Grid item xs={6} md={6}>
                    <FormAutocomplete
                        fullWidth
                        name='menu'
                        label='Menu'
                        variant='outlined'
                        control={control}
                        errors={errors}
                        options={menuAutoComplete}
                    />
                </Grid>

                <Grid item xs={6} md={6}>
                    <FormAutocomplete
                        fullWidth
                        name='page'
                        label='Página principal'
                        variant='outlined'
                        control={control}
                        errors={errors}
                        options={pageAutocomplete}
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

                <Grid item xs={4} md={4}>
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

                <Grid item xs={4} md={4}>
                    <FormInput
                        fullWidth
                        label='Icone'
                        name='icon'
                        type='text'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>

                <Grid item xs={4} md={4}>
                    <FormInput
                        fullWidth
                        label='Componente'
                        name='component'
                        type='text'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>

                <Grid container justifyContent='center' mt={5} gap={1}>
                    {idPage && (
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
