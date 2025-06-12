import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton } from "@mui/lab";
import { Grid, Typography, TextField, Box, Stack, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { INFO_USER } from "@/constants/local-storage";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobal } from "@/contexts/GlobalContext";
import { CodeProps } from "@/services/auth";

const validateTowFactor = Yup.object().shape({
    code: Yup.string()
        .min(6, "Código deve ter mínimo 6 digitos")
        .max(6, "Código deve ter máximo 6 digitos")
        .required("Código obrigatório"),
});

type ModalTowFactorProps = {
    handleClose?: CallableFunction;
    data: {
        name?: string;
        email?: string;
    };
};

export const TwoFactor = ({ handleClose, data: { name, email } }: ModalTowFactorProps) => {
    const { getInfoError } = useGlobal();
    const { sendCodeVerification, user } = useAuth();

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<CodeProps>({ resolver: yupResolver(validateTowFactor) });

    const code = watch("code");

    const onSubmit = async (data: CodeProps) => {
        try {
            setLoading(true);

            await sendCodeVerification(data);

            handleClose?.();
            if (user) {
                navigate(0);
            }
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (code) {
            setValue("code", code.toUpperCase());
        }
    }, [code]);

    const showEmail = (email: string | undefined): string => {
        if (!email) {
            return "";
        }
        const firstPiece = email.slice(0, email.indexOf("@"));

        let name = "";

        for (let i = 0; i < firstPiece.length; i++) {
            if (i > 2) {
                name += "*";
            } else {
                name += firstPiece[i];
            }
        }

        return (name += email.slice(email.indexOf("@"), email.length));
    };

    useEffect(() => {
        const isConnected = sessionStorage.getItem(window.btoa(INFO_USER));
        if (isConnected) {
            navigate("/bem-vindo");
        }
    }, [user]);

    return (
        <Box>
            <Typography fontSize={15}>Olá {name}!</Typography>
            <Typography fontSize={15}>
                Por favor informe o código que enviamos para seu email {showEmail(email)}, para prosseguir.
            </Typography>
            <Grid component='form' onSubmit={handleSubmit(onSubmit)}>
                <Grid sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Grid>
                        <TextField
                            sx={{
                                "& fieldset": { borderRadius: "50px !important" },
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "50px !important",
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#00A494",
                                    },
                                },
                                "& input": {
                                    padding: "0.85rem 1.5rem",
                                },
                            }}
                            fullWidth
                            color='success'
                            inputProps={{ style: { fontSize: 16 } }}
                            variant='outlined'
                            size='small'
                            placeholder='Código de verificação'
                            type='text'
                            error={errors.code ? true : false}
                            {...register("code")}
                        />
                    </Grid>
                    <LoadingButton
                        type='submit'
                        color='success'
                        variant='contained'
                        size='large'
                        loading={loading}
                        sx={{
                            "&:hover": {
                                backgroundColor: "#00796d",
                            },
                            background: "#00A494",
                            borderRadius: 4,
                            mt: 3,
                            mb: 3,
                        }}>
                        Entrar
                    </LoadingButton>
                </Grid>
                {errors.code && (
                    <Stack sx={{ width: "100%" }} spacing={2}>
                        <Alert severity='error'>{errors.code?.message && errors.code.message}</Alert>
                    </Stack>
                )}
            </Grid>
        </Box>
    );
};
