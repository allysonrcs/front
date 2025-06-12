import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton } from "@mui/lab";
import { Grid, Icon, TextField } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobal } from "@/contexts/GlobalContext";
import { changePassword } from "@/services/users";
import { BoxModal } from "../../../BoxModal/BoxModal";

const validatePassword = Yup.object().shape({
    current_password: Yup.string()
        .min(6, "Digite ao menos 6 caracteres")
        .max(20, "A senha não deve exceder 20 caracteres")
        .required("Obrigatório"),
    new_password: Yup.string()
        .min(6, "Digite ao menos 6 caracteres")
        .max(20, "A senha não deve exceder 20 caracteres")
        .required("Senha é obrigatório!"),
    confirm_password: Yup.string()
        .required()
        .oneOf([Yup.ref("new_password")], "Senhas não coincidem"),
});

type ChangePasswordProps = {
    current_password: string;
    new_password: string;
    confirm_password: string;
};

type ModalChangePasswordProps = {
    handleClose?: () => void;
    closeButton?: boolean;
};

export default function ChangePassword({ handleClose, closeButton }: ModalChangePasswordProps) {
    const [loading, setLoading] = useState(false);

    const { getInfoError } = useGlobal();
    const { updateLocalUser, user } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ChangePasswordProps>({ resolver: yupResolver(validatePassword) });

    const onSubmit = async (data: ChangePasswordProps) => {
        try {
            setLoading(true);
            await changePassword({ current_password: data.current_password, new_password: data.new_password });
            handleClose?.();

            user && updateLocalUser({ ...user, is_first_password: false });
            toast.success("Senha alterada com sucesso!");
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <BoxModal
            title='Alterar Senha'
            handleClose={() => {
                handleClose?.();
            }}>
            <Grid component='form' container onSubmit={handleSubmit(onSubmit)}>
                <Grid container mb={2} mt={2}>
                    <TextField
                        fullWidth
                        type='password'
                        label='Senha atual'
                        variant='standard'
                        autoComplete='new-password'
                        {...register("current_password")}
                        error={errors.current_password ? true : false}
                        helperText={errors.current_password?.message}
                    />
                </Grid>
                <Grid container mb={2} mt={2}>
                    <TextField
                        fullWidth
                        type='password'
                        label='Nova senha'
                        variant='standard'
                        autoComplete='new-password'
                        {...register("new_password")}
                        error={errors.new_password ? true : false}
                        helperText={errors.new_password?.message}
                    />
                </Grid>

                <Grid container mb={2} mt={2}>
                    <TextField
                        fullWidth
                        type='password'
                        label='Confirme sua nova senha'
                        variant='standard'
                        autoComplete='new-password'
                        {...register("confirm_password")}
                        error={errors.confirm_password ? true : false}
                        helperText={errors.confirm_password?.message}
                    />
                </Grid>

                <Grid container display='flex' justifyContent='center' mt={5} spacing={2}>
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
        </BoxModal>
    );
}
