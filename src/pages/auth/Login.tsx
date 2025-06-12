import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import { Typography, useMediaQuery, useTheme } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import FormInputMask from "@/components/FormComponents/FormInputMask";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobal } from "@/contexts/GlobalContext";
import { INFO_USER } from "@/constants/local-storage";
import { isValidCPF } from "@/functions/number";
import { TextLogin } from "./TextLogin";
import singLogo from "@/assets/images/sing-logo-colorida.png";
import bg_chat_blue from "@/assets/images/bg_chat-blue.png";
import logo_mind_colorido from "@/assets/images/logo-mind-colorido-horizontal.png";
import icon_sicoob from "@/assets/images/sicoob-icon.png";
import "./TriangleLogin.scss";

type LoginProps = {
    login: string;
    password: string;
};

export function Login() {
    const navigate = useNavigate();

    const { signIn, user } = useAuth();
    const { getInfoError } = useGlobal();

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});

    const theme = useTheme();
    const mdDown = useMediaQuery(theme.breakpoints.down("md"));

    const currentYear = new Date().getFullYear();

    const validationSchema = Yup.object().shape({
        login: Yup.string()
            .test("isValidCPF", "Cpf inválido", (val) => isValidCPF(val ?? ""))
            .transform((value) => value.replace(/[\-\.]/g, ""))
            .required("Obrigatório"),
        password: Yup.string()
            .required("Senha é obrigatória")
            .min(6, "A senha deve ter pelo menos 6 caracteres")
            .max(20, "A senha não deve exceder 20 caracteres"),
    });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<LoginProps>({
        resolver: yupResolver(validationSchema),
    });

    const onSubmit = async (data: LoginProps) => {
        try {
            setLoading(true);

            const response = await signIn(data.login, data.password);

            if (typeof response === "boolean") {
                return;
            }

            setData({ name: response.user.name, email: response.user.email });
        } catch (error) {
            const info = await getInfoError(error);
            toast.error(info.message);
        } finally {
            setLoading(false);
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

    useEffect(() => {
        const isConnected = sessionStorage.getItem(window.btoa(INFO_USER));
        if (isConnected) {
            navigate("/bem-vindo");
        }
    }, [user]);

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
                                alignItems: "center",
                                flexDirection: "column",
                                alignContent: "center",
                                marginBottom: 2,
                            }}>
                            <img style={{ width: "250px" }} src={singLogo} alt='' />

                            {/* <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    alignContent: "center",
                                }}>
                                <Typography sx={{ color: "#707070", mt: 2 }}>
                                    Ainda não tem login?{" "}
                                    <Link style={{ color: "#00A494" }} to='/cadastrar'>
                                        Inscreva-se aqui
                                    </Link>
                                </Typography>
                            </Box> */}
                        </Box>

                        <Box component='form' onSubmit={handleSubmit(onSubmit)} mt={1}>
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
                                placeholder='CPF'
                                name='login'
                                fullWidth
                                autoComplete='username'
                                mask='999.999.999-99'
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
                                }}
                                placeholder='Senha'
                                margin='normal'
                                fullWidth
                                type='password'
                                id='password'
                                {...register("password")}
                                error={errors.password ? true : false}
                                helperText={errors.password?.message}
                                autoComplete='current-password'
                            />

                            <Grid container justifyContent={"end"} sx={{ mt: 2 }}>
                                <Link style={{ color: "#00A494" }} to='/auth/recuperar-senha'>
                                    Esqueceu a senha ou precisa de ajuda?
                                </Link>
                            </Grid>

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
                                    borderRadius: "10px",
                                    boxShadow: "none",
                                    mt: 3,
                                    mb: 3,
                                }}>
                                Entrar
                            </LoadingButton>
                        </Box>

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
                </Grid>
            </Grid>
        </>
    );
}
