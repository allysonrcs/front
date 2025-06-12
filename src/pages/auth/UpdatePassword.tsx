import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import Avatar from "@mui/material/Avatar";
import LoadingButton from "@mui/lab/LoadingButton";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import SyncLockIcon from "@mui/icons-material/SyncLock";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useGlobal } from "@/contexts/GlobalContext";
import { updatePassword } from "@/services/users";
import logo_mind_colorido from "@/assets/images/logo-mind-colorido-horizontal.png";
import icon_sicoob from "@/assets/images/sicoob-icon.png";

export type PasswordPros = {
    password: string;
    confirm_password: string;
};

export function UpdatePassword() {
    const [token, setToken] = useState<string>("");
    const { getInfoError } = useGlobal();

    const [urlParams] = useSearchParams();

    const [loading, setLoading] = useState(false);

    const currentYear = new Date().getFullYear();

    const goBack = () => {
        toast.warning("Para acessar o TOKEN é obrigatório!");
        navigate("/auth/login");
    };

    const navigate = useNavigate();

    useEffect(() => {
        const access_token = urlParams.get("access_token");

        if (!access_token) {
            goBack();
        } else {
            setToken(access_token);
        }
    }, []);

    const validationSchema = Yup.object().shape({
        password: Yup.string()
            .min(6, "Digite ao menos 6 caracteres")
            .max(30, "A senha não deve exceder 30 caracteres")
            .required("Senha é obrigatório!"),
        confirm_password: Yup.string()
            .oneOf([Yup.ref("password")], "Senhas não coincidem")
            .required("Senha é obrigatório!"),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(validationSchema) });

    const onSubmit = async (data: PasswordPros) => {
        if (!token) {
            goBack();
        }

        try {
            setLoading(true);
            await updatePassword({ password: data.password, token });
            toast.success("Troca de senha efetuada com sucesso!");
            navigate("/auth/login");
        } catch (error) {
            setLoading(false);
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    return (
        <Container component='main' maxWidth='md'>
            <CssBaseline />
            <Box
                sx={{
                    width: "100%",
                    my: 20,
                    mx: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                <Avatar sx={{ m: 1, bgcolor: "#00A494" }}>
                    <SyncLockIcon />
                </Avatar>

                <Typography component='h1' variant='h5'>
                    Alterar Senha
                </Typography>

                <Box component='form' noValidate onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
                    <Typography textAlign={"center"} sx={{ mb: 5 }}>
                        Insera a baixo a sua nova senha para realizar alteração.
                    </Typography>

                    <Grid item sx={{ mb: 2 }} xs={12}>
                        <TextField
                            sx={{
                                "& fieldset": { borderRadius: "10px !important" },
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px !important",
                                    backgroundColor: "#fff",
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#00A494",
                                    },
                                },
                                "& input": {
                                    padding: "0.85rem 1.5rem",
                                },
                                mt: 1,
                            }}
                            required
                            fullWidth
                            placeholder='Nova Senha'
                            type='password'
                            id='password'
                            autoComplete='new-password'
                            {...register("password")}
                            error={errors.password ? true : false}
                            helperText={errors.password?.message}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            sx={{
                                "& fieldset": { borderRadius: "10px !important" },
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px !important",
                                    backgroundColor: "#fff",
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#00A494",
                                    },
                                },
                                "& input": {
                                    padding: "0.85rem 1.5rem",
                                },
                                mt: 1,
                            }}
                            required
                            fullWidth
                            placeholder='Confirme a Senha'
                            type='password'
                            id='confirm_password'
                            autoComplete='new-password'
                            {...register("confirm_password")}
                            error={errors.confirm_password ? true : false}
                            helperText={errors.confirm_password?.message}
                        />
                    </Grid>

                    <LoadingButton
                        fullWidth
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
                            borderRadius: "10px",
                            mt: 4,
                            mb: 3,
                        }}>
                        Trocar Senha
                    </LoadingButton>
                </Box>

                <Grid container justifyContent='center'>
                    <Grid item>
                        <Link to='/auth/login'>
                            <Typography sx={{ mb: 3, color: "#00A494" }}>Retornar para página de login</Typography>
                        </Link>
                    </Grid>
                </Grid>

                <Grid container justifyContent='center'>
                    <Typography
                        variant='body2'
                        color='text.secondary'
                        align='center'
                        fontSize={12}
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        © {currentYear} {import.meta.env.VITE_APP_NAME.toUpperCase()}{" "}
                        {import.meta.env.VITE_APP_VERSION} -{" "}
                        <img
                            style={{
                                height: "1.20em",
                                verticalAlign: "middle",
                                display: "inline-block",
                            }}
                            title={"Desenvolvido pela equipe MIND"}
                            src={logo_mind_colorido}
                            alt='Logo MIND'
                        />{" "}
                        |{" "}
                        <img
                            style={{
                                height: "1.20em",
                                verticalAlign: "middle",
                                display: "inline-block",
                            }}
                            src={icon_sicoob}
                            alt='Icone Sicoob'
                        />{" "}
                        Ac Credi
                    </Typography>
                </Grid>
            </Box>
        </Container>
    );
}
