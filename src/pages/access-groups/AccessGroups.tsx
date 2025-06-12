import { useEffect, useState } from "react";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import { Grid, Icon, Typography } from "@mui/material";
import { BoxMain } from "@/components/Box/BoxMain";
import { useGlobal } from "@/contexts/GlobalContext";
import FormInput from "@/components/FormComponents/FormInput";
import { useForm } from "react-hook-form";
import TreeComponent from "@/components/TreeComponent/TreeComponent";
import {
    changeStatusAccessGroup,
    createGroupAccess,
    getOneGroupAccessById,
    getTreeRoutes,
    IAccessGroupPageAndRouteProps,
    ITreeRouteProps,
    ITreeRoutes,
    updateAccessGroup,
} from "@/services/access-groups";
import { toast } from "react-toastify";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams } from "react-router-dom";
import { useConfirm } from "material-ui-confirm";

type AccessGroupsProps = {
    name: string;
    description: string;
};

const schemaAccessGroups = Yup.object().shape({
    name: Yup.string().required("Obrigatório").trim(),
    description: Yup.string().required("Obrigatório").max(255, "Tamanho máximo permitido 255 caracteres"),
});

export function AccessGroups() {
    const { getInfoError, toggleStatusBackdrop } = useGlobal();
    const [loading, setLoading] = useState(false);
    const [routes, setRoutes] = useState<ITreeRoutes>();
    const [pages, setPages] = useState<string[] | null>([]);
    const [actions, setActions] = useState<string[] | null>([]);
    const [access_groups, setAccessGroups] = useState<IAccessGroupPageAndRouteProps>(
        {} as IAccessGroupPageAndRouteProps,
    );
    const [status, setStatus] = useState<boolean>(false);
    const params = useParams();
    const confirm = useConfirm();
    const [selectedPages, setSelectedPages] = useState<string[]>([]);
    const [selectedActions, setSelectedActions] = useState<string[]>([]);

    const {
        control,
        formState: { errors },
        handleSubmit,
        reset,
        setValue,
    } = useForm<AccessGroupsProps>({ resolver: yupResolver(schemaAccessGroups) });

    const onSubmit = async (data: AccessGroupsProps) => {
        try {
            setLoading(true);
            if (!pages && !actions) {
                return toast.error("Selecione pelo menos uma Tela ou uma Funcionalidade");
            }

            const ids_access_pages = getPagesSelected(routes?.array_page_tree);
            const ids_access_actions = getActionsSelected(routes?.array_action_tree);

            if (!access_groups.id) {
                await createGroupAccess({
                    ...data,
                    ids_access_actions,
                    ids_access_pages,
                });
                reset();
                setSelectedActions([]);
                setSelectedPages([]);
            } else {
                await updateAccessGroup(access_groups.id, {
                    ...data,
                    ids_access_actions,
                    ids_access_pages,
                });
            }

            toast.success(`Grupo de acesso ${access_groups.id ? "atualizado" : "criado "} com sucesso!`);
        } catch (error) {
            const { message } = await getInfoError(error);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const getTree = async () => {
        try {
            toggleStatusBackdrop();
            const response = await getTreeRoutes();
            setRoutes(response);
        } catch (error) {
            const { message } = await getInfoError(error);
            toast.error(message);
        } finally {
            toggleStatusBackdrop();
        }
    };

    const getPagesSelected = (screens: ITreeRouteProps[] | undefined) => {
        let array: number[] = [];

        function getPages(screens: ITreeRouteProps[] | undefined) {
            if (screens && pages) {
                for (let page of screens) {
                    for (let pageSelected of pages) {
                        if (page.id_unique === pageSelected && page.origin === "access_page") {
                            array.push(page.id);
                        }
                    }

                    if (page.children) {
                        getPages(page.children);
                    }
                }
            }
        }

        getPages(screens);

        return array;
    };

    const getActionsSelected = (functionalities: ITreeRouteProps[] | undefined) => {
        let array: number[] = [];

        function getActions(functionalities: ITreeRouteProps[] | undefined) {
            if (functionalities && actions) {
                for (let func of functionalities) {
                    for (let pageSelected of actions) {
                        if (func.id_unique === pageSelected && func.origin === "access_action") {
                            array.push(func.id);
                        }
                    }

                    if (func.children) {
                        getActions(func.children);
                    }
                }
            }
        }

        getActions(functionalities);

        return array;
    };

    const handleChangeStatus = async () => {
        if (access_groups.id) {
            confirm({
                title: `Deseja realmente ${!status ? "Ativar" : "Inativar"} o registro?`,
                description: "O registro de grupo de acesso sofrerá alteração em seu status.",
            })
                .then(async () => {
                    try {
                        await changeStatusAccessGroup(access_groups.id, { is_active: !status });
                        setStatus((status) => !status);
                        toast.success(`${status ? "Inativado" : "Ativado"} com sucesso!`);
                    } catch (error) {
                        const info = await getInfoError(error);
                        toast.error(info.message);
                    }
                })
                .catch(() => {});
        } else {
            toast.error("Ocorreu um erro ao pegar identificador do registro.");
        }
    };

    const searchRegister = async (id_access_group: number) => {
        try {
            const data = await getOneGroupAccessById(id_access_group);
            setStatus(data.is_active);
            setAccessGroups(data);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    useEffect(() => {
        async function execute() {
            await getTree();
            if (params.id && !access_groups.id) {
                await searchRegister(parseInt(params.id));
            }
        }
        execute();
    }, []);

    useEffect(() => {
        if (access_groups.id) {
            setValue("name", access_groups.name);
            setValue("description", access_groups.description ?? "");

            if (routes) {
                let arrayPages: string[] = [];

                for (let page of access_groups.access_groups_pages) {
                    const pages = getAllChild(routes.array_page_tree, page.id_access_page);

                    if (pages.length) {
                        arrayPages = [...arrayPages, ...pages];
                    }
                }

                setSelectedPages(arrayPages);

                let arrayActions: string[] = [];

                for (let action of access_groups.access_groups_actions) {
                    const actions = getAllChild(routes.array_action_tree, action.id_access_action);
                    if (actions.length) {
                        arrayActions = [...arrayActions, ...actions];
                    }
                }

                setSelectedActions(arrayActions);
            }
        }
    }, [access_groups]);

    function getAllChild(routes: ITreeRouteProps[], id: number) {
        let array: string[] = [];

        function getAll(routes: ITreeRouteProps[], id: number) {
            for (let route of routes) {
                if (route.id === id && !route.children) {
                    array.push(route.id_unique);
                }

                if (route.children) {
                    getAll(route.children, id);
                }
            }
        }

        getAll(routes, id);
        return array;
    }

    return (
        <BoxMain title='Cadastro de Grupo de Acesso' goBack={true}>
            <Grid spacing={2} container component='form' onSubmit={handleSubmit(onSubmit)}>
                <Grid item xs={12} md={12} mt={2}>
                    <FormInput
                        fullWidth
                        type='text'
                        name='name'
                        control={control}
                        errors={errors}
                        label='Nome do Grupo'
                        placeholder='Nome do Grupo'
                        variant='outlined'
                    />
                </Grid>

                <Grid item xs={12} md={12} mb={3}>
                    <FormInput
                        name='description'
                        control={control}
                        errors={errors}
                        fullWidth
                        type='text'
                        label='Descrição'
                        variant='filled'
                        multiline
                        rows={3}
                    />
                </Grid>

                <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                        display: "flex",
                        width: "100%",
                        maxHeight: "550px",
                        overflow: "auto",
                        flexDirection: "column",
                    }}>
                    <Typography>Módulos / Páginas</Typography>
                    <Grid item sx={{ marginTop: 3 }}>
                        <TreeComponent
                            onChangeData={setPages}
                            routes={routes?.array_page_tree ?? []}
                            all_selected={selectedPages}
                        />
                    </Grid>
                </Grid>

                <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                        display: "flex",
                        width: "100%",
                        maxHeight: "550px",
                        overflow: "auto",
                        flexDirection: "column",
                    }}>
                    <Typography>Funcionalidades</Typography>
                    <Grid item sx={{ marginTop: 3 }}>
                        <TreeComponent
                            onChangeData={setActions}
                            routes={routes?.array_action_tree ?? []}
                            all_selected={selectedActions}
                        />
                    </Grid>
                </Grid>

                <Grid container display='flex' justifyContent='center' gap={1} mt={5}>
                    {access_groups.id && (
                        <Grid>
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
        </BoxMain>
    );
}
