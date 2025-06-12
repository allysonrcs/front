import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import LoadingButton from "@mui/lab/LoadingButton";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useGlobal } from "@/contexts/GlobalContext";
import { register as registerUser } from "@/services/users";
import FormInputMask from "@/components/FormComponents/FormInputMask";
import { useMediaQuery, useTheme } from "@mui/material";
import logoSING from "@/assets/images/sing-logo-colorida.png";
import { TextLogin } from "./TextLogin";
import { isValidCPF } from "@/functions/number";
import { CreateUserProps } from "@/types/user.type";
import bg_chat_blue from "@/assets/images/bg_chat-blue.png";
import "./TriangleLogin.scss";
import { Footer } from "@/components/Footer/Footer";

export function CreateUser() {
    const { getInfoError } = useGlobal();

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const theme = useTheme();
    const mdDown = useMediaQuery(theme.breakpoints.down("md"));

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .max(255, "Excedeu 255 caracteres")
            .required("Nome Completo é obrigatório!")
            .matches(/^[a-zA-ZÀ-ÖØ-öø-ÿ\s'-]*$/, "O campo de nome não pode conter números ou caracteres especiais")
            .trim(),
        document_cpf: Yup.string()
            .test("isValidCPF", "Cpf inválido", (val) => isValidCPF(val ?? ""))
            .transform((value) => value.replace(/[\-\.]/g, ""))
            .required("Obrigatório"),
        cel_phone: Yup.string()
            .transform((value) => value.replace(/[\(\)\- ]/g, ""))
            .required("Celular obrigatório"),
        email: Yup.string()
            .max(255, "Excedeu 255 caracteres")
            .required("E-mail é obrigatório!")
            .email("E-mail inválido!")
            .trim(),
        password: Yup.string().min(6, "Digite ao menos 6 caracteres").required("Senha é obrigatório!").trim(),
        password_confirm: Yup.string()
            .oneOf([Yup.ref("password")], "Senhas não coincidem")
            .required("E-mail é obrigatório!")
            .trim(),
    });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const onSubmit = async (data: CreateUserProps) => {
        try {
            setLoading(true);

            await registerUser({
                name: data.name.trim(),
                document_cpf: data.document_cpf.trim(),
                email: data.email.trim(),
                password: data.password,
                cel_phone: data.cel_phone,
            });

            navigate("/auth/login");
            toast.success("Cadastro realizado com sucesso! Realize login.");
        } catch (error) {
            setLoading(false);
            const info = await getInfoError(error);
            toast.error(info.message);
        }
    };

    const animatedEffect = () => {
        const container = document.querySelector("div.animatedEffectContainer");

        if (!container) {
            console.error("Contêiner animatedEffectContainer não encontrado");
            return;
        }

        for (let i = 0; i < 12; i++) {
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");

            const random = (min: number, max: number) => Math.random() * (max - min) + min;

            const size = Math.floor(random(40, 150));
            const position = random(1, 99);
            const delay = random(5, 0.1);
            const duration = random(15, 12);

            svg.setAttribute("viewBox", "0 0 900 900");
            svg.setAttribute("height", `${size}`);
            svg.setAttribute("width", `${size}`);
            svg.style.position = "absolute";
            svg.style.bottom = `-${size}px`;
            svg.style.left = `${position}%`;
            svg.style.animationDelay = `${delay}s`;
            svg.style.animationDuration = `${duration}s`;
            svg.style.animationTimingFunction = `cubic-bezier(${Math.random()}, ${Math.random()}, ${Math.random()}, ${Math.random()})`;
            svg.style.zIndex = "1";

            svg.setAttribute("class", "login-triangle");

            const path1 = document.createElementNS(svgNS, "path");
            const path2 = document.createElementNS(svgNS, "path");
            path2.setAttribute(
                "d",
                "m0 0h621l13 4 8 6 8 11 4 11v11l-5 12-11 20-22 38-12 21-22 38-14 24-13 23-14 24-13 23-6 10-16 27-16 28-14 24-8 14-10 17-16 28-28 48-16 28-15 26-9 15-16 28-15 26-8 10-10 6-4 2h-19l-12-6-8-8-10-15-15-27-9-15-12-21-10-17-16-28-9-15-8-14-14-24-14-25-7-11-32-56-13-22-16-28-15-26-16-28-15-26-8-14-10-17-12-21-15-26-16-28-11-19-9-17-2-9 1-11 4-10 6-8 9-7z",
            );
            path2.setAttribute("transform", "translate(141,197)");
            path2.setAttribute("fill", "#c3d64826");

            const path3 = document.createElementNS(svgNS, "path");
            path3.setAttribute(
                "d",
                "m0 0h350l13 4 8 6 8 11 4 11v11l-5 12-11 20-22 38-12 21-22 38-14 24-13 23-14 24-13 23-4 3h-116l-6-9-16-28-14-24-15-26-14-24-13-23-17-28-6-9-13-23-14-24-15-27-9-15-4-5v-2l-2-1z",
            );
            path3.setAttribute("transform", "translate(412,197)");
            path3.setAttribute("fill", "#01b19f26");

            const path4 = document.createElementNS(svgNS, "path");
            path4.setAttribute(
                "d",
                "m0 0h262v1l-10 1 4 6 5 7 6 11 15 27 14 24 14 25 1 2-3 3-14 25-6 9-6 11-9 16-14 24-15 26-8 13-6 11-9 16-7 13-10 17-13 22-6 11-10 16-6 11-7 12-5 5-1 7-3-4-15-26-16-28-9-15-16-28-15-26-16-28-15-26-8-14-10-17-12-21-15-26-16-28-11-19-9-17-2-9 1-11 4-10 6-8 9-7z",
            );
            path4.setAttribute("transform", "translate(141,197)");
            path4.setAttribute("fill", "#82c25526");

            const path5 = document.createElementNS(svgNS, "path");
            path5.setAttribute(
                "d",
                "m0 0 4 1 17 29 10 17 16 28 14 24 30 52 7 12v3h-192l1-5 9-16 8-14 14-24 30-52 9-15 6-11 10-17z",
            );

            path5.setAttribute("transform", "translate(450,301)");
            path5.setAttribute("fill", "#00494d7f");

            svg.appendChild(path1);
            svg.appendChild(path2);
            svg.appendChild(path3);
            svg.appendChild(path4);
            svg.appendChild(path5);

            container.appendChild(svg);
        }
    };

    useEffect(() => {
        animatedEffect();
    }, []);

    return (
        <>
            <Grid
                container
                component={"main"}
                sx={{
                    height: "100vh",
                    display: "flex",
                    justifyContent: mdDown ? "center" : "flex-end",
                }}>
                {!mdDown && (
                    <Grid
                        item
                        sx={{
                            width: "100%",
                            background: "linear-gradient(to right, #00796d, #016b61)",
                            backgroundImage: `url(${bg_chat_blue})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            position: "relative",
                            flex: 1,
                            overflow: "hidden",
                        }}>
                        <TextLogin />

                        <div className='animatedEffectContainer'></div>
                    </Grid>
                )}

                <Grid
                    item
                    xs={12}
                    sm={8}
                    md={4}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0px 40px",
                    }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "500px",
                        }}>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                alignContent: "center",
                                marginBottom: 1,
                            }}>
                            <img style={{ width: "250px" }} src={logoSING} alt='' />

                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    alignContent: "center",
                                }}>
                                <Typography
                                    color='#5a5a5a'
                                    sx={{ fontSize: mdDown ? "26px" : "28px", fontWeight: "bold" }}>
                                    Faça seu cadastro
                                </Typography>
                                <Typography sx={{ color: "#707070" }}>
                                    Já tem cadastro?{" "}
                                    <Link style={{ color: "#00A494" }} to='/auth/login'>
                                        Clique aqui para entrar
                                    </Link>
                                </Typography>
                            </Box>
                        </Box>

                        <Box component='form' onSubmit={handleSubmit(onSubmit)}>
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
                                }}
                                placeholder='Nome completo'
                                margin='normal'
                                fullWidth
                                variant='outlined'
                                id='name'
                                autoFocus
                                {...register("name")}
                                error={errors.name ? true : false}
                                helperText={errors.name?.message}
                                autoComplete='name'
                            />

                            <FormInputMask
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
                                    marginBottom: 1,
                                }}
                                placeholder='CPF'
                                name='document_cpf'
                                fullWidth
                                mask='999.999.999-99'
                                control={control}
                                errors={errors}
                            />

                            <FormInputMask
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
                                }}
                                placeholder='Telefone'
                                name='cel_phone'
                                fullWidth
                                mask='(99) 9 9999 - 9999'
                                control={control}
                                errors={errors}
                            />

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
                                    mb: 0,
                                }}
                                placeholder='E-mail'
                                margin='normal'
                                fullWidth
                                id='email'
                                {...register("email")}
                                error={errors.email ? true : false}
                                helperText={errors.email?.message}
                                autoComplete='email'
                            />

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
                                fullWidth
                                placeholder='Senha'
                                type='password'
                                id='password'
                                autoComplete='new-password'
                                {...register("password")}
                                error={errors.password ? true : false}
                                helperText={errors.password?.message}
                            />

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
                                fullWidth
                                placeholder='Confirme a Senha'
                                type='password'
                                id='password_confirm'
                                {...register("password_confirm")}
                                error={errors.password_confirm ? true : false}
                                helperText={errors.password_confirm?.message}
                            />

                            <LoadingButton
                                type='submit'
                                fullWidth
                                color='success'
                                variant='contained'
                                size='large'
                                loading={loading}
                                sx={{
                                    "&:hover": {
                                        backgroundColor: "#00796d",
                                    },
                                    background: "#00A494",
                                    boxShadow: "none",
                                    borderRadius: "10px",
                                    mt: 3,
                                    mb: 3,
                                }}>
                                Finalizar cadastro
                            </LoadingButton>
                        </Box>

                        <Footer />
                    </Box>
                </Grid>
            </Grid>
        </>
    );
}
