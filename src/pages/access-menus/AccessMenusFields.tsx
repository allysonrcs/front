import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Grid, GridProps, Icon } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useConfirm } from "material-ui-confirm";
import FormInput from "@/components/FormComponents/FormInput";
import { IupdateMenu } from "./ListRecordsAccessMenus";
import { useGlobal } from "@/contexts/GlobalContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { createMenu, searchMenuById, updateMenu, updateMenuStatus } from "@/services/access-menus";

type OpenEditMenuProps = {
    idMenu?: number | null;
    editMenu?: (params: IupdateMenu) => void;
} & GridProps;

type SubmitProps = {
    name: string;
    icon?: string;
    route: string;
    description?: string;
};

const validationSchema = Yup.object().shape({
    name: Yup.string().typeError("Obrigatório").required("Obrigatório").max(120, "Excedeu 120 caracteres").trim(),
    icon: Yup.string().max(120, "Excedeu 120 caracteres").trim().optional(),
    route: Yup.string().typeError("Obrigatório").required("Obrigatório").max(120, "Excedeu 120 caracteres").trim(),
    description: Yup.string().max(255, "Excedeu 255 caracteres").optional(),
});

export function AccessMenusFields({ idMenu, editMenu, ...props }: OpenEditMenuProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<boolean>(false);

    const { getInfoError } = useGlobal();
    const confirm = useConfirm();

    const {
        control,
        formState: { errors },
        handleSubmit,
        reset,
        setValue,
    } = useForm<SubmitProps>({ resolver: yupResolver(validationSchema) });

    const onSubmit = async (params: SubmitProps) => {
        try {
            setLoading(true);
            if (idMenu) {
                await updateMenu(idMenu, params);
                editMenu?.(params);
            } else {
                await createMenu(params);
                reset();
            }
            toast.success(`Menu ${idMenu ? "atualizado" : "criado"} com sucesso!`);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const setValuesMenu = async (id: number) => {
        try {
            setLoading((prev) => !prev);
            const { name, route, icon, description, is_active } = await searchMenuById(id);
            setValue("name", name);
            setValue("route", route);
            setValue("icon", icon);
            setValue("description", description);
            setStatus(is_active);
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatus = async () => {
        if (idMenu) {
            confirm({
                title: `Deseja realmente ${!status ? "Ativar" : "Inativar"} o registro?`,
                description: "O registro de acesso de menu sofrerá alteração em seu status.",
            })
                .then(async () => {
                    try {
                        if (idMenu) {
                            await updateMenuStatus(idMenu, { is_active: !status });
                            editMenu?.({ is_active: !status });

                            setStatus((status) => !status);
                        }
                        toast.success("Situação do menu alterada com sucesso!");
                    } catch (error) {
                        const info = await getInfoError(error);
                        toast.error(info.message);
                    }
                })
                .catch(() => {});
        }
    };

    useEffect(() => {
        if (idMenu) {
            setValuesMenu(idMenu);
        }
    }, []);

    return (
        <Grid {...props}>
            <Grid container spacing={2} component='form' onSubmit={handleSubmit(onSubmit)} mt={1}>
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

                <Grid item xs={6} md={6}>
                    <FormInput
                        fullWidth
                        label='Icone do menu'
                        name='icon'
                        type='text'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>

                <Grid item xs={6} md={6}>
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

                <Grid item xs={12} md={12}>
                    <FormInput
                        fullWidth
                        multiline
                        rows={4}
                        label='Descrição'
                        name='description'
                        type='text'
                        variant='outlined'
                        control={control}
                        errors={errors}
                    />
                </Grid>

                <Grid container justifyContent='center' mt={5} gap={1}>
                    {idMenu && (
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
