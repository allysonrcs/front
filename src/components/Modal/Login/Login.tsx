import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, TextField, Typography, Link, Grid } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobal } from "@/contexts/GlobalContext";
import { BoxModal } from "../../BoxModal/BoxModal";
import { isValidCPF } from "@/functions/number";
import FormInputMask from "@/components/FormComponents/FormInputMask";

type LoginPros = {
    login: string;
    password: string;
};

export function Login() {
    const { user, signIn, logOut } = useAuth();
    const { getInfoError, toggleStatusModalLogin, toggleStatusModalTowFactor } = useGlobal();

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const validationSchema = Yup.object().shape({
        login: Yup.string()
            .test("isValidCPF", "Cpf inválido", (val) => isValidCPF(val ?? ""))
            .transform((value) => value.replace(/[\-\.]/g, ""))
            .required("Obrigatório"),
        password: Yup.string()
            .required("Senha é obrigatória")
            .min(6, "A senha deve ter pelo menos 6 caracteres")
            .max(30, "A senha não deve exceder 30 caracteres"),
    });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<LoginPros>({
        resolver: yupResolver(validationSchema),
    });

    const onSubmit = async (data: LoginPros) => {
        try {
            setLoading(true);

            const response = await signIn(data.login, data.password);

            if (typeof response === "boolean") {
                navigate(0);
            } else {
                toggleStatusModalTowFactor();
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logOut();
        toggleStatusModalLogin();
        navigate("/auth/login");
    };

    return (
        <BoxModal title='Faça login novamente' width={500}>
            <Typography overflow='hidden' textOverflow='ellipses' textAlign={"center"} fontSize={14}>
                Olá, {user?.name}!
            </Typography>

            <Box component='form' onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
                <FormInputMask
                    placeholder='CPF'
                    fullWidth
                    name='login'
                    mask='999.999.999-99'
                    control={control}
                    errors={errors}
                />

                <TextField
                    margin='normal'
                    fullWidth
                    label='Senha'
                    type='password'
                    id='password'
                    autoComplete='current-password'
                    {...register("password")}
                    error={errors.password ? true : false}
                    helperText={errors.password?.message}
                />

                <LoadingButton
                    type='submit'
                    fullWidth
                    color='success'
                    variant='contained'
                    size='large'
                    loading={loading}
                    sx={{ mt: 3 }}>
                    Conectar
                </LoadingButton>
            </Box>

            <Grid textAlign={"center"} sx={{ mt: 3 }}>
                <Typography overflow='hidden' display='inline' mr={1} textOverflow='ellipses' fontSize={14}>
                    Não é você?
                </Typography>

                <Link component='button' onClick={handleLogout}>
                    Clique aqui!
                </Link>
            </Grid>
        </BoxModal>
    );
}
